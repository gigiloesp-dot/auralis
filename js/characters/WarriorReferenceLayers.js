import {WARRIOR_BOOT_PIVOTS} from './warriorBootPivots.js';
import {ActorTextureCache} from '../assets/ActorTextureCache.js';
import {warriorEquipmentArt} from '../assets/warriorEquipmentArt.js';
import {WARRIOR_NATIVE_SOCKETS,warriorSockets,WARRIOR_DEPTH} from './warriorCalibration.js';
import {WARRIOR_SWORD_PIVOTS} from './warriorSwordPivots.js';
const SLOTS=['weapon','helmet','chest','gloves','pants','boots','shield'];
const TINT={common:0xffffff,uncommon:0xe5ffe9,rare:0xdeecff,epic:0xf5e2ff,legendary:0xffe0a8};
const idleAngles={e:.28,se:.30,s:.60,sw:.72,w:.72,nw:.70,n:.40,ne:.30};
const hypot=(a,b)=>Math.hypot(b.x-a.x,b.y-a.y);
function textureCache(scene){
 if(!scene.equipmentTextures||scene.equipmentTextures.closed){
  class EquipmentCache extends ActorTextureCache{
   flush(){const next=this.scene.equipmentTextures;if(!this.closed||!next||next===this)return super.flush();for(const key of this.lateKeys||[])if(!next.entries.has(key)&&this.scene.textures.exists(key))this.scene.textures.remove(key);this.lateKeys=null;this.scene.load.off('complete',this.complete);}
  }
  const cache=scene.equipmentTextures=new EquipmentCache(scene);scene.events.once('shutdown',()=>{cache.destroy();if(scene.equipmentTextures===cache)scene.equipmentTextures=null;if(scene.equipmentArmMask){scene.textures.remove(scene.equipmentArmMask.key);scene.equipmentArmMask=null;}});
 }
 return scene.equipmentTextures;
}
// Copies original painted arm pixels for anatomical occlusion. These masks are
// not armour art and never modify the preserved body PNG or the hero's data.
function acquireArms(scene,entry){
 if(!scene.equipmentArmMask){
  const key='equipment-warrior-reference-arm-masks',canvas=document.createElement('canvas');canvas.width=1024;canvas.height=1024;const ctx=canvas.getContext('2d'),source=scene.textures.get(entry.key).getSourceImage(),frames={};let index=0;
  for(const [name,p]of Object.entries(WARRIOR_NATIVE_SOCKETS))for(const side of ['right','left']){
   const a=p[side+'Shoulder'],b=p[side+'Elbow'],c=p[side+'Hand'],start={x:a.x+(b.x-a.x)*.34,y:a.y+(b.y-a.y)*.34};
   const x=Math.max(0,Math.floor(Math.min(start.x,b.x,c.x)-10)),y=Math.max(0,Math.floor(Math.min(start.y,b.y,c.y)-10)),w=Math.min(192-x,Math.ceil(Math.max(start.x,b.x,c.x)+10-x)),h=Math.min(256-y,Math.ceil(Math.max(start.y,b.y,c.y)+10-y));
   const dx=(index%8)*128,dy=Math.floor(index/8)*128,body=scene.textures.get(entry.key).get(name);ctx.save();ctx.beginPath();ctx.rect(dx,dy,128,128);ctx.clip();ctx.translate(dx-x,dy-y);ctx.beginPath();ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=17;ctx.moveTo(start.x,start.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.strokeStyle='#fff';ctx.stroke();ctx.globalCompositeOperation='source-in';ctx.drawImage(source,body.cutX,body.cutY,192,256,0,0,192,256);ctx.restore();
   // source-in is clipped to this tile: otherwise the next arm would erase it.
   frames[name+'/'+side]={x:dx,y:dy,w,h,offset:{x,y}};index++;
  }
  const texture=scene.textures.addCanvas(key,canvas);for(const [name,f]of Object.entries(frames))texture.add(name,0,f.x,f.y,f.w,f.h);
  scene.equipmentArmMask={key,frames,refs:0};
 }
 scene.equipmentArmMask.refs++;let released=false;const record=scene.equipmentArmMask;
 return {record,release(){if(released)return;released=true;record.refs--;if(!record.refs&&scene.equipmentArmMask===record){scene.textures.remove(record.key);scene.equipmentArmMask=null;}}};
}
export class WarriorReferenceLayers{
 constructor(scene,hero,entry,front,parent,body){
  this.scene=scene;this.hero=hero;this.entry=entry;this.cache=textureCache(scene);this.records={};this.parts={};this.destroyed=false;this.front=scene.add.container(0,0);front.add(this.front);
  this.bodyWrapper=scene.add.container(0,0);parent.add(this.bodyWrapper);this.back=scene.add.container(0,0);this.bodyWrapper.add(this.back);this.bodyWrapper.add(body);
  this.arms={};this.visibleParts=0;
 }
 request(){
  for(const slot of SLOTS){const art=warriorEquipmentArt(this.hero,slot),old=this.records[slot];if(old?.art===art)continue;if(old){old.lease.release();delete this.records[slot];}if(art)this.records[slot]={art,lease:this.cache.acquire(art)};}
 }
 get pending(){return Object.values(this.records).filter(r=>!this.scene.textures.exists(r.art.key)).length;}
 replaces(slot){return !!this.active?.has(slot);}
 image(name,slot,frame,back=false){
  const record=this.records[slot];if(!record||!this.scene.textures.exists(record.art.key))return null;
  let n=this.parts[name];if(!n){n=this.scene.add.image(0,0,record.art.key,frame);this.parts[name]=n;}
  const parent=back?this.back:this.front;parent.add(n);parent.bringToTop(n);n.setTexture(record.art.key,frame).setVisible(true).setFlipX(false).setRotation(0).setTint(TINT[this.hero.equipment[slot]?.rarity]||TINT.common);this.visibleParts++;return n;
 }
 update(frame,direction,state,pose,transform){
  if(this.destroyed)return;this.request();for(const n of Object.values(this.parts))n.setVisible(false);for(const n of Object.values(this.arms))n.setVisible(false);this.visibleParts=0;this.active=new Set();
  const a=warriorSockets(this.entry,frame),native=WARRIOR_NATIVE_SOCKETS[frame],depth=WARRIOR_DEPTH[direction],scale=this.entry.scale;if(!a)return;
  this.back.setPosition(0,transform.y||0).setRotation(transform.rotation||0).setScale(1,transform.scaleY||1).setAlpha(state==='death'?.5:state==='hurt'?.7:1);this.front.setScale(1,transform.scaleY||1);
  const available=slot=>{if(!this.records[slot]||!this.scene.textures.exists(this.records[slot].art.key))return false;this.active.add(slot);return true;};
  if(available('pants')){
   const waist=this.image('waist','pants','waist/'+direction);waist.setOrigin(.5,0).setPosition(a.hips.x,a.hips.y-14*scale).setDisplaySize((Math.abs(native.rightHip.x-native.leftHip.x)+29)*scale,28*scale);
   for(const side of ['left','right'].sort((s,t)=>a[s+'Foot'].y-a[t+'Foot'].y)){
    const hip=a[side+'Hip'],knee=a[side+'Knee'],foot=a[side+'Foot'],ankle=a[side+'Ankle'],leftHalf=native[side+'Hip'].x<native[(side==='left'?'right':'left')+'Hip'].x;
    for(const [part,from,to,width]of [['thigh',hip,knee,22],['shin',knee,ankle,18]]){
     const n=this.image(part+'-'+side,'pants',part+'-'+(leftHalf?'left':'right')+'/'+direction);n.setOrigin(.5,.04).setPosition(from.x,from.y).setDisplaySize(width*scale,hypot(from,to)+5*scale).setRotation(Math.atan2(to.y-from.y,to.x-from.x)-Math.PI/2);
    }
   }
   this.front.bringToTop(waist);
  }
  if(available('chest')){
   const n=this.image('chest','chest',frame),neck=a.neck;const width=(Math.abs(native.rightShoulder.x-native.leftShoulder.x)+24)*scale;
   n.setOrigin(.5,0).setPosition(neck.x,neck.y-5*scale).setDisplaySize(width,hypot(neck,a.hips)+14*scale).setRotation(Math.atan2(a.hips.y-neck.y,a.hips.x-neck.x)-Math.PI/2);
  }
  if(available('boots'))for(const side of ['left','right'].sort((s,t)=>a[s+'Foot'].y-a[t+'Foot'].y)){
   const foot=a[side+'Foot'],knee=a[side+'Knee'],ankle=a[side+'Ankle'],half=native[side+'Foot'].x<native[(side==='left'?'right':'left')+'Foot'].x?'left':'right';
   const n=this.image('boot-'+side,'boots',half+'/'+direction);const pivot=WARRIOR_BOOT_PIVOTS[half+'/'+direction];n.setOrigin(pivot.bootPivot[0]/n.frame.realWidth,pivot.bootPivot[1]/n.frame.realHeight).setPosition(ankle.x,ankle.y+scale).setDisplaySize(n.frame.realWidth/n.frame.realHeight*46*scale,46*scale).setRotation(Math.atan2(ankle.y-knee.y,ankle.x-knee.x)-Math.PI/2-pivot.bootAngle);
  }
  if(available('shield')){
   const n=this.image('shield','shield',frame,!depth.leftNear),hand=a.leftHand,elbow=a.leftElbow;n.setOrigin(.5,.45).setPosition((hand.x+elbow.x)/2,(hand.y+elbow.y)/2+3*scale).setScale(scale*.72);
  }
  this.weaponImage=null;
  if(available('weapon')){
   const n=this.image('sword','weapon',frame,!depth.rightNear),p=WARRIOR_SWORD_PIVOTS[frame];
   n.setOrigin(p.grip[0]/n.frame.realWidth,p.grip[1]/n.frame.realHeight).setPosition(a.rightHand.x,a.rightHand.y).setScale(scale*1.08).setRotation((['attack','special'].includes(state)&&frame.startsWith('attack')?(Number.isFinite(pose.aimAngle)?pose.aimAngle:0):Math.PI*idleAngles[direction])-p.angle);this.weaponImage=n;this.weaponTip=p.tip;
  }
  const needArms=this.active.has('chest')||this.active.has('weapon');
  if(needArms&&!this.armLease)this.armLease=acquireArms(this.scene,this.entry);else if(!needArms&&this.armLease){this.armLease.release();this.armLease=null;}
  if(this.armLease)for(const side of ['left','right'])if(depth[side+'Near']){
   const data=this.armLease.record.frames[frame+'/'+side];let n=this.arms[side];if(!n){n=this.scene.add.image(0,0,this.armLease.record.key,frame+'/'+side);this.front.add(n);this.arms[side]=n;}
   n.setTexture(this.armLease.record.key,frame+'/'+side).setOrigin(0,0).setScale(scale).setPosition((data.offset.x-96)*scale,(data.offset.y-this.entry.baselines[frame.split('/')[0]])*scale).setVisible(true);this.front.bringToTop(n);
  }
  if(available('gloves'))for(const side of ['left','right']){
   const hand=a[side+'Hand'],elbow=a[side+'Elbow'],half=native[side+'Hand'].x<native[(side==='left'?'right':'left')+'Hand'].x?'left':'right',n=this.image('glove-'+side,'gloves',half+'/'+direction);
   n.setOrigin(.5,.65).setPosition(hand.x,hand.y).setDisplaySize(23*scale,29*scale).setRotation(Math.atan2(hand.y-elbow.y,hand.x-elbow.x)-Math.PI/2);
  }
  if(available('helmet')){const n=this.image('helmet','helmet',frame);n.setOrigin(.5,.5).setPosition(a.head.x,a.head.y-3*scale).setDisplaySize(57*scale,57*scale);}
 }
 weaponMuzzleScreen(){if(!this.weaponImage?.visible)return null;const n=this.weaponImage;return n.getWorldTransformMatrix().transformPoint(this.weaponTip[0]-n.displayOriginX,this.weaponTip[1]-n.displayOriginY,{});}
 destroy(){if(this.destroyed)return;this.destroyed=true;for(const r of Object.values(this.records))r.lease.release();this.records={};this.armLease?.release();this.armLease=null;this.front.destroy();this.back.destroy();this.bodyWrapper.destroy();}
}
