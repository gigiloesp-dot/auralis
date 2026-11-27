// Ready art/species data and pure assembly only. Runtime hooks are installed
// separately; importing this module does not add camps, items or AI updates.
import {AUR203_FOREST_A_ART} from '../assets/aur203ForestAArt.js';
import {AUR203_FOREST_B_ART} from '../assets/aur203ForestBArt.js';
import {AUR203_NORTH_A_ART} from '../assets/aur203NorthAArt.js';
import {AUR203_ANCIENT_A_ART} from '../assets/aur203AncientAArt.js';
import {AUR203_DESERT_A_ART} from '../assets/aur203DesertAArt.js';
import {AUR203_EXPANSION_SPECIES_ROWS,AUR203_EXPANSION_SPECIES_ART} from './aur203ExpansionSpecies.js';
import {AUR203_PLACEMENTS} from '../world/aur203Placements.js';
const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){for(const child of Object.values(value))freeze(child);Object.freeze(value);}return value;};
const art={...AUR203_FOREST_A_ART,...AUR203_FOREST_B_ART,...AUR203_NORTH_A_ART,...AUR203_ANCIENT_A_ART,...AUR203_DESERT_A_ART,...AUR203_EXPANSION_SPECIES_ART};
// Explicit technical starting balance for NEW kinds only. XP/gold, equipment
// odds and all base archetype objects remain unchanged. Owner playtest pending.
const rows=[
  {
    "id": "forest-species-080",
    "type": "aur203ChestnutCrab",
    "region": "forest",
    "names": {
      "ru": "Каштановый краб-репей",
      "en": "Chestnut burr crab",
      "es": "Cangrejo de castaña espinosa"
    },
    "nativeLevel": 10,
    "biome": "woodland",
    "family": "crab",
    "baseType": "bear",
    "movementProfile": "scarab",
    "relativeStats": {
      "hp": 1.1,
      "attack": 0.9,
      "defense": 1.3
    },
    "speed": 54,
    "abilityConfig": {
      "abilityPattern": [
        "cleave",
        "roots"
      ],
      "collisionRadius": 20,
      "range": 190,
      "radius": 85,
      "cooldown": 7200,
      "windup": 850
    },
    "behaviorConfig": {
      "guard": {
        "range": 145,
        "windupMs": 900,
        "durationMs": 1700,
        "damageMultiplier": 0.55
      }
    },
    "loot": "aur203ChestnutCrab",
    "materialId": "chestnutCrabChitin"
  },
  {
    "id": "forest-species-081",
    "type": "aur203ReedHeron",
    "region": "forest",
    "names": {
      "ru": "Камышеклювая цапля",
      "en": "Reed-blade heron",
      "es": "Garza de pico junco"
    },
    "nativeLevel": 10,
    "biome": "woodland",
    "family": "bird",
    "baseType": "forestRaider",
    "movementProfile": "fighter",
    "relativeStats": {
      "hp": 1.0,
      "attack": 0.95,
      "defense": 0.65
    },
    "speed": 108,
    "abilityConfig": {
      "abilityPattern": [
        "charge",
        "cleave"
      ],
      "collisionRadius": 13,
      "range": 235,
      "radius": 80,
      "cooldown": 6200,
      "windup": 600
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.32,
        "distance": 110
      },
      "pack": {
        "radius": 165,
        "maxAllies": 2
      }
    },
    "loot": "aur203ReedHeron",
    "materialId": "reedHeronFeather"
  },
  {
    "id": "forest-species-082",
    "type": "aur203LanternSnail",
    "region": "forest",
    "names": {
      "ru": "Улитка фонарного панциря",
      "en": "Lantern-shell snail",
      "es": "Caracol de concha farol"
    },
    "nativeLevel": 10,
    "biome": "woodland",
    "family": "snail",
    "baseType": "bear",
    "movementProfile": "crawler",
    "relativeStats": {
      "hp": 1.22,
      "attack": 0.75,
      "defense": 1.6
    },
    "speed": 30,
    "abilityConfig": {
      "abilityPattern": [
        "haunt",
        "roots"
      ],
      "collisionRadius": 19,
      "range": 245,
      "radius": 65,
      "cooldown": 7600,
      "windup": 1000,
      "preferredDistance": 130
    },
    "behaviorConfig": {
      "guard": {
        "range": 175,
        "windupMs": 1000,
        "durationMs": 1900,
        "damageMultiplier": 0.45
      }
    },
    "loot": "aur203LanternSnail",
    "materialId": "lanternSnailMucus"
  },
  {
    "id": "forest-species-083",
    "type": "aur203AcornHopper",
    "region": "forest",
    "names": {
      "ru": "Желудёвый прыгун",
      "en": "Acorn hopper",
      "es": "Saltador de bellota"
    },
    "nativeLevel": 4,
    "biome": "woodland",
    "family": "insect",
    "baseType": "forestBat",
    "movementProfile": "predator",
    "relativeStats": {
      "hp": 1.05,
      "attack": 1.05,
      "defense": 0.8
    },
    "speed": 118,
    "abilityConfig": {
      "abilityPattern": [
        "pounce",
        "venom"
      ],
      "locomotion": "crawler",
      "collisionRadius": 10,
      "range": 220,
      "radius": 44,
      "cooldown": 5900,
      "windup": 500
    },
    "behaviorConfig": {
      "pack": {
        "radius": 150,
        "maxAllies": 3
      }
    },
    "loot": "aur203AcornHopper",
    "materialId": "acornHopperAntenna"
  },
  {
    "id": "forest-species-084",
    "type": "aur203Sundew",
    "region": "forest",
    "names": {
      "ru": "Росянка-душитель руин",
      "en": "Ruin dewtrap stalker",
      "es": "Acechadora de rocío de las ruinas"
    },
    "nativeLevel": 23,
    "biome": "abandoned-city",
    "family": "plant",
    "baseType": "forestOrc",
    "movementProfile": "heavy",
    "relativeStats": {
      "hp": 1.1,
      "attack": 0.92,
      "defense": 0.9
    },
    "speed": 31,
    "abilityConfig": {
      "abilityPattern": [
        "roots",
        "venom"
      ],
      "locomotion": "crawler",
      "collisionRadius": 17,
      "range": 300,
      "radius": 80,
      "cooldown": 7400,
      "windup": 900,
      "preferredDistance": 180
    },
    "behaviorConfig": {
      "guard": {
        "range": 165,
        "windupMs": 1050,
        "durationMs": 1500,
        "damageMultiplier": 0.65
      }
    },
    "loot": "aur203Sundew",
    "materialId": "sundewResin"
  },
  {
    "id": "forest-species-085",
    "type": "aur203MossToad",
    "region": "forest",
    "names": {
      "ru": "Мшистая жаба-гудок",
      "en": "Moss-bellows toad",
      "es": "Sapo de fuelle musgoso"
    },
    "nativeLevel": 15,
    "biome": "woodland",
    "family": "amphibian",
    "baseType": "bear",
    "movementProfile": "mauler",
    "relativeStats": {
      "hp": 1.1,
      "attack": 1.05,
      "defense": 0.85
    },
    "speed": 61,
    "abilityConfig": {
      "abilityPattern": [
        "stomp",
        "fan"
      ],
      "locomotion": "crawler",
      "collisionRadius": 18,
      "range": 250,
      "radius": 90,
      "cooldown": 7600,
      "windup": 850,
      "projectileMagic": false
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.23,
        "distance": 86,
        "durationMs": 1300
      }
    },
    "loot": "aur203MossToad",
    "materialId": "mossToadMembrane"
  },
  {
    "id": "forest-species-086",
    "type": "aur203AmberDragonfly",
    "region": "forest",
    "names": {
      "ru": "Янтарнохвостая стрекоза",
      "en": "Amber-lantern dragonfly",
      "es": "Libélula de farol ámbar"
    },
    "nativeLevel": 3,
    "biome": "woodland",
    "family": "insect",
    "baseType": "forestBat",
    "movementProfile": "bat",
    "relativeStats": {
      "hp": 0.8,
      "attack": 0.9,
      "defense": 0.7
    },
    "speed": 145,
    "abilityConfig": {
      "abilityPattern": [
        "dive",
        "fan"
      ],
      "collisionRadius": 10,
      "range": 260,
      "radius": 44,
      "cooldown": 5600,
      "windup": 600,
      "elevation": 42,
      "projectileMagic": true
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.35,
        "distance": 120,
        "durationMs": 1300
      },
      "pack": {
        "radius": 145,
        "maxAllies": 2
      }
    },
    "loot": "aur203AmberDragonfly",
    "materialId": "amberDragonflyWing"
  },
  {
    "id": "forest-species-087",
    "type": "aur203FernNewt",
    "region": "forest",
    "names": {
      "ru": "Папоротниковый тритон",
      "en": "Fern-frill newt",
      "es": "Tritón de gola de helecho"
    },
    "nativeLevel": 7,
    "biome": "woodland",
    "family": "amphibian",
    "baseType": "thornSnake",
    "movementProfile": "scarab",
    "relativeStats": {
      "hp": 0.95,
      "attack": 0.92,
      "defense": 0.9
    },
    "speed": 72,
    "abilityConfig": {
      "abilityPattern": [
        "burrow",
        "venom"
      ],
      "collisionRadius": 12,
      "range": 205,
      "radius": 55,
      "cooldown": 6800,
      "windup": 700
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.28,
        "distance": 88
      }
    },
    "loot": "aur203FernNewt",
    "materialId": "fernNewtScale"
  },
  {
    "id": "north-species-076",
    "type": "aur203RimeWalrus",
    "region": "north",
    "names": {
      "ru": "Инеебородый морж",
      "en": "Rime-whiskered walrus",
      "es": "Morsa de bigotes de escarcha"
    },
    "nativeLevel": 33,
    "biome": "snow",
    "family": "pinniped",
    "baseType": "snowBear",
    "movementProfile": "mauler",
    "relativeStats": {
      "hp": 1.2,
      "attack": 1.05,
      "defense": 1.15
    },
    "speed": 44,
    "abilityConfig": {
      "abilityPattern": [
        "charge",
        "frost"
      ],
      "locomotion": "crawler",
      "collisionRadius": 24,
      "range": 245,
      "radius": 85,
      "cooldown": 7900,
      "windup": 1000
    },
    "behaviorConfig": {
      "guard": {
        "range": 160,
        "windupMs": 950,
        "durationMs": 1700,
        "damageMultiplier": 0.6
      }
    },
    "loot": "aur203RimeWalrus",
    "materialId": "rimeWalrusTusk"
  },
  {
    "id": "north-species-077",
    "type": "aur203PowderMuskox",
    "region": "north",
    "names": {
      "ru": "Овцебык снежной гривы",
      "en": "Powder-mane muskox",
      "es": "Buey almizclero de melena nívea"
    },
    "nativeLevel": 24,
    "biome": "snow",
    "family": "ungulate",
    "baseType": "snowBear",
    "movementProfile": "charger",
    "relativeStats": {
      "hp": 1.1,
      "attack": 1.1,
      "defense": 1.0
    },
    "speed": 88,
    "abilityConfig": {
      "abilityPattern": [
        "charge",
        "stomp"
      ],
      "collisionRadius": 23,
      "range": 250,
      "radius": 90,
      "cooldown": 7600,
      "windup": 900
    },
    "behaviorConfig": {
      "pack": {
        "radius": 180,
        "maxAllies": 3
      }
    },
    "loot": "aur203PowderMuskox",
    "materialId": "powderMuskoxWool"
  },
  {
    "id": "north-species-078",
    "type": "aur203ObsidianCentipede",
    "region": "north",
    "names": {
      "ru": "Обсидиановая фонарная сколопендра",
      "en": "Obsidian lantern centipede",
      "es": "Escolopendra linterna de obsidiana"
    },
    "nativeLevel": 38,
    "biome": "volcanic",
    "family": "myriapod",
    "baseType": "frostGolem",
    "movementProfile": "crawler",
    "relativeStats": {
      "hp": 0.8,
      "attack": 1.1,
      "defense": 0.9
    },
    "speed": 85,
    "abilityConfig": {
      "abilityPattern": [
        "venom",
        "fan"
      ],
      "collisionRadius": 18,
      "range": 270,
      "radius": 25,
      "cooldown": 6200,
      "windup": 650,
      "projectileStatus": "venom",
      "projectileMagic": false,
      "preferredDistance": 155
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.25,
        "distance": 100
      },
      "pack": {
        "radius": 160,
        "maxAllies": 2
      }
    },
    "loot": "aur203ObsidianCentipede",
    "materialId": "obsidianCentipedePlate"
  },
  {
    "id": "north-species-079",
    "type": "aur203CrystalJelly",
    "region": "north",
    "names": {
      "ru": "Хрустальная медуза-колокол",
      "en": "Crystal-bell sky jellyfish",
      "es": "Medusa celeste de campana cristalina"
    },
    "nativeLevel": 31,
    "biome": "snow",
    "family": "cnidarian",
    "baseType": "iceElemental",
    "movementProfile": "ghost",
    "relativeStats": {
      "hp": 0.88,
      "attack": 0.95,
      "defense": 0.8
    },
    "speed": 62,
    "abilityConfig": {
      "abilityPattern": [
        "frost",
        "haunt"
      ],
      "collisionRadius": 13,
      "range": 275,
      "radius": 75,
      "cooldown": 7200,
      "windup": 900,
      "elevation": 38,
      "preferredDistance": 165
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.34,
        "distance": 95
      }
    },
    "loot": "aur203CrystalJelly",
    "materialId": "crystalJellyPearl"
  },
  {
    "id": "ancient-species-045",
    "type": "aur203PorcelainBellWalker",
    "region": "ancient",
    "names": {
      "ru": "Фарфоровый колоколоход",
      "en": "Porcelain bellwalker",
      "es": "Campanante de porcelana"
    },
    "nativeLevel": 40,
    "biome": "elder-ruins",
    "family": "construct",
    "baseType": "ancientSentinel",
    "movementProfile": "heavy",
    "relativeStats": {
      "hp": 0.9,
      "attack": 0.95,
      "defense": 1.05
    },
    "speed": 40,
    "abilityConfig": {
      "abilityPattern": [
        "stomp",
        "fan"
      ],
      "collisionRadius": 23,
      "range": 255,
      "radius": 105,
      "cooldown": 8200,
      "windup": 1100,
      "projectileMagic": true
    },
    "behaviorConfig": {
      "guard": {
        "range": 170,
        "windupMs": 1150,
        "durationMs": 1600,
        "damageMultiplier": 0.5
      }
    },
    "loot": "aur203PorcelainBellWalker",
    "materialId": "porcelainBellShard"
  },
  {
    "id": "ancient-species-046",
    "type": "aur203MossAxolotl",
    "region": "ancient",
    "names": {
      "ru": "Мохожабрый аксолотль",
      "en": "Moss-frill axolotl",
      "es": "Ajolote de branquias musgosas"
    },
    "nativeLevel": 35,
    "biome": "elder-forest",
    "family": "amphibian",
    "baseType": "desertSnake",
    "movementProfile": "serpent",
    "relativeStats": {
      "hp": 0.95,
      "attack": 0.9,
      "defense": 0.85
    },
    "speed": 83,
    "abilityConfig": {
      "abilityPattern": [
        "venom",
        "pounce"
      ],
      "locomotion": "crawler",
      "collisionRadius": 15,
      "range": 210,
      "radius": 52,
      "cooldown": 6400,
      "windup": 650
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.3,
        "distance": 108
      },
      "pack": {
        "radius": 155,
        "maxAllies": 2
      }
    },
    "loot": "aur203MossAxolotl",
    "materialId": "mossAxolotlFrill"
  },
  {
    "id": "ancient-species-047",
    "type": "aur203PrismCuttlefish",
    "region": "ancient",
    "names": {
      "ru": "Призмогребневая каракатица",
      "en": "Prism-crested cuttlefish",
      "es": "Sepia de cresta prismática"
    },
    "nativeLevel": 39,
    "biome": "elder-mystic",
    "family": "cephalopod",
    "baseType": "arcaneWisp",
    "movementProfile": "elemental",
    "relativeStats": {
      "hp": 0.92,
      "attack": 0.95,
      "defense": 0.75
    },
    "speed": 78,
    "abilityConfig": {
      "abilityPattern": [
        "blink",
        "fan"
      ],
      "collisionRadius": 15,
      "range": 300,
      "radius": 70,
      "cooldown": 7800,
      "windup": 850,
      "elevation": 35,
      "preferredDistance": 170,
      "projectileMagic": true
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.26,
        "distance": 110
      }
    },
    "loot": "aur203PrismCuttlefish",
    "materialId": "prismCuttleInk"
  },
  {
    "id": "ancient-species-048",
    "type": "aur203ScrollTripod",
    "region": "ancient",
    "names": {
      "ru": "Древний свиткоткач",
      "en": "Ancient scrollweaver",
      "es": "Tejedor antiguo de pergaminos"
    },
    "nativeLevel": 39,
    "biome": "elder-mystic",
    "family": "construct",
    "baseType": "arcaneWisp",
    "movementProfile": "heavy",
    "relativeStats": {
      "hp": 1.1,
      "attack": 0.9,
      "defense": 1.1
    },
    "speed": 46,
    "abilityConfig": {
      "abilityPattern": [
        "roots",
        "haunt"
      ],
      "collisionRadius": 19,
      "range": 285,
      "radius": 75,
      "cooldown": 7900,
      "windup": 1000,
      "preferredDistance": 165
    },
    "behaviorConfig": {
      "guard": {
        "range": 180,
        "windupMs": 1000,
        "durationMs": 1500,
        "damageMultiplier": 0.65
      }
    },
    "loot": "aur203ScrollTripod",
    "materialId": "scrollTripodParchment"
  },
  {
    "id": "desert-species-056",
    "type": "aur203SandstoneTrilobite",
    "region": "desert",
    "names": {
      "ru": "Песчаниковый трилобит",
      "en": "Sandstone trilobite",
      "es": "Trilobite de arenisca"
    },
    "nativeLevel": 50,
    "biome": "sand",
    "family": "arthropod",
    "baseType": "scarab",
    "movementProfile": "scarab",
    "relativeStats": {
      "hp": 1.3,
      "attack": 1.1,
      "defense": 1.4
    },
    "speed": 45,
    "abilityConfig": {
      "abilityPattern": [
        "burrow",
        "stomp"
      ],
      "collisionRadius": 24,
      "range": 220,
      "radius": 95,
      "cooldown": 8200,
      "windup": 1050
    },
    "behaviorConfig": {
      "guard": {
        "range": 160,
        "windupMs": 1100,
        "durationMs": 2000,
        "damageMultiplier": 0.5
      }
    },
    "loot": "aur203SandstoneTrilobite",
    "materialId": "sandstoneTrilobiteShell"
  },
  {
    "id": "desert-species-057",
    "type": "aur203GlassJerboa",
    "region": "desert",
    "names": {
      "ru": "Тушканчик стеклянного веера",
      "en": "Glass-sail jerboa",
      "es": "Jerbo de abanico cristalino"
    },
    "nativeLevel": 44,
    "biome": "sand",
    "family": "rodent",
    "baseType": "desertSnake",
    "movementProfile": "predator",
    "relativeStats": {
      "hp": 0.72,
      "attack": 0.82,
      "defense": 0.65
    },
    "speed": 140,
    "abilityConfig": {
      "abilityPattern": [
        "pounce",
        "fan"
      ],
      "collisionRadius": 11,
      "range": 245,
      "radius": 48,
      "cooldown": 5900,
      "windup": 550,
      "projectileMagic": false
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.42,
        "distance": 125,
        "durationMs": 1400,
        "pauseMs": 300
      }
    },
    "loot": "aur203GlassJerboa",
    "materialId": "glassJerboaWhisker"
  },
  {
    "id": "desert-species-058",
    "type": "aur203PitcherCactus",
    "region": "desert",
    "names": {
      "ru": "Кактус-кувшин корнеход",
      "en": "Pitcher-cactus rootwalker",
      "es": "Cactus jarra de raíces andantes"
    },
    "nativeLevel": 42,
    "biome": "sand",
    "family": "plant",
    "baseType": "ancientSentinel",
    "movementProfile": "heavy",
    "relativeStats": {
      "hp": 0.95,
      "attack": 0.86,
      "defense": 0.65
    },
    "speed": 26,
    "abilityConfig": {
      "abilityPattern": [
        "fan",
        "venom"
      ],
      "locomotion": "crawler",
      "collisionRadius": 20,
      "range": 320,
      "radius": 65,
      "cooldown": 7100,
      "windup": 850,
      "preferredDistance": 195,
      "projectileMagic": false,
      "projectileStatus": "venom"
    },
    "behaviorConfig": {
      "guard": {
        "range": 155,
        "windupMs": 1000,
        "durationMs": 1400,
        "damageMultiplier": 0.7
      }
    },
    "loot": "aur203PitcherCactus",
    "materialId": "pitcherCactusNeedle"
  },
  {
    "id": "desert-species-059",
    "type": "aur203DuneSailray",
    "region": "desert",
    "names": {
      "ru": "Дюнный парусный скат",
      "en": "Dune sailray",
      "es": "Raya velera de las dunas"
    },
    "nativeLevel": 48,
    "biome": "sand",
    "family": "ray",
    "baseType": "ancientGargoyle",
    "movementProfile": "gargoyle",
    "relativeStats": {
      "hp": 0.9,
      "attack": 0.95,
      "defense": 0.65
    },
    "speed": 105,
    "abilityConfig": {
      "abilityPattern": [
        "dive",
        "haunt"
      ],
      "collisionRadius": 20,
      "range": 275,
      "radius": 65,
      "cooldown": 6900,
      "windup": 850,
      "elevation": 45,
      "preferredDistance": 135
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.22,
        "distance": 115
      },
      "pack": {
        "radius": 170,
        "maxAllies": 2
      }
    },
    "loot": "aur203DuneSailray",
    "materialId": "duneSailrayFin"
  }
];
// Only these completed expansion kinds opt into the real bounded stomp status.
// The preserved first20 rows above and ordinary non-opted-in stomp stay exact.
const stunStomps={'north-species-084':{duration:700,windup:1100},'ancient-species-052':{duration:600,windup:1100},'desert-species-078':{duration:800,windup:1200}};
const expansionRows=AUR203_EXPANSION_SPECIES_ROWS.map(row=>{const stun=stunStomps[row.id];return stun?{...row,abilityConfig:{...row.abilityConfig,stunOnStomp:stun.duration,windup:Math.max(row.abilityConfig.windup,stun.windup)}}:row;});
export const AUR203_SPECIES=freeze(Object.fromEntries([...rows,...expansionRows].map(row=>[row.id,{...row,art:structuredClone(art[row.id])}])));
export const AUR203_READY_SPECIES_IDS=Object.freeze(Object.keys(AUR203_SPECIES));
export const AUR203_SPECIES_ART=Object.freeze(Object.fromEntries(Object.values(AUR203_SPECIES).map(row=>[row.id,row.art])));
const reserved=freeze(Object.fromEntries(Object.entries(AUR203_PLACEMENTS).map(([region,layout])=>[region,structuredClone(layout.camps)])));

