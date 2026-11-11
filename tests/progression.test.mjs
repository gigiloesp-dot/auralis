import test from 'node:test';import assert from 'node:assert/strict';
import {grantXp,xpForNextLevel} from '../js/systems/progression.js';
test('XP increases and levels refill HP/MP',()=>{const hero={level:1,xp:0,hp:20,mp:5,skillPoints:0};assert.equal(grantXp(hero,xpForNextLevel(1)),true);assert.equal(hero.level,2);assert.equal(hero.hp,112);assert.equal(hero.mp,107);assert.equal(hero.skillPoints,1);});
test('Invalid XP never changes progression',()=>{const h={level:1,xp:0};assert.equal(grantXp(h,-4),false);assert.equal(h.xp,0);});
