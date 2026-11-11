import test from 'node:test';
import assert from 'node:assert/strict';
import {generateArenaContent} from '../js/world/arena.js';
import {dungeonFloorContains} from '../js/world/chunkGeometry.js';
import {MonsterSystem} from '../js/monsters/MonsterSystem.js';
import {drawMonster} from '../js/monsters/monsterVisuals.js';
import {createCharacter} from '../js/characters/Character.js';
import {getSkills} from '../js/skills/skillData.js';
function setup(hero,content){const node=()=>{const o={list:[]};for(const key of ['setDepth','setOrigin','setPosition','setVisible','setScale','setRotation','destroy'])o[key]=()=>o;o.add=items=>{o.list.push(...(Array.isArray(items)?items:[items]));return o;};return o;};const scene={axis:{x:0,y:0},add:Object.fromEntries(['ellipse','container','triangle','circle','rectangle','text'].map(k=>[k,node])),tweens:{add(){}}};return {system:new MonsterSystem(scene,hero,()=>{},content),scene,node};}
test('arena is a connected real floor with one level-scaled challenge outside ordinary budgets',()=>{
 for(const level of [1,5,22,42]){const c=generateArenaContent({level});assert.equal(c.id,'arena');assert.equal(c.camps.length,0);assert.equal(c.bosses.length,1);assert.equal(c.bosses[0].level,level);assert.equal(c.bosses[0].patterns.length,3);
 for(let x=c.entry.x;x<=c.bosses[0].x;x+=10)assert.equal(dungeonFloorContains(c,x,600),true);assert.equal(dungeonFloorContains(c,20,600),false);}
});
test('arena kill rewards exactly once and persistent trial state prevents reload farming',()=>{
 const hero=createCharacter({level:5,x:850,y:600,region:'arena'}),content=generateArenaContent(hero),{system}=setup(hero,content),boss=system.monsters[0];
 system.hit(boss,999999,100);const xp=hero.xp,gold=hero.gold;assert.ok(xp>0&&gold>0);system.hit(boss,999999,200);assert.equal(hero.gold,gold);system.destroy();const other=setup(createCharacter(JSON.parse(JSON.stringify(hero))),content);assert.equal(other.system.monsters[0].alive,false);other.system.hit(other.system.monsters[0],999999,300);assert.equal(other.system.hero.xp,xp);
});
test('boss crest adds geometry beyond the matching ordinary silhouette',()=>{
 const {scene,node}=setup(createCharacter());for(const type of ['forestWolf','spider','forestRaider','frostGolem','ancientSentinel']){const normal=node(),boss=node();drawMonster(scene,normal,type,false);drawMonster(scene,boss,type,true);assert.ok(boss.list.length>=normal.list.length+5,type);}
});
test('all thirty runtime skills reject rank0 and rank5 casts consume resources and produce real effects',()=>{
 for(const classId of ['warrior','archer','mage','paladin','assassin','cannoneer'])for(const skill of getSkills(classId)){
  const hero=createCharacter({classId,level:42,x:1370,y:1240}),{system}=setup(hero);const target=system.monsters[0];target.x=hero.x+45;target.hp=target.maxHp=100000;for(const m of system.monsters.slice(1))m.alive=false;
  assert.equal(system.useSkill(skill.id,100).reason,'unlearned');hero.learnedSkills[skill.id]=5;hero.hp=Math.round(hero.maxHp*.5);hero.mp=hero.maxMp;
  const hp=hero.hp,mp=hero.mp;assert.equal(system.useSkill(skill.id,100).ok,true,skill.id);assert.equal(hero.mp,mp-skill.mana,skill.id);assert.equal(system.skillRemaining(skill.id,100),skill.cooldown,skill.id);
  const effect=target.hp<target.maxHp||hero.hp>hp||system.projectiles.length>0||system.pendingEffects.length>0||Object.keys(system.buffs).length>0;assert.equal(effect,true,skill.id);system.now=2000;system.tickEffects(2000);system.update(2000,.5);system.destroy();
 }
});
