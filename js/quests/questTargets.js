import {QUESTS,questProgress,questTitle} from './quests.js';
import {NPCS} from '../npc/npcData.js';
// Resolve active objectives and completed hand-ins to real positions, including
// the resource trips back to the forest made by later-region collection quests.
export function questMapTargets(hero,content,language='ru'){
 const targets=[];
 for(const q of QUESTS){
  const progress=questProgress(hero,q.id);if(!['active','completed'].includes(progress.state))continue;
  const ready=progress.state==='completed';
  let position=ready?NPCS.find(n=>n.id===(q.turnInNpcId||q.npcId)):q.location;
  if(!position&&!ready)position=NPCS.find(n=>n.id===q.target);
  if(!position&&!ready&&q.type==='kill')position=(content.camps||[]).find(c=>c.id===q.targetCampId||!q.targetCampId&&(c.type===q.target||q.target==='wolf'&&c.type==='forestWolf'));
  if(!position||position.region!==content.id)continue;
  targets.push({id:q.id,x:position.x,y:position.y,region:position.region,name:questTitle(q,language),ready,progress:progress.progress,required:progress.required});
 }
 return targets;
}