// Accept the existing base registry as an argument to avoid a monsters.js cycle.
// The caller appends the result; this never mutates or freezes caller objects.
export function createAur203MonsterTypes(baseTypes){
 if(!baseTypes||typeof baseTypes!=='object')throw new TypeError('Base monster types are required');
 const result={};
 for(const row of Object.values(AUR203_SPECIES)){
  const base=baseTypes[row.baseType];
  if(!base||base.boss||!Number.isFinite(base.level)||!Number.isFinite(base.hp)||base.hp<=0||!Number.isFinite(base.attack)||base.attack<=0)throw new TypeError('Missing ordinary base archetype: '+row.baseType);
  if(Object.hasOwn(baseTypes,row.type))throw new RangeError('AUR-203 type already registered: '+row.type);
  result[row.type]=freeze({...structuredClone(base),name:row.names.ru,names:row.names,family:row.family,sourceArchetype:row.baseType,speciesId:row.id,aur203Revision:1,
   hp:Math.max(1,Math.round(base.hp*row.relativeStats.hp)),attack:Math.max(1,Math.round(base.attack*row.relativeStats.attack)),
   defense:Math.max(0,Math.round((base.defense||0)*row.relativeStats.defense)),
   magicDefense:Math.max(0,Math.round((base.magicDefense??(base.defense||0)*.6)*row.relativeStats.defense)),
   speed:row.speed,movementProfile:row.movementProfile,abilityConfig:row.abilityConfig,behaviorConfig:row.behaviorConfig,
   loot:row.loot,respawnMs:30000,boss:false});
 }
 return Object.freeze(result);
}

