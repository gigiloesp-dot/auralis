// Class-specific mechanics are separated from entity streaming and damage rolls.
export function placeTrap(system,cast,target,now){
 const p=system.view(target.x,target.y),body=system.scene.add.circle(p.x,p.y,38,0x9fcdb2,.28).setDepth(system.depth(target.x,target.y)-1);if(system.scene.project)body.setScale?.(1,.5);
 system.traps??=[];system.traps.push({x:target.x,y:target.y,radius:45,until:now+12000,duration:cast.duration,multiplier:cast.multiplier,body});
}
export function tickClassEffects(system,now){
 for(const trap of [...(system.traps||[])]){
  if(now>=trap.until){trap.body.destroy();system.traps=system.traps.filter(t=>t!==trap);continue;}
  const target=system.monsters.find(m=>m.alive&&m.active!==false&&Math.hypot(m.x-trap.x,m.y-trap.y)<=trap.radius&&system.sight(trap,m));
  if(target){target.rootUntil=now+trap.duration;system.strike(target,now,trap.multiplier,false,false);}
  if(target||now>=trap.until){trap.body.destroy();system.traps=system.traps.filter(t=>t!==trap);}
 }
 if(system.hero.classId==='paladin'&&system.buffs.aura>now&&now-(system.lastAuraAt||0)>=1000){
  system.lastAuraAt=now;const rank=system.buffs.auraRank||1,h=system.hero;h.hp=Math.min(h.maxHp,h.hp+Math.max(1,Math.round(h.maxHp*(.005+rank*.003))));
  for(const m of system.monsters)if(m.alive&&m.active!==false&&Math.hypot(m.x-h.x,m.y-h.y)<110&&system.sight(h,m))system.hit(m,Math.max(1,Math.round((h.stats.intelligence||5)*.3+rank*2)),now);
  const p=system.view(h.x,h.y),ring=system.scene.add.circle(p.x,p.y,110,0xffe8a2,.12).setDepth(system.depth(h.x,h.y)-1);if(system.scene.project)ring.setScale?.(1,.5);system.scene.tweens.add({targets:ring,alpha:0,duration:500,onComplete:()=>ring.destroy()});system.onChange();
 }
}
export function guardBlock(system,damage,now){
 if(system.hero.classId==='paladin'&&system.buffs.guard>now&&system.buffs.guardCharges>0){system.buffs.guardCharges--;return 0;}return damage;
}
export function guardResponse(system,now){
 if(!(system.buffs.guard>now)||system.hero.hp<=0)return;const rank=system.buffs.guardRank||1;
 for(const m of system.monsters)if(m.alive&&m.active!==false&&Math.hypot(m.x-system.hero.x,m.y-system.hero.y)<80&&system.sight(system.hero,m)){
  if(system.hero.classId==='warrior')system.hit(m,rank*2+Math.max(1,Math.round((system.hero.stats.endurance||5)*.2)),now);
  if(system.hero.classId==='cannoneer')m.slowUntil=now+700+rank*100;
 }
}
export function clearClassEffects(system){for(const trap of system.traps||[])trap.body.destroy();system.traps=[];}
