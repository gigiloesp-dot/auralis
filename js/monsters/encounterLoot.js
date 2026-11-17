import {rollMonsterLoot} from './loot.js';
import {STONE_GIANT_CORE_ID} from '../equipment/endgameMaterials.js';
// All existing equipment/material RNG tables are unchanged. The unique trophy
// is an additional material from this one actual world encounter only.
export function rollEncounterLoot(hero,kind,rng=Math.random){
 const drops=rollMonsterLoot(hero,kind,rng);
 return kind.bossType==='world'&&kind.encounter==='stoneGiant'?[...drops,{id:STONE_GIANT_CORE_ID,rarity:'legendary',quantity:1}]:drops;
}
