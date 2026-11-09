// Run with: node --test tests/save.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
const store=new Map();
globalThis.localStorage={getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,value),removeItem:key=>store.delete(key)};
const {Save}=await import('../js/systems/save.js');
test('three slots are independent',()=>{Save.write({x:101,y:102,level:3},1);Save.write({x:201,y:202,level:5},2);assert.equal(Save.load(1).x,101);assert.equal(Save.load(2).x,201);assert.equal(Save.list().length,3);});
test('invalid positions cannot overwrite a save',()=>{assert.equal(Save.write({x:NaN,y:5},1),false);assert.equal(Save.load(1).x,101);});
test('exports and imports complete data',()=>{const data=Save.export(1);assert.equal(Save.import(data,3),true);assert.equal(Save.load(3).level,3);});
test('migrates previous save format',()=>{store.clear();store.set('auralis_save_v1',JSON.stringify({version:1,x:333,y:444,level:7}));assert.equal(Save.load(1).x,333);assert.equal(Save.load(1).level,7);});
test('rejects unknown save slots',()=>assert.throws(()=>Save.setSlot(4),RangeError));
