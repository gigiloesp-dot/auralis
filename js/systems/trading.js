import {itemDefinition,itemCount} from '../equipment/items.js';
export const POTION_PRICE=10;
export const POTION_LIMIT=99;
const funds=hero=>Number.isSafeInteger(hero.gold)&&hero.gold>=0?hero.gold:0;
export function buyPotion(hero,resource){
 if(!['hp','mp'].includes(resource))return {ok:false,reason:'invalid'};
 const quantity=Number.isSafeInteger(hero.potions?.[resource])?Math.max(0,hero.potions[resource]):0;
 if(quantity>=POTION_LIMIT)return {ok:false,reason:'limit'};
 if(funds(hero)<POTION_PRICE)return {ok:false,reason:'funds'};
 hero.gold=funds(hero)-POTION_PRICE;hero.potions??={hp:0,mp:0};hero.potions[resource]=quantity+1;
 return {ok:true};
}
export function materialPrice(item){
 const definition=itemDefinition(item);if(!definition||definition.slot)return 0;
 return {common:1,uncommon:2,rare:4,epic:8,legendary:16}[item.rarity||'common']||1;
}
export function sellMaterial(hero,index,quantity=1){
 if(!Number.isInteger(index)||!Number.isInteger(quantity)||quantity<1)return {ok:false,reason:'invalid'};
 const item=hero.inventory?.[index],price=materialPrice(item);
 if(!price||quantity>itemCount(item)||!Number.isSafeInteger(funds(hero)+price*quantity))return {ok:false,reason:'invalid'};
 const remaining=itemCount(item)-quantity;
 if(remaining)item.quantity=remaining;else hero.inventory.splice(index,1);
 hero.gold=funds(hero)+price*quantity;return {ok:true,gold:price*quantity};
}
