import {GATHERING_ART,GATHERING_NODES} from './gatheringData.js';
import {commitGather,gatheringReadyAt,GATHERING_TEXT} from '../systems/gathering.js';
import {addItem,itemName} from '../equipment/items.js';
import {updateQuestProgress} from '../quests/quests.js';
import {lineClear} from '../combat/geometry.js';
// View-owned resource actors. Physics and inventory remain world-space; no
// timer/RAF or region-sized object set is created for gathering.
export class GatheringSystem{
 constructor(scene,world){this.scene=scene;this.world=world;this.entry=GATHERING_ART;this.markers=new Map();this.lease=null;this.ready=false;this.generation=0;this.nextUpdate=0;this.closed=false;this.needed=[];this.nextRetry=0;}
 blocked(){const s=this.scene;return this.closed||!(s.hero?.hp>0)||s.hero.dungeonSession||s.panelsOpen?.()||globalThis.document?.hidden||globalThis.document?.body?.classList?.contains('menu-open')||globalThis.window?.Auralis?.pauseInterface?.active||(globalThis.window&&window.innerHeight>window.innerWidth);}
 acquire(){
  if(this.lease||performance.now()<this.nextRetry)return;const generation=this.generation,lease=this.lease=this.scene.actorTextures.acquire(this.entry);
  lease.ready.then(ok=>{if(this.closed||generation!==this.generation||this.lease!==lease)return;this.ready=ok;if(ok)this.update(true);else{this.lease=null;lease.release();this.nextRetry=performance.now()+3000;}});
 }
 release(){this.generation++;this.lease?.release();this.lease=null;this.ready=false;}
 // Phaser3.90 removes registered inputs before flushing pending insertions.
 // Destroying a freshly queued object otherwise inserts its dead reference on
 // the next frame. Cancel only this owned root's uncommitted insertions.
 removeMarker(marker){const root=marker.root,pending=this.scene.input?._pendingInsertion;if(Array.isArray(pending))for(let i=pending.length-1;i>=0;i--)if(pending[i]===root)pending.splice(i,1);root.destroy();}
 clear(){for(const marker of this.markers.values())this.removeMarker(marker);this.markers.clear();this.needed=[];this.release();this.nextUpdate=0;this.nextRetry=0;}
 canReach(hero,node){if(!lineClear(hero,node,this.scene.obstacles||[],12))return false;const length=Math.hypot(hero.x-node.x,hero.y-node.y),steps=Math.max(1,Math.ceil(length/12));for(let i=1;i<=steps;i++)if(!this.world.isWalkable(hero.x+(node.x-hero.x)*i/steps,hero.y+(node.y-hero.y)*i/steps,12))return false;return true;}
 tryGather(id){
  if(this.blocked())return {ok:false,reason:'blocked'};
  const s=this.scene,result=commitGather(s.hero,id,{insert:(hero,item)=>addItem(hero,item),persist:()=>s.save(),canReach:(hero,node)=>this.canReach(hero,node)}),text=GATHERING_TEXT[s.language]||GATHERING_TEXT.ru;
  if(result.ok){updateQuestProgress(s);s.npcPanel?.update?.();s.refreshHud?.();s.notify?.(text.gathered+': '+itemName(result.item,s.language));this.update(true);}
  else if(text[result.reason])s.notify?.(text[result.reason]);return result;
 }
 create(node){
  const s=this.scene,frame=s.textures.get(this.entry.key).get(node.materialId),feet=frame?.customData?.feet??this.footline(node.materialId),scale=.26,p=s.project(node.x,node.y),root=s.add.container(p.x,p.y).setDepth(s.depthAt(node.x,node.y));
  root.add(s.add.ellipse(0,2,23,8,0x172218,.13));const sprite=s.add.image(0,0,this.entry.key,node.materialId).setOrigin(.5,feet/256).setScale(scale);root.add(sprite);root.setName('gathering-'+node.id).setData('gatheringNode',node.id);
  const marker={root,sprite,node,centerY:(128-feet)*scale};this.markers.set(node.id,marker);this.hitArea(marker);root.on('pointerdown',(pointer,x,y,event)=>{event?.stopPropagation?.();this.tryGather(node.id);});return marker;
 }
 footline(id){return this.entry.footlines[id]||220;}
 hitArea(marker){const zoom=this.scene.cameras.main.zoom||1,size=Math.max(50,44/zoom),root=marker.root;root.setSize(size,size);if(root.input?.hitArea?.setTo)root.input.hitArea.setTo(root.displayOriginX,root.displayOriginY+marker.centerY,size/2);else root.setInteractive(new Phaser.Geom.Circle(root.displayOriginX,root.displayOriginY+marker.centerY,size/2),Phaser.Geom.Circle.Contains);}
 update(force=false){
  if(this.closed)return;const blocked=this.blocked();for(const marker of this.markers.values()){marker.root.setVisible(!blocked);if(marker.root.input)marker.root.input.enabled=!blocked;}if(blocked)return;
  const tick=performance.now();if(!force&&tick<this.nextUpdate)return;this.nextUpdate=tick+120;const now=Date.now();const s=this.scene,c=this.world.content,view=s.cameras.main.worldView;
  const needed=GATHERING_NODES.filter(node=>node.region===c.id&&this.world.chunkWorld.chunks.has(`${Math.floor(node.x/512)},${Math.floor(node.y/512)}`)&&gatheringReadyAt(s.hero,node.id)<=now).filter(node=>{const p=s.project(node.x,node.y);return p.x>=view.x-70&&p.x<=view.right+70&&p.y>=view.y-20&&p.y<=view.bottom+80;});this.needed=needed;
  const ids=new Set(needed.map(node=>node.id));for(const[id,marker]of this.markers)if(!ids.has(id)){this.removeMarker(marker);this.markers.delete(id);}
  if(!needed.length){if(this.lease)this.release();return;}this.acquire();if(!this.ready)return;
  for(const node of needed){const marker=this.markers.get(node.id)||this.create(node),p=s.project(node.x,node.y);marker.root.setPosition(p.x,p.y).setDepth(s.depthAt(node.x,node.y));this.hitArea(marker);marker.root.setVisible(true);if(marker.root.input)marker.root.input.enabled=true;}
 }
 get diagnostics(){return {visibleGatheringNodes:this.markers.size,gatheringAtlasResident:!!this.lease,gatheringGeneration:this.generation};}
 destroy(){if(this.closed)return;this.clear();this.closed=true;}
}
