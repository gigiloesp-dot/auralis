import test from 'node:test';
import assert from 'node:assert/strict';
import {getRegionContent} from '../js/world/regionContent.js';
import {worldWalkable,visibleChunkCoordinates,describeChunk,CHUNK_SIZE} from '../js/world/chunkGeometry.js';
import {MonsterStream} from '../js/monsters/MonsterStream.js';
import {Save} from '../js/systems/save.js';
import {createCharacter} from '../js/characters/Character.js';
import {normalizePersistentProgress} from '../js/systems/progressState.js';
import {lineClear,moveWithCollision} from '../js/combat/geometry.js';
import {nearestTarget} from '../js/combat/targeting.js';
import {QUESTS} from '../js/quests/quests.js';
test('recovered region data has exact budgets, stable ids and valid references',()=>{
 const counts={forest:[94,895,3,11],north:[85,805,2,6],ancient:[75,715,2,4]},ids=new Set();
 for(const [region,[campCount,mobCount,towns,npcs]]of Object.entries(counts)){
  const c=getRegionContent(region);assert.equal(c.camps.length,campCount);assert.equal(c.camps.flatMap(x=>x.spawns).length,mobCount);assert.equal(c.towns.length,towns);assert.equal(c.npcs.length,npcs);assert.equal(c.bosses.filter(b=>b.bossType==='mini').length,4);assert.equal(c.bosses.filter(b=>b.bossType==='world').length,2);
  for(const p of [...c.camps.flatMap(x=>x.spawns),...c.bosses,...c.npcs,...c.portals]){assert.ok(p.x>=0&&p.y>=0&&p.x<c.width&&p.y<c.height);assert.ok(!ids.has(p.id));ids.add(p.id);}
  for(const p of c.portals){const target=getRegionContent(p.toRegion);assert.ok(p.toX<target.width&&p.toY<target.height);}
  assert.deepEqual(getRegionContent(region),c);
 }
 assert.throws(()=>getRegionContent('missing'),RangeError);
 for(const q of QUESTS){const c=getRegionContent(q.region);assert.ok(c.npcs.some(n=>n.id===q.npcId));if(q.targetCampId)assert.ok(c.camps.some(x=>x.id===q.targetCampId));if(q.type==='boss')assert.ok(c.bosses.some(x=>x.id===q.target));}
});
test('chunk descriptions repeat deterministically and edge queries stay bounded',()=>{
 const c=getRegionContent('forest');assert.deepEqual(describeChunk(c,12,13),describeChunk(c,12,13));
 for(const [x,y]of [[0,0],[c.width-1,c.height-1],[6000,6000]]){const list=visibleChunkCoordinates(c,{x,y,width:844,height:390});assert.ok(list.length>0&&list.length<40);for(const p of list)assert.ok(p.cx>=0&&p.cy>=0&&p.cx*CHUNK_SIZE<c.width&&p.cy*CHUNK_SIZE<c.height);}
 assert.equal(worldWalkable(c,1030,1140),true);assert.equal(worldWalkable(c,-1,10),false);
});
test('streaming unloads actual entities and reconstructs stable spawn ids',()=>{
 const content={camps:[{id:'camp',spawns:[{id:'a',x:100,y:100},{id:'b',x:2000,y:2000}]}],bosses:[]},hero={x:100,y:100},removed=[];
 const stream=new MonsterStream(content,hero,d=>({...d,homeX:d.x,homeY:d.y}),m=>removed.push(m.id));stream.update();assert.deepEqual([...stream.loaded.keys()],['a']);hero.x=2000;hero.y=2000;stream.update();assert.deepEqual([...stream.loaded.keys()],['b']);assert.deepEqual(removed,['a']);hero.x=100;hero.y=100;stream.update();assert.deepEqual([...stream.loaded.keys()],['a']);stream.destroy();assert.equal(stream.loaded.size,0);
});
test('progress schema rejects runtime cycles and retains supported save data',()=>{
 const values=new Map();globalThis.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
 const circular={};circular.self=circular;
 const h=createCharacter({name:'Retained',inventory:[{id:'wolfFang',quantity:12}],worldState:{monsters:{wolf:{deadUntil:9000,killedAt:8000,hp:0}}},combatCooldowns:{mage_0:12000},dungeonProgress:{one:{easy:{completed:true}}},discoveredRegions:['forest','north']});
 assert.equal(Save.write(h,1),true);const restored=createCharacter(Save.load(1));assert.deepEqual(restored.worldState,h.worldState);assert.deepEqual(restored.dungeonProgress,h.dungeonProgress);assert.equal(restored.inventory[0].quantity,12);assert.equal(restored.combatCooldowns.mage_0,12000);
 assert.doesNotThrow(()=>JSON.stringify(normalizePersistentProgress({dungeonProgress:circular})));
 const original=localStorage.getItem(Save.key(1));assert.equal(Save.import('{bad',1),false);assert.equal(Save.import(JSON.stringify({...h,version:999}),1),false);assert.equal(localStorage.getItem(Save.key(1)),original);
 assert.equal(Save.import(JSON.stringify({...h,name:'Restored',version:2}),1),true);assert.equal(JSON.parse(Save.exportReplacementBackup(1)).name,'Retained');assert.equal(Save.load(1).name,'Restored');
});
test('geometry blocks targeting and swept motion through obstacles',()=>{
 const hero={x:0,y:0},wall=[{x:25,y:0,r:10}],enemy={x:50,y:0,alive:true};assert.equal(lineClear(hero,enemy,wall),false);assert.equal(nearestTarget(hero,[enemy],100,wall),null);moveWithCollision(hero,100,0,100,wall,2);assert.ok(hero.x<15);
});
