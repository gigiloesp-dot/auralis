import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {AUR203_SPECIES,AUR203_READY_SPECIES_IDS,AUR203_SPECIES_ART,createAur203MonsterTypes,buildReadyAur203Camps as buildAllReadyAur203Camps} from '../js/monsters/aur203Species.js';
import {MONSTER_MATERIALS as AUR203_MATERIALS,MONSTER_MATERIAL_BY_LOOT as AUR203_MATERIAL_BY_LOOT} from '../js/equipment/monsterMaterials.js';
import {FIRST20_SPECIES} from './worldExpansionScope.mjs';
import {AUR203_PLACEMENTS} from '../js/world/aur203Placements.js';
import {MONSTER_TYPES,monsterKind} from '../js/monsters/monsters.js';
import {MOVEMENT_PROFILES,movementProfile,tickMonsterAbility,blockingObstacles} from '../js/monsters/movementProfiles.js';
import {getRegionContent} from '../js/world/regionContent.js';
import {DUNGEONS} from '../js/dungeons/dungeonData.js';
import {worldWalkable,describeChunk,CHUNK_SIZE} from '../js/world/chunkGeometry.js';
const first20Ids=Object.values(FIRST20_SPECIES).flat(),definitions=first20Ids.map(id=>AUR203_SPECIES[id]),newTypeIds=new Set(Object.values(AUR203_SPECIES).map(row=>row.type));
const buildReadyAur203Camps=(region,options)=>buildAllReadyAur203Camps(region,options?{speciesIds:first20Ids,...options}:options);
const baseTypes=Object.fromEntries(Object.entries(MONSTER_TYPES).filter(([id])=>!newTypeIds.has(id)));
const types=createAur203MonsterTypes(baseTypes),registries={registeredTypes:types,registeredArt:AUR203_SPECIES_ART,materials:AUR203_MATERIALS,materialByLoot:AUR203_MATERIAL_BY_LOOT};
const expected={forest:8,north:4,ancient:4,desert:4},sha=bytes=>createHash('sha256').update(bytes).digest('hex');

// Prior to installation, inject ONLY the proposed registry composition into an
// isolated in-memory copy. The actual monsterKind function body is unchanged.
// Once the parent installs all20 kinds, use the real registered engine directly.
async function engine(){
 const count=[...newTypeIds].filter(id=>Object.hasOwn(MONSTER_TYPES,id)).length;
 assert.ok(count===0||count===84,'A type registry must never be partially assembled');
 if(count===84)return {monsterKind};
 let source=readFileSync(new URL('../js/monsters/monsters.js',import.meta.url),'utf8');
 for(const [path,target]of Object.entries({'./speciesRuntime.js':'../js/monsters/speciesRuntime.js','../config/gameConfig.js':'../js/config/gameConfig.js'}))source=source.replaceAll("'"+path+"'",JSON.stringify(new URL(target,import.meta.url).href));
 const original='export const MONSTER_TYPES=Object.freeze({',marker='export const MONSTER_CAMPS=Object.freeze([';
 assert.equal(source.split(original).length,2);assert.equal(source.split(marker).length,2);
 source="import {createAur203MonsterTypes} from '"+new URL('../js/monsters/aur203Species.js',import.meta.url).href+"';\n"+source.replace(original,'const BASE_MONSTER_TYPES=Object.freeze({').replace(marker,'export const MONSTER_TYPES=Object.freeze({...BASE_MONSTER_TYPES,...createAur203MonsterTypes(BASE_MONSTER_TYPES)});\n'+marker);
 const isolated=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 assert.equal(isolated.monsterKind.toString(),monsterKind.toString(),'No combat or progression formula is replaced by this fixture');return isolated;
}

