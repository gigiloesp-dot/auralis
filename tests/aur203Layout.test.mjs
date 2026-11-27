import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {AUR203_REGIONS,AUR203_PLACEMENT,buildAur203Region} from '../js/world/aur203Layout.js';
import {AUR203_PLACEMENTS} from '../js/world/aur203Placements.js';
import {getTask10RegionContent as getRegionContent,getRegionContent as getLiveRegionContent} from '../js/world/regionContent.js';
import {assertActiveExpansion} from './worldExpansionScope.mjs';
import {DUNGEONS} from '../js/dungeons/dungeonData.js';
import {MONSTER_LEASH_RADIUS} from '../js/monsters/monsterBehavior.js';
import {MOVEMENT_PROFILES} from '../js/monsters/movementProfiles.js';
import {climateAt} from '../js/world/climate.js';
import {regionRoads,distanceToSegment,worldWalkable,describeChunk,CHUNK_SIZE} from '../js/world/chunkGeometry.js';
import {lineClear} from '../js/combat/geometry.js';
import {regionGatheringNodes} from '../js/world/gatheringData.js';
const ids=Object.keys(AUR203_REGIONS),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),radius=AUR203_PLACEMENT.collisionRadius;
const reach=camp=>Math.max(...camp.spawns.map(s=>distance(s,camp)))+MONSTER_LEASH_RADIUS;
const authoredSnapshot=JSON.parse(readFileSync(new URL('../docs/qa/aur203/task10-baseline.json',import.meta.url)));

test('all84 frozen candidate positions survive independently from the exact first20 active species',()=>{
 assert.equal(createHash('sha256').update(readFileSync(new URL('../js/world/aur203Placements.js',import.meta.url))).digest('hex'),'ed60202e7ec64014796cef6cdbe7094eadf0eafae4ef00a8ef817c035a0069cb','repaired reserved art/placement identities cannot drift through regeneration');
 let camps=0,residents=0;const allIds=new Set();
 for(const [region,config]of Object.entries(AUR203_REGIONS)){
  const original=getRegionContent(region),added=AUR203_PLACEMENTS[region];assertActiveExpansion(getLiveRegionContent(region));
  assert.equal(original.camps.length,config.first,'offline reproduction retains the exact original Task10 input');
  assert.equal(added.camps.length,config.count);assert.equal(original.camps.length+added.camps.length,config.total);
  assert.equal(added.diagnostics.runtimeIntegrated,false);assert.equal(added.diagnostics.residents,config.count*11);
  for(const camp of original.camps){assert.ok(!allIds.has(camp.id));allIds.add(camp.id);for(const s of camp.spawns){assert.ok(!allIds.has(s.id));allIds.add(s.id);}}
  for(const [offset,camp]of added.camps.entries()){
   const index=config.first+offset,suffix=String(index).padStart(3,'0');
   assert.equal(camp.id,region+'-spot-'+suffix);assert.equal(camp.plannedSpeciesId,region+'-species-'+suffix);
   assert.ok(!allIds.has(camp.id));allIds.add(camp.id);camps++;
   assert.equal(camp.region,region);assert.equal(camp.layoutVersion,2);assert.equal(camp.placementRevision,1);
   assert.equal(camp.spawns.length,11);assert.equal(camp.radius,210);
   assert.ok(Number.isInteger(camp.level)&&camp.level>=original.minLevel&&camp.level<=original.maxLevel);
   assert.equal(camp.biome,climateAt(original,camp.x,camp.y).id);
   assert.equal(Object.hasOwn(camp,'type'),false,'unassigned species must not masquerade as integrated base-type duplicates');
   for(const [i,s]of camp.spawns.entries()){
    assert.equal(s.id,camp.id+'-mob-'+i);assert.equal(s.level,camp.level);assert.equal(s.plannedSpeciesId,camp.plannedSpeciesId);
    assert.ok(!allIds.has(s.id));allIds.add(s.id);residents++;
    assert.ok(distance(s,camp)<=AUR203_PLACEMENT.residentSpread+1); // rounded integer coordinates
   }
  }
 }
 assert.equal(camps,84);assert.equal(residents,924);assert.equal(camps+257,341);assert.equal(residents+2827,3751);
 assert.ok(Object.values(MOVEMENT_PROFILES).every(p=>p.collisionRadius<=radius),'future larger collision footprints require revalidation');
});

