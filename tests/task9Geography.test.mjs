import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {getRegionContent,getRelease21RegionContent} from '../js/world/regionContent.js';import {REGIONS} from '../js/world/worldData.js';import {QUESTS,LEGACY_QUESTS} from '../js/quests/quests.js';import {describeChunk,riverX,visibleChunkCoordinates} from '../js/world/chunkGeometry.js';
const previous=JSON.parse(readFileSync('docs/qa/task9/release20-world.json'));
test('release21 migration baseline: expanded boundaries preserve every existing camp, spawn, boss, road, portal and quest',()=>{
 for(const [id,size]of Object.entries({forest:18000,north:21000,ancient:15000})){
  const c=getRelease21RegionContent(id),old=previous.regions[id];assert.equal(REGIONS[id].width,size);assert.equal(c.width,size);assert.equal(c.height,size);
  assert.deepEqual(c.camps.filter(c=>!c.expansion),old.camps,id+'/legacy camps');assert.deepEqual(c.bosses,old.bosses);assert.deepEqual(c.portals.filter(p=>p.toRegion!=='desert'),old.portals);
  for(const road of old.roads)assert.deepEqual(c.roads.find(r=>r.id===road.id),road);
  for(const town of old.towns){const actual=c.towns.find(t=>t.id===town.id);for(const key of ['id','x','y','spawn','names'])assert.deepEqual(actual[key],town[key]);}
  assert.deepEqual(c.npcs,old.npcs.map(n=>n.id==='tera'?{...n,x:885,y:1220}:n),'only crowded Tera is moved');
  for(const y of [100,1000,5000,10000])assert.equal(riverX(c,y),old.width*.58+Math.sin(y/850)*48,'old river must not move');
 }
 assert.deepEqual(LEGACY_QUESTS,previous.quests,'existing quest targets, levels and rewards are stable');
});
test('expanded edge chunks are finite, decorated, uniquely owned and remain streamed',()=>{
 for(const id of ['forest','north','ancient']){const c=getRegionContent(id),edge=describeChunk(c,Math.floor((c.width-1)/512),Math.floor((c.height-1)/512));assert.ok(edge.width>0&&edge.height>0);assert.ok(describeChunk(c,Math.floor((c.width-800)/512),Math.floor((c.height-800)/512)).decorations.length>0,'inner edge band is populated; narrow boundary strips remain clear');const a=visibleChunkCoordinates(c,{x:c.width-800,y:c.height-800,width:600,height:600});assert.ok(a.length<40);assert.equal(new Set(a.map(p=>p.key)).size,a.length);assert.deepEqual(edge,describeChunk(c,edge.cx,edge.cy));}
});
test('equipment catalogue, layers, weapon art and existing skill definitions are untouched',()=>{const manifest=JSON.parse(readFileSync('docs/qa/task9/protected-items-and-art.json'));assert.ok(Object.keys(manifest).length>20);for(const [path,hash]of Object.entries(manifest)){let source=readFileSync(path);if(path==='js/equipment/items.js'){const text=source.toString(),addedImport="import {ENDGAME_MATERIALS} from"+" './endgameMaterials.js';\n",addedSpread=",\n ...ENDGAME_MATERIALS\n";assert.equal(text.split(addedImport).length,2);assert.equal(text.split(addedSpread).length,2);source=Buffer.from(text.replace(addedImport,'').replace(addedSpread,'\n'));}assert.equal(createHash('sha256').update(source).digest('hex'),hash,path);}});
