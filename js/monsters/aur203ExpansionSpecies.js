// Pure completed64 expansion definitions. Importing does not activate camps,
// types, loot or AI. Root composes these with the separately preserved first20.
import {AUR203_FOREST_C_ART} from '../assets/aur203ForestCArt.js';
import {AUR203_FOREST_D_ART} from '../assets/aur203ForestDArt.js';
import {AUR203_FOREST_E_ART} from '../assets/aur203ForestEArt.js';
import {AUR203_NORTH_B_ART} from '../assets/aur203NorthBArt.js';
import {AUR203_NORTH_C_ART} from '../assets/aur203NorthCArt.js';
import {AUR203_NORTH_D_ART} from '../assets/aur203NorthDArt.js';
import {AUR203_NORTH_E_ART} from '../assets/aur203NorthEArt.js';
import {AUR203_ANCIENT_B_ART} from '../assets/aur203AncientBArt.js';
import {AUR203_ANCIENT_C_ART} from '../assets/aur203AncientCArt.js';
import {AUR203_ANCIENT_D_ART} from '../assets/aur203AncientDArt.js';
import {AUR203_ANCIENT_E_ART} from '../assets/aur203AncientEArt.js';
import {AUR203_DESERT_B_ART} from '../assets/aur203DesertBArt.js';
import {AUR203_DESERT_C_ART} from '../assets/aur203DesertCArt.js';
import {AUR203_DESERT_D_ART} from '../assets/aur203DesertDArt.js';
import {AUR203_DESERT_E_ART} from '../assets/aur203DesertEArt.js';
import {AUR203_DESERT_F_ART} from '../assets/aur203DesertFArt.js';
import {AUR203_DESERT_G_ART} from '../assets/aur203DesertGArt.js';
import {AUR203_DESERT_H_ART} from '../assets/aur203DesertHArt.js';
const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){for(const child of Object.values(value))freeze(child);Object.freeze(value);}return value;};
export const AUR203_EXPANSION_SPECIES_ART=freeze({...AUR203_FOREST_C_ART,...AUR203_FOREST_D_ART,...AUR203_FOREST_E_ART,...AUR203_NORTH_B_ART,...AUR203_NORTH_C_ART,...AUR203_NORTH_D_ART,...AUR203_NORTH_E_ART,...AUR203_ANCIENT_B_ART,...AUR203_ANCIENT_C_ART,...AUR203_ANCIENT_D_ART,...AUR203_ANCIENT_E_ART,...AUR203_DESERT_B_ART,...AUR203_DESERT_C_ART,...AUR203_DESERT_D_ART,...AUR203_DESERT_E_ART,...AUR203_DESERT_F_ART,...AUR203_DESERT_G_ART,...AUR203_DESERT_H_ART});
export const AUR203_EXPANSION_SPECIES_ROWS=freeze([
  {
    "id": "forest-species-088",
    "type": "aur203Forest088",
    "region": "forest",
    "names": {
      "ru": "Крылатка клёна",
      "en": "Maple-key glider",
      "es": "Planeador sámara"
    },
    "nativeLevel": 13,
    "biome": "woodland",
    "family": "mammal",
    "baseType": "forestBat",
    "movementProfile": "bat",
    "relativeStats": {
      "hp": 0.95,
      "attack": 0.92,
      "defense": 0.8
    },
    "speed": 132,
    "abilityConfig": {
      "abilityPattern": [
        "dive",
        "fan"
      ],
      "collisionRadius": 11,
      "range": 250,
      "radius": 60,
      "cooldown": 6940,
      "windup": 600,
      "elevation": 40,
      "projectileMagic": false
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.24,
        "distance": 120,
        "durationMs": 1350
      },
      "pack": {
        "radius": 150,
        "maxAllies": 3
      }
    },
    "loot": "aur203Forest088",
    "materialId": "aur203Forest088Material"
  },
  {
    "id": "forest-species-089",
    "type": "aur203Forest089",
    "region": "forest",
    "names": {
      "ru": "Желобный фонарник",
      "en": "Gutter-lantern hermit",
      "es": "Ermitaño farol"
    },
    "nativeLevel": 17,
    "biome": "abandoned-city",
    "family": "cephalopod",
    "baseType": "skeleton",
    "movementProfile": "crawler",
    "relativeStats": {
      "hp": 0.92,
      "attack": 0.9,
      "defense": 1.15
    },
    "speed": 48,
    "abilityConfig": {
      "abilityPattern": [
        "venom",
        "web"
      ],
      "collisionRadius": 17,
      "range": 235,
      "radius": 90,
      "cooldown": 7900,
      "windup": 950
    },
    "behaviorConfig": {
      "guard": {
        "range": 165,
        "windupMs": 975,
        "durationMs": 1550,
        "damageMultiplier": 0.55
      }
    },
    "loot": "aur203Forest089",
    "materialId": "aur203Forest089Material"
  },
  {
    "id": "forest-species-090",
    "type": "aur203Forest090",
    "region": "forest",
    "names": {
      "ru": "Клеверная черепаха",
      "en": "Clover-mantle tortoise",
      "es": "Tortuga trébol"
    },
    "nativeLevel": 8,
    "biome": "woodland",
    "family": "reptile",
    "baseType": "bear",
    "movementProfile": "heavy",
    "relativeStats": {
      "hp": 1.2,
      "attack": 0.8,
      "defense": 1.55
    },
    "speed": 32,
    "abilityConfig": {
      "abilityPattern": [
        "stomp",
        "roots"
      ],
      "collisionRadius": 21,
      "range": 235,
      "radius": 90,
      "cooldown": 7900,
      "windup": 950
    },
    "behaviorConfig": {
      "guard": {
        "range": 175,
        "windupMs": 1050,
        "durationMs": 1700,
        "damageMultiplier": 0.6
      }
    },
    "loot": "aur203Forest090",
    "materialId": "aur203Forest090Material"
  },
  {
    "id": "forest-species-091",
    "type": "aur203Forest091",
    "region": "forest",
    "names": {
      "ru": "Орешниковый ложкоклюв",
      "en": "Hazel-spoonbill burrower",
      "es": "Cavador pico de cuchara"
    },
    "nativeLevel": 11,
    "biome": "woodland",
    "family": "bird",
    "baseType": "forestRaider",
    "movementProfile": "scarab",
    "relativeStats": {
      "hp": 1,
      "attack": 1.05,
      "defense": 0.85
    },
    "speed": 86,
    "abilityConfig": {
      "abilityPattern": [
        "burrow",
        "cleave"
      ],
      "collisionRadius": 14,
      "range": 250,
      "radius": 60,
      "cooldown": 6580,
      "windup": 825
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.32999999999999996,
        "distance": 100,
        "durationMs": 1350
      },
      "pack": {
        "radius": 180,
        "maxAllies": 2
      }
    },
    "loot": "aur203Forest091",
    "materialId": "aur203Forest091Material"
  },
  {
    "id": "forest-species-092",
    "type": "aur203Forest092",
    "region": "forest",
    "names": {
      "ru": "Кадильная штукатурница",
      "en": "Mortar-moth censer",
      "es": "Polilla incensario"
    },
    "nativeLevel": 15,
    "biome": "abandoned-city",
    "family": "insect",
    "baseType": "skeleton",
    "movementProfile": "bat",
    "relativeStats": {
      "hp": 0.8,
      "attack": 0.92,
      "defense": 0.75
    },
    "speed": 124,
    "abilityConfig": {
      "abilityPattern": [
        "dive",
        "haunt"
      ],
      "collisionRadius": 12,
      "range": 250,
      "radius": 60,
      "cooldown": 6760,
      "windup": 600,
      "elevation": 40
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.24,
        "distance": 110,
        "durationMs": 1450
      }
    },
    "loot": "aur203Forest092",
    "materialId": "aur203Forest092Material"
  },
  {
    "id": "forest-species-093",
    "type": "aur203Forest093",
    "region": "forest",
    "names": {
      "ru": "Корешок-колокольчик",
      "en": "Bluebell rootling",
      "es": "Raicilla campanilla"
    },
    "nativeLevel": 5,
    "biome": "woodland",
    "family": "plant",
    "baseType": "thornSnake",
    "movementProfile": "fighter",
    "relativeStats": {
      "hp": 1.05,
      "attack": 0.86,
      "defense": 0.9
    },
    "speed": 45,
    "abilityConfig": {
      "abilityPattern": [
        "roots",
        "cleave"
      ],
      "collisionRadius": 12,
      "range": 235,
      "radius": 90,
      "cooldown": 7900,
      "windup": 950
    },
    "behaviorConfig": {
      "guard": {
        "range": 165,
        "windupMs": 975,
        "durationMs": 1550,
        "damageMultiplier": 0.55
      },
      "pack": {
        "radius": 160,
        "maxAllies": 2
      }
    },
    "loot": "aur203Forest093",
    "materialId": "aur203Forest093Material"
  },
  {
    "id": "forest-species-094",
    "type": "aur203Forest094",
    "region": "forest",
    "names": {
      "ru": "Ключечелюстный клещ",
      "en": "Lockjaw key-mite",
      "es": "Ácaro cerrojo"
    },
    "nativeLevel": 16,
    "biome": "abandoned-city",
    "family": "arthropod",
    "baseType": "skeleton",
    "movementProfile": "crawler",
    "relativeStats": {
      "hp": 0.85,
      "attack": 1.02,
      "defense": 1.25
    },
    "speed": 76,
    "abilityConfig": {
      "abilityPattern": [
        "cleave",
        "venom"
      ],
      "collisionRadius": 13,
      "range": 250,
      "radius": 60,
      "cooldown": 7120,
      "windup": 750
    },
    "behaviorConfig": {
      "pack": {
        "radius": 170,
        "maxAllies": 3
      }
    },
    "loot": "aur203Forest094",
    "materialId": "aur203Forest094Material"
  },
  {
    "id": "forest-species-095",
    "type": "aur203Forest095",
    "region": "forest",
    "names": {
      "ru": "Дымоходный ходулочник",
      "en": "Chimney-dome stiltbeast",
      "es": "Zancudo chimenea"
    },
    "nativeLevel": 18,
    "biome": "abandoned-city",
    "family": "mollusk",
    "baseType": "forestOrc",
    "movementProfile": "heavy",
    "relativeStats": {
      "hp": 1.3,
      "attack": 1.02,
      "defense": 1.35
    },
    "speed": 42,
    "abilityConfig": {
      "abilityPattern": [
        "stomp",
        "charge"
      ],
      "collisionRadius": 23,
      "range": 235,
      "radius": 90,
      "cooldown": 7900,
      "windup": 950
    },
    "behaviorConfig": {
      "guard": {
        "range": 185,
        "windupMs": 1125,
        "durationMs": 1850,
        "damageMultiplier": 0.65
      }
    },
    "loot": "aur203Forest095",
    "materialId": "aur203Forest095Material"
  },
  {
    "id": "forest-species-096",
    "type": "aur203Forest096",
    "region": "forest",
    "names": {
      "ru": "Витражный переплётник",
      "en": "Stained-glass folio ray",
      "es": "Raya vitral"
    },
    "nativeLevel": 18,
    "biome": "abandoned-city",
    "family": "construct",
    "baseType": "skeleton",
    "movementProfile": "ghost",
    "relativeStats": {
      "hp": 0.9,
      "attack": 0.95,
      "defense": 0.75
    },
    "speed": 67,
    "abilityConfig": {
      "abilityPattern": [
        "haunt",
        "fan"
      ],
      "collisionRadius": 16,
      "range": 285,
      "radius": 60,
      "cooldown": 6580,
      "windup": 600,
      "preferredDistance": 145,
      "elevation": 34,
      "projectileMagic": true
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.24,
        "distance": 100,
        "durationMs": 1250
      }
    },
    "loot": "aur203Forest096",
    "materialId": "aur203Forest096Material"
  },
  {
    "id": "north-species-080",
    "type": "aur203North080",
    "region": "north",
    "names": {
      "ru": "Снегоступный компасозуб",
      "en": "Snowshoe compass shrew",
      "es": "Musaraña brújula"
    },
    "nativeLevel": 22,
    "biome": "snow",
    "family": "mammal",
    "baseType": "iceWolf",
    "movementProfile": "predator",
    "relativeStats": {
      "hp": 0.82,
      "attack": 0.91,
      "defense": 0.8
    },
    "speed": 121,
    "abilityConfig": {
      "abilityPattern": [
        "pounce",
        "frost"
      ],
      "collisionRadius": 11,
      "range": 250,
      "radius": 60,
      "cooldown": 6400,
      "windup": 600
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.24,
        "distance": 90,
        "durationMs": 1450
      },
      "pack": {
        "radius": 150,
        "maxAllies": 3
      }
    },
    "loot": "aur203North080",
    "materialId": "aur203North080Material"
  },
  {
    "id": "north-species-081",
    "type": "aur203North081",
    "region": "north",
    "names": {
      "ru": "Ледокоронный тупик",
      "en": "Frost-crown puffin",
      "es": "Frailecillo coronado"
    },
    "nativeLevel": 26,
    "biome": "snow",
    "family": "bird",
    "baseType": "snowRaider",
    "movementProfile": "fighter",
    "relativeStats": {
      "hp": 0.95,
      "attack": 0.96,
      "defense": 1.05
    },
    "speed": 72,
    "abilityConfig": {
      "abilityPattern": [
        "cleave",
        "frost"
      ],
      "collisionRadius": 15,
      "range": 235,
      "radius": 90,
      "cooldown": 7900,
      "windup": 950
    },
    "behaviorConfig": {
      "guard": {
        "range": 165,
        "windupMs": 975,
        "durationMs": 1550,
        "damageMultiplier": 0.55
      },
      "pack": {
        "radius": 160,
        "maxAllies": 2
      }
    },
    "loot": "aur203North081",
    "materialId": "aur203North081Material"
  },
  {
    "id": "north-species-082",
    "type": "aur203North082",
    "region": "north",
    "names": {
      "ru": "Снежнофонарный паук",
      "en": "Snow-lantern spider",
      "es": "Araña farol de nieve"
    },
    "nativeLevel": 22,
    "biome": "snow",
    "family": "arachnid",
    "baseType": "iceWolf",
    "movementProfile": "crawler",
    "relativeStats": {
      "hp": 0.9,
      "attack": 0.94,
      "defense": 0.85
    },
    "speed": 88,
    "abilityConfig": {
      "abilityPattern": [
        "web",
        "venom"
      ],
      "collisionRadius": 14,
      "range": 250,
      "radius": 60,
      "cooldown": 6760,
      "windup": 750
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.3,
        "distance": 110,
        "durationMs": 1350
      }
    },
    "loot": "aur203North082",
    "materialId": "aur203North082Material"
  },
  {
    "id": "north-species-083",
    "type": "aur203North083",
    "region": "north",
    "names": {
      "ru": "Северосиянный куду",
      "en": "Aurora-antler kudu",
      "es": "Kudú de astas aurorales"
    },
    "nativeLevel": 30,
    "biome": "snow",
    "family": "ungulate",
    "baseType": "snowBear",
    "movementProfile": "charger",
    "relativeStats": {
      "hp": 1.05,
      "attack": 1.1,
      "defense": 0.95
    },
    "speed": 108,
    "abilityConfig": {
      "abilityPattern": [
        "charge",
        "frost"
      ],
      "collisionRadius": 20,
      "range": 250,
      "radius": 60,
      "cooldown": 6940,
      "windup": 825
    },
    "behaviorConfig": {
      "pack": {
        "radius": 180,
        "maxAllies": 2
      }
    },
    "loot": "aur203North083",
    "materialId": "aur203North083Material"
  },
  {
    "id": "north-species-084",
    "type": "aur203North084",
    "region": "north",
    "names": {
      "ru": "Ледяной шестизвон",
      "en": "Ice chime sextuped",
      "es": "Hexápodo de campanas de hielo"
    },
    "nativeLevel": 30,
    "biome": "snow",
    "family": "construct",
    "baseType": "frostGolem",
    "movementProfile": "heavy",
    "relativeStats": {
      "hp": 1.08,
      "attack": 0.93,
      "defense": 1.15
    },
    "speed": 39,
    "abilityConfig": {
      "abilityPattern": [
        "stomp",
        "frost"
      ],
      "collisionRadius": 23,
      "range": 235,
      "radius": 90,
      "cooldown": 7900,
      "windup": 950
    },
    "behaviorConfig": {
      "guard": {
        "range": 155,
        "windupMs": 900,
        "durationMs": 1400,
        "damageMultiplier": 0.5
      }
    },
    "loot": "aur203North084",
    "materialId": "aur203North084Material"
  },
  {
    "id": "north-species-085",
    "type": "aur203North085",
    "region": "north",
    "names": {
      "ru": "Ковшеклювый зимник",
      "en": "Winter spoonbill",
      "es": "Espátula invernal"
    },
    "nativeLevel": 28,
    "biome": "snow",
    "family": "bird",
    "baseType": "snowRaider",
    "movementProfile": "skirmisher",
    "relativeStats": {
      "hp": 0.9,
      "attack": 0.88,
      "defense": 0.8
    },
    "speed": 96,
    "abilityConfig": {
      "abilityPattern": [
        "fan",
        "frost"
      ],
      "collisionRadius": 14,
      "range": 285,
      "radius": 60,
      "cooldown": 6400,
      "windup": 675,
      "preferredDistance": 155,
      "projectileMagic": false
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.27,
        "distance": 90,
        "durationMs": 1350
      },
      "pack": {
        "radius": 160,
        "maxAllies": 2
      }
    },
    "loot": "aur203North085",
    "materialId": "aur203North085Material"
  },
  {
    "id": "north-species-086",
    "type": "aur203North086",
    "region": "north",
    "names": {
      "ru": "Печной богомол",
      "en": "Furnace mantis",
      "es": "Mantis de horno"
    },
    "nativeLevel": 33,
    "biome": "volcanic",
    "family": "insect",
    "baseType": "frostGolem",
    "movementProfile": "fighter",
    "relativeStats": {
      "hp": 0.84,
      "attack": 1.08,
      "defense": 0.9
    },
    "speed": 91,
    "abilityConfig": {
      "abilityPattern": [
        "cleave",
        "fan"
      ],
      "collisionRadius": 17,
      "range": 250,
      "radius": 85,
      "cooldown": 6580,
      "windup": 750,
      "locomotion": "crawler",
      "projectileMagic": true
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.3,
        "distance": 100,
        "durationMs": 1450
      }
    },
    "loot": "aur203North086",
    "materialId": "aur203North086Material"
  },
  {
    "id": "north-species-087",
    "type": "aur203North087",
    "region": "north",
    "names": {
      "ru": "Снежносферный отшельник",
      "en": "Snowglobe hermit",
      "es": "Ermitaño de esfera nevada"
    },
    "nativeLevel": 33,
    "biome": "snow",
    "family": "crustacean",
    "baseType": "frostGolem",
    "movementProfile": "scarab",
    "relativeStats": {
      "hp": 0.96,
      "attack": 0.84,
      "defense": 1.4
    },
    "speed": 45,
    "abilityConfig": {
      "abilityPattern": [
        "burrow",
        "frost"
      ],
      "collisionRadius": 20,
      "range": 235,
      "radius": 90,
      "cooldown": 7900,
      "windup": 950
    },
    "behaviorConfig": {
      "guard": {
        "range": 185,
        "windupMs": 1125,
        "durationMs": 1850,
        "damageMultiplier": 0.65
      }
    },
    "loot": "aur203North087",
    "materialId": "aur203North087Material"
  },
  {
    "id": "north-species-088",
    "type": "aur203North088",
    "region": "north",
    "names": {
      "ru": "Жароколёсый скорпион",
      "en": "Ember-wheel scorpion",
      "es": "Escorpión rueda de brasas"
    },
    "nativeLevel": 31,
    "biome": "volcanic",
    "family": "arachnid",
    "baseType": "iceWolf",
    "movementProfile": "crawler",
    "relativeStats": {
      "hp": 1.1,
      "attack": 1.07,
      "defense": 1.1
    },
    "speed": 82,
    "abilityConfig": {
      "abilityPattern": [
        "venom",
        "burrow"
      ],
      "collisionRadius": 18,
      "range": 250,
      "radius": 60,
      "cooldown": 6940,
      "windup": 600
    },
    "behaviorConfig": {
      "pack": {
        "radius": 150,
        "maxAllies": 3
      }
    },
    "loot": "aur203North088",
    "materialId": "aur203North088Material"
  },
  {
    "id": "north-species-089",
    "type": "aur203North089",
    "region": "north",
    "names": {
      "ru": "Базальтовый лопатокрот",
      "en": "Basalt shovel mole",
      "es": "Topo pala de basalto"
    },
    "nativeLevel": 31,
    "biome": "volcanic",
    "family": "mammal",
    "baseType": "frostGolem",
    "movementProfile": "scarab",
    "relativeStats": {
      "hp": 1.05,
      "attack": 1.1,
      "defense": 1.2
    },
    "speed": 62,
    "abilityConfig": {
      "abilityPattern": [
        "burrow",
        "stomp"
      ],
      "collisionRadius": 19,
      "range": 235,
      "radius": 90,
      "cooldown": 7900,
      "windup": 950
    },
    "behaviorConfig": {
      "guard": {
        "range": 165,
        "windupMs": 975,
        "durationMs": 1550,
        "damageMultiplier": 0.55
      }
    },
    "loot": "aur203North089",
    "materialId": "aur203North089Material"
  },
  {
    "id": "north-species-090",
    "type": "aur203North090",
    "region": "north",
    "names": {
      "ru": "Вьюжная воронкомоль",
      "en": "Blizzard funnel moth",
      "es": "Polilla embudo de ventisca"
    },
    "nativeLevel": 27,
    "biome": "snow",
    "family": "insect",
    "baseType": "iceBat",
    "movementProfile": "bat",
    "relativeStats": {
      "hp": 0.86,
      "attack": 0.9,
      "defense": 0.75
    },
    "speed": 137,
    "abilityConfig": {
      "abilityPattern": [
        "dive",
        "frost"
      ],
      "collisionRadius": 11,
      "range": 250,
      "radius": 60,
      "cooldown": 6400,
      "windup": 750,
      "elevation": 40
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.3,
        "distance": 90,
        "durationMs": 1250
      },
      "pack": {
        "radius": 170,
        "maxAllies": 3
      }
    },
    "loot": "aur203North090",
    "materialId": "aur203North090Material"
  },
  {
    "id": "north-species-091",
    "type": "aur203North091",
    "region": "north",
    "names": {
      "ru": "Ледострунный ходульник",
      "en": "Ice-harp strider",
      "es": "Zancudo arpa de hielo"
    },
    "nativeLevel": 25,
    "biome": "snow",
    "family": "construct",
    "baseType": "iceElemental",
    "movementProfile": "skirmisher",
    "relativeStats": {
      "hp": 0.92,
      "attack": 0.98,
      "defense": 0.9
    },
    "speed": 68,
    "abilityConfig": {
      "abilityPattern": [
        "blink",
        "frost"
      ],
      "collisionRadius": 16,
      "range": 285,
      "radius": 60,
      "cooldown": 6580,
      "windup": 825,
      "preferredDistance": 175
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.32999999999999996,
        "distance": 100,
        "durationMs": 1350
      }
    },
    "loot": "aur203North091",
    "materialId": "aur203North091Material"
  },
  {
    "id": "north-species-092",
    "type": "aur203North092",
    "region": "north",
    "names": {
      "ru": "Снежноцветный долгоносик",
      "en": "Snowflower weevil",
      "es": "Gorgojo flor de nieve"
    },
    "nativeLevel": 23,
    "biome": "snow",
    "family": "insect",
    "baseType": "iceWolf",
    "movementProfile": "scarab",
    "relativeStats": {
      "hp": 0.84,
      "attack": 0.88,
      "defense": 1.1
    },
    "speed": 79,
    "abilityConfig": {
      "abilityPattern": [
        "burrow",
        "frost"
      ],
      "collisionRadius": 12,
      "range": 250,
      "radius": 60,
      "cooldown": 6760,
      "windup": 600
    },
    "behaviorConfig": {
      "pack": {
        "radius": 150,
        "maxAllies": 3
      }
    },
    "loot": "aur203North092",
    "materialId": "aur203North092Material"
  },
  {
    "id": "north-species-093",
    "type": "aur203North093",
    "region": "north",
    "names": {
      "ru": "Кальдерный броненосец",
      "en": "Caldera armadillo",
      "es": "Armadillo de caldera"
    },
    "nativeLevel": 33,
    "biome": "volcanic",
    "family": "mammal",
    "baseType": "frostGolem",
    "movementProfile": "heavy",
    "relativeStats": {
      "hp": 1.16,
      "attack": 1.02,
      "defense": 1.35
    },
    "speed": 48,
    "abilityConfig": {
      "abilityPattern": [
        "charge",
        "stomp"
      ],
      "collisionRadius": 23,
      "range": 235,
      "radius": 90,
      "cooldown": 7900,
      "windup": 950
    },
    "behaviorConfig": {
      "guard": {
        "range": 165,
        "windupMs": 975,
        "durationMs": 1550,
        "damageMultiplier": 0.55
      }
    },
    "loot": "aur203North093",
    "materialId": "aur203North093Material"
  },
  {
    "id": "ancient-species-049",
    "type": "aur203Ancient049",
    "region": "ancient",
    "names": {
      "ru": "Корнеколёсая цикада",
      "en": "Rootwheel Cicada",
      "es": "Cigarra de rueda raíz"
    },
    "nativeLevel": 36,
    "biome": "elder-forest",
    "family": "insect",
    "baseType": "desertSnake",
    "movementProfile": "crawler",
    "relativeStats": {
      "hp": 0.88,
      "attack": 0.9,
      "defense": 0.85
    },
    "speed": 71,
    "abilityConfig": {
      "abilityPattern": [
        "roots",
        "burrow"
      ],
      "collisionRadius": 14,
      "range": 235,
      "radius": 90,
      "cooldown": 7900,
      "windup": 950
    },
    "behaviorConfig": {
      "guard": {
        "range": 165,
        "windupMs": 975,
        "durationMs": 1550,
        "damageMultiplier": 0.55
      },
      "pack": {
        "radius": 160,
        "maxAllies": 2
      }
    },
    "loot": "aur203Ancient049",
    "materialId": "aur203Ancient049Material"
  },
  {
    "id": "ancient-species-050",
    "type": "aur203Ancient050",
    "region": "ancient",
    "names": {
      "ru": "Кувшиноспинный прыгун",
      "en": "Vesselback Mudskipper",
      "es": "Saltarín de vasija"
    },
    "nativeLevel": 37,
    "biome": "elder-marsh",
    "family": "fish",
    "baseType": "desertSnake",
    "movementProfile": "predator",
    "relativeStats": {
      "hp": 0.94,
      "attack": 0.96,
      "defense": 0.85
    },
    "speed": 93,
    "abilityConfig": {
      "abilityPattern": [
        "pounce",
        "venom"
      ],
      "collisionRadius": 15,
      "range": 250,
      "radius": 60,
      "cooldown": 6400,
      "windup": 750,
      "locomotion": "crawler"
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.3,
        "distance": 90,
        "durationMs": 1450
      }
    },
    "loot": "aur203Ancient050",
    "materialId": "aur203Ancient050Material"
  },
  {
    "id": "ancient-species-051",
    "type": "aur203Ancient051",
    "region": "ancient",
    "names": {
      "ru": "Мозаичный богомол",
      "en": "Mosaic Mantis",
      "es": "Mantis de mosaico"
    },
    "nativeLevel": 38,
    "biome": "elder-ruins",
    "family": "insect",
    "baseType": "ancientSentinel",
    "movementProfile": "fighter",
    "relativeStats": {
      "hp": 0.86,
      "attack": 1.07,
      "defense": 0.85
    },
    "speed": 94,
    "abilityConfig": {
      "abilityPattern": [
        "cleave",
        "fan"
      ],
      "collisionRadius": 17,
      "range": 250,
      "radius": 85,
      "cooldown": 6580,
      "windup": 825,
      "locomotion": "crawler",
      "projectileMagic": false
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.32999999999999996,
        "distance": 100,
        "durationMs": 1250
      },
      "pack": {
        "radius": 180,
        "maxAllies": 2
      }
    },
    "loot": "aur203Ancient051",
    "materialId": "aur203Ancient051Material"
  },
  {
    "id": "ancient-species-052",
    "type": "aur203Ancient052",
    "region": "ancient",
    "names": {
      "ru": "Астролябовая черепаха",
      "en": "Astrolabe Tortoise",
      "es": "Tortuga de astrolabio"
    },
    "nativeLevel": 37,
    "biome": "elder-ruins",
    "family": "reptile",
    "baseType": "ancientSentinel",
    "movementProfile": "heavy",
    "relativeStats": {
      "hp": 1.12,
      "attack": 0.88,
      "defense": 1.5
    },
    "speed": 31,
    "abilityConfig": {
      "abilityPattern": [
        "stomp",
        "blink"
      ],
      "collisionRadius": 23,
      "range": 235,
      "radius": 90,
      "cooldown": 7900,
      "windup": 950
    },
    "behaviorConfig": {
      "guard": {
        "range": 155,
        "windupMs": 900,
        "durationMs": 1400,
        "damageMultiplier": 0.5
      }
    },
    "loot": "aur203Ancient052",
    "materialId": "aur203Ancient052Material"
  },
  {
    "id": "ancient-species-053",
    "type": "aur203Ancient053",
    "region": "ancient",
    "names": {
      "ru": "Замковый баран",
      "en": "Keystone Ram",
      "es": "Carnero de clave"
    },
    "nativeLevel": 38,
    "biome": "elder-ruins",
    "family": "ungulate",
    "baseType": "ancientSentinel",
    "movementProfile": "charger",
    "relativeStats": {
      "hp": 1,
      "attack": 1.12,
      "defense": 1.05
    },
    "speed": 104,
    "abilityConfig": {
      "abilityPattern": [
        "charge",
        "stomp"
      ],
      "collisionRadius": 21,
      "range": 250,
      "radius": 60,
      "cooldown": 6940,
      "windup": 675
    },
    "behaviorConfig": {
      "pack": {
        "radius": 160,
        "maxAllies": 2
      }
    },
    "loot": "aur203Ancient053",
    "materialId": "aur203Ancient053Material"
  },
  {
    "id": "ancient-species-054",
    "type": "aur203Ancient054",
    "region": "ancient",
    "names": {
      "ru": "Обсидиановый коршун",
      "en": "Obsidian Kite",
      "es": "Milano de obsidiana"
    },
    "nativeLevel": 40,
    "biome": "elder-wastes",
    "family": "bird",
    "baseType": "ancientGargoyle",
    "movementProfile": "bat",
    "relativeStats": {
      "hp": 0.83,
      "attack": 1.02,
      "defense": 0.75
    },
    "speed": 133,
    "abilityConfig": {
      "abilityPattern": [
        "dive",
        "fan"
      ],
      "collisionRadius": 14,
      "range": 250,
      "radius": 60,
      "cooldown": 7120,
      "windup": 750,
      "elevation": 40,
      "projectileMagic": false
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.3,
        "distance": 130,
        "durationMs": 1250
      }
    },
    "loot": "aur203Ancient054",
    "materialId": "aur203Ancient054Material"
  },
  {
    "id": "ancient-species-055",
    "type": "aur203Ancient055",
    "region": "ancient",
    "names": {
      "ru": "Солекоронный панголин",
      "en": "Saltcrown Pangolin",
      "es": "Pangolín de corona salina"
    },
    "nativeLevel": 41,
    "biome": "elder-dry",
    "family": "mammal",
    "baseType": "scarab",
    "movementProfile": "scarab",
    "relativeStats": {
      "hp": 1.13,
      "attack": 0.98,
      "defense": 1.4
    },
    "speed": 55,
    "abilityConfig": {
      "abilityPattern": [
        "burrow",
        "charge"
      ],
      "collisionRadius": 21,
      "range": 235,
      "radius": 90,
      "cooldown": 7900,
      "windup": 950
    },
    "behaviorConfig": {
      "guard": {
        "range": 185,
        "windupMs": 1125,
        "durationMs": 1850,
        "damageMultiplier": 0.65
      }
    },
    "loot": "aur203Ancient055",
    "materialId": "aur203Ancient055Material"
  },
  {
    "id": "ancient-species-056",
    "type": "aur203Ancient056",
    "region": "ancient",
    "names": {
      "ru": "Фумарольный ежовик",
      "en": "Fumarole Urchin",
      "es": "Erizo de fumarola"
    },
    "nativeLevel": 39,
    "biome": "elder-wastes",
    "family": "echinoderm",
    "baseType": "voidElemental",
    "movementProfile": "elemental",
    "relativeStats": {
      "hp": 0.86,
      "attack": 0.98,
      "defense": 0.9
    },
    "speed": 63,
    "abilityConfig": {
      "abilityPattern": [
        "blink",
        "shot"
      ],
      "collisionRadius": 16,
      "range": 285,
      "radius": 60,
      "cooldown": 6580,
      "windup": 600,
      "preferredDistance": 145,
      "elevation": 34,
      "projectileMagic": true
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.24,
        "distance": 100,
        "durationMs": 1450
      }
    },
    "loot": "aur203Ancient056",
    "materialId": "aur203Ancient056Material"
  },
  {
    "id": "ancient-species-057",
    "type": "aur203Ancient057",
    "region": "ancient",
    "names": {
      "ru": "Медношапочный заяц",
      "en": "Coppercap Hare",
      "es": "Liebre de sombrero cobrizo"
    },
    "nativeLevel": 36,
    "biome": "elder-forest",
    "family": "mammal",
    "baseType": "desertSnake",
    "movementProfile": "predator",
    "relativeStats": {
      "hp": 0.8,
      "attack": 0.88,
      "defense": 0.75
    },
    "speed": 126,
    "abilityConfig": {
      "abilityPattern": [
        "pounce",
        "roots"
      ],
      "collisionRadius": 12,
      "range": 250,
      "radius": 60,
      "cooldown": 6760,
      "windup": 675
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.27,
        "distance": 110,
        "durationMs": 1250
      },
      "pack": {
        "radius": 160,
        "maxAllies": 2
      }
    },
    "loot": "aur203Ancient057",
    "materialId": "aur203Ancient057Material"
  },
  {
    "id": "ancient-species-058",
    "type": "aur203Ancient058",
    "region": "ancient",
    "names": {
      "ru": "Болотный арфоугорь",
      "en": "Bogharp Eel",
      "es": "Anguila arpa de ciénaga"
    },
    "nativeLevel": 38,
    "biome": "elder-marsh",
    "family": "fish",
    "baseType": "desertSnake",
    "movementProfile": "serpent",
    "relativeStats": {
      "hp": 0.94,
      "attack": 1.02,
      "defense": 0.85
    },
    "speed": 97,
    "abilityConfig": {
      "abilityPattern": [
        "venom",
        "pounce"
      ],
      "collisionRadius": 15,
      "range": 250,
      "radius": 60,
      "cooldown": 6940,
      "windup": 750,
      "locomotion": "crawler"
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.3,
        "distance": 120,
        "durationMs": 1350
      }
    },
    "loot": "aur203Ancient058",
    "materialId": "aur203Ancient058Material"
  },
  {
    "id": "ancient-species-059",
    "type": "aur203Ancient059",
    "region": "ancient",
    "names": {
      "ru": "Базальтовый як",
      "en": "Basalt Yak",
      "es": "Yak de basalto"
    },
    "nativeLevel": 39,
    "biome": "elder-wastes",
    "family": "ungulate",
    "baseType": "ancientSentinel",
    "movementProfile": "mauler",
    "relativeStats": {
      "hp": 1.18,
      "attack": 1.08,
      "defense": 1.22
    },
    "speed": 68,
    "abilityConfig": {
      "abilityPattern": [
        "stomp",
        "charge"
      ],
      "collisionRadius": 24,
      "range": 235,
      "radius": 90,
      "cooldown": 7900,
      "windup": 950
    },
    "behaviorConfig": {
      "guard": {
        "range": 185,
        "windupMs": 1125,
        "durationMs": 1850,
        "damageMultiplier": 0.65
      },
      "pack": {
        "radius": 180,
        "maxAllies": 2
      }
    },
    "loot": "aur203Ancient059",
    "materialId": "aur203Ancient059Material"
  },
  {
    "id": "ancient-species-060",
    "type": "aur203Ancient060",
    "region": "ancient",
    "names": {
      "ru": "Семяфонарный геккон",
      "en": "Seedlantern Gecko",
      "es": "Geco de farol semilla"
    },
    "nativeLevel": 36,
    "biome": "elder-forest",
    "family": "reptile",
    "baseType": "arcaneWisp",
    "movementProfile": "skirmisher",
    "relativeStats": {
      "hp": 0.88,
      "attack": 0.9,
      "defense": 0.8
    },
    "speed": 112,
    "abilityConfig": {
      "abilityPattern": [
        "shot",
        "roots"
      ],
      "collisionRadius": 12,
      "range": 285,
      "radius": 60,
      "cooldown": 6400,
      "windup": 600,
      "preferredDistance": 145,
      "projectileMagic": false
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.24,
        "distance": 90,
        "durationMs": 1250
      },
      "pack": {
        "radius": 150,
        "maxAllies": 3
      }
    },
    "loot": "aur203Ancient060",
    "materialId": "aur203Ancient060Material"
  },
  {
    "id": "ancient-species-061",
    "type": "aur203Ancient061",
    "region": "ancient",
    "names": {
      "ru": "Рогокрылый сыч",
      "en": "Antlerwing Owl",
      "es": "Mochuelo alicornio"
    },
    "nativeLevel": 37,
    "biome": "elder-forest",
    "family": "bird",
    "baseType": "ancientGargoyle",
    "movementProfile": "gargoyle",
    "relativeStats": {
      "hp": 0.92,
      "attack": 0.98,
      "defense": 0.85
    },
    "speed": 111,
    "abilityConfig": {
      "abilityPattern": [
        "dive",
        "haunt"
      ],
      "collisionRadius": 18,
      "range": 250,
      "radius": 60,
      "cooldown": 6580,
      "windup": 675,
      "elevation": 45
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.27,
        "distance": 100,
        "durationMs": 1350
      }
    },
    "loot": "aur203Ancient061",
    "materialId": "aur203Ancient061Material"
  },
  {
    "id": "desert-species-060",
    "type": "aur203Desert060",
    "region": "desert",
    "names": {
      "en": "Anvilclaw Scorpion",
      "ru": "Скорпион-наковальня",
      "es": "Escorpión Yunque"
    },
    "nativeLevel": 51,
    "biome": "sand",
    "family": "arachnid",
    "baseType": "scarab",
    "movementProfile": "crawler",
    "relativeStats": {
      "hp": 1.14,
      "attack": 1.05,
      "defense": 1.2
    },
    "speed": 58,
    "abilityConfig": {
      "abilityPattern": [
        "venom",
        "cleave"
      ],
      "collisionRadius": 22,
      "range": 235,
      "radius": 90,
      "cooldown": 7900,
      "windup": 950
    },
    "behaviorConfig": {
      "guard": {
        "range": 155,
        "windupMs": 900,
        "durationMs": 1400,
        "damageMultiplier": 0.5
      }
    },
    "loot": "aur203Desert060",
    "materialId": "aur203Desert060Material"
  },
  {
    "id": "desert-species-061",
    "type": "aur203Desert061",
    "region": "desert",
    "names": {
      "en": "Hourglass Dune Weaver",
      "ru": "Песочный ткач",
      "es": "Tejedor de Dunas"
    },
    "nativeLevel": 46,
    "biome": "sand",
    "family": "arachnid",
    "baseType": "desertSnake",
    "movementProfile": "crawler",
    "relativeStats": {
      "hp": 0.9,
      "attack": 0.88,
      "defense": 0.8
    },
    "speed": 87,
    "abilityConfig": {
      "abilityPattern": [
        "web",
        "venom"
      ],
      "collisionRadius": 15,
      "range": 250,
      "radius": 60,
      "cooldown": 6580,
      "windup": 675
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.27,
        "distance": 100,
        "durationMs": 1350
      }
    },
    "loot": "aur203Desert061",
    "materialId": "aur203Desert061Material"
  },
  {
    "id": "desert-species-062",
    "type": "aur203Desert062",
    "region": "desert",
    "names": {
      "en": "Kilnback Dune Giant",
      "ru": "Печной исполин",
      "es": "Gigante Horno"
    },
    "nativeLevel": 51,
    "biome": "sand",
    "family": "giant",
    "baseType": "ancientSentinel",
    "movementProfile": "heavy",
    "relativeStats": {
      "hp": 1.22,
      "attack": 1.1,
      "defense": 1.15
    },
    "speed": 38,
    "abilityConfig": {
      "abilityPattern": [
        "stomp",
        "cleave"
      ],
      "collisionRadius": 24,
      "range": 235,
      "radius": 90,
      "cooldown": 7900,
      "windup": 950
    },
    "behaviorConfig": {
      "guard": {
        "range": 175,
        "windupMs": 1050,
        "durationMs": 1700,
        "damageMultiplier": 0.6
      }
    },
    "loot": "aur203Desert062",
    "materialId": "aur203Desert062Material"
  },
  {
    "id": "desert-species-063",
    "type": "aur203Desert063",
    "region": "desert",
    "names": {
      "en": "Moonblade Scorpion",
      "ru": "Лунноклешнёвый скорпион",
      "es": "Escorpión Lunafilo"
    },
    "nativeLevel": 53,
    "biome": "sand",
    "family": "arachnid",
    "baseType": "scarab",
    "movementProfile": "crawler",
    "relativeStats": {
      "hp": 0.95,
      "attack": 1.12,
      "defense": 0.9
    },
    "speed": 94,
    "abilityConfig": {
      "abilityPattern": [
        "venom",
        "burrow"
      ],
      "collisionRadius": 18,
      "range": 250,
      "radius": 60,
      "cooldown": 6940,
      "windup": 825
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.32999999999999996,
        "distance": 120,
        "durationMs": 1250
      },
      "pack": {
        "radius": 180,
        "maxAllies": 2
      }
    },
    "loot": "aur203Desert063",
    "materialId": "aur203Desert063Material"
  },
  {
    "id": "desert-species-064",
    "type": "aur203Desert064",
    "region": "desert",
    "names": {
      "en": "Salt Rosette Behemoth",
      "ru": "Соляной розетник",
      "es": "Behemot de Sal"
    },
    "nativeLevel": 52,
    "biome": "sand",
    "family": "mammal",
    "baseType": "ancientSentinel",
    "movementProfile": "heavy",
    "relativeStats": {
      "hp": 1.3,
      "attack": 1.03,
      "defense": 1.3
    },
    "speed": 43,
    "abilityConfig": {
      "abilityPattern": [
        "charge",
        "stomp"
      ],
      "collisionRadius": 24,
      "range": 235,
      "radius": 90,
      "cooldown": 7900,
      "windup": 950
    },
    "behaviorConfig": {
      "guard": {
        "range": 155,
        "windupMs": 900,
        "durationMs": 1400,
        "damageMultiplier": 0.5
      }
    },
    "loot": "aur203Desert064",
    "materialId": "aur203Desert064Material"
  },
  {
    "id": "desert-species-065",
    "type": "aur203Desert065",
    "region": "desert",
    "names": {
      "en": "Sunwheel Basilisk",
      "ru": "Солнцеколёсый василиск",
      "es": "Basilisco Solar"
    },
    "nativeLevel": 49,
    "biome": "sand",
    "family": "reptile",
    "baseType": "desertSnake",
    "movementProfile": "predator",
    "relativeStats": {
      "hp": 1.02,
      "attack": 1.08,
      "defense": 0.85
    },
    "speed": 117,
    "abilityConfig": {
      "abilityPattern": [
        "pounce",
        "venom"
      ],
      "collisionRadius": 16,
      "range": 250,
      "radius": 60,
      "cooldown": 6400,
      "windup": 675
    },
    "behaviorConfig": {
      "pack": {
        "radius": 160,
        "maxAllies": 2
      }
    },
    "loot": "aur203Desert065",
    "materialId": "aur203Desert065Material"
  },
  {
    "id": "desert-species-066",
    "type": "aur203Desert066",
    "region": "desert",
    "names": {
      "en": "Bellows Throat Toad",
      "ru": "Жаба-меховик",
      "es": "Sapo Fuelle"
    },
    "nativeLevel": 51,
    "biome": "sand",
    "family": "amphibian",
    "baseType": "ancientSentinel",
    "movementProfile": "mauler",
    "relativeStats": {
      "hp": 1.12,
      "attack": 0.94,
      "defense": 0.9
    },
    "speed": 54,
    "abilityConfig": {
      "abilityPattern": [
        "stomp",
        "fan"
      ],
      "collisionRadius": 21,
      "range": 250,
      "radius": 60,
      "cooldown": 6580,
      "windup": 750,
      "locomotion": "crawler",
      "projectileMagic": false
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.3,
        "distance": 100,
        "durationMs": 1250
      }
    },
    "loot": "aur203Desert066",
    "materialId": "aur203Desert066Material"
  },
  {
    "id": "desert-species-067",
    "type": "aur203Desert067",
    "region": "desert",
    "names": {
      "en": "Copperkite Skimmer",
      "ru": "Меднокрылый планер",
      "es": "Planeador Cobrizo"
    },
    "nativeLevel": 49,
    "biome": "sand",
    "family": "insect",
    "baseType": "ancientGargoyle",
    "movementProfile": "bat",
    "relativeStats": {
      "hp": 0.83,
      "attack": 0.95,
      "defense": 0.75
    },
    "speed": 139,
    "abilityConfig": {
      "abilityPattern": [
        "dive",
        "fan"
      ],
      "collisionRadius": 13,
      "range": 250,
      "radius": 60,
      "cooldown": 6760,
      "windup": 825,
      "elevation": 40,
      "projectileMagic": false
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.32999999999999996,
        "distance": 110,
        "durationMs": 1350
      },
      "pack": {
        "radius": 180,
        "maxAllies": 2
      }
    },
    "loot": "aur203Desert067",
    "materialId": "aur203Desert067Material"
  },
  {
    "id": "desert-species-068",
    "type": "aur203Desert068",
    "region": "desert",
    "names": {
      "en": "Glassbell Scorpion",
      "ru": "Стеклоколоколый скорпион",
      "es": "Escorpión Campana"
    },
    "nativeLevel": 49,
    "biome": "sand",
    "family": "arachnid",
    "baseType": "scarab",
    "movementProfile": "crawler",
    "relativeStats": {
      "hp": 0.96,
      "attack": 1.04,
      "defense": 1.15
    },
    "speed": 66,
    "abilityConfig": {
      "abilityPattern": [
        "venom",
        "stomp"
      ],
      "collisionRadius": 20,
      "range": 235,
      "radius": 90,
      "cooldown": 7900,
      "windup": 950
    },
    "behaviorConfig": {
      "guard": {
        "range": 155,
        "windupMs": 900,
        "durationMs": 1400,
        "damageMultiplier": 0.5
      }
    },
    "loot": "aur203Desert068",
    "materialId": "aur203Desert068Material"
  },
  {
    "id": "desert-species-069",
    "type": "aur203Desert069",
    "region": "desert",
    "names": {
      "en": "Dune Spindle Serpent",
      "ru": "Веретённый пескозмей",
      "es": "Serpiente Husillo"
    },
    "nativeLevel": 50,
    "biome": "sand",
    "family": "reptile",
    "baseType": "desertSnake",
    "movementProfile": "serpent",
    "relativeStats": {
      "hp": 1.04,
      "attack": 1.1,
      "defense": 0.9
    },
    "speed": 107,
    "abilityConfig": {
      "abilityPattern": [
        "pounce",
        "venom"
      ],
      "collisionRadius": 16,
      "range": 250,
      "radius": 60,
      "cooldown": 7120,
      "windup": 675
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.27,
        "distance": 130,
        "durationMs": 1250
      }
    },
    "loot": "aur203Desert069",
    "materialId": "aur203Desert069Material"
  },
  {
    "id": "desert-species-070",
    "type": "aur203Desert070",
    "region": "desert",
    "names": {
      "en": "Ramhorn Sand Titan",
      "ru": "Баранорогий титан",
      "es": "Titán Cornudo"
    },
    "nativeLevel": 53,
    "biome": "sand",
    "family": "giant",
    "baseType": "ancientSentinel",
    "movementProfile": "heavy",
    "relativeStats": {
      "hp": 1.3,
      "attack": 1.15,
      "defense": 1.2
    },
    "speed": 46,
    "abilityConfig": {
      "abilityPattern": [
        "charge",
        "stomp"
      ],
      "collisionRadius": 24,
      "range": 235,
      "radius": 90,
      "cooldown": 7900,
      "windup": 950
    },
    "behaviorConfig": {
      "guard": {
        "range": 175,
        "windupMs": 1050,
        "durationMs": 1700,
        "damageMultiplier": 0.6
      },
      "pack": {
        "radius": 170,
        "maxAllies": 3
      }
    },
    "loot": "aur203Desert070",
    "materialId": "aur203Desert070Material"
  },
  {
    "id": "desert-species-071",
    "type": "aur203Desert071",
    "region": "desert",
    "names": {
      "en": "Saffron Shovel Mole",
      "ru": "Шафранный лопатокрот",
      "es": "Topo Azafrán"
    },
    "nativeLevel": 50,
    "biome": "sand",
    "family": "mammal",
    "baseType": "scarab",
    "movementProfile": "scarab",
    "relativeStats": {
      "hp": 0.96,
      "attack": 1.03,
      "defense": 1.1
    },
    "speed": 78,
    "abilityConfig": {
      "abilityPattern": [
        "burrow",
        "cleave"
      ],
      "collisionRadius": 16,
      "range": 250,
      "radius": 60,
      "cooldown": 6580,
      "windup": 825
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.32999999999999996,
        "distance": 100,
        "durationMs": 1450
      }
    },
    "loot": "aur203Desert071",
    "materialId": "aur203Desert071Material"
  },
  {
    "id": "desert-species-072",
    "type": "aur203Desert072",
    "region": "desert",
    "names": {
      "en": "Sicklefan Mantis",
      "ru": "Серповеерный богомол",
      "es": "Mantis Abanico"
    },
    "nativeLevel": 52,
    "biome": "sand",
    "family": "insect",
    "baseType": "fallenKnight",
    "movementProfile": "fighter",
    "relativeStats": {
      "hp": 0.87,
      "attack": 1.12,
      "defense": 0.82
    },
    "speed": 109,
    "abilityConfig": {
      "abilityPattern": [
        "cleave",
        "pounce"
      ],
      "collisionRadius": 17,
      "range": 250,
      "radius": 85,
      "cooldown": 6760,
      "windup": 600,
      "locomotion": "crawler"
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.24,
        "distance": 110,
        "durationMs": 1250
      },
      "pack": {
        "radius": 150,
        "maxAllies": 3
      }
    },
    "loot": "aur203Desert072",
    "materialId": "aur203Desert072Material"
  },
  {
    "id": "desert-species-073",
    "type": "aur203Desert073",
    "region": "desert",
    "names": {
      "en": "Pebblebill Sand Hopper",
      "ru": "Камнеклювый пескоскакун",
      "es": "Saltador Picopiedra"
    },
    "nativeLevel": 44,
    "biome": "sand",
    "family": "bird",
    "baseType": "desertSnake",
    "movementProfile": "skirmisher",
    "relativeStats": {
      "hp": 0.8,
      "attack": 0.88,
      "defense": 0.7
    },
    "speed": 129,
    "abilityConfig": {
      "abilityPattern": [
        "shot",
        "pounce"
      ],
      "collisionRadius": 11,
      "range": 285,
      "radius": 60,
      "cooldown": 6940,
      "windup": 675,
      "preferredDistance": 155,
      "projectileMagic": false
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.27,
        "distance": 120,
        "durationMs": 1350
      },
      "pack": {
        "radius": 160,
        "maxAllies": 2
      }
    },
    "loot": "aur203Desert073",
    "materialId": "aur203Desert073Material"
  },
  {
    "id": "desert-species-074",
    "type": "aur203Desert074",
    "region": "desert",
    "names": {
      "en": "Crowncarapace Scorpion",
      "ru": "Коронопанцирный скорпион",
      "es": "Escorpión Corona"
    },
    "nativeLevel": 54,
    "biome": "sand",
    "family": "arachnid",
    "baseType": "scarab",
    "movementProfile": "heavy",
    "relativeStats": {
      "hp": 1.26,
      "attack": 1.08,
      "defense": 1.4
    },
    "speed": 41,
    "abilityConfig": {
      "abilityPattern": [
        "venom",
        "charge"
      ],
      "collisionRadius": 24,
      "range": 235,
      "radius": 90,
      "cooldown": 7900,
      "windup": 950,
      "locomotion": "crawler"
    },
    "behaviorConfig": {
      "guard": {
        "range": 175,
        "windupMs": 1050,
        "durationMs": 1700,
        "damageMultiplier": 0.6
      }
    },
    "loot": "aur203Desert074",
    "materialId": "aur203Desert074Material"
  },
  {
    "id": "desert-species-075",
    "type": "aur203Desert075",
    "region": "desert",
    "names": {
      "en": "Sandglass Ibex",
      "ru": "Пескостеклянный козерог",
      "es": "Íbice de Vidrio"
    },
    "nativeLevel": 52,
    "biome": "sand",
    "family": "ungulate",
    "baseType": "ancientSentinel",
    "movementProfile": "charger",
    "relativeStats": {
      "hp": 1,
      "attack": 1.14,
      "defense": 0.95
    },
    "speed": 113,
    "abilityConfig": {
      "abilityPattern": [
        "charge",
        "cleave"
      ],
      "collisionRadius": 21,
      "range": 250,
      "radius": 60,
      "cooldown": 6400,
      "windup": 825
    },
    "behaviorConfig": {
      "pack": {
        "radius": 180,
        "maxAllies": 2
      }
    },
    "loot": "aur203Desert075",
    "materialId": "aur203Desert075Material"
  },
  {
    "id": "desert-species-076",
    "type": "aur203Desert076",
    "region": "desert",
    "names": {
      "en": "Mirage Conch Crawler",
      "ru": "Миражная раковина",
      "es": "Caracola Espejismo"
    },
    "nativeLevel": 48,
    "biome": "sand",
    "family": "crustacean",
    "baseType": "scarab",
    "movementProfile": "crawler",
    "relativeStats": {
      "hp": 1.08,
      "attack": 0.87,
      "defense": 1.45
    },
    "speed": 35,
    "abilityConfig": {
      "abilityPattern": [
        "burrow",
        "haunt"
      ],
      "collisionRadius": 21,
      "range": 235,
      "radius": 90,
      "cooldown": 7900,
      "windup": 950
    },
    "behaviorConfig": {
      "guard": {
        "range": 155,
        "windupMs": 900,
        "durationMs": 1400,
        "damageMultiplier": 0.5
      }
    },
    "loot": "aur203Desert076",
    "materialId": "aur203Desert076Material"
  },
  {
    "id": "desert-species-077",
    "type": "aur203Desert077",
    "region": "desert",
    "names": {
      "en": "Cinder Frill Wyrmling",
      "ru": "Пеплогривый дракончик",
      "es": "Dracón de Ceniza"
    },
    "nativeLevel": 50,
    "biome": "sand",
    "family": "reptile",
    "baseType": "desertSnake",
    "movementProfile": "predator",
    "relativeStats": {
      "hp": 1.05,
      "attack": 1.08,
      "defense": 0.9
    },
    "speed": 115,
    "abilityConfig": {
      "abilityPattern": [
        "pounce",
        "fan"
      ],
      "collisionRadius": 18,
      "range": 250,
      "radius": 60,
      "cooldown": 6760,
      "windup": 675,
      "projectileMagic": false
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.27,
        "distance": 110,
        "durationMs": 1450
      },
      "pack": {
        "radius": 160,
        "maxAllies": 2
      }
    },
    "loot": "aur203Desert077",
    "materialId": "aur203Desert077Material"
  },
  {
    "id": "desert-species-078",
    "type": "aur203Desert078",
    "region": "desert",
    "names": {
      "en": "Dune Drum Guardian",
      "ru": "Дюнный барабанщик",
      "es": "Guardián Tambor"
    },
    "nativeLevel": 51,
    "biome": "sand",
    "family": "construct",
    "baseType": "ancientSentinel",
    "movementProfile": "heavy",
    "relativeStats": {
      "hp": 1.22,
      "attack": 1.02,
      "defense": 1.3
    },
    "speed": 40,
    "abilityConfig": {
      "abilityPattern": [
        "stomp",
        "fan"
      ],
      "collisionRadius": 23,
      "range": 235,
      "radius": 90,
      "cooldown": 7900,
      "windup": 950,
      "projectileMagic": true
    },
    "behaviorConfig": {
      "guard": {
        "range": 175,
        "windupMs": 1050,
        "durationMs": 1700,
        "damageMultiplier": 0.6
      }
    },
    "loot": "aur203Desert078",
    "materialId": "aur203Desert078Material"
  },
  {
    "id": "desert-species-079",
    "type": "aur203Desert079",
    "region": "desert",
    "names": {
      "en": "Ribbonjaw Sand Eel",
      "ru": "Лентопастный пескоугорь",
      "es": "Anguila Cintamandíbula"
    },
    "nativeLevel": 48,
    "biome": "sand",
    "family": "fish",
    "baseType": "desertSnake",
    "movementProfile": "serpent",
    "relativeStats": {
      "hp": 0.94,
      "attack": 1.05,
      "defense": 0.8
    },
    "speed": 101,
    "abilityConfig": {
      "abilityPattern": [
        "burrow",
        "venom"
      ],
      "collisionRadius": 15,
      "range": 250,
      "radius": 60,
      "cooldown": 7120,
      "windup": 825,
      "locomotion": "crawler"
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.32999999999999996,
        "distance": 130,
        "durationMs": 1350
      }
    },
    "loot": "aur203Desert079",
    "materialId": "aur203Desert079Material"
  },
  {
    "id": "desert-species-080",
    "type": "aur203Desert080",
    "region": "desert",
    "names": {
      "ru": "Колодезный глотун",
      "en": "Well-mouth gulper",
      "es": "Engullidor pozo"
    },
    "nativeLevel": 49,
    "biome": "sand",
    "family": "amphibian",
    "baseType": "ancientSentinel",
    "movementProfile": "heavy",
    "relativeStats": {
      "hp": 1.15,
      "attack": 1.02,
      "defense": 1.1
    },
    "speed": 51,
    "abilityConfig": {
      "abilityPattern": [
        "stomp",
        "burrow"
      ],
      "collisionRadius": 22,
      "range": 235,
      "radius": 90,
      "cooldown": 7900,
      "windup": 950,
      "locomotion": "crawler"
    },
    "behaviorConfig": {
      "guard": {
        "range": 155,
        "windupMs": 900,
        "durationMs": 1400,
        "damageMultiplier": 0.5
      }
    },
    "loot": "aur203Desert080",
    "materialId": "aur203Desert080Material"
  },
  {
    "id": "desert-species-081",
    "type": "aur203Desert081",
    "region": "desert",
    "names": {
      "ru": "Солнечный гребнеход",
      "en": "Sun-comb strider",
      "es": "Zancudo peine solar"
    },
    "nativeLevel": 50,
    "biome": "sand",
    "family": "insect",
    "baseType": "desertSnake",
    "movementProfile": "charger",
    "relativeStats": {
      "hp": 1,
      "attack": 1.08,
      "defense": 0.9
    },
    "speed": 110,
    "abilityConfig": {
      "abilityPattern": [
        "charge",
        "fan"
      ],
      "collisionRadius": 19,
      "range": 250,
      "radius": 60,
      "cooldown": 6580,
      "windup": 675,
      "projectileMagic": false
    },
    "behaviorConfig": {
      "pack": {
        "radius": 160,
        "maxAllies": 2
      }
    },
    "loot": "aur203Desert081",
    "materialId": "aur203Desert081Material"
  },
  {
    "id": "desert-species-082",
    "type": "aur203Desert082",
    "region": "desert",
    "names": {
      "ru": "Песчаный гончар",
      "en": "Dune potter",
      "es": "Alfarero de dunas"
    },
    "nativeLevel": 45,
    "biome": "sand",
    "family": "mollusk",
    "baseType": "scarab",
    "movementProfile": "crawler",
    "relativeStats": {
      "hp": 1.16,
      "attack": 0.85,
      "defense": 1.5
    },
    "speed": 29,
    "abilityConfig": {
      "abilityPattern": [
        "venom",
        "roots"
      ],
      "collisionRadius": 20,
      "range": 235,
      "radius": 90,
      "cooldown": 7900,
      "windup": 950
    },
    "behaviorConfig": {
      "guard": {
        "range": 175,
        "windupMs": 1050,
        "durationMs": 1700,
        "damageMultiplier": 0.6
      }
    },
    "loot": "aur203Desert082",
    "materialId": "aur203Desert082Material"
  },
  {
    "id": "desert-species-083",
    "type": "aur203Desert083",
    "region": "desert",
    "names": {
      "ru": "Барханный парусоклюв",
      "en": "Dune sailbill",
      "es": "Pico vela dunar"
    },
    "nativeLevel": 51,
    "biome": "sand",
    "family": "bird",
    "baseType": "desertSnake",
    "movementProfile": "skirmisher",
    "relativeStats": {
      "hp": 0.88,
      "attack": 0.93,
      "defense": 0.75
    },
    "speed": 123,
    "abilityConfig": {
      "abilityPattern": [
        "shot",
        "fan"
      ],
      "collisionRadius": 14,
      "range": 285,
      "radius": 60,
      "cooldown": 6940,
      "windup": 825,
      "preferredDistance": 175,
      "projectileMagic": false
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.32999999999999996,
        "distance": 120,
        "durationMs": 1450
      },
      "pack": {
        "radius": 180,
        "maxAllies": 2
      }
    },
    "loot": "aur203Desert083",
    "materialId": "aur203Desert083Material"
  },
  {
    "id": "desert-species-084",
    "type": "aur203Desert084",
    "region": "desert",
    "names": {
      "ru": "Соляной зонтонос",
      "en": "Salt parasol bearer",
      "es": "Portador de parasol salino"
    },
    "nativeLevel": 50,
    "biome": "sand",
    "family": "mammal",
    "baseType": "scarab",
    "movementProfile": "heavy",
    "relativeStats": {
      "hp": 1.22,
      "attack": 0.9,
      "defense": 1.6
    },
    "speed": 36,
    "abilityConfig": {
      "abilityPattern": [
        "stomp",
        "frost"
      ],
      "collisionRadius": 23,
      "range": 235,
      "radius": 90,
      "cooldown": 7900,
      "windup": 950
    },
    "behaviorConfig": {
      "guard": {
        "range": 155,
        "windupMs": 900,
        "durationMs": 1400,
        "damageMultiplier": 0.5
      }
    },
    "loot": "aur203Desert084",
    "materialId": "aur203Desert084Material"
  },
  {
    "id": "desert-species-085",
    "type": "aur203Desert085",
    "region": "desert",
    "names": {
      "ru": "Термитовый горн",
      "en": "Termite trumpet",
      "es": "Trompeta termitera"
    },
    "nativeLevel": 49,
    "biome": "sand",
    "family": "construct",
    "baseType": "ancientSentinel",
    "movementProfile": "fighter",
    "relativeStats": {
      "hp": 1.03,
      "attack": 1.02,
      "defense": 1.15
    },
    "speed": 59,
    "abilityConfig": {
      "abilityPattern": [
        "cleave",
        "fan"
      ],
      "collisionRadius": 19,
      "range": 235,
      "radius": 90,
      "cooldown": 7900,
      "windup": 950,
      "projectileMagic": true
    },
    "behaviorConfig": {
      "guard": {
        "range": 165,
        "windupMs": 975,
        "durationMs": 1550,
        "damageMultiplier": 0.55
      },
      "pack": {
        "radius": 160,
        "maxAllies": 2
      }
    },
    "loot": "aur203Desert085",
    "materialId": "aur203Desert085Material"
  },
  {
    "id": "desert-species-086",
    "type": "aur203Desert086",
    "region": "desert",
    "names": {
      "ru": "Обсидиановый веретенник",
      "en": "Obsidian spindlewalker",
      "es": "Andarín huso de obsidiana"
    },
    "nativeLevel": 54,
    "biome": "sand",
    "family": "arthropod",
    "baseType": "fallenKnight",
    "movementProfile": "predator",
    "relativeStats": {
      "hp": 0.9,
      "attack": 1.15,
      "defense": 1
    },
    "speed": 116,
    "abilityConfig": {
      "abilityPattern": [
        "pounce",
        "cleave"
      ],
      "collisionRadius": 17,
      "range": 250,
      "radius": 60,
      "cooldown": 6580,
      "windup": 750
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.3,
        "distance": 100,
        "durationMs": 1450
      }
    },
    "loot": "aur203Desert086",
    "materialId": "aur203Desert086Material"
  },
  {
    "id": "desert-species-087",
    "type": "aur203Desert087",
    "region": "desert",
    "names": {
      "ru": "Бронзовый пескокрут",
      "en": "Bronze sand whorl",
      "es": "Remolino de bronce"
    },
    "nativeLevel": 55,
    "biome": "sand",
    "family": "cephalopod",
    "baseType": "voidElemental",
    "movementProfile": "elemental",
    "relativeStats": {
      "hp": 0.96,
      "attack": 1.04,
      "defense": 0.85
    },
    "speed": 81,
    "abilityConfig": {
      "abilityPattern": [
        "blink",
        "fan"
      ],
      "collisionRadius": 18,
      "range": 285,
      "radius": 60,
      "cooldown": 6760,
      "windup": 825,
      "preferredDistance": 175,
      "elevation": 34,
      "projectileMagic": true
    },
    "behaviorConfig": {
      "retreat": {
        "triggerRatio": 0.32999999999999996,
        "distance": 110,
        "durationMs": 1250
      },
      "pack": {
        "radius": 180,
        "maxAllies": 2
      }
    },
    "loot": "aur203Desert087",
    "materialId": "aur203Desert087Material"
  }
]);
if(AUR203_EXPANSION_SPECIES_ROWS.length!==64||Object.keys(AUR203_EXPANSION_SPECIES_ART).length!==64||AUR203_EXPANSION_SPECIES_ROWS.some(row=>!AUR203_EXPANSION_SPECIES_ART[row.id]))throw new Error('Incomplete AUR-203 expansion definitions/art');
