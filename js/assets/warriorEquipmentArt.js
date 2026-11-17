// Appearance mapping only: all requirements, stats, prices and inventory rules
// still come from the existing item catalogue. Never use warrior fit on a mage.
export const WARRIOR_REFERENCE_ITEMS=Object.freeze(['weapon_warrior_1','helmet_0','chest_0','gloves_0','pants_0','boots_0','shield_1']);
const slots=['weapon','helmet','chest','gloves','pants','boots','shield'];
export const WARRIOR_EQUIPMENT_ART=Object.freeze(Object.fromEntries(WARRIOR_REFERENCE_ITEMS.map((id,i)=>{
 const name=slots[i]==='weapon'?'sword':slots[i];
 return [id,{id,slot:slots[i],classId:'warrior',key:'equipment-warrior-reference-'+name,url:'assets/equipment/warrior-reference/'+name+'.png',atlasURL:'assets/equipment/warrior-reference/'+name+'.json'}];
})));
export function warriorEquipmentArt(hero,slot){
 const art=WARRIOR_EQUIPMENT_ART[hero?.equipment?.[slot]?.id];
 return hero?.classId==='warrior'&&art?.slot===slot?art:null;
}
