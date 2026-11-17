import {GATHERING_NODES,GATHERING_RANGE,GATHERING_RESPAWN_MS} from '../world/gatheringData.js';
import {QUEST_MATERIALS} from '../equipment/questMaterials.js';
import {itemCount} from '../equipment/stacking.js';
export const GATHERING_META='__gatherV1';
export const GATHERING_TEXT=Object.freeze({
 ru:Object.freeze({gather:'Собрать',inventory:'В сумке нет места',distance:'Подойди ближе к растению',cooldown:'Растение ещё не выросло',storage:'Не удалось сохранить сбор',gathered:'Собрано'}),
 en:Object.freeze({gather:'Gather',inventory:'There is no room in the bag',distance:'Move closer to the plant',cooldown:'This plant has not regrown yet',storage:'Gathering could not be saved',gathered:'Gathered'}),
 es:Object.freeze({gather:'Recoger',inventory:'No queda espacio en la bolsa',distance:'Acércate a la planta',cooldown:'Esta planta aún no ha vuelto a crecer',storage:'No se pudo guardar la recolección',gathered:'Recogido'})
});
const nodes=new Map(GATHERING_NODES.map(n=>[n.id,n])),pending=new WeakMap();
const validTime=n=>Number.isSafeInteger(n)&&n>=0&&n<=8640000000000000-GATHERING_RESPAWN_MS;
const total=(inventory,id)=>inventory.reduce((sum,item)=>sum+(item.id===id?itemCount(item):0),0);
export function gatheringNode(id){return nodes.get(id)||null;}
export function gatheringReadyAt(hero,id){
 const meta=hero?.quests?.[GATHERING_META],record=meta?.version===1?meta.nodes?.[id]:null;
 return record&&validTime(record.pickedAt)&&validTime(record.readyAt)&&record.readyAt>=record.pickedAt+GATHERING_RESPAWN_MS?record.readyAt:0;
}
// Read-only query; a renderer may unload and recreate its visual at any time.
export function gatheringAvailability(hero,id,{now=Date.now(),canReach}={}){
 const node=gatheringNode(id);if(!node||!hero||!validTime(now)||!Array.isArray(hero.inventory))return {ok:false,reason:'invalid'};
 if(!(hero.hp>0)||hero.dungeonSession||hero.region!==node.region||!Number.isFinite(hero.x)||!Number.isFinite(hero.y))return {ok:false,reason:'unavailable'};
 if(Math.hypot(hero.x-node.x,hero.y-node.y)>GATHERING_RANGE)return {ok:false,reason:'distance'};
 if(pending.get(hero)?.has(id))return {ok:false,reason:'busy'};
 const readyAt=gatheringReadyAt(hero,id);if(readyAt>now)return {ok:false,reason:'cooldown',readyAt};
 if(canReach&&!canReach(hero,node))return {ok:false,reason:'blocked'};
 return {ok:true,node,readyAt};
}
// insert(hero,item,definition) and persist(hero) must be synchronous. Integration
// passes the real addItem and scene.save after registering QUEST_MATERIALS.
// The helper verifies one actual inserted item rather than trusting a boolean.
export function commitGather(hero,id,{insert,persist,now=Date.now(),canReach}={}){
 const availability=gatheringAvailability(hero,id,{now,canReach});if(!availability.ok)return availability;
 if(typeof insert!=='function'||typeof persist!=='function')return {ok:false,reason:'configuration'};
 const node=availability.node,item={id:node.materialId,rarity:'common',quantity:1},definition=QUEST_MATERIALS[item.id];
 if(!definition)return {ok:false,reason:'invalid'};
 const inventory=hero.inventory,beforeInventory=structuredClone(inventory),beforeQuests=hero.quests,beforeCount=total(inventory,item.id);
 let set=pending.get(hero);if(!set){set=new Set();pending.set(hero,set);}set.add(id);
 const rollback=()=>{inventory.splice(0,inventory.length,...beforeInventory);hero.inventory=inventory;if(beforeQuests===undefined)delete hero.quests;else hero.quests=beforeQuests;};
 try{
  const inserted=insert(hero,item,definition);
  if(inserted===false||inserted?.then||total(hero.inventory,item.id)!==beforeCount+1){rollback();return {ok:false,reason:'inventory'};}
  const previous=hero.quests?.[GATHERING_META],known={};
  for(const [key,value]of Object.entries(previous?.version===1?previous.nodes||{}:{}))if(nodes.has(key)&&validTime(value?.pickedAt)&&validTime(value?.readyAt)&&value.readyAt>=value.pickedAt+GATHERING_RESPAWN_MS)known[key]={pickedAt:value.pickedAt,readyAt:value.readyAt};
  const readyAt=now+GATHERING_RESPAWN_MS;known[id]={pickedAt:now,readyAt};
  hero.quests={...(hero.quests||{}),[GATHERING_META]:{version:1,nodes:known}};
  const saved=persist(hero);if(saved===false||saved?.then){rollback();return {ok:false,reason:'storage'};}
  return {ok:true,nodeId:id,item,readyAt};
 }catch{rollback();return {ok:false,reason:'storage'};}
 finally{set.delete(id);}
}
