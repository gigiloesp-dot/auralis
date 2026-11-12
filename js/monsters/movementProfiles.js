// Movement and abilities describe real simulation actions. Rendering can use the
// same locomotion/elevation data without making collision decisions itself.
const profile=(movement,locomotion,ability,options={})=>Object.freeze({movement,locomotion,ability,collisionRadius:14,elevation:movement==='flight'?34:0,cooldown:6500,windup:650,range:190,radius:65,multiplier:1.2,...options});
export const MOVEMENT_PROFILES=Object.freeze({
 predator:profile('ground','quadruped','pounce',{cooldown:6500,windup:420,range:235,radius:48,multiplier:1.25}),
 charger:profile('ground','quadruped','charge',{cooldown:7200,windup:650,range:240,radius:55,collisionRadius:18,multiplier:1.5}),
 mauler:profile('ground','quadruped','stomp',{cooldown:8500,windup:900,range:110,radius:80,collisionRadius:24,multiplier:1.4}),
 fighter:profile('ground','biped','cleave',{cooldown:6500,windup:650,range:105,radius:85,multiplier:1.4}),
 skirmisher:profile('ground','biped','shot',{cooldown:4000,windup:450,range:270,radius:20,multiplier:1,preferredDistance:145}),
 crawler:profile('ground','crawler','venom',{cooldown:6500,windup:550,range:190,radius:20,collisionRadius:10,multiplier:.8}),
 serpent:profile('ground','serpent','pounce',{cooldown:5800,windup:600,range:160,radius:44,collisionRadius:9,multiplier:1.1,status:'poison'}),
 bat:profile('flight','winged','dive',{cooldown:5700,windup:550,range:250,radius:44,multiplier:1.1,collisionRadius:10,elevation:40}),
 ghost:profile('flight','hover','haunt',{cooldown:6000,windup:750,range:255,multiplier:1.05,collisionRadius:12,elevation:34,preferredDistance:140}),
 heavy:profile('ground','heavy','stomp',{cooldown:8000,windup:1100,range:145,radius:115,collisionRadius:24,multiplier:1.65}),
 elemental:profile('flight','hover','blink',{cooldown:8500,windup:800,range:290,multiplier:1.05,elevation:28,preferredDistance:155}),
 scarab:profile('ground','crawler','burrow',{cooldown:7500,windup:850,range:200,radius:55,collisionRadius:17,multiplier:1.15}),
 gargoyle:profile('flight','winged','dive',{cooldown:7500,windup:900,range:250,radius:65,multiplier:1.5,collisionRadius:20,elevation:45})
});
const THEMES=Object.freeze({roots:'roots',venom:'venom',tusk:'charge',pack:'pounce',oakstorm:'roots',outcast:'fan',frostRush:'charge',iceQuake:'stomp',rimeVolley:'fan',avalanche:'stomp',whiteout:'frost',haunt:'haunt',bronzeShock:'fan',ashVenom:'venom',runeSlash:'cleave',oracleBlink:'blink',colossusQuake:'stomp',voidRift:'blink'});
export function movementProfile(kind={}){
 const base=MOVEMENT_PROFILES[kind.movementProfile]||MOVEMENT_PROFILES.fighter;
 if(!kind.bossTheme)return base;
 return {...base,ability:THEMES[kind.bossTheme]||base.ability,cooldown:kind.bossType==='world'?12500:10000,windup:Math.max(900,base.windup),range:280,radius:kind.bossType==='world'?145:100,multiplier:kind.bossType==='world'?1.5:1.25};
}
export function blockingObstacles(obstacles,kind){
 if(movementProfile(kind).movement!=='flight')return obstacles;
 // Rocks and undergrowth can be overflown; tall structures and explicit flight
 // barriers remain solid. Region bounds / dungeon walls are checked separately.
 return obstacles.filter(o=>o.flightBlocked===true||o.kind==='house'||o.kind==='cliff'||o.r>28);
}
export function cancelMonsterAbility(monster){monster.specialState?.marker?.destroy?.();monster.specialState=null;}
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function statusFor(ability,attack){return ability==='venom'?{type:'poison',damage:Math.max(1,Math.round(attack*.12)),duration:4000}:ability==='frost'?{type:'slow',multiplier:.55,duration:2800}:null;}
// Context callbacks: move(tx,ty,maxDistance), canOccupy(x,y,radius),
// canSee(from,to), damage(attack,magic,status), shoot(projectile), warn(config),
// effect(config). Returns busy=true while an interruptible telegraph is active.
export function tickMonsterAbility(context){
 const {monster:m,hero:h,now,engaged,safe}=context,p=movementProfile(m.kind),ability=p.ability;
 if(!m.alive||h.hp<=0||safe||!engaged){cancelMonsterAbility(m);return {busy:false};}
 const visible=(a,b)=>!context.canSee||context.canSee(a,b);
 if(m.specialState){
  const state=m.specialState;
  if(now<state.releaseAt)return {busy:true,ability:state.ability};
  cancelMonsterAbility(m);if(!visible(m,h))return {busy:false};
  const target=state.target,attack=m.attack*p.multiplier,status=statusFor(state.ability,m.attack);
  if(['pounce','charge','dive','burrow'].includes(state.ability)){
   context.move?.(target.x,target.y,state.ability==='charge'?245:state.ability==='burrow'?200:185);
   context.effect?.({kind:state.ability,x:m.x,y:m.y,radius:p.radius});
   if(distance(m,h)<=p.radius&&visible(m,h))context.damage?.(attack,false,p.status==='poison'?statusFor('venom',m.attack):state.ability==='burrow'?{type:'slow',multiplier:.6,duration:1300}:null);
  }else if(state.ability==='stomp'||state.ability==='roots'||state.ability==='frost'){
   context.effect?.({kind:state.ability,x:target.x,y:target.y,radius:p.radius});
   if(distance(h,target)<=p.radius&&visible(target,h))context.damage?.(attack,state.ability!=='stomp',state.ability==='roots'?{type:'slow',multiplier:.35,duration:1800}:status);
  }else if(state.ability==='cleave'){
   const facing=Math.atan2(target.y-m.y,target.x-m.x),toHero=Math.atan2(h.y-m.y,h.x-m.x),angle=Math.abs(Math.atan2(Math.sin(toHero-facing),Math.cos(toHero-facing)));
   context.effect?.({kind:'cleave',x:m.x,y:m.y,radius:p.radius,angle:facing});
   if(distance(m,h)<=p.radius&&angle<1&&visible(m,h))context.damage?.(attack,false,null);
  }else{
   if(state.ability==='blink'){
    // Only blink to a clear destination with a clear wall/structure path. This
    // never teleports through closed dungeon room walls or outside the leash.
    const angle=Math.atan2(h.y-m.y,h.x-m.x);
    for(const offset of [1.15,-1.15,2.1,-2.1]){
     const point={x:h.x-Math.cos(angle+offset)*135,y:h.y-Math.sin(angle+offset)*135};
     if(distance(point,{x:m.homeX??m.x,y:m.homeY??m.y})>260||!context.canOccupy?.(point.x,point.y,14)||!visible(m,point))continue;
     const from={x:m.x,y:m.y};m.x=point.x;m.y=point.y;context.effect?.({kind:'blink',x:m.x,y:m.y,from,radius:40});break;
    }
   }
   const offsets=state.ability==='fan'?[-.3,0,.3]:[0];
   for(const offset of offsets)context.shoot?.({x:m.x,y:m.y,targetX:h.x,targetY:h.y,angleOffset:offset,speed:state.ability==='venom'?185:245,damage:attack,magic:state.ability!=='shot',range:600,status:state.ability==='haunt'?{type:'slow',multiplier:.7,duration:1400}:status});
  }
  m.lastAttackAt=now;return {busy:false,fired:state.ability};
 }
 if(m.windup||now<(m.abilityBlockedUntil||0)||distance(m,h)>p.range||!visible(m,h)||now-(m.lastAbilityAt??0)<p.cooldown)return {busy:false};
 if(['pounce','charge','dive'].includes(ability)&&distance(m,h)<65)return {busy:false};
 m.lastAbilityAt=now;
 const target=ability==='stomp'?{x:m.x,y:m.y}:{x:h.x,y:h.y};
 m.specialState={ability,target,releaseAt:now+p.windup,marker:context.warn?.({kind:ability,x:target.x,y:target.y,radius:p.radius,duration:p.windup})};
 return {busy:true,ability};
}
export function applyHeroAffliction(hero,status,now){
 if(!status||hero.hp<=0)return;hero.monsterAfflictions??={};
 if(status.type==='poison')hero.monsterAfflictions.poison={until:now+status.duration,next:now+1000,damage:Math.max(1,status.damage||1)};
 if(status.type==='slow')hero.monsterAfflictions.slow={until:now+status.duration,multiplier:Math.max(.25,Math.min(1,status.multiplier||.6))};
}
export function tickHeroAfflictions(hero,now,damage){
 const states=hero.monsterAfflictions;if(!states)return;
 if(hero.hp<=0){hero.monsterAfflictions={};return;}
 for(const [type,state]of Object.entries(states)){if(now>=state.until){delete states[type];continue;}if(type==='poison'&&now>=state.next){state.next=now+1000;damage(state.damage,true);}}
}
export function heroMovementMultiplier(hero,now){const slow=hero.monsterAfflictions?.slow;return slow?.until>now?slow.multiplier:1;}
