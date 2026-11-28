import test from 'node:test';
import assert from 'node:assert/strict';
import {MonsterSystem} from '../js/monsters/MonsterSystem.js';
import {monsterKind} from '../js/monsters/monsters.js';
import {movementProfile} from '../js/monsters/movementProfiles.js';
import {createCharacter} from '../js/characters/Character.js';
import {Save} from '../js/systems/save.js';
import {DUNGEONS,enterDungeon,leaveDungeon} from '../js/dungeons/dungeonSystem.js';
import {MONSTER_LEASH_RADIUS,steeringWaypoint} from '../js/monsters/monsterBehavior.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function setup({heroData={},extra={},content=null}={}){
 const node=()=>{const o={visible:true,x:0,y:0};for(const name of ['setDepth','setOrigin','setScale','add','destroy','setRotation'])o[name]=()=>o;o.setVisible=v=>{o.visible=v;return o;};o.setPosition=(x,y)=>{o.x=x;o.y=y;return o;};return o;};
 const scene={playNow:0,axis:{x:0,y:0},obstacles:[],add:Object.fromEntries(['ellipse','container','triangle','circle','rectangle','text'].map(n=>[n,node])),tweens:{add(){}},...extra};
 const hero=createCharacter({classId:'warrior',level:5,region:'test',x:2000,y:2000,...heroData});hero.hp=hero.maxHp=100000;
 content??={id:'test',camps:[{id:'camp',x:2310,y:2000,radius:115,spawns:[{id:'wolf',type:'forestWolf',x:2310,y:2000,level:1}]}],bosses:[],towns:[]};
 const system=new MonsterSystem(scene,hero,()=>{},content);return {scene,hero,system,content};
}
test('damage activates actual pursuit outside detection and cannot kite a creature across the map',()=>{
 const {hero,system}=setup(),m=system.monsters[0];system.update(100,0);assert.notEqual(m.behaviorState,'chase');
 system.hit(m,1,100);system.update(200,.1);assert.equal(m.behaviorState,'chase');assert.ok(m.x<m.homeX);assert.ok(m.aggroUntil>200);
 for(let n=300;n<1200;n+=100)system.update(n,.1);
 hero.x=2950;for(let n=1200;n<13000;n+=100)system.update(n,.1);
 assert.equal(m.returning,false);assert.notEqual(m.behaviorState,'chase');assert.ok(distance(m,{x:m.homeX,y:m.homeY})<115);assert.equal(m.aggroUntil,0);system.destroy();
});
test('pursuit really detours around a blocking trunk, retains species movement and throttles searches',()=>{
 const obstacle={x:2150,y:2000,r:40},{hero,system}=setup({extra:{obstacles:[obstacle]}}),m=system.monsters[0],initial=distance(m,hero),radius=movementProfile(m.kind).collisionRadius;
 system.hit(m,1,100);
 for(let n=200;n<9000;n+=100){system.update(n,.1);assert.ok(distance(m,obstacle)>=obstacle.r+radius-.01,'never tunnel through the trunk');assert.ok(distance(m,{x:m.homeX,y:m.homeY})<=MONSTER_LEASH_RADIUS+.01);}
 assert.ok(distance(m,hero)<initial-160,'the creature must find a route around the obstacle');assert.ok(m.pathSearches>0);assert.ok(m.pathSearches<=Math.ceil(9000/700));assert.equal(m.kind.movementProfile,'predator');system.destroy();
});
test('ordinary creatures patrol irregularly, pause, separate and stay in their camp even when player is safe',()=>{
 const content={id:'test',camps:[{id:'camp',x:2450,y:2000,radius:110,spawns:[{id:'a',type:'forestWolf',x:2450,y:2000,level:1},{id:'b',type:'forestWolf',x:2450,y:2000,level:1}]}],bosses:[],towns:[{region:'test',spawn:{x:2000,y:2000},safeRadius:120}]};
 const {system}=setup({content}),[a,b]=system.monsters;let walking=0,stopped=0,last={x:a.x,y:a.y};
 for(let n=100;n<=16000;n+=100){system.update(n,.1);const d=distance(a,last);if(d>.05)walking++;else stopped++;last={x:a.x,y:a.y};for(const m of [a,b])assert.ok(distance(m,{x:2450,y:2000})<=110.1);}
 assert.ok(walking>20,'idle monsters actually move');assert.ok(stopped>5,'patrols include pauses');assert.ok(distance(a,b)>15,'coincident bodies separate');assert.notEqual(a.behaviorSeed,b.behaviorSeed);assert.equal(a.pathSearches||0,0,'patrol never runs the route search');system.destroy();
});
test('blocked pursuit search stays bounded and is not repeated every frame',()=>{
 const m={id:'blocked',x:0,y:0,homeX:0,homeY:0,kind:{speed:90}},target={x:150,y:0};
 const blocked=()=>false,allowed=()=>false;
 for(let now=0;now<700;now+=10)steeringWaypoint(m,target,now,blocked,allowed);
 assert.equal(m.pathSearches,1);assert.equal(m.pathNodesVisited,1);
 steeringWaypoint(m,target,701,blocked,allowed);assert.equal(m.pathSearches,2);
});
test('world ordinary timer starts at death and safe respawn avoids the hero, blocked floor and other bodies',()=>{
 const original=Date.now;let wall=1000000;Date.now=()=>wall;
 try{
  const {hero,scene,system}=setup(),m=system.monsters[0];assert.equal(m.kind.respawnMs,30000);assert.equal(monsterKind({type:'forestWolf',bossType:'world'}).respawnMs,2400000);
  system.hit(m,9999,100);assert.equal(hero.worldState.monsters[m.key].deadUntil,1030000);hero.x=m.homeX;hero.y=m.homeY;
  wall=1029999;system.update(29999,.1);assert.equal(m.alive,false);
  scene.world={isWalkable:()=>false};wall=1030000;system.update(30000,.1);assert.equal(m.alive,false,'blocked spawn waits rather than appearing inside scenery');
  scene.world.isWalkable=()=>true;wall=1030501;system.update(30501,0);assert.equal(m.alive,true);assert.ok(distance(m,hero)>=movementProfile(m.kind).collisionRadius+44);assert.ok(distance(m,{x:m.homeX,y:m.homeY})<=110);assert.equal(hero.worldState.monsters[m.key],undefined);system.destroy();
 }finally{Date.now=original;}
});
test('position, injury and damage threat survive save/reload with a different scene clock',()=>{
 const {hero,system,content}=setup(),m=system.monsters[0];system.hit(m,4,1000);system.update(1100,.2);system.persistCooldowns(1100);
 const x=m.x,saved=Save.normalize(hero);assert.ok(saved.worldState.monsters[m.key].aggroUntil>Date.now());assert.equal(saved.worldState.monsters[m.key].x,x);
 const restored=setup({heroData:saved,content,extra:{playNow:12000}}),r=restored.system.monsters[0];assert.equal(r.x,x);assert.equal(r.hp,m.hp);assert.ok(r.aggroUntil>12000);restored.system.update(12100,.1);assert.equal(r.behaviorState,'chase');assert.ok(r.x<x);system.destroy();restored.system.destroy();
});
test('actual dungeon minion stays dead through time, unload and reload until a new visit',()=>{
 const original=Date.now;let wall=1000000;Date.now=()=>wall;
 try{
  const d=DUNGEONS[0],hero=createCharacter({level:42,region:d.region,x:d.x,y:d.y}),entry=enterDungeon(hero,d.id,'easy'),desc=entry.content.camps[0].spawns[0];Object.assign(hero,entry.destination,{x:desc.x-50,y:desc.y});
  const initial=setup({heroData:hero,content:entry.content}),m=initial.system.monsters.find(m=>m.id===desc.id);initial.system.hit(m,999999,1000);assert.equal(m.visitKilled,true);assert.ok(initial.hero.dungeonSession.killedMinions.includes(m.id));
  wall+=8*60*60*1000;initial.system.update(2000,.1);assert.equal(m.alive,false);
  initial.hero.x=entry.content.width-20;initial.hero.y=entry.content.height-20;initial.system.update(2100,0);assert.ok(!initial.system.monsters.includes(m));
  const saved=Save.normalize(initial.hero);saved.x=desc.x-50;saved.y=desc.y;const restored=setup({heroData:saved,content:entry.content});assert.equal(restored.system.monsters.find(m=>m.id===desc.id).alive,false);
  const visit=restored.hero.dungeonSession.visitId;leaveDungeon(restored.hero);Object.assign(restored.hero,{region:d.region,x:d.x,y:d.y});const again=enterDungeon(restored.hero,d.id,'easy');Object.assign(restored.hero,again.destination,{x:desc.x-50,y:desc.y});
  const fresh=setup({heroData:restored.hero,content:again.content});assert.notEqual(fresh.hero.dungeonSession.visitId,visit);assert.equal(fresh.system.monsters.find(m=>m.id===desc.id).alive,true);initial.system.destroy();restored.system.destroy();fresh.system.destroy();
 }finally{Date.now=original;}
});

