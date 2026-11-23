import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {TASK10_LAYOUT} from '../js/world/task10Layout.js';
import {getRegionContent} from '../js/world/regionContent.js';
import {QUESTS,LEGACY_RUNTIME_QUESTS} from '../js/quests/quests.js';
import {CAMP_ALIASES,MONSTER_ALIASES,LEGACY_QUEST_TARGETS} from '../js/world/campAliases.js';

const bytes=readFileSync(new URL('../docs/qa/aur203/task10-baseline.json',import.meta.url));
const baseline=JSON.parse(bytes);
const expectedDigest='3441745cd6743e6ad21bcd024323b9ab2fb746124ac2502b8ac2320fa79ee338';

// AUR-203 may append content, but must not delete, reorder, rename or change
// existing records. Compare by ID as well as index so duplicates cannot hide
// a replacement, and retain complete quest records (including rewards and
// progression conditions), rather than selecting only a few convenient fields.
function assertPreservedPrefix(actual,previous,label){
 assert.ok(actual.length>=previous.length,label+' cannot shrink');
 const ids=actual.map(row=>row.id);
 assert.equal(new Set(ids).size,ids.length,label+' IDs must be unique');
 assert.deepEqual(actual.slice(0,previous.length),previous,label+' existing records must remain an unchanged prefix');
}
function assertPreservedBindings(actual,previous,label){
 for(const [id,value] of Object.entries(previous)){
  assert.ok(Object.hasOwn(actual,id),label+' missing '+id);
  assert.deepEqual(actual[id],value,label+' changed '+id);
 }
}

test('AUR-203 compatibility fixture is the immutable pre-expansion baseline',()=>{
 assert.equal(createHash('sha256').update(bytes).digest('hex'),expectedDigest,'Do not regenerate the fixture to bless a compatibility regression');
 assert.equal(baseline.schemaVersion,1);
 assert.equal(baseline.baseCommit,'90f7dcda5d8fc4e6a22a9ac145a429aecc7e794d');
 assert.equal(Object.values(baseline.regions).reduce((n,c)=>n+c.camps.length,0),257);
 assert.equal(Object.values(baseline.regions).reduce((n,c)=>n+c.camps.reduce((n,camp)=>n+camp.spawns.length,0),0),2827);
 assert.equal(baseline.quests.length,149);
 assert.equal(baseline.legacyRuntimeQuests.length,104);
});

test('all original 257 camps and 2827 spawn descriptors remain exact and in order, with append-only growth permitted',()=>{
 const allCampIds=new Set(),allSpawnIds=new Set();
 for(const [id,previous] of Object.entries(baseline.regions)){
  assertPreservedPrefix(TASK10_LAYOUT[id].camps,previous.camps,id+' authored camps');
  const runtime=getRegionContent(id);
  assert.ok(runtime.camps.length>=previous.camps.length,id+' runtime camps cannot shrink');
  for(const [index,camp] of previous.camps.entries()){
   const current=runtime.camps[index];
   // Runtime adds resolver metadata. Preserve every authored field while
   // allowing truthful art-completion flags to evolve during Task10.
   const {spawns,...fields}=camp;
   for(const [key,value] of Object.entries(fields)){
    if(key==='temporaryBestiary')continue;
    assert.deepEqual(current[key],value,id+'/'+camp.id+'/'+key);
   }
   assert.equal(current.speciesId,camp.plannedSpeciesId,camp.id+' runtime species identity');
   assert.equal(current.spawns.length,spawns.length,camp.id+' original resident count');
   for(const [n,spawn] of spawns.entries()){
    const actual=current.spawns[n];
    for(const [key,value] of Object.entries(spawn))assert.deepEqual(actual[key],value,spawn.id+'/'+key);
    assert.equal(actual.speciesId,spawn.plannedSpeciesId,spawn.id+' runtime species identity');
   }
  }
  // Include appended camps in collision checks: a future addition must not
  // shadow a persistent ID belonging to any original region.
  for(const camp of runtime.camps){
   assert.ok(!allCampIds.has(camp.id),'duplicate camp '+camp.id);allCampIds.add(camp.id);
   for(const spawn of camp.spawns){assert.ok(!allSpawnIds.has(spawn.id),'duplicate spawn '+spawn.id);allSpawnIds.add(spawn.id);}
  }
 }
});

test('existing geographic anchors, roads and arrival points stay frozen while new anchors may append',()=>{
 for(const [id,previous] of Object.entries(baseline.regions)){
  const runtime=getRegionContent(id);
  for(const key of ['width','height','minLevel','maxLevel','spawn'])assert.deepEqual(runtime[key],previous[key],id+'/'+key);
  for(const key of ['bosses','towns','npcs','portals','roads','landmarks','futureSettlements'])assertPreservedPrefix(runtime[key]||[],previous[key],id+'/'+key);
 }
});

test('all 149 existing quests and original 104 progression/reward contracts survive future quest additions',()=>{
 assertPreservedPrefix(QUESTS,baseline.quests,'runtime quests');
 assertPreservedPrefix(LEGACY_RUNTIME_QUESTS,baseline.legacyRuntimeQuests,'original 104 runtime quests');
 const regions=Object.fromEntries(Object.keys(baseline.regions).map(id=>[id,getRegionContent(id)]));
 for(const quest of baseline.quests){
  if(!quest.targetCampId)continue;
  const camp=regions[quest.region].camps.find(camp=>camp.id===quest.targetCampId);
  assert.ok(camp,quest.id+' original target camp remains reachable by ID');
  if(quest.targetSpeciesId)assert.equal(camp.speciesId,quest.targetSpeciesId,quest.id+' target species');
 }
});

test('release21 migration aliases and existing legacy quest bindings cannot be redirected',()=>{
 assertPreservedBindings(CAMP_ALIASES,baseline.campAliases,'camp aliases');
 assertPreservedBindings(MONSTER_ALIASES,baseline.monsterAliases,'monster aliases');
 assertPreservedBindings(LEGACY_QUEST_TARGETS,baseline.legacyQuestTargets,'legacy quest targets');
 const regions=Object.fromEntries(Object.keys(baseline.regions).map(id=>[id,getRegionContent(id)]));
 for(const [oldId,nextId] of Object.entries(baseline.campAliases)){
  const region=oldId.slice(0,oldId.indexOf(':'));
  assert.ok(regions[region].camps.some(camp=>camp.id===nextId),'alias target missing '+oldId);
 }
 const spawnKeys=new Set(Object.entries(regions).flatMap(([id,c])=>c.camps.flatMap(camp=>camp.spawns.map(spawn=>id+':'+spawn.id))));
 for(const nextId of Object.values(baseline.monsterAliases))assert.ok(spawnKeys.has(nextId),'monster alias target missing '+nextId);
});