test('the first20 completed species have distinct identities, original48-pose art and exact provenance names',()=>{
 assert.equal(definitions.length,20);assert.equal(new Set(definitions.map(row=>row.type)).size,20);assert.equal(newTypeIds.size,84);assert.equal(AUR203_READY_SPECIES_IDS.length,84);
 const images=new Set(),atlases=new Set(),keys=new Set(),english=new Set(),tactics=new Set();
 for(const row of definitions){
  assert.equal(row.loot,row.type);assert.equal(baseTypes[row.type],undefined);assert.ok(baseTypes[row.baseType]&&!baseTypes[row.baseType].boss);
  for(const language of ['ru','en','es'])assert.ok(row.names[language]?.length>2);
  assert.ok(!english.has(row.names.en));english.add(row.names.en);
  const pack=row.art.url.split('/')[2],provenance=JSON.parse(readFileSync('art/source/'+pack+'/provenance.json'));
  const source=(provenance.models||provenance.species).find(model=>model.id===row.id);assert.deepEqual(row.names,source.names);
  assert.equal(row.nativeLevel,source.level);assert.equal(row.biome,source.biome);
  assert.ok(existsSync(row.art.url)&&existsSync(row.art.atlasURL));assert.equal(row.art.frameWidth,128);assert.equal(row.art.frameHeight,192);assert.equal(row.art.drawnDeath,true);
  const atlas=JSON.parse(readFileSync(row.art.atlasURL));assert.equal(Object.keys(atlas.frames).length,48);assert.equal(row.art.poseBanks.length,6);
  for(const bank of ['idle','run-a','run-b','attack','hurt','death'])for(const direction of ['n','ne','e','se','s','sw','w','nw'])assert.ok(atlas.frames[bank+'/'+direction]);
  images.add(sha(readFileSync(row.art.url)));atlases.add(row.art.atlasURL);keys.add(row.art.key);
  const profile=movementProfile(types[row.type]);assert.ok(Object.hasOwn(MOVEMENT_PROFILES,row.movementProfile));assert.ok(profile.collisionRadius>0&&profile.collisionRadius<=24);
  assert.equal(profile.abilityPattern.length,2);assert.notEqual(...profile.abilityPattern);
  tactics.add(JSON.stringify([profile,types[row.type].behaviorConfig,types[row.type].speed]));
 }
 assert.equal(images.size,20);assert.equal(atlases.size,20);assert.equal(keys.size,20);assert.equal(tactics.size,20,'New neighbors do not share an identical complete tactic configuration');
});

test('factory preserves every original type and creates only explicit ordinary kinds with bounded proposed stats',()=>{
 const before=structuredClone(baseTypes),result=createAur203MonsterTypes(baseTypes);assert.deepEqual(baseTypes,before);assert.equal(Object.keys(result).length,84);
 for(const row of definitions){const kind=result[row.type],base=baseTypes[row.baseType];assert.equal(kind.speciesId,row.id);assert.equal(kind.names.ru,row.names.ru);assert.equal(kind.boss,false);assert.equal(kind.respawnMs,30000);assert.equal(kind.level,base.level);assert.equal(kind.xp,base.xp);assert.equal(kind.gold,base.gold);assert.equal(kind.loot,row.loot);assert.equal(kind.movementProfile,row.movementProfile);assert.deepEqual(kind.behaviorConfig,row.behaviorConfig);for(const field of ['hp','attack','speed'])assert.ok(Number.isFinite(kind[field])&&kind[field]>0);for(const field of ['defense','magicDefense'])assert.ok(Number.isFinite(kind[field])&&kind[field]>=0);assert.ok(kind.speed>=26&&kind.speed<=145);assert.ok(Object.isFrozen(kind)&&Object.isFrozen(kind.behaviorConfig));}
 assert.throws(()=>createAur203MonsterTypes(),/Base monster/);assert.throws(()=>createAur203MonsterTypes({...baseTypes,bear:undefined}),/Missing ordinary base/);assert.throws(()=>createAur203MonsterTypes({...baseTypes,[definitions[0].type]:{}}),/already registered/);
 const mutable=structuredClone(baseTypes);mutable.bear.extra={unchanged:true};const copied=createAur203MonsterTypes(mutable);assert.equal(Object.isFrozen(mutable.bear.extra),false);assert.notEqual(copied[definitions[0].type].extra,mutable.bear.extra);assert.equal(mutable.bear.extra.unchanged,true);
});

