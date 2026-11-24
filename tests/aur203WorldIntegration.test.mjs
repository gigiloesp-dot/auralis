import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {getRegionContent,getTask10RegionContent} from '../js/world/regionContent.js';
import {monsterKind} from '../js/monsters/monsters.js';
import {movementProfile} from '../js/monsters/movementProfiles.js';
import {monsterArt} from '../js/assets/monsterArt.js';
import {uniqueSpeciesEntries} from '../js/assets/speciesAssets.js';
import {integratedSpeciesArt} from '../js/assets/speciesArtRegistry.js';
import {itemDefinition} from '../js/equipment/items.js';
import {rollMonsterLoot} from '../js/monsters/loot.js';
import {monsterIntent,leashRadius} from '../js/monsters/monsterBehavior.js';
import {WORLD_REGIONS,FIRST20_SPECIES,assertActiveExpansion,originalTask10Camps} from './worldExpansionScope.mjs';
const banks=['idle','run-a','run-b','attack','hurt','death'],dirs=['n','ne','e','se','s','sw','w','nw'];
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');

test('first20 acceptance activates exactly277 camps and3047 residents, retaining the original257 as an exact prefix',()=>{
 let campCount=0,residentCount=0,addedCount=0;const camps=new Set(),residents=new Set(),species=new Set();
 for(const region of WORLD_REGIONS){
  const live=getRegionContent(region),base=getTask10RegionContent(region),original=originalTask10Camps(live),added=assertActiveExpansion(live);
  assert.deepEqual(original,base.camps,region+'/every original runtime camp field');addedCount+=added.length;
  for(const camp of live.camps){campCount++;assert.ok(!camps.has(camp.id));camps.add(camp.id);assert.ok(!species.has(camp.speciesId));species.add(camp.speciesId);assert.equal(camp.spawns.length,11);
   for(const spawn of camp.spawns){residentCount++;assert.ok(!residents.has(spawn.id));residents.add(spawn.id);assert.equal(monsterKind(spawn).respawnMs,30000);}
  }
 }
 assert.equal(campCount,277);assert.equal(residentCount,3047);assert.equal(addedCount,20);assert.equal(species.size,277);assert.equal(uniqueSpeciesEntries().length,257,'Immutable Task10 art scope remains257');
});

test('scope guards reject missing or reordered originals, duplicate IDs, unaccepted species and malformed new residents',()=>{
 const live=getRegionContent('forest'),copy=camps=>({...live,camps});
 assert.throws(()=>assertActiveExpansion(copy(live.camps.slice(1))));
 const reordered=[...live.camps];[reordered[0],reordered[1]]=[reordered[1],reordered[0]];assert.throws(()=>assertActiveExpansion(copy(reordered)));
 const duplicate=[...live.camps];duplicate[duplicate.length-1]={...duplicate.at(-1),id:duplicate[0].id};assert.throws(()=>assertActiveExpansion(copy(duplicate)));
 const future={...live.camps.at(-1),id:'forest-spot-096',speciesId:'forest-species-096'};assert.throws(()=>assertActiveExpansion(copy([...live.camps,future])));
 const malformed=[...live.camps],last=malformed.at(-1);malformed[malformed.length-1]={...last,spawns:last.spawns.map((spawn,index)=>index===0?{...spawn,id:'unexpected-persistent-id'}:spawn)};assert.throws(()=>assertActiveExpansion(copy(malformed)));
});

test('all277 actual outdoor renderers have distinct model, texture and atlas identities with48 complete directional frames',()=>{
 const identities={key:new Set(),url:new Set(),atlasURL:new Set(),pixels:new Set()},accepted=new Set(Object.values(FIRST20_SPECIES).flat());let total=0,newModels=0;
 for(const region of WORLD_REGIONS)for(const camp of getRegionContent(region).camps){
  const spawn=camp.spawns[0],kind=monsterKind(spawn),entry=monsterArt(spawn.type,kind,spawn);assert.ok(entry,camp.id+'/actual renderer');assert.equal(entry,integratedSpeciesArt(camp.speciesId));
  for(const field of ['key','url','atlasURL']){assert.equal(identities[field].has(entry[field]),false,camp.id+'/'+field+' duplicated');identities[field].add(entry[field]);}
  const png=readFileSync(entry.url),digest=hash(png);assert.equal(identities.pixels.has(digest),false,camp.id+'/duplicate source image');identities.pixels.add(digest);
  const fw=entry.frameWidth||192,fh=entry.frameHeight||256,width=png.readUInt32BE(16),height=png.readUInt32BE(20),atlas=JSON.parse(readFileSync(entry.atlasURL));
  assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert.equal(png[25],6,'Original source is true RGBA');assert.equal(width,fw*8);assert.equal(height,fh*6);
  assert.deepEqual(Object.keys(atlas.frames).sort(),banks.flatMap(bank=>dirs.map(dir=>bank+'/'+dir)).sort());assert.deepEqual(entry.poseBanks,banks);assert.equal(entry.drawnDeath,true);
  const cells=new Set();for(const[name,frame]of Object.entries(atlas.frames)){const f=frame.frame;assert.equal(f.w,fw);assert.equal(f.h,fh);assert.ok(f.x>=0&&f.y>=0&&f.x+fw<=width&&f.y+fh<=height);assert.equal(f.x%fw,0);assert.equal(f.y%fh,0);cells.add(f.x+','+f.y);assert.equal(frame.rotated??false,false);assert.equal(frame.trimmed??false,false);if(accepted.has(camp.speciesId))assert.ok(Number.isFinite(entry.footlines[name])&&entry.footlines[name]>0&&entry.footlines[name]<fh,name+'/measured footline');}assert.equal(cells.size,48);
  total++;if(accepted.has(camp.speciesId))newModels++;
 }
 assert.equal(total,277);assert.equal(newModels,20);for(const set of Object.values(identities))assert.equal(set.size,277);
});

