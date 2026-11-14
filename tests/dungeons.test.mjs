import test from 'node:test';
import assert from 'node:assert/strict';
import {DUNGEONS,DIFFICULTIES,createDungeonContent,enterDungeon,leaveDungeon,recordDungeonBossKill,DUNGEON_RESPAWN_MS} from '../js/dungeons/dungeonSystem.js';
import {dungeonFloorContains} from '../js/world/chunkGeometry.js';
import {monsterKind} from '../js/monsters/monsters.js';
import {DUNGEON_MINION_RESPAWN_MS} from '../js/dungeons/dungeonData.js';
import {createCharacter} from '../js/characters/Character.js';
const heroAt=(d,level=d.level)=>createCharacter({classId:'warrior',level,region:d.region,x:d.x,y:d.y});
test('cleared dungeon rooms remain clear during recovery while boss and outdoor respawn timers stay independent',()=>{for(const d of DUNGEONS)for(const difficulty of ['easy','medium','hard']){const c=createDungeonContent(d.id,difficulty);for(const mob of c.camps.flatMap(c=>c.spawns))assert.equal(monsterKind(mob).respawnMs,DUNGEON_MINION_RESPAWN_MS);for(const boss of c.bosses)assert.equal(monsterKind(boss).respawnMs,3600000);}assert.equal(DUNGEON_MINION_RESPAWN_MS,8640000000000000);assert.equal(monsterKind({type:'forestWolf',level:1}).respawnMs,30000);});
function walkSegment(content,a,b){const distance=Math.hypot(b.x-a.x,b.y-a.y),steps=Math.ceil(distance/4);for(let i=0;i<=steps;i++){const t=steps?i/steps:0;assert.equal(dungeonFloorContains(content,a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,12),true,`${content.id} floor blocked at ${a.x+(b.x-a.x)*t},${a.y+(b.y-a.y)*t}`);}}
test('all twelve dungeon interiors have traversable chamber and corridor routes to every boss and exit',()=>{
 assert.deepEqual(DUNGEONS.map(d=>d.level),[5,10,18,22,25,29,33,35,36,38,40,42]);assert.equal(new Set(DUNGEONS.map(d=>d.id)).size,12);
 for(const d of DUNGEONS)for(const mode of Object.keys(DIFFICULTIES)){
  const c=createDungeonContent(d.id,mode);assert.ok(c.dungeon);assert.ok(c.camps.length>=3);assert.equal(c.bosses.length,d.bossCount);assert.ok(c.bosses.length>=1&&c.bosses.length<=3);assert.equal(c.towns.length,0);
  assert.equal(dungeonFloorContains(c,0,0),false);walkSegment(c,c.entry,{x:c.rooms[0].x+160,y:c.rooms[0].y+140});
  for(let i=1;i<c.rooms.length;i++){const a={x:c.rooms[i-1].x+160,y:c.rooms[i-1].y+140},b={x:c.rooms[i].x+160,y:c.rooms[i].y+140};walkSegment(c,a,{x:b.x,y:a.y});walkSegment(c,{x:b.x,y:a.y},b);}
  for(const spawn of [...c.camps.flatMap(camp=>camp.spawns),...c.bosses])assert.equal(dungeonFloorContains(c,spawn.x,spawn.y,18),true,spawn.id);
  for(const boss of c.bosses){const room=c.rooms.find(r=>boss.x>=r.x&&boss.x<=r.x+r.width&&boss.y>=r.y&&boss.y<=r.y+r.height);walkSegment(c,{x:room.x+160,y:room.y+140},boss);assert.ok(boss.patterns.length>=2);}
  assert.deepEqual(c.exit.x,c.entry.x);assert.deepEqual(c.exit.y,c.entry.y);
 }
});
test('difficulty scales actual monster health and damage by twenty or thirty percent',()=>{
 for(const d of DUNGEONS){const easy=createDungeonContent(d.id,'easy');for(const [difficulty,multiplier]of [['medium',1.2],['hard',1.3]]){
  const c=createDungeonContent(d.id,difficulty);for(const [a,b]of [[easy.camps[0].spawns[0],c.camps[0].spawns[0]],[easy.bosses[0],c.bosses[0]]]){const base=monsterKind(a),scaled=monsterKind(b);assert.ok(Math.abs(scaled.hp-base.hp*multiplier)<=1);assert.ok(Math.abs(scaled.attack-base.attack*multiplier)<=1);}
 }}
});
test('entry requires level, proximity and living hero and preserves failure state',()=>{
 const d=DUNGEONS[0],h=heroAt(d,d.level-1);const before=JSON.stringify(h);assert.equal(enterDungeon(h,d.id,'easy').reason,'level');assert.equal(JSON.stringify(h),before);h.level=d.level;h.x+=161;assert.equal(enterDungeon(h,d.id).reason,'distance');h.x=d.x;h.hp=0;assert.equal(enterDungeon(h,d.id).reason,'dead');h.hp=10;assert.equal(enterDungeon(h,d.id,'impossible').reason,'invalid');
 const entered=enterDungeon(h,d.id,'medium');assert.equal(entered.ok,true);assert.equal(entered.destination.region,'dungeon:dungeon1:medium');assert.equal(h.dungeonSession.difficulty,'medium');assert.equal(enterDungeon(h,d.id).reason,'inside');
 h.region=entered.destination.region;h.hp=0;const exit=leaveDungeon(h);assert.deepEqual(exit.destination,{region:d.region,x:d.x,y:d.y+80});assert.equal(h.dungeonSession,null);assert.equal(h.returnLocation,null);assert.equal(leaveDungeon(h).reason,'outside');
});
test('boss kills, completion rewards and hour respawns are independent across difficulties',()=>{
 const d=DUNGEONS.at(-1),h=heroAt(d),c=createDungeonContent(d.id,'easy'),now=100000;
 let completed=0;const goldBefore=h.gold;
 for(const boss of c.bosses){const result=recordDungeonBossKill(h,d.id,'easy',boss.id,now);if(result.completed)completed++;assert.equal(result.ok,true);assert.equal(h.worldState.monsters[c.id+':'+boss.id].deadUntil,now+DUNGEON_RESPAWN_MS);}
 assert.equal(completed,1);assert.ok(h.gold>goldBefore);const rewardedGold=h.gold;
 assert.equal(recordDungeonBossKill(h,d.id,'easy',c.bosses[0].id,now+1).reason,'cooldown');assert.equal(h.gold,rewardedGold);
 const hard=createDungeonContent(d.id,'hard');for(const boss of hard.bosses)assert.equal(recordDungeonBossKill(h,d.id,'hard',boss.id,now+1).ok,true);assert.ok(h.gold>rewardedGold);
 const beforeCycle=h.gold;for(const boss of c.bosses)assert.equal(recordDungeonBossKill(h,d.id,'easy',boss.id,now+DUNGEON_RESPAWN_MS).ok,true);assert.ok(h.gold>beforeCycle);
 assert.equal(recordDungeonBossKill(h,d.id,'easy','foreign',now).reason,'boss');
});
test('dungeon session and per-difficulty completion state survive character serialization',()=>{
 const d=DUNGEONS[2],h=heroAt(d);const entered=enterDungeon(h,d.id,'hard');h.region=entered.destination.region;recordDungeonBossKill(h,d.id,'hard',entered.content.bosses[0].id,1000000);const restored=createCharacter(JSON.parse(JSON.stringify(h)));assert.deepEqual(restored.dungeonSession,h.dungeonSession);assert.deepEqual(restored.dungeonProgress,h.dungeonProgress);assert.deepEqual(restored.worldState,h.worldState);assert.deepEqual(leaveDungeon(restored).destination,{region:d.region,x:d.x,y:d.y+80});
});

test('malformed imported dungeon progress cannot crash a real boss completion',()=>{
 const hero=createCharacter({level:42,x:1820,y:1780,region:'forest',dungeonProgress:{'dungeon1:easy':{readyAt:Date.now()+100000,killed:'invalid-array'}}});
 const content=createDungeonContent('dungeon1','easy');let result;
 assert.doesNotThrow(()=>{result=recordDungeonBossKill(hero,'dungeon1','easy',content.bosses[0].id);});
 assert.equal(result.ok,true);assert.equal(result.completed,true);assert.deepEqual(hero.dungeonProgress['dungeon1:easy'].killed,[content.bosses[0].id]);
});
