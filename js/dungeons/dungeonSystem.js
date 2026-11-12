import {DUNGEONS,DIFFICULTIES,dungeonDefinition,createDungeonContent} from './dungeonData.js';
import {grantXp} from '../systems/progression.js';
export {DUNGEONS,DIFFICULTIES,dungeonDefinition,createDungeonContent};
export const DUNGEON_RESPAWN_MS=3600000;
export function canEnterDungeon(hero,id,difficulty='easy'){
 const d=dungeonDefinition(id);if(!d||!Object.hasOwn(DIFFICULTIES,difficulty))return {ok:false,reason:'invalid'};
 if(!hero||hero.hp<=0)return {ok:false,reason:'dead'};
 if(hero.dungeonSession)return {ok:false,reason:'inside'};
 if(hero.level<d.level)return {ok:false,reason:'level',requiredLevel:d.level};
 if(hero.region!==d.region||Math.hypot(hero.x-d.x,hero.y-d.y)>160)return {ok:false,reason:'distance'};
 return {ok:true};
}
export function enterDungeon(hero,id,difficulty='easy'){
 const checked=canEnterDungeon(hero,id,difficulty);if(!checked.ok)return checked;
 const d=dungeonDefinition(id),content=createDungeonContent(id,difficulty),returnLocation={region:d.region,x:d.x,y:d.y+80};
 hero.dungeonSession={dungeonId:id,difficulty,returnLocation};hero.returnLocation={...returnLocation};
 return {ok:true,content,destination:{region:content.id,...content.entry}};
}
export function leaveDungeon(hero){
 const session=hero?.dungeonSession,d=dungeonDefinition(session?.dungeonId);if(!d)return {ok:false,reason:'outside'};
 const point=session.returnLocation;const destination=point&&Number.isFinite(point.x)&&Number.isFinite(point.y)&&point.region===d.region?{...point}:{region:d.region,x:d.x,y:d.y+80};
 hero.dungeonSession=null;hero.returnLocation=null;return {ok:true,destination};
}
export function recordDungeonBossKill(hero,id,difficulty,bossId,now=Date.now()){
 const d=dungeonDefinition(id);if(!d||!Object.hasOwn(DIFFICULTIES,difficulty)||!Number.isFinite(now)||now<0)return {ok:false,reason:'invalid'};
 const content=createDungeonContent(id,difficulty);if(!content.bosses.some(b=>b.id===bossId))return {ok:false,reason:'boss'};
 const key=id+':'+difficulty;hero.dungeonProgress??={};const old=hero.dungeonProgress[key];
 const validIds=new Set(content.bosses.map(b=>b.id)),oldKilled=Array.isArray(old?.killed)?[...new Set(old.killed.filter(id=>validIds.has(id)))]:[];
 if(old?.readyAt>now&&oldKilled.includes(bossId))return {ok:false,reason:'cooldown'};
 const inCycle=old&&Number.isFinite(old.readyAt)&&old.readyAt>now,completeBefore=content.bosses.every(b=>oldKilled.includes(b.id)),progress=inCycle?{killed:oldKilled,readyAt:old.readyAt,completed:completeBefore,rewarded:old.rewarded===true&&completeBefore}:{killed:[],readyAt:now+DUNGEON_RESPAWN_MS,completed:false,rewarded:false};
 if(progress.killed.includes(bossId))return {ok:false,reason:'duplicate'};
 progress.killed.push(bossId);progress.completed=content.bosses.every(b=>progress.killed.includes(b.id));
 hero.worldState??={monsters:{}};hero.worldState.monsters??={};hero.worldState.monsters[content.id+':'+bossId]={deadUntil:now+DUNGEON_RESPAWN_MS,killedAt:now,hp:0};
 let rewarded=false;
 if(progress.completed&&!progress.rewarded){const multiplier=DIFFICULTIES[difficulty].multiplier;hero.gold=(hero.gold||0)+Math.round((80+d.level*12)*multiplier);grantXp(hero,Math.round((120+d.level*22)*multiplier));progress.rewarded=true;progress.completedAt=now;rewarded=true;}
 hero.dungeonProgress[key]=progress;return {ok:true,completed:progress.completed,rewarded,readyAt:progress.readyAt};
}
export function dungeonContentForHero(hero){
 const session=hero?.dungeonSession;if(!session)return null;
 try{const content=createDungeonContent(session.dungeonId,session.difficulty);return hero.region===content.id?content:null;}catch{return null;}
}