test('unchanged real monsterKind calculations keep all20 new kinds finite and progressing through levels1–56',async()=>{
 const actual=await engine();let cases=0;
 for(const row of definitions){let hp=0,xp=0;for(let level=1;level<=56;level++){const kind=actual.monsterKind({type:row.type,level,speciesId:row.id});assert.equal(kind.level,level);assert.equal(kind.speciesId,row.id);assert.equal(kind.name,row.names.ru);assert.equal(kind.boss,false);assert.equal(kind.respawnMs,30000);assert.equal(kind.loot,row.loot);assert.deepEqual(kind.behaviorConfig,row.behaviorConfig);for(const field of ['hp','attack','xp','gold','speed'])assert.ok(Number.isFinite(kind[field])&&kind[field]>0,row.id+'/'+field+'/'+level);for(const field of ['defense','magicDefense'])assert.ok(Number.isFinite(kind[field])&&kind[field]>=0);assert.ok(kind.hp>hp,'HP must continue through42→43 and55→56');assert.ok(kind.xp>=xp);hp=kind.hp;xp=kind.xp;cases++;}assert.equal(actual.monsterKind({type:row.type,level:100,speciesId:row.id}).level,56);}
 assert.equal(cases,1120);
});

test('all40 configured abilities use the actual timed dispatcher and produce damage, movement or projectiles after a visible windup',()=>{
 let releases=0;
 for(const row of definitions)for(let index=0;index<2;index++){
  const kind=types[row.type],profile=movementProfile(kind),ability=profile.abilityPattern[index],near=ability==='stomp'||ability==='cleave';
  const hero={x:near?Math.min(profile.radius*.55,profile.range-5):Math.min(110,profile.range-5),y:0,hp:100000};
  const monster={kind,x:0,y:0,homeX:0,homeY:0,hp:kind.hp,maxHp:kind.hp,attack:kind.attack,alive:true,abilityStep:index,lastAbilityAt:-100000},events=[];
  const context={monster,hero,now:20000,dt:.016,engaged:true,safe:false,canSee:()=>true,canOccupy:()=>true,move:(x,y)=>{monster.x=x;monster.y=y;events.push('move');},damage:amount=>{assert.ok(amount>0);events.push('damage');},shoot:shot=>{assert.ok(shot.damage>0&&shot.range>0);events.push('projectile');},effect:()=>events.push('effect'),warn:()=>({destroy(){events.push('warning-release');}})};
  const warning=tickMonsterAbility(context);assert.equal(warning.busy,true,row.id+'/'+ability);assert.equal(warning.ability,ability);assert.deepEqual(events,[],'Warning must not cause immediate damage');
  assert.equal(tickMonsterAbility({...context,now:20000+profile.windup-1}).busy,true);assert.deepEqual(events,[]);
  const released=tickMonsterAbility({...context,now:20000+profile.windup});assert.equal(released.fired,ability);assert.ok(events.includes('damage')||events.includes('move')||events.includes('projectile'));assert.ok(events.includes('warning-release'));releases++;
 }
 assert.equal(releases,40);
});

test('flight, ground and optional tactics match anatomical roles without inventing unimplemented abilities',()=>{
 const flight=['forest-species-086','north-species-079','ancient-species-047','desert-species-059'];
 for(const row of definitions){const profile=movementProfile(types[row.type]);assert.equal(profile.movement==='flight',flight.includes(row.id));if(flight.includes(row.id))assert.ok(profile.elevation>=28);}
 const low={kind:'rock',r:20},wall={kind:'house',r:40};assert.deepEqual(blockingObstacles([low,wall],types[AUR203_SPECIES[flight[0]].type]),[wall]);assert.deepEqual(blockingObstacles([low,wall],types[definitions[0].type]),[low,wall]);
 for(const key of ['guard','retreat','pack'])assert.ok(definitions.some(row=>row.behaviorConfig[key]));
 assert.equal(definitions.find(row=>row.type==='aur203LanternSnail').speed,30);assert.ok(definitions.find(row=>row.type==='aur203GlassJerboa').speed>100);assert.equal(movementProfile(types.aur203PitcherCactus).projectileStatus,'venom');
});

