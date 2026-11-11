// Auto-targeting selects the nearest living enemy within weapon reach.
export function nearestTarget(hero,monsters,range=100){
 let chosen=null,best=range*range;
 for(const monster of monsters){
  if(!monster.alive)continue;
  const dx=monster.x-hero.x,dy=monster.y-hero.y,d2=dx*dx+dy*dy;
  if(d2<best){chosen=monster;best=d2;}
 }
 return chosen;
}
