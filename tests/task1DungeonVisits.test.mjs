import test from 'node:test';
import assert from 'node:assert/strict';
import {createCharacter} from '../js/characters/Character.js';
import {Save} from '../js/systems/save.js';
import {DUNGEONS,DIFFICULTIES,createDungeonContent,enterDungeon,leaveDungeon,recordDungeonBossKill,DUNGEON_RESPAWN_MS} from '../js/dungeons/dungeonSystem.js';
import {ensureDungeonVisit,recordDungeonMinionKill,dungeonMonsterState,dungeonExitPortalState,DUNGEON_VISIT_DEAD_UNTIL,dungeonBossReadyAt} from '../js/dungeons/dungeonSession.js';
import {dungeonFloorContains} from '../js/world/chunkGeometry.js';
import {DungeonExitPortal} from '../js/dungeons/DungeonExitPortal.js';

const restore=hero=>createCharacter(Save.normalize(JSON.parse(JSON.stringify(hero))));
const heroAt=d=>createCharacter({classId:'warrior',level:42,region:d.region,x:d.x,y:d.y});
const enter=(hero,d,difficulty)=>{const result=enterDungeon(hero,d.id,difficulty);assert.equal(result.ok,true);Object.assign(hero,result.destination);return result.content;};

test('all 36 dungeon visits preserve ordinary deaths through time, streamed reconstruction and save migration; only re-entry resets them',()=>{
 for(const d of DUNGEONS)for(const difficulty of Object.keys(DIFFICULTIES)){
  const hero=heroAt(d),content=enter(hero,d,difficulty),minion=content.camps[0].spawns[0],now=100000;
  const visitId=hero.dungeonSession.visitId;
  assert.equal(recordDungeonMinionKill(hero,content,minion.id,now).ok,true);
  assert.equal(recordDungeonMinionKill(hero,content,minion.id,now+1).duplicate,true);
  assert.equal(hero.worldState.monsters[content.id+':'+minion.id].killedAt,now);
  for(const wall of [now,now+300001,now+86400000]){
   const state=dungeonMonsterState(hero,createDungeonContent(d.id,difficulty),minion,wall);
   assert.equal(state.visitKilled,true);assert.equal(state.hp,0);assert.equal(state.deadUntil,DUNGEON_VISIT_DEAD_UNTIL);
  }
  const reloaded=restore(hero),loadedContent=createDungeonContent(d.id,difficulty);
  assert.equal(reloaded.dungeonSession.visitId,visitId);
  assert.equal(dungeonMonsterState(reloaded,loadedContent,minion,now+86400000).visitKilled,true);
  // The session ledger remains authoritative even if a streamed descriptor has
  // no retained runtime object or its redundant world-state record is absent.
  delete reloaded.worldState.monsters[content.id+':'+minion.id];
  assert.equal(dungeonMonsterState(reloaded,loadedContent,minion,now+86400000).visitKilled,true);
  const result=leaveDungeon(reloaded);assert.equal(result.ok,true);Object.assign(reloaded,result.destination);
  const fresh=enter(reloaded,d,difficulty);assert.notEqual(reloaded.dungeonSession.visitId,visitId);
  assert.deepEqual(reloaded.dungeonSession.killedMinions,[]);assert.equal(dungeonMonsterState(reloaded,fresh,minion,now+86400000),undefined);
 }
});

