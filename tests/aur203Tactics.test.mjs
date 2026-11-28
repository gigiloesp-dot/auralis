import test from 'node:test';
import assert from 'node:assert/strict';
import {monsterIntent,leashRadius} from '../js/monsters/monsterBehavior.js';
import {segmentDistanceSquared} from '../js/combat/geometry.js';
import {updateAur203Tactics,aur203IncomingDamage,alertAur203Pack,cancelAur203Tactics,AUR203_TACTIC_DEFAULTS} from '../js/monsters/aur203Tactics.js';
function monster(config={},overrides={}){return {id:'new-species-mob',campId:'new-camp',region:'forest',alive:true,x:0,y:0,homeX:0,homeY:0,campX:0,campY:0,campRadius:210,hp:20,maxHp:100,kind:{speed:100,behaviorConfig:config},...overrides};}
function context(m=monster({retreat:{}})){
 const hero={x:-100,y:0,hp:100},warnings=[];
 const intent={x:hero.x,y:hero.y,speed:100,engaged:true,visible:true};
 return {monster:m,hero,now:10000,intent,canOccupy:()=>true,canTraverse:()=>true,warn:warning=>{const marker={...warning,destroyed:false,destroy(){this.destroyed=true;}};warnings.push(marker);return marker;},warnings};
}
test('all unconfigured kinds retain exact intent identity, damage and state, including low HP and nearby allies',()=>{
 const m=monster();delete m.kind.behaviorConfig;const c=context(m),before=structuredClone(m);
 assert.equal(updateAur203Tactics(c),c.intent);assert.equal(aur203IncomingDamage(m,23,10000),23);
 assert.deepEqual(alertAur203Pack({monster:m,attacker:c.hero,now:10000,nearby:[monster({pack:{}})],canSee:()=>true}),[]);
 assert.deepEqual(m,before);assert.equal(c.warnings.length,0);
 for(const behaviorConfig of [{retreat:{enabled:false},guard:{enabled:false},pack:{enabled:false}},{retreat:true,guard:'yes',pack:[]}]){
  m.kind.behaviorConfig=behaviorConfig;const prior=structuredClone(m);assert.equal(updateAur203Tactics(c),c.intent);assert.deepEqual(m,prior);
 }
});
test('low HP retreat increases actual target distance while staying inside camp and home leash',()=>{
 const c=context();const normal=monsterIntent(c.monster,c.hero,c.now,{visible:true});assert.equal(normal.engaged,true);
 c.intent=normal;const next=updateAur203Tactics(c);
 assert.equal(next.aur203Tactic,'retreat');assert.ok(Math.hypot(next.x-c.hero.x,next.y-c.hero.y)>100);
 assert.ok(Math.hypot(next.x,next.y)<=c.monster.campRadius-8);assert.ok(Math.hypot(next.x-c.monster.homeX,next.y-c.monster.homeY)<=leashRadius(c.monster)-5);
 assert.equal(next.engaged,true);assert.equal(next.speed,85);assert.deepEqual([normal.x,normal.y],[-100,0]);
});
test('retreat uses real occupancy and traversability callbacks instead of crossing a blocking obstacle',()=>{
 const c=context(),obstacle={x:50,y:0},radius=25;
 c.canOccupy=(x,y)=>Math.hypot(x-obstacle.x,y-obstacle.y)>=radius;
 c.canTraverse=(from,to)=>segmentDistanceSquared(from,to,obstacle)>=radius**2;
 const next=updateAur203Tactics(c);assert.equal(next.aur203Tactic,'retreat');assert.notEqual(next.y,0,'straight retreat is blocked');assert.ok(c.canTraverse(c.monster,next));assert.ok(c.canOccupy(next.x,next.y));
});
test('blocked or missing movement callbacks fail closed and probes do not repeat every frame',()=>{
 const c=context();let probes=0;c.canOccupy=()=>{probes++;return false;};
 assert.equal(updateAur203Tactics(c),c.intent);const attempted=probes;assert.ok(attempted>0&&attempted<=21);
 for(let i=0;i<100;i++){c.now++;assert.equal(updateAur203Tactics(c),c.intent);}
 assert.equal(probes,attempted);assert.equal(c.monster.aur203Tactics.retreat,undefined);
 const missing=context();delete missing.canOccupy;delete missing.canTraverse;assert.equal(updateAur203Tactics(missing),missing.intent);
});
test('small camps shorten the retreat and positions near the leash cannot escape its boundary',()=>{
 const small=context(monster({retreat:{}},{campRadius:70}));const next=updateAur203Tactics(small);assert.equal(next.aur203Tactic,'retreat');assert.ok(Math.hypot(next.x,next.y)<=62);
 const leashed=context(monster({retreat:{}},{homeX:-350}));assert.equal(updateAur203Tactics(leashed),leashed.intent,'all away targets outside355-unit home clearance are rejected');
});
test('retreat ends with a bounded pause/cooldown and healing or lost combat clears it',()=>{
 const c=context();const next=updateAur203Tactics(c);Object.assign(c.monster,{x:next.x,y:next.y});c.now+=100;
 assert.equal(updateAur203Tactics(c).aur203Tactic,'retreat-pause');c.now+=451;assert.equal(updateAur203Tactics(c),c.intent,'cooldown allows normal pursuit instead of indefinite fleeing');
 c.now+=6000;assert.equal(updateAur203Tactics(c).aur203Tactic,'retreat');c.monster.hp=50;assert.equal(updateAur203Tactics(c),c.intent);assert.equal(c.monster.aur203Tactics.retreat,null);
 c.monster.hp=20;c.now+=6000;updateAur203Tactics(c);c.intent.engaged=false;assert.equal(updateAur203Tactics(c),c.intent);assert.equal(c.monster.aur203Tactics.retreat,null);
});
test('defender warns before mitigation, then guards for a finite window and preserves cooldown',()=>{
 const c=context(monster({guard:{}}));const start=updateAur203Tactics(c);
 assert.equal(start.aur203Tactic,'guard-windup');assert.equal(start.speed,0);assert.equal(c.warnings.length,1);assert.equal(c.warnings[0].duration,850);
 assert.equal(aur203IncomingDamage(c.monster,20,c.now),20);c.now+=849;assert.equal(aur203IncomingDamage(c.monster,20,c.now),20);
 c.now++;assert.equal(updateAur203Tactics(c).aur203Tactic,'guard');assert.equal(c.warnings[0].destroyed,true);assert.equal(aur203IncomingDamage(c.monster,20,c.now),11);
 assert.equal(aur203IncomingDamage(c.monster,.5,c.now),.5,'mitigation cannot increase fractional damage');assert.equal(aur203IncomingDamage(c.monster,0,c.now),0);
 c.now+=1800;assert.equal(aur203IncomingDamage(c.monster,20,c.now),20);assert.equal(updateAur203Tactics(c),c.intent);assert.equal(c.monster.aur203Tactics.guard,null);
 c.now+=100;assert.equal(updateAur203Tactics(c),c.intent);assert.equal(c.warnings.length,1);c.now+=7500;assert.equal(updateAur203Tactics(c).aur203Tactic,'guard-windup');assert.equal(c.warnings.length,2);
});
test('guard cannot mitigate without a rendered warning or against a lost/distant target',()=>{
 for(const change of [c=>delete c.warn,c=>c.warn=()=>null,c=>c.intent.visible=false,c=>c.hero.x=-250]){
  const c=context(monster({guard:{}}));change(c);assert.equal(updateAur203Tactics(c),c.intent);assert.equal(aur203IncomingDamage(c.monster,20,c.now+1000),20);
 }
});
test('safety, death, hero death and return immediately cancel warned guard and retreat state',()=>{
 for(const stop of [c=>c.safe=true,c=>c.monster.alive=false,c=>c.hero.hp=0,c=>c.monster.returning=true,c=>c.intent.returning=true,c=>c.intent.engaged=false]){
  const c=context(monster({guard:{}}));updateAur203Tactics(c);stop(c);c.now+=900;assert.equal(updateAur203Tactics(c),c.intent);assert.equal(c.warnings[0].destroyed,true);assert.equal(c.monster.aur203Tactics.guard,null);assert.equal(aur203IncomingDamage(c.monster,20,c.now),20);
 }
 const c=context();updateAur203Tactics(c);c.safe=true;updateAur203Tactics(c);assert.equal(c.monster.aur203Tactics.retreat,null);assert.equal(c.monster.aur203Tactics.retreatPauseUntil,0);
});
test('retreat takes priority over a previous guard, destroying its marker and mitigation',()=>{
 const c=context(monster({guard:{},retreat:{}},{hp:90}));updateAur203Tactics(c);c.monster.hp=20;c.now+=900;
 assert.equal(updateAur203Tactics(c).aur203Tactic,'retreat');assert.equal(c.warnings[0].destroyed,true);assert.equal(aur203IncomingDamage(c.monster,20,c.now),20);
 cancelAur203Tactics(c.monster);assert.equal(c.monster.aur203Tactics.retreat,null);
});
test('pack alert affects only opted-in living same-camp allies with two visible lines, without damaging any creature',()=>{
 const source=monster({pack:{}}),hero={x:100,y:0,hp:100};
 const valid=monster({pack:{}},{id:'valid',x:30}),otherCamp=monster({pack:{}},{id:'othercamp',x:20,campId:'other'}),dead=monster({pack:{}},{id:'dead',x:40,alive:false}),returning=monster({pack:{}},{id:'return',x:40,returning:true}),notOpted=monster({}, {id:'old',x:50}),hidden=monster({pack:{}},{id:'hidden',x:50}),far=monster({pack:{}},{id:'far',x:290}),otherRegion=monster({pack:{}},{id:'otherregion',x:20,region:'north'});
 const nearby=[source,valid,otherCamp,dead,returning,notOpted,hidden,far,otherRegion,valid],beforeHP=nearby.map(m=>m.hp);
 const alerted=alertAur203Pack({monster:source,attacker:hero,now:10000,nearby,canSee:(from,to)=>from!==hidden&&to!==hidden});
 assert.deepEqual(alerted,[valid]);assert.equal(valid.behaviorState,'chase');assert.equal(valid.aggroUntil,18000);assert.equal(valid.targetX,100);assert.deepEqual(nearby.map(m=>m.hp),beforeHP);
 for(const m of [otherCamp,dead,returning,notOpted,hidden,far,otherRegion])assert.equal(m.aggroUntil,undefined);
});
test('pack respects individual home leash, safe/dead source conditions, visibility and alert cooldown',()=>{
 const source=monster({pack:{}}),ally=monster({pack:{}},{x:30}),hero={x:500,y:0,hp:100},args={monster:source,attacker:hero,now:10000,nearby:[ally],canSee:()=>true};
 assert.deepEqual(alertAur203Pack(args),[]);hero.x=100;args.now+=1300;assert.deepEqual(alertAur203Pack({...args,safe:true}),[]);assert.deepEqual(alertAur203Pack({...args,canSee:()=>false}),[]);
 args.now+=1300;assert.deepEqual(alertAur203Pack(args),[ally]);const deadline=ally.aggroUntil;args.now+=100;assert.deepEqual(alertAur203Pack(args),[]);assert.equal(ally.aggroUntil,deadline);
 source.alive=false;args.now+=1300;assert.deepEqual(alertAur203Pack(args),[]);
});
test('pack scans at most64 local candidates, alerts at most configured maximum and never searches a full-world list',()=>{
 const source=monster({pack:{maxAllies:99}}),hero={x:100,y:0,hp:100};
 const allies=Array.from({length:90},(_,i)=>monster({pack:{}},{id:'ally-'+i,x:30+i*.1}));
 assert.equal(alertAur203Pack({monster:source,attacker:hero,now:10000,nearby:allies,canSee:()=>true}).length,6);
 const second=monster({pack:{}}),rejects=Array.from({length:64},(_,i)=>monster({pack:{}},{id:'rejected-'+i,campId:'another'}));rejects.push(monster({pack:{}},{id:'beyond-cap',x:20}));
 const capped=new Proxy(rejects,{get(target,key){if(key==='64')throw Error('Must not inspect the65th candidate');return target[key];}});
 assert.deepEqual(alertAur203Pack({monster:second,attacker:hero,now:10000,nearby:capped,canSee:()=>true}),[]);
});
test('technical settings clamp extremes so configuration cannot grant immunity, instant guard or map-wide assistance',()=>{
 const c=context(monster({guard:{windupMs:0,durationMs:999999,damageMultiplier:0,cooldownMs:0}}));updateAur203Tactics(c);
 assert.equal(c.warnings[0].duration,450);assert.equal(aur203IncomingDamage(c.monster,20,c.now+449),20);assert.equal(aur203IncomingDamage(c.monster,20,c.now+450),6);
 assert.equal(aur203IncomingDamage(c.monster,20,c.now+3450),20);assert.equal(c.monster.aur203Tactics.nextGuardAt,16450);
 assert.equal(AUR203_TACTIC_DEFAULTS.pack.maxCandidates,64);
});
test('invalid clocks or attacker coordinates cannot create immortal guard or corrupt pack threat state',()=>{
 const c=context(monster({guard:{}}));updateAur203Tactics(c);assert.equal(aur203IncomingDamage(c.monster,20,NaN),20);
 c.now=NaN;assert.equal(updateAur203Tactics(c),c.intent);
 const source=monster({pack:{}}),ally=monster({pack:{}},{x:30}),before=structuredClone(source);
 assert.deepEqual(alertAur203Pack({monster:source,attacker:{hp:100,x:NaN,y:0},now:10000,nearby:[ally],canSee:()=>true}),[]);assert.deepEqual(source,before);assert.equal(ally.aggroUntil,undefined);
});
