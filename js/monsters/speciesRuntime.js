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
 'desert-species-005':Object.freeze({names:{ru:'Жук-носорог дюн',en:'Dune rhinoceros beetle',es:'Escarabajo rinoceronte de las dunas'}})
});
export const speciesTraits=id=>NEW_SPECIES[id]||null;