test('all 36 completions create a voluntary portal only for the completed visit and preserve exact independent boss timers on re-entry',()=>{
 for(const d of DUNGEONS)for(const difficulty of Object.keys(DIFFICULTIES)){
  let hero=heroAt(d);const content=enter(hero,d,difficulty),now=1000000,position={x:hero.x,y:hero.y};
  assert.equal(dungeonExitPortalState(hero,content),null);
  for(const [index,boss]of content.bosses.entries()){
   const deathAt=now+index*1000;
   // This is the actual runtime order: body death is stored, then completion
   // is notified. Discount only that exact death, never an older cooldown.
   hero.worldState.monsters[content.id+':'+boss.id]={killedAt:deathAt,deadUntil:deathAt+DUNGEON_RESPAWN_MS,hp:0};
   const result=recordDungeonBossKill(hero,d.id,difficulty,boss.id,deathAt,{deathRecordedAt:deathAt});
   assert.equal(result.ok,true);assert.equal(result.visitCompleted,index===content.bosses.length-1);
   if(index<content.bosses.length-1)assert.equal(dungeonExitPortalState(hero,content),null);
  }
  assert.deepEqual({x:hero.x,y:hero.y},position,'boss completion never teleports automatically');
  const portal=dungeonExitPortalState(hero,content),gold=hero.gold;
  assert.ok(portal);assert.equal(dungeonFloorContains(content,portal.x,portal.y,18),true);
  const repeated=dungeonExitPortalState(hero,content);assert.deepEqual(repeated,portal);assert.equal(hero.gold,gold);
  hero=restore(hero);assert.deepEqual(dungeonExitPortalState(hero,content),portal);
  const blocked=recordDungeonBossKill(hero,d.id,difficulty,content.bosses[0].id,now+10,{deathRecordedAt:now+10});
  assert.equal(blocked.reason,'cooldown');assert.equal(hero.gold,gold);
  const exit=leaveDungeon(hero);Object.assign(hero,exit.destination);
  assert.deepEqual(exit.destination,{region:d.region,x:d.x,y:d.y+80});
  const next=enter(hero,d,difficulty);assert.equal(dungeonExitPortalState(hero,next),null);
  for(const [index,boss]of next.bosses.entries())assert.equal(dungeonMonsterState(hero,next,boss,now+20000).deadUntil,now+index*1000+DUNGEON_RESPAWN_MS);
  assert.equal(hero.gold,gold,'re-entry and portal queries never repeat completion rewards');
 }
});

test('boss-specific hour cooldown survives the earlier shared timer expiring and remains separate from other difficulties',()=>{
 const d=DUNGEONS.at(-1),hero=heroAt(d),content=enter(hero,d,'easy'),now=100000;
 const [first,second]=content.bosses;
 assert.equal(recordDungeonBossKill(hero,d.id,'easy',first.id,now).ok,true);
 assert.equal(recordDungeonBossKill(hero,d.id,'easy',second.id,now+500000).ok,true);
 const restored=restore(hero),firstExpiry=now+DUNGEON_RESPAWN_MS;
 assert.equal(dungeonBossReadyAt(restored,content,second.id),now+500000+DUNGEON_RESPAWN_MS);
 assert.equal(recordDungeonBossKill(restored,d.id,'easy',first.id,firstExpiry).ok,true);
 assert.equal(recordDungeonBossKill(restored,d.id,'easy',second.id,firstExpiry+1).reason,'cooldown');
 assert.equal(recordDungeonBossKill(restored,d.id,'hard',second.id,firstExpiry+1).ok,true);
 assert.equal(recordDungeonBossKill(restored,d.id,'easy',second.id,now+500000+DUNGEON_RESPAWN_MS).ok,true);
});

