import test from 'node:test';
import assert from 'node:assert/strict';
import {MonsterSystem} from '../js/monsters/MonsterSystem.js';
import {createCharacter} from '../js/characters/Character.js';

function setup(classId,rank=5,extra={}){
 const node=()=>{
  const n={destroyed:false};
  for(const method of ['setDepth','setOrigin','setScale','setPosition','setVisible','setRotation','add'])n[method]=()=>n;
  n.destroy=()=>{n.destroyed=true;};return n;
 };
 const hero=createCharacter({classId,region:'test',x:2000,y:2000,level:42,learnedSkills:Object.fromEntries(Array.from({length:5},(_,i)=>[classId+'_'+i,rank]))});
 const scene={axis:{x:0,y:0},obstacles:[],add:Object.fromEntries(['ellipse','container','triangle','circle','rectangle','text'].map(k=>[k,node])),tweens:{add(){}},...extra};
 const content={id:'test',towns:[],bosses:[],camps:[{id:'test-camp',spawns:[{id:'target',type:'forestWolf',x:2045,y:2000,level:1}]}]};
 const system=new MonsterSystem(scene,hero,()=>{},content),target=system.monsters[0];target.hp=target.maxHp=100000;
 return {hero,scene,system,target};
}

test('archer trap waits for a visible entrant, damages once and prevents movement until root expires',()=>{
 const {scene,system,target}=setup('archer');
 assert.equal(system.useSkill('archer_1',100).ok,true);
 const trap=system.traps[0];target.x=trap.x+100;
 system.update(200,0);assert.equal(target.hp,target.maxHp);assert.equal(system.traps.length,1);
 target.x=trap.x+30;scene.obstacles=[{x:trap.x+15,y:trap.y,r:5}];
 system.update(300,0);assert.equal(target.hp,target.maxHp,'obstacles prevent triggering through a wall');
 scene.obstacles=[];system.update(400,0);
 assert.ok(target.hp<target.maxHp);assert.equal(target.rootUntil,8400);assert.equal(system.traps.length,0);assert.equal(trap.body.destroyed,true);
 const hp=target.hp,x=target.x;system.update(500,1);
 assert.equal(target.hp,hp,'a consumed trap cannot trigger twice');assert.equal(target.x,x,'root prevents pursuit');
 system.update(8401,.1);assert.ok(target.x<x,'pursuit resumes after the root expires');system.destroy();
});

test('expired traps never hit an enemy entering on the expiry tick and scene teardown removes armed traps',()=>{
 const {system,target}=setup('archer');assert.equal(system.useSkill('archer_1',100).ok,true);
 const trap=system.traps[0];system.update(trap.until,0);
 assert.equal(target.hp,target.maxHp);assert.equal(target.rootUntil,undefined);assert.equal(system.traps.length,0);assert.equal(trap.body.destroyed,true);
 assert.equal(system.useSkill('archer_1',13000).ok,true);const armed=system.traps[0];system.destroy();assert.equal(armed.body.destroyed,true);assert.equal(system.traps.length,0);
});

test('paladin faith guard consumes three rank-five blocks then takes reduced damage, with no blocks after expiry',()=>{
 const {hero,system}=setup('paladin');assert.equal(system.useSkill('paladin_1',100).ok,true);
 const hp=hero.hp;assert.equal(system.buffs.guardCharges,3);
 for(let i=0;i<3;i++){system.hurtHero(100,200+i);assert.equal(hero.hp,hp);assert.equal(system.buffs.guardCharges,2-i);}
 system.hurtHero(100,300);assert.ok(hero.hp<hp,'the fourth hit is not completely blocked');
 const guardedDamage=hp-hero.hp;hero.hp=hp;system.buffs.guardCharges=1;system.hurtHero(100,system.buffs.guard);
 assert.ok(hp-hero.hp>guardedDamage);assert.equal(system.buffs.guardCharges,1,'expired blocks cannot be consumed');system.destroy();
});

test('paladin aura heals and damages in one-second ticks, respects walls and stops at expiry',()=>{
 const {hero,scene,system,target}=setup('paladin');hero.hp=Math.floor(hero.maxHp/2);
 assert.equal(system.useSkill('paladin_3',100).ok,true);
 const hp=hero.hp;system.update(1099,0);assert.equal(hero.hp,hp);assert.equal(target.hp,target.maxHp);
 system.update(1100,0);assert.ok(hero.hp>hp);assert.ok(target.hp<target.maxHp);
 const healed=hero.hp,damaged=target.hp;system.update(1500,0);assert.equal(hero.hp,healed);assert.equal(target.hp,damaged);
 scene.obstacles=[{x:2020,y:2000,r:6}];system.update(2100,0);assert.ok(hero.hp>healed);assert.equal(target.hp,damaged,'aura damage cannot pass through walls');
 const beforeExpiry=hero.hp;system.update(system.buffs.aura,0);assert.equal(hero.hp,beforeExpiry);assert.equal(target.hp,damaged);system.destroy();
});

