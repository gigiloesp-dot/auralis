import test from 'node:test';import assert from 'node:assert/strict';
import {MonsterStream,MONSTER_STREAM_POLICY} from '../js/monsters/MonsterStream.js';
import {project,unproject} from '../js/world/projection.js';
const mob=(id,x,y,extra={})=>({id,x,y,type:'forestWolf',...extra});
const fixture=(descriptors,{view,hero={x:2000,y:2000},hot=()=>false,height=12000}={})=>{
 const removed=[];const content={height,camps:[{id:'camp',x:2000,y:2000,radius:145,spawns:descriptors}],bosses:[]};
 const stream=new MonsterStream(content,hero,d=>({...d,homeX:d.x,homeY:d.y,alive:true}),m=>removed.push(m.id),{viewport:()=>view,project:(x,y)=>project(x,y,height),hot});
 return {stream,hero,removed};
};
test('projected viewport corners stay resident and active beyond a 500px radial circle',()=>{
 for(const [width,height]of [[844,390],[915,412],[1280,720]]){
  const zoom=Math.max(.7,Math.min(1.3,Math.min(width/840,height/460))),centre=project(2000,2000,12000),view={x:centre.x-width/zoom/2,y:centre.y-height/zoom/2,width:width/zoom,height:height/zoom};
  const descriptors=[];
  for(const x of [view.x+1,view.x+view.width-1])for(const y of [view.y+1,view.y+view.height-1]){const p=unproject(x,y,12000);descriptors.push(mob('corner'+descriptors.length,p.x,p.y));}
  assert.ok(descriptors.some(d=>Math.hypot(d.x-2000,d.y-2000)>500));
  const {stream}=fixture(descriptors,{view});stream.update();assert.equal(stream.loaded.size,4);
  for(const m of stream.loaded.values()){assert.equal(stream.shouldActivate(m),true);assert.equal(m.campRadius,145);assert.equal(m.campX,2000);}
  stream.destroy();
 }
});
test('body height loads an approaching tall boss before its feet enter the camera',()=>{
 const origin=project(2000,2000,12000),view={x:origin.x-300,y:origin.y-180,width:600,height:360};
 const p=unproject(origin.x,view.y+view.height+300,12000),boss=mob('boss',p.x,p.y,{bossType:'world'});
 const {stream}=fixture([],{view});stream.content.bosses.push(boss);
 // A fresh stream builds the spatial index from the actual boss descriptor.
 const fresh=new MonsterStream(stream.content,{x:2000,y:2000},d=>({...d,homeX:d.x,homeY:d.y}),()=>{},{viewport:()=>view});
 fresh.update();assert.equal(fresh.loaded.has('boss'),true);assert.equal(fresh.shouldActivate(boss),true);fresh.destroy();
});
test('hysteresis avoids boundary churn and hot combat prevents evicting a moving actor',()=>{
 const centre=project(2000,2000,12000),view={x:centre.x-350,y:centre.y-200,width:700,height:400};
 const p=unproject(view.x-56-MONSTER_STREAM_POLICY.loadPadding+2,centre.y,12000);
 const {stream,hero,removed}=fixture([mob('edge',p.x,p.y)],{view,hot:m=>m.hot});stream.update();assert.equal(stream.loaded.size,1);
 for(let i=0;i<30;i++){view.x+=i%2?15:-15;stream.update();}assert.equal(stream.created,1);assert.deepEqual(removed,[]);
 const m=stream.loaded.get('edge');m.hot=true;m.x+=3000;m.y+=3000;hero.x+=3000;hero.y-=3000;view.x+=5000;stream.update();assert.equal(stream.loaded.has('edge'),true);assert.equal(stream.shouldActivate(m),true);
 m.hot=false;stream.update();assert.deepEqual(removed,['edge']);assert.equal(stream.loaded.size,0);
});
test('headless or legacy callers retain radial fallback and bounded spatial lookup',()=>{
 const {stream,hero,removed}=fixture([mob('near',2050,2000),mob('far',2700,2000)]);stream.update();assert.deepEqual([...stream.loaded.keys()],['near']);assert.equal(stream.diagnostics.monsterStreamMode,'radial-fallback');
 hero.x=2900;stream.update();assert.ok(removed.includes('near'));assert.ok(stream.loaded.has('far'));stream.destroy();
});
