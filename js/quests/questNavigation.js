// Read-only navigation queries plus explicit, reversible tracking selection.
// World-space objectives are for the in-world quest arrow, never map markers.
import {QUESTS,questDefinition,questProgress,questTitle} from './quests.js';
import {NPCS} from '../npc/npcData.js';
import {getRegionContent} from '../world/regionContent.js';
import {NPC_TRAVEL_LINKS} from '../world/npcTravelData.js';
import {DUNGEONS,createDungeonContent} from '../dungeons/dungeonData.js';
import {projectSurface} from '../world/surface.js';
import {GATHERING_NODES} from '../world/gatheringData.js';
import {QUEST_MATERIALS} from '../equipment/questMaterials.js';
import {gatheringReadyAt} from '../systems/gathering.js';

const REGIONS=['forest','north','ancient','desert'],META='__trackingV1';
const finite=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const name=(p,l)=>p?.names?.[l]||p?.names?.ru||p?.name||'';
const active=(hero,q)=>q&&['active','completed'].includes(questProgress(hero,q.id)?.state);
export const QUEST_NAV_TEXT=Object.freeze({
 ru:{wait:'Следующее растение через',kill:'Победить',boss:'Победить босса',talk:'Поговорить',deliver:'Доставить припасы',collect:'Собрать припасы',explore:'Исследовать',dungeon:'Пройти подземелье',returnTo:'Получить награду у',travel:'Переход в',exit:'Выйти из подземелья',arrived:'Цель рядом',track:'Отслеживать',tracked:'Отслеживается',untrack:'Снять отслеживание',storage:'Не удалось сохранить выбор задания'},
 en:{wait:'Next plant in',kill:'Defeat',boss:'Defeat the boss',talk:'Speak with',deliver:'Deliver supplies',collect:'Gather supplies',explore:'Explore',dungeon:'Clear the dungeon',returnTo:'Claim reward from',travel:'Travel to',exit:'Leave the dungeon',arrived:'Objective nearby',track:'Track',tracked:'Tracked',untrack:'Stop tracking',storage:'Could not save quest selection'},
 es:{wait:'La próxima planta en',kill:'Derrotar',boss:'Derrotar al jefe',talk:'Hablar con',deliver:'Entregar provisiones',collect:'Reunir provisiones',explore:'Explorar',dungeon:'Completar la mazmorra',returnTo:'Recibir recompensa de',travel:'Viajar a',exit:'Salir de la mazmorra',arrived:'Objetivo cercano',track:'Seguir',tracked:'En seguimiento',untrack:'Dejar de seguir',storage:'No se pudo guardar el seguimiento'}
});
export function trackedQuest(hero){
 if(!hero||typeof hero!=='object')return null;
 if(hero?.quests?.[META]?.disabled===true)return null;
 const selected=questDefinition(hero?.quests?.[META]?.id);
 return active(hero,selected)?selected:QUESTS.find(q=>active(hero,q))||null;
}
// Explicit selection persists inside the existing quest dictionary. A rejected
// durable save restores the previous metadata and does not mutate quest state.
function writeTracking(hero,id,disabled,persist){
 const hadQuests=!!hero.quests,quests=hero.quests||(hero.quests={}),had=Object.hasOwn(quests,META),before=quests[META];
 quests[META]={version:1,id,disabled};
 try{if(persist&&persist()===false)throw Error('storage');return {ok:true,id};}
 catch{if(had)quests[META]=before;else delete quests[META];if(!hadQuests)delete hero.quests;return {ok:false,reason:'storage'};}
}
export function setTrackedQuest(hero,id,{persist}={}){
 if(!hero||typeof hero!=='object')return {ok:false,reason:'state'};
 const q=id===null?null:questDefinition(id);if(id!==null&&!active(hero,q))return {ok:false,reason:'state'};
 return writeTracking(hero,q?.id||null,id===null,persist);
}
export function synchronizeTrackedQuest(hero,{persist}={}){
 if(!hero||typeof hero!=='object')return {ok:false,reason:'state',changed:false};
 const q=trackedQuest(hero),id=q?.id||null;
 // The implicit first active quest is a view, not a save migration. New and
 // untouched legacy characters receive no metadata until an explicit choice.
 if(!Object.hasOwn(hero.quests||{},META))return {ok:true,id,changed:false,implicit:true};
 if(hero.quests?.[META]?.version===1&&hero.quests[META].id===id)return {ok:true,id,changed:false};
 const result=writeTracking(hero,id,hero.quests?.[META]?.disabled===true,persist);return {...result,changed:result.ok};
}
function contentForHero(hero,content){
 if(content)return content;
 if(REGIONS.includes(hero.region))return getRegionContent(hero.region);
 const s=hero.dungeonSession;if(s?.dungeonId&&DUNGEONS.some(d=>d.id===s.dungeonId))return createDungeonContent(s.dungeonId,s.difficulty||'easy');
 return null;
}
const point=(p,region,kind,radius=100)=>finite(p)?{id:p.id||null,x:p.x,y:p.y,region:p.region&&REGIONS.includes(p.region)?p.region:region,kind,radius:p.radius||radius,names:p.names||null}:null;
function matchingCamp(q){
 for(const region of REGIONS)for(const c of getRegionContent(region).camps)if(q.targetSpeciesId?c.speciesId===q.targetSpeciesId:q.targetCampId?c.id===q.targetCampId:c.type===q.target||q.target==='wolf'&&c.type==='forestWolf')return {c,region};
 return null;
}
export function resolveQuestObjective(hero,quest,{content,liveMonsters=[],now=Date.now()}={}){
 if(!hero||typeof hero!=='object')return null;
 const q=typeof quest==='string'?questDefinition(quest):quest;if(!q||!active(hero,q))return null;
 const progress=questProgress(hero,q.id),c=contentForHero(hero,content),ready=progress.state==='completed';
 if(ready){const n=NPCS.find(n=>n.id===(q.turnInNpcId||q.npcId));return point(n,n?.region,'npc',140);}
 if(q.type==='talk'||q.type==='deliver'){const n=NPCS.find(n=>n.id===(q.target||q.turnInNpcId));if(n)return point(n,n.region,'npc',140);}
 if(q.type==='dungeon'){
  const d=DUNGEONS.find(d=>d.id===q.target);if(!d)return null;
  if(c?.dungeon&&c.dungeonId===d.id){
   const defeated=new Set([...(hero.dungeonSession?.killedBosses||[]),...(hero.dungeonSession?.completionBosses||[])]),remaining=(c.bosses||[]).filter(b=>!defeated.has(b.id));
   const target=remaining.map(b=>liveMonsters.find(m=>m.id===b.id&&m.alive&&m.hp>0)||b).sort((a,b)=>distance(hero,a)-distance(hero,b))[0];
   return target?{...point(target,c.id,'dungeonBoss',110),region:c.id}:finite(c.exit)?{...point(c.exit,c.id,'dungeonExit',90),region:c.id}:null;
  }
  return point(d,d.region,'dungeon',130);
 }
 if(q.type==='boss'){
  const local=c?.dungeon&&(c.bosses||[]).find(b=>b.id===q.target);if(local)return {...point(local,c.id,'dungeonBoss',110),region:c.id};
  for(const id of REGIONS){const b=getRegionContent(id).bosses.find(b=>b.id===q.target);if(b)return point(b,id,'boss',110);}
 }
 if(q.type==='kill'){
  const matched=matchingCamp(q);if(matched){const local=liveMonsters.filter(m=>m.alive&&m.hp>0&&(m.kind?.speciesId||m.speciesId)===matched.c.speciesId&&hero.region===matched.region).sort((a,b)=>distance(hero,a)-distance(hero,b))[0];return point(local||matched.c,matched.region,local?'monster':'hunt',85);}
 }
 if(q.type==='collect'&&Object.hasOwn(QUEST_MATERIALS,q.itemId)){
  // A collected node remains unavailable across chunk reloads and saves. Lead
  // to another real plant, not the now-empty first authored quest location.
  const nodes=GATHERING_NODES.filter(n=>n.materialId===q.itemId).map(node=>({node,readyAt:gatheringReadyAt(hero,node.id)}));
  const available=nodes.filter(n=>n.readyAt<=now),pool=available.length?available:nodes;
  pool.sort((a,b)=>(available.length?0:a.readyAt-b.readyAt)||distance(hero,a.node)-distance(hero,b.node)||a.node.id.localeCompare(b.node.id));
  const next=pool[0];if(next)return {...point({...next.node,names:QUEST_MATERIALS[q.itemId].names},next.node.region,'collect',85),waitingUntil:next.readyAt>now?next.readyAt:null};
 }
 if(finite(q.location))return point(q.location,q.location.region||q.region,q.type,q.location.radius||130);
 return null;
}
function candidates(region){
 const c=getRegionContent(region),portals=(c.portals||[]).filter(p=>REGIONS.includes(p.toRegion)).map(p=>({...p,region,kind:'portal',nextRegion:p.toRegion}));
 for(const n of NPCS.filter(n=>n.region===region&&(n.roles||[n.role]).includes('teleporter')))for(const target of NPC_TRAVEL_LINKS[region]||[])portals.push({...n,region,kind:'teleporter',nextRegion:target});
 return portals;
}
export function regionRoute(from,to){
 if(!REGIONS.includes(from)||!REGIONS.includes(to))return null;const queue=[[from]],seen=new Set([from]);
 for(let i=0;i<queue.length;i++){const path=queue[i],last=path.at(-1);if(last===to)return path;for(const p of candidates(last)){if(seen.has(p.nextRegion))continue;seen.add(p.nextRegion);queue.push([...path,p.nextRegion]);}}
 return null;
}
export function questNavigation(hero,{content,language='ru',liveMonsters=[],now=Date.now()}={}){
 const q=trackedQuest(hero);if(!q||!finite(hero))return null;const c=contentForHero(hero,content),objective=resolveQuestObjective(hero,q,{content:c,liveMonsters,now});if(!objective||!c)return null;
 const t=QUEST_NAV_TEXT[language]||QUEST_NAV_TEXT.ru,p=questProgress(hero,q.id),ready=p.state==='completed';let waypoint=objective,routeRegions=[hero.region],routeText='';
 if(c.dungeon&&objective.region!==c.id){if(!finite(c.exit))return null;waypoint={...point(c.exit,c.id,'dungeonExit',90),region:c.id};routeRegions=[c.id,c.region,objective.region].filter((x,i,a)=>i===0||x!==a[i-1]);routeText=t.exit;}
 else if(objective.region!==hero.region){
  const route=regionRoute(hero.region,objective.region);if(!route)return null;const options=candidates(hero.region).filter(candidate=>{const rest=regionRoute(candidate.nextRegion,objective.region);return rest&&rest.length===route.length-1;}).sort((a,b)=>distance(hero,a)-distance(hero,b)||a.id.localeCompare(b.id));
  const chosen=options[0];if(!chosen)return null;waypoint={...point(chosen,hero.region,chosen.kind,140),nextRegion:chosen.nextRegion};routeRegions=[hero.region,...regionRoute(chosen.nextRegion,objective.region)];routeText=t.travel+' '+name(getRegionContent(chosen.nextRegion),language);
 }
 const a=projectSurface(hero.x,hero.y,c),b=projectSurface(waypoint.x,waypoint.y,c),worldDistance=distance(hero,waypoint),arrived=waypoint===objective&&worldDistance<=objective.radius&&!objective.waitingUntil;
 const targetName=name(objective,language)||questTitle(q,language),objectiveText=objective.waitingUntil?t.wait+' '+Math.ceil((objective.waitingUntil-now)/1000)+'s · '+targetName:(ready?t.returnTo:t[q.type]||t.explore)+' '+targetName;
 return {questId:q.id,title:questTitle(q,language),objectiveText,progress:p.progress,required:p.required,ready,objective,waypoint,routeRegions,routeText,worldDistance,arrived,waypointArrived:worldDistance<=waypoint.radius,angle:Math.atan2(b.y-a.y,b.x-a.x),arrivalText:arrived?t.arrived:''};
}
