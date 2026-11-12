import {getRegionContent} from './regionContent.js';
import {REGIONS} from './worldData.js';
import {ChunkWorld} from './ChunkWorld.js';
import {project,unproject,screenDirection} from './projection.js';
import {MonsterSystem} from '../monsters/MonsterSystem.js';
import {respawnAtTown} from './towns.js';
import {DUNGEONS,dungeonContentForHero,enterDungeon,leaveDungeon,recordDungeonBossKill} from '../dungeons/dungeonSystem.js';
import {generateArenaContent} from './arena.js';
import {recordEvent} from '../quests/quests.js';
const validReturn=p=>p&&Object.hasOwn(REGIONS,p.region)&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=20&&p.y>=20&&p.x<=REGIONS[p.region].width-20&&p.y<=REGIONS[p.region].height-20;
const names={ru:{travel:'Перейти',exit:'Выход'},en:{travel:'Travel',exit:'Exit'},es:{travel:'Viajar',exit:'Salir'}};
export class WorldRuntime{
 constructor(scene){this.scene=scene;this.button=document.createElement('button');this.button.className='world-travel';this.button.hidden=true;this.button.onclick=()=>this.travel();document.body.append(this.button);this.load();}
 load(destination,provided){
  const s=this.scene,h=s.hero;if(destination)Object.assign(h,destination);
  if(s.monsters?.hero===h)s.monsters.persistCooldowns?.(s.playNow);this.chunkWorld?.destroy();s.monsters?.destroy();s.closePanels?.();
  const inside=provided||(h.region==='arena'?generateArenaContent(h):dungeonContentForHero(h));if(!inside&&h.dungeonSession){h.dungeonSession=null;h.returnLocation=null;}if(!inside&&!Object.hasOwn(REGIONS,h.region)){h.region='forest';h.x=1030;h.y=1140;h.dungeonSession=null;}
  this.content=inside?{...inside}: {...getRegionContent(h.region),dungeons:DUNGEONS.filter(d=>d.region===h.region)};
  if(this.content.arena){h.dungeonSession=null;const back=validReturn(h.returnLocation)?h.returnLocation:{region:'forest',x:2280,y:1220};this.content.portals=[{id:'arena-exit',...this.content.exit,toRegion:back.region,toX:back.x,toY:back.y,names:{ru:'Выход с арены',en:'Leave arena',es:'Salir de la arena'}}];}
  else if(h.region==='forest')this.content.portals=[...this.content.portals,{id:'arena-entry',x:2280,y:1140,toRegion:'arena',toX:250,toY:600,names:{ru:'Круг испытаний',en:'Circle of trials',es:'Círculo de pruebas'}}];
  if(this.content.exit)this.content.exit={...this.content.exit,id:'exit',names:{ru:'Выход',en:'Exit',es:'Salida'}};
  this.content.portals=this.content.portals.map(p=>p.names?p:{...p,names:Object.fromEntries(['ru','en','es'].map(lang=>[lang,REGIONS[p.toRegion]?.names?.[lang]||p.toRegion]))});s.regionContent=this.content;
  const c=this.content;s.project=(x,y)=>project(x,y,c.height);s.unproject=(x,y)=>unproject(x,y,c.height);
  h.x=Math.max(20,Math.min(c.width-20,h.x));h.y=Math.max(20,Math.min(c.height-20,h.y));
  this.chunkWorld=new ChunkWorld(s,c);
  const p=s.project(h.x,h.y);s.body.setPosition(p.x,p.y);s.cameras.main.setBounds(0,0,(c.width+c.height)*Math.SQRT1_2,(c.width+c.height)*Math.SQRT1_2/2);s.cameras.main.centerOn(p.x,p.y);
  this.chunkWorld.update(h);s.obstacles=this.chunkWorld.obstacles;
  if(!this.isWalkable(h.x,h.y)){
   let found=false;for(let radius=24;radius<=240&&!found;radius+=24)for(let a=0;a<16;a++){const x=h.x+Math.cos(a/8*Math.PI)*radius,y=h.y+Math.sin(a/8*Math.PI)*radius;if(this.isWalkable(x,y)){h.x=x;h.y=y;found=true;break;}}
   if(!found){const start=c.entry||c.spawn||{x:1030,y:1140};Object.assign(h,start);}
  }
  h.discoveredRegions??=[];if(!h.discoveredRegions.includes(h.region))h.discoveredRegions.push(h.region);
  s.monsters=new MonsterSystem(s,h,()=>{s.refreshHud();s.save();},c);
  s.attackCycle&&(s.attackCycle.startedAt=-Infinity);s.controls?.reset();s.refreshHud();s.battleHud?.update();s.mapPanel?.close();s.save();
 }
 update(){const s=this.scene;this.chunkWorld.update(s.hero,s.cameras.main);s.obstacles=this.chunkWorld.obstacles;this.portal=this.content.portals.find(p=>Math.hypot(p.x-s.hero.x,p.y-s.hero.y)<140);this.button.hidden=!this.portal||s.panelsOpen();if(this.portal){const t=names[s.language]||names.ru;this.button.textContent=t.travel+' · '+(this.portal.names?.[s.language]||REGIONS[this.portal.toRegion]?.names?.[s.language]||this.portal.toRegion);}}
 occludes(target){return this.chunkWorld.occludes(target);}
 isWalkable(x,y,r=12){return this.chunkWorld.isWalkable(x,y,r);}
 move(axis,speed,dt){const dir=screenDirection(axis.x,axis.y),h=this.scene.hero,dx=dir.x*speed*dt,dy=dir.y*speed*dt;if(this.isWalkable(h.x+dx,h.y))h.x+=dx;if(this.isWalkable(h.x,h.y+dy))h.y+=dy;return Math.atan2(dir.y,dir.x);}
 travel(){if(!this.portal||this.scene.panelsOpen())return false;const p=this.portal;if(p.toRegion==='arena')this.scene.hero.returnLocation={region:this.scene.hero.region,x:p.x,y:p.y+80};else if(this.content.arena)this.scene.hero.returnLocation=null;this.load({region:p.toRegion,x:p.toX,y:p.toY});return true;}
 enterDungeon(id,difficulty){const result=enterDungeon(this.scene.hero,id,difficulty);if(result.ok)this.load(result.destination,result.content);return result;}
 leaveDungeon(){const result=leaveDungeon(this.scene.hero);if(result.ok)this.load(result.destination);return result;}
 onKill(m){const h=this.scene.hero,session=h.dungeonSession;if(!session||!m.kind?.boss)return;const result=recordDungeonBossKill(h,session.dungeonId,session.difficulty,m.id);if(result.completed)recordEvent(h,'dungeon',{id:session.dungeonId,region:this.content.region});}
 respawn(){const h=this.scene.hero;if(this.content.arena){const back=validReturn(h.returnLocation)?h.returnLocation:{region:'forest',x:2280,y:1220};Object.assign(h,back);h.returnLocation=null;respawnAtTown(h);this.load();}else if(h.dungeonSession){this.leaveDungeon();h.hp=Math.round(h.maxHp*.4);h.mp=Math.round(h.maxMp*.4);}else{respawnAtTown(h);this.load();}this.scene.controls?.reset();}
 get diagnostics(){return {...this.chunkWorld.diagnostics,...this.scene.monsters?.diagnostics,region:this.content.id};}
 destroy(){this.chunkWorld.destroy();this.button.remove();}
}
