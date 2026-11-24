import {actorPose} from '../js/assets/actorArt.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {MonsterSystem} from '../js/monsters/MonsterSystem.js';
import {createCharacter} from '../js/characters/Character.js';
import {monsterIntent} from '../js/monsters/monsterBehavior.js';

function setup(){
 const nodes=[],node=(type,args)=>{const o={type,args,visible:true,x:args[0]||0,y:args[1]||0,list:[],destroyCount:0};for(const name of ['setDepth','setOrigin','setScale','setRotation'])o[name]=()=>o;o.add=children=>{o.list.push(...(Array.isArray(children)?children:[children]));return o;};o.destroy=()=>{o.destroyCount++;};o.setVisible=v=>{o.visible=v;return o;};o.setPosition=(x,y)=>{o.x=x;o.y=y;return o;};nodes.push(o);return o;};
 const scene={playNow:0,axis:{x:0,y:0},obstacles:[],add:Object.fromEntries(['ellipse','container','triangle','circle','rectangle','text'].map(n=>[n,(...args)=>node(n,args)])),tweens:{add(){}},world:{isWalkable:()=>true,isFlightWalkable:()=>true}},hero=createCharacter({classId:'warrior',level:5,region:'test',x:2000,y:2000});hero.hp=hero.maxHp=100000;
 const content={id:'test',camps:[{id:'camp',x:2100,y:2000,radius:210,spawns:[{id:'source',type:'forestWolf',x:2100,y:2000,level:1},{id:'ally',type:'forestWolf',x:2170,y:2000,level:1},{id:'plain',type:'forestWolf',x:2220,y:2000,level:1}]},{id:'other-camp',x:2140,y:2050,radius:100,spawns:[{id:'stranger',type:'forestWolf',x:2140,y:2050,level:1}]}],bosses:[],towns:[]};
 const system=new MonsterSystem(scene,hero,()=>{},content);for(const m of system.monsters){m.hp=m.maxHp=1000;m.lastAbilityAt=1e9;m.lastHit=1e9;}
 const source=system.monsters.find(m=>m.id==='source');return{system,scene,hero,nodes,source};
}
function configure(m,config){m.kind={...m.kind,behaviorConfig:config};}
function beginGuard(f,now=1000){configure(f.source,{guard:{}});f.system.update(now,0);return f.source.aur203Tactics.guard;}

