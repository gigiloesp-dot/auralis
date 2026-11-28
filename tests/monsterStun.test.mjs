import test from 'node:test';
import assert from 'node:assert/strict';
import {applyMonsterStun,isMonsterStunned,monsterStunRemaining,cancelMonsterStun,tickMonsterStun} from '../js/combat/monsterStun.js';
import {Save} from '../js/systems/save.js';
import {createCharacter} from '../js/characters/Character.js';

test('stun expires exactly on simulation time and pauses without wall-clock timers',()=>{
 const hero={hp:100};assert.equal(applyMonsterStun(hero,700,1000),true);
 assert.equal(isMonsterStunned(hero,1000),true);assert.equal(monsterStunRemaining(hero,1000),700);
 for(let i=0;i<100;i++)assert.equal(monsterStunRemaining(hero,1000),700);
 assert.equal(monsterStunRemaining(hero,1699),1);assert.equal(isMonsterStunned(hero,1700),false);
 assert.deepEqual(tickMonsterStun(hero,1700),{active:false,remaining:0,immuneRemaining:1000});
 assert.deepEqual(tickMonsterStun(hero,2700),{active:false,remaining:0,immuneRemaining:0});
});

test('repeated hits cannot refresh stun or bypass its full post-stun immunity',()=>{
 const hero={hp:100};assert.equal(applyMonsterStun(hero,600,100),true);
 assert.equal(applyMonsterStun(hero,800,500),false);assert.equal(monsterStunRemaining(hero,500),200);
 assert.equal(applyMonsterStun(hero,800,700),false);assert.equal(applyMonsterStun(hero,800,1699),false);
 assert.equal(applyMonsterStun(hero,800,1700),true);assert.equal(monsterStunRemaining(hero,1700),800);
});

test('positive finite durations clamp to200–800ms and invalid inputs cannot change active state',()=>{
 for(const [duration,want]of [[1,200],[199,200],[200,200],[600,600],[800,800],[99999,800]]){
  const hero={hp:100};assert.equal(applyMonsterStun(hero,duration,0),true);assert.equal(monsterStunRemaining(hero,0),want);
 }
 for(const hero of [undefined,null,1,'hero',[],{}, {hp:0},{hp:-1},{hp:NaN},{hp:Infinity}])assert.equal(applyMonsterStun(hero,600,0),false);
 for(const duration of [0,-1,NaN,Infinity,-Infinity,'600',undefined])assert.equal(applyMonsterStun({hp:100},duration,0),false);
 const hero={hp:100};assert.equal(applyMonsterStun(hero,800,100),true);
 for(const now of [NaN,Infinity,-Infinity,-1,'100',undefined]){
  assert.equal(applyMonsterStun(hero,600,now),false);assert.equal(isMonsterStunned(hero,now),false);assert.equal(monsterStunRemaining(hero,now),0);
 }
 assert.equal(monsterStunRemaining(hero,100),800);
 assert.equal(applyMonsterStun({hp:100},800,Number.MAX_VALUE),false);
});

test('death and explicit lifecycle reset clear status and immunity without touching hero properties',()=>{
 const hero={hp:100,mp:50,stats:{strength:12}},before=structuredClone(hero);
 assert.equal(applyMonsterStun(hero,800,0),true);assert.deepEqual(hero,before);
 hero.hp=0;assert.deepEqual(tickMonsterStun(hero,100),{active:false,remaining:0,immuneRemaining:0});
 hero.hp=100;assert.equal(applyMonsterStun(hero,200,100),true);
 assert.equal(cancelMonsterStun(hero),true);assert.equal(cancelMonsterStun(hero),false);assert.equal(cancelMonsterStun(null),false);
 assert.equal(isMonsterStunned(hero,100),false);assert.equal(applyMonsterStun(hero,200,100),true);
 const snapshot=tickMonsterStun(hero,100);snapshot.remaining=99999;assert.equal(monsterStunRemaining(hero,100),200);
});

test('clock regression cannot prolong status, and independent heroes remain independent',()=>{
 const a={hp:100},b={hp:100};applyMonsterStun(a,800,100);
 assert.equal(monsterStunRemaining(a,500),400);assert.equal(monsterStunRemaining(a,200),400);
 assert.equal(isMonsterStunned(b,500),false);assert.equal(applyMonsterStun(b,200,500),true);
 assert.equal(isMonsterStunned(b,700),false);assert.equal(isMonsterStunned(a,700),true);
 assert.equal(applyMonsterStun(a,800,300),false);
});

test('actual Save write/load and new character restoration never serialize or inherit transient stun',()=>{
 const hero=createCharacter({x:1030,y:1140,hp:100,mp:50}),other=createCharacter({x:1040,y:1150,hp:90,mp:45});
 hero.updatedAt=123456;other.updatedAt=123456;
 const raw=JSON.stringify(hero),otherRaw=JSON.stringify(other),saved=JSON.stringify(Save.normalize(hero));
 assert.equal(applyMonsterStun(hero,800,100),true);
 assert.equal(JSON.stringify(hero),raw);assert.equal(JSON.stringify(other),otherRaw);assert.equal(JSON.stringify(Save.normalize(hero)),saved);
 const previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage'),store=new Map();
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,String(value)),removeItem:key=>store.delete(key)}});
 let loaded;
 try{assert.equal(Save.write(hero,1),true);loaded=Save.load(1);assert.ok(loaded);assert.equal(store.get(Save.key(1)).includes('stun'),false);}
 finally{if(previous)Object.defineProperty(globalThis,'localStorage',previous);else delete globalThis.localStorage;}
 const restored=createCharacter(loaded);
 assert.equal(isMonsterStunned(loaded,100),false);assert.equal(isMonsterStunned(restored,100),false);
 assert.equal(isMonsterStunned(hero,100),true);assert.equal(isMonsterStunned(other,100),false);
 assert.equal(applyMonsterStun(restored,600,0),true);assert.equal(monsterStunRemaining(restored,0),600);
});
