export const RARITY_MODIFIERS=Object.freeze({common:1,uncommon:1.12,rare:1.28,epic:1.5,legendary:1.85});
export function itemPower(basePower,rarity){return Math.round(basePower*(RARITY_MODIFIERS[rarity]??1));}
