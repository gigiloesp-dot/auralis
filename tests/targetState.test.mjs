import test from 'node:test';import assert from 'node:assert/strict';
import {TargetState,TARGET_LINGER_MS} from '../js/combat/targetState.js';
import {targetPanelBounds} from '../js/ui/TargetPanel.js';
const monster=(id,hp=100)=>({id,key:'forest:'+id,alive:true,active:true,hp,maxHp:100,level:4,kind:{names:{en:'Forest wolf'}}});
const hero={hp:100};
test('selected target tracks real damage and recovery, replacement removes the old target',()=>{
 const state=new TargetState(),a=monster('a'),b=monster('b');assert.ok(state.engage(a,100));assert.equal(state.update(200,{hero,monsters:[a,b]}),a);a.hp=65;assert.equal(state.update(300,{hero,monsters:[a,b]}).hp,65);a.hp=80;assert.equal(state.update(400,{hero,monsters:[a,b]}).hp,80);state.engage(b,500);a.hp=0;a.alive=false;assert.equal(state.clear(a),false);assert.equal(state.update(600,{hero,monsters:[a,b]}),b);
});
test('dead target and dead hero disappear immediately, with no linger delay',()=>{
 const state=new TargetState(),a=monster('a');state.engage(a,100);a.hp=0;assert.equal(state.update(101,{hero,monsters:[a]}),null);assert.equal(state.target,null);a.hp=100;state.engage(a,200);assert.equal(state.update(201,{hero:{hp:0},monsters:[a]}),null);assert.equal(state.target,null);
});
test('visible nearest target cannot refresh the four-second combat expiry',()=>{
 const state=new TargetState(),a=monster('a');state.engage(a,100);assert.equal(state.update(4099,{hero,monsters:[a]}),a);assert.equal(state.update(4100,{hero,monsters:[a]}),null);state.engage(a,5000);state.engage(a,7000);assert.equal(state.update(10999,{hero,monsters:[a]}),a);assert.equal(state.update(11000,{hero,monsters:[a]}),null);assert.equal(TARGET_LINGER_MS,4000);
});
test('lost and occluded targets retain last observed HP only until combat expiry',()=>{
 const state=new TargetState(),a=monster('a');state.engage(a,100);a.hp=80;state.update(200,{hero,monsters:[a]});a.hp=25;assert.equal(state.update(500,{hero,monsters:[a],visible:()=>false}).hp,80,'hidden damage must not leak through scenery');assert.equal(state.update(600,{hero,monsters:[]}).hp,80);assert.equal(state.update(4100,{hero,monsters:[]}),null);
});
test('world reset clears old references and invalid engagements cannot revive stale HUD',()=>{
 const state=new TargetState(),a=monster('a');state.engage(a,100);assert.equal(state.clear(),true);assert.equal(state.update(200,{hero,monsters:[a]}),null);assert.equal(state.engage({...a,hp:0},300),false);assert.equal(state.engage(a,NaN),false);assert.equal(state.target,null);state.engage(a,400);assert.equal(state.update(0,{hero,monsters:[a]}),null,'restarted simulation clock clears previous region target');
});
test('target panel fits between hero bars and minimap below toolbar at mobile landscape sizes',()=>{
 for(const [width,height,hudRight,mapLeft]of [[640,360,267,444],[740,320,267,568],[844,390,267,648],[915,412,267,719]]){
  const b=targetPanelBounds(width,{hudRight,minimapLeft:mapLeft,toolbarBottom:49,pauseBottom:50});assert.ok(b.left>=hudRight+10);assert.ok(b.left+b.width<=mapLeft-10);assert.ok(b.top>=58);assert.ok(b.top+43<height-180,'panel must stay above combat controls');assert.ok(b.width>=112&&b.width<=240);
 }
});
