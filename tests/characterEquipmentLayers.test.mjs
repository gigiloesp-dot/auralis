import test from 'node:test';
import assert from 'node:assert/strict';
import {CharacterEquipmentLayers} from '../js/characters/CharacterEquipmentLayers.js';
import {bodyAttachments} from '../js/characters/bodyAttachments.js';
import {createCharacter} from '../js/characters/Character.js';
import {equipItem,unequipItem} from '../js/equipment/items.js';
import {EQUIPMENT_SLOTS} from '../js/equipment/armor.js';
import {ACTOR_ART,ACTOR_DIRECTIONS} from '../js/assets/actorArt.js';

// Records the public Graphics calls and composes the display hierarchy. Pixel
// appearance and the real Phaser buffers are exercised in the browser suite.
function sceneFixture(){
 function node(graphics=false){
  const n={x:0,y:0,rotation:0,scaleX:1,scaleY:1,visible:true,list:[],commandBuffer:[],destroyed:false};
  n.add=children=>{for(const child of Array.isArray(children)?children:[children]){child.parentContainer=n;n.list.push(child);}return n;};
  n.setVisible=visible=>{n.visible=visible;return n;};
  n.clear=()=>{n.commandBuffer.length=0;return n;};
  n.destroy=()=>{n.destroyed=true;for(const child of n.list)child.destroy();};
  n.getWorldTransformMatrix=()=>({transformPoint(x,y,out={}){
   for(let current=n;current;current=current.parentContainer){
    const c=Math.cos(current.rotation),s=Math.sin(current.rotation),sx=x*current.scaleX,sy=y*current.scaleY;
    x=current.x+sx*c-sy*s;y=current.y+sx*s+sy*c;
   }
   out.x=x;out.y=y;return out;
  }});
  if(graphics)for(const method of ['fillStyle','lineStyle','beginPath','moveTo','lineTo','closePath','fillPath','strokePath','fillCircle','strokeCircle','fillRect','fillEllipse'])n[method]=(...args)=>{n.commandBuffer.push([method,...args]);return n;};
  return n;
 }
 return {add:{container:()=>node(),graphics:()=>node(true)}};
}
const update=layers=>layers.update('idle/s','s','idle',{},{});

test('real inventory equip and unequip creates and clears all nine independent visual slots',()=>{
 const scene=sceneFixture(),hero=createCharacter({classId:'paladin',level:42});
 const layers=new CharacterEquipmentLayers(scene,hero,ACTOR_ART.paladin);
 update(layers);assert.equal(layers.commandCount,0);
 assert.equal(new Set(Object.values(layers.slots)).size,9);
 for(const slot of EQUIPMENT_SLOTS){
  const id=slot==='weapon'?'weapon_paladin_3':slot+'_1';
  hero.inventory.push({id,rarity:'rare'});
  assert.equal(equipItem(hero,hero.inventory.length-1).ok,true,id);
  const before=JSON.stringify(hero);update(layers);
  assert.equal(JSON.stringify(hero),before,'rendering does not mutate inventory, stats, or progress');
  assert.ok(layers.commandCount>0,id+' draws geometry');
  assert.equal(layers.slots[slot].visible,true);
  for(const other of EQUIPMENT_SLOTS.filter(other=>other!==slot))assert.equal(layers.slots[other].visible,false);
  assert.equal(unequipItem(hero,slot),true);update(layers);
  assert.equal(layers.commandCount,0,id+' leaves no residual draw commands');
  assert.equal(layers.slots[slot].visible,false);
 }
 layers.destroy();assert.equal(layers.root.destroyed,true);assert.equal(layers.weapon.primary.destroyed,true);assert.equal(layers.weaponMuzzleScreen(),null);
});