test('release-five outdoor deaths migrate to thirty seconds while existing boss timers stay exact',()=>{
 const original=Date.now;Date.now=()=>1020000;
 try{
  const state={monsters:{'test:wolf':{killedAt:1000000,deadUntil:1011000,hp:0},'test:boss':{killedAt:1000000,deadUntil:3400000,hp:0}}};
  const content={id:'test',camps:[{id:'camp',spawns:[{id:'wolf',type:'forestWolf',x:2310,y:2000,level:1}]}],bosses:[{id:'boss',type:'forestGuardian',bossType:'world',x:2300,y:2010,level:5}],towns:[]};
  const {hero,system}=setup({heroData:{worldState:state},content});assert.equal(system.monsters.find(m=>m.id==='wolf').alive,false);assert.equal(hero.worldState.monsters['test:wolf'].deadUntil,1030000);assert.equal(hero.worldState.monsters['test:boss'].deadUntil,3400000);system.destroy();
 }finally{Date.now=original;}
});


test('offline-expired threat returns safely around scenery before patrol; ordinary saved patrol is not forced home',()=>{
 const original=Date.now;Date.now=()=>1020000;
 try{
  const obstacle={x:2250,y:2000,r:20},state={hp:25,healthAt:1000000,recoverAfter:1005000,x:2210,y:2000,aggroUntil:1008000,lastSeenAt:1000000,targetX:2000,targetY:2000,returning:false};
  const restored=setup({heroData:{worldState:{monsters:{'test:wolf':state}}},extra:{playNow:12000,obstacles:[obstacle]}}),m=restored.system.monsters[0],radius=movementProfile(m.kind).collisionRadius;
  assert.equal(m.x,2210);assert.equal(m.returning,true);assert.equal(m.aggroUntil,12000);let homeReached=false;
  for(let now=12100;now<=20000;now+=100){restored.system.update(now,.1);assert.ok(distance(m,obstacle)>=radius+obstacle.r-.01,'return route cannot cross the trunk');if(distance(m,{x:m.homeX,y:m.homeY})<=18)homeReached=true;}
  assert.equal(homeReached,true);assert.equal(m.returning,false);assert.ok(m.pathSearches>0,'blocked homeward path actually uses the bounded detour');restored.system.destroy();
  const patrol=setup({heroData:{worldState:{monsters:{'test:wolf':{...state,aggroUntil:0}}}},extra:{playNow:12000,obstacles:[obstacle]}}),p=patrol.system.monsters[0];assert.equal(p.x,2210);assert.equal(p.returning,false);patrol.system.update(12100,0);assert.notEqual(p.behaviorState,'return');patrol.system.destroy();
 }finally{Date.now=original;}
});


