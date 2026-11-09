import {ASSET_MANIFEST} from './manifest.js';
export function queueAssets(scene){
 for(const group of Object.values(ASSET_MANIFEST)){
  for(const [key,entry] of Object.entries(group)){
   if(entry?.type==='spritesheet')scene.load.spritesheet(key,entry.url,{frameWidth:entry.frameWidth,frameHeight:entry.frameHeight});
   else if(entry?.type==='image')scene.load.image(key,entry.url);
   else if(entry?.type==='atlas')scene.load.atlas(key,entry.url,entry.atlasURL);
  }
 }
}
