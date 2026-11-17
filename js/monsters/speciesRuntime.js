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
 'desert-species-007':Object.freeze({names:{ru:'Дух песочных часов',en:'Hourglass sand elemental',es:'Elemental del reloj de arena'},abilityConfig:Object.freeze({abilityPattern:['blink','fan']})})
});
export const speciesTraits=id=>NEW_SPECIES[id]||null;
