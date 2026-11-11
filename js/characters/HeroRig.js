import { gaitPose } from './animations/gait.js';
// Procedural jointed 2.5D hero. All limbs rotate at anatomical pivots.
const lerpAngle=(a,b,t)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*t;
export class HeroRig{
 constructor(scene,root){
  this.root=root;this.t=0;this.blend=0;this.attackPhase=0;this.wasAttacking=false;this.direction=0;
  const part=(parent,x,y)=>{const c=scene.add.container(x,y);parent.add(c);return c;};
  const bone=(parent,x,y,w,h,color)=>{const pivot=part(parent,x,y);pivot.add(scene.add.rectangle(0,h/2,w,h,color).setOrigin(.5,.5));pivot.add(scene.add.circle(0,0,w*.54,color));return pivot;};
  this.hips=part(root,0,-17);
  this.leftThigh=bone(this.hips,-7,0,11,17,0x45404a);
  this.leftShin=bone(this.leftThigh,0,16,9,16,0x302e36);
  this.leftShin.add(scene.add.ellipse(0,17,15,8,0x302b27));
  this.rightThigh=bone(this.hips,7,0,11,17,0x45404a);
  this.rightShin=bone(this.rightThigh,0,16,9,16,0x302e36);
  this.rightShin.add(scene.add.ellipse(0,17,15,8,0x302b27));
  this.torso=part(this.hips,0,-3);
  this.torso.add(scene.add.ellipse(0,-12,29,33,0x536e87));
  this.torso.add(scene.add.ellipse(0,-15,21,22,0x657e91,.5));
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
  this.leftArm=bone(this.torso,-16,-25,10,16,0xcba47f);
  this.leftForearm=bone(this.leftArm,0,15,9,16,0xd4ac86);
  this.rightArm=bone(this.torso,16,-25,10,16,0xcba47f);
  this.rightForearm=bone(this.rightArm,0,15,9,16,0xd4ac86);
  this.hand=part(this.rightForearm,0,17);
  this.hand.add(scene.add.circle(0,0,5,0xd4ac86));
  this.hand.add(scene.add.rectangle(0,0,7,9,0x634c37));
  this.sword=part(this.hand,0,2);
  this.sword.add(scene.add.rectangle(0,15,5,35,0xb9cbd3));
  this.sword.add(scene.add.triangle(0,34,-3,0,0,10,3,0,0xe5eef0));
  this.sword.add(scene.add.rectangle(0,-3,19,4,0x9a7d4e));
 }
 update(dt,axis,attacking,angle){
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
  if(attacking&&!this.wasAttacking){this.attackPhase=.001;}
  this.wasAttacking=attacking;
  // Rotate toward the joystick direction before posing the weapon.
  this.direction=lerpAngle(this.direction,angle,Math.min(1,dt*11));
  this.sword.y=2;
  this.sword.rotation=0;
  if(this.attackPhase>0){
   this.attackPhase+=dt*3.8;
   if(this.attackPhase>=1)this.attackPhase=attacking?.001:0;
   const p=this.attackPhase;
   // Wind-up -> forward strike -> recovery, centered on actual facing angle.
   const arc=p<.22?-.65+(p/.22)*.3:p<.68?-.35+((p-.22)/.46)*1.05:.7-(p-.68)/.32*.7;
   // A hanging arm points down (+PI/2). Align its tip with the facing vector.
   // Keep all rotations on the SAME right shoulder / forearm / hand chain.
   const aim=this.direction-Math.PI/2;
   this.rightArm.rotation=aim+arc-this.hips.rotation-this.torso.rotation;
   this.rightForearm.rotation=-arc*.22;
   this.sword.rotation=arc*.16;
   this.torso.rotation+=Math.sin(Math.min(1,p)*Math.PI)*.1;
  }
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
}
