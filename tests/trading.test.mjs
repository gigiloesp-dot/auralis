import test from 'node:test';
import assert from 'node:assert/strict';
import {buyPotion,sellMaterial,materialPrice} from '../js/systems/trading.js';
test('buy potion spends actual gold and increments only chosen potion',()=>{
 const h={gold:20,potions:{hp:0,mp:3}};assert.equal(buyPotion(h,'hp').ok,true);assert.deepEqual(h,{gold:10,potions:{hp:1,mp:3}});
 assert.equal(buyPotion(h,'mp').ok,true);assert.equal(h.gold,0);assert.equal(buyPotion(h,'hp').reason,'funds');assert.equal(h.potions.hp,1);
});
test('merchant rejects invalid currency, invalid resource and capped potion stack',()=>{
 const h={gold:100,potions:{hp:99,mp:0}};assert.equal(buyPotion(h,'hp').reason,'limit');assert.equal(h.gold,100);assert.equal(buyPotion(h,'xp').reason,'invalid');h.gold=Infinity;assert.equal(buyPotion(h,'mp').ok,false);
});
test('selling actual material quantities earns rarity value and removes depleted stack',()=>{
 const h={gold:0,inventory:[{id:'wolfFang',rarity:'rare',quantity:3},{id:'ironSword'}]};assert.equal(materialPrice(h.inventory[0]),4);
 assert.deepEqual(sellMaterial(h,0,2),{ok:true,gold:8});assert.equal(h.gold,8);assert.equal(h.inventory[0].quantity,1);assert.equal(sellMaterial(h,0,1).ok,true);assert.equal(h.inventory.length,1);assert.equal(h.gold,12);
 assert.equal(sellMaterial(h,0,1).ok,false);assert.equal(h.gold,12);
});
test('invalid sale never mutates inventory or gold',()=>{
 const h={gold:3,inventory:[{id:'wolfPelt',quantity:2}]},before=JSON.stringify(h);
 for(const [index,quantity] of [[0,3],[0,-1],[0,.5],[-1,1],[9,1]])assert.equal(sellMaterial(h,index,quantity).ok,false);assert.equal(JSON.stringify(h),before);
});
