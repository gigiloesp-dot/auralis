import test from 'node:test';import assert from 'node:assert/strict';
import {QUESTS,LEGACY_QUESTS,acceptQuest,recordKill,questProgress,claimQuest} from '../js/quests/quests.js';
import {getRegionContent} from '../js/world/regionContent.js';import {createCharacter} from '../js/characters/Character.js';
import {Save} from '../js/systems/save.js';
const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
test('every legacy hunting quest resolves one stable real species without changing saved progress or rewards',()=>{
 for(const q of QUESTS.filter(q=>q.type==='kill')){
  const c=getRegionContent(q.region),camp=c.camps.find(c=>c.speciesId===q.targetSpeciesId),old=LEGACY_QUESTS.find(p=>p.id===q.id);assert.ok(camp,q.id);assert.equal(camp.level,q.level);assert.deepEqual(q.reward,old.reward);assert.equal(q.xp,old.xp);assert.equal(q.gold,old.gold);
  const h=createCharacter({region:q.region,level:56});for(const id of q.requires||[])h.quests[id]={state:'claimed',progress:99};assert.equal(acceptQuest(h,q.id,q.npcId),true);
  // An explicit wrong species cannot count, even when an event has the correct
  // base archetype and camp. This rejects stale or incorrect attribution.
  recordKill(h,q.target,{campId:camp.id,speciesId:'wrong-species'});assert.equal(questProgress(h,q.id).progress,0);
  recordKill(h,q.target,{campId:camp.id,speciesId:camp.speciesId});assert.equal(questProgress(h,q.id).progress,1);
  // Older event producers carrying only camp/spawn IDs resolve the same species.
  recordKill(h,q.target,{campId:camp.id,id:camp.spawns[0].id});assert.equal(questProgress(h,q.id).progress,2);
  assert.equal(Save.write(h,1),true);const restored=createCharacter(Save.load(1));assert.equal(questProgress(restored,q.id).progress,2);
  for(let i=2;i<q.required;i++)recordKill(restored,q.target,{campId:camp.id,speciesId:camp.speciesId});assert.equal(claimQuest(restored,q.id,q.turnInNpcId||q.npcId).ok,true);assert.equal(claimQuest(restored,q.id,q.turnInNpcId||q.npcId).ok,false);
 }
});
test('starter wolves reject another spot of the same archetype with species,camp or spawn attribution; old unqualified API remains compatible',()=>{
 const c=getRegionContent('forest'),starter=c.camps.find(c=>c.id==='forest-starter-wolves'),other=c.camps.find(c=>c.type===starter.type&&c!==starter);assert.ok(other);const h=createCharacter();assert.equal(acceptQuest(h,'forestWolves'),true);
 for(const details of [{speciesId:other.speciesId},{campId:other.id},{id:other.spawns[0].id}])recordKill(h,'wolf',details);assert.equal(questProgress(h).progress,0);
 recordKill(h,'wolf',{campId:starter.id});assert.equal(questProgress(h).progress,1);recordKill(h,'wolf');assert.equal(questProgress(h).progress,2);
 const loaded=createCharacter({...h,quests:{forestWolves:{state:'claimed',progress:5}}});assert.equal(questProgress(loaded).state,'claimed');assert.equal(recordKill(loaded,'wolf',{speciesId:starter.speciesId}),false);
});
