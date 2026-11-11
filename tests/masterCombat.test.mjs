import test from 'node:test';
import assert from 'node:assert/strict';
import {MonsterSystem} from '../js/monsters/MonsterSystem.js';
import {createCharacter} from '../js/characters/Character.js';
import {getRegionContent} from '../js/world/regionContent.js';
function setup(classId='warrior',content=null,heroData={},extra={}){
 const node=()=>{const o={visible:true,x:0,y:0};for(const method of ['setDepth','setOrigin','setScale','add','removeAll','destroy','setRotation'])o[method]=()=>o;o.setPosition=(x,y)=>{o.x=x;o.y=y;return o;};o.setVisible=v=>{o.visible=v;return o;};return o;};
 const scene={axis:{x:0,y:0},obstacles:[],add:Object.fromEntries(['ellipse','container','triangle','circle','rectangle','text'].map(k=>[k,node])),tweens:{add:()=>{}},...extra};
 const hero=createCharacter({classId,x:1370,y:1240,level:5,learnedSkills:{[classId+'_0']:1},...heroData});
 const system=new MonsterSystem(scene,hero,()=>{},content);return {scene,hero,system};
}
test('runtime targeting rejects an occluded enemy and projectile sweep hits a newly inserted wall',()=>{
 const {scene,hero,system}=setup('mage');for(const m of system.monsters.slice(1))m.alive=false;
 const target=system.monsters[0];target.x=hero.x+200;scene.obstacles=[{x:hero.x+100,y:hero.y,r:20}];
 assert.equal(system.attack(100),false);assert.equal(system.useSkill('mage_0',100).reason,'target');assert.equal(hero.mp,hero.maxMp);
 scene.obstacles=[];system.strike(target,200,10);assert.equal(system.projectiles.length,1);assert.notEqual(system.projectiles[0].x,hero.x);
 scene.obstacles=[{x:hero.x+100,y:hero.y,r:20}];system.update(400,1);assert.equal(target.hp,target.maxHp);assert.equal(system.projectiles.length,0);
});
test('class multipliers and movement penalties affect real attack rolls and damage protection',()=>{
 const damages={};for(const id of ['warrior','paladin','assassin','archer','mage']){const {scene,system}=setup(id);damages[id]=system.damage(1,true,0).damage;if(['archer','mage'].includes(id)){const standing=damages[id];scene.axis.x=1;assert.ok(system.damage(1,true,0).damage<standing*(id==='mage'?.78:.88));}}
 assert.ok(damages.mage>damages.archer&&damages.archer>damages.assassin&&damages.assassin>damages.warrior&&damages.warrior>damages.paladin);
 const received={};for(const id of Object.keys(damages)){const {hero,system}=setup(id);hero.hp=hero.maxHp;system.hurtHero(100,10);received[id]=hero.maxHp-hero.hp;}
 assert.ok(received.paladin<received.warrior&&received.warrior<received.assassin&&received.assassin<received.archer&&received.archer<received.mage);
});
test('streamed death and cooldown survive unloading, reconstruction and a nonzero scene clock',()=>{
 const content={id:'forest',camps:[{id:'camp',spawns:[{id:'wolf',type:'forestWolf',x:1370,y:1240,level:1}]}],bosses:[],towns:[]};
 const {hero,system}=setup('warrior',content),target=system.monsters[0];system.hit(target,999,100);const gold=hero.gold;
 hero.x=7000;system.update(200,.01);assert.equal(system.monsters.length,0);hero.x=1370;system.update(300,.01);assert.equal(system.monsters[0].alive,false);system.hit(system.monsters[0],999,400);assert.equal(hero.gold,gold);
 system.monsters[0].alive=true;system.monsters[0].hp=100;assert.equal(system.useSkill('warrior_0',500).ok,true);system.destroy();
 const restored=setup('warrior',content,hero,{playNow:12000});assert.ok(restored.system.skillRemaining('warrior_0',12000)>4);assert.equal(restored.system.useSkill('warrior_0',12000).reason,'cooldown');assert.equal(restored.system.monsters[0].alive,false);
});
test('all region encounter descriptors instantiate on approach with bounded active entities',()=>{
 let visited=0,peak=0;
 for(const region of ['forest','north','ancient']){const content=getRegionContent(region),{hero,system}=setup('warrior',content,{region});const descriptors=[...content.camps.flatMap(c=>c.spawns),...content.bosses];
  for(const descriptor of descriptors){hero.x=descriptor.x;hero.y=descriptor.y;system.update(0,0);assert.ok(system.monsters.some(m=>m.id===descriptor.id),descriptor.id);peak=Math.max(peak,system.monsters.length);visited++;}
  system.destroy();assert.equal(system.monsters.length,0);
 }
 assert.equal(visited,1163);assert.ok(peak<80,'must not instantiate whole region: '+peak);
});
test('boss cycles through three telegraphed patterns and paladin third hit stuns',()=>{
 const boss={id:'boss',type:'forestGuardian',x:2000,y:2000,level:5,bossType:'mini',patterns:['slam','charge','volley']};
 const {hero,system}=setup('paladin',{id:'test',camps:[],bosses:[boss],towns:[]},{x:2150,y:2000});const m=system.monsters[0];
 system.beginBossAttack(m,8000);assert.equal(m.windup.effect,'slam');system.cancelWindup(m);system.beginBossAttack(m,15000);assert.equal(m.windup.effect,'charge');system.finishBossAttack(m,16000);assert.ok(m.x>2000);system.beginBossAttack(m,22000);assert.equal(m.windup.effect,'volley');system.finishBossAttack(m,24000);assert.equal(system.hostileProjectiles.length,3);
 hero.x=m.x+35;m.hp=m.maxHp=10000;const previous=Math.random;Math.random=()=>.5;try{system.attack(25000);system.attack(26000);system.attack(27000);}finally{Math.random=previous;}
 assert.equal(system.scene.lastComboAttack,'shield');assert.equal(m.stunUntil,27900);
});
test('isometric display projects entity coordinates while combat stays in world coordinates',()=>{
 const {system}=setup('warrior',null,{}, {project:(x,y)=>({x:x-y,y:(x+y)/2})});const m=system.monsters[0];system.update(0,0);assert.equal(m.body.x,m.x-m.y);assert.ok(Math.abs(m.body.y-(m.x+m.y)/2)<2);
});
