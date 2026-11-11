import test from 'node:test';import assert from 'node:assert/strict';
import {AttackCycle,attackIntervalMs,swingPose,SWORD_SWINGS} from '../js/combat/attackTiming.js';
test('level one sword attack takes 1.25 seconds',()=>{assert.equal(attackIntervalMs({level:1,stats:{agility:5}}),1250);});
test('attack speed grows gradually with levels and agility',()=>{const low=attackIntervalMs({level:1,stats:{agility:5}});const high=attackIntervalMs({level:35,stats:{agility:25}});assert.ok(high<low);assert.ok(high>=480);});
test('holding attack creates repeated attacks and one impact each',()=>{const a=new AttackCycle(),hero={level:1,stats:{agility:5}};assert.equal(a.start(100,hero),true);assert.equal(a.start(500,hero),false);assert.equal(a.state(900).impact,true);assert.equal(a.state(910).impact,false);assert.equal(a.start(1350,hero),true);assert.equal(a.state(2150).impact,false);assert.equal(a.state(2163).impact,true);assert.equal(a.state(2170).impact,false);});
test('four distinct swing arcs are finite',()=>{assert.equal(SWORD_SWINGS.length,4);const arcs=SWORD_SWINGS.map((_,i)=>swingPose(.5,i).arc);assert.equal(new Set(arcs.map(x=>x.toFixed(2))).size,4);});
