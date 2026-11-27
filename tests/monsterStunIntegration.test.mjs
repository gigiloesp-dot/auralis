import test from 'node:test';
import assert from 'node:assert/strict';
import {applyHeroAffliction,tickHeroAfflictions,heroMovementMultiplier,tickMonsterAbility} from '../js/monsters/movementProfiles.js';
import {isMonsterStunned,cancelMonsterStun} from '../js/combat/monsterStun.js';
import {prepareSkill,commitSkill} from '../js/combat/skillRuntime.js';
import {temporaryEffects} from '../js/ui/temporaryEffects.js';
import {createCharacter} from '../js/characters/Character.js';
import {usePotion} from '../js/systems/potions.js';
import {AttackCycle} from '../js/combat/attackTiming.js';
import {MONSTER_TYPES} from '../js/monsters/monsters.js';

const classes=['warrior','paladin','archer','mage','assassin','cannoneer'];
function stomp(config={stunOnStomp:700}){
 const hero={hp:100,x:130,y:100},monster={alive:true,x:100,y:100,attack:5,kind:{movementProfile:'heavy',abilityConfig:{windup:1100,...config}}},hits=[],warnings=[];
 const ctx={hero,monster,now:10000,engaged:true,safe:false,canSee:()=>true,warn:w=>{warnings.push(w);return {destroy(){}};},damage:(attack,magic,status)=>{hits.push({attack,magic,status});hero.hp-=attack;applyHeroAffliction(hero,status,ctx.now);}};
 return {hero,monster,ctx,hits,warnings};
}
test('opt-in stomp applies stun only after full telegraph and a real hit; legacy stomp stays unchanged',()=>{
 const s=stomp();assert.equal(tickMonsterAbility(s.ctx).busy,true);assert.equal(s.warnings[0].duration,1100);s.ctx.now+=1099;tickMonsterAbility(s.ctx);assert.equal(s.hits.length,0);s.ctx.now++;tickMonsterAbility(s.ctx);
 assert.equal(s.hits.length,1);assert.deepEqual(s.hits[0].status,{type:'stun',duration:700});assert.equal(isMonsterStunned(s.hero,s.ctx.now),true);assert.equal(Object.hasOwn(s.hero,'monsterAfflictions'),false);
 const legacy=stomp({});tickMonsterAbility(legacy.ctx);legacy.ctx.now+=1100;tickMonsterAbility(legacy.ctx);assert.equal(legacy.hits[0].status,null);assert.equal(isMonsterStunned(legacy.hero,legacy.ctx.now),false);
 const first20=new Set(['aur203ChestnutCrab','aur203ReedHeron','aur203LanternSnail','aur203AcornHopper','aur203Sundew','aur203MossToad','aur203AmberDragonfly','aur203FernNewt','aur203RimeWalrus','aur203PowderMuskox','aur203ObsidianCentipede','aur203CrystalJelly','aur203PorcelainBellWalker','aur203MossAxolotl','aur203PrismCuttlefish','aur203ScrollTripod','aur203SandstoneTrilobite','aur203GlassJerboa','aur203PitcherCactus','aur203DuneSailray']);
 assert.ok(Object.entries(MONSTER_TYPES).filter(([id])=>!id.startsWith('aur203')||first20.has(id)).every(([,kind])=>!kind.abilityConfig?.stunOnStomp),'legacy and first20 species have no opt-in');
});
test('dodging, blocked LOS, safe area, lost engagement and death prevent warned stomp stun',()=>{
 for(const change of [s=>s.hero.x=400,s=>s.ctx.canSee=()=>false,s=>s.ctx.safe=true,s=>s.ctx.engaged=false,s=>s.hero.hp=0,s=>s.monster.alive=false]){
  const s=stomp();tickMonsterAbility(s.ctx);change(s);s.ctx.now+=1100;tickMonsterAbility(s.ctx);assert.equal(s.hits.length,0);assert.equal(isMonsterStunned(s.hero,s.ctx.now),false);assert.equal(s.monster.specialState,null);
 }
});
test('stun stops real movement multiplier then restores ongoing slow; expiry and immunity use simulation clock',()=>{
 const h={hp:100};applyHeroAffliction(h,{type:'slow',multiplier:.55,duration:3000},0);applyHeroAffliction(h,{type:'stun',duration:700},0);
 for(let i=0;i<50;i++){tickHeroAfflictions(h,0,()=>assert.fail());assert.equal(heroMovementMultiplier(h,0),0);}
 assert.equal(heroMovementMultiplier(h,699),0);assert.equal(heroMovementMultiplier(h,700),.55);assert.equal(applyHeroAffliction(h,{type:'stun',duration:800},700),false);
 assert.equal(heroMovementMultiplier(h,1700),.55);assert.equal(applyHeroAffliction(h,{type:'stun',duration:800},1700),true);h.hp=0;tickHeroAfflictions(h,1701,()=>{});h.hp=100;assert.equal(isMonsterStunned(h,1701),false);
});
test('all six real skill APIs block before MP/cooldown use and potions remain usable',()=>{
 for(const classId of classes){
  const hero=createCharacter({classId,level:56,hp:40,mp:50,learnedSkills:{[classId+'_0']:1}}),cooldowns=new Map();
  const id=classId+'_0',beforeMP=hero.mp;applyHeroAffliction(hero,{type:'stun',duration:700},0);
  const blocked=prepareSkill(hero,id,0,cooldowns);assert.deepEqual(blocked,{ok:false,reason:'stun'});assert.equal(hero.mp,beforeMP);assert.equal(cooldowns.size,0);
  assert.equal(usePotion(hero,'hp',0,{}),true);assert.equal(isMonsterStunned(hero,0),true);
  const cast=prepareSkill(hero,id,700,cooldowns);assert.equal(cast.ok,true);commitSkill(hero,cast,700,cooldowns);assert.equal(hero.mp,beforeMP-cast.skill.mana);assert.ok(cooldowns.get(id)>700);
 }
});
test('HUD shows only active localized stun, never post-stun immunity, and old heroes have no extra effects',()=>{
 for(const language of ['ru','en','es']){
  const h=createCharacter({});assert.deepEqual(temporaryEffects(h,{},0,language),[]);applyHeroAffliction(h,{type:'stun',duration:700},0);
  const effects=temporaryEffects(h,{},0,language);assert.equal(effects.length,1);assert.equal(effects[0].id,'affliction-stun');assert.equal(effects[0].time,'1');assert.ok(effects[0].iconSvg);assert.equal(effects[0].negative,true);
  assert.deepEqual(temporaryEffects(h,{},700,language),[]);cancelMonsterStun(h);
 }
});

