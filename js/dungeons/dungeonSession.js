import {createDungeonContent} from './dungeonData.js';

// This finite timestamp survives the existing v2 save normalizer. The visit's
// killed-ID ledger, rather than elapsed wall time, is authoritative for minions.
export const DUNGEON_VISIT_DEAD_UNTIL=8640000000000000;
const prepared=new WeakMap();
let sequence=0;
const validTime=value=>Number.isFinite(value)&&value>=0&&value<=DUNGEON_VISIT_DEAD_UNTIL;
const validVisitId=value=>typeof value==='string'&&value.length>0&&value.length<=160;
const uniqueIds=(value,valid)=>Array.isArray(value)?[...new Set(value.filter(id=>valid.has(id)))]:[];
export function newDungeonVisit(content,returnLocation){
 return {dungeonId:content.dungeonId,difficulty:content.difficulty,returnLocation,
  visitId:'visit-'+Date.now().toString(36)+'-'+(++sequence).toString(36)+'-'+Math.random().toString(36).slice(2,10),
  killedMinions:[],killedBosses:[],completionBosses:[],completed:false};
}
export function ensureDungeonVisit(hero,content){
 const session=hero?.dungeonSession;
 if(!content?.dungeon||!session||session.dungeonId!==content.dungeonId||session.difficulty!==content.difficulty)return null;
 if(prepared.get(session)?.contentId===content.id)return session;
 const minions=new Set(content.camps.flatMap(c=>c.spawns.map(s=>s.id))),bosses=new Set(content.bosses.map(b=>b.id)),legacy=!validVisitId(session.visitId);
 if(legacy)session.visitId=newDungeonVisit(content,session.returnLocation).visitId;
 session.killedMinions=uniqueIds(session.killedMinions,minions);
 session.killedBosses=uniqueIds(session.killedBosses,bosses);
 session.completionBosses=uniqueIds(session.completionBosses,bosses);
 // Release 5 sessions have no visit ledger. Preserve any recorded deaths even
 // when their old five-minute timestamp has elapsed, before streaming spawns.
 if(legacy)for(const id of minions){
  const saved=hero.worldState?.monsters?.[content.id+':'+id];
  if(validTime(saved?.killedAt)&&!session.killedMinions.includes(id))session.killedMinions.push(id);
 }
 session.completed=bosses.size>0&&[...bosses].every(id=>session.killedBosses.includes(id)||session.completionBosses.includes(id));
 prepared.set(session,{contentId:content.id,minions,bosses});
 return session;
}
export function clearDungeonMinionStates(hero,content){
 if(!hero?.worldState?.monsters)return;
 for(const camp of content.camps)for(const descriptor of camp.spawns)delete hero.worldState.monsters[content.id+':'+descriptor.id];
}
export function recordDungeonMinionKill(hero,content,id,now=Date.now()){
 const session=ensureDungeonVisit(hero,content);
 if(!session||!validTime(now)||!prepared.get(session).minions.has(id))return {ok:false,reason:'invalid'};
 const duplicate=session.killedMinions.includes(id);if(!duplicate)session.killedMinions.push(id);
 hero.worldState??={monsters:{}};hero.worldState.monsters??={};
 const key=content.id+':'+id,previous=hero.worldState.monsters[key];
 hero.worldState.monsters[key]={deadUntil:DUNGEON_VISIT_DEAD_UNTIL,killedAt:duplicate&&validTime(previous?.killedAt)?previous.killedAt:now,hp:0};
 return {ok:true,duplicate};
}
export function dungeonBossReadyAt(hero,content,id,{deathRecordedAt}={}){
 const progress=hero?.dungeonProgress?.[content.dungeonId+':'+content.difficulty],saved=hero?.worldState?.monsters?.[content.id+':'+id];
 const perBoss=progress?.bossReadyAt?.[id];
 const legacy=Array.isArray(progress?.killed)&&progress.killed.includes(id)&&!validTime(perBoss)?progress.readyAt:0;
 // MonsterSystem writes the just-killed body's death before its completion
 // callback. Only the callback's exact death event can discount that new world
 // record; an existing progress timer is never discounted.
 const currentDeath=validTime(deathRecordedAt)&&saved?.killedAt===deathRecordedAt&&saved?.deadUntil===deathRecordedAt+3600000;
 return Math.max(!currentDeath&&validTime(saved?.deadUntil)?saved.deadUntil:0,validTime(perBoss)?perBoss:0,validTime(legacy)?legacy:0);
}
export function dungeonMonsterState(hero,content,descriptor,now=Date.now()){
 const key=(content?.id||'legacy')+':'+descriptor.id,saved=hero?.worldState?.monsters?.[key];
 if(!content?.dungeon)return saved;
 const session=ensureDungeonVisit(hero,content);
 if(!session)return saved;
 const cache=prepared.get(session);
 if(cache.minions.has(descriptor.id)&&session.killedMinions.includes(descriptor.id))return {...saved,hp:0,deadUntil:DUNGEON_VISIT_DEAD_UNTIL,visitKilled:true};
 if(cache.bosses.has(descriptor.id)){
  const deadUntil=dungeonBossReadyAt(hero,content,descriptor.id);
  if(deadUntil>now)return {...saved,hp:0,deadUntil};
 }
 return saved;
}
export function recordDungeonVisitBossKill(hero,content,id,{completionBosses}={}){
 const session=ensureDungeonVisit(hero,content);if(!session||!prepared.get(session).bosses.has(id))return null;
 if(!session.killedBosses.includes(id))session.killedBosses.push(id);
 // Completion may be finished in a later visit while earlier bosses retain
 // their hour cooldown. Credit that successful completion event to this visit,
 // without copying old completion just because a player re-entered.
 const valid=prepared.get(session).bosses,credited=uniqueIds(completionBosses,valid);
 if(credited.includes(id)&&[...valid].every(bossId=>credited.includes(bossId)))session.completionBosses=credited;
 session.completed=content.bosses.every(b=>session.killedBosses.includes(b.id)||session.completionBosses.includes(b.id));return session;
}
export function dungeonExitPortalState(hero,content){
 const session=ensureDungeonVisit(hero,content);
 if(!session?.completed||hero.region!==content.id)return null;
 const room=content.rooms.at(-1);
 return {id:'dungeon-completion-'+session.visitId,visitId:session.visitId,x:room.x+100,y:room.y+room.height/2,radius:110};
}
export function restoredDungeonContent(hero){
 const session=hero?.dungeonSession;if(!session)return null;
 try{const content=createDungeonContent(session.dungeonId,session.difficulty);if(hero.region!==content.id)return null;ensureDungeonVisit(hero,content);return content;}catch{return null;}
}
