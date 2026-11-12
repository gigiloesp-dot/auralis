// Scene-scoped leases: only nearby actors and the selected hero keep an atlas
// resident. Pending loads share one promise; late callbacks cannot leak textures.
export class ActorTextureCache{
 constructor(scene){this.scene=scene;this.entries=new Map();this.closed=false;this.complete=()=>this.flush();scene.load.on('complete',this.complete);}
 acquire(entry){
  if(this.closed||!entry)return {ready:Promise.resolve(false),release(){}};
  let record=this.entries.get(entry.key);
  if(!record){
   let resolve;const ready=new Promise(done=>resolve=done);record={entry,refs:0,ready,resolve,loaded:this.scene.textures.exists(entry.key)};this.entries.set(entry.key,record);
   if(record.loaded)resolve(true);
   else{const e=entry; if(e.type==='spritesheet')this.scene.load.spritesheet(e.key,e.url,{frameWidth:e.frameWidth,frameHeight:e.frameHeight});else if(e.type==='image')this.scene.load.image(e.key,e.url);else this.scene.load.atlas(e.key,e.url,e.atlasURL);}
  }
  record.refs++;let released=false;
  if(!record.loaded&&!this.scene.load.isLoading())this.scene.load.start();
  return {ready:record.ready,release:()=>{if(released)return;released=true;record.refs=Math.max(0,record.refs-1);if(!record.refs&&record.loaded)this.remove(entry.key,record);}};
 }
 flush(){for(const [key,record]of this.entries){if(record.loaded)continue;record.loaded=this.scene.textures.exists(key);record.resolve(record.loaded&&!this.closed);if(!record.refs||!record.loaded)this.remove(key,record);}}
 remove(key,record){if(this.entries.get(key)!==record)return;if(this.scene.textures.exists(key))this.scene.textures.remove(key);this.entries.delete(key);}
 get diagnostics(){return {actorAtlases:[...this.entries.values()].filter(e=>e.loaded).length,actorLeases:[...this.entries.values()].reduce((n,e)=>n+e.refs,0),actorPending:[...this.entries.values()].filter(e=>!e.loaded).length};}
 destroy(){this.closed=true;this.scene.load.off('complete',this.complete);for(const [key,record]of this.entries){record.resolve(false);this.remove(key,record);}this.entries.clear();}
}
