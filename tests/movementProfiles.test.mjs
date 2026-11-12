import test from 'node:test';
import assert from 'node:assert/strict';
import {MONSTER_TYPES,monsterKind} from '../js/monsters/monsters.js';
import {getRegionContent} from '../js/world/regionContent.js';
import {moveWithCollision} from '../js/combat/geometry.js';
import {movementProfile,blockingObstacles,tickMonsterAbility,applyHeroAffliction,tickHeroAfflictions,heroMovementMultiplier,cancelMonsterAbility} from '../js/monsters/movementProfiles.js';
function context(type,changes={}){
 const monster={id:'test',kind:monsterKind({type,level:MONSTER_TYPES[type].level}),alive:true,x:100,y:100,homeX:100,homeY:100,attack:20},hero={x:220,y:100,hp:200};
 const events={damage:[],shots:[],effects:[],warnings:[]};
 const ctx={monster,hero,now:20000,dt:.1,engaged:true,safe:false,canSee:()=>true,canOccupy:(x,y)=>x>=14&&y>=14&&x<=386&&y<=386,
  move(x,y,length){moveWithCollision(monster,x,y,length,[],14,(x,y)=>ctx.canOccupy(x,y,14));},
  damage(attack,magic,status){hero.hp-=attack;events.damage.push({attack,magic,status});if(status)applyHeroAffliction(hero,status,ctx.now);},
  shoot(shot){events.shots.push(shot);},warn(config){const marker={...config,destroyed:false,destroy(){this.destroyed=true;}};events.warnings.push(marker);return marker;},effect(e){events.effects.push(e);},...changes};
 return {ctx,monster,hero,events};
}
test('predator leaps at the telegraphed position, can be dodged, then strikes a target that stays',()=>{
 const {ctx,monster,hero,events}=context('forestWolf');assert.equal(tickMonsterAbility(ctx).busy,true);assert.equal(events.damage.length,0);
 ctx.now+=400;assert.equal(tickMonsterAbility(ctx).busy,true);hero.x=370;ctx.now+=30;tickMonsterAbility(ctx);assert.ok(monster.x>200);assert.equal(hero.hp,200,'moving out of a pounce avoids the hit');assert.equal(events.warnings[0].destroyed,true);
 monster.x=100;hero.x=230;ctx.now+=7000;tickMonsterAbility(ctx);ctx.now+=430;tickMonsterAbility(ctx);assert.equal(events.damage.length,1);assert.equal(events.damage[0].attack,25);assert.ok(monster.x>220);assert.equal(events.effects.at(-1).kind,'pounce');
});
test('flying movement passes low rocks while houses, world bounds and dungeon floors remain solid',()=>{
 const obstacles=[{x:160,y:100,r:20},{x:300,y:100,r:50,kind:'house'}],ground={x:100,y:100},flying={x:100,y:100};
 moveWithCollision(ground,360,100,260,blockingObstacles(obstacles,MONSTER_TYPES.forestWolf),14);moveWithCollision(flying,360,100,260,blockingObstacles(obstacles,MONSTER_TYPES.forestBat),14);
 assert.ok(ground.x<130);assert.ok(flying.x>230&&flying.x<240,'flight over the rock ends before the house');
 const floor={x:100,y:100};moveWithCollision(floor,380,100,300,[],14,(x,y)=>x<200&&y>20);assert.ok(floor.x<200,'a flight-specific floor callback still enforces closed dungeon walls');assert.ok(movementProfile(MONSTER_TYPES.forestBat).elevation>0);
});
test('a bat dives with legal movement and a crawler emits a real poison projectile',()=>{
 for(const [type,ability]of [['forestBat','dive'],['spider','venom']]){
  const {ctx,monster,events}=context(type);tickMonsterAbility(ctx);ctx.now+=1200;const result=tickMonsterAbility(ctx);assert.equal(result.fired,ability);
  if(type==='forestBat'){assert.ok(monster.x>200);assert.equal(events.damage.length,1);}else{assert.equal(events.shots.length,1);assert.equal(events.shots[0].magic,true);assert.equal(events.shots[0].status.type,'poison');assert.ok(events.shots[0].speed>0);}
 }
});
test('heavy stomp warns, shakes the ground and damages only targets remaining in the area',()=>{
 const {ctx,hero,events}=context('frostGolem');hero.x=180;tickMonsterAbility(ctx);assert.equal(events.damage.length,0);assert.equal(events.warnings[0].kind,'stomp');ctx.now+=1200;tickMonsterAbility(ctx);assert.equal(events.damage[0].attack,33);assert.equal(events.effects[0].kind,'stomp');
 const dodge=context('frostGolem');dodge.hero.x=180;tickMonsterAbility(dodge.ctx);dodge.hero.x=350;dodge.ctx.now+=1200;tickMonsterAbility(dodge.ctx);assert.equal(dodge.events.damage.length,0);
});
test('elementals blink to valid visible terrain and launch magic, never through a closed wall',()=>{
 const valid=context('iceElemental');tickMonsterAbility(valid.ctx);valid.ctx.now+=1000;tickMonsterAbility(valid.ctx);assert.ok(Math.hypot(valid.monster.x-100,valid.monster.y-100)>50);assert.equal(valid.events.effects[0].kind,'blink');assert.equal(valid.events.shots[0].magic,true);
 const blocked=context('iceElemental');blocked.ctx.canSee=(from,to)=>to===blocked.hero;tickMonsterAbility(blocked.ctx);blocked.ctx.now+=1000;tickMonsterAbility(blocked.ctx);assert.deepEqual([blocked.monster.x,blocked.monster.y],[100,100]);assert.equal(blocked.events.effects.length,0);
});
test('cleaves follow the snapshot facing rather than an arbitrary east direction',()=>{
 const {ctx,hero,events}=context('forestOrc');hero.x=100;hero.y=175;tickMonsterAbility(ctx);ctx.now+=700;tickMonsterAbility(ctx);assert.equal(events.damage.length,1);
 const dodge=context('forestOrc');dodge.hero.x=100;dodge.hero.y=175;tickMonsterAbility(dodge.ctx);dodge.hero.y=25;dodge.ctx.now+=700;tickMonsterAbility(dodge.ctx);assert.equal(dodge.events.damage.length,0);
});
test('poison causes timed damage, frost changes actual movement multiplier and death clears both',()=>{
 const hero={hp:100};applyHeroAffliction(hero,{type:'poison',damage:5,duration:4000},0);applyHeroAffliction(hero,{type:'slow',multiplier:.55,duration:2200},0);
 const damage=value=>hero.hp-=value;tickHeroAfflictions(hero,900,damage);assert.equal(hero.hp,100);assert.equal(heroMovementMultiplier(hero,1000),.55);
 tickHeroAfflictions(hero,1100,damage);tickHeroAfflictions(hero,2200,damage);assert.equal(hero.hp,90);assert.equal(heroMovementMultiplier(hero,2200),1);tickHeroAfflictions(hero,4000,damage);assert.equal(hero.hp,90);assert.deepEqual(hero.monsterAfflictions,{});
 hero.hp=0;applyHeroAffliction(hero,{type:'poison',damage:20,duration:4000},5000);tickHeroAfflictions(hero,6000,damage);assert.equal(hero.hp,0);
});
test('safe zones, lost sight, death and loss of combat cancel abilities without damaging the hero',()=>{
 const {ctx,events,monster}=context('forestWolf');tickMonsterAbility(ctx);ctx.safe=true;ctx.now+=1000;assert.equal(tickMonsterAbility(ctx).busy,false);assert.equal(events.damage.length,0);assert.equal(events.warnings[0].destroyed,true);
 ctx.safe=false;ctx.now+=10000;tickMonsterAbility(ctx);monster.alive=false;ctx.now+=1000;tickMonsterAbility(ctx);assert.equal(monster.specialState,null);assert.equal(events.damage.length,0);cancelMonsterAbility(monster);
});
test('all23 regional species are reachable while exact encounter budgets and saved IDs remain stable',()=>{
 const types=new Set(),themes=new Set();let camps=0,spawns=0,bosses=0;
 for(const region of ['forest','north','ancient']){const c=getRegionContent(region);camps+=c.camps.length;spawns+=c.camps.reduce((n,c)=>n+c.spawns.length,0);for(const camp of c.camps){types.add(camp.type);assert.ok(MONSTER_TYPES[camp.type].level<=camp.level);for(const spawn of camp.spawns)assert.ok(spawn.id.startsWith(region+'-'));}for(const b of c.bosses){bosses++;assert.ok(b.id.startsWith(region+'-'+b.bossType+'-'));themes.add(b.bossTheme);assert.equal(monsterKind(b).bossTheme,b.bossTheme);}}
 assert.equal(types.size,23);assert.equal(camps,254);assert.equal(spawns,1145);assert.equal(bosses,18);assert.equal(themes.size,18);
 const first=getRegionContent('forest').camps[0];assert.equal(first.id,'forest-starter-wolves');assert.equal(first.type,'forestWolf');assert.deepEqual(first.spawns.map(s=>s.id),Array.from({length:8},(_,i)=>'forest-starter-wolf-'+i));
});
