import test from 'node:test';import assert from 'node:assert/strict';import {nearestTarget} from '../js/combat/targeting.js';
test('select nearest living target in range',()=>{const h={x:0,y:0};const a={x:60,y:0,alive:true},b={x:30,y:0,alive:true};assert.equal(nearestTarget(h,[a,b]),b);});
test('ignore dead and out of reach',()=>{assert.equal(nearestTarget({x:0,y:0},[{x:1,y:1,alive:false},{x:120,y:0,alive:true}]),null);});
