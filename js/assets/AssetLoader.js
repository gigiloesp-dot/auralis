import {ASSET_MANIFEST} from './manifest.js';
export const ASSET_DIRECTIONS=Object.freeze(['e','se','s','sw','w','nw','n','ne']);
export function assetEntries(manifest=ASSET_MANIFEST){return Object.values(manifest).flatMap(group=>Object.entries(group||{}));}
export function validateAsset(entry){
 if(!entry||typeof entry.url!=='string'||!entry.url.trim())return false;
 if(entry.type==='image')return true;
 if(entry.type==='spritesheet')return Number.isInteger(entry.frameWidth)&&entry.frameWidth>0&&Number.isInteger(entry.frameHeight)&&entry.frameHeight>0;
 return entry.type==='atlas'&&typeof entry.atlasURL==='string'&&!!entry.atlasURL;
}
export function queueAssets(scene,manifest=ASSET_MANIFEST){
 for(const [key,entry]of assetEntries(manifest)){
  if(!validateAsset(entry))continue;
  if(entry.type==='spritesheet')scene.load.spritesheet(key,entry.url,{frameWidth:entry.frameWidth,frameHeight:entry.frameHeight});
  else if(entry.type==='image')scene.load.image(key,entry.url);
  else scene.load.atlas(key,entry.url,entry.atlasURL);
 }
}
export function createAssetAnimations(scene,key,entry){
 const keys=[];if(!scene.textures?.exists(key)||!scene.anims||!validateAsset(entry))return keys;
 for(const [state,definition]of Object.entries(entry.states||{}))for(const direction of ASSET_DIRECTIONS){
  const frames=definition.directions?.[direction];if(!Array.isArray(frames)||!frames.length)continue;
  const animationKey=`${key}:${state}:${direction}`;
  if(!scene.anims.exists(animationKey))scene.anims.create({key:animationKey,frames:frames.map(frame=>({key,frame})),frameRate:definition.frameRate||8,repeat:definition.repeat??(['death','hurt','attack','special'].includes(state)?0:-1)});
  keys.push(animationKey);
 }
 return keys;
}
