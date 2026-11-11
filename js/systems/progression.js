import {maxResources} from './attributes.js';
export const xpForNextLevel=level=>Math.round(60+level*level*18);
export function grantXp(hero,amount){
 if(!Number.isFinite(amount)||amount<=0)return false;
 hero.xp=(hero.xp||0)+amount;
 let leveled=false;
 while(hero.level<42&&hero.xp>=xpForNextLevel(hero.level)){
  hero.xp-=xpForNextLevel(hero.level);hero.level++;hero.skillPoints=(hero.skillPoints||0)+1;hero.attributePoints=(hero.attributePoints||0)+3;
  const resources=maxResources(hero);hero.maxHp=resources.maxHp;hero.maxMp=resources.maxMp;
  hero.hp=hero.maxHp;hero.mp=hero.maxMp;leveled=true;
 }
 return leveled;
}
