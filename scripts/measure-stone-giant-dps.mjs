// Outgoing-only calibration through the existing combat engine. This is NOT a
// boss victory, incoming-damage balance, mobile benchmark or30-minute playtest.
// Run without flags for180-second samples; --sustain uses finite-resource
// 1800-second dummy samples. Neither mode runs a live encounter.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {MonsterSystem} from '../js/monsters/MonsterSystem.js';
import {monsterKind} from '../js/monsters/monsters.js';
import {movementProfile} from '../js/monsters/movementProfiles.js';
import {DESERT_BOSSES} from '../js/monsters/desertBossData.js';
import {createCharacter} from '../js/characters/Character.js';
import {grantXp,xpForNextLevel} from '../js/systems/progression.js';
import {allocateAttribute,derivedAttributes} from '../js/systems/attributes.js';
import {ITEM_DEFS,addItem,equipItem,equipmentStats} from '../js/equipment/items.js';
import {EQUIPMENT_SLOTS,canEquip} from '../js/equipment/armor.js';
import {getSkills,learnSkill} from '../js/skills/skillData.js';
import {assignSkillSlot} from '../js/skills/skillSlots.js';
import {combatSpec,skillEffect} from '../js/combat/skillRuntime.js';
import {AttackCycle,attackIntervalMs} from '../js/combat/attackTiming.js';
import {usePotion} from '../js/systems/potions.js';

const projectRoot=fileURLToPath(new URL('../',import.meta.url));
const CLASSES=['warrior','archer','mage','paladin','assassin','cannoneer'];
const PRIMARY={warrior:'strength',archer:'agility',mage:'intelligence',paladin:'strength',assassin:'agility',cannoneer:'strength'};
// One defensible, explicitly proposed four-button loadout per class. Paladin
// keeps its guard slot rather than inventing a fourth damaging skill. The fifth
// learned skill remains learned but is never invoked through a hidden button.
const SLOTS={warrior:[0,2,3,4],archer:[0,2,3,4],mage:[0,2,3,4],paladin:[0,1,3,4],assassin:[0,2,3,4],cannoneer:[0,2,3,4]};
const PRIORITY={warrior:[3,4,2,0],archer:[3,4,0,2],mage:[4,3,0,2],paladin:[3,4,0,1],assassin:[2,4,0,3],cannoneer:[3,4,0,2]};
const WALL_BASE=1700000000000,DUMMY_MAX_HP=1e12;
const round=(n,places=3)=>Math.round(n*10**places)/10**places;
const rngFor=seed=>{let state=seed>>>0;return ()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};};

export function calibrationHero(classId,{attributeAllocation,skillSlotIndices}={}){
 assert.ok(CLASSES.includes(classId));
 const hero=createCharacter({classId,region:'desert',x:1000,y:1000,potions:{hp:10,mp:5}});
 for(let i=0;i<55;i++)assert.equal(grantXp(hero,xpForNextLevel(hero.level)),true);
 assert.equal(hero.level,56);assert.equal(hero.skillPoints,110);assert.equal(hero.attributePoints,165);
 const allocation=attributeAllocation||{[PRIMARY[classId]]:110,endurance:55};assert.equal(Object.values(allocation).reduce((sum,n)=>sum+n,0),165);
 for(const [key,points]of Object.entries(allocation)){assert.ok(Object.hasOwn(hero.stats,key)&&Number.isInteger(points)&&points>=0);for(let i=0;i<points;i++)assert.equal(allocateAttribute(hero,key),true);}
 for(const skill of getSkills(classId))for(let rank=0;rank<5;rank++)assert.equal(learnSkill(hero,skill.id),true);
 const slots=skillSlotIndices||SLOTS[classId];assert.ok(slots.length<=4&&new Set(slots).size===slots.length);for(const [i,index]of slots.entries())assert.equal(assignSkillSlot(hero,classId+'_'+index,i+1),true);
 for(const slot of EQUIPMENT_SLOTS){
  const candidate=Object.entries(ITEM_DEFS).filter(([,d])=>d.slot===slot&&d.level<=42&&canEquip(d,hero)).sort((a,b)=>b[1].level-a[1].level||a[0].localeCompare(b[0]))[0];
  if(!candidate)continue;
  assert.equal(addItem(hero,{id:candidate[0],rarity:'rare',quantity:1}),true);
  assert.equal(equipItem(hero,hero.inventory.length-1).ok,true);
 }
 return hero;
}

