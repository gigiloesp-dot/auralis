import {addItem,itemDefinition} from '../equipment/items.js';
export const LOOT_PICKUP_RADIUS=90;
const rarities=new Set(['common','uncommon','rare','epic','legendary']);
const safeKey=s=>typeof s==='string'&&s.length>0&&s.length<=160&&!['__proto__','constructor','prototype'].includes(s);
const plain=x=>x&&typeof x==='object'&&!Array.isArray(x)&&(Object.getPrototypeOf(x)===Object.prototype||Object.getPrototypeOf(x)===null);
const timestamp=x=>Number.isFinite(x)&&x>=0&&x<=8640000000000000;
export function lootCategory(item){const slot=itemDefinition(item)?.slot;return slot==='weapon'?'weapon':['helmet','chest','gloves','pants','boots','shield'].includes(slot)?'armor':'chest';}
export function normalizeGroundLoot(value){
 const state={nextId:Number.isSafeInteger(value?.nextId)&&value.nextId>0?value.nextId:1,drops:{},events:{},pending:{}};
 if(plain(value?.drops))for(const [id,d]of Object.entries(value.drops)){
  if(!safeKey(id)||!plain(d)||!safeKey(d.region)||!Number.isFinite(d.x)||!Number.isFinite(d.y)||d.x<0||d.y<0||d.x>100000||d.y>100000||!plain(d.item)||!itemDefinition(d.item)||!timestamp(d.createdAt))continue;
  const item={id:d.item.id,rarity:rarities.has(d.item.rarity)?d.item.rarity:'common',quantity:Number.isInteger(d.item.quantity)?Math.max(1,Math.min(100,d.item.quantity)):1};
  state.drops[id]={id,region:d.region,x:d.x,y:d.y,item,createdAt:d.createdAt};
  const n=Number(id.replace(/^drop-/,''));if(Number.isSafeInteger(n))state.nextId=Math.max(state.nextId,n+1);
 }
 if(plain(value?.events))for(const [key,at]of Object.entries(value.events))if(safeKey(key)&&timestamp(at))state.events[key]=at;
 if(plain(value?.pending))for(const [key,job]of Object.entries(value.pending)){
  if(!safeKey(key)||!plain(job)||!safeKey(job.region)||!timestamp(job.deathAt)||!Number.isFinite(job.x)||!Number.isFinite(job.y)||job.x<0||job.y<0||job.x>100000||job.y>100000||!Array.isArray(job.items))continue;
  const items=job.items.filter(item=>plain(item)&&itemDefinition(item)).map(item=>({id:item.id,rarity:rarities.has(item.rarity)?item.rarity:'common',quantity:Math.max(1,Math.min(100,Math.trunc(item.quantity)||1))}));
  state.pending[key]={region:job.region,x:job.x,y:job.y,deathAt:job.deathAt,items};
 }
 return state;
}
export function groundLootState(hero){hero.worldState??={monsters:{}};const s=hero.worldState.groundLoot??=normalizeGroundLoot(null);s.drops??={};s.events??={};s.pending??={};s.nextId??=1;return s;}
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
// Deterministic irregular positions, checked in projected space too: the
// isometric vertical compression must not stack independent pickup targets.
export function lootPosition(origin,records,{project=(x,y)=>({x,y}),walkable=()=>true,seed=0}={}){
 const occupied=new Map(),cell=40;
 for(const record of records){const p=project(record.x,record.y),key=Math.floor(p.x/cell)+','+Math.floor(p.y/cell);if(!occupied.has(key))occupied.set(key,[]);occupied.get(key).push(p);}
 const clear=point=>{const p=project(point.x,point.y),cx=Math.floor(p.x/cell),cy=Math.floor(p.y/cell);for(let x=cx-1;x<=cx+1;x++)for(let y=cy-1;y<=cy+1;y++)for(const other of occupied.get(x+','+y)||[])if(Math.abs(p.x-other.x)<30&&Math.abs(p.y-other.y)<40)return false;return true;};
 for(let i=0;i<2400;i++){
  const ring=Math.floor(i/24),angle=(i*2.399963229728653+seed*.71),r=ring===0?18+(i%4)*12:45+ring*10;
  const p={x:origin.x+Math.cos(angle)*r,y:origin.y+Math.sin(angle)*r};
  if(p.x>=12&&p.y>=12&&walkable(p.x,p.y,7)&&clear(p))return p;
 }
 return null;
}
export function materializeGroundDrops(hero,job,{project,walkable}={}){
 const state=groundLootState(hero),{region,deathAt}=job,records=Object.values(state.drops).filter(d=>d.region===region),created=[];
 for(const raw of job.items){
  if(!itemDefinition(raw))continue;
  const position=lootPosition(job,records,{project,walkable,seed:state.nextId});
  if(!position){for(const d of created)delete state.drops[d.id];return {ok:false,reason:'placement',ids:[]};}
  const id='drop-'+state.nextId++,record={id,region,...position,item:{id:raw.id,rarity:rarities.has(raw.rarity)?raw.rarity:'common',quantity:Math.max(1,Math.min(100,Math.trunc(raw.quantity)||1))},createdAt:deathAt};
  records.push(record);created.push(record);state.drops[id]=record;
 }
 return {ok:true,ids:created.map(d=>d.id)};
}
export function createGroundDrops(hero,monster,items,deathAt,{region=hero.region,project,walkable}={}){
 const state=groundLootState(hero),eventKey=monster.key||region+':'+monster.id;
 if(!safeKey(eventKey)||!timestamp(deathAt))return {ok:false,reason:'invalid',ids:[]};
 if(Object.hasOwn(state.events,eventKey)&&state.events[eventKey]>=deathAt)return {ok:false,reason:'duplicate',ids:[]};
 const job={region,x:monster.x,y:monster.y,deathAt,items:items.map(i=>({...i}))};
 const result=materializeGroundDrops(hero,job,{project,walkable});
 state.events[eventKey]=deathAt;
 if(!result.ok)state.pending['pending-'+state.nextId++]=job;
 return result;
}
// Inventory and the persistent removal share one synchronous durable save.
// addItem can partially merge a stack on failure, so it operates on a copy.
export function pickupGroundDrop(hero,id,{save=()=>true,radius=LOOT_PICKUP_RADIUS}={}){
 const state=groundLootState(hero),drop=state.drops[id];
 if(!drop)return {ok:false,reason:'missing'};
 if(hero.hp<=0||hero.region!==drop.region||distance(hero,drop)>radius)return {ok:false,reason:'distance'};
 const original=hero.inventory,working={...hero,inventory:original.map(i=>({...i}))};
 if(!addItem(working,drop.item))return {ok:false,reason:'full'};
 hero.inventory=working.inventory;delete state.drops[id];
 let committed=false;try{committed=save()!==false;}catch{}
 if(!committed){hero.inventory=original;state.drops[id]=drop;return {ok:false,reason:'save'};}
 return {ok:true,item:{...drop.item}};
}
