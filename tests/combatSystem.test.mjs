import test from 'node:test';
import assert from 'node:assert/strict';
import {MonsterSystem} from '../js/monsters/MonsterSystem.js';
import {createCharacter} from '../js/characters/Character.js';
import {acceptQuest,questProgress} from '../js/quests/quests.js';
function setup(classId='warrior'){
 const node=()=>{const o={x:0,y:0};for(const method of ['setDepth','setOrigin','setPosition','setVisible','setScale','add','destroy'])o[method]=()=>o;return o;};
 const scene={add:Object.fromEntries(['ellipse','container','triangle','circle','rectangle','text'].map(k=>[k,node])),tweens:{add:()=>{}}};
 const hero=createCharacter({classId,x:1370,y:1240,level:42,mp:100,hp:100,learnedSkills:{[classId+'_0']:1,[classId+'_1']:1,[classId+'_2']:1}});
 const system=new MonsterSystem(scene,hero,()=>{});for(const m of system.monsters.slice(1))m.alive=false;
 return {system,hero,target:system.monsters[0]};
}
test('invalid target casts preserve resources and cooldown, valid cast spends exactly once',()=>{
 const {system,hero,target}=setup('warrior');target.x=hero.x+1000;
 assert.equal(system.useSkill('warrior_0',100).reason,'target');assert.equal(hero.mp,100);assert.equal(system.skillRemaining('warrior_0',100),0);
 target.x=hero.x+30;assert.equal(system.useSkill('warrior_0',100).ok,true);assert.equal(hero.mp,92);assert.equal(system.skillRemaining('warrior_0',100),5);
 assert.equal(system.useSkill('warrior_0',101).reason,'cooldown');assert.equal(hero.mp,92);
});
test('ranged attack hits only after projectile travel and awards quest kill once',()=>{
 const {system,hero,target}=setup('mage');acceptQuest(hero);target.x=hero.x+200;
 system.strike(target,100,10);assert.equal(target.hp,30);assert.equal(system.projectiles.length,1);
 system.update(200,.1);assert.equal(target.hp,30);system.update(900,1);assert.equal(target.alive,false);assert.equal(system.projectiles.length,0);
 assert.equal(questProgress(hero).progress,1);system.hit(target,100,1000);assert.equal(questProgress(hero).progress,1);
});
test('safe town blocks nearby enemy damage and regeneration respects combat and death',()=>{
 const {system,hero,target}=setup();hero.x=1030;hero.y=1140;target.x=hero.x;target.y=hero.y;target.homeX=hero.x;target.homeY=hero.y;
 hero.hp=50;hero.mp=50;system.lastCombat=5000;system.update(6000,.04);assert.equal(hero.hp,50);
 system.update(11001,.04);assert.ok(hero.hp>50);assert.ok(hero.mp>50);
 hero.hp=0;system.update(13000,.04);assert.equal(hero.hp,0);
});