test('warrior guard retaliates against nearby visible enemies and cannoneer guard slows them',()=>{
 for(const classId of ['warrior','cannoneer']){
  const {hero,scene,system,target}=setup(classId);assert.equal(system.useSkill(classId+'_1',100).ok,true);
  system.hurtHero(40,200);assert.ok(hero.hp<hero.maxHp);
  if(classId==='warrior')assert.ok(target.hp<target.maxHp);else assert.equal(target.slowUntil,1400);
  const hp=target.hp,slow=target.slowUntil;scene.obstacles=[{x:2020,y:2000,r:6}];system.hurtHero(40,300);
  assert.equal(target.hp,hp,'retaliation respects walls');assert.equal(target.slowUntil,slow,'slow respects walls');
  scene.obstacles=[];target.x=hero.x+100;system.hurtHero(40,400);assert.equal(target.hp,hp);assert.equal(target.slowUntil,slow,'guard response has a short radius');system.destroy();
 }
});

test('assassin execution consumes remaining poison damage exactly once',()=>{
 const poisoned=setup('assassin'),plain=setup('assassin');
 poisoned.target.poison={damage:15,next:1100,until:5100};
 for(const {system} of [poisoned,plain])assert.equal(system.useSkill('assassin_4',100).ok,true);
 assert.equal(plain.target.hp-poisoned.target.hp,75);assert.equal(poisoned.target.poison,null);
 const hp=poisoned.target.hp;poisoned.system.update(1100,0);assert.equal(poisoned.target.hp,hp,'consumed poison cannot tick again');
 poisoned.system.destroy();plain.system.destroy();
});

test('warrior armor break increases subsequent physical damage only until its expiry',()=>{
 const {system,target}=setup('warrior');target.kind={...target.kind,defense:100};
 assert.equal(system.useSkill('warrior_0',100).ok,true);assert.equal(target.armorBreakUntil,8100);
 const before=target.hp;system.now=200;system.strike(target,200,1,true,false);const broken=before-target.hp;
 const next=target.hp;system.now=8100;system.strike(target,8100,1,true,false);assert.ok(broken>next-target.hp);system.destroy();
});

test('saving paused combat cooldowns restores remaining simulation time on a new scene clock',()=>{
 const {hero,system}=setup('warrior',5,{playNow:50000});
 assert.equal(system.useSkill('warrior_1',50100).ok,true);
 const remaining=system.skillRemaining('warrior_1',52100);system.persistCooldowns(52100);system.destroy();
 const node=()=>{const n={};for(const key of ['setDepth','setOrigin','setScale','setPosition','setVisible','setRotation','add','destroy'])n[key]=()=>n;return n;};
 const scene={playNow:90000,add:Object.fromEntries(['ellipse','container','triangle','circle','rectangle','text'].map(k=>[k,node])),tweens:{add(){}}};
 const restored=new MonsterSystem(scene,createCharacter(JSON.parse(JSON.stringify(hero))),()=>{},{id:'test',towns:[],bosses:[],camps:[]});
 assert.ok(Math.abs(restored.skillRemaining('warrior_1',90000)-remaining)<.1);assert.equal(restored.useSkill('warrior_1',90000).reason,'cooldown');restored.destroy();
});


test('incoming hits cannot retaliate or slow enemies before guard is activated or after expiry',()=>{
 for(const classId of ['warrior','cannoneer']){
  const {hero,system,target}=setup(classId),hp=target.hp;system.hurtHero(40,100);assert.ok(hero.hp<hero.maxHp);assert.equal(target.hp,hp,'unactivated guard does not retaliate');assert.equal(target.slowUntil,undefined,'unactivated armor does not slow');
  assert.ok(system.useSkill(classId+'_1',200).ok);system.hurtHero(40,300);const guardedHp=target.hp,slow=target.slowUntil;system.hurtHero(40,system.buffs.guard);assert.equal(target.hp,guardedHp,'expired guard cannot retaliate');assert.equal(target.slowUntil,slow,'expired armor cannot slow');system.destroy();
 }
});
