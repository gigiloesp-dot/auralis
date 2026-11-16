import {NPCS} from '../npc/npcData.js';
import {NPC_TRAVEL_LINKS,NPC_TRAVEL_RECEIVERS} from './npcTravelData.js';
import {getRegionContent} from './regionContent.js';
import {worldWalkable} from './chunkGeometry.js';
import {DUNGEONS} from '../dungeons/dungeonData.js';
const teleporter=n=>n&&(n.roles||[n.role]).includes('teleporter');
export function npcTravelOptions(hero,npc){
 if(!teleporter(npc)||!hero||hero.region!==npc.region||!(hero.hp>0)||hero.dungeonSession||hero.region==='arena')return [];
 return NPC_TRAVEL_RECEIVERS.filter(r=>r.region===npc.region?!r.home:r.home&&NPC_TRAVEL_LINKS[npc.region]?.includes(r.region));
}
export function npcTravelDestination(hero,npcId,receiverId){
 const npc=NPCS.find(n=>n.id===npcId);
 if(!teleporter(npc)||!hero||!Number.isFinite(hero.x)||!Number.isFinite(hero.y)||Math.hypot(hero.x-npc.x,hero.y-npc.y)>150)return {ok:false,reason:'invalid'};
 const receiver=npcTravelOptions(hero,npc).find(r=>r.id===receiverId);if(!receiver)return {ok:false,reason:'invalid'};
 const content={...getRegionContent(receiver.region),dungeons:DUNGEONS.filter(d=>d.region===receiver.region)};
 if(!worldWalkable(content,receiver.x,receiver.y,18))return {ok:false,reason:'blocked'};
 return {ok:true,receiver,destination:{region:receiver.region,x:receiver.x,y:receiver.y}};
}
// Save before switching scenes. A rejected durable checkpoint leaves all three
// position fields intact and does not unload the current world.
export function commitNpcTravel(hero,npcId,receiverId,persist){
 const result=npcTravelDestination(hero,npcId,receiverId);if(!result.ok)return result;
 const before={region:hero.region,x:hero.x,y:hero.y};Object.assign(hero,result.destination);
 try{if(persist()!==false)return result;}catch{}
 Object.assign(hero,before);return {ok:false,reason:'storage'};
}
