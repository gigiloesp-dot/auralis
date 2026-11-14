import {itemDefinition,itemCount,ITEM_DEFS,addItem} from '../equipment/items.js';
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

const rarityValue={common:1,uncommon:2,rare:4,epic:9,legendary:25};
export function equipmentPrice(item){
 const definition=itemDefinition(item);if(!definition?.slot)return 0;
 return Math.round((25+definition.level*definition.level*12+(definition.attack||0)*8+(definition.defense||0)*10)*(rarityValue[item.rarity||'common']||1));
}
export function merchantStock(hero,npc){
 const roles=npc?.roles||[npc?.role];if(!roles.some(role=>['merchant','specialMerchant'].includes(role)))return [];
 const special=roles.includes('specialMerchant'),cap=Math.min(42,npc.maxLevel||42,Math.max(npc.minLevel||1,(hero.level||1)+3));
 const slots=['weapon','helmet','chest','gloves','pants','boots','ring','amulet','shield'];
 const stock=[];
 for(const slot of slots){
  const options=Object.entries(ITEM_DEFS).filter(([,d])=>d.slot===slot&&d.level<=cap&&(!d.allowedClasses||d.allowedClasses.includes(hero.classId))).sort((a,b)=>b[1].level-a[1].level);
  if(!options.length)continue;
  for(const rarity of ['common','uncommon','rare']){const item={id:options[0][0],rarity};stock.push({...item,offerId:item.id+':'+rarity,price:equipmentPrice(item)});}
 }
 if(special&&(hero.level||1)>=(npc.minLevel||1)){
  const option=Object.entries(ITEM_DEFS).filter(([,d])=>d.slot==='weapon'&&d.level<=Math.min(42,npc.maxLevel||42)&&d.allowedClasses?.includes(hero.classId)).sort((a,b)=>b[1].level-a[1].level)[0];
  if(option){const item={id:option[0],rarity:'legendary'};stock.push({...item,offerId:item.id+':legendary',price:equipmentPrice(item)});}
 }
 return stock;
}
export function buyEquipment(hero,npc,offerId){
 const offer=merchantStock(hero,npc).find(item=>item.offerId===offerId);
 if(!offer)return {ok:false,reason:'invalid'};
 if((hero.level||1)<(npc.minLevel||1))return {ok:false,reason:'level'};
 if(funds(hero)<offer.price)return {ok:false,reason:'funds'};
 const preview={inventory:(hero.inventory||[]).map(item=>({...item}))};
 if(!addItem(preview,{id:offer.id,rarity:offer.rarity}))return {ok:false,reason:'full'};
 hero.inventory=preview.inventory;hero.gold=funds(hero)-offer.price;return {ok:true,price:offer.price};
}
export function sellItem(hero,index,quantity=1){
 const item=hero.inventory?.[index],definition=itemDefinition(item);
 if(!definition)return {ok:false,reason:'invalid'};
 if(!definition.slot)return sellMaterial(hero,index,quantity);
 if(!Number.isInteger(index)||quantity!==1)return {ok:false,reason:'invalid'};
 const gold=Math.max(1,Math.floor(equipmentPrice(item)*.25));
 if(!Number.isSafeInteger(funds(hero)+gold))return {ok:false,reason:'invalid'};
 hero.inventory.splice(index,1);hero.gold=funds(hero)+gold;return {ok:true,gold};
}
// UI trades are committed to browser storage before success is announced.
// Pure pricing/buy/sell operations remain reusable without a persistence backend.
export function commitTrade(hero,operation,persist){
 const before={gold:hero.gold,potions:hero.potions?{...hero.potions}:undefined,inventory:hero.inventory?.map(item=>({...item}))};
 let result;
 try{result=operation();if(!result?.ok)return result||{ok:false,reason:'invalid'};if(persist()!==false)return result;}catch{}
 hero.gold=before.gold;if(before.potions===undefined)delete hero.potions;else hero.potions=before.potions;
 if(before.inventory===undefined)delete hero.inventory;else hero.inventory=before.inventory;
 return {ok:false,reason:'storage'};
}
