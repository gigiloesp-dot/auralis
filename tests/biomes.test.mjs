import test from 'node:test';
import assert from 'node:assert/strict';
import {biomeZones,biomeAt,biomeSidePaths,paintBiomes} from '../js/world/biomes.js';
import {getRegionContent} from '../js/world/regionContent.js';
import {describeChunk,regionRoads,distanceToSegment,worldWalkable} from '../js/world/chunkGeometry.js';
import {DUNGEONS} from '../js/dungeons/dungeonSystem.js';
test('all outdoor regions have distinct deterministic visible biome areas and localized landmarks',()=>{
 const expected={forest:['clearing','grove','hills','pinewood'],north:['snowfield','icebasin','mountainpass','pinewood'],ancient:['ruinfield','dryground','grove']};
 for(const [id,types]of Object.entries(expected)){
  const c=getRegionContent(id),zones=biomeZones(c);for(const type of types)assert.ok(zones.some(z=>z.type===type),id+': '+type);
  for(const z of zones){assert.equal(biomeAt(c,z.x,z.y)?.id,z.id);for(const language of ['ru','en','es'])assert.ok(z.names[language]);assert.ok(z.x-z.rx>=0&&z.x+z.rx<=c.width&&z.y-z.ry>=0&&z.y+z.ry<=c.height);}
  assert.deepEqual(biomeSidePaths(c),biomeSidePaths(c));assert.ok(regionRoads(c).some(r=>r.secondary));
 }
 assert.deepEqual(biomeZones({id:'forest',dungeon:true}),[]);assert.deepEqual(biomeSidePaths({id:'north',dungeon:true}),[]);
});
test('biome painting uses the same world shapes across neighboring chunk texture boundaries',()=>{
 const c=getRegionContent('forest'),records=[];
 for(const x of [2048,2560]){const ellipses=[],g=new Proxy({fillEllipse(...args){ellipses.push(args);return g;}},{get:(o,k)=>k in o?o[k]:()=>g});paintBiomes(g,c,{x,y:2048,width:512,height:512});records.push(ellipses.map(([cx,cy,w,h])=>[cx+x,cy+2048,w,h]));}
 const meadow=biomeZones(c).find(z=>z.type==='clearing');for(const r of records)assert.ok(r.some(([x,y,w,h])=>x===meadow.x&&y===meadow.y&&w===meadow.rx*2&&h===meadow.ry*2));
});
test('north cliff and ice props have matching visible collision shapes and leave real trails clear',()=>{
 const c={...getRegionContent('north'),dungeons:DUNGEONS.filter(d=>d.region==='north')},roads=regionRoads(c);let cliff=0,ice=0;
 for(let cy=0;cy<Math.ceil(c.height/512);cy++)for(let cx=0;cx<Math.ceil(c.width/512);cx++){
  const d=describeChunk(c,cx,cy);assert.deepEqual(d,describeChunk(c,cx,cy));
  for(const p of d.decorations.filter(p=>p.kind==='cliff'||p.kind==='ice')){
   if(p.kind==='cliff')cliff++;else ice++;
   assert.ok(d.obstacles.some(o=>o.x===p.x&&o.y===p.y&&o.r===p.r));assert.ok(p.r>0&&p.r<60);
   assert.ok(roads.every(r=>distanceToSegment(p,r.from,r.to)>r.width/2+40));
   assert.ok(c.camps.every(camp=>Math.hypot(camp.x-p.x,camp.y-p.y)>145));
  }
 }
 assert.ok(cliff>=15);assert.ok(ice>=5);
 for(const road of roads.filter(r=>r.secondary))for(let i=0;i<=12;i++){const t=i/12;assert.equal(worldWalkable(c,road.from.x+(road.to.x-road.from.x)*t,road.from.y+(road.to.y-road.from.y)*t),true,road.id);}
});
