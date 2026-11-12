import {ACTOR_ART} from './actorArt.js';
// Every entry has its own produced anatomy/painted animation, not a tint of a
// common model. Bosses keep their separate rig until a unique boss atlas exists.
const produced={wildBoar:.42,bear:.65,spider:.43,forestBat:.55,skeleton:.43,frostGolem:.48,arcaneWisp:.37,forestRaider:.43};
const baselines={wildBoar:{idle:216,'run-a':204,'run-b':202,attack:198},bear:{idle:202,'run-a':195,'run-b':192,attack:184},spider:{idle:196,'run-a':195,'run-b':195,attack:196},forestBat:{idle:177,'run-a':171,'run-b':160,attack:148},skeleton:{idle:228,'run-a':208,'run-b':205,attack:203},frostGolem:{idle:228,'run-a':224,'run-b':219,attack:202},arcaneWisp:{idle:223,'run-a':212,'run-b':210,attack:214},forestRaider:{idle:239,'run-a':226,'run-b':218,attack:211}};
export const MONSTER_ART=Object.freeze(Object.fromEntries(Object.entries(produced).map(([id,scale])=>[id,{key:'actor-monster-'+id,url:'assets/actors/monsters/'+id+'.png',atlasURL:'assets/actors/monsters/'+id+'.json',scale,annotationHeight:({wildBoar:130,bear:107,spider:109,forestBat:66,skeleton:162,frostGolem:197,arcaneWisp:179,forestRaider:188}[id]*scale)+8,baselines:baselines[id]||{idle:225,'run-a':225,'run-b':225,attack:225}}])));
export function monsterArt(type,kind){return kind?.boss?null:type==='forestWolf'?ACTOR_ART.forestWolf:MONSTER_ART[type]||null;}
