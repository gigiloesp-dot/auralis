import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {AUR203_SPECIES,AUR203_SPECIES_ART,createAur203MonsterTypes,buildReadyAur203Camps} from '../js/monsters/aur203Species.js';
import {AUR203_EXPANSION_SPECIES_ROWS} from '../js/monsters/aur203ExpansionSpecies.js';
import {MONSTER_TYPES,monsterKind} from '../js/monsters/monsters.js';
import {MONSTER_MATERIALS,MONSTER_MATERIAL_BY_LOOT} from '../js/equipment/monsterMaterials.js';
import {ITEM_DEFS} from '../js/equipment/items.js';
import {INTEGRATED_SPECIES_ART} from '../js/assets/speciesArtRegistry.js';
import {movementProfile,tickMonsterAbility,applyHeroAffliction,heroMovementMultiplier} from '../js/monsters/movementProfiles.js';
import {isMonsterStunned,cancelMonsterStun} from '../js/combat/monsterStun.js';
import {AUR203_PLACEMENTS} from '../js/world/aur203Placements.js';
import {getRegionContent} from '../js/world/regionContent.js';
import {DUNGEONS} from '../js/dungeons/dungeonData.js';
import {worldWalkable,describeChunk,CHUNK_SIZE} from '../js/world/chunkGeometry.js';
const rows=Object.values(AUR203_SPECIES),sha=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const expansionIds=new Set(AUR203_EXPANSION_SPECIES_ROWS.map(row=>row.id));
const registries={registeredTypes:MONSTER_TYPES,registeredArt:INTEGRATED_SPECIES_ART,materials:ITEM_DEFS,materialByLoot:MONSTER_MATERIAL_BY_LOOT};
const regionCounts={forest:97,north:94,ancient:62,desert:88};

test('final additive composition preserves every first20 row/art and prior36 material mappings exactly',()=>{
 const first20=Object.fromEntries(Object.entries(AUR203_SPECIES).filter(([id])=>!expansionIds.has(id)));
 assert.equal(Object.keys(first20).length,20);
 assert.equal(sha(first20),'352f63da4335ee46073993478555ebfbe366d3318ca9092983855896511056d1');
 assert.equal(sha(Object.fromEntries(Object.entries(MONSTER_MATERIALS).slice(0,36))),'07b19e8dac17e8a66277a150f61e5aa7a4c6d240edcfa9dd9f30abf9c06e9ea1');
 assert.equal(sha(Object.fromEntries(Object.entries(MONSTER_MATERIAL_BY_LOOT).slice(0,36))),'4e6f15d2cfec6ef354d7d967cf2e1409d4217913e1c6adab9a0463b76d040e7e');
});

test('all84 real kinds/art and distinct material mappings register without changing base archetypes',()=>{
 assert.equal(rows.length,84);assert.equal(new Set(rows.map(r=>r.type)).size,84);assert.equal(Object.keys(AUR203_SPECIES_ART).length,84);
 const bases=Object.fromEntries(Object.entries(MONSTER_TYPES).filter(([,kind])=>!kind.aur203Revision)),before=structuredClone(bases);
 const generated=createAur203MonsterTypes(bases);assert.deepEqual(bases,before);assert.equal(Object.keys(generated).length,84);
 const materials=new Set();for(const row of rows){
  assert.deepEqual(MONSTER_TYPES[row.type],generated[row.type]);assert.deepEqual(INTEGRATED_SPECIES_ART[row.id],row.art);
  assert.equal(MONSTER_MATERIAL_BY_LOOT[row.loot],row.materialId);assert.equal(ITEM_DEFS[row.materialId],MONSTER_MATERIALS[row.materialId]);
  const material=ITEM_DEFS[row.materialId];assert.equal(material.slot,null);assert.equal(material.monsterMaterial,true);assert.equal(material.saleValue,0);assert.ok(existsSync(material.iconURL));materials.add(row.materialId);
  assert.ok(existsSync(row.art.url)&&existsSync(row.art.atlasURL));assert.equal(Object.keys(JSON.parse(readFileSync(row.art.atlasURL)).frames).length,48);
 }assert.equal(materials.size,84);
});

test('actual registered monsterKind progresses every84 kind through levels1–56 with finite values',()=>{
 let cases=0;for(const row of rows){let hp=0,xp=0;for(let level=1;level<=56;level++){
  const kind=monsterKind({type:row.type,speciesId:row.id,level});assert.equal(kind.name,row.names.ru);assert.equal(kind.level,level);assert.equal(kind.loot,row.loot);assert.equal(kind.boss,false);assert.equal(kind.respawnMs,30000);
  for(const field of ['hp','attack','speed','xp','gold'])assert.ok(Number.isFinite(kind[field])&&kind[field]>0,row.id+'/'+level+'/'+field);
  for(const field of ['defense','magicDefense'])assert.ok(Number.isFinite(kind[field])&&kind[field]>=0);
  assert.ok(kind.hp>hp);assert.ok(kind.xp>=xp);hp=kind.hp;xp=kind.xp;cases++;
 }}assert.equal(cases,4704);
});

