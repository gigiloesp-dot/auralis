import {GAME_CONFIG} from '../config/gameConfig.js';
const PREFIX='auralis_save_v2_slot_',LEGACY='auralis_save_v1';
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const num=(x,d)=>Number.isFinite(x)?x:d;
const slotOK=s=>Number.isInteger(s)&&s>=1&&s<=GAME_CONFIG.saveSlots;
export const Save={
 activeSlot:1,
 setSlot(s){if(!slotOK(s))throw new RangeError('Invalid slot');this.activeSlot=s;},
 key(s=this.activeSlot){if(!slotOK(s))throw new RangeError('Invalid slot');return PREFIX+s;},
 normalize(d){if(!obj(d)||!Number.isFinite(d.x)||!Number.isFinite(d.y))return null;
 return {version:2,updatedAt:num(d.updatedAt,Date.now()),name:typeof d.name==='string'?d.name.slice(0,16):'',region:typeof d.region==='string'?d.region:'forest',classId:typeof d.classId==='string'?d.classId:'warrior',
 x:d.x,y:d.y,level:Math.max(1,Math.min(GAME_CONFIG.maxLevel,Math.trunc(num(d.level,1)))),xp:Math.max(0,num(d.xp,0)),
 hp:Math.max(0,num(d.hp,100)),mp:Math.max(0,num(d.mp,100)),equipment:obj(d.equipment)?d.equipment:{},
 inventory:Array.isArray(d.inventory)?d.inventory:[],quests:obj(d.quests)?d.quests:{},
 stats:obj(d.stats)?d.stats:{},skillPoints:Math.max(0,num(d.skillPoints,0)),skills:Array.isArray(d.skills)?d.skills:[]};},
 load(s=this.activeSlot){try{let raw=localStorage.getItem(this.key(s));if(!raw&&s===1){const old=localStorage.getItem(LEGACY);if(old){const migrated=this.normalize(JSON.parse(old));if(migrated){this.write(migrated,s);raw=localStorage.getItem(this.key(s));}}}if(!raw)return null;const data=JSON.parse(raw);return data.version===2?this.normalize(data):null;}catch{return null;}},
 write(data,s=this.activeSlot){try{const d=this.normalize(data);if(!d)return false;d.updatedAt=Date.now();localStorage.setItem(this.key(s),JSON.stringify(d));return true;}catch{return false;}},
 list(){return Array.from({length:GAME_CONFIG.saveSlots},(_,i)=>{const slot=i+1,d=this.load(slot);return {slot,exists:!!d,level:d?.level??null,classId:d?.classId??null,name:d?.name??null,updatedAt:d?.updatedAt??null};});},
 delete(s){try{localStorage.removeItem(this.key(s));return true;}catch{return false;}},
 export(s=this.activeSlot){const d=this.load(s);return d?JSON.stringify(d,null,2):null;},
 import(json,s=this.activeSlot){try{const d=this.normalize(JSON.parse(json));return d?this.write(d,s):false;}catch{return false;}}
};