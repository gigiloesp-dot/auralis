import {itemDefinition,itemName} from '../equipment/items.js';

// Ground-only descriptors: these IDs are never registered in ITEM_DEFS/catalogue.
const potion=(resource,names)=>Object.freeze({name:names.ru,names:Object.freeze(names),slot:null,level:1,saleValue:0,consumable:true,resource});
export const GROUND_CONSUMABLES=Object.freeze({
 hpPotion:potion('hp',{ru:'Зелье здоровья',en:'Health potion',es:'Poción de salud'}),
 mpPotion:potion('mp',{ru:'Зелье маны',en:'Mana potion',es:'Poción de maná'})
});
export const GROUND_POTION_LIMIT=99;
// Technical starting values only; owner balance/playtest is pending.
export const AUR203_CONSUMABLE_RATES=Object.freeze({hpPotion:.02,mpPotion:.01});
const ranges=[['forest',80,96],['north',76,93],['ancient',45,61],['desert',56,87]];
export const AUR203_CONSUMABLE_SPECIES_IDS=Object.freeze(ranges.flatMap(([region,start,end])=>Array.from({length:end-start+1},(_,i)=>region+'-species-'+String(start+i).padStart(3,'0'))));
const eligible=new Set(AUR203_CONSUMABLE_SPECIES_IDS);
export const groundConsumableDefinition=item=>Object.hasOwn(GROUND_CONSUMABLES,item?.id)?GROUND_CONSUMABLES[item.id]:null;
export const groundDropDefinition=item=>itemDefinition(item)||groundConsumableDefinition(item);
export function groundDropName(item,language='ru'){
 const def=groundConsumableDefinition(item);return def?(def.names[language]||def.names.ru):itemName(item,language);
}
// FNV-1a over UTF-16 code units followed by a fixed avalanche. Independent salts
// avoid consuming ANY equipment/material/global RNG, including on later kills.
export function consumableEventRoll(key,killedAt,salt){
 const input=JSON.stringify(['aur203-ground-potions-v1',key,killedAt,salt]);let hash=2166136261;
 for(let i=0;i<input.length;i++){hash^=input.charCodeAt(i);hash=Math.imul(hash,16777619);}
 hash^=hash>>>16;hash=Math.imul(hash,0x85ebca6b);hash^=hash>>>13;hash=Math.imul(hash,0xc2b2ae35);hash^=hash>>>16;
 return (hash>>>0)/4294967296;
}
// ROOT death hook: append ...rollAur203GroundConsumables(m,deathAt) AFTER the
// unchanged rollEncounterLoot call. Both independent checks can succeed.
export function rollAur203GroundConsumables(monster,killedAt,kind=monster?.kind){
 if(!kind||kind.boss||kind.bossType||!eligible.has(kind.speciesId)||typeof monster?.key!=='string'||!monster.key||monster.key.length>160||!Number.isFinite(killedAt)||killedAt<0||killedAt>8640000000000000)return [];
 const drops=[];
 for(const [id,chance]of Object.entries(AUR203_CONSUMABLE_RATES))if(consumableEventRoll(monster.key,killedAt,id)<chance)drops.push({id,rarity:'common',quantity:1});
 return drops;
}
