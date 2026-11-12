import test from 'node:test';
import assert from 'node:assert/strict';
import {rollMonsterLoot} from '../js/monsters/loot.js';
import {createCharacter} from '../js/characters/Character.js';
import {itemDefinition} from '../js/equipment/items.js';
import {monsterKind} from '../js/monsters/monsters.js';
const sequence=(...values)=>()=>values.shift()??.99;
const boss=(bossType,level=42)=>({boss:true,bossType,level,loot:'guardian'});
test('miniboss, world, dungeon and arena have different real guaranteed reward tables',()=>{
 for(const [type,roll,expected]of [['mini',.2,'rare'],['mini',.05,'epic'],['world',.5,'epic'],['world',.05,'legendary'],['dungeon',.2,'epic'],['dungeon',.01,'legendary'],['arena',0,'rare']]){
  const hero=createCharacter({classId:'mage',level:42}),drops=rollMonsterLoot(hero,boss(type),sequence(.99,roll,.5));
  assert.equal(drops.length,1,type);assert.equal(drops[0].rarity,expected,type);assert.deepEqual(hero.inventory[0],drops[0]);
  const def=itemDefinition(drops[0]);assert.ok(def.level<=hero.level);assert.ok(!def.allowedClasses||def.allowedClasses.includes('mage'));
 }
});
test('legendary boss rewards are gated to level35 and normal monsters never use boss tables',()=>{
 for(const type of ['world','dungeon']){const hero=createCharacter({level:34}),drops=rollMonsterLoot(hero,boss(type,34),sequence(.99,0,0));assert.equal(drops[0].rarity,'epic');}
 for(const type of ['mini','world','dungeon','arena']){const hero=createCharacter({level:42});const drops=rollMonsterLoot(hero,{...boss(type),boss:false},()=>0);assert.ok(drops.every(item=>item.rarity!=='legendary'));}
});
test('boss drops respect inventory capacity and fallback to a compatible class weapon',()=>{
 const hero=createCharacter({classId:'archer',level:42}),drops=rollMonsterLoot(hero,boss('dungeon'),sequence(.99,.4,.75));
 assert.equal(itemDefinition(drops[0]).slot,'weapon');assert.deepEqual(itemDefinition(drops[0]).allowedClasses,['archer']);
 const full=createCharacter({level:42,inventory:Array.from({length:60},()=>({id:'rustySword',rarity:'common'}))}),before=JSON.stringify(full.inventory);
 assert.deepEqual(rollMonsterLoot(full,boss('world'),()=>0),[]);assert.equal(JSON.stringify(full.inventory),before);
});
test('real monster descriptors preserve boss source for runtime loot selection',()=>{
 for(const bossType of ['mini','world','dungeon','arena'])assert.equal(monsterKind({type:'forestRaider',level:42,bossType}).bossType,bossType);
});
