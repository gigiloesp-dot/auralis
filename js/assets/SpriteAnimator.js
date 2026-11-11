import {getAsset} from './manifest.js';
import {ASSET_DIRECTIONS,createAssetAnimations} from './AssetLoader.js';
export class SpriteAnimator{
 static create(scene,root,classId){
  const entry=getAsset('characters',classId);if(!entry||!scene.textures?.exists(classId)||!scene.add.sprite)return null;
  const keys=createAssetAnimations(scene,classId,entry);if(!keys.length)return null;
  return new SpriteAnimator(scene,root,classId,entry,keys);
 }
 constructor(scene,root,key,entry,keys){this.key=key;this.keys=new Set(keys);this.sprite=scene.add.sprite(0,0,key).setOrigin(entry.originX??.5,entry.originY??.92).setScale(entry.scale||1);root.add(this.sprite);}
 update(state,angle,hurt=false){
  const direction=ASSET_DIRECTIONS[(Math.round(angle/(Math.PI/4))+8)%8],key=`${this.key}:${state}:${direction}`,fallback=`${this.key}:idle:${direction}`;
  if(this.keys.has(key))this.sprite.play(key,true);else if(this.keys.has(fallback))this.sprite.play(fallback,true);
  if(hurt)this.sprite.setTint?.(0xffaaaa);else this.sprite.clearTint?.();
 }
}
