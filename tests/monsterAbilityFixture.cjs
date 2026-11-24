// Prepared approach positions for minimum-range movement attacks. Nothing in
// the monster, cooldown, HP, collision or release callback is altered.
async function startAbilityApproach(page){
 await page.evaluate(async()=>{
  const s=Auralis.game.scene.getScene('world'),{movementProfile}=await import('/js/monsters/movementProfiles.js');
  s.__abilityApproachMoves=[];
  s.__abilityApproachTimer=setInterval(()=>{
   const m=s.__nextSpecies;if(!m?.alive||m.specialState)return;
   const profile=movementProfile(m.kind),pattern=profile.abilityPattern||[profile.ability],ability=pattern[(m.abilityStep||0)%pattern.length];
   if(!['pounce','charge','dive'].includes(ability)||s.playNow-m.lastAbilityAt<profile.cooldown||Math.hypot(m.x-s.hero.x,m.y-s.hero.y)>=70)return;
   const points=Array.from({length:32},(_,i)=>({x:m.x+Math.cos(i*Math.PI/16)*100,y:m.y+Math.sin(i*Math.PI/16)*100})).sort((a,b)=>Math.hypot(a.x-m.homeX,a.y-m.homeY)-Math.hypot(b.x-m.homeX,b.y-m.homeY));
   const q=points.find(p=>s.world.isWalkable(p.x,p.y)&&s.monsters.sight(m,p));
   if(q){s.__abilityApproachMoves.push({ability,playNow:s.playNow,from:{x:s.hero.x,y:s.hero.y},to:q});Object.assign(s.hero,q);}
  },80);
 });
}
async function stopAbilityApproach(page){return page.evaluate(()=>{const s=Auralis.game.scene.getScene('world');clearInterval(s.__abilityApproachTimer);delete s.__abilityApproachTimer;return s.__abilityApproachMoves;});}
module.exports={startAbilityApproach,stopAbilityApproach};