test('an expired streamed death reloads hidden and respawns safely when the player occupies its home',()=>{
 const original=Date.now;let wall=1000000;Date.now=()=>wall;
 try{
  const initial=setup(),m=initial.system.monsters[0],home={x:m.homeX,y:m.homeY};initial.system.hit(m,999999,100);
  initial.hero.x=7000;initial.system.update(200,0);assert.equal(initial.system.monsters.length,0);const state=Save.normalize(initial.hero);wall+=30001;
  const obstacle={x:home.x+56,y:home.y,r:18};state.x=home.x;state.y=home.y;
  const restored=setup({heroData:state,content:initial.content,extra:{obstacles:[obstacle],world:{isWalkable:(x,y,r=12)=>distance({x,y},obstacle)>=obstacle.r+r}}}),r=restored.system.monsters[0];
  assert.equal(r.alive,false,'expired saved death is not drawn on the player during construction');assert.equal(r.body.visible,false);assert.equal(r.hpBar.visible,false);
  restored.system.update(1000,0);assert.equal(r.alive,true);assert.ok(distance(r,restored.hero)>=movementProfile(r.kind).collisionRadius+44);assert.ok(distance(r,obstacle)>=movementProfile(r.kind).collisionRadius+obstacle.r);assert.ok(distance(r,home)<=initial.content.camps[0].radius);assert.equal(restored.hero.worldState.monsters[r.key],undefined);
  initial.system.destroy();restored.system.destroy();
 }finally{Date.now=original;}
});
