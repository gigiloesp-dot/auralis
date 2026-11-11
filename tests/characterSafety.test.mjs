import test from 'node:test';
import assert from 'node:assert/strict';
import {createCharacter} from '../js/characters/Character.js';
test('character restores finite stats and clamps saved resources',()=>{
 const hero=createCharacter({classId:'missing',level:Infinity,hp:1e9,mp:-4,stats:{endurance:NaN,intelligence:Infinity,strength:'bad'}});
 assert.equal(hero.classId,'warrior');assert.equal(hero.level,1);assert.equal(hero.hp,hero.maxHp);assert.equal(hero.mp,0);assert.equal(hero.stats.strength,5);assert.equal(Number.isFinite(hero.maxHp),true);
});
test('fresh higher level character starts with its full resources',()=>{const hero=createCharacter({level:10});assert.equal(hero.hp,hero.maxHp);assert.equal(hero.mp,hero.maxMp);});
test('starter potions migrate once and depleted potion counts are preserved',()=>{assert.deepEqual(createCharacter().potions,{hp:3,mp:3});assert.deepEqual(createCharacter({potions:{hp:0,mp:1},gold:37}).potions,{hp:0,mp:1});assert.equal(createCharacter({gold:37}).gold,37);});
