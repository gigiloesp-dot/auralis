import {TASK10_MONSTER_ART} from './task10MonsterArt.js';
import {TASK10_NEXT_SPECIES_ART} from './task10NextSpeciesArt.js';
import {NEXT_BESTIARY_ART} from './nextBestiaryArt.js';
import {FURTHER_BESTIARY_ART} from './furtherBestiaryArt.js';
import {WILD_BESTIARY_ART} from './wildBestiaryArt.js';
import {DESERT_EXPANSION_ART} from './desertExpansionArt.js';
import {FOREST_EXPANSION_ART} from './forestExpansionArt.js';
import {ANCIENT_EXPANSION_ART} from './ancientExpansionArt.js';
import {NORTH_EXPANSION_ART} from './northExpansionArt.js';
// Only completed, registered sheets enter the live streamed resolver.
export const INTEGRATED_SPECIES_ART=Object.freeze({...TASK10_MONSTER_ART,...TASK10_NEXT_SPECIES_ART,...NEXT_BESTIARY_ART,...FURTHER_BESTIARY_ART,...WILD_BESTIARY_ART,...DESERT_EXPANSION_ART,...FOREST_EXPANSION_ART,...ANCIENT_EXPANSION_ART,...NORTH_EXPANSION_ART});
export const integratedSpeciesArt=id=>INTEGRATED_SPECIES_ART[id]||null;