test('finishing a partial multi-boss cycle in a later visit opens its portal, while another fresh visit does not inherit it',()=>{
 for(const d of DUNGEONS.filter(d=>d.bossCount>1))for(const difficulty of Object.keys(DIFFICULTIES)){
  let hero=heroAt(d);const first=enter(hero,d,difficulty),now=100000;
  assert.equal(recordDungeonBossKill(hero,d.id,difficulty,first.bosses[0].id,now).completed,false);
  const firstExit=leaveDungeon(hero);Object.assign(hero,firstExit.destination);
  const content=enter(hero,d,difficulty);assert.equal(dungeonExitPortalState(hero,content),null);
  assert.equal(dungeonMonsterState(hero,content,content.bosses[0],now+1).deadUntil,now+DUNGEON_RESPAWN_MS);
  let result;for(const boss of content.bosses.slice(1))result=recordDungeonBossKill(hero,d.id,difficulty,boss.id,now+1);
  assert.equal(result.completed,true);assert.equal(result.visitCompleted,true);
  assert.equal(hero.dungeonSession.killedBosses.length,d.bossCount-1,'actual visit deaths are not fabricated');
  assert.equal(hero.dungeonSession.completionBosses.length,d.bossCount,'current completion credits all already-cleared bosses');
  const portal=dungeonExitPortalState(hero,content),gold=hero.gold;assert.ok(portal);
  hero=restore(hero);assert.deepEqual(dungeonExitPortalState(hero,content),portal);assert.equal(hero.gold,gold);
  const secondExit=leaveDungeon(hero);Object.assign(hero,secondExit.destination);const fresh=enter(hero,d,difficulty);
  assert.equal(dungeonExitPortalState(hero,fresh),null);assert.deepEqual(hero.dungeonSession.completionBosses,[]);assert.equal(hero.gold,gold);
 }
});

test('release 5 sessions migrate minion deaths, while historical completion never invents a newly completed visit',()=>{
 const d=DUNGEONS[0],content=createDungeonContent(d.id,'easy'),minion=content.camps[0].spawns[0],boss=content.bosses[0];
 const hero=createCharacter({level:42,region:content.id,x:content.entry.x,y:content.entry.y,dungeonSession:{dungeonId:d.id,difficulty:'easy',returnLocation:{region:d.region,x:d.x,y:d.y+80}},dungeonProgress:{'dungeon1:easy':{completed:true,rewarded:true,killed:[boss.id],readyAt:999999}},worldState:{monsters:{[content.id+':'+minion.id]:{killedAt:100,deadUntil:300100},[content.id+':'+boss.id]:{killedAt:100,deadUntil:3600100}}}});
 const session=ensureDungeonVisit(hero,content);assert.ok(session.visitId);assert.deepEqual(session.killedMinions,[minion.id]);
 assert.equal(dungeonMonsterState(hero,content,minion,9999999).visitKilled,true);
 assert.equal(dungeonExitPortalState(hero,content),null,'a prior difficulty completion is not proof of a boss killed in this visit');
 assert.equal(dungeonMonsterState(hero,content,boss,200).deadUntil,3600100);
});

test('a saved boss timer without completion data cannot be bypassed by forging a later death event',()=>{
 const d=DUNGEONS[0],hero=heroAt(d),content=enter(hero,d,'easy'),boss=content.bosses[0],oldAt=1000;
 hero.worldState.monsters[content.id+':'+boss.id]={killedAt:oldAt,deadUntil:oldAt+DUNGEON_RESPAWN_MS,hp:0};
 assert.equal(recordDungeonBossKill(hero,d.id,'easy',boss.id,oldAt+100,{deathRecordedAt:oldAt+100}).reason,'cooldown');
 assert.equal(hero.gold,0);
});

test('portal requires a deliberate nearby interaction and never grants rewards itself',()=>{
 const d=DUNGEONS[0],hero=heroAt(d),content=enter(hero,d,'easy');recordDungeonBossKill(hero,d.id,'easy',content.bosses[0].id,10000);
 let leaves=0;const scene={hero,regionContent:content,panelsOpen:()=>false,controls:{reset(){}},leaveDungeon(){leaves++;const result=leaveDungeon(hero);Object.assign(hero,result.destination);return result;}};
 const portal=new DungeonExitPortal(scene),state=dungeonExitPortalState(hero,content),gold=hero.gold;
 assert.equal(portal.tryUse().ok,false);assert.equal(leaves,0);
 Object.assign(hero,{x:state.x,y:state.y});assert.equal(portal.tryUse().ok,true);assert.equal(leaves,1);
 assert.equal(hero.gold,gold);assert.equal(portal.tryUse().ok,false);assert.equal(leaves,1);
});
