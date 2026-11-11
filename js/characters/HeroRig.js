import { swingPose } from '../combat/attackTiming.js';
import { gaitPose } from './animations/gait.js';
// Procedural jointed 2.5D hero. All limbs rotate at anatomical pivots.
const lerpAngle=(a,b,t)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*t;
export class HeroRig{
 constructor(scene,root){
  this.hero=scene.hero;this.classId=scene.hero?.classId||'warrior';this.root=root;this.t=0;this.blend=0;this.attackPhase=0;this.wasAttacking=false;this.direction=0;
  const part=(parent,x,y)=>{const c=scene.add.container(x,y);parent.add(c);return c;};
  const bone=(parent,x,y,w,h,color)=>{const pivot=part(parent,x,y);pivot.add(scene.add.rectangle(0,h/2,w,h,color).setOrigin(.5,.5));pivot.add(scene.add.circle(0,0,w*.54,color));return pivot;};
  this.hips=part(root,0,-17);
  this.leftThigh=bone(this.hips,-7,0,11,17,0x45404a);
  this.leftShin=bone(this.leftThigh,0,16,9,16,0x302e36);
  this.leftBoot=scene.add.ellipse(0,17,15,8,0x302b27);this.leftShin.add(this.leftBoot);
  this.rightThigh=bone(this.hips,7,0,11,17,0x45404a);
  this.rightShin=bone(this.rightThigh,0,16,9,16,0x302e36);
  this.rightBoot=scene.add.ellipse(0,17,15,8,0x302b27);this.rightShin.add(this.rightBoot);
  this.torso=part(this.hips,0,-3);
  const cloth={warrior:0x536e87,archer:0x58704c,mage:0x645580,paladin:0x817752,assassin:0x4b475d,cannoneer:0x806143}[this.classId]||0x536e87;
  this.torso.add(scene.add.ellipse(0,-12,29,33,cloth));
  this.torso.add(scene.add.ellipse(0,-15,21,22,0x657e91,.5));
  this.chestArmor=scene.add.ellipse(0,-12,31,30,0x84919a).setVisible(false);this.torso.add(this.chestArmor);
  this.neck=part(this.torso,0,-31);
  this.neck.add(scene.add.ellipse(0,-9,23,26,0xe5b68e));
  this.neck.add(scene.add.ellipse(0,-20,26,12,0x503927));
  this.face=part(this.neck,0,-9);
  this.face.add(scene.add.ellipse(0,3,9,5,0xd59b76));
  this.profileNose=scene.add.ellipse(0,-7,7,6,0xd59b76);this.neck.add(this.profileNose);
  this.face.add(scene.add.circle(-4,-3,1.5,0x302820));
  this.farEye=scene.add.circle(4,-3,1.5,0x302820);this.face.add(this.farEye);
  this.backHair=scene.add.ellipse(0,-10,24,25,0x503927);
  this.neck.add(this.backHair);this.backHair.setVisible(false);
  this.helmet=scene.add.ellipse(0,-19,28,16,0x84919a).setVisible(false);this.neck.add(this.helmet);
  if(this.classId==='cannoneer'){this.neck.add(scene.add.ellipse(0,2,21,16,0xa36d3d));this.hips.scaleY=.83;}
  this.leftArm=bone(this.torso,-16,-25,10,16,0xcba47f);
  this.leftForearm=bone(this.leftArm,0,15,9,16,0xd4ac86);
  this.rightArm=bone(this.torso,16,-25,10,16,0xcba47f);
  this.rightForearm=bone(this.rightArm,0,15,9,16,0xd4ac86);
  this.hand=part(this.rightForearm,0,17);
  this.hand.add(scene.add.circle(0,0,5,0xd4ac86));
  this.hand.add(scene.add.rectangle(0,0,7,9,0x634c37));
  this.sword=part(this.hand,0,2); // Common weapon pivot retained for all poses.
  const blade=(parent,length=35,width=5)=>{parent.add(scene.add.rectangle(0,length/2,width,length,0xb9cbd3));parent.add(scene.add.triangle(0,length-1,-width/2,0,0,8,width/2,0,0xe5eef0));parent.add(scene.add.rectangle(0,-3,17,4,0x9a7d4e));};
  if(this.classId==='archer'){
   this.sword.add(scene.add.ellipse(0,19,27,51,0x956a3b,0).setStrokeStyle(4,0x956a3b));
   this.sword.add(scene.add.rectangle(-9,19,1,46,0xe8d7a5));
   this.sword.add(scene.add.rectangle(0,20,3,37,0xcfb27a));
  }else if(this.classId==='mage'){
   this.sword.add(scene.add.rectangle(0,20,5,49,0x745237));
   this.magicOrb=scene.add.circle(0,47,9,0x77c7eb);this.sword.add(this.magicOrb);
   this.sword.add(scene.add.circle(0,47,4,0xe0faff));
  }else if(this.classId==='cannoneer'){
   this.sword.add(scene.add.rectangle(0,16,17,32,0x4a5159));
   this.sword.add(scene.add.rectangle(0,5,23,9,0x987242));
   this.sword.add(scene.add.ellipse(0,32,19,9,0xa1a9ad));
   this.sword.add(scene.add.ellipse(0,33,11,5,0x24292d));
  }else if(this.classId==='assassin'){
   blade(this.sword,20,5);this.offHand=part(this.leftForearm,0,17);blade(this.offHand,19,5);
  }else{
   blade(this.sword);
   if(this.classId==='paladin'){this.shield=part(this.leftForearm,0,12);this.shield.add(scene.add.ellipse(0,5,28,36,0x9c8750));this.shield.add(scene.add.ellipse(0,5,21,29,0x586b83));this.shield.add(scene.add.rectangle(0,5,4,22,0xe0d4a0));this.shield.add(scene.add.rectangle(0,1,15,4,0xe0d4a0));}
  }
  this.gearSignature='';
 }
 update(dt,axis,attacking,angle){
  this.updateEquipment();
  const m=Math.min(1,Math.hypot(axis.x,axis.y));
  this.blend+=(m-this.blend)*Math.min(1,dt*10);
  this.t+=dt*(3+this.blend*10);
  const s=Math.sin(this.t),c=Math.cos(this.t);
  const run=this.blend;
  this.hips.y=-17+Math.abs(s)*2.5*run;
  this.hips.rotation=.035*s*run;
  this.torso.rotation=-.055*s*run;
  this.neck.rotation=.025*s*run;
  const pose=gaitPose(this.t,angle,run);
  this.leftThigh.rotation=pose.leftHip;
  this.rightThigh.rotation=pose.rightHip;
  this.leftShin.rotation=pose.leftKnee;
  this.rightShin.rotation=pose.rightKnee;
  this.leftArm.rotation=pose.leftArmSwing+.12;
  this.rightArm.rotation=pose.rightArmSwing-.12;
  const travelSign=Math.cos(angle)<0?-1:1;
  this.leftForearm.rotation=-.15-Math.max(0,s)*.24*run;
  this.rightForearm.rotation=-.25-Math.max(0,-s)*.24*run;
  // Attack timing is controlled by AttackCycle; the rig only draws the pose.
  // Rotate toward the joystick direction before posing the weapon.
  this.direction=lerpAngle(this.direction,angle,Math.min(1,dt*11));
  this.sword.y=2;
  this.sword.rotation=0;
  if(attacking?.active){
   const progress=attacking.progress,aim=this.direction-Math.PI/2;
   if(['archer','mage','cannoneer'].includes(this.classId)){
    // Ranged attacks aim steadily, then recoil; they never sweep like a sword.
    const release=Math.max(0,1-Math.abs(progress-.65)/.18);
    this.rightArm.rotation=aim-this.hips.rotation-this.torso.rotation;
    this.rightForearm.rotation=this.classId==='archer'?-.12:-.08-release*.2;
    this.leftArm.rotation=aim+(this.classId==='archer'?-.4:.25);
    this.leftForearm.rotation=this.classId==='archer'?-.9* Math.sin(progress*Math.PI):-.45;
    this.sword.y=2-release*(this.classId==='cannoneer'?7:2);
    if(this.magicOrb)this.magicOrb.alpha=.6+.4*Math.sin(progress*Math.PI);
   }else{
    const {arc,torso}=swingPose(progress,attacking.index);
    this.rightArm.rotation=aim+arc-this.hips.rotation-this.torso.rotation;
    this.rightForearm.rotation=-arc*.25;this.sword.rotation=arc*.18;
    this.torso.rotation+=torso;
    this.leftArm.rotation=this.classId==='assassin'?aim-arc*.8:-.3-Math.sin(progress*Math.PI)*.25;
    if(this.classId==='assassin')this.leftForearm.rotation=arc*.25;
    if(this.classId==='paladin')this.leftForearm.rotation=-.7;
   }
  }else if(this.magicOrb)this.magicOrb.alpha=1;
  // Front, back and three-quarter views with smooth orientation blending.
  const dy=Math.sin(this.direction),dx=Math.cos(this.direction);
  const back=Math.max(0,-dy),side=Math.abs(dx);
  this.root.scaleX=1; // Never mirror the rig: the sword stays in the right hand.
  // Narrow silhouette in profile without mirroring the weapon hand.
  this.torso.scaleX=1-.34*side;
  this.neck.scaleX=1-.28*side;
  this.leftArm.x=-16+6*side;
  this.rightArm.x=16-6*side;
  this.leftThigh.x=-7+4*side;
  this.rightThigh.x=7-4*side;
  // Side running: alternate forward/back foot reach and shoulder swing.
  this.leftThigh.x+=pose.leftFootX;
  this.rightThigh.x+=pose.rightFootX;
  this.leftArm.x+=s*1.2*side*run*travelSign;
  this.rightArm.x-=s*1.2*side*run*travelSign;
  this.face.setVisible(back<.45 && side<.82);
  this.profileNose.setVisible(side>.55);
  this.profileNose.x=Math.sign(dx||1)*(9+2*side);
  this.profileNose.alpha=Math.min(1,(side-.55)*4);
  this.face.x=dx*7;
  this.face.scaleX=1-.4*side;
  this.farEye.setVisible(side<.55);
  this.backHair.setVisible(back>.45);
  this.backHair.scaleX=1-.12*side;
  this.backHair.alpha=Math.min(1,(back-.45)*3);
  this.torso.y=-3+back*2;
  this.hips.scaleX=1-.04*side;
  this.neck.rotation+=dx*.035;
 }
 updateEquipment(){
  const gear=this.hero?.equipment||{};
  const signature=JSON.stringify(['chest','helmet','boots','gloves','pants'].map(slot=>[gear[slot]?.id,gear[slot]?.rarity]));
  if(signature===this.gearSignature)return;this.gearSignature=signature;
  const color=item=>({common:0x84919a,uncommon:0x66876c,rare:0x547ba4,epic:0x8b64a6,legendary:0xb79c51}[item?.rarity]||0x84919a);
  this.chestArmor.setVisible(!!gear.chest);if(gear.chest)this.chestArmor.setFillStyle(color(gear.chest));
  this.helmet.setVisible(!!gear.helmet);if(gear.helmet)this.helmet.setFillStyle(color(gear.helmet));
  this.leftBoot.setFillStyle(gear.boots?color(gear.boots):0x302b27);this.rightBoot.setFillStyle(gear.boots?color(gear.boots):0x302b27);
  for(const limb of [this.leftThigh,this.rightThigh])for(const shape of limb.list.slice(0,2))shape.setFillStyle(gear.pants?color(gear.pants):0x45404a);
  for(const limb of [this.leftForearm,this.rightForearm])for(const shape of limb.list.slice(0,2))shape.setFillStyle(gear.gloves?color(gear.gloves):0xd4ac86);
 }

}