function sceneMock(){
 const node=()=>{const n={visible:true,x:0,y:0,list:[]};
  for(const key of ['setDepth','setOrigin','setScale','setRotation','setTint','clearTint'])n[key]=()=>n;
  n.setPosition=(x,y)=>{n.x=x;n.y=y;return n;};n.setVisible=v=>{n.visible=v;return n;};
  n.add=list=>{n.list.push(...(Array.isArray(list)?list:[list]));return n;};n.removeAll=()=>{n.list=[];return n;};n.destroy=()=>{n.destroyed=true;};return n;
 };
 return {playNow:0,language:'en',axis:{x:0,y:0},obstacles:[],
  add:Object.fromEntries(['ellipse','container','triangle','circle','rectangle','text'].map(key=>[key,node])),
  // Rendering is suppressed. Combat callbacks,projectiles and effect queues are
  // real; graphical tween completion is irrelevant to outgoing damage.
  tweens:{add:options=>{options.onComplete?.();}},cameras:{main:{shake(){}}}
 };
}

export function simulateGiantDps(classId,{durationSeconds=180,stepMs=1000/60,seed=0x41555241,healthFraction=1,attributeAllocation,skillSlotIndices}={}){
 assert.ok(durationSeconds>0&&Number.isFinite(durationSeconds));assert.ok(stepMs>0&&stepMs<=40);assert.ok(healthFraction>0&&healthFraction<=1);
 const hero=calibrationHero(classId,{attributeAllocation,skillSlotIndices}),scene=sceneMock(),template=DESERT_BOSSES.find(d=>d.id==='desert-world-stone-giant'),targetKind=monsterKind(template);
 const range=combatSpec(classId).projectile?220:55,descriptor={...template,x:hero.x+range,y:hero.y};
 const fixed={x:descriptor.x,y:descriptor.y},radius=movementProfile(targetKind).collisionRadius;
 // This fixture's dummy is immovable,including cannon knockback. The real
 // move/collision path runs but the dummy's floor permits its center only.
 // Hero backstabs/dashes still use their real12-unit movement path.
 const floor=(x,y,r=12)=>r<radius||Math.hypot(x-fixed.x,y-fixed.y)<1e-6;
 scene.world={isWalkable:floor,isFlightWalkable:floor};
 const content={id:'desert',region:'desert',camps:[],bosses:[descriptor],towns:[],portals:[]};
 const previousRandom=Math.random,previousDateNow=Date.now;let now=0;
 Math.random=rngFor(seed);Date.now=()=>WALL_BASE+Math.floor(now);
 let system;
 try{
  system=new MonsterSystem(scene,hero,()=>{},content);const target=system.monsters.find(m=>m.id===descriptor.id);assert.ok(target);
  // Incoming AI is intentionally disabled for this stationary target dummy.
  // Defense/magicDefense,boss classification and all player damage rules stay
  // unchanged. Future StoneGiant controller selection is disabled here only.
  target.kind={...target.kind,speed:0,encounter:null};target.encounter=null;
  target.rootUntil=target.stunUntil=Number.MAX_SAFE_INTEGER;target.lastSlam=Infinity;
  target.maxHp=DUMMY_MAX_HP;target.hp=DUMMY_MAX_HP*healthFraction;
  const metrics={damage:0,hits:0,criticalHits:0,basicAttackImpacts:0,projectilesLaunched:0,scheduledEffects:0,poisonTicks:0,incomingAttackAttempts:0,casts:{},castTimeline:[],potionTimeline:[],rejectedMana:0,mpPotionsUsed:0,mpRegenerated:0,minimumMp:hero.mp,peakProjectiles:0,peakPendingEffects:0};
  system.hurtHero=()=>{metrics.incomingAttackAttempts++;throw Error('An outgoing-only dummy must not attempt an incoming attack');};
  const realHit=system.hit.bind(system);system.hit=(m,amount,at,critical)=>{const hp=m.hp;const poison=m.poison&&m.poison.next===at+1000&&amount===m.poison.damage;realHit(m,amount,at,critical);if(m===target){metrics.damage+=hp-m.hp;metrics.hits++;if(critical)metrics.criticalHits++;if(poison)metrics.poisonTicks++;}};
  const realLaunch=system.launch.bind(system);system.launch=(...args)=>{const result=realLaunch(...args);if(result)metrics.projectilesLaunched++;return result;};
  const realSchedule=system.schedule.bind(system);system.schedule=(...args)=>{metrics.scheduledEffects++;return realSchedule(...args);};
  const skillMap=new Map(getSkills(classId).map(skill=>[skill.id,skill])),cycle=new AttackCycle(),potionState={readyAt:0},priority=[...new Set([...PRIORITY[classId].map(i=>classId+'_'+i),...hero.skillSlots])].filter(id=>hero.skillSlots.includes(id));let nextInput=0;
  const frames=Math.ceil(durationSeconds*1000/stepMs);
  for(let frame=0;frame<frames;frame++){
   now=Math.min(durationSeconds*1000,(frame+1)*stepMs);scene.playNow=now;
   // Same basic attack order as WorldScene.update: consume the current impact,
   // then begin the next held-attack cycle. Skills do not reset this cycle.
   const swing=cycle.state(now);if(swing.impact){system.attack(now);metrics.basicAttackImpacts++;}cycle.start(now,hero);
   if(now>=nextInput){
    const beforePotion=hero.mp;if(hero.mp<=hero.maxMp*.55&&usePotion(hero,'mp',now,potionState)){metrics.mpPotionsUsed++;metrics.potionTimeline.push({at:round(now,6),before:beforePotion,after:hero.mp,remaining:hero.potions.mp});}
    for(const id of priority){
     const skill=skillMap.get(id),effect=skillEffect(classId,skill.index);
     // Avoid repeatedly refreshing an active buff. This is controller input
     // policy,not a new cooldown/casting restriction in the game's mechanics.
     if(['rage','focus','guard','aura','evade'].includes(effect)&&system.buffs[effect]>now)continue;
     if(system.skillRemaining(id,now)>0)continue;
     const beforeCast=hero.mp,cast=system.useSkill(id,now);if(cast.ok){metrics.casts[id]=(metrics.casts[id]||0)+1;metrics.castTimeline.push({id,at:round(now,6),beforeMp:beforeCast,afterMp:hero.mp});nextInput=now+650;break;}if(cast.reason==='mana')metrics.rejectedMana++;
    }
    if(nextInput<=now)nextInput=now+100;
   }
   const beforeMp=hero.mp;system.update(now,stepMs/1000);metrics.mpRegenerated+=Math.max(0,hero.mp-beforeMp);
   metrics.minimumMp=Math.min(metrics.minimumMp,hero.mp);metrics.peakProjectiles=Math.max(metrics.peakProjectiles,system.projectiles.length);metrics.peakPendingEffects=Math.max(metrics.peakPendingEffects,system.pendingEffects.length);
   assert.ok(target.alive&&target.hp>0,'dummy must never die');assert.equal(hero.hp,hero.maxHp,'outgoing calibration must not contain incoming attacks');assert.ok(hero.mp>=0&&hero.mp<=hero.maxMp);assert.ok(Math.hypot(target.x-fixed.x,target.y-fixed.y)<1e-6,'dummy stays stationary');
  }
  const equipment=Object.fromEntries(Object.entries(hero.equipment).map(([slot,item])=>[slot,{id:item.id,rarity:item.rarity,level:ITEM_DEFS[item.id].level}]));
  return {classId,seed,healthFraction,durationSeconds,stepMs:round(stepMs,6),dps:round(metrics.damage/durationSeconds),...metrics,
   fixture:{level:hero.level,primaryAttribute:PRIMARY[classId],attributeAllocation:attributeAllocation||{[PRIMARY[classId]]:110,endurance:55},earnedAttributes:165,stats:{...hero.stats},attributePointsRemaining:hero.attributePoints,earnedSkillPoints:110,skillPointsRemaining:hero.skillPoints,learnedSkills:{...hero.learnedSkills},skillSlots:[...hero.skillSlots],equipment,equipmentStats:equipmentStats(hero),derivedAttributes:derivedAttributes(hero),attackIntervalMs:attackIntervalMs(hero),maxHp:hero.maxHp,maxMp:hero.maxMp,initialMp:hero.maxMp,remainingMp:hero.mp,initialMpPotions:5,remainingMpPotions:hero.potions.mp,targetDefense:target.kind.defense,targetMagicDefense:target.kind.magicDefense,standingRange:range}};
 }finally{try{system?.destroy();}finally{Math.random=previousRandom;Date.now=previousDateNow;}}
}

