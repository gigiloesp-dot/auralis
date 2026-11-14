import test from 'node:test';
import assert from 'node:assert/strict';
import {getPassiveSkills,skillPanelText} from '../js/skills/passiveSkills.js';
import {getSkills,learnSkill} from '../js/skills/skillData.js';
import {assignSkillSlot,normalizeSkillSlots} from '../js/skills/skillSlots.js';
import {createCharacter} from '../js/characters/Character.js';
import {CLASSES} from '../js/characters/classes.js';
import {combatSpec} from '../js/combat/skillRuntime.js';
import {MonsterSystem} from '../js/monsters/MonsterSystem.js';
import {calculateDamage} from '../js/combat/combat.js';
import {derivedAttributes} from '../js/systems/attributes.js';

test('class passives are automatic information, never purchasable or assignable active skills',()=>{
 for(const classId of Object.keys(CLASSES)){
  const hero=createCharacter({classId,level:42,skillPoints:10,learnedSkills:{[classId+'_0']:2},skillSlots:[classId+'_0',null,null,null]}),before=JSON.stringify(hero);
  for(const passive of getPassiveSkills(classId)){
   assert.equal(passive.type,'passive');assert.equal(passive.automatic,true);assert.equal(passive.level,1);assert.equal(passive.rank,1);
   assert.equal(learnSkill(hero,passive.id),false);assert.equal(assignSkillSlot(hero,passive.id,2),false);
  }
  assert.equal(JSON.stringify(hero),before,'viewing class passives must not change stats, ranks, points or slots');
  const restored=createCharacter(JSON.parse(before));assert.deepEqual(normalizeSkillSlots(restored),[classId+'_0',null,null,null]);
  assert.equal(getSkills(classId).length,5,'all five original active skills remain active');
 }
});

test('displayed class defense is already applied by real incoming-damage rules with no learned skill',()=>{
 for(const classId of Object.keys(CLASSES)){
  const hero=createCharacter({classId}),spec=combatSpec(classId),guard=getPassiveSkills(classId)[0];
  assert.ok(guard.description.includes(String(spec.defense)));assert.ok(guard.description.includes(String(spec.magicDefense)));
  assert.deepEqual(hero.learnedSkills,{});assert.deepEqual(normalizeSkillSlots(hero),[null,null,null,null]);
  const system={hero,buffs:{},safe:()=>false,label:()=>{},onChange:()=>{}};
  for(const magic of [false,true]){
   hero.hp=hero.maxHp;const expected=calculateDamage({attack:80,defense:magic?Math.round(hero.stats.intelligence*.4+spec.magicDefense):derivedAttributes(hero).defense+spec.defense});
   MonsterSystem.prototype.hurtHero.call(system,80,100,magic);
   assert.equal(hero.maxHp-hero.hp,expected,'automatic defenses must match existing combat, without new modifiers');
  }
 }
});

test('all six class passive entries and their tabs have complete RU/EN/ES text and existing icons',()=>{
 const ids=new Set();
 for(const classId of Object.keys(CLASSES)){
  for(const language of ['ru','en','es']){
   for(const passive of getPassiveSkills(classId,language)){
    assert.ok(passive.name.length>3);assert.ok(passive.description.length>20);assert.match(passive.iconSvg,/<svg/);
    if(language!=='ru')assert.doesNotMatch(passive.name+passive.description,/[А-Яа-яЁё]/);
    if(language==='ru'){assert.equal(ids.has(passive.id),false);ids.add(passive.id);}
   }
   assert.notEqual(skillPanelText('active',language),skillPanelText('passive',language));
  }
 }
 assert.equal(ids.size,12);
});
