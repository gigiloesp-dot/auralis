import {addItem} from '../equipment/items.js';
const TABLE=Object.freeze([{id:'wolfFang',chance:.35},{id:'wolfPelt',chance:.20},{id:'leatherBoots',chance:.07},{id:'leatherGloves',chance:.05},{id:'leatherVest',chance:.035},{id:'copperRing',chance:.02},{id:'ironSword',chance:.01}]);
export function rollWolfLoot(hero,rng=Math.random){
 const drops=[];for(const entry of TABLE){if(rng()<entry.chance){const rarityRoll=rng();const rarity=rarityRoll<.005?'epic':rarityRoll<.045?'rare':rarityRoll<.2?'uncommon':'common';const item={id:entry.id,rarity};if(addItem(hero,item))drops.push(item);}}
 return drops;
}
