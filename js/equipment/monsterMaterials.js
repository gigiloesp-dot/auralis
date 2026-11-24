// Additive non-equipment materials. No crafting value or gold sale value is
// invented here: these drops are collectible and stack through existing items.
const material=(name,en,es,level,icon)=>Object.freeze({name,names:Object.freeze({ru:name,en,es}),slot:null,level,saleValue:0,monsterMaterial:true,iconURL:`assets/icons/monster-materials/${icon}.png`});
export const MONSTER_MATERIALS=Object.freeze({
 boarTusk:material('Клык кабана','Boar tusk','Colmillo de jabalí',1,'boar-tusk'),
 raiderPouch:material('Потрёпанный кошель','Worn raider pouch','Bolsa gastada de bandido',1,'raider-pouch'),
 bearHide:material('Медвежья шкура','Bear hide','Piel de oso',1,'bear-hide'),
 spiderSilk:material('Паучий шёлк','Spider silk','Seda de araña',1,'spider-silk'),
 boneFragment:material('Обломок кости','Bone fragment','Fragmento de hueso',1,'bone-fragment'),
 iceWolfFang:material('Ледяной клык','Frost wolf fang','Colmillo de lobo helado',22,'ice-fang'),
 frostGolemCrystal:material('Кристалл ледяного голема','Frost golem crystal','Cristal de gólem helado',22,'frost-crystal'),
 sentinelRunestone:material('Рунный осколок стража','Sentinel runestone shard','Fragmento rúnico de centinela',35,'sentinel-runestone'),
 arcaneWispShard:material('Чародейский осколок','Arcane wisp shard','Fragmento de fuego arcano',35,'arcane-shard'),
 batWing:material('Крыло летучей мыши','Bat wing','Ala de murciélago',1,'bat-wing'),
 snakeScales:material('Змеиная чешуя','Snake scales','Escamas de serpiente',1,'snake-scales'),
 orcClanToken:material('Знак орочьего клана','Orc clan token','Insignia de clan orco',1,'orc-token'),
 elementalEssence:material('Стихийная эссенция','Elemental essence','Esencia elemental',22,'elemental-essence'),
 ghostVeil:material('Призрачная вуаль','Ghost veil','Velo espectral',22,'ghost-veil'),
 scarabShell:material('Панцирь скарабея','Scarab shell','Caparazón de escarabajo',35,'scarab-shell'),
 gargoyleFragment:material('Обломок горгульи','Gargoyle fragment','Fragmento de gárgola',35,'gargoyle-fragment')
});
export const MONSTER_MATERIAL_BY_LOOT=Object.freeze({boar:'boarTusk',raider:'raiderPouch',bear:'bearHide',spider:'spiderSilk',skeleton:'boneFragment',iceWolf:'iceWolfFang',frostGolem:'frostGolemCrystal',ancientSentinel:'sentinelRunestone',arcaneWisp:'arcaneWispShard',bat:'batWing',snake:'snakeScales',orc:'orcClanToken',elemental:'elementalEssence',ghost:'ghostVeil',scarab:'scarabShell',gargoyle:'gargoyleFragment'});
