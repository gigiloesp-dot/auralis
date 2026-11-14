import test from 'node:test';
import assert from 'node:assert/strict';
import {createCharacter} from '../js/characters/Character.js';
import {Save} from '../js/systems/save.js';
import {rollMonsterLoot,rollLoot} from '../js/monsters/loot.js';
import {createGroundDrops,groundLootState,normalizeGroundLoot,lootCategory,pickupGroundDrop,materializeGroundDrops,LOOT_PICKUP_RADIUS} from '../js/loot/groundLoot.js';
import {project} from '../js/world/projection.js';
import {GroundLootSystem} from '../js/loot/GroundLootSystem.js';
const hero=extra=>createCharacter({x:1000,y:1000,...extra});
const corpse=(i=0)=>({id:'mob-'+i,key:'forest:mob-'+i,x:1000,y:1000});
const sword={id:'rustySword',rarity:'rare',quantity:1};
function drop(h,items=[sword],i=0){return createGroundDrops(h,corpse(i),items,1000+i);}
function memoryStorage(){const values=new Map();globalThis.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)};return values;}

test('loot rolls preserve independent material/equipment checks without touching the character',()=>{
 const h=hero(),before=JSON.stringify(h),items=rollMonsterLoot(h,{loot:'wolf',level:1},()=>0);
 assert.equal(items.length,3);assert.deepEqual(items.map(i=>i.id),['wolfFang','wolfPelt','weapon_warrior_0']);assert.ok(items.every(i=>i.rarity==='epic'));assert.equal(JSON.stringify(h),before);
 const sequence=(...values)=>()=>values.shift()??.99;
 for(const [r,rarity]of [[0,'epic'],[.005,'rare'],[.02,'uncommon'],[.1,'common']])assert.equal(rollLoot(h,{type:'other',level:1},sequence(r,0,0))[0].rarity,rarity);
 assert.deepEqual(rollLoot(h,{type:'other',level:1},()=>.99),[]);
});
test('weapon and armor families share anonymous silhouettes, remaining items use wooden chests',()=>{
 for(const id of ['weapon_warrior_0','weapon_archer_0','weapon_mage_0','weapon_assassin_0','weapon_cannoneer_0'])assert.equal(lootCategory({id}),'weapon');
 for(const id of ['helmet_0','chest_0','gloves_0','pants_0','boots_0','shield_1'])assert.equal(lootCategory({id}),'armor');
 for(const id of ['ring_0','amulet_0','wolfFang','wolfPelt'])assert.equal(lootCategory({id}),'chest');
});
test('separate drops never overlap even under the isometric projection or obstacles',()=>{
 const h=hero(),iso=(x,y)=>project(x,y,12000),walkable=(x,y)=>x<1020&&y>930;
 for(let i=0;i<20;i++)assert.equal(createGroundDrops(h,corpse(i),[sword,sword,sword],1000+i,{project:iso,walkable}).ok,true);
 const drops=Object.values(groundLootState(h).drops);assert.equal(drops.length,60);
 for(const [i,a]of drops.entries()){assert.ok(walkable(a.x,a.y));const p=iso(a.x,a.y);for(const b of drops.slice(i+1)){const q=iso(b.x,b.y);assert.ok(Math.hypot(p.x-q.x,p.y-q.y)>=30);assert.ok(Math.abs(p.x-q.x)>=30||Math.abs(p.y-q.y)>=40,'visible icon rectangles must not overlap');}}
});
test('pickup requires same region, living hero and actual distance, and identifies only on success',()=>{
 const h=hero();const [id]=drop(h).ids,d=groundLootState(h).drops[id];assert.deepEqual(h.inventory,[]);
 h.x=d.x+LOOT_PICKUP_RADIUS+1;h.y=d.y;assert.equal(pickupGroundDrop(h,id).reason,'distance');
 h.x=d.x;h.region='north';assert.equal(pickupGroundDrop(h,id).reason,'distance');h.region='forest';h.hp=0;assert.equal(pickupGroundDrop(h,id).reason,'distance');h.hp=1;
 const picked=pickupGroundDrop(h,id);assert.equal(picked.ok,true);assert.deepEqual(picked.item,sword);assert.deepEqual(h.inventory,[sword]);assert.equal(pickupGroundDrop(h,id).reason,'missing');
});
test('full bags and partial stack space leave the entire drop untouched',()=>{
 const h=hero({inventory:[...Array.from({length:59},()=>({...sword})),{id:'wolfFang',rarity:'common',quantity:99}]}),before=JSON.stringify(h.inventory);
 const [id]=drop(h,[{id:'wolfFang',rarity:'common',quantity:3}]).ids;
 assert.equal(pickupGroundDrop(h,id).reason,'full');assert.equal(JSON.stringify(h.inventory),before);assert.equal(groundLootState(h).drops[id].item.quantity,3);
 h.inventory.shift();assert.equal(pickupGroundDrop(h,id).ok,true);assert.equal(h.inventory.filter(i=>i.id==='wolfFang').reduce((n,i)=>n+i.quantity,0),102);
});
test('a failed durable pickup restores inventory and the original anonymous ground item',()=>{
 for(const save of [()=>false,()=>{throw Error('quota');}]){
  const h=hero(),[id]=drop(h).ids,before=JSON.stringify(h.worldState),inventory=h.inventory;
  assert.equal(pickupGroundDrop(h,id,{save}).reason,'save');assert.equal(h.inventory,inventory);assert.equal(JSON.stringify(h.worldState),before);
 }
});
test('death, drops and successful removal survive actual v2 save/reload without duplicate rewards',()=>{
 memoryStorage();const h=hero();h.worldState.monsters={'forest:mob-0':{deadUntil:31000,killedAt:1000}};
 const created=drop(h),id=created.ids[0];assert.equal(Save.write(h,1),true);
 const restored=createCharacter(Save.load(1));assert.deepEqual(restored.worldState.groundLoot,h.worldState.groundLoot);assert.equal(createGroundDrops(restored,corpse(),[sword],1000).reason,'duplicate');
 assert.equal(pickupGroundDrop(restored,id,{save:()=>Save.write(restored,1)}).ok,true);
 const again=createCharacter(Save.load(1));assert.equal(again.inventory.length,1);assert.equal(pickupGroundDrop(again,id).reason,'missing');assert.equal(drop(again).reason,'duplicate');
 assert.equal(createGroundDrops(again,corpse(),[sword],32000).ok,true,'a genuine later respawn is a new kill');assert.equal(Object.keys(groundLootState(again).drops).length,1);
});
test('distant regions and temporary visual unloading do not delete ordinary ground rewards',()=>{
 const h=hero(),[id]=drop(h).ids;h.region='north';h.x=14000;h.y=14000;
 const restored=createCharacter(JSON.parse(JSON.stringify(h)));assert.ok(restored.worldState.groundLoot.drops[id]);restored.region='forest';restored.x=1000;restored.y=1000;assert.equal(pickupGroundDrop(restored,id).ok,true);
});
test('a death with no clear nearby tile persists its rolled items for a later placement retry',()=>{
 const h=hero(),r=createGroundDrops(h,corpse(),[sword],1000,{walkable:()=>false});assert.equal(r.reason,'placement');
 const restored=createCharacter(JSON.parse(JSON.stringify(h))),state=groundLootState(restored),entries=Object.entries(state.pending);assert.equal(entries.length,1);assert.deepEqual(entries[0][1].items,[sword]);assert.equal(drop(restored).reason,'duplicate');
 const placed=materializeGroundDrops(restored,entries[0][1],{walkable:()=>true});assert.equal(placed.ok,true);delete state.pending[entries[0][0]];assert.equal(Object.keys(state.drops).length,1);
});
test('save normalizer rejects runtime objects, invalid positions and invented item definitions',()=>{
 const good=hero();drop(good);const value=JSON.parse(JSON.stringify(good.worldState.groundLoot));value.drops.bad={id:'bad',region:'forest',x:NaN,y:0,item:sword,createdAt:1000};value.drops.fake={id:'fake',region:'forest',x:1,y:1,item:{id:'invented'},createdAt:1000};
 const state=normalizeGroundLoot(value);assert.equal(Object.keys(state.drops).length,1);assert.ok(state.nextId>1);assert.deepEqual(normalizeGroundLoot(null),{nextId:1,drops:{},events:{},pending:{}});
});

test('blocked pending placements have a two-second, single-job, nearby-only retry budget without starving later jobs',()=>{
 const h=hero(),state=groundLootState(h);state.pending={blocked:{region:'forest',x:1000,y:1000,deathAt:1,items:[sword]},empty:{region:'forest',x:1000,y:1000,deathAt:2,items:[]},far:{region:'forest',x:10000,y:10000,deathAt:3,items:[sword]}};
 let checks=0;const scene={playNow:0,project:(x,y)=>({x,y}),world:{isWalkable:()=>{checks++;return false;}},save:()=>true,panelsOpen:()=>false},system=new GroundLootSystem(scene,h);
 system.update(true);const once=checks;assert.ok(once>0&&once<=2400);
 for(let now=150;now<2000;now+=150){scene.playNow=now;system.update(true);}assert.equal(checks,once);
 scene.playNow=2000;system.update(true);assert.equal(state.pending.empty,undefined,'the second job gets its own turn');assert.ok(state.pending.blocked&&state.pending.far);assert.equal(checks,once,'far sources and empty jobs do not perform floor searches');system.destroy();
});
