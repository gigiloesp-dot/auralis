export function usePotion(hero,resource,now,state){
 if(!['hp','mp'].includes(resource)||!Number.isFinite(now)||hero.hp<=0)return false;
 const max=resource==='hp'?hero.maxHp:hero.maxMp;
 if((hero.potions?.[resource]||0)<1||hero[resource]>=max||now<(state.readyAt??0))return false;
 hero[resource]=Math.min(max,hero[resource]+Math.ceil(max*.45));hero.potions[resource]--;state.readyAt=now+3000;return true;
}
