import test from 'node:test';
import assert from 'node:assert/strict';
import {MonsterSystem} from '../js/monsters/MonsterSystem.js';
import {MONSTER_CAMPS,MONSTER_TYPES,clearDashPosition} from '../js/monsters/monsters.js';
import {createCharacter} from '../js/characters/Character.js';
import {acceptQuest,questProgress} from '../js/quests/quests.js';
import {rollMonsterLoot} from '../js/monsters/loot.js';
function setup(){
 const node=()=>{const o={visible:true};for(const method of ['setDepth','setOrigin','setScale','add','removeAll','destroy'])o[method]=()=>o;o.setPosition=(x,y)=>{o.x=x;o.y=y;return o;};o.setVisible=v=>{o.visible=v;return o;};return o;};
 const scene={add:Object.fromEntries(['ellipse','container','triangle','circle','rectangle','text'].map(k=>[k,node])),tweens:{add:()=>{}}};
 const hero=createCharacter({x:1200,y:1200,level:10,hp:200,mp:100});return {hero,system:new MonsterSystem(scene,hero,()=>{})};
}
test('forest has preserved wolves, two distinct camps and one stronger miniboss',()=>{
 assert.equal(MONSTER_CAMPS[0].points.length,8);assert.equal(MONSTER_CAMPS.filter(c=>MONSTER_TYPES[c.type].boss).length,1);
 assert.equal(new Set(MONSTER_CAMPS.map(c=>c.type)).size,4);assert.ok(MONSTER_TYPES.forestGuardian.hp>MONSTER_TYPES.forestWolf.hp*10);
 for(const camp of MONSTER_CAMPS)for(const [x,y] of camp.points)assert.ok(x>0&&x<2400&&y>0&&y<2400);
});
test('distant monsters hide and stop AI, reactivate near the player',()=>{
 const {hero,system}=setup(),boss=system.monsters.find(m=>m.kind.boss),x=boss.x;
 system.update(8000,1);assert.equal(boss.active,false);assert.equal(boss.body.visible,false);assert.equal(boss.x,x);assert.equal(boss.windup,null);
 hero.x=boss.x+150;hero.y=boss.y;system.update(8100,.01);assert.equal(boss.active,true);assert.equal(boss.body.visible,true);assert.ok(boss.windup);
});
test('miniboss telegraphs a fixed location, permits dodging and damages players who remain',()=>{
 const {hero,system}=setup(),boss=system.monsters.find(m=>m.kind.boss);hero.x=boss.x+150;hero.y=boss.y;
 system.update(8000,.01);const hp=hero.hp,warning=boss.windup;assert.equal(warning.at,9200);assert.equal(hero.hp,hp);
 hero.x+=120;system.update(9201,.01);assert.equal(hero.hp,hp);assert.equal(boss.windup,null);
 hero.x=boss.x+150;hero.y=boss.y;system.update(15000,.01);system.update(16201,.01);assert.ok(hero.hp<hp);
});
test('non-wolf kills do not advance wolf quest and rewards happen once',()=>{
 const {hero,system}=setup();acceptQuest(hero);const boar=system.monsters.find(m=>m.type==='wildBoar');
 system.hit(boar,999,100);assert.equal(questProgress(hero).progress,0);assert.equal(hero.gold,4);
 system.hit(boar,999,101);assert.equal(hero.gold,4);
 const wolf=system.monsters[0];system.hit(wolf,999,102);assert.equal(questProgress(hero).progress,1);assert.equal(hero.gold,6);
});
test('guardian guarantees rare class equipment even when ordinary loot roll misses',()=>{
 const hero=createCharacter({classId:'mage',level:5});const drops=rollMonsterLoot(hero,MONSTER_TYPES.forestGuardian,()=>.99);
 assert.equal(drops.length,1);assert.equal(drops[0].rarity,'rare');assert.equal(hero.inventory.length,0,'reward stays on ground until picked up');
});
test('dash sweep stops before obstacles, handles coincident targets and reaches clear destination',()=>{
 const start={x:100,y:100},target={x:300,y:100};
 const blocked=clearDashPosition(start,target,[{x:175,y:100,r:20}]);assert.ok(blocked.x<=143);assert.equal(blocked.y,100);
 assert.deepEqual(clearDashPosition(start,start),start);assert.deepEqual(clearDashPosition(start,target),{x:245,y:100});
});