test('all924 staged residents avoid actual current roads, safe towns, NPCs, receivers, portals and17 dungeon entrances',()=>{
 assert.equal(DUNGEONS.length,17);
 for(const id of ids){
  const original=getRegionContent(id),geometry={...original,dungeons:DUNGEONS.filter(d=>d.region===id)},roads=regionRoads(geometry);
  for(const camp of AUR203_PLACEMENTS[id].camps){
   assert.ok(camp.x>=650&&camp.y>=650&&camp.x<=original.width-650&&camp.y<=original.height-650);
   assert.ok(original.towns.every(t=>distance(camp,t)>=(t.footprintRadius||335)+500));
   assert.ok(original.portals.every(t=>distance(camp,t)>=650));assert.ok(original.receivers.every(t=>distance(camp,t)>=650));
   assert.ok(geometry.dungeons.every(t=>distance(camp,t)>=650));assert.ok(original.bosses.every(t=>distance(camp,t)>=1050));
   for(const s of camp.spawns){
    assert.equal(worldWalkable(geometry,s.x,s.y,radius),true,s.id+' actual collision');
    assert.ok(roads.every(r=>distanceToSegment(s,r.from,r.to)>r.width/2+radius+12),s.id+' road');
    assert.ok(original.towns.every(t=>distance(s,t)>t.safeRadius+radius+25),s.id+' safe town');
    assert.ok(original.portals.every(t=>distance(s,t)>=140+radius),s.id+' portal');
    assert.ok(original.receivers.every(t=>distance(s,t)>=180+radius),s.id+' receiver');
    assert.ok(geometry.dungeons.every(t=>distance(s,t)>=160+radius),s.id+' entrance');
    assert.ok(original.npcs.every(t=>distance(s,t)>=100+radius),s.id+' NPC');
   }
   for(let a=0;a<camp.spawns.length;a++)for(let b=a+1;b<camp.spawns.length;b++)assert.ok(distance(camp.spawns[a],camp.spawns[b])>=radius*2+9,camp.id+' resident collision');
  }
 }
});

test('old and staged camps retain disjoint pursuit envelopes and1400 center spacing',()=>{
 for(const id of ids){const old=getRegionContent(id).camps,added=AUR203_PLACEMENTS[id].camps;
  for(const [i,camp]of added.entries())for(const other of [...old,...added.slice(0,i)]){
   assert.ok(distance(camp,other)>=1400,camp.id+'/'+other.id+' center');
   assert.ok(distance(camp,other)>reach(camp)+reach(other)+30,camp.id+'/'+other.id+' bounded pursuit');
  }
 }
});

test('each staged resident has two real collision-clear local patrol alternatives',()=>{
 for(const id of ids){
  const content={...getRegionContent(id),dungeons:DUNGEONS.filter(d=>d.region===id)},chunks=new Map();
  const chunk=(cx,cy)=>{const key=cx+','+cy;if(!chunks.has(key))chunks.set(key,describeChunk(content,cx,cy));return chunks.get(key);};
  for(const camp of AUR203_PLACEMENTS[id].camps)for(const spawn of camp.spawns){
   let choices=0;
   for(let direction=0;direction<8;direction++){
    const angle=direction*Math.PI/4,target={x:spawn.x+Math.cos(angle)*56,y:spawn.y+Math.sin(angle)*56};
    if(distance(target,camp)>camp.radius-8||!worldWalkable(content,target.x,target.y,radius))continue;
    if(regionRoads(content).some(r=>distanceToSegment(target,r.from,r.to)<=r.width/2+radius+12))continue;
    const margin=radius+60,obstacles=[];
    for(let cy=Math.max(0,Math.floor((Math.min(spawn.y,target.y)-margin)/CHUNK_SIZE));cy<=Math.min(Math.ceil(content.height/CHUNK_SIZE)-1,Math.floor((Math.max(spawn.y,target.y)+margin)/CHUNK_SIZE));cy++)for(let cx=Math.max(0,Math.floor((Math.min(spawn.x,target.x)-margin)/CHUNK_SIZE));cx<=Math.min(Math.ceil(content.width/CHUNK_SIZE)-1,Math.floor((Math.max(spawn.x,target.x)+margin)/CHUNK_SIZE));cx++)obstacles.push(...chunk(cx,cy).obstacles);
    if(!lineClear(spawn,target,obstacles,radius))continue;
    const midpoint={x:(spawn.x+target.x)/2,y:(spawn.y+target.y)/2};if(!worldWalkable(content,midpoint.x,midpoint.y,radius))continue;
    choices++;
   }
   assert.ok(choices>=2,spawn.id+' needs meaningful local movement space');
  }
 }
});

