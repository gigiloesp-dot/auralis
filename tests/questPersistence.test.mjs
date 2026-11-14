import test from 'node:test';
import assert from 'node:assert/strict';
import {commitQuestChange} from '../js/ui/NpcPanel.js';
import {acceptQuest,claimQuest,recordKill,questProgress} from '../js/quests/quests.js';
import {createCharacter} from '../js/characters/Character.js';
const complete=hero=>{acceptQuest(hero);for(let i=0;i<5;i++)recordKill(hero,'wolf');};
test('failed acceptance save restores the full hero while preserving its live identity',()=>{
 const hero=createCharacter(),reference=hero,before=structuredClone(hero);
 const result=commitQuestChange(hero,()=>acceptQuest(hero),()=>false);
 assert.equal(result.reason,'storage');assert.equal(hero,reference);assert.deepEqual(hero,before);assert.equal(questProgress(hero).state,'available');
 assert.equal(commitQuestChange(hero,()=>acceptQuest(hero),()=>true).ok,true);assert.equal(questProgress(hero).state,'active');
});
test('failed reward checkpoint rolls back inventory stacks, XP, level, points and refilled resources',()=>{
 const hero=createCharacter({inventory:[{id:'wolfFang',quantity:98}],hp:1,mp:1});complete(hero);
 const before=structuredClone(hero),reference=hero;let durable=structuredClone(before);
 const fail=commitQuestChange(hero,()=>claimQuest(hero),()=>{assert.equal(hero.level,2);assert.equal(hero.inventory.filter(i=>i.id==='wolfFang').reduce((n,i)=>n+i.quantity,0),101);throw Error('quota');});
 assert.equal(fail.reason,'storage');assert.equal(hero,reference);assert.deepEqual(hero,before);assert.deepEqual(durable,before);
 const success=commitQuestChange(hero,()=>claimQuest(hero),()=>{durable=structuredClone(hero);return true;});assert.equal(success.ok,true);assert.equal(hero.level,2);assert.equal(hero.attributePoints,3);assert.equal(hero.skillPoints,1);assert.equal(durable.quests.forestWolves.state,'claimed');
 const once=structuredClone(hero);assert.equal(commitQuestChange(hero,()=>claimQuest(hero),()=>true).ok,false);assert.deepEqual(hero,once);
});
test('failed operation does not checkpoint or leak partial newly added fields',()=>{
 const hero=createCharacter(),before=structuredClone(hero);let writes=0;
 assert.equal(commitQuestChange(hero,()=>{hero.temporary={nested:[1]};hero.inventory.push({id:'wolfFang'});return {ok:false,reason:'full'};},()=>{writes++;return true;}).reason,'full');
 assert.deepEqual(hero,before);assert.equal(writes,0);
});
