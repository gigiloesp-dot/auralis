import test from 'node:test';
import assert from 'node:assert/strict';
import {ChunkWorld} from '../js/world/ChunkWorld.js';
import {describeChunk} from '../js/world/chunkGeometry.js';
import {getRegionContent} from '../js/world/regionContent.js';
import {MonsterSystem} from '../js/monsters/MonsterSystem.js';
import {createCharacter} from '../js/characters/Character.js';
const node=()=>{const o={active:true,list:[]};for(const method of ['setDepth','setOrigin','setScale','setRotation','setPosition','setVisible'])o[method]=()=>o;o.add=children=>{o.list.push(...(Array.isArray(children)?children:[children]));return o;};o.destroy=()=>{o.active=false;};return o;};
test('flight still respects world edges, tall trees, houses and closed dungeon floors',()=>{
 const world={content:{width:600,height:600,river:false},obstacles:[{x:100,y:100,r:18,kind:'rock'},{x:200,y:100,r:22,kind:'oak',flightBlocked:true},{x:300,y:100,r:55,kind:'house'}]};
 const can=(x,y)=>ChunkWorld.prototype.isFlightWalkable.call(world,x,y,10);
 assert.equal(can(100,100),true);assert.equal(can(200,100),false);assert.equal(can(300,100),false);assert.equal(can(3,300),false);assert.equal(can(598,300),false);
 world.content={width:600,height:600,dungeon:true,walkableRects:[{x:50,y:50,width:140,height:140}]};assert.equal(can(80,80),true);assert.equal(can(40,80),false);assert.equal(can(186,80),false,'a flying radius cannot clip a room wall');
});
test('streamed physical obstacles retain high/low metadata instead of making all props fly-through',()=>{
 const c=getRegionContent('forest');let trees=0,low=0;
 for(let cy=0;cy<6;cy++)for(let cx=0;cx<6;cx++)for(const o of describeChunk(c,cx,cy).obstacles){if(['oak','pine','cypress','house','cliff'].includes(o.kind)){trees++;assert.equal(o.flightBlocked,true);}if(o.kind==='rock'){low++;assert.equal(o.flightBlocked,false);}}
 assert.ok(trees>0);assert.ok(low>0);
});
test('runtime monster system invokes the family ability and applies actual projectile poison',()=>{
 const hero=createCharacter({level:42,region:'test',x:1000,y:1000}),scene={playNow:0,axis:{x:0,y:0},obstacles:[],add:Object.fromEntries(['ellipse','container','triangle','circle','rectangle','text'].map(k=>[k,node])),tweens:{add(){}},world:{isWalkable:()=>true,isFlightWalkable:()=>true}},content={id:'test',towns:[],bosses:[],camps:[]},system=new MonsterSystem(scene,hero,()=>{},content);
 system.stream=null;const m=system.spawn({id:'venom',type:'spider',level:1,x:1120,y:1000});m.attack=40;m.lastHit=99999;system.update(20000,0);assert.equal(m.specialState.ability,'venom');const marker=m.specialState.marker,oldHp=hero.hp;system.update(20560,0);assert.equal(marker.active,false);assert.equal(system.hostileProjectiles.length,1);system.update(20660,.6);assert.ok(hero.hp<oldHp);assert.equal(hero.monsterAfflictions.poison.damage,5);assert.equal(system.hostileProjectiles.length,0);system.destroy();
});
