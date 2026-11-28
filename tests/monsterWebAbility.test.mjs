import test from 'node:test';
import assert from 'node:assert/strict';
import {monsterKind} from '../js/monsters/monsters.js';
import {movementProfile,tickMonsterAbility,applyHeroAffliction,tickHeroAfflictions,heroMovementMultiplier,WEB_ABILITY_CONFIG} from '../js/monsters/movementProfiles.js';
import {segmentDistanceSquared} from '../js/combat/geometry.js';
function fixture(id='forest-species-048'){
 const monster={id,kind:monsterKind({type:'spider',level:8,speciesId:id}),alive:true,x:100,y:100,homeX:100,homeY:100,attack:20,abilityStep:1};
 const hero={x:220,y:100,hp:200},shots=[],warnings=[];
 const context={monster,hero,now:20000,engaged:true,safe:false,canSee:()=>true,shoot:shot=>shots.push(shot),warn:config=>{const marker={...config,destroyed:false,destroy(){this.destroyed=true;}};warnings.push(marker);return marker;}};
 return {context,monster,hero,shots,warnings};
}
test('both registered web spiders dispatch their actual second ability with a timed slowing projectile after a warning',()=>{
 for(const id of ['forest-species-048','forest-species-053']){
  const f=fixture(id),profile=movementProfile(f.monster.kind);
  assert.deepEqual(profile.abilityPattern,['venom','web']);
  assert.equal(tickMonsterAbility(f.context).ability,'web');assert.equal(f.shots.length,0);
  assert.equal(f.warnings[0].kind,'web');assert.equal(f.warnings[0].duration,profile.windup);
  f.context.now+=profile.windup-1;assert.equal(tickMonsterAbility(f.context).busy,true);assert.equal(f.shots.length,0);
  f.context.now++;assert.equal(tickMonsterAbility(f.context).fired,'web');assert.equal(f.shots.length,1);assert.equal(f.warnings[0].destroyed,true);
  assert.deepEqual(f.shots[0].status,{type:'slow',multiplier:WEB_ABILITY_CONFIG.slowMultiplier,duration:WEB_ABILITY_CONFIG.slowDuration});
  assert.equal(f.shots[0].damage,20*profile.multiplier);assert.equal(f.shots[0].magic,true);assert.equal(f.shots[0].speed,185);assert.equal(f.monster.abilityStep,2);
  assert.equal(heroMovementMultiplier(f.hero,f.context.now),1,'dispatch alone never applies an affliction');
 }
});
test('web slow uses the shared hero movement pipeline and expires without poison damage or a persistent root',()=>{
 const f=fixture();tickMonsterAbility(f.context);f.context.now+=600;tickMonsterAbility(f.context);
 const status=f.shots[0].status;applyHeroAffliction(f.hero,status,21000);
 assert.equal(heroMovementMultiplier(f.hero,21001),.55);assert.equal(heroMovementMultiplier(f.hero,22799),.55);
 tickHeroAfflictions(f.hero,22000,()=>assert.fail('Web cannot apply poison damage'));assert.equal(f.hero.hp,200);
 assert.equal(heroMovementMultiplier(f.hero,22800),1);tickHeroAfflictions(f.hero,22800,()=>assert.fail());assert.deepEqual(f.hero.monsterAfflictions,{});
 applyHeroAffliction(f.hero,status,23000);f.hero.hp=0;tickHeroAfflictions(f.hero,23001,()=>assert.fail());assert.deepEqual(f.hero.monsterAfflictions,{});
});
test('web aims at the telegraphed snapshot, so moving perpendicular during windup avoids its straight projectile path',()=>{
 const f=fixture();tickMonsterAbility(f.context);f.hero.y=180;f.context.now+=600;tickMonsterAbility(f.context);
 const shot=f.shots[0];assert.deepEqual([shot.targetX,shot.targetY],[220,100]);
 const angle=Math.atan2(shot.targetY-shot.y,shot.targetX-shot.x),end={x:shot.x+Math.cos(angle)*shot.range,y:shot.y+Math.sin(angle)*shot.range};
 assert.ok(segmentDistanceSquared(shot,end,f.hero)>21**2);assert.equal(heroMovementMultiplier(f.hero,f.context.now),1);
});
test('lost LOS, safety, lost combat and death cancel the warned web without a phantom projectile',()=>{
 for(const stop of ['los','safe','engaged','death']){
  const f=fixture();tickMonsterAbility(f.context);
  if(stop==='los')f.context.canSee=()=>false;
  if(stop==='safe')f.context.safe=true;
  if(stop==='engaged')f.context.engaged=false;
  if(stop==='death')f.monster.alive=false;
  f.context.now+=600;assert.equal(tickMonsterAbility(f.context).busy,false);assert.equal(f.monster.specialState,null);
  assert.equal(f.warnings[0].destroyed,true);assert.equal(f.shots.length,0);assert.equal(f.monster.abilityStep,1,'cancellation must not claim a successful release');
 }
});
test('web retains inherited cooldown and alternating venom instead of releasing repeated slows each update',()=>{
 const f=fixture();const p=movementProfile(f.monster.kind);tickMonsterAbility(f.context);f.context.now+=p.windup;tickMonsterAbility(f.context);
 f.context.now+=1;assert.equal(tickMonsterAbility(f.context).busy,false);assert.equal(f.shots.length,1);
 f.context.now+=p.cooldown;assert.equal(tickMonsterAbility(f.context).ability,'venom');f.context.now+=p.windup;
 assert.equal(tickMonsterAbility(f.context).fired,'venom');assert.equal(f.shots.length,2);assert.equal(f.shots[1].status.type,'poison');
 assert.equal(f.shots[1].speed,185);assert.equal(f.shots[1].damage,20*p.multiplier);
});
