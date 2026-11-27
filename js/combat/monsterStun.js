// Transient monster-origin stun. Callers supply the paused simulation clock;
// no hero properties, timers, renderer objects or persistent data are stored.
export const MONSTER_STUN_MIN_MS=200;
export const MONSTER_STUN_MAX_MS=800;
export const MONSTER_STUN_IMMUNITY_MS=1000;
const states=new WeakMap();
const object=hero=>hero!==null&&typeof hero==='object'&&!Array.isArray(hero);
const alive=hero=>object(hero)&&Number.isFinite(hero.hp)&&hero.hp>0;
const clock=now=>Number.isFinite(now)&&now>=0;
const empty=()=>({active:false,remaining:0,immuneRemaining:0});

function current(hero,now){
 if(!object(hero))return null;
 if(!alive(hero)){states.delete(hero);return null;}
 if(!clock(now))return null;
 const state=states.get(hero);if(!state)return null;
 // A caller clock regression cannot grant extra stun time or erase immunity.
 state.lastNow=Math.max(state.lastNow,now);
 if(state.lastNow>=state.immuneUntil){states.delete(hero);return null;}
 return state;
}

export function applyMonsterStun(hero,duration,now){
 if(!alive(hero)){if(object(hero))states.delete(hero);return false;}
 if(!clock(now)||!Number.isFinite(duration)||duration<=0)return false;
 if(current(hero,now))return false; // Includes the post-stun immunity window.
 const bounded=Math.max(MONSTER_STUN_MIN_MS,Math.min(MONSTER_STUN_MAX_MS,duration));
 const until=now+bounded,immuneUntil=until+MONSTER_STUN_IMMUNITY_MS;
 if(!Number.isFinite(until)||!Number.isFinite(immuneUntil)||until<=now||immuneUntil<=until)return false;
 states.set(hero,{until,immuneUntil,lastNow:now});return true;
}

export function monsterStunRemaining(hero,now){
 const state=current(hero,now);return state?Math.max(0,state.until-state.lastNow):0;
}

export function isMonsterStunned(hero,now){return monsterStunRemaining(hero,now)>0;}

// An explicit lifecycle reset also clears immunity; use on death, respawn,
// character replacement, world reset or shutdown, never for ordinary expiry.
export function cancelMonsterStun(hero){return object(hero)?states.delete(hero):false;}

// A detached snapshot for the update loop/HUD; mutating it cannot alter state.
// immuneRemaining describes protection AFTER the active stun has ended.
export function tickMonsterStun(hero,now){
 const state=current(hero,now);if(!state)return empty();
 const remaining=Math.max(0,state.until-state.lastNow);
 return {active:remaining>0,remaining,immuneRemaining:remaining>0?0:Math.max(0,state.immuneUntil-state.lastNow)};
}
