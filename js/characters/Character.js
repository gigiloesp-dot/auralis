import {normalizeInventory} from '../equipment/items.js';
import {maxResources} from '../systems/attributes.js';
import {getClass,CLASSES} from './classes.js';
import {GAME_CONFIG} from '../config/gameConfig.js';
const DEFAULT_STATS=Object.freeze({strength:5,endurance:5,agility:5,luck:5,intelligence:5});
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
export function createCharacter(data={}){
 const number=(value,fallback)=>Number.isFinite(value)?value:fallback;
 const {id='hero',region='forest'}=data;
 const classId=Object.hasOwn(CLASSES,data.classId)?data.classId:'warrior';
 const x=number(data.x,1200),y=number(data.y,1200),level=Math.max(1,Math.min(GAME_CONFIG.maxLevel,Math.floor(number(data.level,1))));
 const stats=Object.fromEntries(Object.entries(DEFAULT_STATS).map(([key,value])=>[key,Math.max(0,number(data.stats?.[key],value))]));
 const resources=maxResources({level,stats});
 const hp=Math.max(0,Math.min(resources.maxHp,number(data.hp,resources.maxHp))),mp=Math.max(0,Math.min(resources.maxMp,number(data.mp,resources.maxMp)));
 const xp=Math.max(0,number(data.xp,0)),skillPoints=Math.max(0,Math.floor(number(data.skillPoints,0)));
 return {
  id,name:typeof data.name==='string'?data.name:'',classId,x,y,level,hp,mp,xp,region,skillPoints,attributePoints:Math.max(0,Math.floor(number(data.attributePoints,0))),
  ...resources,stats,storageTransaction:typeof data.storageTransaction==='string'?data.storageTransaction.slice(0,128):null,gold:Math.max(0,Math.floor(number(data.gold,0))),potions:{hp:Math.max(0,Math.floor(number(data.potions?.hp,3))),mp:Math.max(0,Math.floor(number(data.potions?.mp,3)))},
  equipment:object(data.equipment)?{...data.equipment}:{},
  inventory:normalizeInventory(Array.isArray(data.inventory)?data.inventory:[]),
  quests:object(data.quests)?{...data.quests}:{},
  skills:Array.isArray(data.skills)?[...data.skills]:[],learnedSkills:object(data.learnedSkills)?{...data.learnedSkills}:{},skillSlots:Array.isArray(data.skillSlots)?data.skillSlots.slice(0,4):[null,null,null,null],
  animation:'idle',facing:2,speed:225*getClass(classId).speed
 };
}
