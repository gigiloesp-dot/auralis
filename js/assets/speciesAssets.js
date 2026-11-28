import {TASK10_LAYOUT} from '../world/task10Layout.js';
import {MONSTER_ART} from './monsterArt.js';
import {ACTOR_ART} from './actorArt.js';
import {INTEGRATED_SPECIES_ART as TASK10_MONSTER_ART} from './speciesArtRegistry.js';
// A legacy unique model may certify ONE spot only. Other spots displaying the
// same fallback are explicitly prototypes, never additional finished species.
const bySpecies=new Map(),seen=new Set();
for(const content of Object.values(TASK10_LAYOUT))for(const camp of content.camps){
 const id=camp.plannedSpeciesId,produced=TASK10_MONSTER_ART[id];
 if(produced){bySpecies.set(id,produced);continue;}
 if(seen.has(camp.type))continue;
 const art=camp.type==='forestWolf'?ACTOR_ART.forestWolf:MONSTER_ART[camp.type];
 if(art){seen.add(camp.type);bySpecies.set(id,art);}
}
export const uniqueSpeciesArt=id=>bySpecies.get(id)||null;
export const uniqueSpeciesEntries=()=>[...bySpecies.entries()];
