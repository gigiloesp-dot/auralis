import test from 'node:test';
import assert from 'node:assert/strict';
import {activeJournalEntries} from '../js/quests/journal.js';
import {acceptQuest,claimQuest,recordKill,questProgress} from '../js/quests/quests.js';
import {createCharacter} from '../js/characters/Character.js';
import {Save} from '../js/systems/save.js';
const store=new Map();
globalThis.localStorage={getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,value),removeItem:key=>store.delete(key)};
const entry=hero=>activeJournalEntries(hero).find(({quest})=>quest.id==='forestWolves');

test('active journal follows real objective progress and removes claimed records without deleting them',()=>{
 const hero=createCharacter();assert.deepEqual(activeJournalEntries(hero),[]);
 assert.equal(acceptQuest(hero),true);assert.deepEqual(entry(hero).progress,{state:'active',progress:0,required:5});
 recordKill(hero,'wolf');assert.deepEqual(entry(hero).progress,{state:'active',progress:1,required:5});
 for(let i=0;i<4;i++)recordKill(hero,'wolf');
 assert.deepEqual(entry(hero).progress,{state:'completed',progress:5,required:5});
 assert.equal(claimQuest(hero).ok,true);assert.equal(entry(hero),undefined);
 assert.deepEqual(hero.quests.forestWolves,{state:'claimed',progress:5});
 const snapshot=structuredClone(hero);assert.equal(acceptQuest(hero),false);assert.equal(claimQuest(hero).ok,false);assert.deepEqual(hero,snapshot);
 assert.equal(questProgress(hero,'forestFangs').state,'available','retained claimed record unlocks its dependency');
});

test('save round trips retain pending rewards and permanently exclude claimed quests from active journal',()=>{
 store.clear();const hero=createCharacter();acceptQuest(hero);for(let i=0;i<5;i++)recordKill(hero,'wolf');
 assert.equal(Save.write(hero,1),true);const pending=Save.load(1);
 assert.equal(entry(pending).progress.state,'completed');assert.equal(claimQuest(pending).ok,true);
 assert.equal(Save.write(pending,1),true);
 for(let i=0;i<3;i++){
  const loaded=Save.load(1),before=structuredClone(loaded.quests);
  assert.equal(entry(loaded),undefined);assert.equal(loaded.quests.forestWolves.state,'claimed');
  assert.equal(acceptQuest(loaded),false);assert.equal(claimQuest(loaded).ok,false);
  assert.deepEqual(loaded.quests,before);assert.equal(questProgress(loaded,'forestFangs').state,'available');assert.equal(Save.write(loaded,1),true);
 }
});

test('legacy claimed saves and unexpected saved states never become active journal entries',()=>{
 store.clear();store.set('auralis_save_v1',JSON.stringify({version:1,x:1030,y:1140,level:42,quests:{forestWolves:{state:'claimed'},forestFangs:{state:'available'},unknownRetiredQuest:{state:'active',progress:3}}}));
 const loaded=Save.load(1),before=structuredClone(loaded);
 assert.deepEqual(activeJournalEntries(loaded),[]);assert.deepEqual(loaded,before,'selector does not normalize or mutate save state');
 assert.equal(loaded.quests.forestWolves.state,'claimed');assert.equal(questProgress(loaded,'forestFangs').state,'available');
 assert.equal(Save.write(loaded,1),true);assert.deepEqual(activeJournalEntries(Save.load(1)),[]);
});