export function giantCalibration({durationSeconds=180,uptime=.75,seed=0x41555241}={}){
 assert.ok(uptime>0&&uptime<=1);
 const results=CLASSES.map((classId,i)=>{const options={durationSeconds,seed:(seed+i*1009)>>>0},high=simulateGiantDps(classId,{...options,healthFraction:1}),execute=simulateGiantDps(classId,{...options,healthFraction:.30}),effectiveDps=1/(.65/high.dps+.35/execute.dps);return {classId,highHealth:high,executeHealth:execute,weightedDps:round(effectiveDps),uptimeAdjustedDps:round(effectiveDps*uptime)};});
 const sorted=results.map(r=>r.weightedDps).sort((a,b)=>a-b),median=(sorted[2]+sorted[3])/2,hp=Math.round(median*uptime*1800/1000)*1000;
 for(const r of results){r.estimatedTtkSeconds=round(hp/(r.weightedDps*uptime));r.estimatedTtkMinutes=round(r.estimatedTtkSeconds/60);}
 const lower=Math.max(...results.map(r=>r.uptimeAdjustedDps))*25*60,upper=Math.min(...results.map(r=>r.uptimeAdjustedDps))*35*60;
 const sourceFiles=['js/monsters/MonsterSystem.js','js/monsters/monsters.js','js/combat/attackTiming.js','js/combat/skillRuntime.js','js/combat/classEffects.js','js/skills/skillData.js','js/equipment/items.js','js/equipment/catalog.js','js/systems/attributes.js','js/systems/potions.js','js/monsters/desertBossData.js','js/combat/combat.js','js/combat/projectiles.js','js/systems/progression.js','scripts/measure-stone-giant-dps.mjs'];
 return {schema:1,completeBossBalance:false,seed,durationPerHealthPhaseSeconds:durationSeconds,healthPhases:[{fractionOfBossHp:.65,dummyHealthFraction:1},{fractionOfBossHp:.35,dummyHealthFraction:.30}],
  method:`Two ${durationSeconds}-second seeded outgoing-only simulations per class using real MonsterSystem/AttackCycle/skill/projectile/scheduled effect/poison paths. Harmonic HP-weighted DPS combines the upper65% and execute35% of HP.`,
  assumptions:{rareEquipment:'Highest existing compatible rare items at or below42; all actual item IDs are recorded,not added to user saves.',attributes:'165 points earned through55 real level-ups:110 to the recorded primary and55 endurance; starting attributes remain5.',skills:'All five existing skills learned to rank5 through learnSkill; exactly four assigned buttons. One eligible skill input per650ms; held basic attack continues.',mana:`Finite natural pool and five MP potions per ${durationSeconds}-second phase; real45% restoration and shared3-second cooldown. Actual combat regeneration is used; no artificial mana refill.`,dummy:'Giant defense/magicDefense preserved. Enemy AI,damage and knockback movement disabled by a stationary test floor; hero dash/backstab and real projectiles still execute.',uptime,uptimeMeaning:'Post-simulation assumption for dodging/positioning. It does not simulate incoming attacks,moving penalties,missed AoEs,phase invulnerability or real player survival.'},
  proposal:{targetMedianTtkSeconds:1800,basedOnFiniteResourceWindowSeconds:durationSeconds,hp,medianStationaryDps:round(median),uptime,estimatedTtkMinutesRange:[Math.min(...results.map(r=>r.estimatedTtkMinutes)),Math.max(...results.map(r=>r.estimatedTtkMinutes))],hpIntervalForAllClassesWithin25To35Minutes:{lower:Math.ceil(lower),upper:Math.floor(upper),exists:lower<=upper},appliedToRuntime:false},
  sourceSha256:Object.fromEntries(sourceFiles.map(path=>[path,createHash('sha256').update(readFileSync(resolve(projectRoot,path))).digest('hex')])),results,
  limitations:[durationSeconds<1800?'Short phase samples cannot prove continuous30-minute resource sustain.':'Even1800-second dummy samples do not test a live boss encounter or player survival.','Outgoing-only calibration is not a solo victory or a30-minute real encounter.','The two health-phase samples are separate resource simulations; five potions reset only between explicitly separate samples,never during either sample.','The rare level42 loadout and attribute allocation are proposed fixtures,not owner-approved typical builds.','No physical Android,FPS,network,multiplayer or incoming survival claim.']};
}