// A fail-closed activation boundary: position data alone cannot create a wolf
// fallback, a missing painted model, or an unregistered inventory item.
export function buildReadyAur203Camps(region,{registeredTypes,registeredArt,materials,materialByLoot,speciesIds=AUR203_READY_SPECIES_IDS}={}){
 if(!Object.hasOwn(reserved,region))throw new RangeError('Unknown AUR-203 region: '+region);
 if(!registeredTypes||!registeredArt||!materials||!materialByLoot)throw new TypeError('Actual type, art and material registries are required');
 if(!Array.isArray(speciesIds)||new Set(speciesIds).size!==speciesIds.length)throw new TypeError('Unique completed species IDs are required');
 for(const id of speciesIds)if(!Object.hasOwn(AUR203_SPECIES,id))throw new RangeError('Unfinished or unknown AUR-203 species: '+id);
 const selected=new Set(speciesIds),result=[];
 for(const placement of reserved[region]){
  const row=AUR203_SPECIES[placement.plannedSpeciesId];if(!row||!selected.has(row.id))continue;
  const type=registeredTypes[row.type],image=registeredArt[row.id],material=materials[row.materialId];
  if(!type||type.speciesId!==row.id||type.loot!==row.loot||type.movementProfile!==row.movementProfile||type.respawnMs!==30000||type.boss||type.speed!==row.speed||type.family!==row.family||JSON.stringify(type.abilityConfig)!==JSON.stringify(row.abilityConfig)||JSON.stringify(type.behaviorConfig)!==JSON.stringify(row.behaviorConfig))throw new Error('Species type is not ready: '+row.id);
  if(!image||image.key!==row.art.key||image.url!==row.art.url||image.atlasURL!==row.art.atlasURL||image.drawnDeath!==true||image.poseBanks?.length!==6||JSON.stringify(image)!==JSON.stringify(row.art))throw new Error('Painted species art is not ready: '+row.id);
  if(materialByLoot[row.loot]!==row.materialId||!material||material.slot!==null||material.monsterMaterial!==true||material.saleValue!==0||!['ru','en','es'].every(language=>typeof material.names?.[language]==='string'&&material.names[language].length>0)||!/^assets\/icons\/monster-materials\/aur203-[a-z0-9-]+\.png$/.test(material.iconURL||''))throw new Error('Thematic material is not ready: '+row.id);
  if(placement.level!==row.nativeLevel||placement.biome!==row.biome||placement.spawns.length!==11)throw new Error('Reserved geography changed: '+row.id);
  const camp={...structuredClone(placement),type:row.type,speciesId:row.id,aur203Revision:1,temporaryBestiary:false};
  camp.spawns=camp.spawns.map(spawn=>({...spawn,type:row.type,speciesId:row.id,names:row.names,respawnMs:30000}));
  result.push(freeze(camp));
 }
 return Object.freeze(result);
}
