import test from 'node:test';
import assert from 'node:assert/strict';
import {temporaryEffects,effectTime} from '../js/ui/temporaryEffects.js';
test('only active class buffs appear, never cooldowns, passive ranks or duplicate powder',()=>{
 const h={classId:'cannoneer',hp:100},buffs={guard:4000,guardRank:5,iceWard:500,rage:7000,powder:7000,focus:5000};
 const before=structuredClone(buffs),effects=temporaryEffects(h,buffs,1000);
 assert.deepEqual(effects.map(e=>e.id),['cannoneer_1','cannoneer_3']);assert.deepEqual(effects.map(e=>e.time),['3','6']);assert.deepEqual(buffs,before);
 assert.deepEqual(temporaryEffects(h,buffs,7000),[]);assert.deepEqual(temporaryEffects({...h,hp:0},buffs,1000),[]);
});
test('all six classes map their actual temporary abilities to distinct icons and translated names',()=>{
 for(const classId of ['warrior','archer','mage','paladin','assassin','cannoneer'])for(const language of ['ru','en','es']){
  const result=temporaryEffects({classId,hp:10},{guard:8000,rage:8000,evade:8000,focus:8000,aura:8000},100,language);
  assert.ok(result.length>=1);assert.equal(new Set(result.map(e=>e.id)).size,result.length);
  for(const e of result){assert.match(e.iconSvg,/<svg/);assert.ok(e.name);if(language!=='ru')assert.doesNotMatch(e.name,/[А-Яа-яЁё]/);}
 }
});
test('afflictions are timed independently; expired and untimed values remain hidden',()=>{
 const hero={classId:'warrior',hp:10,monsterAfflictions:{poison:{until:3000},slow:{until:5000},other:{until:5000}}};
 assert.deepEqual(temporaryEffects(hero,{},3000,'en').map(e=>[e.id,e.negative,e.time]),[['affliction-slow',true,'2']]);
 assert.deepEqual(temporaryEffects(hero,{},5000),[]);
});
test('effect countdown uses simulation time and formats seconds and minutes at their boundaries',()=>{
 assert.equal(effectTime(0),'0');assert.equal(effectTime(1),'1');assert.equal(effectTime(59000),'59');assert.equal(effectTime(60000),'1:00');assert.equal(effectTime(125001),'2:06');
 const hero={classId:'warrior',hp:10},buffs={guard:125000};assert.equal(temporaryEffects(hero,buffs,0)[0].time,'2:05');assert.equal(temporaryEffects(hero,buffs,1000)[0].time,'2:04');
});
