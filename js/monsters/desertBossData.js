// Task10 encounter definitions. Registration, distinct painted atlases and the
// Stone Giant phase controller are integrated separately; this file alone does
// not certify that any encounter is finished or balanced for a30-minute fight.
// Levels, the new large/open category and the40-minute timer are implementation
// proposals for acceptance. The timer follows the existing outdoor default;
// each descriptor keeps its own persistent region:id death record.
// New HP multipliers and giant HP/damage are provisional encounter tuning,
// not changes to old bosses or a claim of a verified30-minute solo victory.
const names=(ru,en,es)=>({ru,en,es});
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
export const DESERT_BOSSES=freeze([
 {id:'desert-mini-0',region:'desert',type:'scarab',bossType:'mini',encounterTier:'mini',bossTheme:'ashVenom',level:42,x:1030,y:4773,respawnMs:2400000,patterns:['volley','charge'],
  names:names('Алое жало барханов','Scarlet sting of the dunes','Aguijón escarlata de las dunas')},
 {id:'desert-mini-1',region:'desert',type:'spider',bossType:'mini',encounterTier:'mini',bossTheme:'venom',level:44,x:4112,y:6157,respawnMs:2400000,patterns:['slam','volley'],
  names:names('Ткач песчаных воронок','Sand-funnel weaver','Tejedor de embudos de arena')},
 {id:'desert-mini-2',region:'desert',type:'ancientGargoyle',bossType:'mini',encounterTier:'mini',bossTheme:'outcast',level:46,x:1099,y:8781,respawnMs:2400000,patterns:['charge','volley'],
  names:names('Клюв иссохшего неба','Beak of the parched sky','Pico del cielo reseco')},
 {id:'desert-mini-3',region:'desert',type:'forestRaider',bossType:'mini',encounterTier:'mini',bossTheme:'runeSlash',level:48,x:10129,y:5879,respawnMs:2400000,patterns:['charge','slam','volley'],
  names:names('Эмир разбитого каравана','Emir of the shattered caravan','Emir de la caravana destrozada')},
 {id:'desert-mini-4',region:'desert',type:'scarab',bossType:'mini',encounterTier:'mini',bossTheme:'bronzeShock',level:49,x:12965,y:5650,respawnMs:2400000,patterns:['slam','charge'],
  names:names('Бронзовый рог пустоши','Bronze horn of the wastes','Cuerno de bronce del páramo')},
 {id:'desert-mini-5',region:'desert',type:'ancientSentinel',bossType:'mini',encounterTier:'mini',bossTheme:'colossusQuake',level:51,x:10299,y:13400,respawnMs:2400000,patterns:['slam','volley','charge'],
  names:names('Соляной раскольник','Saltstone sunderer','Quebrantador de sal')},
 {id:'desert-mini-6',region:'desert',type:'wraith',bossType:'mini',encounterTier:'mini',bossTheme:'oracleBlink',level:53,x:17774,y:5049,respawnMs:2400000,patterns:['volley','slam'],
  names:names('Провидец зыбких миражей','Seer of shifting mirages','Vidente de espejismos cambiantes')},
 {id:'desert-mini-7',region:'desert',type:'desertSnake',bossType:'mini',encounterTier:'mini',bossTheme:'venom',level:55,x:17331,y:12471,respawnMs:2400000,patterns:['volley','charge','slam'],
  names:names('Двуликая рогатая гадюка','Twin-faced horned viper','Víbora cornuda de dos rostros')},
 // large is deliberately distinct from world: the existing loot dispatcher
 // falls back to the mini table, so these two cannot yield legendary items.
 {id:'desert-open-0',region:'desert',type:'arcaneWisp',bossType:'large',encounterTier:'open',bossTheme:'outcast',level:54,x:16290,y:16044,respawnMs:2400000,patterns:['volley','charge','slam'],
  names:names('Феникс полуденного пламени','Phoenix of the noonday flame','Fénix de la llama del mediodía')},
 {id:'desert-open-1',region:'desert',type:'desertSnake',bossType:'large',encounterTier:'open',bossTheme:'tusk',level:56,x:18705,y:16456,respawnMs:2400000,patterns:['charge','slam','volley'],
  names:names('Поглотитель караванных путей','Devourer of caravan trails','Devorador de rutas de caravanas')},
 {id:'desert-world-stone-giant',region:'desert',type:'ancientSentinel',bossType:'world',encounterTier:'world',bossTheme:'colossusQuake',encounter:'stoneGiant',leashRadius:450,abilityConfig:{collisionRadius:52,faceTarget:true},maxHp:1095000,damageMultiplier:3,projectileOriginHeight:72,level:56,x:18869,y:18697,respawnMs:2400000,patterns:['slam','volley','charge'],
  names:names('Каменный гигант','Stone Giant','Gigante de piedra')}
].map(d=>({...d,hpMultiplier:d.encounter==='stoneGiant'?1:d.bossType==='large'?12:5,...(d.id==='desert-mini-0'?{movementProfile:'crawler'}:{}),...(d.id==='desert-open-0'?{movementProfile:'gargoyle',speed:95}:{}),...(d.id==='desert-open-1'?{speed:68}:{})})));