// Sensitivity only: these variants change the prepared character's permitted
// attribute choices and existing four button assignments,never catalogue/skills.
export function paladinBuildVariants({durationSeconds=180,proposalHp,uptime=.75,seed=0x41555241+3*1009}={}){
 const variants=[
  {name:'strength-guard',allocation:{strength:110,endurance:55},slots:[0,1,3,4]},
  {name:'strength-heal',allocation:{strength:110,endurance:55},slots:[0,2,3,4]},
  {name:'hybrid-guard',allocation:{strength:55,intelligence:55,endurance:55},slots:[0,1,3,4]},
  {name:'hybrid-heal',allocation:{strength:55,intelligence:55,endurance:55},slots:[0,2,3,4]}
 ];
 return variants.map(v=>{const options={durationSeconds,seed,attributeAllocation:v.allocation,skillSlotIndices:v.slots},high=simulateGiantDps('paladin',{...options,healthFraction:1}),execute=simulateGiantDps('paladin',{...options,healthFraction:.30}),weightedDps=1/(.65/high.dps+.35/execute.dps);return {name:v.name,allocation:v.allocation,assignedSkillIndices:v.slots,highHealth:high,executeHealth:execute,weightedDps:round(weightedDps),estimatedTtkMinutes:Number.isFinite(proposalHp)?round(proposalHp/(weightedDps*uptime)/60):null,note:'No incoming attacks: healing is unavailable at full HP,guard has no counterattack benefit. This is not an encounter victory.'};});
}

if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 const durationSeconds=process.argv.includes('--sustain')?1800:180,result=giantCalibration({durationSeconds});result.paladinBuildVariants=paladinBuildVariants({durationSeconds,proposalHp:result.proposal.hp});const out=resolve(projectRoot,'work/task10/giant-calibration');mkdirSync(out,{recursive:true});writeFileSync(resolve(out,durationSeconds===180?'calibration.json':'resource-sustain1800.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({completeBossBalance:result.completeBossBalance,proposal:result.proposal,paladinBuildVariants:result.paladinBuildVariants.map(v=>({name:v.name,weightedDps:v.weightedDps,estimatedTtkMinutes:v.estimatedTtkMinutes,mpPotionsUsed:v.highHealth.mpPotionsUsed})),classes:result.results.map(r=>({classId:r.classId,stationaryDps:r.weightedDps,estimatedTtkMinutes:r.estimatedTtkMinutes,mpPotionsUsed:r.highHealth.mpPotionsUsed,remainingMp:r.highHealth.fixture.remainingMp,casts:r.highHealth.casts,projectiles:r.highHealth.projectilesLaunched,scheduledEffects:r.highHealth.scheduledEffects,poisonTicks:r.highHealth.poisonTicks}))},null,2));
}
