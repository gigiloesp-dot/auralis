import {LootPanel} from '../ui/LootPanel.js';
import {createGroundDrops,materializeGroundDrops,groundLootState,lootCategory,pickupGroundDrop,nearbyGroundDrops,pickupNearbyGroundDrops} from './groundLoot.js';
import {itemName} from '../equipment/items.js';
import {worldWalkable} from '../world/chunkGeometry.js';
const labels={ru:{picked:'Подобрано',full:'Инвентарь заполнен',save:'Не удалось сохранить подбор',common:'Обычный',uncommon:'Необычный',rare:'Редкий',epic:'Эпический',legendary:'Легендарный'},en:{picked:'Picked up',full:'Inventory full',save:'Could not save pickup',common:'Common',uncommon:'Uncommon',rare:'Rare',epic:'Epic',legendary:'Legendary'},es:{picked:'Recogido',full:'Inventario lleno',save:'No se pudo guardar la recogida',common:'Común',uncommon:'Inusual',rare:'Raro',epic:'Épico',legendary:'Legendario'}};
const polygon=(g,points)=>{g.beginPath().moveTo(...points[0]);for(const p of points.slice(1))g.lineTo(...p);g.closePath().fillPath().strokePath();};
export class GroundLootSystem{
 constructor(scene,hero){this.scene=scene;this.hero=hero;this.markers=new Map();this.destroyed=false;this.nextUpdate=0;this.nextPendingRetry=0;this.pendingCursor=0;groundLootState(hero);this.panel=typeof document!=='undefined'?new LootPanel(scene,this):null;}
 walkable(x,y,r){return this.scene.regionContent?worldWalkable(this.scene.regionContent,x,y,r):(this.scene.world?.isWalkable(x,y,r)??true);}
 blocked(){return this.hero.hp<=0||this.scene.panelsOpen?.()||globalThis.document?.hidden||globalThis.document?.body?.classList?.contains('menu-open')||(globalThis.window&&window.innerHeight>window.innerWidth);}
 dropMonster(monster,items,deathAt){
  const result=createGroundDrops(this.hero,monster,items,deathAt,{project:(x,y)=>this.scene.project(x,y),walkable:(x,y,r)=>this.walkable(x,y,r)});
  if(result.ok||result.reason==='placement'){this.scene.save();this.update(true);}return result;
 }
 createMarker(drop){
  const s=this.scene,p=s.project(drop.x,drop.y),root=s.add.container(p.x,p.y).setDepth(drop.x+drop.y+2),g=s.add.graphics(),category=lootCategory(drop.item);
  g.fillStyle(0x10170e,.18).fillEllipse(0,4,25,9);
  if(category==='weapon'){
   g.fillStyle(0xd5dcdf,.62).lineStyle(1,0x879397,.6);polygon(g,[[-3,0],[5,-20],[10,-26],[10,-18],[3,3]]);
   g.lineStyle(3,0xabb8bf,.65).lineBetween(-6,-1,6,5).lineStyle(3,0xb7c2c6,.6).lineBetween(-2,3,-5,10);
  }else if(category==='armor'){
   g.fillStyle(0xd1d9dc,.58).lineStyle(1,0x829196,.6);polygon(g,[[-13,-18],[-6,-23],[-3,-18],[3,-18],[6,-23],[13,-18],[10,-10],[7,-13],[8,5],[-8,5],[-7,-13],[-10,-10]]);
  }else{
   g.fillStyle(0x67452b,.95).lineStyle(1.4,0x362a22,1).fillRoundedRect(-13,-10,26,17,2).strokeRoundedRect(-13,-10,26,17,2);
   g.fillStyle(0x87623e,.95).fillRoundedRect(-13,-17,26,10,3).lineStyle(1,0x493521,1).strokeRoundedRect(-13,-17,26,10,3);
   g.lineStyle(1,0x4b3424,.7).lineBetween(-10,-4,10,-4).lineBetween(-10,1,10,1);
   g.fillStyle(0x6b6855,.95).fillRect(-9,-15,3,21).fillRect(6,-15,3,21).fillStyle(0xa38b53,1).fillRect(-2,-8,4,6);
  }
  root.add(g);root.setSize(44,44);
  // InputPlugin adds the display origin before testing a Container hit area.
  // Register the circle over the drawn icon, rather than 22px up and left.
  root.setInteractive(new Phaser.Geom.Circle(root.displayOriginX,root.displayOriginY-7,22),Phaser.Geom.Circle.Contains);
  root.on('pointerdown',(pointer,x,y,event)=>{event?.stopPropagation?.();this.open(drop.id);});
  root.setName('ground-loot-'+drop.id);root.setData('lootId',drop.id);root.setData('category',category);
  this.markers.set(drop.id,{root,category,x:drop.x,y:drop.y});return root;
 }
 update(force=false){
  if(this.destroyed)return;const now=this.scene.playNow||0;if(!force&&now<this.nextUpdate)return;this.nextUpdate=now+150;this.panel?.update();
  const state=groundLootState(this.hero),needed=new Set(),camera=this.scene.cameras?.main,view=camera?.worldView;
  for(const d of Object.values(state.drops)){
   if(d.region!==this.hero.region)continue;const p=this.scene.project(d.x,d.y);
   if(view?(p.x<view.x-60||p.x>view.right+60||p.y<view.y-60||p.y>view.bottom+100):Math.hypot(d.x-this.hero.x,d.y-this.hero.y)>650)continue;
   needed.add(d.id);if(!this.markers.has(d.id))this.createMarker(d);
   const marker=this.markers.get(d.id);marker.root.setVisible(!this.blocked());if(marker.root.input)marker.root.input.enabled=!this.blocked();
  }
  for(const [id,m]of this.markers)if(!needed.has(id)){m.root.destroy();this.markers.delete(id);}
  // A pathological obstructed death never discards its rolled rewards. Retry
  // while the source region is loaded; ordinary saves retain successful drops.
  if(now>=this.nextPendingRetry){
   const jobs=Object.entries(state.pending).filter(([,d])=>d.region===this.hero.region&&Math.hypot(d.x-this.hero.x,d.y-this.hero.y)<650),job=jobs.length?jobs[this.pendingCursor++%jobs.length]:null;
   this.nextPendingRetry=now+2000;
   if(job){const [id,d]=job,r=materializeGroundDrops(this.hero,d,{project:(x,y)=>this.scene.project(x,y),walkable:(x,y,r)=>this.walkable(x,y,r)});if(r.ok){delete state.pending[id];this.scene.save();}}
  }
 }
 visibleDrops(){return [...this.markers].map(([id,m])=>({id,x:m.x,y:m.y,category:m.category}));}
 tryPickup(id){
  if(this.blocked())return {ok:false,reason:'blocked'};
  const result=pickupGroundDrop(this.hero,id,{save:()=>this.scene.save()}),t=labels[this.scene.language]||labels.ru;
  if(result.ok){this.markers.get(id)?.root.destroy();this.markers.delete(id);this.scene.notify?.(t.picked+': '+itemName(result.item,this.scene.language)+' · '+t[result.item.rarity]);this.scene.refreshHud?.();this.panel?.update();}
  else if(t[result.reason])this.scene.notify?.(t[result.reason]);return result;
 }
 nearbyDrops(){return nearbyGroundDrops(this.hero);}
 open(id){if(this.blocked())return {ok:false,reason:'blocked'};if(!this.nearbyDrops().some(d=>d.id===id))return {ok:false,reason:'distance'};this.panel?.show(id);return {ok:true};}
 takeAll(){if(this.blocked())return {picked:[],failed:[{reason:'blocked'}]};const result=pickupNearbyGroundDrops(this.hero,{save:()=>this.scene.save()});for(const {id}of result.picked)if(!groundLootState(this.hero).drops[id]){this.markers.get(id)?.root.destroy();this.markers.delete(id);}this.scene.refreshHud?.();this.panel?.update();return result;}
 clearVisuals(){this.panel?.close();for(const m of this.markers.values())m.root.destroy();this.markers.clear();this.nextUpdate=0;}
 destroy(){if(this.destroyed)return;this.clearVisuals();this.panel?.destroy();this.destroyed=true;}
}
