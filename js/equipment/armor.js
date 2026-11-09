export const EQUIPMENT_SLOTS=Object.freeze(['weapon','helmet','chest','gloves','pants','boots','ring','amulet','shield']);
export const RARITIES=Object.freeze(['common','uncommon','rare','epic','legendary']);
export function canEquip(item,character){return !item?.allowedClasses||item.allowedClasses.includes(character.classId);}
