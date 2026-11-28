// Deterministic encounter simulation. All time is the scene's paused game clock,
// never Date.now(). Balance numbers below are technical proposals for playtesting;
// this module does not claim a measured30-minute kill time or change HP/rewards.
// Integration must bypass ordinary monster abilities/boss windups for this boss.
// Call cancelStoneGiantEncounter on death, unload, disengagement and scene teardown.
export const STONE_GIANT_RULES=Object.freeze({
 introMs:1200,phaseTransitionMs:1900,recoveryMs:650,maxStalledTickMs:2500,
 maxParticipants:16,maxProjectileLeases:8,collisionRadius:48,leashRadius:300,targetLeashExtra:260,
 names:Object.freeze({ru:Object.freeze(['Пробуждение камня','Раскол земли','Гнев древнего']),en:Object.freeze(['Stone awakening','Earth fracture','Ancient wrath']),es:Object.freeze(['Despertar de piedra','Fractura de la tierra','Ira ancestral'])})
});
export const STONE_GIANT_BALANCE_TARGET=Object.freeze({soloDurationMs:1800000,classes:6,verified:false,note:'Target only: HP,actual rotations,potions and avoidance require six-class runtime calibration.'});
const patterns=Object.freeze({1:Object.freeze(['hammer','boulders','sweep','quake']),2:Object.freeze(['faultLines','charge','boulders','quake','sweep']),3:Object.freeze(['doubleQuake','rockfall','charge','faultLines','boulders'])});
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),finite=n=>Number.isFinite(n),point=p=>({x:p.x,y:p.y}),visible=(c,a,b)=>!c.canSee||c.canSee(a,b),angleBetween=(a,b)=>Math.atan2(b.y-a.y,b.x-a.x);
export function stoneGiantPhase(monster){const max=Number(monster.maxHp||monster.kind?.hp)||1,ratio=Math.max(0,Number(monster.hp)||0)/max;return ratio<=1/3?3:ratio<=2/3?2:1;}
function destroy(value){value?.destroy?.();}
function retireProjectile(c,entry){if(c.clearProjectile)c.clearProjectile(entry.lease,entry.encounterId);else destroy(entry.lease);}
function clearAttack(state){for(const event of state.attack?.events||[])destroy(event.marker);state.attack=null;}
export function cancelStoneGiantEncounter(monster,context={},reason='cancelled'){
 const state=monster?.giantEncounter;if(!state)return {cancelled:false,reason};
 clearAttack(state);for(const entry of state.projectiles)retireProjectile(context,entry);context.clearProjectiles?.(monster,state.id);state.projectiles.length=0;delete monster.giantEncounter;return {cancelled:true,reason};
}
export function resetStoneGiantEncounter(monster,context={}){return cancelStoneGiantEncounter(monster,context,'reset');}
function participants(c){
 const m=c.monster,home={x:m.homeX??m.x,y:m.homeY??m.y},limit=(c.leashRadius||STONE_GIANT_RULES.leashRadius)+STONE_GIANT_RULES.targetLeashExtra,seen=new Set();
 return (c.participants??(c.hero?[c.hero]:[])).filter(p=>p&&finite(p.x)&&finite(p.y)&&p.hp>0&&!p.safe&&distance(home,p)<=limit).map(p=>({participant:p,id:String(p.id||'solo')})).filter(p=>{if(seen.has(p.id))return false;seen.add(p.id);return true;}).sort((a,b)=>a.id.localeCompare(b.id)).slice(0,STONE_GIANT_RULES.maxParticipants);
}
function newState(m,now){m.giantEncounterSerial=(m.giantEncounterSerial||0)+1;return {id:String(m.id||m.key||'stone-giant')+':giant:'+m.giantEncounterSerial,phase:stoneGiantPhase(m),sequence:0,nextAt:now+STONE_GIANT_RULES.introMs,lastNow:now,pausedAt:null,attack:null,projectiles:[]};}
const circle=(x,y,radius)=>({shape:'circle',x,y,radius}),ring=(origin,innerRadius,radius)=>({shape:'ring',...origin,innerRadius,radius}),cone=(origin,angle,radius,arc)=>({shape:'cone',...origin,angle,radius,arc}),line=(origin,angle,length,width)=>({shape:'line',...origin,toX:origin.x+Math.cos(angle)*length,toY:origin.y+Math.sin(angle)*length,width,radius:length});
function inside(p,g){
 const d=distance(p,g);if(g.shape==='circle')return d<=g.radius;
 if(g.shape==='ring')return d>=g.innerRadius&&d<=g.radius;
 if(g.shape==='cone'){const a=Math.atan2(Math.sin(angleBetween(g,p)-g.angle),Math.cos(angleBetween(g,p)-g.angle));return d<=g.radius&&Math.abs(a)<=g.arc/2;}
 const dx=g.toX-g.x,dy=g.toY-g.y,den=dx*dx+dy*dy,t=den?((p.x-g.x)*dx+(p.y-g.y)*dy)/den:0;if(t<0||t>1)return false;return Math.hypot(p.x-g.x-dx*t,p.y-g.y-dy*t)<=g.width/2;
}
function attackPlan(name,m,target,phase,all){
 const origin=point(m),aim=point(target.participant),angle=angleBetween(origin,aim),event=(geometry,options={})=>({geometry,offset:0,multiplier:1.5,action:'damage',...options}),plan={name,origin,aim,targetId:target.id,windup:1600,cooldown:phase===3?3900:phase===2?4700:5500,events:[]};
 if(name==='hammer')plan.events=[event(circle(aim.x,aim.y,100),{multiplier:1.65})];
 if(name==='sweep'){plan.windup=1750;plan.events=[event(cone(origin,angle,235,1.55),{multiplier:1.45})];}
 if(name==='quake'){plan.windup=1900;plan.events=[event(ring(origin,120,225),{multiplier:1.4})];}
 if(name==='doubleQuake'){plan.windup=2100;plan.repeatHits=true;plan.events=[event(ring(origin,95,165),{multiplier:1.3}),event(ring(origin,220,295),{offset:900,multiplier:1.45})];}
 if(name==='faultLines'){plan.windup=1950;plan.events=[-.6,0,.6].map(a=>event(line(origin,angle+a,325,58),{multiplier:1.4}));}
 if(name==='rockfall'){plan.windup=2050;const centres=[aim,...all.filter(p=>p.id!==target.id).slice(0,2).map(p=>point(p.participant))];while(centres.length<3){const a=angle+(centres.length===1?1.25:-1.25);centres.push({x:aim.x+Math.cos(a)*100,y:aim.y+Math.sin(a)*100});}plan.events=centres.map(p=>event(circle(p.x,p.y,76),{multiplier:1.45}));}
 if(name==='charge'){plan.windup=1800;plan.events=[event(line(origin,angle,Math.min(250,distance(origin,aim)),104),{action:'charge',multiplier:1.55})];}
 if(name==='boulders'){plan.windup=1600;plan.events=[event(cone(origin,angle,620,.9),{action:'shoot',multiplier:.95,count:phase===1?3:phase===2?5:7})];}
 plan.hitIds=new Set();return plan;
}
const rangeFor=name=>name==='hammer'?195:name==='sweep'?235:name==='charge'?370:name==='boulders'?540:370;
function warn(c,state,attack,now){
 for(const [index,event]of attack.events.entries()){
  event.at=now+attack.windup+event.offset;event.fired=false;
  const g=event.geometry;event.marker=c.warn?.({...g,geometry:{...g},kind:'stoneGiant-'+attack.name,shape:g.shape,duration:attack.windup+event.offset,releaseAt:event.at,phase:state.phase,encounterId:state.id,eventId:state.id+':'+state.sequence+':'+index});
 }
}
function fire(c,state,attack,event,all,now){
 const m=c.monster,attackPower=Math.max(1,Number(m.attack||m.kind?.attack)||1)*event.multiplier;let geometry=event.geometry;destroy(event.marker);event.marker=null;event.fired=true;
 if(event.action==='shoot'){
  for(let i=0;i<event.count;i++){
   const offset=(i-(event.count-1)/2)*.14,shot={...point(m),targetX:attack.aim.x,targetY:attack.aim.y,angleOffset:offset,speed:state.phase===3?205:185,damage:attackPower,magic:false,range:620,radius:12,visual:'stoneBoulder',encounterId:state.id,targetId:attack.targetId};
   const lease=c.shoot?.(shot);if(lease){while(state.projectiles.length>=STONE_GIANT_RULES.maxProjectileLeases)retireProjectile(c,state.projectiles.shift());state.projectiles.push({lease,encounterId:state.id,expiresAt:now+shot.range/shot.speed*1000+100});}
  }
 }else{
  if(event.action==='charge'){
   const origin=point(m),dx=geometry.toX-origin.x,dy=geometry.toY-origin.y,length=Math.hypot(dx,dy),home={x:m.homeX??m.x,y:m.homeY??m.y},radius=c.collisionRadius||STONE_GIANT_RULES.collisionRadius,limit=c.leashRadius||STONE_GIANT_RULES.leashRadius;let end=origin;
   // Every eight units is sampled before the engine's own swept movement. No
   // endpoint-only teleport can pass a narrow wall or leave the home leash.
   for(let step=8;step<=length+8;step+=8){const amount=Math.min(step,length),p={x:origin.x+dx/Math.max(1,length)*amount,y:origin.y+dy/Math.max(1,length)*amount};if(distance(home,p)>limit||c.canOccupy&&!c.canOccupy(p.x,p.y,radius)||!visible(c,origin,p))break;end=p;}
   c.move?.(end.x,end.y,distance(origin,end));geometry={...geometry,...origin,toX:m.x,toY:m.y};
  }
  for(const {participant:p,id}of all){if(!attack.repeatHits&&attack.hitIds.has(id)||!inside(p,geometry)||!visible(c,attack.origin,p)||!visible(c,geometry,p))continue;c.damage?.(attackPower,false,null,p);attack.hitIds.add(id);}
 }
 c.effect?.({...geometry,kind:'stoneGiant-'+attack.name,phase:state.phase,encounterId:state.id});
}
// Context: existing monster-ability callbacks plus optional participants[],
// paused,onPhase,clearProjectiles(monster,encounterId),clearProjectile(lease,id).
// shoot may return a disposable lease. Without one, clearProjectiles MUST remove
// this encounter's externally owned shots on death/cancel/unload; shots carry id.
export function tickStoneGiantEncounter(context){
 const c=context,m=c.monster,now=Number(c.now);if(!m||!finite(now)){if(m)cancelStoneGiantEncounter(m,c,'clock');return {busy:false,reason:'clock'};}
 if(!finite(m.x)||!finite(m.y)){cancelStoneGiantEncounter(m,c,'position');return {busy:false,reason:'position'};}
 const home={x:m.homeX??m.x,y:m.homeY??m.y},leashed=distance(m,home)>(c.leashRadius||STONE_GIANT_RULES.leashRadius)+.01;
 if(!m.alive||m.hp<=0||c.safe||!c.engaged||m.returning||leashed){const reason=!m.alive||m.hp<=0?'death':leashed||m.returning?'leash':c.safe?'safe':'disengaged';cancelStoneGiantEncounter(m,c,reason);return {busy:false,reason};}
 let state=m.giantEncounter;
 if(state&&now<state.lastNow){cancelStoneGiantEncounter(m,c,'clock-reset');state=null;}
 if(!state){state=m.giantEncounter=newState(m,now);c.onPhase?.({phase:state.phase,previous:0,names:Object.fromEntries(Object.entries(STONE_GIANT_RULES.names).map(([lang,names])=>[lang,names[state.phase-1]])),encounterId:state.id});}
 if(c.paused){state.pausedAt??=now;return {busy:!!state.attack,paused:true,phase:state.phase};}
 if(state.pausedAt!==null){const delta=Math.max(0,now-state.pausedAt);state.nextAt+=delta;for(const event of state.attack?.events||[])event.at+=delta;for(const p of state.projectiles)p.expiresAt+=delta;state.lastNow=now;state.pausedAt=null;}
 const all=participants(c).filter(p=>visible(c,m,p.participant));if(!all.length){cancelStoneGiantEncounter(m,c,'target');return {busy:false,reason:'target'};}
 if(now<(m.rootUntil||0)||now<(m.stunUntil||0)){clearAttack(state);state.nextAt=Math.max(state.nextAt,Math.max(m.rootUntil||0,m.stunUntil||0)+350);state.lastNow=now;return {busy:false,phase:state.phase,reason:'controlled'};}
 const phase=Math.max(state.phase,stoneGiantPhase(m));
 if(phase!==state.phase){const previous=state.phase;clearAttack(state);for(const p of state.projectiles)retireProjectile(c,p);c.clearProjectiles?.(m,state.id);state.projectiles.length=0;state.phase=phase;state.sequence=0;state.nextAt=now+STONE_GIANT_RULES.phaseTransitionMs;c.onPhase?.({phase,previous,names:Object.fromEntries(Object.entries(STONE_GIANT_RULES.names).map(([lang,names])=>[lang,names[phase-1]])),encounterId:state.id});}
 for(const p of [...state.projectiles])if(now>=p.expiresAt){retireProjectile(c,p);state.projectiles.splice(state.projectiles.indexOf(p),1);}
 if(state.attack&&now-state.lastNow>STONE_GIANT_RULES.maxStalledTickMs){clearAttack(state);state.nextAt=now+STONE_GIANT_RULES.introMs;state.lastNow=now;return {busy:false,phase:state.phase,reason:'stalled'};}
 state.lastNow=now;
 if(state.attack){const attack=state.attack,due=attack.events.find(e=>!e.fired&&now>=e.at);if(due){fire(c,state,attack,due,all,now);if(attack.events.every(e=>e.fired)){state.attack=null;state.nextAt=Math.max(state.nextAt,now+STONE_GIANT_RULES.recoveryMs);}return {busy:!!state.attack,phase:state.phase,ability:attack.name,fired:attack.name,targetId:attack.targetId};}return {busy:true,phase:state.phase,ability:attack.name,targetId:attack.targetId};}
 if(now<state.nextAt||m.windup||now<(m.rootUntil||0)||now<(m.stunUntil||0))return {busy:false,phase:state.phase};
 const target=all[state.sequence%all.length],pattern=patterns[state.phase],proposed=pattern[state.sequence%pattern.length],name=distance(m,target.participant)>rangeFor(proposed)?'boulders':proposed;
 if(distance(m,target.participant)>rangeFor(name))return {busy:false,phase:state.phase,reason:'range'};
 state.sequence++;const attack=state.attack=attackPlan(name,m,target,state.phase,all);state.nextAt=now+attack.windup+Math.max(...attack.events.map(e=>e.offset))+attack.cooldown;warn(c,state,attack,now);return {busy:true,phase:state.phase,ability:name,targetId:target.id};
}
export function stoneGiantEncounterDiagnostics(monster){const s=monster?.giantEncounter;if(!s)return null;return {id:s.id,phase:s.phase,sequence:s.sequence,nextAt:s.nextAt,ability:s.attack?.name||null,pendingEvents:s.attack?.events.filter(e=>!e.fired).length||0,markers:s.attack?.events.filter(e=>e.marker&&!e.fired).length||0,projectileLeases:s.projectiles.length,paused:s.pausedAt!==null};}
// Shared geometry query for navigation/assistive controllers. Damage resolution
// calls the same primitive; this does not predict timing or bypass collisions.
export const stoneGiantThreatens=(geometry,position)=>inside(position,geometry);
