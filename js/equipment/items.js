import {GENERATED_ITEMS} from './catalog.js';
import {insertStack,compactStacks,itemCount} from './stacking.js';
import {canEquip,EQUIPMENT_SLOTS} from './armor.js';
export const INVENTORY_CAPACITY=60;
export const ITEM_DEFS=Object.freeze({...GENERATED_ITEMS,
 rustySword:{name:'Ржавый меч',slot:'weapon',attack:7,level:1,allowedClasses:['warrior','paladin']},
 ironSword:{name:'Железный меч',slot:'weapon',attack:12,level:4,allowedClasses:['warrior','paladin']},
 leatherVest:{name:'Кожаный жилет',slot:'chest',defense:3,level:1},
 leatherBoots:{name:'Кожаные сапоги',slot:'boots',defense:2,level:1},
 leatherGloves:{name:'Кожаные перчатки',slot:'gloves',defense:1,level:1},
 leatherPants:{name:'Кожаные штаны',slot:'pants',defense:2,level:1},
 copperRing:{name:'Медное кольцо',slot:'ring',attack:1,level:1},
 wolfFang:{name:'Клык волка',slot:null,level:1},
 wolfPelt:{name:'Волчья шкура',slot:null,level:1}
});
export const itemDefinition=item=>ITEM_DEFS[item?.id]||null;
export const itemName=item=>itemDefinition(item)?.name||item?.id||'Предмет';
export function addItem(hero,item){if(!hero||!Array.isArray(hero.inventory)||!itemDefinition(item))return false;return insertStack(hero.inventory,{...item,rarity:item.rarity||'common'},itemDefinition(item),INVENTORY_CAPACITY).remainder===0;}
export function normalizeInventory(items){return compactStacks(items,itemDefinition,INVENTORY_CAPACITY);}
export {itemCount};
export function equipItem(hero,index){
 if(!Number.isInteger(index)||index<0||index>=hero.inventory.length)return {ok:false,reason:'invalid'};
 const item=hero.inventory[index],def=itemDefinition(item);
 if(!def?.slot||!EQUIPMENT_SLOTS.includes(def.slot))return {ok:false,reason:'notEquipment'};
 if((hero.level||1)<def.level)return {ok:false,reason:'level'};
 if(!canEquip(def,hero))return {ok:false,reason:'class'};
 const previous=hero.equipment[def.slot];
 hero.inventory.splice(index,1);if(previous)hero.inventory.push(previous);
 hero.equipment[def.slot]=item;return {ok:true,slot:def.slot};
}
export function unequipItem(hero,slot){
 if(!EQUIPMENT_SLOTS.includes(slot)||!hero.equipment[slot])return false;
 if(hero.inventory.length>=INVENTORY_CAPACITY)return false;
 hero.inventory.push(hero.equipment[slot]);delete hero.equipment[slot];return true;
}
export function equipmentStats(hero){let attack=0,defense=0;for(const item of Object.values(hero.equipment||{})){const def=itemDefinition(item);if(!def)continue;const mult={common:1,uncommon:1.12,rare:1.28,epic:1.5,legendary:1.85}[item.rarity]||1;attack+=Math.round((def.attack||0)*mult);defense+=Math.round((def.defense||0)*mult);}return {attack,defense};}
