import test from 'node:test';
import assert from 'node:assert/strict';
import {HeroRig} from '../js/characters/HeroRig.js';
const node=(x=0,y=0)=>({x,y,rotation:0,scaleX:1,scaleY:1,alpha:1,list:[],visible:true,add(child){this.list.push(child);return this;},setOrigin(){return this;},setStrokeStyle(){return this;},setVisible(value){this.visible=value;return this;},setFillStyle(color){this.fillColor=color;return this;}});
function makeRig(classId){const root=node(),hero={classId,equipment:{}};const add=new Proxy({},{get:()=>((x,y)=>node(x,y))});return {root,hero,rig:new HeroRig({hero,add},root)};}
function finiteTree(part){for(const key of ['x','y','rotation','scaleX','scaleY','alpha'])assert.ok(Number.isFinite(part[key]),key);for(const child of part.list)finiteTree(child);}
test('all six rigs remain finite through idle, directional gait and every attack phase',()=>{
 for(const classId of ['warrior','archer','mage','paladin','assassin','cannoneer']){const {root,rig}=makeRig(classId);
 for(let dir=0;dir<8;dir++)for(let frame=0;frame<60;frame++){rig.update(1/60,{x:Math.cos(dir*Math.PI/4),y:Math.sin(dir*Math.PI/4)},frame<10?null:{active:true,progress:frame/60,index:dir%4},dir*Math.PI/4);finiteTree(root);}
 }
});
test('equipment visuals follow real equipped items and clear when unequipped',()=>{
 const {hero,rig}=makeRig('warrior');rig.update(0,{x:0,y:0},null,0);assert.equal(rig.helmet.visible,false);assert.equal(rig.chestArmor.visible,false);
 hero.equipment={helmet:{id:'helmet',rarity:'rare'},chest:{id:'chest',rarity:'epic'},boots:{id:'boots',rarity:'rare'}};rig.update(0,{x:0,y:0},null,0);assert.equal(rig.helmet.visible,true);assert.equal(rig.chestArmor.visible,true);assert.equal(rig.leftBoot.fillColor,0x547ba4);
 hero.equipment={};rig.update(0,{x:0,y:0},null,0);assert.equal(rig.helmet.visible,false);assert.equal(rig.chestArmor.visible,false);assert.equal(rig.leftBoot.fillColor,0x302b27);
});
test('paladin third swing advances the shield and restores the guard afterward',()=>{
 const {rig}=makeRig('paladin');rig.update(.016,{x:0,y:0},{active:true,progress:.5,index:2},0);assert.ok(rig.shield.y>12);assert.equal(rig.rightArm.rotation,.4);rig.update(.016,{x:0,y:0},null,0);assert.equal(rig.shield.y,12);
});
test('hurt and death states animate the connected rig and clear after revival',()=>{
 const {hero,rig,root}=makeRig('warrior');hero.hp=40;hero.hurtUntil=300;rig.update(.1,{x:0,y:0},null,0);assert.equal(rig.animationState,'hurt');assert.ok(root.alpha<1);
 hero.hp=0;for(let i=0;i<6;i++)rig.update(.1,{x:0,y:0},null,0);assert.equal(rig.animationState,'death');assert.ok(root.rotation>1);assert.ok(root.alpha<.8);finiteTree(root);
 hero.hp=40;rig.update(.1,{x:0,y:0},null,0);assert.equal(rig.animationState,'idle');assert.equal(root.rotation,0);assert.equal(root.alpha,1);
});
