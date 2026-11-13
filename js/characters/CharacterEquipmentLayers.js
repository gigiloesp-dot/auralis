import {itemDefinition} from '../equipment/items.js';
import {EQUIPMENT_SLOTS} from '../equipment/armor.js';
import {bodyAttachments} from './bodyAttachments.js';
const COLORS={common:0x95a2ac,uncommon:0x78a87c,rare:0x719fce,epic:0xad81cb,legendary:0xe2bf62};
const EDGE=0x303945;
const polygon=(g,color,points)=>{
 g.fillStyle(color,1).lineStyle(1,EDGE,1).beginPath().moveTo(...points[0]);
 for(const point of points.slice(1))g.lineTo(...point);
 g.closePath().fillPath().strokePath();
};
const plate=(g,color,x,y,w,h)=>polygon(g,color,[[x-w*.42,y-h*.5],[x+w*.42,y-h*.5],[x+w*.5,y+h*.32],[x,y+h*.5],[x-w*.5,y+h*.32]]);
const line=(g,color,width,points)=>{g.lineStyle(width,color,1).beginPath().moveTo(...points[0]);for(const p of points.slice(1))g.lineTo(...p);g.strokePath();};
// Each slot owns its draw buffer. Future texture layers can replace individual
// slot nodes without changing the body's animation or inventory/stat logic.
export class CharacterEquipmentLayers{
 constructor(scene,hero,entry){
  this.hero=hero;this.entry=entry;this.destroyed=false;this.root=scene.add.container(0,0);this.slots={};
  for(const slot of EQUIPMENT_SLOTS.filter(slot=>slot!=='weapon')){this.slots[slot]=scene.add.graphics();this.root.add(this.slots[slot]);}
  const weaponRoot=scene.add.container(0,0),primary=scene.add.graphics(),secondary=scene.add.graphics();
  weaponRoot.add([primary,secondary]);this.root.add(weaponRoot);this.slots.weapon=weaponRoot;
  this.weapon={root:weaponRoot,primary,secondary};this.primary=primary;this.secondary=secondary;
  this.anchors=bodyAttachments(entry);this.muzzlePoint={x:0,y:0};this.hasWeapon=false;
 }
 get commandCount(){return Object.entries(this.slots).reduce((n,[slot,node])=>n+(slot==='weapon'?this.weapon.primary.commandBuffer.length+this.weapon.secondary.commandBuffer.length:node.commandBuffer.length),0);}
 update(frame,direction,state,pose={},transform={}){
  if(this.destroyed)return;
  this.root.rotation=Number.isFinite(transform.rotation)?transform.rotation:0;
  this.root.y=Number.isFinite(transform.y)?transform.y:0;
  this.root.alpha=state==='death'?.5:state==='hurt'?.7:1;
  const a=this.anchors=bodyAttachments(this.entry,frame,direction,state,pose),h=a.height,w=a.width;
  const gear=this.hero?.equipment||{},classId=this.hero?.classId||'warrior';
  const light=['archer','assassin','mage'].includes(classId),dwarf=this.entry.bodyDwarf||this.entry.bodyType==='adult-dwarf';
  const valid=slot=>{const item=gear[slot],definition=itemDefinition(item);return definition?.slot===slot?{item,definition,color:COLORS[item.rarity]||COLORS.common}:null;};
  for(const [slot,node]of Object.entries(this.slots)){
   if(slot==='weapon')continue;
   node.clear();const item=valid(slot);node.setVisible(!!item);if(!item)continue;
   const color=item.color;
   if(slot==='helmet'){
    plate(node,color,a.head.x,a.head.y-h*.025,w*(light?.53:.66),h*.15);
    line(node,EDGE,1.3,[[a.head.x-w*.24,a.head.y],[a.head.x+w*.24,a.head.y]]);
    if(!light)line(node,color,2,[[a.head.x,a.head.y-h*.1],[a.head.x,a.head.y+h*.07]]);
   }else if(slot==='chest'){
    polygon(node,color,[[a.chest.x-w*.4,a.neck.y],[a.chest.x+w*.4,a.neck.y],[a.hips.x+w*.29,a.hips.y-h*.035],[a.hips.x-w*.29,a.hips.y-h*.035]]);
    if(!light)for(const sign of [-1,1])plate(node,color,a.chest.x+sign*w*.36,a.neck.y+h*.05,w*.25,h*.1);
    line(node,EDGE,1,[[a.chest.x,a.neck.y+h*.025],[a.hips.x,a.hips.y-h*.045]]);
   }else if(slot==='pants'){
    plate(node,color,a.hips.x,a.hips.y,w*.7,h*.15);
    for(const [foot,sign]of [[a.rightFoot,-1],[a.leftFoot,1]]){
     const x=(a.hips.x+foot.x)/2+sign*w*.055;
     polygon(node,color,[[a.hips.x+sign*w*.09-w*.13,a.hips.y],[a.hips.x+sign*w*.09+w*.13,a.hips.y],[x+w*.115,-h*.13+foot.y*.4],[x-w*.115,-h*.13+foot.y*.4]]);
    }
   }else if(slot==='boots'){
    for(const foot of [a.rightFoot,a.leftFoot])polygon(node,color,[[foot.x-w*.12,foot.y-h*.15],[foot.x+w*.12,foot.y-h*.15],[foot.x+w*.17,foot.y],[foot.x-w*.16,foot.y]]);
   }else if(slot==='gloves'){
    for(const hand of [a.rightHand,a.leftHand])plate(node,color,hand.x,hand.y-h*.015,w*.22,h*.09);
   }else if(slot==='ring'){
    node.lineStyle(Math.max(1,h*.018),color,1).strokeCircle(a.rightHand.x,a.rightHand.y,w*.065);
   }else if(slot==='amulet'){
    line(node,color,Math.max(1,h*.012),[[a.neck.x-w*.13,a.neck.y],[a.chest.x,a.chest.y-h*.02],[a.neck.x+w*.13,a.neck.y]]);
    plate(node,color,a.chest.x,a.chest.y,w*.13,h*.055);
   }else if(slot==='shield'){
    plate(node,color,a.leftHand.x,a.leftHand.y-h*.045,w*(dwarf?.65:.76),h*.31);
    node.lineStyle(1.2,0xd8c6a3,1).strokeCircle(a.leftHand.x,a.leftHand.y-h*.045,w*.13);
    if(classId==='paladin')line(node,0xe9dcae,2,[[a.leftHand.x,a.leftHand.y-h*.17],[a.leftHand.x,a.leftHand.y+h*.06]]);
   }
  }
  const primary=this.weapon.primary,secondary=this.weapon.secondary;
  primary.clear();secondary.clear();const weapon=valid('weapon');this.hasWeapon=!!weapon;
  this.weapon.root.setVisible(this.hasWeapon);if(!weapon)return;
  const kind=weapon.definition.kind||({archer:'bow',mage:'staff',assassin:'daggers',cannoneer:'cannon'}[classId]||'sword');
  const hand=kind==='bow'?a.leftHand:a.rightHand,attack=a.bank==='attack';
  primary.x=hand.x;primary.y=hand.y;secondary.x=a.leftHand.x;secondary.y=a.leftHand.y;
  const aim=Math.atan2(Math.sin(a.angle)*.45,Math.cos(a.angle));
  primary.rotation=kind==='staff'?(attack?aim:-Math.PI/2):kind==='bow'||kind==='cannon'?aim:attack?aim:Math.PI*.35;
  secondary.rotation=attack?aim:Math.PI*.65;
  const color=weapon.color,length=h*(kind==='daggers'?.24:kind==='staff'?.52:kind==='cannon'?.34:.36);
  if(kind==='bow'){
   const radius=h*.22;
   line(primary,0x795337,Math.max(2,h*.035),[[-radius*.32,-radius],[0,-radius*.6],[radius*.1,0],[0,radius*.6],[-radius*.32,radius]]);
   line(primary,0xeadcc1,1,[[-radius*.32,-radius],[-radius*.32,radius]]);
   line(primary,color,Math.max(2,h*.027),[[0,-radius*.2],[0,radius*.2]]);
   if(attack){line(primary,0xe5d8b5,1.4,[[-radius*.42,0],[radius*.8,0]]);polygon(primary,0xd6e2e7,[[radius*.8,0],[radius*.6,-h*.025],[radius*.6,h*.025]]);}
   this.muzzlePoint={x:radius*(attack?.8:.1),y:0};
  }else if(kind==='staff'){
   line(primary,0x785738,Math.max(3,h*.045),[[-h*.13,0],[length,0]]);
   primary.fillStyle(color,1).fillCircle(length,0,h*.065).lineStyle(1.2,0xe2f2ff,1).strokeCircle(length,0,h*.065);
   primary.fillStyle(0xe8faff,1).fillCircle(length-h*.015,-h*.015,h*.022);this.muzzlePoint={x:length,y:0};
  }else if(kind==='cannon'){
   polygon(primary,0x515e68,[[-h*.07,-h*.075],[length,-h*.065],[length,h*.065],[-h*.07,h*.075]]);
   primary.fillStyle(color,1).fillRect(length*.16,-h*.085,h*.055,h*.17).fillRect(length*.7,-h*.078,h*.04,h*.156);
   primary.fillStyle(0x202a31,1).fillEllipse(length,0,h*.055,h*.125);
   polygon(primary,0x785738,[[-h*.05,h*.025],[h*.05,h*.025],[h*.025,h*.135],[-h*.055,h*.11]]);this.muzzlePoint={x:length,y:0};
  }else{
   const blade=(g)=>{
    polygon(g,0xd3e0e8,[[h*.055,-h*.025],[length-h*.055,-h*.025],[length,0],[length-h*.055,h*.025],[h*.055,h*.025]]);
    line(g,color,Math.max(2,h*.025),[[h*.06,-h*.075],[h*.06,h*.075]]);
    line(g,0x745139,Math.max(3,h*.035),[[-h*.06,0],[h*.055,0]]);
    g.fillStyle(color,1).fillCircle(-h*.06,0,h*.025);
   };
   blade(primary);if(kind==='daggers')blade(secondary);this.muzzlePoint={x:length,y:0};
  }
 }
 weaponMuzzleScreen(){
  if(this.destroyed)return null;
  if(this.hasWeapon)return this.weapon.primary.getWorldTransformMatrix().transformPoint(this.muzzlePoint.x,this.muzzlePoint.y,{});
  const hand=this.anchors.rightHand;return this.root.getWorldTransformMatrix().transformPoint(hand.x,hand.y,{});
 }
 destroy(){if(this.destroyed)return;this.destroyed=true;this.root.destroy();}
}
