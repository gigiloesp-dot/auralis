import test from 'node:test';import assert from 'node:assert/strict';import {allocateAttribute,maxResources,derivedAttributes} from '../js/systems/attributes.js';
const hero=()=>({level:3,attributePoints:2,stats:{strength:5,endurance:5,agility:5,luck:5,intelligence:5},maxHp:124,maxMp:114,hp:100,mp:100});
test('allocate endurance increases maximum and current health',()=>{const h=hero();assert.equal(allocateAttribute(h,'endurance'),true);assert.equal(h.attributePoints,1);assert.equal(h.maxHp,132);assert.equal(h.hp,108);});
test('cannot spend unavailable points or unknown attribute',()=>{const h=hero();assert.equal(allocateAttribute(h,'invalid'),false);h.attributePoints=0;assert.equal(allocateAttribute(h,'strength'),false);});
test('derived agility and luck have caps',()=>{const h=hero();h.stats.luck=999;h.stats.agility=999;const x=derivedAttributes(h);assert.equal(x.doubleHitChance,33);assert.equal(x.criticalChance,50);});
