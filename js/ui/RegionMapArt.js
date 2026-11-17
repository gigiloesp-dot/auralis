// A single, view-owned decoded raster. No global texture/bitmap cache and no
// animation loop: the scene still owns live marker updates.
export const regionMapVariant=(width,height)=>Math.abs(width/height-16/9)<=Math.abs(width/height-9/4)?'wide':'ultrawide';
export const mapPoint=(content,point,width,height)=>({x:point.x/content.width*width,y:point.y/content.height*height});
export class RegionMapArt{
 constructor(canvas){this.canvas=canvas;this.generation=0;this.bitmap=null;this.controller=null;this.decoded=0;this.released=0;}
 async load(content,width,height){
  this.release();const started=performance.now(),generation=this.generation,controller=this.controller=new AbortController();const ratio=Math.min(globalThis.devicePixelRatio||1,2,2048/width,1152/height);this.canvas.width=Math.ceil(width*ratio);this.canvas.height=Math.ceil(height*ratio);this.canvas.dataset.region=content.id;this.canvas.dataset.ready='false';
  if(content.dungeon){this.canvas.dataset.ready='true';return;}
  const variant=regionMapVariant(width,height);this.canvas.dataset.variant=variant;
  try{const response=await fetch(`./assets/maps/${content.id}-${variant}.webp`,{signal:controller.signal});if(!response.ok)throw Error(`Region map art ${response.status}`);const bitmap=await createImageBitmap(await response.blob());this.decoded++;
   if(generation!==this.generation){bitmap.close();this.released++;return;}
   this.bitmap=bitmap;this.canvas.getContext('2d',{alpha:false}).drawImage(bitmap,0,0,this.canvas.width,this.canvas.height);this.canvas.dataset.ready='true';this.canvas.dataset.loadMs=(performance.now()-started).toFixed(2);
  }catch(error){if(error.name!=='AbortError'&&generation===this.generation){this.canvas.dataset.error=error.message;console.error('Region map artwork:',error);}}
 }
 release(){this.generation++;this.controller?.abort();this.controller=null;if(this.bitmap){this.bitmap.close();this.bitmap=null;this.released++;}this.canvas.width=0;this.canvas.height=0;}
 destroy(){this.release();}
}
export {regionMapArrivals} from '../world/mapPresentation.js';
