// Living recovery is separate from death/respawn. Five quiet seconds, then10%
// maximum HP per second; pursuing or being attacked restarts the quiet period.
export const MONSTER_RECOVERY_DELAY=5000;
export const MONSTER_RECOVERY_RATE=.10;
export function recoverLivingMonster(monster,now,dt,inCombat=false){
 if(!monster.alive)return false;
 if(inCombat){monster.lastEngagedAt=now;return false;}
 if(monster.hp>=monster.maxHp||now-(monster.lastEngagedAt??now)<MONSTER_RECOVERY_DELAY)return false;
 const before=monster.hp,elapsed=Math.min(Math.max(0,dt),Math.max(0,(now-(monster.lastEngagedAt??now)-MONSTER_RECOVERY_DELAY)/1000));
 monster.hp=Math.min(monster.maxHp,monster.hp+monster.maxHp*MONSTER_RECOVERY_RATE*elapsed);
 return monster.hp!==before;
}
export function restoredLivingHp(state,maxHp,wallNow=Date.now()){
 if(!(state?.hp>0)||!Number.isFinite(state.healthAt)||!Number.isFinite(state.recoverAfter))return maxHp;
 const seconds=Math.max(0,wallNow-Math.max(state.healthAt,state.recoverAfter))/1000;
 return Math.min(maxHp,state.hp+maxHp*MONSTER_RECOVERY_RATE*seconds);
}
