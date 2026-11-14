import {combatSpec} from './skillRuntime.js';
// Single source of truth for basic attack timing and 4 sword swing variants.
export const SWORD_SWINGS=Object.freeze([
 {id:'rightSlash',name:'Удар справа',start:-1.05,end:.9,windup:.32,impact:.63},
 {id:'leftSlash',name:'Удар слева',start:.95,end:-.95,windup:.35,impact:.65},
 {id:'overhead',name:'Удар сверху',start:-1.45,end:.35,windup:.41,impact:.70},
 {id:'diagonal',name:'Диагональный удар',start:-.8,end:1.25,windup:.30,impact:.61}
]);
export function attackIntervalMs(hero){
 const level=Math.max(1,Math.min(42,Number(hero?.level)||1));
 const agility=Math.max(0,Number(hero?.stats?.agility)||5);
 const bonus=Math.max(0,Number(hero?.attackSpeedBonus)||0);
 return Math.max(480,Math.round(1250*combatSpec(hero?.classId).attackIntervalMultiplier/(1+(level-1)*.008+Math.max(0,agility-5)*.004+bonus)));
}
export function swingPose(progress,index){
 const move=SWORD_SWINGS[index%SWORD_SWINGS.length],p=Math.max(0,Math.min(1,progress));
 const impact=move.impact,windup=move.windup;
 let arc;
 if(p<windup)arc=move.start-.3*Math.sin(p/windup*Math.PI/2);
 else if(p<impact){const t=(p-windup)/(impact-windup);arc=move.start+(move.end-move.start)*(t*t*(3-2*t));}
 else arc=move.end*(1-(p-impact)/(1-impact));
 return {arc,impact:move.impact,torso:Math.sin(p*Math.PI)*(.12+(index%2)*.04),name:move.id};
}
export class AttackCycle{
 constructor(){this.startedAt=-Infinity;this.interval=1250;this.sequence=0;this.impactDone=true;this.comboLength=4;}
 start(now,hero){
  if(now-this.startedAt<this.interval)return false;
  this.comboLength=['warrior','paladin'].includes(hero.classId)?3:4;
  this.interval=attackIntervalMs(hero);this.startedAt=now;this.impactDone=false;this.sequence++;return true;
 }
 state(now){
  const elapsed=now-this.startedAt;
  if(elapsed<0||elapsed>=this.interval)return {active:false,progress:1,index:(this.sequence-1+this.comboLength)%this.comboLength,impact:false};
  const progress=elapsed/this.interval,index=(this.sequence-1)%this.comboLength;
  const impact=!this.impactDone&&progress>=SWORD_SWINGS[index].impact;
  if(impact)this.impactDone=true;
  return {active:true,progress,index,impact};
 }
}
