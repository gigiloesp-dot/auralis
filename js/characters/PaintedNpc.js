import {projectAngle} from '../world/projection.js';
import {ACTOR_DIRECTIONS} from '../assets/actorArt.js';
import {NPC_ART} from '../assets/npcArt.js';
export class PaintedNpc{
 static create(scene,root,npc,fallback){return NPC_ART[npc.id]&&scene.actorTextures?new PaintedNpc(scene,root,npc,fallback):null;}
 constructor(scene,root,npc,fallback){
  this.scene=scene;this.root=root;this.npc=npc;this.entry=NPC_ART[npc.id];this.lease=scene.actorTextures.acquire(this.entry);this.closed=false;this.time=0;
  this.ready=this.lease.ready.then(ok=>{if(!ok||this.closed||!root.scene)return false;this.sprite=scene.add.image(0,0,this.entry.key,npc.id+'/s').setOrigin(.5,this.entry.originY).setScale(this.entry.scale);root.addAt(this.sprite,1);for(const part of fallback)part.destroy();return true;});
 }
 update(hero,dt){if(!this.sprite)return;this.time+=dt;const dx=hero.x-this.npc.x,dy=hero.y-this.npc.y,angle=Math.hypot(dx,dy)<210?projectAngle(Math.atan2(dy,dx)):Math.PI/2,dir=ACTOR_DIRECTIONS[(Math.round(angle/(Math.PI/4))+8)%8];this.sprite.setFrame(this.npc.id+'/'+dir).setScale(this.entry.scale,this.entry.scale*(1+Math.sin(this.time*2.4)*.007));}
 destroy(){if(this.closed)return;this.closed=true;this.sprite?.destroy();this.lease.release();}
}
