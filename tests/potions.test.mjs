import test from 'node:test';
import assert from 'node:assert/strict';
import {usePotion} from '../js/systems/potions.js';
test('potions restore capped resources, consume once and share cooldown',()=>{const h={hp:50,maxHp:100,mp:80,maxMp:100,potions:{hp:2,mp:1}},state={};assert.equal(usePotion(h,'hp',0,state),true);assert.equal(h.hp,95);assert.equal(h.potions.hp,1);assert.equal(usePotion(h,'mp',2999,state),false);assert.equal(usePotion(h,'mp',3000,state),true);assert.equal(h.mp,100);assert.equal(h.potions.mp,0);});
test('full, empty and dead potion requests leave resources unchanged',()=>{const h={hp:100,maxHp:100,mp:0,maxMp:100,potions:{hp:1,mp:0}};assert.equal(usePotion(h,'hp',0,{}),false);assert.equal(usePotion(h,'mp',0,{}),false);h.hp=0;assert.equal(usePotion(h,'hp',0,{}),false);assert.equal(h.potions.hp,1);});
