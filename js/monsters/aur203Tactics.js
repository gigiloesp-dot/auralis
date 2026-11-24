// Optional tactics for new species. Unconfigured monsters retain their exact
// existing intent/damage; this module does not install any runtime hooks.
import {leashRadius,markMonsterThreat} from './monsterBehavior.js';

export const AUR203_TACTIC_DEFAULTS=Object.freeze({
 retreat:Object.freeze({triggerRatio:.28,recoverRatio:.45,distance:96,durationMs:1600,pauseMs:450,cooldownMs:5500,speedMultiplier:.85,threatRange:240}),
 guard:Object.freeze({windupMs:850,durationMs:1800,cooldownMs:7500,damageMultiplier:.55,range:160}),
 pack:Object.freeze({radius:180,cooldownMs:1200,maxAllies:4,maxCandidates:64})
});
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const finite=(value,fallback,minimum,maximum)=>Number.isFinite(value)?Math.max(minimum,Math.min(maximum,value)):fallback;
function configured(monster,key){
 const value=monster?.kind?.behaviorConfig?.[key];
 return value&&typeof value==='object'&&!Array.isArray(value)&&value.enabled!==false?value:null;
}
function settings(monster,key){
 const value=configured(monster,key);if(!value)return null;
 const defaults=AUR203_TACTIC_DEFAULTS[key];
 if(key==='retreat'){
  const triggerRatio=finite(value.triggerRatio,defaults.triggerRatio,.05,.65);
  return {triggerRatio,recoverRatio:finite(value.recoverRatio,defaults.recoverRatio,triggerRatio+.05,.95),distance:finite(value.distance,defaults.distance,28,140),durationMs:finite(value.durationMs,defaults.durationMs,400,2400),pauseMs:finite(value.pauseMs,defaults.pauseMs,100,800),cooldownMs:finite(value.cooldownMs,defaults.cooldownMs,2500,15000),speedMultiplier:finite(value.speedMultiplier,defaults.speedMultiplier,.35,1),threatRange:finite(value.threatRange,defaults.threatRange,70,300)};
 }
 if(key==='guard')return {windupMs:finite(value.windupMs,defaults.windupMs,450,1500),durationMs:finite(value.durationMs,defaults.durationMs,500,3000),cooldownMs:finite(value.cooldownMs,defaults.cooldownMs,3000,15000),damageMultiplier:finite(value.damageMultiplier,defaults.damageMultiplier,.3,.9),range:finite(value.range,defaults.range,70,220)};
 return {radius:finite(value.radius,defaults.radius,60,260),cooldownMs:finite(value.cooldownMs,defaults.cooldownMs,500,10000),maxAllies:Math.floor(finite(value.maxAllies,defaults.maxAllies,1,6)),maxCandidates:defaults.maxCandidates};
}
function stopGuard(state){state.guard?.marker?.destroy?.();state.guard=null;}
export function cancelAur203Tactics(monster){
 const state=monster?.aur203Tactics;if(!state)return;
 stopGuard(state);state.retreat=null;state.retreatPauseUntil=0;
}
function movementPoint(monster,point,canOccupy,canTraverse){
 const home={x:monster.homeX??monster.x,y:monster.homeY??monster.y};
 const camp={x:monster.campX??home.x,y:monster.campY??home.y};
 const campRadius=Math.max(35,Number.isFinite(monster.campRadius)?monster.campRadius:75);
 return Number.isFinite(point.x)&&Number.isFinite(point.y)
  &&distance(point,home)<=leashRadius(monster)-5
  &&distance(point,camp)<=campRadius-8
  &&canOccupy(point.x,point.y)
  &&canTraverse(monster,point);
}
function retreatTarget(monster,hero,config,canOccupy,canTraverse){
 const away=Math.atan2(monster.y-hero.y,monster.x-hero.x);
 // At most21 direct local probes, once per retreat attempt. No route search.
 for(const scale of [1,.65,.4])for(const offset of [0,.45,-.45,.9,-.9,1.35,-1.35]){
  const point={x:monster.x+Math.cos(away+offset)*config.distance*scale,y:monster.y+Math.sin(away+offset)*config.distance*scale};
  if(distance(point,hero)<=distance(monster,hero)+8)continue;
  if(movementPoint(monster,point,canOccupy,canTraverse))return point;
 }
 return null;
}
function retreatIntent(context,state,config){
 if(!config)return null;
 const {monster,hero,now,intent,canOccupy,canTraverse}=context;
 const hpRatio=monster.hp/monster.maxHp;
 if(!Number.isFinite(hpRatio)||hpRatio>=config.recoverRatio){state.retreat=null;state.retreatPauseUntil=0;return null;}
 if(state.retreat){
  if(now>=state.retreat.until||distance(monster,state.retreat.target)<=10){
   state.retreat=null;state.retreatPauseUntil=now+config.pauseMs;state.nextRetreatAt=now+config.cooldownMs;
  }else if(!movementPoint(monster,state.retreat.target,canOccupy,canTraverse)){
   state.retreat=null;state.nextRetreatAt=now+config.cooldownMs;return null;
  }else return {...intent,...state.retreat.target,speed:Math.max(0,intent.speed)*config.speedMultiplier,aur203Tactic:'retreat'};
 }
 if(now<(state.retreatPauseUntil||0))return {...intent,x:monster.x,y:monster.y,speed:0,aur203Tactic:'retreat-pause'};
 if(hpRatio>config.triggerRatio||now<(state.nextRetreatAt||0)||distance(monster,hero)>config.threatRange)return null;
 const target=retreatTarget(monster,hero,config,canOccupy,canTraverse);
 if(!target){state.nextRetreatAt=now+config.cooldownMs;return null;}
 state.retreat={target,until:now+config.durationMs};
 return {...intent,...target,speed:Math.max(0,intent.speed)*config.speedMultiplier,aur203Tactic:'retreat'};
}

