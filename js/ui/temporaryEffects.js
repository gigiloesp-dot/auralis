import {getSkills} from '../skills/skillData.js';
import {skillEffect} from '../combat/skillRuntime.js';
const timed=new Set(['guard','rage','focus','aura','evade']);
const names={ru:{poison:'Яд',slow:'Замедление'},en:{poison:'Poison',slow:'Slow'},es:{poison:'Veneno',slow:'Ralentización'}};
const cache=new Map();
const skills=(id,lang)=>{const key=id+':'+lang;if(!cache.has(key))cache.set(key,getSkills(id,lang));return cache.get(key);};
export function effectTime(ms){const seconds=Math.ceil(Math.max(0,ms)/1000);return seconds>=60?Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0'):String(seconds);}
// Read the existing simulation clocks; this module never grants or extends a buff.
export function temporaryEffects(hero,buffs={},now=0,language='ru'){
 if(!(hero?.hp>0))return [];
 const result=[];
 for(const skill of skills(hero.classId,language)){
  const effect=skillEffect(hero.classId,skill.index),until=buffs[effect];
  if(timed.has(effect)&&Number.isFinite(until)&&until>now)result.push({id:skill.id,name:skill.name,iconSvg:skill.iconSvg,until,remaining:until-now,time:effectTime(until-now),negative:false});
 }
 for(const [effect,source,index]of [['poison','assassin',2],['slow','mage',2]]){
  const until=hero.monsterAfflictions?.[effect]?.until;
  if(Number.isFinite(until)&&until>now){const skill=skills(source,language)[index];result.push({id:'affliction-'+effect,name:(names[language]||names.ru)[effect],iconSvg:skill.iconSvg,until,remaining:until-now,time:effectTime(until-now),negative:true});}
 }
 return result;
}