test('actual engine keeps unconfigured intent identity, exact precomputed damage and no tactical state',()=>{
 const f=setup(),m=f.source,intent=monsterIntent(m,f.hero,1000,{visible:true});assert.equal(f.system.tacticalIntent(m,1000,intent),intent);assert.deepEqual(f.system.alertPack(m,1000),[]);f.system.hit(m,17.25,1000);assert.equal(m.hp,982.75);assert.equal(m.aur203Tactics,undefined);f.system.destroy();
});
test('actual update uses finite retreat movement without ranged preferred-distance overriding its speed',()=>{
 const f=setup(),m=f.source;configure(m,{retreat:{}});m.kind={...m.kind,abilityConfig:{preferredDistance:250}};m.hp=200;
 const before=m.x;f.system.update(1000,.1);assert.ok(m.aur203Tactics.retreat);assert.ok(m.x>before);assert.ok(Math.abs(m.x-before-m.kind.speed*.85*.1)<.0001);assert.ok(Math.hypot(m.x-m.campX,m.y-m.campY)<m.campRadius);assert.equal(m.specialState,null,'A retreat does not concurrently start a movement attack');f.system.destroy();
});
test('retreat receives actual ground/flight occupancy and radius-aware obstacle LOS checks',()=>{
 const f=setup(),m=f.source;configure(m,{retreat:{}});m.hp=200;let ground=0,flight=0;f.scene.world.isWalkable=()=>{ground++;return false;};f.scene.world.isFlightWalkable=()=>{flight++;return true;};m.kind={...m.kind,movementProfile:'bat'};f.scene.obstacles=[{x:2160,y:2000,r:30,kind:'house'}];
 const intent={x:f.hero.x,y:f.hero.y,speed:90,engaged:true,visible:true};const retreat=f.system.tacticalIntent(m,1000,intent);assert.equal(retreat.aur203Tactic,'retreat');assert.ok(flight>0);assert.equal(ground,0);assert.ok(Math.abs(retreat.y-m.y)>20,'The flying retreat cannot cross a house');assert.equal(f.system.sight({...m,kind:m.kind},retreat,14),true);
 m.aur203Tactics.retreat=null;m.aur203Tactics.nextRetreatAt=0;f.scene.world.isFlightWalkable=()=>false;assert.equal(f.system.tacticalIntent(m,7000,intent),intent);f.system.destroy();
});
test('real guard shows a distinct warning before mitigation, suppresses attacks and exposes the special pose',()=>{
 const f=setup(),m=f.source,poses=[],banks=[];m.painted={update:(state,angle,dt,pose)=>{poses.push(state);banks.push(actorPose(state,angle,0,pose.progress).bank);},destroy(){}};m.paintedActive=true;m.lastAbilityAt=0;m.lastHit=0;
 const guard=beginGuard(f,10000),marker=guard.marker;assert.equal(marker.type,'circle');assert.equal(marker.args[3],0x76cbe4);assert.equal(marker.destroyCount,0);assert.equal(m.specialState,null);assert.equal(m.lastAbilityAt,0);assert.equal(poses.at(-1),'special');assert.equal(banks.at(-1),'attack','Guard must select a visible existing attack bank even long after the last hit');
 f.system.hit(m,100,10849);assert.equal(m.hp,900,'Windup provides no protection');f.system.update(10850,0);assert.equal(marker.destroyCount,1);f.system.hit(m,100,10850);assert.equal(m.hp,845,'Active guard modifies the actual hit once');
 f.system.hit(m,100,12650);assert.equal(m.hp,745,'Guard expiry cannot grant permanent mitigation');f.system.update(12650,0);assert.equal(m.aur203Tactics.guard,null);assert.equal(marker.destroyCount,1);f.system.destroy();
});
test('special attack, root/stun, return, safe area and hero death take priority over a new guard',()=>{
 for(const condition of ['special','stun','return','safe','death']){const f=setup(),m=f.source,guard=beginGuard(f),marker=guard.marker;
  if(condition==='special')m.specialState={ability:'pounce',target:{x:f.hero.x,y:f.hero.y},releaseAt:5000,marker:{destroy(){}}};
  if(condition==='stun')m.stunUntil=5000;
  if(condition==='return'){m.returning=true;m.x+=100;}
  if(condition==='safe')f.system.content.towns.push({region:'test',spawn:{x:f.hero.x,y:f.hero.y},safeRadius:100});
  if(condition==='death')f.hero.hp=0;
  f.system.update(1100,0);assert.equal(m.aur203Tactics.guard,null,condition);assert.equal(marker.destroyCount,1,condition);f.system.destroy();
 }
});
test('actual received hit alerts only local opt-in same-camp allies, with no ally damage or descriptor scan',()=>{
 const f=setup(),m=f.source,ally=f.system.monsters.find(m=>m.id==='ally'),stranger=f.system.monsters.find(m=>m.id==='stranger'),plain=f.system.monsters.find(m=>m.id==='plain');for(const actor of [m,ally,stranger])configure(actor,{pack:{}});
 Object.defineProperty(f.system.stream,'descriptors',{get(){throw Error('Must not scan all world descriptors');}});
 f.system.hit(m,10,1000);assert.ok(ally.aggroUntil>1000);assert.equal(ally.behaviorState,'chase');assert.equal(ally.hp,1000);assert.equal(stranger.aggroUntil,0);assert.equal(plain.aggroUntil,0);assert.equal(plain.hp,1000);
 ally.aggroUntil=0;f.system.hit(m,10,1100);assert.equal(ally.aggroUntil,0,'Pack alerts retain their cooldown');f.system.destroy();
});
test('same-camp assistance fails closed at actual obstacles or a safe hero position',()=>{
 for(const block of ['wall','safe']){const f=setup(),m=f.source,ally=f.system.monsters.find(m=>m.id==='ally');for(const actor of [m,ally])configure(actor,{pack:{}});
  if(block==='wall')f.scene.obstacles=[{x:2135,y:2000,r:12}];else f.system.content.towns.push({region:'test',spawn:{x:f.hero.x,y:f.hero.y},safeRadius:100});
  f.system.hit(m,10,1000);assert.equal(ally.aggroUntil,0,block);assert.equal(ally.hp,1000);f.system.destroy();
 }
});
test('hiding, unload, lethal hit and real scene teardown destroy owned guard markers exactly once',()=>{
 for(const action of ['hide','unload','kill','destroy']){const f=setup(),m=f.source,guard=beginGuard(f),marker=guard.marker;
  if(action==='hide')f.system.setMonsterVisible(m,false);else if(action==='unload')f.system.removeMonster(m);else if(action==='kill')f.system.hit(m,100000,1100);else f.system.destroy();
  assert.equal(m.aur203Tactics.guard,null,action);assert.equal(marker.destroyCount,1,action);if(action!=='destroy')f.system.destroy();assert.equal(marker.destroyCount,1,action+' cleanup is idempotent');
 }
});
test('active guard renderer references never enter the existing persisted health payload',()=>{
 const f=setup(),m=f.source;beginGuard(f);f.system.hit(m,10,1100);f.system.persistHealth(m,1100);const saved=f.hero.worldState.monsters[m.key];assert.ok(saved&&saved.hp===990);assert.ok(m.aur203Tactics.guard.marker.destroy instanceof Function);assert.doesNotThrow(()=>structuredClone(saved));assert.ok(Object.values(saved).every(value=>value===undefined||['number','boolean'].includes(typeof value)));assert.doesNotMatch(JSON.stringify(saved),/aur203|marker|guard/);f.system.destroy();
});
