// Small deterministic decisions for streamed monsters. Patrols never run a
// route search; pursuit searches only when a direct route is obstructed.
export const MONSTER_AGGRO_MEMORY_MS=8000;
export const MONSTER_LEASH_RADIUS=360;
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const hash=value=>{let h=2166136261;for(const c of String(value))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;};
const random=monster=>{monster.behaviorSeed=(Math.imul(monster.behaviorSeed??hash(monster.id||monster.key||'mob'),1664525)+1013904223)>>>0;return monster.behaviorSeed/4294967296;};
export const leashRadius=monster=>monster.kind?.boss?300:MONSTER_LEASH_RADIUS;
export function markMonsterThreat(monster,attacker,now){
 if(!monster.alive||!attacker)return;
 monster.aggroUntil=now+MONSTER_AGGRO_MEMORY_MS;
 monster.lastSeenAt=now;monster.targetX=attacker.x;monster.targetY=attacker.y;
 // A hit cannot repeatedly release a monster that is already leashed home.
 if(!monster.returning)monster.behaviorState='chase';
}
export function monsterIntent(monster,hero,now,{visible=false,safe=false,detection=190,canOccupy=()=>true}={}){
 const home={x:monster.homeX,y:monster.homeY},homeDistance=distance(monster,home),limit=leashRadius(monster);
 const threatened=monster.aggroUntil>now,heroHome=distance(hero,home),remembered={x:monster.targetX??hero.x,y:monster.targetY??hero.y};
 // A stationary ranged attacker just beyond the home leash can be approached.
 // Once it runs farther away, the monster loses that target instead of kiting
 // indefinitely after it. The monster's own position always stays leashed.
 const targetAllowed=heroHome<=limit||threatened&&distance(hero,remembered)<=40;
 if(homeDistance>=limit-4||safe||hero.hp<=0||!targetAllowed){monster.returning=true;monster.aggroUntil=0;}
 if(monster.returning){
  monster.behaviorState='return';
  if(homeDistance>18)return {x:home.x,y:home.y,speed:62,engaged:false,returning:true};
  monster.returning=false;monster.aggroUntil=0;monster.targetX=monster.targetY=undefined;
  monster.nextPatrolAt=now+700+random(monster)*1300;
 }
 const sensed=visible&&distance(monster,hero)<detection;
 if(!safe&&hero.hp>0&&(sensed||threatened)&&targetAllowed){
  if(visible){monster.targetX=hero.x;monster.targetY=hero.y;monster.lastSeenAt=now;monster.aggroUntil=now+MONSTER_AGGRO_MEMORY_MS;}
  monster.behaviorState='chase';
  return {x:monster.targetX??hero.x,y:monster.targetY??hero.y,speed:monster.kind.speed,engaged:true,visible};
 }
 if(monster.behaviorState==='chase'){monster.returning=true;monster.behaviorState='return';return {x:home.x,y:home.y,speed:62,engaged:false,returning:true};}
 if(monster.kind.boss){monster.behaviorState='idle';return {x:home.x,y:home.y,speed:62,engaged:false};}
 const camp={x:monster.campX??home.x,y:monster.campY??home.y},campRadius=Math.max(35,monster.campRadius||75);
 if(monster.patrolTarget&&distance(monster,monster.patrolTarget)<=12){monster.patrolTarget=null;monster.nextPatrolAt=now+900+random(monster)*2200;}
 if(!monster.patrolTarget&&now>=(monster.nextPatrolAt??0)){
  // Local, irregular offsets keep a camp together without pulling every member
  // towards its centre, and the sampled points respect each locomotion profile.
  for(let attempt=0;attempt<8;attempt++){
   const angle=random(monster)*Math.PI*2,radius=26+random(monster)*55;
   const point={x:home.x+Math.cos(angle)*radius,y:home.y+Math.sin(angle)*radius};
   if(distance(point,camp)>campRadius-8||distance(point,home)>limit-30||!canOccupy(point.x,point.y))continue;
   monster.patrolTarget=point;break;
  }
  if(!monster.patrolTarget)monster.nextPatrolAt=now+1200;
 }
 const target=monster.patrolTarget||monster;
 monster.behaviorState=monster.patrolTarget?'patrol':'idle';
 return {x:target.x,y:target.y,speed:Math.min(45,monster.kind.speed*.42),engaged:false,patrol:!!monster.patrolTarget};
}

// Bounded breadth-first detour, reused for up to 900ms and never used for idle
// patrol. The allowed callback checks the actual ground/flight and wall rules.
export function steeringWaypoint(monster,target,now,clear,allowed){
 if(clear(monster,target))return target;
 if(monster.route?.length&&now<(monster.routeUntil||0)){
  while(monster.route.length&&distance(monster,monster.route[0])<12)monster.route.shift();
  if(monster.route.length&&clear(monster,monster.route[0]))return monster.route[0];
 }
 if(now<(monster.nextRouteAt||0))return monster;
 monster.nextRouteAt=now+700;monster.routeUntil=now+1600;
 const step=28,start={x:monster.x,y:monster.y},home={x:monster.homeX,y:monster.homeY},limit=leashRadius(monster);
 const key=p=>Math.round((p.x-start.x)/step)+','+Math.round((p.y-start.y)/step),queue=[start],parents=new Map([[key(start),null]]);
 let best=start,bestDistance=distance(start,target),goal=null;
 for(let i=0;i<queue.length&&queue.length<480;i++){
  const current=queue[i],toTarget=distance(current,target);
  if(toTarget<bestDistance){best=current;bestDistance=toTarget;}
  if(toTarget<step*1.5&&clear(current,target)){goal=current;break;}
  for(const [dx,dy]of [[step,0],[-step,0],[0,step],[0,-step],[step,step],[step,-step],[-step,step],[-step,-step]]){
   const next={x:current.x+dx,y:current.y+dy},id=key(next);
   if(parents.has(id)||distance(next,home)>limit-5||!allowed(next.x,next.y)||!clear(current,next))continue;
   parents.set(id,current);queue.push(next);
  }
 }
 if(!goal&&bestDistance<distance(start,target)-10)goal=best;
 if(!goal){monster.route=[];return monster;}
 const route=[];for(let point=goal;point;point=parents.get(key(point)))route.unshift(point);
 route.shift();monster.route=route;
 return route[0]||monster;
}
