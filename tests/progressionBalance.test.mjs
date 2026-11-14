import test from 'node:test';
import assert from 'node:assert/strict';
import {createCharacter} from '../js/characters/Character.js';
import {allocateAttribute} from '../js/systems/attributes.js';
import {grantXp,xpForNextLevel} from '../js/systems/progression.js';
import {equipmentForLevel} from '../js/equipment/catalog.js';
import {addItem,equipItem,itemDefinition} from '../js/equipment/items.js';
import {MonsterSystem} from '../js/monsters/MonsterSystem.js';
import {monsterKind} from '../js/monsters/monsters.js';
import {attackIntervalMs} from '../js/combat/attackTiming.js';
function fakeScene(){const node=()=>{const o={};for(const key of ['setDepth','setOrigin','setScale','add','setVisible','setPosition','setRotation','destroy'])o[key]=()=>o;return o;};return {axis:{x:0,y:0},add:Object.fromEntries(['ellipse','circle','container','rectangle','triangle','text'].map(k=>[k,node])),tweens:{add(){}}};}
// Quantitative mechanics simulation, not a substitute for actual full-game play.
// Assumes the level-appropriate COMMON stock supplied by the merchant system.
test('all six classes can reach42 using actual XP, gear, allocations and ordinary combat budgets',()=>{
 const metrics=[];
 for(const classId of ['warrior','archer','mage','paladin','assassin','cannoneer']){
  const hero=createCharacter({classId,x:1370,y:1240}),system=new MonsterSystem(fakeScene(),hero,()=>{});let kills=0,attackSeconds=0;
  const random=Math.random;Math.random=()=>.5;
  try{while(hero.level<42){
   const level=hero.level;
   if(level>1){for(const stat of ['endurance','agility',classId==='mage'?'intelligence':'strength'])assert.equal(allocateAttribute(hero,stat),true);}
   for(const slot of ['weapon','helmet','chest','gloves','pants','boots','ring','amulet','shield']){
    const id=equipmentForLevel(level,slot,classId).find(id=>!itemDefinition({id}).allowedClasses||itemDefinition({id}).allowedClasses.includes(classId));
    if(id&&hero.equipment[slot]?.id!==id){assert.equal(addItem(hero,{id,rarity:'common'}),true);assert.equal(equipItem(hero,hero.inventory.length-1).ok,true);hero.inventory=[];}
   }
   const type=level<6?'forestWolf':level<14?'bear':level<22?'skeleton':level<35?'iceWolf':'ancientSentinel',kind=monsterKind({type,level}),damage=Math.max(1,system.damage(1,false,0).damage-Math.round(kind.defense*.45));
   const attacks=Math.ceil(kind.hp/damage),needed=Math.ceil((xpForNextLevel(level)-hero.xp)/kind.xp);
   assert.ok(attacks<=12,`${classId} lvl${level}: ${attacks} attacks for regular enemy`);
   for(let i=0;i<needed;i++){grantXp(hero,kind.xp);kills++;attackSeconds+=attacks*attackIntervalMs(hero)/1000;}
   assert.ok(hero.level>level);assert.equal(hero.hp,hero.maxHp);assert.equal(hero.mp,hero.maxMp);
  }}finally{Math.random=random;system.destroy();}
  assert.equal(hero.level,42);assert.equal(hero.skillPoints,41);assert.ok(kills<3500);assert.ok(attackSeconds<6*3600,`${classId}: ${attackSeconds}s fighting`);metrics.push({classId,kills,attackMinutes:Math.round(attackSeconds/60)});
 }
 console.log('Progression budget (excludes quest XP/travel, common gear assumed):',JSON.stringify(metrics));
});
test('boss encounters have finite solo kill budgets and telegraphed hits do not one-shot geared classes',()=>{
 const metrics=[];
 for(const classId of ['warrior','archer','mage','paladin','assassin','cannoneer'])for(const level of [5,22,35,42]){
  const hero=createCharacter({classId,level,x:4000,y:4000,stats:{strength:classId==='mage'?5:5+level-1,intelligence:classId==='mage'?5+level-1:5,endurance:5+level-1,agility:5+level-1,luck:5}}),system=new MonsterSystem(fakeScene(),hero,()=>{});
  for(const slot of ['weapon','helmet','chest','gloves','pants','boots','ring','amulet','shield']){const id=equipmentForLevel(level,slot,classId).find(id=>!itemDefinition({id}).allowedClasses||itemDefinition({id}).allowedClasses.includes(classId));if(id){addItem(hero,{id,rarity:'common'});equipItem(hero,hero.inventory.length-1);hero.inventory=[];}}
  const type=level<22?'forestGuardian':level<35?'frostGolem':'ancientSentinel',kind=monsterKind({type,level,bossType:'world'});const random=Math.random;Math.random=()=>.5;
  try{const damage=Math.max(1,system.damage(1,false,0).damage-Math.round(kind.defense*.45)),attacks=Math.ceil(kind.hp/damage),seconds=attacks*attackIntervalMs(hero)/1000;
   assert.ok(seconds<240,`${classId} lvl${level}: ${seconds}s worldboss kill`);const before=hero.hp;system.hurtHero(kind.attack*2,100);const received=before-hero.hp;assert.ok(received>0&&received<hero.maxHp*.75,`${classId} lvl${level} boss hits ${received}/${hero.maxHp}`);metrics.push(seconds);
  }finally{Math.random=random;system.destroy();}
 }
 console.log('Worldboss basic-only solo damage budget: maximum',Math.round(Math.max(...metrics)),'seconds, excludes dodging/healing/skills');
});
