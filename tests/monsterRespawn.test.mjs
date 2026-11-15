import test from 'node:test';
import assert from 'node:assert/strict';
import {MonsterSystem} from '../js/monsters/MonsterSystem.js';
import {MONSTER_TYPES,monsterKind} from '../js/monsters/monsters.js';
import {createCharacter} from '../js/characters/Character.js';
import {Save} from '../js/systems/save.js';
import {getRegionContent} from '../js/world/regionContent.js';

const ordinaryTypes=Object.keys(MONSTER_TYPES).filter(type=>!MONSTER_TYPES[type].boss);
function setup({type='forestWolf',respawnMs,playNow=0,heroData={},legacy=false}={}){
 const node=()=>{const o={visible:true,x:0,y:0};for(const name of ['setDepth','setOrigin','setScale','add','destroy','setRotation'])o[name]=()=>o;o.setVisible=v=>{o.visible=v;return o;};o.setPosition=(x,y)=>{o.x=x;o.y=y;return o;};return o;};
 const scene={playNow,axis:{x:0,y:0},obstacles:[],add:Object.fromEntries(['ellipse','container','triangle','circle','rectangle','text'].map(n=>[n,node])),tweens:{add(){}}};
 const hero=createCharacter({classId:'warrior',level:42,region:'test',x:2000,y:2000,...heroData});hero.hp=hero.maxHp=100000;
 const content=legacy?null:{id:'respawn',camps:[{id:'camp',x:2310,y:2000,radius:110,spawns:[{id:'mob',type,x:2310,y:2000,respawnMs}]}],bosses:[],towns:[]};
 const system=new MonsterSystem(scene,hero,()=>{},content);return {scene,hero,system,m:system.monsters[0]};
}
function withWall(run){const original=Date.now;let wall=1000000;Date.now=()=>wall;try{run(value=>{wall=value;});}finally{Date.now=original;}}

test('every ordinary species rejects a short descriptor and waits until the exact death deadline',()=>withWall(setWall=>{
 assert.equal(ordinaryTypes.length,23);
 for(const type of ordinaryTypes){
  setWall(1000000);assert.equal(monsterKind({type,respawnMs:11000}).respawnMs,30000,type);
  const {system,hero,m}=setup({type,respawnMs:11000,playNow:900000});
  system.hit(m,999999,900000);assert.deepEqual(hero.worldState.monsters[m.key],{deadUntil:1030000,killedAt:1000000,hp:0},type);
  setWall(1011000);system.update(911000,0);assert.equal(m.alive,false,type+' at old deadline');
  setWall(1029999);system.update(929999,0);assert.equal(m.alive,false,type+' before deadline');
  setWall(1030000);system.update(930000,0);assert.equal(m.alive,true,type+' at deadline');system.destroy();
 }
}));

test('ordinary death survives stream out/in and normalized reload with reset or advanced play clocks',()=>withWall(setWall=>{
 for(const type of ordinaryTypes){
 const initial=setup({type,playNow:800000}),{system,hero,m}=initial;system.hit(m,999999,800000);
 hero.x=7000;system.update(800100,0);assert.equal(system.monsters.length,0);
 setWall(1005000);hero.x=2000;system.update(805000,0);assert.equal(system.monsters[0].alive,false);
 const saved=Save.normalize(hero);assert.equal(saved.worldState.monsters[m.key].killedAt,1000000);assert.equal(saved.worldState.monsters[m.key].deadUntil,1030000);system.destroy();
 for(const playNow of [0,2000000]){
  setWall(1005000);const restored=setup({type,heroData:saved,playNow}),r=restored.m;
  assert.equal(r.alive,false);setWall(1029999);restored.system.update(playNow+24999,0);assert.equal(r.alive,false);
  setWall(1030000);restored.system.update(playNow+25000,0);assert.equal(r.alive,true);restored.system.destroy();
 }
 setWall(1000000);
 }
}));

