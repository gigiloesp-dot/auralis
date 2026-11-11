import test from 'node:test';import assert from 'node:assert/strict';import {insertStack,compactStacks} from '../js/equipment/stacking.js';
const mat={slot:null},gear={slot:'boots'};
test('same rarity materials combine to 100 then next stack',()=>{const a=[];assert.equal(insertStack(a,{id:'fang',rarity:'common',quantity:80},mat).added,80);insertStack(a,{id:'fang',rarity:'common',quantity:40},mat);assert.deepEqual(a.map(x=>x.quantity),[100,20]);});
test('different rarity cannot combine',()=>{const a=[];insertStack(a,{id:'fang',rarity:'common',quantity:2},mat);insertStack(a,{id:'fang',rarity:'rare',quantity:3},mat);assert.equal(a.length,2);});
test('equipment never combines',()=>{const a=[];insertStack(a,{id:'boots',quantity:2},gear);assert.equal(a.length,2);});
test('full inventory accepts existing stack but rejects new slot',()=>{const a=Array.from({length:60},(_,i)=>({id:'mat'+i,quantity:1}));a[0]={id:'fang',rarity:'common',quantity:99};assert.equal(insertStack(a,{id:'fang',rarity:'common',quantity:2},mat).added,1);assert.equal(a[0].quantity,100);});
test('old save material stacks are compacted',()=>{const a=Array.from({length:5},()=>({id:'fang',rarity:'common'}));const b=compactStacks(a,()=>mat);assert.equal(b.length,1);assert.equal(b[0].quantity,5);});
