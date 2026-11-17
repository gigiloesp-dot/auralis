import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {getRegionContent} from '../js/world/regionContent.js';import {REGIONS} from '../js/world/worldData.js';import {LEGACY_NPCS} from '../js/npc/npcData.js';import {describeChunk,worldWalkable,regionRoads,distanceToSegment} from '../js/world/chunkGeometry.js';
const old=JSON.parse(readFileSync('docs/qa/task9/release20-world.json'));
const legacyIds=new Set(LEGACY_NPCS.map(n=>n.id));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function houses(content,town){const all=[];for(let y=Math.floor((town.y-450)/512);y<=Math.floor((town.y+450)/512);y++)for(let x=Math.floor((town.x-450)/512);x<=Math.floor((town.x+450)/512);x++)all.push(...describeChunk(content,x,y).decorations.filter(d=>d.kind==='house'));return all;}
test('all seven settlements double their footprint, retain old homes and receive two safe real houses and lanes',()=>{
 let towns=0,added=0;
 for(const id of ['forest','north','ancient']){const c=getRegionContent(id),baseline={...REGIONS[id],...old.regions[id],id,river:{baseX:old.regions[id].width*.58}};
 for(const town of c.towns){towns++;assert.ok(Math.abs((town.footprintRadius/235)**2-2)<1e-9);assert.ok(Math.abs((town.safeRadius/120)**2-2)<1e-9);const prior=houses(baseline,town),current=houses(c,town),extra=c.settlementHouses.filter(h=>h.townId===town.id);assert.equal(extra.length,2);added+=extra.length;
  for(const h of prior)assert.ok(current.some(n=>n.x===h.x&&n.y===h.y),'legacy house retained '+town.id+'/'+h.x+','+h.y);
  for(const h of extra){assert.equal(current.filter(n=>n.id===h.id).length,1);assert.equal(worldWalkable(c,h.x,h.y-14,12),false,'real house collision');assert.ok(c.npcs.filter(n=>legacyIds.has(n.id)).every(n=>distance(h,n)>=130));assert.ok(c.camps.flatMap(c=>c.spawns).every(n=>distance(h,n)>=150));}
  const lanes=c.roads.filter(r=>r.id.startsWith(town.id+'-extension-lane-'));assert.equal(lanes.length,2);for(const road of lanes)for(let i=0;i<=20;i++)assert.equal(worldWalkable(c,road.from.x+(road.to.x-road.from.x)*i/20,road.from.y+(road.to.y-road.from.y)*i/20,12),true,'new lane must stay open');
  for(const n of c.npcs.filter(n=>n.townId===town.id)){assert.ok(distance(n,town)<=town.safeRadius);assert.equal(worldWalkable(c,n.x,n.y),true);}
  for(const p of town.futurePlots){assert.equal(worldWalkable(c,p.x,p.y),true);assert.ok(c.npcs.filter(n=>legacyIds.has(n.id)).every(n=>distance(p,n)>=75));}
 }
 }
 assert.equal(towns,7);assert.equal(added,14);
});
test('only the crowded resident moves; additions have stable globally unique IDs and positions',()=>{const ids=[];for(const id of ['forest','north','ancient']){const c=getRegionContent(id);for(const n of c.npcs.filter(n=>legacyIds.has(n.id))){const before=old.npcs.find(o=>o.id===n.id);if(n.id==='tera'){assert.deepEqual([n.x,n.y],[885,1220]);assert.ok(distance(n,c.npcs.find(o=>o.id==='aldric'))>95);}else assert.deepEqual(n,before);}ids.push(...c.settlementHouses.map(h=>h.id),...c.towns.flatMap(t=>t.futurePlots.map(p=>p.id)));assert.equal(getRegionContent(id),c);}assert.equal(new Set(ids).size,ids.length);});
