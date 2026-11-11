import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareSkill,commitSkill,combatSpec} from '../js/combat/skillRuntime.js';
import {getSkills} from '../js/skills/skillData.js';
const hero=classId=>({classId,hp:100,mp:100,level:42,learnedSkills:Object.fromEntries(getSkills(classId).map(s=>[s.id,3]))});
test('every class has five executable effects and rank scales damage and duration',()=>{
 for(const classId of ['warrior','archer','mage','paladin','assassin','cannoneer']){
  const h=hero(classId),effects=new Set();
  for(const skill of getSkills(classId)){const cast=prepareSkill(h,skill.id,100);assert.equal(cast.ok,true);assert.equal(cast.rank,3);assert.equal(cast.duration,6000);assert.equal(cast.multiplier,skill.power/100+.4);effects.add(cast.effect);}
  assert.equal(effects.size,5);
 }
});
test('mana and cooldown spend only at commit; rejects invalid, unlearned and dead casts',()=>{
 const h=hero('mage'),cd=new Map(),cast=prepareSkill(h,'mage_0',100,cd);assert.equal(h.mp,100);assert.equal(cd.size,0);
 commitSkill(h,cast,100,cd);assert.equal(h.mp,92);assert.equal(prepareSkill(h,'mage_0',101,cd).reason,'cooldown');assert.equal(prepareSkill(h,'mage_0',5100,cd).ok,true);
 assert.equal(prepareSkill(h,'archer_0',100,cd).reason,'unlearned');delete h.learnedSkills.mage_1;assert.equal(prepareSkill(h,'mage_1',100,cd).reason,'unlearned');
 h.hp=0;assert.equal(prepareSkill(h,'mage_2',100,cd).reason,'dead');h.hp=100;h.mp=0;assert.equal(prepareSkill(h,'mage_2',100,cd).reason,'mana');
});
test('ranged class attacks have longer reach and real projectile types',()=>{
 for(const classId of ['archer','mage','cannoneer']){assert.ok(combatSpec(classId).range>250);assert.ok(combatSpec(classId).projectile);}
 for(const classId of ['warrior','paladin','assassin']){assert.ok(combatSpec(classId).range<=100);assert.equal(combatSpec(classId).projectile,undefined);}
});
