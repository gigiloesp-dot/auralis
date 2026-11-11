export const xpForNextLevel=level=>Math.round(60+level*level*18);
export function grantXp(hero,amount){
 if(!Number.isFinite(amount)||amount<=0)return false;
 hero.xp=(hero.xp||0)+amount;
 let leveled=false;
 while(hero.level<42&&hero.xp>=xpForNextLevel(hero.level)){
  hero.xp-=xpForNextLevel(hero.level);hero.level++;hero.skillPoints=(hero.skillPoints||0)+1;
  hero.maxHp=100+(hero.level-1)*12;hero.maxMp=100+(hero.level-1)*7;
  hero.hp=hero.maxHp;hero.mp=hero.maxMp;leveled=true;
 }
 return leveled;
}
