// New species are enabled only once real art and simulation are integrated.
// Existing archetypes/items/rewards are left intact as the stat/drop baseline.
export const NEW_SPECIES=Object.freeze({
 'desert-species-000':Object.freeze({names:{ru:'Скорпион обсидианового жала',en:'Obsidian-stinger scorpion',es:'Escorpión de aguijón obsidiano'},movementProfile:'crawler',speed:82,magic:false,projectileOriginHeight:52,
  abilityConfig:Object.freeze({collisionRadius:24,faceTarget:true,abilityPattern:['venom','burrow'],range:235,cooldown:6500,windup:650,radius:55,multiplier:1.15})}),
 'desert-species-001':Object.freeze({names:{ru:'Игломёт караванных песков',en:'Caravan needle cactus',es:'Cactus de agujas de la caravana'},movementProfile:'skirmisher',speed:34,magic:false,projectileOriginHeight:36,projectile:'needle',
  abilityConfig:Object.freeze({collisionRadius:17,faceTarget:true,abilityPattern:['fan','roots'],range:320,cooldown:7000,windup:850,radius:65,multiplier:.9,preferredDistance:180,projectileMagic:false,projectileStatus:'venom'})}),
 // These four retain their actual serpent/elemental/heavy/scarab mechanics,
 // stats and drops. The new identity and original48-pose art replace fallback.
 'desert-species-002':Object.freeze({names:{ru:'Рогатая песчаная гадюка',en:'Horned sand viper',es:'Víbora cornuda de arena'}}),
 'desert-species-003':Object.freeze({names:{ru:'Дух солнечной пыли',en:'Solar dust spirit',es:'Espíritu del polvo solar'}}),
 'desert-species-004':Object.freeze({names:{ru:'Терракотовый страж',en:'Terracotta warden',es:'Guardián de terracota'}}),
 'desert-species-005':Object.freeze({names:{ru:'Жук-носорог дюн',en:'Dune rhinoceros beetle',es:'Escarabajo rinoceronte de las dunas'}}),
 // New regional identities reuse the existing bounded ability engine. Only
 // their combinations differ; HP,damage,XP,speed and drops remain archetypal.
 'forest-species-004':Object.freeze({names:{ru:'Плющевой орк руин',en:'Ivybound ruin orc',es:'Orco de las ruinas de hiedra'},abilityConfig:Object.freeze({abilityPattern:['cleave','roots']})}),
 'forest-species-006':Object.freeze({names:{ru:'Костегривый волк',en:'Bone-mane wolf',es:'Lobo de crin ósea'},abilityConfig:Object.freeze({abilityPattern:['pounce','venom']})}),
 'north-species-003':Object.freeze({names:{ru:'Кристаллический ледяной голем',en:'Crystal ice golem',es:'Gólem de hielo cristalino'},abilityConfig:Object.freeze({abilityPattern:['stomp','frost']})}),
 'ancient-species-003':Object.freeze({names:{ru:'Рунический скарабей',en:'Runic scarab',es:'Escarabajo rúnico'},abilityConfig:Object.freeze({abilityPattern:['burrow','fan'],projectileMagic:true})}),
 'forest-species-008':Object.freeze({names:{ru:'Корнекоронная гадюка',en:'Root-crowned viper',es:'Víbora coronada de raíces'},abilityConfig:Object.freeze({abilityPattern:['pounce','roots']})}),
 'north-species-011':Object.freeze({names:{ru:'Дух пепельной урны',en:'Cinder urn spirit',es:'Espíritu de urna de cenizas'},abilityConfig:Object.freeze({abilityPattern:['haunt','fan']})}),
 'ancient-species-007':Object.freeze({names:{ru:'Древний корневой страж',en:'Elder root sentinel',es:'Guardián de raíces ancestrales'},abilityConfig:Object.freeze({abilityPattern:['stomp','roots']})}),
 'desert-species-023':Object.freeze({names:{ru:'Серповидный песчаный богомол',en:'Sickle dune mantis',es:'Mantis de dunas falciforme'},abilityConfig:Object.freeze({abilityPattern:['burrow','cleave']})}),
 // Four original wild identities keep all archetype stats,geometry and drops.
 'forest-species-015':Object.freeze({names:{ru:'Мшистый секач',en:'Moss-armored tusker',es:'Jabalí de armadura musgosa'},abilityConfig:Object.freeze({abilityPattern:['charge','roots']})}),
 'north-species-017':Object.freeze({names:{ru:'Луннокрылая морозная моль',en:'Hoarfrost-winged moth',es:'Polilla de alas escarchadas'},abilityConfig:Object.freeze({abilityPattern:['dive','frost']})}),
 'ancient-species-013':Object.freeze({names:{ru:'Тростниковый утопленный рыцарь',en:'Reed-plated drowned knight',es:'Caballero ahogado de juncos'},abilityConfig:Object.freeze({abilityPattern:['cleave','venom']})}),
 'desert-species-007':Object.freeze({names:{ru:'Дух песочных часов',en:'Hourglass sand elemental',es:'Elemental del reloj de arena'},abilityConfig:Object.freeze({abilityPattern:['blink','fan']})}),
 // Eight desert identities preserve base stats, drops, geometry and timing.
 "desert-species-006":Object.freeze({names:{"ru":"Стеклогребневая змея","en":"Glass-frilled sidewinder","es":"Serpiente de cresta vítrea"},abilityConfig:Object.freeze({abilityPattern:["pounce","burrow"]})}),
 "desert-species-008":Object.freeze({names:{"ru":"Печеспинный ходок","en":"Kilnback walker","es":"Caminante de horno"},abilityConfig:Object.freeze({abilityPattern:["stomp","charge"]})}),
 "desert-species-009":Object.freeze({names:{"ru":"Саблезубый дюнный жук","en":"Sickle-jawed dune beetle","es":"Escarabajo de dunas de mandíbula curva"},abilityConfig:Object.freeze({abilityPattern:["burrow","pounce"]})}),
 "desert-species-010":Object.freeze({names:{"ru":"Ленточный дух миража","en":"Mirage ribbon spirit","es":"Espíritu de cinta del espejismo"},abilityConfig:Object.freeze({abilityPattern:["blink","dive"]})}),
 "desert-species-011":Object.freeze({names:{"ru":"Шиповенчанный песчаный угорь","en":"Thorn-crowned sand eel","es":"Anguila de arena coronada de espinas"},abilityConfig:Object.freeze({abilityPattern:["pounce","burrow"]})}),
 "desert-species-012":Object.freeze({names:{"ru":"Песчаный краб-сито","en":"Sieve-mouthed sand crab","es":"Cangrejo tamiz de arena"},abilityConfig:Object.freeze({abilityPattern:["burrow","pounce"]})}),
 "desert-species-013":Object.freeze({names:{"ru":"Кактусовый колокол","en":"Cactus bell colossus","es":"Coloso campana de cactus"},abilityConfig:Object.freeze({abilityPattern:["stomp","charge"]})}),
 "desert-species-014":Object.freeze({names:{"ru":"Луч солнечных часов","en":"Sun-dial ray","es":"Raya del reloj solar"},abilityConfig:Object.freeze({abilityPattern:["blink","dive"]})}),
 // Eight forest identities preserve base stats, drops, geometry and timing.
 "forest-species-012":Object.freeze({names:{"ru":"Чертополоховый волк","en":"Thistleback wolf","es":"Lobo de cardo"},abilityConfig:Object.freeze({abilityPattern:["pounce","roots"]})}),
 "forest-species-013":Object.freeze({names:{"ru":"Ольховая гадюка","en":"Alder-frill viper","es":"Víbora de gola de aliso"},abilityConfig:Object.freeze({abilityPattern:["pounce","venom"]})}),
 "forest-species-014":Object.freeze({names:{"ru":"Разбойник в орешниковой маске","en":"Hazel-mask bow raider","es":"Bandido de máscara de avellano"},abilityConfig:Object.freeze({abilityPattern:["shot","roots"]})}),
 "forest-species-016":Object.freeze({names:{"ru":"Трутовиковый медведь","en":"Bracketback bear","es":"Oso de hongos yesqueros"},abilityConfig:Object.freeze({abilityPattern:["stomp","roots"]})}),
 "forest-species-019":Object.freeze({names:{"ru":"Жёлудевый секач","en":"Acornjaw boar","es":"Jabalí de bellota"},abilityConfig:Object.freeze({abilityPattern:["charge","stomp"]})}),
 "forest-species-023":Object.freeze({names:{"ru":"Фонарноухая крылатка","en":"Lantern-ear bat","es":"Murciélago de orejas farol"},abilityConfig:Object.freeze({abilityPattern:["dive","blink"]})}),
 "forest-species-025":Object.freeze({names:{"ru":"Капокулакий орк","en":"Burlfist grove orc","es":"Orco de puños de nudo"},abilityConfig:Object.freeze({abilityPattern:["cleave","roots"]})}),
 "forest-species-026":Object.freeze({names:{"ru":"Тернокостный скелет","en":"Briar-cage skeleton","es":"Esqueleto de zarzas"},abilityConfig:Object.freeze({abilityPattern:["cleave","venom"]})}),
 // Eight ancient identities preserve base stats, drops, geometry and timing.
 "ancient-species-005":Object.freeze({names:{"ru":"Костегривая пепельная гадюка","en":"Bone-maned ash viper","es":"Víbora de ceniza de crin ósea"},abilityConfig:Object.freeze({abilityPattern:["pounce","venom"]})}),
 "ancient-species-008":Object.freeze({names:{"ru":"Обелисковый страж","en":"Pillarback sentinel","es":"Centinela de obeliscos"},abilityConfig:Object.freeze({abilityPattern:["stomp","roots"]})}),
 "ancient-species-010":Object.freeze({names:{"ru":"Дух расколотой амфоры","en":"Cracked amphora wisp","es":"Fuego de ánfora agrietada"},abilityConfig:Object.freeze({abilityPattern:["blink","fan"]})}),
 "ancient-species-011":Object.freeze({names:{"ru":"Часовой скарабей руин","en":"Clockwork ruin scarab","es":"Escarabajo mecánico de las ruinas"},abilityConfig:Object.freeze({abilityPattern:["burrow","cleave"]})}),
 "ancient-species-019":Object.freeze({names:{"ru":"Кородоспешный падший рыцарь","en":"Bark-spined fallen knight","es":"Caballero caído de espinas de corteza"},abilityConfig:Object.freeze({abilityPattern:["cleave","roots"]})}),
 "ancient-species-021":Object.freeze({names:{"ru":"Костеворотная горгулья","en":"Bone-frilled gargoyle","es":"Gárgola de gola ósea"},abilityConfig:Object.freeze({abilityPattern:["dive","venom"]})}),
 "ancient-species-029":Object.freeze({names:{"ru":"Болотный серпоогонёк","en":"Sickleflame marsh wisp","es":"Fuego de hoz del pantano"},abilityConfig:Object.freeze({abilityPattern:["blink","roots"]})}),
 "ancient-species-041":Object.freeze({names:{"ru":"Грибокоронный скарабей","en":"Fungal-crown scarab","es":"Escarabajo de corona fúngica"},abilityConfig:Object.freeze({abilityPattern:["burrow","roots"]})}),
 // Eight north identities preserve base stats, drops, geometry and timing.
 "north-species-007":Object.freeze({names:{"ru":"Шлаковый шакал","en":"Slag-plated ember jackal","es":"Chacal de escoria"},abilityConfig:Object.freeze({abilityPattern:["pounce","charge"]})}),
 "north-species-008":Object.freeze({names:{"ru":"Костяной налётчик","en":"Bone-mantled snow raider","es":"Saqueador de manto óseo"},abilityConfig:Object.freeze({abilityPattern:["shot","fan"]})}),
 "north-species-010":Object.freeze({names:{"ru":"Печной базальтовый исполин","en":"Furnace-backed basalt giant","es":"Gigante basáltico de horno"},abilityConfig:Object.freeze({abilityPattern:["stomp","cleave"]})}),
 "north-species-012":Object.freeze({names:{"ru":"Венценосный снежный медведь","en":"Ivory-crowned snow bear","es":"Oso níveo coronado de marfil"},abilityConfig:Object.freeze({abilityPattern:["stomp","charge"]})}),
 "north-species-014":Object.freeze({names:{"ru":"Обсидиановое веретено","en":"Obsidian spindle elemental","es":"Elemental huso de obsidiana"},abilityConfig:Object.freeze({abilityPattern:["blink","fan"]})}),
 "north-species-018":Object.freeze({names:{"ru":"Пепельный саванник","en":"Cinder-shroud revenant","es":"Aparecido del sudario de ceniza"},abilityConfig:Object.freeze({abilityPattern:["haunt","blink"]})}),
 "north-species-021":Object.freeze({names:{"ru":"Веерокрыл морозный","en":"Frost fanwing bat","es":"Murciélago abanico de escarcha"},abilityConfig:Object.freeze({abilityPattern:["dive","frost"]})}),
 "north-species-026":Object.freeze({names:{"ru":"Ледяной колокольник","en":"Suspended ice-bell elemental","es":"Elemental campana de hielo"},abilityConfig:Object.freeze({abilityPattern:["blink","frost"]})})
});
export const speciesTraits=id=>NEW_SPECIES[id]||null;
