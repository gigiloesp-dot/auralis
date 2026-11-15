import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {getRegionContent,getRelease21RegionContent} from '../js/world/regionContent.js';import {REGIONS} from '../js/world/worldData.js';import {regionRoads,distanceToSegment,worldWalkable,describeChunk,visibleChunkCoordinates} from '../js/world/chunkGeometry.js';import {MONSTER_TYPES} from '../js/monsters/monsters.js';import {movementProfile} from '../js/monsters/movementProfiles.js';import {pngAlpha} from './pngAlpha.mjs';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
test('release21 migration baseline: four maps have approved dimensions and exactly the approved reciprocal ring without diagonal links',()=>{
 const expected={forest:[18000,154,1435,['desert','north']],north:[21000,145,1345,['ancient','forest']],ancient:[15000,75,715,['desert','north']],desert:[20000,96,864,['ancient','forest']]};
 let towns=0,npcs=0;
 for(const [id,[size,camps,mobs,links]]of Object.entries(expected)){const c=getRelease21RegionContent(id);assert.equal(c.width,size);assert.equal(c.height,size);assert.equal(c.camps.length,camps);assert.equal(c.camps.flatMap(c=>c.spawns).length,mobs);assert.deepEqual(c.portals.map(p=>p.toRegion).sort(),links);towns+=c.towns.length;npcs+=c.npcs.length;
 for(const p of c.portals){const target=getRelease21RegionContent(p.toRegion);assert.equal(worldWalkable(c,p.x,p.y),true);assert.equal(worldWalkable(target,p.toX,p.toY),true);assert.ok(target.portals.some(back=>back.toRegion===id));}
 }assert.equal(towns,8);assert.equal(npcs,21);
});
test('release21 migration baseline: all temporary camps are single-species, deterministic, outside roads/towns/entrances and obstacle-free',()=>{
 let camps=0,mobs=0;const ids=new Set();
 for(const id of ['forest','north','desert']){const c=getRelease21RegionContent(id),roads=regionRoads(c),fresh=c.camps.filter(c=>c.expansion);for(const camp of fresh){camps++;assert.equal(camp.spawns.length,9);assert.equal(new Set(camp.spawns.map(s=>s.type)).size,1);assert.ok(camp.level>=c.minLevel&&camp.level<=c.maxLevel);if(id!=='desert')assert.ok(camp.x>(id==='forest'?12000:14000)+250||camp.y>(id==='forest'?12000:14000)+250);
  for(const s of camp.spawns){mobs++;assert.ok(!ids.has(s.id));ids.add(s.id);assert.equal(s.type,camp.type);assert.equal(s.level,camp.level);const r=movementProfile(MONSTER_TYPES[s.type]).collisionRadius;assert.equal(worldWalkable(c,s.x,s.y,r),true,s.id);assert.ok(roads.every(road=>distanceToSegment(s,road.from,road.to)>road.width/2+r+14));assert.ok(c.towns.every(t=>distance(s,t)>t.safeRadius+r+30));assert.ok(c.portals.every(p=>distance(s,p)>140+r));}
  for(let i=0;i<camp.spawns.length;i++)for(let j=i+1;j<camp.spawns.length;j++)assert.ok(distance(camp.spawns[i],camp.spawns[j])>=2*movementProfile(MONSTER_TYPES[camp.type]).collisionRadius+4);
 }}assert.equal(camps,216);assert.equal(mobs,1944);
 const desert=getRelease21RegionContent('desert');assert.equal(Math.min(...desert.camps.map(c=>c.level)),42);assert.equal(Math.max(...desert.camps.map(c=>c.level)),56);assert.equal(new Set(desert.camps.map(c=>c.type)).size,4);
});
test('new terrain and real transparent desert props stay chunked with bounded residency',()=>{
 const {width,height,alpha}=pngAlpha('assets/world/desert/props.png');assert.equal(width,1024);assert.equal(height,1024);for(let row=0;row<2;row++)for(let col=0;col<2;col++){let count=0;for(let y=0;y<512;y++)for(let x=0;x<512;x++){const a=alpha[(row*512+y)*width+col*512+x];if(x<16||x>=496||y<16||y>=496)assert.equal(a,0);if(a>128)count++;}assert.ok(count>5000);}
 const c=getRegionContent('desert'),kinds=new Set();for(const p of [{x:1600,y:1800},{x:19000,y:19000},{x:13200,y:10500},{x:11700,y:7600}]){const chunks=visibleChunkCoordinates(c,{...p,width:700,height:400});assert.ok(chunks.length<50);for(const q of chunks)for(const d of describeChunk(c,q.cx,q.cy).decorations)kinds.add(d.kind);}assert.ok(kinds.has('palm')&&kinds.has('house')&&kinds.has('tower')&&kinds.has('wall'));
});
