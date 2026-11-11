import {STORAGE_KEY} from './storageKeys.js';
import {GAME_CONFIG} from '../config/gameConfig.js';
const PREFIX='auralis_save_v2_slot_',LEGACY='auralis_save_v1',MIGRATED='auralis_save_v1_migrated';
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const num=(x,d)=>Number.isFinite(x)?x:d;
const count=(value,fallback)=>Math.max(0,Math.floor(num(value,fallback)));
const slotOK=s=>Number.isInteger(s)&&s>=1&&s<=GAME_CONFIG.saveSlots;
export const Save={
 activeSlot:1,
 setSlot(s){if(!slotOK(s))throw new RangeError('Invalid slot');this.activeSlot=s;},
 backupKey(s=this.activeSlot){return this.key(s)+'_backup';},
 backup(s=this.activeSlot){const raw=localStorage.getItem(this.key(s));if(raw!==null&&localStorage.getItem(this.backupKey(s))===null)localStorage.setItem(this.backupKey(s),raw);return raw;},
 exportBackup(s=this.activeSlot){try{return localStorage.getItem(this.backupKey(s));}catch{return null;}},
 key(s=this.activeSlot){if(!slotOK(s))throw new RangeError('Invalid slot');return PREFIX+s;},
 normalize(d){if(!obj(d)||!Number.isFinite(d.x)||!Number.isFinite(d.y))return null;
 return {version:2,updatedAt:num(d.updatedAt,Date.now()),name:typeof d.name==='string'?d.name.slice(0,16):'',region:typeof d.region==='string'?d.region:'forest',classId:typeof d.classId==='string'?d.classId:'warrior',
 x:d.x,y:d.y,level:Math.max(1,Math.min(GAME_CONFIG.maxLevel,Math.trunc(num(d.level,1)))),xp:Math.max(0,num(d.xp,0)),
 hp:Math.max(0,num(d.hp,100)),mp:Math.max(0,num(d.mp,100)),gold:count(d.gold,0),storageTransaction:typeof d.storageTransaction==='string'?d.storageTransaction.slice(0,128):null,potions:{hp:count(d.potions?.hp,3),mp:count(d.potions?.mp,3)},equipment:obj(d.equipment)?d.equipment:{},
 inventory:Array.isArray(d.inventory)?d.inventory:[],quests:obj(d.quests)?d.quests:{},
 stats:obj(d.stats)?d.stats:{},attributePoints:Math.max(0,num(d.attributePoints,Math.max(0,(num(d.level,1)-1)*3))),skillPoints:Math.max(0,num(d.skillPoints,0)),skills:Array.isArray(d.skills)?d.skills:[],learnedSkills:obj(d.learnedSkills)?d.learnedSkills:{},skillSlots:Array.isArray(d.skillSlots)?d.skillSlots.slice(0,4):[null,null,null,null]};},
 load(s=this.activeSlot){try{let raw=localStorage.getItem(this.key(s));if(!raw&&s===1&&!localStorage.getItem(MIGRATED)){const old=localStorage.getItem(LEGACY);if(old){const migrated=this.normalize(JSON.parse(old));if(migrated){if(this.write(migrated,s)){localStorage.setItem(MIGRATED,'1');raw=localStorage.getItem(this.key(s));}}}}if(!raw)return null;try{this.backup(s);}catch{}const data=JSON.parse(raw);return data.version===2?this.normalize(data):null;}catch{return null;}},
 write(data,s=this.activeSlot){try{const d=this.normalize(data);if(!d)return false;this.backup(s);d.updatedAt=Date.now();localStorage.setItem(this.key(s),JSON.stringify(d));return true;}catch{return false;}},
 list(){return Array.from({length:GAME_CONFIG.saveSlots},(_,i)=>{const slot=i+1,d=this.load(slot);return {slot,exists:!!d,level:d?.level??null,classId:d?.classId??null,name:d?.name??null,updatedAt:d?.updatedAt??null};});},
 resolveStorage(s){try{const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return true;let state;try{state=JSON.parse(raw);}catch{return true;}const pending=state?.pending;if(!pending||pending.slot!==s)return true;const applied=typeof pending.transactionId==='string'&&this.load(s)?.storageTransaction===pending.transactionId;if(!applied&&!this.write(pending.hero,s))return false;delete state.pending;localStorage.setItem(STORAGE_KEY,JSON.stringify(state));return true;}catch{return false;}},
 delete(s){try{const key=this.key(s);if(!this.resolveStorage(s))return false;this.backup(s);if(s===1)localStorage.setItem(MIGRATED,'1');localStorage.removeItem(key);return true;}catch{return false;}},
 export(s=this.activeSlot){const d=this.load(s);return d?JSON.stringify(d,null,2):null;},
 import(json,s=this.activeSlot){try{const d=this.normalize(JSON.parse(json));return d&&this.resolveStorage(s)?this.write(d,s):false;}catch{return false;}}
};