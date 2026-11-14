import test from 'node:test';
import assert from 'node:assert/strict';
import {getRegionContent} from '../js/world/regionContent.js';
import {DUNGEONS} from '../js/dungeons/dungeonData.js';
import {MONSTER_TYPES} from '../js/monsters/monsters.js';
import {movementProfile} from '../js/monsters/movementProfiles.js';
import {regionRoads,distanceToSegment,worldWalkable} from '../js/world/chunkGeometry.js';

const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
test('existing 254 camps each gain exactly five monsters, all 2415 remain naturally separated and region-appropriate',()=>{
 const expected={forest:[94,895,1,25],north:[85,805,22,38],ancient:[75,715,35,42]},types=new Set();let camps=0,monsters=0;
 for(const [id,[campCount,population,min,max]]of Object.entries(expected)){
  const c=getRegionContent(id),spawns=c.camps.flatMap(c=>c.spawns),roads=regionRoads(c),entrances=DUNGEONS.filter(d=>d.region===id);
  assert.equal(c.camps.length,campCount);assert.equal(spawns.length,population);camps+=campCount;monsters+=population;
  const ordered=[...c.camps].sort((a,b)=>distance(a,c.spawn)-distance(b,c.spawn));
  assert.equal(Math.min(...ordered.map(c=>c.level)),min);assert.equal(Math.max(...ordered.map(c=>c.level)),max);
  for(let index=1;index<ordered.length;index++)assert.ok(ordered[index].level>=ordered[index-1].level,'levels progress with distance from starting settlement');
  for(const camp of c.camps){
   const added=camp.spawns.filter(s=>s.id.startsWith(camp.id+'-reinforcement-'));
   assert.equal(added.length,5,camp.id);assert.equal(new Set(camp.spawns.map(s=>s.type)).size,1);types.add(camp.type);
   for(const spawn of camp.spawns){const r=movementProfile(MONSTER_TYPES[spawn.type]).collisionRadius;
    assert.equal(spawn.type,camp.type);assert.equal(spawn.level,camp.level);assert.ok(distance(spawn,camp)+r<=camp.radius);
    assert.equal(worldWalkable({...c,dungeons:entrances},spawn.x,spawn.y,r),true,spawn.id+' must avoid terrain/buildings');
    assert.ok(c.towns.every(t=>distance(spawn,t.spawn||t)>t.safeRadius+r+30));
    assert.ok(entrances.every(d=>distance(spawn,d)>=160));
    assert.ok(roads.filter(r=>!r.secondary).every(road=>distanceToSegment(spawn,road.from,road.to)>road.width/2+r+10));
   }
   for(const spawn of added){const r=movementProfile(MONSTER_TYPES[spawn.type]).collisionRadius;
    assert.ok(roads.every(road=>distanceToSegment(spawn,road.from,road.to)>=road.width/2+r+14),'reinforcements avoid trails too');
   }
  }
  for(let i=0;i<spawns.length;i++)for(let j=i+1;j<spawns.length;j++){
   const a=spawns[i],b=spawns[j],required=movementProfile(MONSTER_TYPES[a.type]).collisionRadius+movementProfile(MONSTER_TYPES[b.type]).collisionRadius;
   assert.ok(distance(a,b)>=required,a.id+' overlaps '+b.id);
  }
 }
 assert.equal(camps,254);assert.equal(monsters,2415);assert.equal(types.size,23);
});
