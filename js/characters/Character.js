import {maxResources} from '../systems/attributes.js';
import {getClass} from './classes.js';
const DEFAULT_STATS=Object.freeze({strength:5,endurance:5,agility:5,luck:5,intelligence:5});
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
export function createCharacter(data={}){
 const {id='hero',classId='warrior',x=1200,y=1200,level=1,hp=100,mp=100,xp=0,region='forest',skillPoints=0}=data;
 return {
  id,name:typeof data.name==='string'?data.name:'',classId,x,y,level,hp,mp,xp,region,skillPoints,attributePoints:Math.max(0,Number(data.attributePoints)||0),
  ...maxResources({level,stats:data.stats}),
  stats:{...DEFAULT_STATS,...(object(data.stats)?data.stats:{})},
  equipment:object(data.equipment)?{...data.equipment}:{},
  inventory:Array.isArray(data.inventory)?[...data.inventory]:[],
  quests:object(data.quests)?{...data.quests}:{},
  skills:Array.isArray(data.skills)?[...data.skills]:[],
  animation:'idle',facing:2,speed:225*getClass(classId).speed
 };
}
