import test from 'node:test';
import assert from 'node:assert/strict';
import {ChunkWorld} from '../js/world/ChunkWorld.js';
import {getRegionContent} from '../js/world/regionContent.js';
import {DUNGEONS,createDungeonContent} from '../js/dungeons/dungeonSystem.js';
import {project,unproject,screenDirection} from '../js/world/projection.js';
function sceneMock(){
 const textures=new Set(),alive=new Set();
 const object=()=>{const children=[],o=new Proxy({destroy(){if(!alive.has(o))return;alive.delete(o);for(const child of children)child.destroy();},add(nodes){children.push(...(Array.isArray(nodes)?nodes:[nodes]));return o;},generateTexture(key){textures.add(key);return o;}},{get:(target,key)=>key in target?target[key]:(...args)=>o});alive.add(o);return o;};
 return {language:'ru',add:new Proxy({},{get:()=>object}),make:{graphics:object},textures:{exists:k=>textures.has(k),remove:k=>textures.delete(k)},texturesSet:textures,alive};
}
test('isometric projection has exact inverse and touch axes match screen direction',()=>{
 for(const [x,y]of [[0,0],[12000,300],[14000,14000]]){const p=project(x,y,15000),back=unproject(p.x,p.y,15000);assert.ok(Math.abs(back.x-x)<1e-8&&Math.abs(back.y-y)<1e-8);}
 const right=screenDirection(1,0),up=screenDirection(0,-1);assert.ok(right.x>0&&right.y<0);assert.ok(up.x<0&&up.y<0);
});
test('full region traversal loads and evicts real chunk objects and textures without growth',()=>{
 for(const id of ['forest','north','ancient']){
  const content={...getRegionContent(id),dungeons:DUNGEONS.filter(d=>d.region===id)},scene=sceneMock(),world=new ChunkWorld(scene,content);const shared=scene.texturesSet.size;let peak=0;
  const positions=[...content.npcs,...content.camps,...content.bosses,...content.portals,...content.dungeons];
  for(let x=100;x<content.width;x+=1600)for(let y=100;y<content.height;y+=1600)positions.push({x,y});
  for(const p of positions){world.update(p);peak=Math.max(peak,world.chunks.size);assert.ok(world.chunks.size<45);assert.equal(scene.texturesSet.size,world.chunks.size+shared);}
  for(const npc of content.npcs){world.update(npc);assert.equal(world.isWalkable(npc.x,npc.y),true,npc.id);}
  world.destroy();assert.equal(scene.texturesSet.size,shared);assert.equal(scene.alive.size,0);assert.ok(peak>0);
 }
});
test('all dungeon entry and exit rooms create and destroy bounded chunk scenes',()=>{
 for(const d of DUNGEONS)for(const difficulty of ['easy','medium','hard']){
  const c=createDungeonContent(d.id,difficulty),scene=sceneMock(),world=new ChunkWorld(scene,c);
  for(const room of c.rooms){const p={x:room.x+160,y:room.y+140};world.update(p);assert.equal(world.isWalkable(p.x,p.y),true);assert.ok(world.chunks.size<45);}
  world.destroy();assert.equal(scene.alive.size,0);
 }
});