test('legacy instance recreation cannot treat a remaining duration as an absolute scene deadline',()=>withWall(setWall=>{
 const first=setup({legacy:true,heroData:{x:1370,y:1100},playNow:800000}),m=first.m;
 first.system.hit(m,999999,800000);const saved=Save.normalize(first.hero);first.system.destroy();
 setWall(1005000);const second=setup({legacy:true,heroData:saved,playNow:805000}),r=second.m;
 second.system.update(805000,0);assert.equal(r.alive,false,'25 seconds remain despite the existing scene clock');
 setWall(1029999);second.system.update(829999,0);assert.equal(r.alive,false);
 setWall(1030000);second.system.update(830000,0);assert.equal(r.alive,true);second.system.destroy();
}));

test('scene clock resets and backwards wall adjustment cannot shorten an ordinary death',()=>withWall(setWall=>{
 const {system,m}=setup({playNow:800000});system.hit(m,999999,800000);
 setWall(999000);system.update(900000,0);assert.equal(m.alive,false);
 setWall(1029999);system.update(0,0);assert.equal(m.alive,false);
 setWall(1030000);system.update(1,0);assert.equal(m.alive,true);system.destroy();
}));

test('an entirely occupied camp delays respawn after its deadline until a place is free',()=>withWall(setWall=>{
 const {system,scene,m}=setup();system.hit(m,999999,0);setWall(1030000);
 const occupant={id:'occupant',alive:true,x:m.homeX,y:m.homeY,homeX:m.homeX,homeY:m.homeY,kind:{...m.kind,movementProfile:'heavy'}};
 // Keep only the authored home walkable; its living neighbour occupies it.
 scene.world={isWalkable:(x,y)=>x===m.homeX&&y===m.homeY};
 system.monsters.push(occupant);assert.equal(system.respawnPoint(m,30000),null);system.monsters.pop();
 system.update(30500,0);assert.equal(m.alive,true);system.destroy();
}));

test('world, dungeon and arena boss cooldown descriptors retain their independent values',()=>{
 for(const [bossType,respawnMs] of [['world',2400000],['dungeon',3600000],['arena',86400000]])assert.equal(monsterKind({type:'forestWolf',bossType,respawnMs}).respawnMs,respawnMs);
 assert.equal(monsterKind({type:'forestWolf',respawnMs:45000}).respawnMs,45000);
});

test('all authored outdoor descriptors have stable unique state IDs and a thirty-second ordinary interval',()=>{
 let count=0;const keys=new Set();
 for(const region of ['forest','north','ancient']){const content=getRegionContent(region);
  for(const descriptor of [...content.camps.flatMap(c=>c.spawns),...content.bosses]){
   const key=content.id+':'+descriptor.id;assert.equal(keys.has(key),false,key);keys.add(key);
   const kind=monsterKind(descriptor);if(!kind.boss){assert.equal(kind.respawnMs,30000,key);count++;}
  }
 }
 assert.equal(count,2415);
});

test('an expired legacy death without killedAt still passes the safe respawn check on reload',()=>withWall(setWall=>{
 setWall(1030000);const {system,scene,m}=setup({heroData:{worldState:{monsters:{'respawn:mob':{hp:0,deadUntil:1011000}}}}});
 scene.world={isWalkable:()=>false};assert.equal(m.alive,false);assert.equal(m.body.visible,false);
 system.update(0,0);assert.equal(m.alive,false);scene.world.isWalkable=()=>true;system.update(500,0);assert.equal(m.alive,true);system.destroy();
}));

test('pausing the scene clock does not extend the absolute thirty-second wall deadline',()=>withWall(setWall=>{
 const {system,m}=setup({playNow:1000});system.hit(m,999999,1000);
 setWall(1029999);system.update(1000,0);assert.equal(m.alive,false);
 setWall(1030000);system.update(1000,0);assert.equal(m.alive,true);system.destroy();
}));