// Apply after monsterIntent, before preferred-distance steering/normal movement.
// canOccupy/canTraverse must use this monster's real ground/flight/wall rules.
// Missing movement callbacks fail closed: no unchecked retreat destination.
export function updateAur203Tactics({monster,hero,now,intent,safe=false,canOccupy=()=>false,canTraverse=()=>false,warn}){
 const retreat=settings(monster,'retreat'),guard=settings(monster,'guard');
 if(!retreat&&!guard)return intent;
 if(!Number.isFinite(now))return intent;
 const existing=monster.aur203Tactics;
 if(!monster.alive||!(hero?.hp>0)||safe||monster.returning||intent.returning||!intent.engaged){
  if(existing)cancelAur203Tactics(monster);
  return intent;
 }
 const state=existing||(monster.aur203Tactics={});
 const fleeing=retreatIntent({monster,hero,now,intent,canOccupy,canTraverse},state,retreat);
 if(fleeing){stopGuard(state);return fleeing;}
 if(!guard){if(state.guard)stopGuard(state);return intent;}
 if(state.guard){
  if(now>=state.guard.until||intent.visible===false||distance(monster,hero)>guard.range){stopGuard(state);return intent;}
  if(now>=state.guard.activeAt&&state.guard.marker){state.guard.marker.destroy?.();state.guard.marker=null;}
  return {...intent,x:monster.x,y:monster.y,speed:0,aur203Tactic:now<state.guard.activeAt?'guard-windup':'guard'};
 }
 if(now<(state.nextGuardAt||0)||intent.visible===false||distance(monster,hero)>guard.range||typeof warn!=='function')return intent;
 const marker=warn({kind:'aur203-guard',x:monster.x,y:monster.y,radius:36,duration:guard.windupMs});
 // Do not enable mitigation when no readable warning could be created.
 if(!marker)return intent;
 state.guard={activeAt:now+guard.windupMs,until:now+guard.windupMs+guard.durationMs,marker};
 state.nextGuardAt=state.guard.until+guard.cooldownMs;
 return {...intent,x:monster.x,y:monster.y,speed:0,aur203Tactic:'guard-windup'};
}

// Apply once to already-calculated incoming hero damage, before HP subtraction.
// This does not alter item stats, normal defence, damage RNG, or cooldowns.
export function aur203IncomingDamage(monster,amount,now){
 const config=settings(monster,'guard'),guard=monster?.aur203Tactics?.guard;
 if(!config||!guard||!Number.isFinite(now)||!monster.alive||monster.returning||!Number.isFinite(amount)||amount<=0||now<guard.activeAt||now>=guard.until)return amount;
 return Math.min(amount,Math.max(1,Math.round(amount*config.damageMultiplier)));
}

// Invoke on an actual received hit, with only the caller's nearby sorted array.
// Both source and allies must opt in; no scan of all world objects or any damage.
export function alertAur203Pack({monster,attacker,now,nearby,canSee,safe=false}){
 const config=settings(monster,'pack');
 if(!config||!Number.isFinite(now)||!Number.isFinite(monster.x)||!Number.isFinite(monster.y)||safe||!monster.alive||monster.returning||!monster.campId||!attacker||!Number.isFinite(attacker.x)||!Number.isFinite(attacker.y)||!(attacker.hp>0)||typeof canSee!=='function'||!Array.isArray(nearby))return [];
 const state=monster.aur203Tactics||(monster.aur203Tactics={});
 if(now<(state.nextPackAlertAt||0))return [];
 state.nextPackAlertAt=now+config.cooldownMs;
 const alerted=[],visited=new Set();
 for(let i=0;i<Math.min(config.maxCandidates,nearby.length)&&alerted.length<config.maxAllies;i++){
  const ally=nearby[i];
  if(!ally||ally===monster||visited.has(ally))continue;visited.add(ally);
  if(!configured(ally,'pack')||!Number.isFinite(ally.x)||!Number.isFinite(ally.y)||!ally.alive||ally.returning||ally.campId!==monster.campId||monster.region&&ally.region&&monster.region!==ally.region)continue;
  if(distance(monster,ally)>config.radius||distance(ally,{x:ally.homeX??ally.x,y:ally.homeY??ally.y})>=leashRadius(ally)-5)continue;
  if(distance(attacker,{x:ally.homeX??ally.x,y:ally.homeY??ally.y})>leashRadius(ally))continue;
  if(!canSee(monster,ally)||!canSee(ally,attacker))continue;
  markMonsterThreat(ally,attacker,now);alerted.push(ally);
 }
 return alerted;
}
