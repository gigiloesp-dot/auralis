// Connectivity audit at32-unit sampling; browser tests separately walk real roads.
import test from 'node:test';
import assert from 'node:assert/strict';
import {getRegionContent} from '../js/world/regionContent.js';
import {DUNGEONS} from '../js/dungeons/dungeonSystem.js';
import {describeChunk,riverBlocked} from '../js/world/chunkGeometry.js';
test('every outdoor camp, boss, NPC and dungeon entrance connects to the starting settlement',()=>{
 for(const id of ['forest','north','ancient']){
  const c={...getRegionContent(id),dungeons:DUNGEONS.filter(d=>d.region===id)},descriptors=new Map();
  const walk=(x,y)=>{if(x<12||y<12||x>c.width-12||y>c.height-12||riverBlocked(c,x,y))return false;
   for(let cy=Math.max(0,Math.floor((y-72)/512));cy<=Math.min(Math.ceil(c.height/512)-1,Math.floor((y+72)/512));cy++)for(let cx=Math.max(0,Math.floor((x-72)/512));cx<=Math.min(Math.ceil(c.width/512)-1,Math.floor((x+72)/512));cx++){const key=cx+','+cy;if(!descriptors.has(key))descriptors.set(key,describeChunk(c,cx,cy));if(descriptors.get(key).obstacles.some(o=>(x-o.x)**2+(y-o.y)**2<(o.r+12)**2))return false;}return true;};
  const nx=Math.ceil(c.width/32),ny=Math.ceil(c.height/32),state=new Uint8Array(nx*ny),seen=new Uint8Array(nx*ny),queue=new Int32Array(nx*ny);
  const index=p=>Math.max(0,Math.min(ny-1,Math.round((p.y-16)/32)))*nx+Math.max(0,Math.min(nx-1,Math.round((p.x-16)/32)));
  for(let y=0;y<ny;y++)for(let x=0;x<nx;x++)state[y*nx+x]=walk(16+x*32,16+y*32)?1:0;
  const start=index(c.spawn);assert.equal(state[start],1,id+' start');let head=0,tail=1;queue[0]=start;seen[start]=1;
  while(head<tail){const at=queue[head++],x=at%nx,y=Math.floor(at/nx);for(const next of [x>0?at-1:-1,x<nx-1?at+1:-1,y>0?at-nx:-1,y<ny-1?at+nx:-1])if(next>=0&&state[next]&&!seen[next]){seen[next]=1;queue[tail++]=next;}}
  const goals=[...c.camps,...c.bosses,...c.npcs,...c.portals,...c.dungeons];
  for(const p of goals){assert.equal(walk(p.x,p.y),true,`${id} blocked objective ${p.id}`);assert.equal(seen[index(p)],1,`${id} disconnected objective ${p.id}`);}
 }
});
