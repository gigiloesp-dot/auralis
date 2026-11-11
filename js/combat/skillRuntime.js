import {getSkills,skillRank} from '../skills/skillData.js';
export const CLASS_COMBAT=Object.freeze({
 warrior:{range:100,color:0xffd47b},paladin:{range:95,color:0xfff3ad},assassin:{range:80,color:0xbb8cff},
 archer:{range:340,projectile:'arrow',color:0xe9cf93},mage:{range:300,projectile:'magic',color:0x85cfff},cannoneer:{range:290,projectile:'cannonball',color:0xffa15c}
});
const EFFECTS={warrior:['strike','guard','area','rage','execute'],archer:['precise','root','volley','focus','area'],mage:['burn','guard','slow','area','meteor'],paladin:['holy','guard','heal','aura','judgment'],assassin:['backstab','evade','poison','dash','execute'],cannoneer:['charged','guard','cone','rage','meteor']};
export const skillEffect=(classId,index)=>EFFECTS[classId]?.[index]||'strike';
export function combatSpec(classId){return CLASS_COMBAT[classId]||CLASS_COMBAT.warrior;}
export function prepareSkill(hero,id,now,cooldowns=new Map()){
 const skill=getSkills(hero.classId).find(s=>s.id===id),rank=Math.min(5,skillRank(hero,id));
 if(!skill||rank<1||hero.level<skill.level)return {ok:false,reason:'unlearned'};
 if(hero.hp<=0)return {ok:false,reason:'dead'};
 if((cooldowns.get(id)||0)>now)return {ok:false,reason:'cooldown'};
 if(hero.mp<skill.mana)return {ok:false,reason:'mana'};
 return {ok:true,skill,rank,effect:skillEffect(hero.classId,skill.index),multiplier:skill.power/100+(rank-1)*.2,duration:3000+rank*1000};
}
export function commitSkill(hero,cast,now,cooldowns){hero.mp-=cast.skill.mana;cooldowns.set(cast.skill.id,now+cast.skill.cooldown*1000);}
