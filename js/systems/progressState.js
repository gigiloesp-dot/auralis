import {normalizeGroundLoot} from '../loot/groundLoot.js';
// Only plain persistent data may cross the save boundary. Phaser/runtime objects
// are rejected rather than traversed, and oversized trees cannot exhaust storage.
const plain=value=>value!==null&&typeof value==='object'&&!Array.isArray(value)&&(Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null);
const safeKey=key=>typeof key==='string'&&key.length>0&&key.length<=160&&!['__proto__','prototype','constructor'].includes(key);
const time=value=>Number.isFinite(value)&&value>=0&&value<=8640000000000000?Math.floor(value):null;
export function copyProgress(value,{maxDepth=8,maxEntries=12000,maxArray=2000}={}){
 let entries=0;const visiting=new WeakSet();
 const visit=(item,depth)=>{
  if(item===null||typeof item==='boolean')return item;
  if(typeof item==='string')return item.length<=2048?item:null;
  if(typeof item==='number')return Number.isFinite(item)?item:null;
  if(depth>=maxDepth||!item||typeof item!=='object'||visiting.has(item))return null;
  if(!Array.isArray(item)&&!plain(item))return null;
  visiting.add(item);const out=Array.isArray(item)?[]:{};
  if(Array.isArray(item)){for(const entry of item.slice(0,maxArray)){if(++entries>maxEntries)break;out.push(visit(entry,depth+1));}}
  else for(const [key,entry] of Object.entries(item)){if(!safeKey(key))continue;if(++entries>maxEntries)break;const copied=visit(entry,depth+1);if(copied!==null||entry===null)out[key]=copied;}
  visiting.delete(item);return out;
 };
 return visit(value,0);
}
export function normalizeWorldState(value){
 const result={monsters:{}};
 if(plain(value?.monsters))for(const [id,state] of Object.entries(value.monsters).slice(0,5000)){
  if(!safeKey(id)||!plain(state))continue;
  const normalized={};
  for(const key of ['deadUntil','killedAt','healthAt','recoverAfter','aggroUntil','lastSeenAt']){const timestamp=time(state[key]);if(timestamp!==null)normalized[key]=timestamp;}
  for(const key of ['x','y','targetX','targetY'])if(Number.isFinite(state[key])&&Math.abs(state[key])<=100000)normalized[key]=state[key];
  if(typeof state.returning==='boolean')normalized.returning=state.returning;
  if(Number.isInteger(state.behaviorSeed)&&state.behaviorSeed>=0&&state.behaviorSeed<=4294967295)normalized.behaviorSeed=state.behaviorSeed;
  if(Number.isFinite(state.hp)&&state.hp>=0)normalized.hp=state.hp;
  if(Object.keys(normalized).length)result.monsters[id]=normalized;
 }
 if(plain(value?.regions))result.regions=copyProgress(value.regions,{maxDepth:5,maxEntries:5000,maxArray:1000})||{};
 if(plain(value?.groundLoot))result.groundLoot=normalizeGroundLoot(value.groundLoot);
 return result;
}
export function normalizeCooldowns(value){
 const result={};if(!plain(value))return result;
 for(const [id,readyAt] of Object.entries(value).slice(0,100)){const timestamp=time(readyAt);if(safeKey(id)&&timestamp!==null)result[id]=timestamp;}
 return result;
}
const strings=value=>Array.isArray(value)?[...new Set(value.filter(x=>safeKey(x)))].slice(0,2000):[];
export function normalizePersistentProgress(data={}){
 const result={worldState:normalizeWorldState(data.worldState),combatCooldowns:normalizeCooldowns(data.combatCooldowns),
  dungeonProgress:plain(data.dungeonProgress)?copyProgress(data.dungeonProgress)||{}:{},
  dungeonSession:plain(data.dungeonSession)?copyProgress(data.dungeonSession,{maxEntries:4000})||null:null,
  discoveredRegions:strings(data.discoveredRegions),discoveredLocations:strings(data.discoveredLocations),returnLocation:null};
 const location=data.returnLocation;
 if(plain(location)&&safeKey(location.region)&&Number.isFinite(location.x)&&Number.isFinite(location.y))result.returnLocation={region:location.region,x:location.x,y:location.y};
 return result;
}
