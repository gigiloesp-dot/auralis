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

test('normal equipment merchants never offer epic or legendary, and purchases are transactional',async()=>{
 const {merchantStock,buyEquipment}=await import('../js/systems/trading.js');
 const h={classId:'warrior',level:15,gold:999999,inventory:[]},npc={role:'merchant',minLevel:1,maxLevel:18};
 const stock=merchantStock(h,npc);assert.ok(stock.length>0);assert.ok(stock.every(item=>['common','uncommon','rare'].includes(item.rarity)));
 const offer=stock[0],before=h.gold;assert.equal(buyEquipment(h,npc,offer.offerId).ok,true);assert.equal(h.gold,before-offer.price);assert.deepEqual(h.inventory[0],{id:offer.id,rarity:offer.rarity,quantity:1});
 h.inventory=Array.from({length:60},()=>({id:'rustySword'}));const snapshot=JSON.stringify(h);assert.equal(buyEquipment(h,npc,offer.offerId).reason,'full');assert.equal(JSON.stringify(h),snapshot);
 assert.equal(buyEquipment(h,npc,'forged:legendary').reason,'invalid');assert.equal(JSON.stringify(h),snapshot);
});
test('special merchant has explicit high-cost legendary stock and equipment sale removes only owned item',async()=>{
 const {merchantStock,buyEquipment,sellItem,equipmentPrice}=await import('../js/systems/trading.js');
 const hero={classId:'mage',level:42,gold:9999999,inventory:[]},npc={role:'specialMerchant',minLevel:35,maxLevel:42};
 const offer=merchantStock(hero,npc).find(item=>item.rarity==='legendary');assert.ok(offer);assert.equal(buyEquipment(hero,npc,offer.offerId).ok,true);const price=equipmentPrice(hero.inventory[0]);const oldGold=hero.gold;assert.equal(sellItem(hero,0,1).ok,true);assert.equal(hero.inventory.length,0);assert.equal(hero.gold,oldGold+Math.floor(price*.25));assert.equal(sellItem(hero,0,1).ok,false);
});
