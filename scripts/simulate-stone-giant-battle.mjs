// Live-engine,finite-resource controller trial. This is an automated simulation,
// not a manual solo victory,physical Android test or measured player average.
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,dirname,relative} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {calibrationHero} from './measure-stone-giant-dps.mjs';
import {MonsterSystem} from '../js/monsters/MonsterSystem.js';
import {DESERT_BOSSES} from '../js/monsters/desertBossData.js';
import {getRegionContent} from '../js/world/regionContent.js';
import {DUNGEONS} from '../js/dungeons/dungeonData.js';
import {describeChunk,riverBlocked} from '../js/world/chunkGeometry.js';
import {moveWithCollision,lineClear,segmentDistanceSquared} from '../js/combat/geometry.js';
import {combatSpec,skillEffect} from '../js/combat/skillRuntime.js';
import {getSkills} from '../js/skills/skillData.js';
import {AttackCycle} from '../js/combat/attackTiming.js';
import {heroMovementMultiplier} from '../js/monsters/movementProfiles.js';
import {usePotion} from '../js/systems/potions.js';
import {ITEM_DEFS} from '../js/equipment/items.js';
const ROOT=fileURLToPath(new URL('../',import.meta.url)),WALL_BASE=1700000000000;
export const BATTLE_CLASSES=Object.freeze(['warrior','archer','mage','paladin','assassin','cannoneer']);
const PRIORITY={warrior:[3,4,2,0],archer:[3,4,0,2],mage:[4,3,0,2],paladin:[3,4,0,1],assassin:[2,4,0,3],cannoneer:[3,4,0,2]};
const round=(n,p=3)=>Math.round(n*10**p)/10**p,distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const rngFor=seed=>{let state=seed>>>0;return ()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};};
function simulationSourceHashes(){
 const pending=[resolve(ROOT,'scripts/simulate-stone-giant-battle.mjs')],visited=new Map();
 while(pending.length){const file=pending.pop();if(visited.has(file))continue;const source=readFileSync(file,'utf8');visited.set(file,createHash('sha256').update(source).digest('hex'));for(const match of source.matchAll(/\bfrom\s*['"](\.[^'"]+)['"]/g))pending.push(resolve(dirname(file),match[1]));}
 return Object.fromEntries([...visited].map(([file,hash])=>[relative(ROOT,file),hash]).sort((a,b)=>a[0].localeCompare(b[0])));
}
function sceneMock(){
 const node=()=>{const n={visible:true,x:0,y:0,list:[]};for(const method of ['setDepth','setOrigin','setScale','setRotation','setTint','clearTint','clear','fillStyle','lineStyle','fillPoints','strokePoints'])n[method]=()=>n;
 n.setPosition=(x,y)=>{n.x=x;n.y=y;return n;};n.setVisible=v=>{n.visible=v;return n;};n.add=value=>{n.list.push(...(Array.isArray(value)?value:[value]));return n;};n.removeAll=()=>{n.list=[];return n;};n.destroy=()=>{n.destroyed=true;n.list=[];};return n;};
 return {playNow:0,language:'en',axis:{x:0,y:0},obstacles:[],add:Object.fromEntries(['ellipse','container','triangle','circle','rectangle','text','graphics','image'].map(key=>[key,node])),textures:{exists:()=>false},tweens:{add:options=>{if(options.repeat!==-1)options.onComplete?.();},killTweensOf(){}},cameras:{main:{shake(){}}}};
}
// The same deterministic decoration/collision descriptors as the live desert.
// Only the encounter is isolated: other distant camps/NPCs are not simulated.
export function stoneGiantArena(){
 const descriptor=DESERT_BOSSES.find(d=>d.id==='desert-world-stone-giant');assert.ok(descriptor);const home={x:descriptor.x,y:descriptor.y},content={...getRegionContent('desert'),dungeons:DUNGEONS.filter(d=>d.region==='desert')},obstacles=[];
 const bound=1150;for(let cy=Math.max(0,Math.floor((home.y-bound)/512));cy<=Math.min(Math.ceil(content.height/512)-1,Math.floor((home.y+bound)/512));cy++)for(let cx=Math.max(0,Math.floor((home.x-bound)/512));cx<=Math.min(Math.ceil(content.width/512)-1,Math.floor((home.x+bound)/512));cx++)obstacles.push(...describeChunk(content,cx,cy).obstacles);
 const cells=new Map(),cellSize=128;let largestRadius=0;for(const o of obstacles){largestRadius=Math.max(largestRadius,o.r||0);const key=Math.floor(o.x/cellSize)+','+Math.floor(o.y/cellSize);if(!cells.has(key))cells.set(key,[]);cells.get(key).push(o);}
 const walkable=(x,y,radius=12,flight=false)=>{if(!Number.isFinite(x)||!Number.isFinite(y)||x<radius||y<radius||x>content.width-radius||y>content.height-radius||riverBlocked(content,x,y,radius))return false;const pad=radius+largestRadius;for(let cy=Math.floor((y-pad)/cellSize);cy<=Math.floor((y+pad)/cellSize);cy++)for(let cx=Math.floor((x-pad)/cellSize);cx<=Math.floor((x+pad)/cellSize);cx++)for(const o of cells.get(cx+','+cy)||[]){if(flight&&!o.flightBlocked&&o.kind!=='house'&&o.kind!=='cliff'&&!(o.r>28))continue;if((x-o.x)**2+(y-o.y)**2<(radius+o.r)**2)return false;}return true;};
 return {descriptor,home,content,obstacles,walkable,bakedChunkRadius:bound};
}
function geometryDanger(p,g,margin=16){
 const d=distance(p,g);if(g.shape==='circle')return d<=g.radius+margin;
 if(g.shape==='ring')return d>=Math.max(0,g.innerRadius-margin)&&d<=g.radius+margin;
 if(g.shape==='cone'){const angle=Math.atan2(p.y-g.y,p.x-g.x)-g.angle,delta=Math.abs(Math.atan2(Math.sin(angle),Math.cos(angle)));return d<=g.radius+margin&&delta<=g.arc/2+Math.atan2(margin,Math.max(1,d));}
 return segmentDistanceSquared({x:g.x,y:g.y},{x:g.toX,y:g.toY},p)<=(g.width/2+margin)**2;
}
function projectileDanger(hero,end,shot,horizon=1.3){
 const travel=distance(hero,end),speed=Math.min(210,hero.speed),seconds=Math.min(horizon,shot.remaining/Math.max(1,shot.speed||Math.hypot(shot.vx,shot.vy))),vx=travel?(end.x-hero.x)/travel*speed:0,vy=travel?(end.y-hero.y)/travel*speed:0;
 const rx=shot.x-hero.x,ry=shot.y-hero.y,dx=shot.vx-vx,dy=shot.vy-vy,den=dx*dx+dy*dy,t=den?Math.max(0,Math.min(seconds,-(rx*dx+ry*dy)/den)):0;
 return Math.hypot(rx+dx*t,ry+dy*t)<36;
}
function controllerDestination(hero,boss,arena,perceivedBoss,warnings,shots,now,desired){
 const candidates=[{x:hero.x,y:hero.y}];for(const radius of [desired,Math.max(48,desired-28),desired+65])for(let i=0;i<16;i++){const angle=i*Math.PI/8;candidates.push({x:perceivedBoss.x+Math.cos(angle)*radius,y:perceivedBoss.y+Math.sin(angle)*radius});}
 for(const radius of [100,190])for(let i=0;i<12;i++){const angle=i*Math.PI/6;candidates.push({x:hero.x+Math.cos(angle)*radius,y:hero.y+Math.sin(angle)*radius});}
 const valid=candidates.filter(p=>distance(p,arena.home)<=390&&arena.walkable(p.x,p.y,12));const ranked=[];
 for(const p of valid){let danger=0;const length=distance(hero,p);for(const w of warnings){const time=Math.max(0,(w.at-now)/1000),amount=Math.min(1,time*Math.min(210,hero.speed)*heroMovementMultiplier(hero,now)/Math.max(1,length)),at={x:hero.x+(p.x-hero.x)*amount,y:hero.y+(p.y-hero.y)*amount};if(geometryDanger(p,w.geometry))danger+=1;if(geometryDanger(at,w.geometry))danger+=2;}for(const shot of shots)if(projectileDanger(hero,p,shot))danger+=3;
  const currentDanger=warnings.some(w=>geometryDanger(hero,w.geometry))||shots.some(s=>projectileDanger(hero,hero,s));const rangeError=Math.abs(distance(p,perceivedBoss)-desired),rangePenalty=rangeError*.65,retreatPenalty=distance(p,arena.home)>340?(distance(p,arena.home)-340)*.5:0;
  ranked.push({point:p,danger,score:danger*100000+rangePenalty+length*(currentDanger?.035:.14)+retreatPenalty});}
 ranked.sort((a,b)=>a.score-b.score);for(const p of ranked.slice(0,14))if(lineClear(hero,p.point,arena.obstacles,12))return p;return ranked[0]||{point:{x:hero.x,y:hero.y},danger:0,score:0};
}
export function simulateStoneGiantBattle(classId,{maxDurationSeconds=3600,stepMs=20,seed=0x41555241,reactionMs=300,controller='telegraphs',attributeAllocation,skillSlotIndices,onProgress}={}){
 assert.ok(BATTLE_CLASSES.includes(classId));assert.ok(maxDurationSeconds>0&&maxDurationSeconds<=3600);assert.ok(stepMs>=16&&stepMs<=33);assert.ok(reactionMs>=250);assert.ok(['telegraphs','stationary'].includes(controller));
 const arena=stoneGiantArena(),hero=calibrationHero(classId,{attributeAllocation,skillSlotIndices}),scene=sceneMock(),spec=combatSpec(classId),desired=spec.projectile?220:86;
 let initial;for(let i=0;i<32&&!initial;i++){const angle=i*Math.PI/16,p={x:arena.home.x+Math.cos(angle)*desired,y:arena.home.y+Math.sin(angle)*desired};if(arena.walkable(p.x,p.y)&&lineClear(p,arena.home,arena.obstacles,12))initial=p;}assert.ok(initial,'real arena requires a walkable visible starting position');Object.assign(hero,initial);scene.obstacles=arena.obstacles;scene.world={isWalkable:(x,y,r)=>arena.walkable(x,y,r),isFlightWalkable:(x,y,r)=>arena.walkable(x,y,r,true)};
 const content={...arena.content,camps:[],bosses:[arena.descriptor]},previousRandom=Math.random,previousNow=Date.now,hostStart=performance.now();let now=0,system,target;
 Math.random=rngFor(seed);Date.now=()=>WALL_BASE+Math.floor(now);
 const metrics={damageDealt:0,bossHealing:0,incomingAttempts:0,damageTaken:0,incomingHits:0,incomingTimeline:[],minimumHp:hero.hp,minimumMp:hero.mp,healingObserved:0,hpPotionsUsed:0,mpPotionsUsed:0,casts:{},castTimeline:[],potionTimeline:[],phases:[],phaseTimeline:[],telegraphs:0,aoeDodges:0,aoeDangerAtRelease:0,cancelledTelegraphs:0,basicAttackImpacts:0,successfulBasicInputs:0,playerProjectiles:0,hostileProjectiles:0,scheduledEffects:0,peakPlayerProjectiles:0,peakHostileProjectiles:0,peakPendingEffects:0,movingFrames:0,totalFrames:0,distanceMoved:0,maxControllerStep:0,skillRepositions:0,leashReturns:0,rangeRejections:0,manaRejections:0,geometryObstacles:arena.obstacles.length};
 try{
  system=new MonsterSystem(scene,hero,()=>{},content);target=system.monsters.find(m=>m.id===arena.descriptor.id);assert.ok(target&&target.kind.encounter==='stoneGiant');assert.equal(target.maxHp,arena.descriptor.maxHp);
  const realHit=system.hit.bind(system);system.hit=(m,amount,at,critical)=>{const hp=m.hp;realHit(m,amount,at,critical);if(m===target)metrics.damageDealt+=Math.max(0,hp-m.hp);};
  const realHurt=system.hurtHero.bind(system);system.hurtHero=(...args)=>{const hp=hero.hp;metrics.incomingAttempts++;realHurt(...args);const damage=Math.max(0,hp-hero.hp);metrics.damageTaken+=damage;if(damage>0){metrics.incomingHits++;metrics.incomingTimeline.push({at:round(now),damage,hp:hero.hp,hero:{x:round(hero.x),y:round(hero.y)},boss:{x:round(target.x),y:round(target.y)},distance:round(distance(hero,target)),ability:target.giantEncounter?.attack?.name||null});}};
  const realLaunch=system.launch.bind(system);system.launch=(...args)=>{const r=realLaunch(...args);if(r)metrics.playerProjectiles++;return r;};
  const realShoot=system.shootHostile.bind(system);system.shootHostile=(...args)=>{metrics.hostileProjectiles++;return realShoot(...args);};
  const realSchedule=system.schedule.bind(system);system.schedule=(...args)=>{metrics.scheduledEffects++;return realSchedule(...args);};
  const skills=new Map(getSkills(classId).map(s=>[s.id,s])),priority=[...new Set([...PRIORITY[classId].map(i=>classId+'_'+i),...hero.skillSlots])].filter(id=>hero.skillSlots.includes(id)),cycle=new AttackCycle(),potionState={readyAt:0},warningRecords=[],projectileSeen=new WeakMap(),observations=[];let nextInput=0,nextPlan=0,nextProgress=120000,destination={...hero},lastPhase=0,wasReturning=false;
  const observedEvents=new WeakSet();const frames=Math.ceil(maxDurationSeconds*1000/stepMs);
  for(let frame=0;frame<frames&&hero.hp>0&&target.alive;frame++){
   now=Math.min(maxDurationSeconds*1000,(frame+1)*stepMs);scene.playNow=now;const beforeStepHp=hero.hp,beforeBossHp=target.hp,beforeDamage=metrics.damageDealt;
   observations.push({at:now,x:target.x,y:target.y,facing:target.facing});while(observations.length>1&&observations[1].at<=now-reactionMs)observations.shift();const perceived=observations[0];
   for(const e of target.giantEncounter?.attack?.events||[])if(!observedEvents.has(e)){observedEvents.add(e);warningRecords.push({source:e,seenAt:now,at:e.at,geometry:{...e.geometry},ability:target.giantEncounter.attack.name,wasDangerous:geometryDanger(hero,e.geometry,0),released:false,cancelled:false});metrics.telegraphs++;}
   for(const shot of system.hostileProjectiles)if(!projectileSeen.has(shot))projectileSeen.set(shot,now);
   const warnings=warningRecords.filter(w=>now>=w.seenAt+reactionMs&&now<=w.at+reactionMs&&(!w.cancelled||now<w.at)),shots=system.hostileProjectiles.filter(p=>now>=(projectileSeen.get(p)||now)+reactionMs);
   if(controller==='telegraphs'&&now>=nextPlan){const plan=controllerDestination(hero,target,arena,perceived,warnings,shots,now,desired);destination=plan.point;nextPlan=now+120;}
   scene.axis.x=scene.axis.y=0;if(controller==='telegraphs'&&distance(hero,destination)>4){const start={x:hero.x,y:hero.y},angle=Math.atan2(destination.y-hero.y,destination.x-hero.x);scene.axis.x=Math.cos(angle);scene.axis.y=Math.sin(angle);moveWithCollision(hero,destination.x,destination.y,Math.min(210,hero.speed)*heroMovementMultiplier(hero,now)*stepMs/1000,arena.obstacles,12,(x,y)=>arena.walkable(x,y,12));const moved=distance(start,hero);metrics.distanceMoved+=moved;metrics.maxControllerStep=Math.max(metrics.maxControllerStep,moved);if(moved>.01)metrics.movingFrames++;else scene.axis.x=scene.axis.y=0;}
   const swing=cycle.state(now);if(swing.impact){metrics.basicAttackImpacts++;if(system.attack(now))metrics.successfulBasicInputs++;}cycle.start(now,hero);
   if(now>=nextInput){
    const resource=hero.hp<hero.maxHp*.58?'hp':hero.mp<hero.maxMp*.45?'mp':null;if(resource&&usePotion(hero,resource,now,potionState)){metrics[resource==='hp'?'hpPotionsUsed':'mpPotionsUsed']++;metrics.potionTimeline.push({at:round(now),resource,hp:hero.hp,mp:hero.mp,remaining:{...hero.potions}});}
    for(const id of priority){const skill=skills.get(id),effect=skillEffect(classId,skill.index);if(['rage','focus','guard','aura','evade'].includes(effect)&&system.buffs[effect]>now)continue;if(system.skillRemaining(id,now)>0)continue;
     // A legal backstab can put the hero in melee range. Use it only during a
     // already perceived boss windup with time left to leave melee range and when its actual landing is safe.
     if(effect==='backstab'&&controller==='telegraphs'){if(!warnings.some(w=>!w.cancelled&&now<w.at-400))continue;const angle=perceived.facing??Math.atan2(hero.y-target.y,hero.x-target.x),landing={x:target.x-Math.cos(angle)*35,y:target.y-Math.sin(angle)*35};if(warnings.some(w=>geometryDanger(landing,w.geometry)))continue;}
     const mp=hero.mp,position={x:hero.x,y:hero.y},cast=system.useSkill(id,now);if(cast.ok){metrics.casts[id]=(metrics.casts[id]||0)+1;metrics.castTimeline.push({id,at:round(now),mpBefore:mp,mpAfter:hero.mp});if(distance(position,hero)>.01)metrics.skillRepositions++;nextInput=now+650;break;}if(cast.reason==='target')metrics.rangeRejections++;if(cast.reason==='mana')metrics.manaRejections++;
    }
    if(nextInput<=now)nextInput=now+120;
   }
   system.update(now,stepMs/1000);metrics.bossHealing+=Math.max(0,target.hp-beforeBossHp+metrics.damageDealt-beforeDamage);metrics.healingObserved+=Math.max(0,hero.hp-beforeStepHp);metrics.minimumHp=Math.min(metrics.minimumHp,hero.hp);metrics.minimumMp=Math.min(metrics.minimumMp,hero.mp);metrics.totalFrames++;metrics.peakPlayerProjectiles=Math.max(metrics.peakPlayerProjectiles,system.projectiles.length);metrics.peakHostileProjectiles=Math.max(metrics.peakHostileProjectiles,system.hostileProjectiles.length);metrics.peakPendingEffects=Math.max(metrics.peakPendingEffects,system.pendingEffects.length);
   const phase=target.giantEncounter?.phase||lastPhase;if(phase&&phase!==lastPhase){metrics.phases.push(phase);metrics.phaseTimeline.push({phase,at:round(now),bossHp:round(target.hp),hp:hero.hp,mp:hero.mp});lastPhase=phase;}if(target.returning&&!wasReturning)metrics.leashReturns++;wasReturning=target.returning;
   for(const w of warningRecords){if(!w.released&&w.source.fired){w.released=true;if(geometryDanger(hero,w.geometry,0))metrics.aoeDangerAtRelease++;else if(w.wasDangerous)metrics.aoeDodges++;}if(!w.released&&!w.cancelled&&w.source.marker?.destroyed){w.cancelled=true;metrics.cancelledTelegraphs++;}}
   for(let i=warningRecords.length-1;i>=0;i--)if(now>warningRecords[i].at+1000)warningRecords.splice(i,1);
   assert.ok(hero.mp>=0&&hero.mp<=hero.maxMp,'real mana must stay in bounds');assert.ok(hero.potions.hp>=0&&hero.potions.mp>=0);assert.ok(metrics.hpPotionsUsed<=10&&metrics.mpPotionsUsed<=5);assert.equal(target.kind.encounter,'stoneGiant','live AI must stay enabled');assert.ok(hero.skillSlots.every(id=>!id||skills.has(id)));assert.ok(arena.walkable(hero.x,hero.y,12),'controller and skills stay on actual walkable geometry');
   if(now>=nextProgress){onProgress?.({classId,elapsedSeconds:round(now/1000),bossHp:round(target.hp),bossMaxHp:target.maxHp,hp:hero.hp,mp:hero.mp,potions:{...hero.potions},damageTaken:round(metrics.damageTaken),phase:lastPhase,casts:{...metrics.casts}});nextProgress+=120000;}
  }
  const outcome=!target.alive?'victory':hero.hp<=0?'death':'timeout',result={schema:1,classId,outcome,liveEncounter:true,controller,seed,elapsedSeconds:round(now/1000),maxDurationSeconds,stepMs,reactionMs,controllerSpeed:Math.min(210,hero.speed),controllerPreferredRange:desired,nodeVersion:process.versions.node,boss:{id:target.id,initialHp:target.maxHp,remainingHp:round(target.hp),attack:target.attack,defense:target.kind.defense,magicDefense:target.kind.magicDefense,encounter:target.kind.encounter,home:{...arena.home},final:{x:round(target.x),y:round(target.y)}},hero:{level:hero.level,maxHp:hero.maxHp,hp:hero.hp,maxMp:hero.maxMp,mp:hero.mp,potions:{...hero.potions},stats:{...hero.stats},attributePoints:hero.attributePoints,skillPoints:hero.skillPoints,skillSlots:[...hero.skillSlots],learnedSkills:{...hero.learnedSkills},equipment:Object.fromEntries(Object.entries(hero.equipment).map(([slot,item])=>[slot,{id:item.id,rarity:item.rarity,level:ITEM_DEFS[item.id].level}])),initialPosition:{...initial},finalPosition:{x:round(hero.x),y:round(hero.y)}},...metrics,hostElapsedMs:round(performance.now()-hostStart),
   assumptions:{preparedCharacter:'Level56,165 legally allocated attributes,existing rare equipment≤42,five learned ranks and four assigned skills from calibrationHero.',resources:'One continuous initial pool:10HP/5MPpotions,actual45% refill and shared3s cooldown; no resets or artificial HP/MP refill.',movement:'Actual moveWithCollision,real desert describeChunk obstacles and LOS; delayed boss position and public telegraph observations≥reactionMs. Movement capped at min(210,actual hero.speed) world units/s with the real slow multiplier; actual legal dash/backstab effects still use the engine.',input:'Held real AttackCycle,one eligible assigned skill input per650ms,HP/MPpotions compete on their shared cooldown.',rendering:'Scene graphics/tweens are mocked; AI,damage,hurtHero,skills,projectiles,scheduled effects,poison,leash and living recovery run through the real engine.'},
   limitations:['An automated controller is not a manual player or proof of an average30-minute fight.','Only the giant is active in this encounter; other region encounters,NPCs and multiplayer are excluded.','The controller knows public warning geometry and observed projectile velocity,reacts after300ms by default,and searches local world-space destinations with86-unit melee standoff (the shorter assassin attack range remains80); controller tuning is recorded rather than changing combat rules; this exceeds an inexperienced player’s ability.','No physical Android,FPS,thermal,GPU or network measurements.'],sourceSha256:simulationSourceHashes()};
  return result;
 }finally{try{system?.destroy();}finally{Math.random=previousRandom;Date.now=previousNow;}}
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 const option=name=>{const index=process.argv.indexOf(name);return index>=0?process.argv[index+1]:null;},selected=option('--class'),classes=selected?[selected]:BATTLE_CLASSES,seconds=Number(option('--seconds')||3600),stationary=process.argv.includes('--stationary'),out=resolve(ROOT,'work/task10/giant-battle');mkdirSync(out,{recursive:true});const results=[];
 for(const [index,classId]of classes.entries()){const result=simulateStoneGiantBattle(classId,{maxDurationSeconds:seconds,seed:(0x41555241+index*1009)>>>0,controller:stationary?'stationary':'telegraphs',onProgress:p=>{writeFileSync(resolve(out,classId+'-progress.json'),JSON.stringify(p,null,2)+'\n');console.log(JSON.stringify({progress:p}));}});writeFileSync(resolve(out,classId+(stationary?'-stationary':'')+'.json'),JSON.stringify(result,null,2)+'\n');results.push(result);console.log(JSON.stringify({classId,outcome:result.outcome,elapsedSeconds:result.elapsedSeconds,remainingBossHp:result.boss.remainingHp,hp:result.hero.hp,mp:result.hero.mp,potions:result.hero.potions,damageTaken:result.damageTaken,aoeDodges:result.aoeDodges,phases:result.phases,hostElapsedMs:result.hostElapsedMs}));}
 writeFileSync(resolve(out,stationary?'stationary-summary.json':'summary.json'),JSON.stringify({liveEngine:true,manualPlaythrough:false,physicalAndroid:false,results:results.map(r=>({classId:r.classId,outcome:r.outcome,elapsedSeconds:r.elapsedSeconds,bossHp:r.boss.remainingHp,hp:r.hero.hp,potions:r.hero.potions,damageTaken:r.damageTaken,phases:r.phases,aoeDodges:r.aoeDodges,hostElapsedMs:r.hostElapsedMs}))},null,2)+'\n');
}