test('ready-camp assembly adds only20 exact reserved camps/220 residents and cannot mutate any of257 original camps',()=>{
 const before=structuredClone(AUR203_PLACEMENTS),allCamps=[],allResidents=[],oldWorld=Object.fromEntries(Object.keys(expected).map(region=>[region,structuredClone(getRegionContent(region))]));
 for(const [region,count]of Object.entries(expected)){
  const original=getRegionContent(region),camps=buildReadyAur203Camps(region,registries);assert.equal(camps.length,count);assert.ok(Object.isFrozen(camps));
  for(const camp of camps){const row=AUR203_SPECIES[camp.speciesId],reserved=AUR203_PLACEMENTS[region].camps.find(c=>c.id===camp.id);assert.ok(row);assert.equal(camp.type,row.type);assert.equal(camp.temporaryBestiary,false);assert.equal(camp.level,row.nativeLevel);assert.equal(camp.region,region);assert.equal(camp.radius,210);assert.equal(camp.spawns.length,11);assert.equal(camp.x,reserved.x);assert.equal(camp.y,reserved.y);
   for(const [index,spawn]of camp.spawns.entries()){const saved=reserved.spawns[index];assert.equal(spawn.id,saved.id);assert.equal(spawn.x,saved.x);assert.equal(spawn.y,saved.y);assert.equal(spawn.level,saved.level);assert.equal(spawn.speciesId,row.id);assert.equal(spawn.plannedSpeciesId,row.id);assert.equal(spawn.type,row.type);assert.equal(spawn.respawnMs,30000);assert.deepEqual(spawn.names,row.names);allResidents.push(spawn.id);}
   allCamps.push(camp.id);
  }
  assert.deepEqual(original,oldWorld[region]);
 }
 assert.equal(new Set(allCamps).size,20);assert.equal(new Set(allResidents).size,220);assert.deepEqual(AUR203_PLACEMENTS,before);
 assert.equal(buildReadyAur203Camps('forest',{...registries,speciesIds:['forest-species-083','forest-species-080']}).map(c=>c.speciesId).join(','),'forest-species-080,forest-species-083','Caller selection never reorders authored identities');
 assert.deepEqual(buildReadyAur203Camps('forest',{...registries,speciesIds:[]}),[]);
});

test('every selected resident occupies the actual terrain and clear collider footprint at its own calibrated radius',()=>{
 for(const region of Object.keys(expected)){
  const content={...getRegionContent(region),dungeons:DUNGEONS.filter(d=>d.region===region)},chunks=new Map();
  for(const camp of buildReadyAur203Camps(region,registries))for(const spawn of camp.spawns){const radius=movementProfile(types[spawn.type]).collisionRadius;assert.ok(worldWalkable(content,spawn.x,spawn.y,radius),spawn.id+' terrain');
   const cx=Math.floor(spawn.x/CHUNK_SIZE),cy=Math.floor(spawn.y/CHUNK_SIZE),key=cx+','+cy;if(!chunks.has(key))chunks.set(key,describeChunk(content,cx,cy));
   for(const obstacle of chunks.get(key).obstacles)assert.ok(Math.hypot(spawn.x-obstacle.x,spawn.y-obstacle.y)>=radius+obstacle.r,spawn.id+' obstacle');
  }
 }
});

test('activation fails closed for unknown species, missing mappings, incorrect art registration and unknown item IDs',()=>{
 assert.throws(()=>buildReadyAur203Camps('forest'),/registries/);assert.throws(()=>buildReadyAur203Camps('unknown',registries),/Unknown/);
 assert.throws(()=>buildReadyAur203Camps('forest',{...registries,speciesIds:['forest-species-097']}),/Unfinished/);assert.throws(()=>buildReadyAur203Camps('forest',{...registries,speciesIds:[definitions[0].id,definitions[0].id]}),/Unique/);
 const row=definitions[0],type={...types};delete type[row.type];assert.throws(()=>buildReadyAur203Camps('forest',{...registries,registeredTypes:type}),/type is not ready/);
 const badType={...types,[row.type]:{...types[row.type],abilityConfig:{abilityPattern:['shot']}}};assert.throws(()=>buildReadyAur203Camps('forest',{...registries,registeredTypes:badType}),/type is not ready/);
 const art={...AUR203_SPECIES_ART,[row.id]:{...row.art,scale:99}};assert.throws(()=>buildReadyAur203Camps('forest',{...registries,registeredArt:art}),/art is not ready/);
 assert.throws(()=>buildReadyAur203Camps('forest',{...registries,materials:{}}),/material is not ready/);assert.throws(()=>buildReadyAur203Camps('forest',{...registries,materialByLoot:{}}),/material is not ready/);
 const priced={...AUR203_MATERIALS,[row.materialId]:{...AUR203_MATERIALS[row.materialId],saleValue:10}};assert.throws(()=>buildReadyAur203Camps('forest',{...registries,materials:priced}),/material is not ready/);
});
