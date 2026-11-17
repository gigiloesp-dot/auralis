import {getAsset} from './manifest.js';
import {ASSET_DIRECTIONS,createAssetAnimations} from './AssetLoader.js';
export class SpriteAnimator{
 static create(scene,root,classId){
  const entry=getAsset('characters',classId);if(!entry||!scene.textures?.exists(classId)||!scene.add.sprite)return null;
  const keys=createAssetAnimations(scene,classId,entry);if(!keys.length)return null;
  return new SpriteAnimator(scene,root,classId,entry,keys);
 }
 constructor(scene,root,key,entry,keys){this.entry=entry;this.key=key;this.keys=new Set(keys);this.sprite=scene.add.sprite(0,0,key).setOrigin(entry.originX??.5,entry.originY??.92).setScale(entry.scale||1);root.add(this.sprite);}
 update(state,angle,hurt=false,cycleId){
  const direction=ASSET_DIRECTIONS[(Math.round(angle/(Math.PI/4))+8)%8],preferred=`${this.key}:${state}:${direction}`,attack=`${this.key}:attack:${direction}`,idle=`${this.key}:idle:${direction}`;
  const key=this.keys.has(preferred)?preferred:state==='special'&&this.keys.has(attack)?attack:this.keys.has(idle)?idle:null;
  const changedCycle=['attack','special'].includes(state)&&cycleId!==undefined&&cycleId!==this.lastCycle;
  // One-shot clips hold their last frame. New attacks restart even when the
  // previous attack finished without an intervening idle update.
  if(key&&(key!==this.currentKey||changedCycle||state!==this.lastState)){this.sprite.play(key);this.currentKey=key;}
  this.lastCycle=cycleId;this.lastState=state;
  if(hurt)this.sprite.setTint?.(0xffaaaa);else this.sprite.clearTint?.();
 }
 weaponMuzzleScreen(){
  const socket=this.entry.weaponSockets?.[this.sprite.frame?.name]||this.entry.weaponSocket;
  const matrix=this.sprite.getWorldTransformMatrix?.();if(!socket||!Number.isFinite(socket.x)||!Number.isFinite(socket.y)||!matrix?.transformPoint)return null;
  return matrix.transformPoint(socket.x,socket.y,{});
 }
}