test('all168 configured abilities execute real effects only after their warned release',()=>{
 let releases=0;for(const row of rows){const kind=MONSTER_TYPES[row.type],profile=movementProfile(kind);assert.equal(profile.abilityPattern.length,2);assert.notEqual(...profile.abilityPattern);
  for(const [index,ability]of profile.abilityPattern.entries()){
   const near=['stomp','cleave'].includes(ability),hero={x:near?Math.min(profile.radius*.55,profile.range-5):110,y:0,hp:100000};
   const monster={kind,x:0,y:0,homeX:0,homeY:0,hp:kind.hp,maxHp:kind.hp,attack:kind.attack,alive:true,abilityStep:index,lastAbilityAt:-100000},events=[];
   const context={monster,hero,now:20000,dt:.016,engaged:true,safe:false,canSee:()=>true,canOccupy:()=>true,move:(x,y)=>{monster.x=x;monster.y=y;events.push('move');},damage:()=>events.push('damage'),shoot:()=>events.push('projectile'),effect:()=>{},warn:()=>({destroy(){events.push('warning-release');}})};
   assert.equal(tickMonsterAbility(context).ability,ability);assert.deepEqual(events,[]);assert.equal(tickMonsterAbility({...context,now:20000+profile.windup-1}).busy,true);assert.deepEqual(events,[]);
   assert.equal(tickMonsterAbility({...context,now:20000+profile.windup}).fired,ability);assert.ok(events.some(e=>['move','damage','projectile'].includes(e)));assert.ok(events.includes('warning-release'));releases++;
  }
 }assert.equal(releases,168);
});

test('exactly three expansion stomps deliver actual bounded stun after1100ms or longer warnings',()=>{
 const expected={'north-species-084':[700,1100],'ancient-species-052':[600,1100],'desert-species-078':[800,1200]};
 assert.deepEqual(rows.filter(r=>r.abilityConfig.stunOnStomp).map(r=>r.id).sort(),Object.keys(expected).sort());
 for(const [id,[duration,windup]]of Object.entries(expected)){
  const row=AUR203_SPECIES[id],kind=MONSTER_TYPES[row.type],p=movementProfile(kind),hero={x:20,y:0,hp:1000};
  assert.equal(p.stunOnStomp,duration);assert.ok(p.windup>=windup);
  const monster={kind,x:0,y:0,hp:kind.hp,maxHp:kind.hp,attack:kind.attack,alive:true,abilityStep:p.abilityPattern.indexOf('stomp'),lastAbilityAt:-100000};
  let clock=10000;const context={monster,hero,now:clock,engaged:true,safe:false,canSee:()=>true,damage:(_,__,status)=>applyHeroAffliction(hero,status,clock),warn:()=>({destroy(){}})};
  assert.equal(tickMonsterAbility(context).ability,'stomp');assert.equal(isMonsterStunned(hero,clock),false);clock+=p.windup;
  assert.equal(tickMonsterAbility({...context,now:clock}).fired,'stomp');assert.equal(isMonsterStunned(hero,clock),true);assert.equal(heroMovementMultiplier(hero,clock),0);
  assert.equal(isMonsterStunned(hero,clock+duration-1),true);assert.equal(isMonsterStunned(hero,clock+duration),false);assert.equal(heroMovementMultiplier(hero,clock+duration),1);cancelMonsterStun(hero);
 }
});

test('actual final world contains341 camps/3751 residents and84 camps use the current exact clear geography',()=>{
 let totalCamps=0,totalResidents=0,newCamps=0,newResidents=0;const chunks=new Map();
 for(const [region,count]of Object.entries(regionCounts)){
  const current=getRegionContent(region),content={...current,dungeons:DUNGEONS.filter(d=>d.region===region)};assert.equal(current.camps.length,count);totalCamps+=count;totalResidents+=current.camps.reduce((n,c)=>n+c.spawns.length,0);
  for(const camp of buildReadyAur203Camps(region,registries)){
   const row=AUR203_SPECIES[camp.speciesId],reserved=AUR203_PLACEMENTS[region].camps.find(c=>c.id===camp.id);assert.equal(camp.level,row.nativeLevel);assert.equal(camp.biome,row.biome);assert.equal(camp.x,reserved.x);assert.equal(camp.y,reserved.y);assert.equal(camp.spawns.length,11);newCamps++;
   for(const [index,spawn]of camp.spawns.entries()){
    assert.equal(spawn.x,reserved.spawns[index].x);assert.equal(spawn.y,reserved.spawns[index].y);assert.equal(spawn.type,row.type);assert.equal(spawn.speciesId,row.id);
    const radius=movementProfile(MONSTER_TYPES[row.type]).collisionRadius;assert.ok(radius<=24);assert.ok(worldWalkable(content,spawn.x,spawn.y,radius),spawn.id+' terrain');
    const cx=Math.floor(spawn.x/CHUNK_SIZE),cy=Math.floor(spawn.y/CHUNK_SIZE),key=region+':'+cx+','+cy;if(!chunks.has(key))chunks.set(key,describeChunk(content,cx,cy));
    for(const obstacle of chunks.get(key).obstacles)assert.ok(Math.hypot(spawn.x-obstacle.x,spawn.y-obstacle.y)>=radius+obstacle.r,spawn.id+' collider');newResidents++;
   }
  }
 }assert.equal(totalCamps,341);assert.equal(totalResidents,3751);assert.equal(newCamps,84);assert.equal(newResidents,924);
});
