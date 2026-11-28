import test from 'node:test';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
import {DESERT_DUNGEON_BLUEPRINTS,createDesertDungeonLayout} from '../js/dungeons/desertDungeonLayouts.js';
import {dungeonFloorContains,regionRoads,distanceToSegment,worldWalkable} from '../js/world/chunkGeometry.js';
import {getRegionContent,getRelease21RegionContent} from '../js/world/regionContent.js';
const center=r=>({x:r.x+r.width/2,y:r.y+r.height/2}),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const segment=(c,a,b)=>{const steps=Math.ceil(distance(a,b)/4);for(let i=0;i<=steps;i++){const t=steps?i/steps:0;assert.equal(dungeonFloorContains(c,a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,18),true,c.id+' blocked passage');}};
function reachable(c){
 const step=20,cols=Math.ceil(c.width/step)+1,rows=Math.ceil(c.height/step)+1,seen=new Uint8Array(cols*rows),queue=[],start={x:Math.round(c.entry.x/step),y:Math.round(c.entry.y/step)},key=(x,y)=>y*cols+x;assert.ok(dungeonFloorContains(c,start.x*step,start.y*step,18));seen[key(start.x,start.y)]=1;queue.push(start);
 for(let head=0;head<queue.length;head++){const p=queue[head];for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const x=p.x+dx,y=p.y+dy;if(x<0||y<0||x>=cols||y>=rows||seen[key(x,y)]||!dungeonFloorContains(c,x*step,y*step,18))continue;seen[key(x,y)]=1;queue.push({x,y});}}
 const reached=p=>{const x=Math.round(p.x/step),y=Math.round(p.y/step);return !!seen[key(x,y)]&&dungeonFloorContains(c,p.x,p.y,18);};return {reached,count:queue.length};
}
test('five authored desert floor plans are deterministic, distinct and keep IDs,levels and localised themes stable',()=>{
 assert.deepEqual(DESERT_DUNGEON_BLUEPRINTS.map(d=>[d.id,d.level]),[['dungeon13',42],['dungeon14',46],['dungeon15',49],['dungeon16',53],['dungeon17',56]]);const hashes=new Set(),themes=new Set();
 for(const b of DESERT_DUNGEON_BLUEPRINTS){const a=createDesertDungeonLayout(b.id),same=createDesertDungeonLayout(b.id);assert.deepEqual(a,same);assert.ok(Object.isFrozen(b));assert.ok(Object.isFrozen(b.rooms));for(const l of ['ru','en','es'])assert.ok(a.names[l]);assert.equal(a.dungeon,true);assert.equal(a.river,false);assert.deepEqual(a.towns,[]);assert.deepEqual(a.npcs,[]);assert.deepEqual(a.obstacles,[]);hashes.add(createHash('sha256').update(JSON.stringify({rooms:a.rooms,roads:a.roads})).digest('hex'));themes.add(a.theme);a.rooms[0].x=99999;assert.notEqual(createDesertDungeonLayout(b.id).rooms[0].x,99999);}
 assert.equal(hashes.size,5);assert.equal(themes.size,5);assert.throws(()=>createDesertDungeonLayout('dungeon1'),RangeError);
});
test('all five real floors have radius18 BFS routes from their safe entry to every room,enemy anchor and exit',()=>{
 for(const b of DESERT_DUNGEON_BLUEPRINTS){const c=createDesertDungeonLayout(b.id),walk=reachable(c);assert.ok(walk.count>1000);assert.ok(walk.reached(c.entry));assert.ok(walk.reached(c.exit));assert.deepEqual(c.exit,{...c.entry,radius:90});for(const room of c.rooms)assert.ok(walk.reached(center(room)),c.id+'/'+room.id);
  for(const e of c.encounters){assert.notEqual(e.roomId,c.rooms[0].id);assert.ok(walk.reached(e),e.id);for(const p of e.points){assert.ok(walk.reached(p),p.id);assert.ok(distance(p,c.entry)>250,p.id+' entry clearance');assert.ok(p.x>30&&p.y>30&&p.x<c.width-30&&p.y<c.height-30);for(const other of e.points)if(other!==p)assert.ok(distance(p,other)>=80,p.id+' separation');}}
  const bosses=c.encounters.filter(e=>e.kind==='boss');assert.equal(bosses.length,1);assert.equal(bosses[0].roomId,c.rooms.at(-1).id);assert.equal(bosses[0].points[0].id,c.id+'-boss-0');assert.ok(c.encounters.filter(e=>e.kind==='minions').length>=5);
 }
});
test('every authored corridor is at least100 units wide and its complete centerline is traversable; topology supports genuine loops and branches',()=>{
 const graphSignatures=new Set();for(const b of DESERT_DUNGEON_BLUEPRINTS){const c=createDesertDungeonLayout(b.id),degree=new Map(c.rooms.map(r=>[r.id,0]));for(const road of c.roads){assert.ok(road.width>=100);assert.ok(road.points.length>=2);assert.ok(degree.has(road.fromRoom));assert.ok(degree.has(road.toRoom));degree.set(road.fromRoom,degree.get(road.fromRoom)+1);degree.set(road.toRoom,degree.get(road.toRoom)+1);for(let i=1;i<road.points.length;i++)segment(c,road.points[i-1],road.points[i]);}
  segment(c,c.entry,center(c.rooms[0]));const degrees=[...degree.values()].sort((a,b)=>a-b);graphSignatures.add(JSON.stringify([c.rooms.length,c.roads.length,degrees]));if(c.id==='dungeon13'||c.id==='dungeon17')assert.ok(c.roads.length>=c.rooms.length,'cycle exists');if(c.id==='dungeon15')assert.ok(degrees.at(-1)>=4,'processional axis has genuine side chapels');}
 assert.equal(graphSignatures.size,5,'topologies differ,not only colours or coordinates');
});

test('five stable desert entrances lie on existing caravan roads,clear both old and new camps and allow a safe outdoor return',()=>{
 const c=getRegionContent('desert'),old=getRelease21RegionContent('desert'),entrances=DESERT_DUNGEON_BLUEPRINTS.map(b=>({...b.worldEntrance,id:b.id,region:'desert'})),roads=regionRoads(c).filter(r=>!r.secondary),geometry={...c,dungeons:[...(c.dungeons||[]),...entrances]};
 assert.deepEqual(entrances.map(p=>[p.id,p.x,p.y]),[['dungeon13',1875,2536],['dungeon14',6107,4946],['dungeon15',5094,11160],['dungeon16',6843,15844],['dungeon17',15664,17387]]);
 for(const b of DESERT_DUNGEON_BLUEPRINTS){const p=b.worldEntrance;assert.ok(Object.isFrozen(p));assert.ok(roads.some(r=>distanceToSegment(p,r.from,r.to)<1),b.id+' real caravan road');assert.ok(c.camps.every(q=>distance(p,q)>650),b.id+' current spots');assert.ok(old.camps.every(q=>distance(p,q)>600),b.id+' retired spots');assert.ok([...c.towns,...c.npcs,...c.portals,...c.bosses].every(q=>distance(p,q)>500),b.id+' settlement and portal clearance');for(const other of entrances)if(other.id!==b.id)assert.ok(distance(p,other)>2400);assert.equal(worldWalkable(geometry,p.x,p.y,18),true,b.id+' outdoor entry');assert.equal(worldWalkable(geometry,p.x,p.y+80,18),true,b.id+' outdoor return');assert.deepEqual(createDesertDungeonLayout(b.id).worldEntrance,p);}
});
