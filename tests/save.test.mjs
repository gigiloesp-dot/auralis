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
test('deleted migrated character does not reappear from retained legacy backup',()=>{store.clear();store.set('auralis_save_v1',JSON.stringify({version:1,x:333,y:444,level:7}));assert.equal(Save.load(1).level,7);assert.equal(Save.delete(1),true);assert.equal(Save.load(1),null);assert.ok(store.has('auralis_save_v1'));});
test('explicit scene slot cannot write into a subsequently selected character slot',()=>{store.clear();Save.setSlot(1);const sceneSlot=Save.activeSlot;Save.write({x:1,y:2},sceneSlot);Save.setSlot(2);Save.write({x:10,y:20});Save.write({x:3,y:4},sceneSlot);assert.equal(Save.load(1).x,3);assert.equal(Save.load(2).x,10);});
test('storage failures leave load and write safe',()=>{const original=localStorage.setItem;localStorage.setItem=()=>{throw new Error('quota');};assert.equal(Save.write({x:1,y:2}),false);localStorage.setItem=original;});
test('pre-update raw save including unknown items stays available as a backup',()=>{store.clear();const raw=JSON.stringify({version:2,x:5,y:6,inventory:[{id:'retired_artifact',quantity:4}],unknownFutureField:{value:9}});store.set(Save.key(1),raw);const loaded=Save.load(1);Save.write({...loaded,inventory:[]},1);assert.equal(Save.exportBackup(1),raw);assert.equal(Save.load(1).inventory.length,0);});
test('gold and potion counts survive save and reload without granting consumed potions',()=>{store.clear();Save.write({x:3,y:4,gold:41,potions:{hp:0,mp:2}},1);const restored=Save.load(1);assert.equal(restored.gold,41);assert.deepEqual(restored.potions,{hp:0,mp:2});Save.write(restored,1);assert.deepEqual(Save.load(1).potions,{hp:0,mp:2});});
test('missing potion fields migrate to starter counts and negative counts are rejected',()=>{store.clear();Save.write({x:3,y:4},1);assert.deepEqual(Save.load(1).potions,{hp:3,mp:3});Save.write({x:3,y:4,gold:-20,potions:{hp:-10,mp:Infinity}},1);assert.equal(Save.load(1).gold,0);assert.deepEqual(Save.load(1).potions,{hp:0,mp:3});});
test('full storage does not hide an existing character when backup cannot be written',()=>{store.clear();store.set(Save.key(1),JSON.stringify({version:2,x:11,y:12}));const original=localStorage.setItem;localStorage.setItem=()=>{throw new Error('quota');};assert.equal(Save.load(1).x,11);localStorage.setItem=original;});