// Run the actual scene update API with a minimal render/UI harness. No replacement
// combat loop is used: the real AttackCycle and skill/movement helpers run above.
globalThis.Phaser??={Scene:class{}};
const {WorldScene}=await import('../js/world/WorldScene.js');
function sceneHarness(){
 const hero=createCharacter({hp:100,mp:50}),events={hits:0,move:0},controls={axis:{x:1,y:0},attacking:false,pressed:false,consumeAttack(){const p=this.pressed;this.pressed=false;return p;},reset(){this.attacking=false;this.pressed=false;}};
 const chain={setPosition(){return this;},setDepth(){return this;}},noop=()=>{};
 const scene={hero,playNow:0,lastSave:0,lastHud:100000,axis:controls.axis,controls,attackCycle:new AttackCycle(),facing:0,world:{update:noop,tickTerrain:noop,move:(axis,speed,dt)=>{hero.x+=speed*dt;events.move+=speed*dt;return 0;}},npcPanel:{update:noop},storagePanel:{update:noop},dungeonPanel:{update:noop},interactions:{update:noop},groundLoot:{update:noop},exitPortal:{update:noop},panelsOpen:()=>false,project:(x,y)=>({x,y}),depthAt:()=>0,body:chain,shadow:chain,rig:{update:noop},monsters:{attack(){events.hits++;},update:noop},updateTargetPanel:noop,save:noop,refreshHud:noop};
 return {scene,hero,controls,events,step:delta=>WorldScene.prototype.update.call(scene,scene.playNow+delta,delta)};
}
test('actual scene loop discards blocked press and pending impact without moving, then resumes fresh held attacks',()=>{
 const oldWindow=globalThis.window,oldDocument=globalThis.document;globalThis.window={innerWidth:844,innerHeight:390};globalThis.document={hidden:false};
 try{
  const {scene,hero,controls,events,step}=sceneHarness();controls.pressed=true;applyHeroAffliction(hero,{type:'stun',duration:700},0);step(40);assert.equal(scene.attackCycle.sequence,0);assert.equal(controls.pressed,false);assert.equal(events.move,0);
  for(let i=0;i<20;i++)step(40);assert.equal(scene.attackCycle.sequence,0,'blocked tap never queues an attack');assert.equal(events.hits,0);
  cancelMonsterStun(hero);scene.attackCycle.start(scene.playNow,hero);applyHeroAffliction(hero,{type:'stun',duration:700},scene.playNow);for(let i=0;i<33;i++)step(40);assert.equal(events.hits,0,'pending melee impact consumed during stun must never hit later');
  controls.attacking=true;step(40);assert.equal(scene.attackCycle.sequence,2,'held input starts a fresh allowed attack');assert.ok(events.move>0);
 }finally{if(oldWindow===undefined)delete globalThis.window;else globalThis.window=oldWindow;if(oldDocument===undefined)delete globalThis.document;else globalThis.document=oldDocument;}
});
const {WorldRuntime}=await import('../js/world/WorldRuntime.js');
test('actual respawn API clears transient stun and immunity before restoring resources',()=>{
 const hero=createCharacter({hp:80,region:'forest'});applyHeroAffliction(hero,{type:'stun',duration:800},0);let loads=0,resets=0;
 const runtime={scene:{hero,controls:{reset(){resets++;}}},content:{},load(){loads++;}};
 WorldRuntime.prototype.respawn.call(runtime);assert.equal(isMonsterStunned(hero,0),false);assert.ok(hero.hp>0);assert.equal(loads,1);assert.equal(resets,1);assert.equal(applyHeroAffliction(hero,{type:'stun',duration:200},0),true,'explicit lifecycle reset also clears immunity');
});
test('actual hidden/orientation/panel early returns pause the stun simulation clock and release input',()=>{
 const oldWindow=globalThis.window,oldDocument=globalThis.document;globalThis.window={innerWidth:844,innerHeight:390};globalThis.document={hidden:false};
 try{
  for(const mode of ['hidden','orientation','panel']){
   const {scene,hero,controls,step}=sceneHarness();controls.attacking=true;applyHeroAffliction(hero,{type:'stun',duration:700},0);
   if(mode==='hidden')document.hidden=true;if(mode==='orientation')window.innerHeight=1000;if(mode==='panel')scene.panelsOpen=()=>true;
   for(let i=0;i<30;i++)step(40);assert.equal(scene.playNow,0);assert.equal(isMonsterStunned(hero,0),true);assert.equal(controls.attacking,false);
   document.hidden=false;window.innerHeight=390;
  }
 }finally{if(oldWindow===undefined)delete globalThis.window;else globalThis.window=oldWindow;if(oldDocument===undefined)delete globalThis.document;else globalThis.document=oldDocument;}
});
const {MonsterSystem}=await import('../js/monsters/MonsterSystem.js');
test('direct skill boundary rejects stun before target lookup or any resource/animation write',()=>{
 for(const classId of classes){
  const hero=createCharacter({classId,level:56,mp:100,learnedSkills:{[classId+'_0']:1}}),before=JSON.stringify(hero),system={hero,cooldowns:new Map(),preferred(){assert.fail('blocked cast must not select a target');}};
  applyHeroAffliction(hero,{type:'stun',duration:700},0);assert.deepEqual(MonsterSystem.prototype.useSkill.call(system,classId+'_0',0),{ok:false,reason:'stun'});assert.equal(JSON.stringify(hero),before);assert.equal(system.cooldowns.size,0);
 }
});
test('already flying real projectile still impacts while the caster is stunned',()=>{
 const node=()=>{const o={x:0,y:0};for(const method of ['setDepth','setOrigin','setPosition','setVisible','setScale','add','destroy'])o[method]=()=>o;return o;};
 const scene={add:Object.fromEntries(['ellipse','container','triangle','circle','rectangle','text'].map(k=>[k,node])),tweens:{add:()=>{}}},hero=createCharacter({classId:'mage',x:1370,y:1240,level:42,hp:100,mp:100}),system=new MonsterSystem(scene,hero,()=>{});
 for(const m of system.monsters.slice(1))m.alive=false;const target=system.monsters[0];target.x=hero.x+100;system.strike(target,100,10);assert.equal(system.projectiles.length,1);assert.equal(target.alive,true);
 applyHeroAffliction(hero,{type:'stun',duration:800},100);system.update(500,.6);assert.equal(target.alive,false);assert.equal(system.projectiles.length,0);assert.equal(isMonsterStunned(hero,500),true);system.destroy();
});
test('direct attack boundary blocks all six classes before target/combo/facing/hero state mutation',()=>{
 for(const classId of classes){
  const hero=createCharacter({classId,level:56}),before=JSON.stringify(hero),scene={facing:1,lastComboAttack:'unchanged'},system={hero,scene,combo:2,buffs:{},preferred(){assert.fail('stunned attack must not look up a target');},strike(){assert.fail('stunned attack must not strike');}};
  applyHeroAffliction(hero,{type:'stun',duration:700},0);assert.equal(MonsterSystem.prototype.attack.call(system,0),false);assert.equal(system.combo,2);assert.deepEqual(scene,{facing:1,lastComboAttack:'unchanged'});assert.equal(JSON.stringify(hero),before);
 }
});