test('offline builder deterministically reproduces frozen candidate coordinates without modifying old world descriptors',()=>{
 for(const id of ids){
  const content=getRegionContent(id),before=structuredClone(content),result=buildAur203Region(content,DUNGEONS);
  assert.deepEqual(result,AUR203_PLACEMENTS[id],id+' authored candidate drift');
  assert.deepEqual(content,before,id+' builder mutated runtime');
  for(const [index,old]of authoredSnapshot.regions[id].camps.entries()){
   const current=content.camps[index];assert.equal(current.id,old.id);assert.equal(current.x,old.x);assert.equal(current.y,old.y);assert.equal(current.level,old.level);
   for(const [n,s]of old.spawns.entries())for(const [key,value]of Object.entries(s))assert.deepEqual(current.spawns[n][key],value,s.id+'/'+key);
  }
 }
});

test('placement fails explicitly for invalid or impossible inputs rather than weakening exclusions',()=>{
 assert.throws(()=>buildAur203Region({id:'unknown'},DUNGEONS),/Unknown/);
 const content=getRegionContent('forest');assert.throws(()=>buildAur203Region(content),/dungeon descriptors/);
 assert.throws(()=>buildAur203Region(content,DUNGEONS,{maxAttemptsPerCamp:0}),/attempt budget/);
 assert.throws(()=>buildAur203Region({...content,camps:content.camps.slice(1)},DUNGEONS),/unchanged Task10 baseline/);
 const impossible={...content,width:1400,height:1400,roads:[{from:{x:0,y:0},to:{x:1400,y:1400},width:4000}],authoredSidePaths:[]};
 assert.throws(()=>buildAur203Region(impossible,DUNGEONS,{maxAttemptsPerCamp:4}),/No safe additive AUR-203 placement.*after4 attempts|No safe additive AUR-203 placement.*after 4 attempts/);
});


test('all84 unpublished additions preserve immutable32 gathering envelopes; repair touches onlyfive authorized unpublished candidates',()=>{
 const receipt=JSON.parse(readFileSync(new URL('../docs/qa/aur203/gathering-clearance-repair.json',import.meta.url)));
 assert.equal(createHash('sha256').update(receipt.beforeFile).digest('hex'),receipt.beforeSHA256);
 assert.equal(receipt.beforeSHA256,'652108eb4845b44f47163c726dc59f084f1d0d83cde84afd11730d24ee98f945');
 const previous=JSON.parse(receipt.beforeFile.split('export const AUR203_PLACEMENTS=')[1].replace(/;\s*$/,'')),changed=[];
 for(const id of ids)for(const [index,camp]of AUR203_PLACEMENTS[id].camps.entries()){
  const before=previous[id].camps[index];
  assert.ok(regionGatheringNodes(id).every(n=>distance(n,camp)>=camp.radius+460),camp.id+' immutable plant clearance');
  if(JSON.stringify(camp)===JSON.stringify(before))continue;
  changed.push(camp.id);
  const record=receipt.changes.find(c=>c.id===camp.id);assert.ok(record);
  assert.deepEqual(record.beforeHomes,before.spawns);assert.deepEqual(record.afterHomes,camp.spawns);
  assert.deepEqual(record.beforeCenter,{x:before.x,y:before.y});assert.deepEqual(record.afterCenter,{x:camp.x,y:camp.y});
  assert.ok(id==='forest'||before.id==='north-spot-092','only authorized forest repack and north conflict may move');
  const {x:bx,y:by,spawns:bs,...beforeFields}=before,{x:ax,y:ay,spawns:as,...afterFields}=camp;
  assert.deepEqual(afterFields,beforeFields,'authored ID, level, biome and all other metadata stay exact');
  assert.equal(as.length,11);
  for(let i=0;i<11;i++){const{x,y,...fields}=as[i],{x:oldX,y:oldY,...oldFields}=bs[i];assert.deepEqual(fields,oldFields,'resident identity and metadata stay exact');}
 }
 assert.deepEqual(changed,['forest-spot-080','forest-spot-083','forest-spot-086','forest-spot-090','north-spot-092']);
 assert.equal(receipt.unchangedNewCandidates,79);
 assert.deepEqual(receipt.changes.map(c=>c.id),changed);
 assert.equal(createHash('sha256').update(readFileSync(new URL('../js/world/gatheringData.js',import.meta.url))).digest('hex'),receipt.protectedGatheringSHA256);
 assert.equal(createHash('sha256').update(readFileSync(new URL('../docs/qa/aur203/task10-baseline.json',import.meta.url))).digest('hex'),receipt.protectedBaselineSHA256);
 assert.equal(createHash('sha256').update(readFileSync(new URL('../js/world/aur203Placements.js',import.meta.url))).digest('hex'),receipt.afterSHA256);
});
