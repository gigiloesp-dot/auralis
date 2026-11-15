import {CAMP_ALIASES,LEGACY_QUEST_TARGETS} from '../world/campAliases.js';
// Keep identity, prerequisites, rewards and saved counters. Only obsolete
// encounter references/coordinates (including embedded camp IDs) are replaced.
export function remapWorldObjectives(quests,regions){return quests.map(original=>{
 const q=structuredClone(original),c=regions[q.region];if(!c)return q;
 const requested=LEGACY_QUEST_TARGETS[q.id];let camp;
 if(q.type==='kill'&&requested)camp=c.camps.find(p=>p.id===requested.campId);
 else if(q.type==='explore'&&CAMP_ALIASES[q.region+':'+q.target]){
  const replacement=CAMP_ALIASES[q.region+':'+q.target],base=c.camps.find(p=>p.id===replacement);
  camp=c.camps.filter(p=>p.type===base?.type).sort((a,b)=>Math.abs(a.level-q.level)-Math.abs(b.level-q.level)||Math.hypot(a.x-q.location.x,a.y-q.location.y)-Math.hypot(b.x-q.location.x,b.y-q.location.y))[0]||base;
 }
 if(!camp)return q;
 const old=q.targetCampId||q.target;if(q.type==='kill'){q.targetSpeciesId=camp.speciesId||camp.plannedSpeciesId;if(!q.targetCampId)return q;q.target=camp.type;q.targetCampId=camp.id;}else q.target=camp.id;
 q.location={...q.location,region:q.region,x:camp.x,y:camp.y};
 if(q.description)for(const lang of ['ru','en','es'])q.description[lang]=q.description[lang].split(old).join(camp.id);
 return q;
});}
