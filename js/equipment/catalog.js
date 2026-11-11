// Deterministic equipment catalogue. IDs remain stable across saves.
export const LEVEL_TIERS=Object.freeze([1,4,8,15,22,27,33,38,42]);
const ARMOR_TIERS=[1,5,9,14,21,28,32,37,42];
const CLASSES=['warrior','archer','mage','paladin','assassin','cannoneer'];
const WEAPON_NAMES={warrior:['Меч странника','Стальной меч','Клинок ветерана','Боевой меч','Рыцарский клинок','Клинок севера','Меч хранителя','Клинок древних','Меч вечности'],archer:['Короткий лук','Охотничий лук','Лук следопыта','Длинный лук','Лук бури','Лук севера','Лук хранителя','Лук древних','Лук вечности'],mage:['Посох ученика','Дубовый посох','Посох искр','Посох мага','Посох стихий','Посох мороза','Посох хранителя','Посох древних','Посох вечности'],paladin:['Меч послушника','Меч стража','Клинок веры','Меч защитника','Священный меч','Клинок света','Меч хранителя','Меч древних','Меч вечности'],assassin:['Ржавые кинжалы','Стальные кинжалы','Кинжалы тени','Парные клинки','Клинки ночи','Кинжалы севера','Клинки хранителя','Кинжалы древних','Клинки вечности'],cannoneer:['Ручная пушка','Медная пушка','Пушка разведчика','Пушка инженера','Тяжёлая пушка','Пушка севера','Пушка хранителя','Древняя пушка','Пушка вечности']};
const ARMOR_NAMES={helmet:'Шлем',chest:'Нагрудник',gloves:'Перчатки',pants:'Штаны',boots:'Сапоги',ring:'Кольцо',amulet:'Амулет',shield:'Щит'};
const TIER_NAMES=['Путника','Стража','Следопыта','Ветерана','Защитника','Севера','Хранителя','Древних','Вечности'];
export const GENERATED_ITEMS=(()=>{
 const out={};
 for(const classId of CLASSES)for(let tier=0;tier<LEVEL_TIERS.length;tier++){
  const id='weapon_'+classId+'_'+tier;
  out[id]={name:WEAPON_NAMES[classId][tier],slot:'weapon',level:LEVEL_TIERS[tier],attack:Math.round(6+tier*tier*3.1),allowedClasses:[classId],tier,kind:classId==='archer'?'bow':classId==='mage'?'staff':classId==='assassin'?'daggers':classId==='cannoneer'?'cannon':'sword'};
 }
 for(const slot of Object.keys(ARMOR_NAMES))for(let tier=0;tier<ARMOR_TIERS.length;tier++){
  if(slot==='shield'&&tier===0)continue;
  const id=slot+'_'+tier;
  out[id]={name:ARMOR_NAMES[slot]+' '+TIER_NAMES[tier],slot,level:ARMOR_TIERS[tier],tier,defense:['helmet','chest','gloves','pants','boots','shield'].includes(slot)?Math.max(1,Math.round((tier+1)**1.65*(slot==='chest'?2.5:slot==='shield'?2:1))):0,attack:['ring','amulet'].includes(slot)?Math.round((tier+1)*1.6):0,...(slot==='shield'?{allowedClasses:['paladin','warrior']}: {})};
 }
 return Object.freeze(out);
})();
export const equipmentForLevel=(level,slot='weapon',classId='warrior')=>Object.entries(GENERATED_ITEMS).filter(([,d])=>d.slot===slot&&d.level<=level&&(slot!=='weapon'||d.allowedClasses.includes(classId))).sort((a,b)=>b[1].level-a[1].level).map(([id])=>id);
