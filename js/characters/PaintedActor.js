import {actorPose} from '../assets/actorArt.js';
import {CharacterEquipmentLayers} from './CharacterEquipmentLayers.js';
// Four hand-painted pose banks. Hurt/death/skill transitions also use transforms;
// they are deliberately not described as six independently painted clips.
export class PaintedActor{
 constructor(scene,root,entry,hero=null){
  this.scene=scene;this.root=root;this.entry=entry;this.hero=hero;this.elapsed=0;this.deathTime=0;this.destroyed=false;
  this.lease=scene.actorTextures.acquire(entry);
  this.ready=this.lease.ready.then(loaded=>{
   if(!loaded||this.destroyed||!root.scene)return false;
   this.sprite=scene.add.image(0,0,entry.key,'idle/s').setOrigin(.5,(entry.baselines?.idle||225)/256).setScale(entry.scale);
   root.add(this.sprite);
   if(entry.baseBody&&entry.equipment){this.layers=new CharacterEquipmentLayers(scene,hero,entry);this.gear=this.layers.root;}
   else this.gear=entry.equipment?scene.add.graphics():null;
   if(this.gear)root.add(this.gear);return true;
  });
 }
 update(state,angle,dt,pose={}){
  if(!this.sprite||this.destroyed)return;this.elapsed+=Math.max(0,dt);
  const p=actorPose(state,angle,this.elapsed,pose.progress||0);this.currentFrame=p.frame;this.poseBank=p.bank;this.directionAngle=angle;
  this.sprite.setFrame(p.frame).setOrigin(.5,(this.entry.baselines?.[p.bank]||225)/256);
  const breath=state==='idle'?Math.sin(this.elapsed*3)*.008:0;
  this.sprite.setScale(this.entry.scale,this.entry.scale*(1+breath));this.sprite.y=state==='run'?-Math.abs(Math.sin(this.elapsed*9*Math.PI))*1.6:0;
  if(state==='death'){this.deathTime+=dt;this.sprite.rotation=Math.min(1,this.deathTime/.5)*1.2;this.sprite.alpha=1-Math.min(1,this.deathTime/.5)*.35;}
  else{this.deathTime=0;this.sprite.rotation=state==='hurt'?Math.sin(this.elapsed*55)*.07:0;this.sprite.alpha=1;}
  if(state==='hurt')this.sprite.setTint(0xffb3a3);else if(state==='special')this.sprite.setTint(0xc9e8ff);else this.sprite.clearTint();
  if(this.layers)this.layers.update(p.frame,p.direction,state,{...pose,aimAngle:angle},{rotation:this.sprite.rotation,y:this.sprite.y});
  else if(this.gear)this.drawEquipment(p.direction,state);
 }
 drawEquipment(direction,state){
  const g=this.gear,items=this.hero?.equipment||{},back=['nw','n','ne'].includes(direction),side=direction==='e'?1:direction==='w'?-1:direction.endsWith('e')?.7:direction.endsWith('w')?-.7:0;
  g.clear();g.alpha=state==='death'?.5:state==='hurt'?.65:1;g.rotation=this.sprite.rotation;const crouch=this.poseBank==='attack'?({paladin:.74,assassin:.77,archer:.85}[this.hero.classId]||1):1;g.setScale(this.entry.gearScale||1,(this.entry.gearScale||1)*(this.entry.equipmentScaleY||1)*crouch);g.y=this.sprite.y+(this.entry.gearOffsetY||0);
  const color=i=>({common:0xa7b5bd,uncommon:0x79aa7d,rare:0x729fd1,epic:0xb68bd4,legendary:0xe9c66b}[i?.rarity]||0xa7b5bd);
  const plate=(item,points)=>{if(!item)return;g.fillStyle(color(item),.9).lineStyle(1,0x35414b,1).beginPath().moveTo(...points[0]);for(const p of points.slice(1))g.lineTo(...p);g.closePath().fillPath().strokePath();};
  // Equipment follows the painted body's anatomical landmarks, in world pixels.
  const x=side*3;
  plate(items.pants,[[x-8,-29],[x+8,-29],[x+9,-18],[x+2,-16],[x,-24],[x-2,-16],[x-9,-18]]);
  for(const dx of [-6,6])plate(items.boots,[[x+dx-4,-11],[x+dx+4,-11],[x+dx+5,-2],[x+dx-5,-2]]);
  plate(items.chest,[[x-12,-56],[x-8,-61],[x+8,-61],[x+12,-56],[x+8,-34],[x-8,-34]]);
  plate(items.helmet,[[x-9,-75],[x-6,-83],[x+6,-83],[x+10,-75],[x+9,-70],[x+4,-75],[x-4,-75],[x-9,-70]]);
  for(const dx of [-14,14])plate(items.gloves,[[x+dx-3,-40],[x+dx+3,-40],[x+dx+4,-32],[x+dx-4,-32]]);
  if(!back){if(items.amulet)g.fillStyle(color(items.amulet)).fillCircle(x,-49,2.6);if(items.ring)g.lineStyle(1.6,color(items.ring)).strokeCircle(x-14,-32,2);}
  plate(items.shield,[[x-17,-48],[x-8,-43],[x-10,-28],[x-17,-22],[x-24,-28],[x-26,-43]]);
  // Legacy dressed appearances keep their previous accent renderer. Neutral
  // base bodies always use CharacterEquipmentLayers and contain no baked blade.
  if(items.weapon){g.lineStyle(2,color(items.weapon),.95);const sign=side<0?-1:1,c=this.entry.weaponType||({archer:'bow',mage:'staff',cannoneer:'cannon',assassin:'dagger'}[this.hero.classId]||'sword');
   if(c==='bow'){g.beginPath().arc(x+sign*15,-39,15,-Math.PI/2,Math.PI/2,sign<0).strokePath();}
   else if(c==='staff'){g.fillStyle(color(items.weapon),.8).fillCircle(x+sign*17,-75,3.5);}
   else if(c==='cannon'){g.lineStyle(3,color(items.weapon)).strokeRect(x+sign*12-5,-38,15,9);}
   else{g.beginPath().moveTo(x+sign*16,-31).lineTo(x+sign*29,-18).strokePath();if(c==='dagger')g.beginPath().moveTo(x-sign*14,-31).lineTo(x-sign*23,-20).strokePath();}
   g.fillStyle(color(items.weapon)).fillCircle(x+sign*15,-32,2.5);
  }
 }
 get equipmentCommandCount(){return this.layers?this.layers.commandCount:this.gear?.commandBuffer?.length||0;}
 weaponMuzzleScreen(){if(this.layers)return this.layers.weaponMuzzleScreen();const m=this.sprite?.getWorldTransformMatrix?.(),angle=this.directionAngle||0,socket=this.entry.weaponSocket||{reach:85,height:130};return m?.transformPoint?.(Math.cos(angle)*socket.reach,-socket.height+Math.sin(angle)*45,{});}
 destroy(){if(this.destroyed)return;this.destroyed=true;this.sprite?.destroy();if(this.layers)this.layers.destroy();else this.gear?.destroy();this.lease.release();}
}