test('all twenty active species expose real localized names, distinct opt-in tactics, abilities and registered thematic inventory drops',()=>{
 const accepted=new Set(Object.values(FIRST20_SPECIES).flat()),materialIds=new Set(),tactics=new Set();let count=0;
 for(const region of WORLD_REGIONS)for(const camp of getRegionContent(region).camps){if(!accepted.has(camp.speciesId))continue;count++;
  assert.equal(camp.temporaryBestiary,false,camp.id+'/honest completed-art metadata');assert.equal(camp.aur203Revision,1);
  const kind=monsterKind(camp.spawns[0]),profile=movementProfile(kind);assert.equal(kind.speciesId,camp.speciesId);assert.equal(kind.boss,false);assert.ok(kind.hp>0&&kind.attack>0&&kind.speed>0&&kind.defense>=0);assert.ok(kind.level>=getRegionContent(region).minLevel&&kind.level<=getRegionContent(region).maxLevel);
  for(const language of ['ru','en','es'])assert.ok(kind.names[language]?.length>2);assert.ok(profile.abilityPattern?.length>=2);assert.ok(profile.abilityPattern.every(ability=>['pounce','charge','dive','burrow','stomp','roots','frost','cleave','blink','fan','venom','haunt','shot','web'].includes(ability)));
  assert.ok(kind.behaviorConfig&&Object.keys(kind.behaviorConfig).length>0,'Tactics must be explicitly configured');tactics.add(JSON.stringify(kind.behaviorConfig));
  const drops=rollMonsterLoot({classId:'warrior',level:56,stats:{luck:5}},kind,()=>0).filter(item=>itemDefinition(item)?.monsterMaterial);assert.equal(drops.length,1,camp.id+'/actual successful material roll');
  const definition=itemDefinition(drops[0]);materialIds.add(drops[0].id);assert.equal(definition.slot,null);assert.equal(definition.saleValue,0);for(const language of ['ru','en','es'])assert.ok(definition.names[language]);assert.match(definition.iconURL,/^assets\/icons\/monster-materials\/aur203-[a-z0-9-]+\.png$/);assert.ok(readFileSync(definition.iconURL).length>0);
 }
 assert.equal(count,20);assert.equal(materialIds.size,20);assert.ok(tactics.size>=4,'New species must not share one identical behavior configuration');
});

test('all220 new resident homes remain outside receiver detection and pursuit margins and cannot auto-aggro a fresh arrival',()=>{
 const accepted=new Set(Object.values(FIRST20_SPECIES).flat());let residents=0,checks=0;
 // Existing respawn placement reserves this additional player clearance.
 // It is more conservative than the hero body radius, not a new AI range.
 const arrivalClearance=44;
 for(const region of WORLD_REGIONS){const content=getRegionContent(region);
  for(const camp of content.camps){if(!accepted.has(camp.speciesId))continue;
   for(const receiver of content.receivers)assert.ok(Math.hypot(camp.x-receiver.x,camp.y-receiver.y)>=650,camp.id+'/'+receiver.id+' explicit new placement margin');
   for(const spawn of camp.spawns){residents++;const kind=monsterKind(spawn),profile=movementProfile(kind);
    for(const receiver of content.receivers){
     const distance=Math.hypot(spawn.x-receiver.x,spawn.y-receiver.y),monster={id:spawn.id,kind,x:spawn.x,y:spawn.y,homeX:spawn.x,homeY:spawn.y,campX:camp.x,campY:camp.y,campRadius:camp.radius,alive:true,hp:kind.hp,aggroUntil:0,behaviorState:'idle',nextPatrolAt:Infinity};
     assert.ok(distance>Math.max(190,profile.range)+profile.collisionRadius+arrivalClearance,spawn.id+'/'+receiver.id+' actual detection plus body/player clearance');
     assert.ok(distance>leashRadius(monster)+profile.collisionRadius+arrivalClearance,spawn.id+'/'+receiver.id+' actual home leash plus player clearance');
     const hero={x:receiver.x,y:receiver.y,hp:1000},intent=monsterIntent(monster,hero,10000,{visible:true,safe:false,detection:Math.max(190,profile.range),canOccupy:()=>true});
     assert.equal(intent.engaged,false,spawn.id+'/'+receiver.id+' no automatic arrival aggro even with clear sight');assert.equal(monster.aggroUntil,0);assert.notEqual(monster.behaviorState,'chase');checks++;
    }
   }
  }
 }
 assert.equal(residents,220);assert.equal(checks,660);
});
