import test from 'node:test';import assert from 'node:assert/strict';
import {createCharacter} from '../js/characters/Character.js';import {Save} from '../js/systems/save.js';
import {LEGACY_RUNTIME_QUESTS,acceptQuestResult,activeQuestCount,questProgress,questSlotOrder,recordKill,claimQuest,updateQuestProgress} from '../js/quests/quests.js';
import {activeJournalEntries,queuedJournalEntries} from '../js/quests/journal.js';
import {commitQuestChange} from '../js/ui/NpcPanel.js';
const quests=LEGACY_RUNTIME_QUESTS.filter(q=>q.type==='kill').slice(0,12);
const legacy=()=>createCharacter({level:56,quests:Object.fromEntries(quests.map(q=>[q.id,{state:'active',progress:1}]))});
test('legacy overflow exposes exactly six active slots and retains all twelve original records and frozen queued progress',()=>{
 const hero=legacy(),before=structuredClone(hero.quests);assert.equal(activeQuestCount(hero),6);assert.equal(activeJournalEntries(hero).length,6);assert.equal(queuedJournalEntries(hero).length,6);assert.deepEqual(hero.quests,before,'read-only selectors do not rewrite saved records');
 const queued=quests[6];assert.equal(questProgress(hero,queued.id).state,'queued');recordKill(hero,queued.target,{region:queued.region,campId:queued.targetCampId,speciesId:queued.targetSpeciesId});assert.deepEqual(hero.quests[queued.id],before[queued.id]);assert.equal(claimQuest(hero,queued.id).ok,false);assert.deepEqual(acceptQuestResult(hero,'task10-village-watch','forest-daily'),{ok:false,reason:'activeLimit'});
 const raw=structuredClone(hero.quests);updateQuestProgress({hero});for(const q of quests)assert.deepEqual(hero.quests[q.id],raw[q.id]);assert.equal(hero.quests.__activeQueueV1.version,1);assert.deepEqual(hero.quests.__activeQueueV1.order,questSlotOrder(hero));
});
test('saved overflow order and all original progress survive reload in three slots and claiming automatically resumes the next record',()=>{
 const values=new Map(),previous=globalThis.localStorage;globalThis.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
 try{for(const slot of [1,2,3]){const hero=legacy();updateQuestProgress({hero});const order=questSlotOrder(hero);assert.equal(Save.write(hero,slot),true);const loaded=createCharacter(Save.load(slot));assert.deepEqual(questSlotOrder(loaded),order);assert.equal(activeQuestCount(loaded),6);assert.equal(queuedJournalEntries(loaded).length,6);for(const q of quests)assert.deepEqual(loaded.quests[q.id],hero.quests[q.id]);
  const first=quests[0];for(let i=1;i<first.required;i++)recordKill(loaded,first.target,{region:first.region,campId:first.targetCampId,speciesId:first.targetSpeciesId});assert.equal(questProgress(loaded,first.id).state,'completed');assert.equal(claimQuest(loaded,first.id,first.turnInNpcId||first.npcId).ok,true);assert.equal(questProgress(loaded,quests[6].id).state,'active');assert.equal(questProgress(loaded,quests[6].id).progress,1);assert.equal(activeQuestCount(loaded),6);assert.equal(queuedJournalEntries(loaded).length,5);assert.equal(claimQuest(loaded,first.id).ok,false);assert.equal(Save.write(loaded,slot),true);const again=createCharacter(Save.load(slot));assert.equal(questProgress(again,quests[6].id).state,'active');assert.equal(questProgress(again,first.id).state,'claimed');assert.equal(queuedJournalEntries(again).length,5);
 }}finally{globalThis.localStorage=previous;}
});
test('all twelve queued contracts can drain once through real events without duplicate rewards or a seventh active slot',()=>{
 const hero=legacy();updateQuestProgress({hero});const claimed=[];
 while(activeQuestCount(hero)){assert.ok(activeQuestCount(hero)<=6);const id=questSlotOrder(hero)[0],q=quests.find(q=>q.id===id);for(let i=0;i<q.required;i++)recordKill(hero,q.target,{region:q.region,campId:q.targetCampId,speciesId:q.targetSpeciesId});assert.equal(questProgress(hero,id).state,'completed');assert.equal(claimQuest(hero,id,q.turnInNpcId||q.npcId).ok,true);claimed.push(id);const before=structuredClone(hero);assert.equal(claimQuest(hero,id).ok,false);assert.deepEqual(hero,before);}
 assert.equal(claimed.length,12);assert.equal(new Set(claimed).size,12);assert.equal(queuedJournalEntries(hero).length,0);assert.deepEqual(hero.quests.__activeQueueV1.order,[]);for(const q of quests)assert.equal(hero.quests[q.id].state,'claimed');
});
test('failed durable reward rolls back queue promotion,old progress and resources before retry',()=>{
 const hero=legacy(),q=quests[0];hero.quests[q.id]={state:'completed',progress:q.required};updateQuestProgress({hero});const before=structuredClone(hero);
 assert.equal(commitQuestChange(hero,()=>claimQuest(hero,q.id,q.turnInNpcId||q.npcId),()=>false).reason,'storage');assert.deepEqual(hero,before);assert.equal(questProgress(hero,quests[6].id).state,'queued');assert.equal(questProgress(hero,q.id).state,'completed');
 assert.equal(commitQuestChange(hero,()=>claimQuest(hero,q.id,q.turnInNpcId||q.npcId),()=>true).ok,true);assert.equal(questProgress(hero,quests[6].id).state,'active');assert.equal(questProgress(hero,q.id).state,'claimed');
});
