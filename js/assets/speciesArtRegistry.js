import {TASK10_MONSTER_ART} from './task10MonsterArt.js';
import {TASK10_NEXT_SPECIES_ART} from './task10NextSpeciesArt.js';
// Only completed, registered sheets enter the live streamed resolver.
export const INTEGRATED_SPECIES_ART=Object.freeze({...TASK10_MONSTER_ART,...TASK10_NEXT_SPECIES_ART});
export const integratedSpeciesArt=id=>INTEGRATED_SPECIES_ART[id]||null;
