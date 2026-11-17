import test from 'node:test';import assert from 'node:assert/strict';
import {createCharacter} from '../js/characters/Character.js';
import {Save} from '../js/systems/save.js';
import {QUESTS,LEGACY_QUESTS,LEGACY_RUNTIME_QUESTS,questProgress,questDefinition,acceptQuest,acceptQuestResult,activeQuestCount,recordKill,claimQuest,updateQuestProgress,questsForNpc} from '../js/quests/quests.js';
import {TASK10_DAILY_QUESTS} from '../js/quests/task10QuestData.js';
import {npcQuestIndicator} from '../js/quests/npcQuestIndicator.js';
import {activeJournalEntries} from '../js/quests/journal.js';
import {commitQuestChange} from '../js/ui/NpcPanel.js';
const day=86400000,base=Date.UTC(2026,10,16,12),daily=TASK10_DAILY_QUESTS[0];
const clock=fn=>{const real=Date.now;let now=base;Date.now=()=>now;try{return fn(v=>now=v);}finally{Date.now=real;}};
const finish=(hero,q)=>{for(let i=0;i<q.required;i++)recordKill(hero,q.target,{region:q.region,campId:q.targetCampId,speciesId:q.targetSpeciesId});assert.equal(questProgress(hero,q.id).state,'completed');};
test('all104 original identities,XP,gold,item rewards and claimed prerequisite records survive the149-definition extension',()=>{
 assert.equal(QUESTS.length,149);assert.equal(LEGACY_RUNTIME_QUESTS.length,104);assert.equal(new Set(QUESTS.map(q=>q.id)).size,149);
 for(const old of LEGACY_QUESTS){const q=questDefinition(old.id);for(const key of ['id','npcId','turnInNpcId','xp','gold','reward','requires'])assert.deepEqual(q[key],old[key],old.id+'/'+key);}
 const hero=createCharacter({level:42,quests:{forestWolves:{state:'claimed',progress:5}}});assert.equal(questProgress(hero,'forestWolves').state,'claimed');assert.equal(questProgress(hero,'forestFangs').state,'available');assert.equal(acceptQuest(hero,'forestWolves'),false);
});
test('six accepted contracts include ready rewards;the seventh cannot mutate the save and claiming frees one slot',()=>{
 const hero=createCharacter({level:56}),available=QUESTS.filter(q=>!q.daily&&questProgress(hero,q.id).state==='available');assert.ok(available.length>6);
 for(const q of available.slice(0,6))assert.equal(acceptQuest(hero,q.id,q.npcId),true);
 const q=available[0];hero.quests[q.id]={state:'completed',progress:q.required||1};assert.equal(activeQuestCount(hero),6);
 const before=structuredClone(hero);assert.deepEqual(acceptQuestResult(hero,available[6].id,available[6].npcId),{ok:false,reason:'activeLimit'});assert.deepEqual(hero,before);
 assert.equal(claimQuest(hero,q.id,q.turnInNpcId||q.npcId).ok,true);assert.equal(activeQuestCount(hero),5);assert.equal(acceptQuest(hero,available[6].id,available[6].npcId),true);assert.equal(activeQuestCount(hero),6);
});
test('all eight daily tiers become available only in their seven-level band and reward exactly10HP/5MP once perUTCday',()=>clock(()=>{
 for(const q of TASK10_DAILY_QUESTS){const hero=createCharacter({level:q.level,region:q.region,potions:{hp:3,mp:2}});assert.equal(questProgress(hero,q.id).state,'available');assert.equal(acceptQuest(hero,q.id,q.npcId),true);finish(hero,q);
  const gold=hero.gold;assert.equal(claimQuest(hero,q.id,q.npcId).ok,true);assert.deepEqual(hero.potions,{hp:13,mp:7});assert.equal(hero.gold-gold,q.gold);assert.equal(questProgress(hero,q.id).state,'claimed');const before=structuredClone(hero);assert.equal(claimQuest(hero,q.id).ok,false);assert.equal(acceptQuest(hero,q.id),false);assert.deepEqual(hero,before);
  for(const other of TASK10_DAILY_QUESTS.filter(other=>other!==q))assert.equal(questProgress(hero,other.id).state,'locked');
 }
}));
test('midnight expires unclaimed daily progress,opens only a fresh contract,and clock rollback cannot replay rewards',()=>clock(set=>{
 const hero=createCharacter({region:'forest'});acceptQuest(hero,daily.id);recordKill(hero,daily.target,{campId:daily.targetCampId,speciesId:daily.targetSpeciesId});assert.equal(questProgress(hero,daily.id).progress,1);
 set(base+day);assert.equal(updateQuestProgress({hero}),true);assert.equal(questProgress(hero,daily.id).state,'available');assert.equal(questProgress(hero,daily.id).progress,0);assert.equal(activeQuestCount(hero),0);assert.equal(activeJournalEntries(hero).length,0);assert.equal(claimQuest(hero,daily.id).ok,false);
 assert.equal(acceptQuest(hero,daily.id),true);finish(hero,daily);assert.equal(claimQuest(hero,daily.id).ok,true);
 set(base);assert.equal(questProgress(hero,daily.id).state,'claimed');assert.equal(acceptQuest(hero,daily.id),false);
 set(base+day);assert.equal(acceptQuest(hero,daily.id),false);set(base+day*2);assert.equal(questProgress(hero,daily.id).state,'available');assert.equal(acceptQuest(hero,daily.id),true);assert.equal(questProgress(hero,daily.id).progress,0);
}));
test('changing level tiers cannot reserve or claim a second daily on the same day,while accepted lower-tier progress stays valid',()=>clock(()=>{
 const hero=createCharacter({region:'forest'});acceptQuest(hero,daily.id);hero.level=8;const next=TASK10_DAILY_QUESTS[1];assert.equal(questProgress(hero,next.id).state,'locked');finish(hero,daily);assert.equal(claimQuest(hero,daily.id).ok,true);assert.equal(questProgress(hero,next.id).state,'locked');assert.equal(acceptQuest(hero,next.id),false);
}));
test('daily potion capacity and failed durable checkpoint are atomic;full equipment inventory does not consume potion-counter capacity',()=>clock(()=>{
 const hero=createCharacter({potions:{hp:95,mp:98},inventory:Array.from({length:60},()=>({id:'ironSword',rarity:'common'}))});acceptQuest(hero,daily.id);finish(hero,daily);const before=structuredClone(hero);
 assert.equal(claimQuest(hero,daily.id).reason,'potionCapacity');assert.deepEqual(hero,before);hero.potions={hp:89,mp:94};const retry=structuredClone(hero);
 assert.equal(commitQuestChange(hero,()=>claimQuest(hero,daily.id),()=>false).reason,'storage');assert.deepEqual(hero,retry);assert.equal(questProgress(hero,daily.id).state,'completed');assert.equal(commitQuestChange(hero,()=>claimQuest(hero,daily.id),()=>true).ok,true);assert.deepEqual(hero.potions,{hp:99,mp:99});assert.equal(hero.inventory.length,60);
}));
test('three independent character slots preserve daily cycles,ordinary progress and anti-replay across reload',()=>clock(set=>{
 const values=new Map(),previous=globalThis.localStorage;globalThis.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
 try{for(const slot of [1,2,3]){const hero=createCharacter({name:'Daily'+slot,region:'forest',quests:{forestWolves:{state:'active',progress:2}}});assert.equal(acceptQuest(hero,daily.id),true);finish(hero,daily);assert.equal(claimQuest(hero,daily.id).ok,true);assert.equal(Save.write(hero,slot),true);const loaded=createCharacter(Save.load(slot));assert.equal(loaded.name,'Daily'+slot);assert.equal(loaded.quests.forestWolves.progress,5);assert.equal(questProgress(loaded,daily.id).state,'claimed');assert.equal(claimQuest(loaded,daily.id).ok,false);}
  set(base+day);for(const slot of [1,2,3]){const loaded=createCharacter(Save.load(slot));assert.equal(questProgress(loaded,daily.id).state,'available');assert.equal(acceptQuest(loaded,daily.id),true);assert.equal(questProgress(loaded,daily.id).progress,0);}
 }finally{globalThis.localStorage=previous;}
}));
test('daily-first indicators retain ordinary alternatives and querying markers or dialogs never mutates character records',()=>clock(()=>{
 const hero=createCharacter({level:1});const before=structuredClone(hero);assert.equal(npcQuestIndicator(hero,'forest-daily').daily,true);assert.ok(questsForNpc(hero,'forest-daily').some(q=>!q.daily));assert.deepEqual(hero,before);
 acceptQuest(hero,daily.id);assert.equal(npcQuestIndicator(hero,'forest-daily').state,'active');finish(hero,daily);assert.equal(npcQuestIndicator(hero,'forest-daily').state,'completed');claimQuest(hero,daily.id);assert.equal(activeJournalEntries(hero).some(x=>x.quest.daily),false);
}));
