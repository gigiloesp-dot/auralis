import test from 'node:test';
import assert from 'node:assert/strict';
import {rollMonsterLoot,rollLoot,NORMAL_EQUIPMENT_RATES,MATERIAL_DROP_RATES} from '../js/monsters/loot.js';
import {createCharacter} from '../js/characters/Character.js';
import {itemDefinition} from '../js/equipment/items.js';
import {monsterKind} from '../js/monsters/monsters.js';
const sequence=(values,rest=.99)=>()=>values.shift()??rest;
const boss=(bossType,level=42)=>({boss:true,bossType,level,loot:'guardian'});
const counts=items=>Object.fromEntries(['common','uncommon','rare','epic','legendary'].map(r=>[r,items.filter(i=>i.rarity===r).length]));
test('normal equipment has exact independent-from-material rates and luck cannot increase equipment odds',()=>{
 assert.deepEqual(NORMAL_EQUIPMENT_RATES,{common:.008,uncommon:.003,rare:.001,epic:.0001,legendary:0});
 const h=createCharacter({level:1,classId:'mage'});h.stats.luck=10000;
 for(const [low,high,rarity]of [[0,.0001,'epic'],[.0001,.0011,'rare'],[.0011,.0041,'uncommon'],[.0041,.0121,'common']])for(const r of [low+1e-12,high-1e-12]){const items=rollLoot(h,{type:'other',level:20},sequence([r,0,0]));assert.equal(items.length,1);assert.equal(items[0].rarity,rarity);}
 assert.deepEqual(rollLoot(h,{type:'other',level:20},()=>.01210001),[]);assert.deepEqual(h.inventory,[]);
});
test('material bases are halved while rarity and independent equipment checks survive',()=>{
 assert.deepEqual(MATERIAL_DROP_RATES,{wolfFang:.175,wolfPelt:.10});const h=createCharacter({level:1});
 assert.deepEqual(rollLoot(h,{type:'wolf'},sequence([.175,.10,.99])),[],'exact material boundaries miss');
 assert.deepEqual(rollLoot(h,{type:'wolf'},sequence([.174999,.99,.10,.99])).map(i=>i.id),['wolfFang']);
 assert.deepEqual(rollLoot(h,{type:'wolf'},sequence([.175,.099999,.99,.99])).map(i=>i.id),['wolfPelt']);
 assert.deepEqual(rollLoot(h,{type:'wolf'},()=>0).map(i=>i.id),['wolfFang','wolfPelt','weapon_warrior_0']);
});
test('all successful world-boss rarity groups survive and quantities cover both endpoints',()=>{
 const h=createCharacter({classId:'mage',level:42}),before=JSON.stringify(h);
 for(const [rest,expected]of [[0,{common:3,uncommon:2,rare:1,epic:1,legendary:1}],[.999999,{common:5,uncommon:3,rare:2,epic:1,legendary:1}]]){const items=rollMonsterLoot(h,boss('world'),sequence([.199999,.029999,.006999,.000999,.000099],rest));assert.deepEqual(counts(items),expected);assert.ok(items.every(i=>i.quantity===1&&itemDefinition(i)));}
 assert.equal(JSON.stringify(h),before,'rolls never insert rewards or change the character');
});
test('boss rarity checks are independent, exact at boundaries and can all fail',()=>{
 const h=createCharacter({level:42});assert.deepEqual(rollMonsterLoot(h,boss('world'),sequence([.20,.03,.007,.001,.0001])),[]);
 for(const [position,rarity]of ['common','uncommon','rare','epic','legendary'].entries()){const rolls=Array(5).fill(.99);rolls[position]=0;const items=rollMonsterLoot(h,boss('world'),sequence(rolls,0));assert.ok(items.length>0);assert.ok(items.every(i=>i.rarity===rarity),'a miss in another rarity must not override '+rarity);}
});
test('green and higher multi-item groups use distinct real class weapons',()=>{
 const h=createCharacter({classId:'assassin',level:42}),items=rollMonsterLoot(h,boss('world'),sequence([.99,0,0,.99,.99],.999999));
 for(const r of ['uncommon','rare']){const group=items.filter(i=>i.rarity===r);assert.ok(group.length>=2);assert.ok(group.every(i=>itemDefinition(i).slot==='weapon'));assert.equal(new Set(group.map(i=>itemDefinition(i).allowedClasses[0])).size,group.length);}
});
test('legendary equipment is world-only, not miniboss, dungeon, arena or ordinary/elite',()=>{
 const h=createCharacter({level:42});for(const type of ['mini','dungeon','arena']){const items=rollMonsterLoot(h,boss(type),()=>0);assert.ok(items.length);assert.ok(items.every(i=>i.rarity!=='legendary'));}
 assert.equal(rollMonsterLoot(h,boss('world',1),sequence([.99,.99,.99,.99,0],0))[0].rarity,'legendary','world source has no invented level35 restriction');
 for(const bossType of ['mini','world','dungeon','arena'])assert.ok(rollMonsterLoot(h,{...boss(bossType),boss:false},()=>0).every(i=>i.rarity!=='legendary'));
 assert.ok(rollLoot(h,{type:'wolf',elite:true,boss:true},()=>0).every(i=>i.rarity!=='legendary'));
});
test('all actual equipment tiers remain within enemy level +/-5 for all levels, slots and classes',()=>{
 for(const classId of ['warrior','archer','mage','paladin','assassin','cannoneer'])for(let level=1;level<=42;level++)for(let slot=0;slot<9;slot++){
  const h=createCharacter({classId,level:1}),items=rollLoot(h,{type:'other',level},sequence([0,(slot+.1)/9,.999999]));assert.equal(items.length,1);const def=itemDefinition(items[0]);assert.ok(def&&def.level>=Math.max(1,level-5)&&def.level<=Math.min(42,level+5),JSON.stringify({classId,level,item:items[0],def}));assert.ok(!def.allowedClasses||def.allowedClasses.includes(classId));
 }
 const h=createCharacter({level:1});assert.ok(itemDefinition(rollMonsterLoot(h,boss('dungeon',42),sequence([.99,.4,0,0]))[0]).level>=37,'enemy level is never capped to hero level');
});
test('full bags retain source rolls and dungeon/arena keep guaranteed compatible source rewards',()=>{
 const hero=createCharacter({classId:'archer',level:42}),items=rollMonsterLoot(hero,boss('dungeon'),sequence([.99,.4,.75,0]));assert.equal(items.length,1);assert.equal(items[0].rarity,'rare');assert.equal(itemDefinition(items[0]).slot,'weapon');assert.deepEqual(itemDefinition(items[0]).allowedClasses,['archer']);
 const full=createCharacter({level:42,inventory:Array.from({length:60},()=>({id:'rustySword',rarity:'common'}))}),before=JSON.stringify(full.inventory);assert.ok(rollMonsterLoot(full,boss('world'),()=>0).length>0);assert.equal(JSON.stringify(full.inventory),before);
 assert.equal(rollMonsterLoot(hero,boss('arena'),sequence([.99,.5,0,0]))[0].rarity,'rare');
});
test('real monster descriptors preserve boss source for runtime selection',()=>{
 for(const bossType of ['mini','world','dungeon','arena'])assert.equal(monsterKind({type:'forestRaider',level:42,bossType}).bossType,bossType);
});
