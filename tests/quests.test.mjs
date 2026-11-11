import test from 'node:test';
import assert from 'node:assert/strict';
import {acceptQuest,questProgress,recordKill,claimQuest,QUEST_TEXT} from '../js/quests/quests.js';
const hero=()=>({level:1,xp:0,hp:10,mp:10,stats:{},inventory:[],quests:{}});
test('starter quest requires acceptance and five matching kills; reward can only be claimed once',()=>{
 const h=hero();assert.equal(recordKill(h,'wolf'),false);assert.equal(claimQuest(h).ok,false);assert.equal(acceptQuest(h),true);assert.equal(acceptQuest(h),false);
 assert.equal(recordKill(h,'boar'),false);for(let i=0;i<5;i++)assert.equal(recordKill(h,'wolf'),true);assert.equal(recordKill(h,'wolf'),false);
 assert.equal(questProgress(h).state,'completed');assert.equal(claimQuest(h).ok,true);assert.equal(h.level,2);assert.equal(h.inventory[0].quantity,3);const xp=h.xp;
 assert.equal(claimQuest(h).ok,false);assert.equal(h.xp,xp);assert.equal(h.inventory[0].quantity,3);
});
test('full inventory leaves quest and partial material stacks unchanged for safe retry',()=>{
 const h=hero();acceptQuest(h);for(let i=0;i<5;i++)recordKill(h,'wolf');h.inventory=Array.from({length:59},()=>({id:'ironSword'}));h.inventory.push({id:'wolfFang',rarity:'common',quantity:99});
 assert.equal(claimQuest(h).reason,'full');assert.equal(h.inventory[59].quantity,99);assert.equal(h.xp,0);assert.equal(questProgress(h).state,'completed');
 h.inventory.shift();assert.equal(claimQuest(h).ok,true);assert.equal(h.inventory.filter(x=>x.id==='wolfFang').reduce((n,x)=>n+x.quantity,0),102);
});
test('quest progress survives JSON roundtrip and all new text has three languages',()=>{
 const h=hero();acceptQuest(h);recordKill(h,'wolf');const restored=JSON.parse(JSON.stringify(h));assert.equal(questProgress(restored).progress,1);
 for(const lang of ['en','es'])assert.deepEqual(Object.keys(QUEST_TEXT[lang]).sort(),Object.keys(QUEST_TEXT.ru).sort());
});