test('all six classes render full weapons in every facing and return the visible weapon transform',()=>{
 const geometry=new Set();
 for(const classId of ['warrior','paladin','archer','mage','assassin','cannoneer']){
  const scene=sceneFixture(),hero=createCharacter({classId,level:42,inventory:[{id:'weapon_'+classId+'_4',rarity:'epic'}]});
  assert.equal(equipItem(hero,0).ok,true);
  const layers=new CharacterEquipmentLayers(scene,hero,ACTOR_ART[classId]),world=scene.add.container();
  world.x=150;world.y=240;world.scaleX=1.3;world.scaleY=.8;world.rotation=.2;world.add(layers.root);
  for(const direction of ACTOR_DIRECTIONS){
   layers.update('attack/'+direction,direction,'attack',{progress:.6},{rotation:.13,y:-2});
   assert.ok(layers.weapon.primary.commandBuffer.length>8,'full weapon geometry instead of one rarity accent');
   assert.equal(layers.weapon.secondary.commandBuffer.length>0,classId==='assassin','only paired daggers have a second weapon');
   const expected=layers.weapon.primary.getWorldTransformMatrix().transformPoint(layers.muzzlePoint.x,layers.muzzlePoint.y,{});
   assert.deepEqual(layers.weaponMuzzleScreen(),expected);
   assert.ok(Number.isFinite(expected.x)&&Number.isFinite(expected.y));
   const hand=classId==='archer'?layers.anchors.leftHand:layers.anchors.rightHand;
   assert.deepEqual({x:layers.weapon.primary.x,y:layers.weapon.primary.y},hand);
  }
  geometry.add(JSON.stringify(layers.weapon.primary.commandBuffer));
  assert.equal(unequipItem(hero,'weapon'),true);update(layers);
  const handWorld=layers.root.getWorldTransformMatrix().transformPoint(layers.anchors.rightHand.x,layers.anchors.rightHand.y,{});
  assert.deepEqual(layers.weaponMuzzleScreen(),handWorld,'unarmed emitters follow a hand and never an old weapon tip');
  assert.equal(layers.weapon.primary.commandBuffer.length,0);assert.equal(layers.weapon.secondary.commandBuffer.length,0);
 }
 assert.ok(geometry.size>=5,'sword, bow, staff, paired daggers and cannon have distinct geometry');
});

test('unknown items and items stored in the wrong slot never create baked-equipment substitutes',()=>{
 const hero=createCharacter({equipment:{weapon:{id:'missingWeapon'},helmet:{id:'wolfFang'},chest:{id:'boots_1'}}});
 const layers=new CharacterEquipmentLayers(sceneFixture(),hero,ACTOR_ART.warrior);update(layers);
 assert.equal(layers.commandCount,0);assert.equal(layers.hasWeapon,false);
 hero.equipment.weapon={id:'rustySword',rarity:'common'};update(layers);
 assert.ok(layers.commandCount>0,'legacy valid sword IDs still render a complete blade');
 const common=JSON.stringify(layers.primary.commandBuffer);hero.equipment.weapon.rarity='legendary';update(layers);
 assert.notEqual(JSON.stringify(layers.primary.commandBuffer),common,'rarity visibly changes the weapon geometry styling');
});

test('anatomical right remains on the correct side front/back and pose heights register to the feet',()=>{
 const entry={bodyHeight:80,bodyWidth:34,poseHeights:{idle:80,attack:60,'run-a':72,'run-b':72}};
 const front=bodyAttachments(entry,'idle/s'),back=bodyAttachments(entry,'idle/n');
 assert.ok(front.rightHand.x<front.leftHand.x,'right hand is viewer-left when facing south');
 assert.ok(back.rightHand.x>back.leftHand.x,'right hand is viewer-right when facing north');
 const crouch=bodyAttachments(entry,'attack/s'),idle=bodyAttachments(entry,'idle/s');
 assert.ok(crouch.head.y>idle.head.y);assert.equal(crouch.rightFoot.y,0);assert.equal(crouch.leftFoot.y,0);
 const a=bodyAttachments(entry,'run-a/e'),b=bodyAttachments(entry,'run-b/e');
 assert.ok(a.rightFoot.x>b.rightFoot.x);assert.ok(a.leftFoot.x<b.leftFoot.x);
 for(const direction of ACTOR_DIRECTIONS){const anchors=bodyAttachments(entry,'idle/'+direction);for(const key of ['head','chest','hips','rightHand','leftHand','rightFoot','leftFoot'])assert.ok(Number.isFinite(anchors[key].x)&&Number.isFinite(anchors[key].y));}
 const override={x:-20,y:-30},measured={...entry,attachments:{'attack/s':{rightHand:override}}};
 const original=JSON.stringify(measured),result=bodyAttachments(measured,'attack/s');
 assert.deepEqual(result.rightHand,override);assert.notEqual(result.rightHand,override);assert.equal(JSON.stringify(measured),original);
 assert.deepEqual(bodyAttachments(measured,'idle/s').rightHand,idle.rightHand,'measured override is frame-specific');
});
