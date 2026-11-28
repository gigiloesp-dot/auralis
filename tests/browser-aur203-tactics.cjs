// Explicit isolated encounter HP, position, temporary house-wall and paused
// simulation-time fixtures; no authored geography or saved player is changed.
// World loading, painted actors, collision/LOS, guard warnings, hit mitigation,
// movement, pack threat, death persistence and teardown use the real engine.
// This is touch-emulated Chromium, not physical Android or an earned run.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {startServer,launchOptions,root}=require('./browserHarness.cjs');
const classes=['warrior','archer','mage','paladin','assassin','cannoneer'];
(async()=>{
 const host=await startServer(),out=path.join(root,'work/task10/aur203-tactics');fs.mkdirSync(out,{recursive:true});let browser;
 try{
  browser=await chromium.launch(launchOptions);const errors=[],records=[];
  for(const classId of classes){
   const context=await browser.newContext({viewport:{width:740,height:320},hasTouch:true,isMobile:true}),p=await context.newPage();p.on('pageerror',error=>errors.push(error.message));
   await p.goto(host.url);await p.locator('[data-menu-action=new]').tap();await p.waitForFunction(()=>document.querySelectorAll('.class-card .has-portrait').length===6);
   await p.locator('.class-card:has(.hero-'+classId+')').tap();const name='A203'+classId;await p.locator('input').fill(name);await p.locator('.menu-content>button.primary').tap();await p.waitForFunction(()=>Auralis.game.scene.getScene('world')?.rig?.paintedActive);
   assert.equal(await p.evaluate(()=>Auralis.game.scene.getScene('world').hero.classId),classId);
   async function encounter(species,{retreat=false}={}){
    // Atlas completion belongs to an active scene. Wait for the real streamed
    // painting before pausing and establishing deterministic combat fixtures.
    await p.evaluate(async species=>{
     const s=Auralis.game.scene.getScene('world'),{getRegionContent}=await import('/js/world/regionContent.js');
     if(s.scene.isPaused())s.scene.resume();s.controls.reset();s.clearTarget();s.hero.level=56;s.hero.hp=s.hero.maxHp=100000;s.hero.monsterAfflictions={};
     const content=getRegionContent(species.split('-species-')[0]),camp=content.camps.find(c=>c.speciesId===species);if(!camp)throw Error('Missing actual camp '+species);
     s.world.load({region:content.id,x:camp.x,y:camp.y});const descriptor=camp.spawns.find(d=>!(s.hero.worldState.monsters[content.id+':'+d.id]?.deadUntil>Date.now()));if(!descriptor)throw Error('No live fixture resident left '+species);const m=s.monsters.monsters.find(m=>m.id===descriptor.id);if(!m?.alive)throw Error('Missing actual living streamed resident '+species);
     s.__aur203Actor=m;s.__aur203Camp=camp;
    },species);
    await p.waitForFunction(()=>Auralis.game.scene.getScene('world').__aur203Actor?.paintedActive).catch(async error=>{
     console.error('AUR203 ATLAS STATE',await p.evaluate(()=>{const s=Auralis.game.scene.getScene('world'),m=s.__aur203Actor;return{paused:s.scene.isPaused(),active:s.scene.isActive(),loading:s.load.isLoading(),cache:s.actorTextures.diagnostics,id:m?.id,alive:m?.alive,paintedActive:m?.paintedActive,key:m?.painted?.entry?.key,texture:m?.painted?.entry&&s.textures.exists(m.painted.entry.key)};}));throw error;
    });
    return p.evaluate(async({species,retreat})=>{
     const s=Auralis.game.scene.getScene('world'),{movementProfile,cancelMonsterAbility}=await import('/js/monsters/movementProfiles.js'),{cancelAur203Tactics}=await import('/js/monsters/aur203Tactics.js');
     s.scene.pause();s.controls.reset();s.clearTarget();s.hero.hp=s.hero.maxHp=100000;s.hero.monsterAfflictions={};
     const m=s.__aur203Actor,camp=s.__aur203Camp,descriptor=camp.spawns.find(d=>d.id===m.id);if(!descriptor||!m.alive||!m.paintedActive)throw Error('Loaded fixture actor changed '+species);
     cancelAur203Tactics(m);cancelMonsterAbility(m);s.monsters.cancelWindup(m);
     if(m.aur203Tactics)Object.assign(m.aur203Tactics,{nextGuardAt:0,nextRetreatAt:0,nextPackAlertAt:0});
     // Loading may have allowed natural movement. Restore only the declared
     // isolated actor to its current real authored spawn, never baked XY.
     Object.assign(m,{x:descriptor.x,y:descriptor.y,homeX:descriptor.x,homeY:descriptor.y,active:true});s.monsters.setMonsterVisible(m,true);
     for(const other of s.monsters.monsters)if(other!==m){other.alive=false;other.respawnAt=Date.now()+3600000;s.monsters.setMonsterVisible(other,false);}
     const radius=movementProfile(m.kind).collisionRadius;let point;
     for(let i=0;i<64;i++){
      const a=i*Math.PI/32,q={x:m.x+Math.cos(a)*90,y:m.y+Math.sin(a)*90},candidate={x:m.x-Math.cos(a)*44,y:m.y-Math.sin(a)*44};
      if(!s.world.isWalkable(q.x,q.y,18)||!s.monsters.sight(m,q))continue;
      if(retreat&&(!s.monsters.canOccupy(m,candidate.x,candidate.y,radius)||!s.monsters.sight(m,candidate,radius)||Math.hypot(candidate.x-camp.x,candidate.y-camp.y)>camp.radius-8))continue;
      point=q;break;
     }
     if(!point)throw Error('No actual clear fixture approach '+species);Object.assign(s.hero,point);
     const now=Math.max(10000,s.playNow)+1000;s.playNow=now;m.hp=m.maxHp=10000;m.lastAbilityAt=now+3600000;m.lastHit=now+3600000;m.rootUntil=0;m.stunUntil=0;m.hurtUntil=0;m.returning=false;m.aggroUntil=now+60000;m.behaviorState='chase';m.nextPatrolAt=Infinity;
     s.__aur203FixtureNow=now;s.__aur203FixtureRadius=radius;
     const screen=s.project(s.hero.x,s.hero.y);s.body.setPosition(screen.x,screen.y);s.cameras.main.centerOn(screen.x,screen.y);
     return {id:m.id,species,now,key:m.key,camp:{x:camp.x,y:camp.y,radius:camp.radius},profile:movementProfile(m.kind),config:m.kind.behaviorConfig};
    },{species,retreat});
   }
   const fixture=await encounter('forest-species-080');
   const guard=await p.evaluate(()=>{
    const s=Auralis.game.scene.getScene('world'),m=s.__aur203Actor,now=s.__aur203FixtureNow,system=s.monsters;
    system.update(now,0);const state=m.aur203Tactics?.guard;if(!state?.marker)throw Error('Real guard did not create warning');
    const marker=state.marker;s.__aur203Marker=marker;const markerBefore={active:marker.active,type:marker.type,alpha:marker.alpha,fillColor:marker.fillColor},pose=m.painted.currentFrame;
    let hp=m.hp;system.hit(m,100,state.activeAt-1);const windupDamage=hp-m.hp;
    s.playNow=state.activeAt;system.update(s.playNow,0);hp=m.hp;system.hit(m,100,s.playNow);const activeDamage=hp-m.hp,markerAfterActive=marker.active;
    s.playNow=state.until;hp=m.hp;system.hit(m,100,s.playNow);const expiredDamage=hp-m.hp;system.update(s.playNow,0);
    return{fixtureTime:now,activeAt:state.activeAt,until:state.until,markerBefore,markerAfterActive,pose,windupDamage,activeDamage,expiredDamage,guardCleared:m.aur203Tactics.guard===null,expected:Math.round(100*m.kind.behaviorConfig.guard.damageMultiplier)};
   });
   assert.equal(guard.markerBefore.active,true);assert.equal(guard.markerBefore.type,'Arc');assert.ok(guard.markerBefore.alpha>0);assert.equal(guard.markerBefore.fillColor,0x76cbe4);
   assert.ok(guard.pose.startsWith('attack/'),'Guard must use an actual readable special/attack pose');assert.equal(guard.windupDamage,100);assert.equal(guard.activeDamage,guard.expected);assert.ok(guard.activeDamage>0&&guard.activeDamage<100);assert.equal(guard.expiredDamage,100);assert.equal(guard.markerAfterActive,false);assert.equal(guard.guardCleared,true);
   const record={classId,fixture,guard};
   console.log('PASS actual guard warning, finite mitigation and expiry',classId);
   if(classId==='warrior'){
    const retreatFixture=await encounter('forest-species-081',{retreat:true});
    record.retreat=await p.evaluate(()=>{
     const s=Auralis.game.scene.getScene('world'),m=s.__aur203Actor,system=s.monsters,now=s.__aur203FixtureNow,origin={x:m.x,y:m.y},distance=()=>Math.hypot(m.x-s.hero.x,m.y-s.hero.y);
     m.hp=m.maxHp*.2;const before=distance();system.update(now,.1);const target=m.aur203Tactics?.retreat?.target;
     if(!target)throw Error('Actual low-HP retreat did not begin');
     const first={origin,point:{x:m.x,y:m.y},target:{...target},before,after:distance(),campDistance:Math.hypot(m.x-m.campX,m.y-m.campY),campRadius:m.campRadius,canOccupy:system.canOccupy(m,m.x,m.y),traverse:system.sight(origin,{x:m.x,y:m.y},s.__aur203FixtureRadius)};
     const obstacles=s.obstacles,wall={kind:'house',flightBlocked:true,x:(origin.x+target.x)/2,y:(origin.y+target.y)/2,r:25};
     s.obstacles=[...obstacles,wall];m.x=origin.x;m.y=origin.y;m.aur203Tactics.retreat=null;m.aur203Tactics.retreatPauseUntil=0;m.aur203Tactics.nextRetreatAt=0;const blockedNow=now+10000;s.playNow=blockedNow;system.update(blockedNow,.1);
     const secondTarget=m.aur203Tactics.retreat?.target,blocked={originalPathBlocked:!system.sight(origin,target,s.__aur203FixtureRadius),point:{x:m.x,y:m.y},target:secondTarget&&{...secondTarget},actualSegmentClear:system.sight(origin,{x:m.x,y:m.y},s.__aur203FixtureRadius),candidateSegmentClear:!secondTarget||system.sight(m,secondTarget,s.__aur203FixtureRadius),canOccupy:system.canOccupy(m,m.x,m.y)};
     s.obstacles=obstacles;m.hp=m.maxHp;system.update(blockedNow+1,0);
     return{first,blocked,recoveryClears:m.aur203Tactics.retreat===null};
    });
    assert.ok(record.retreat.first.after>record.retreat.first.before);assert.ok(record.retreat.first.campDistance<record.retreat.first.campRadius);assert.equal(record.retreat.first.canOccupy,true);assert.equal(record.retreat.first.traverse,true);
    assert.equal(record.retreat.blocked.originalPathBlocked,true);assert.equal(record.retreat.blocked.actualSegmentClear,true);assert.equal(record.retreat.blocked.candidateSegmentClear,true);assert.equal(record.retreat.blocked.canOccupy,true);assert.equal(record.retreat.recoveryClears,true);
    record.retreat.fixture=retreatFixture;console.log('PASS actual low-HP retreat stays inside camp, respects house collision and ends after recovery');
    const packFixture=await encounter('forest-species-083');
    record.pack=await p.evaluate(async()=>{
     const s=Auralis.game.scene.getScene('world'),system=s.monsters,{getRegionContent}=await import('/js/world/regionContent.js'),content=getRegionContent('forest'),camp=s.__aur203Camp;
     // Select a real same-camp pair with actual sight and a valid home leash.
     const residents=system.monsters.filter(m=>m.campId===camp.id);let pair;
     for(const a of residents)for(const b of residents){if(a!==b&&Math.hypot(a.x-b.x,a.y-b.y)<120&&system.sight(a,b)){pair=[a,b];break;}if(pair)break;}
     if(!pair)throw Error('No visible actual same-camp pair');const[source,ally]=pair,now=s.__aur203FixtureNow;
     for(const m of residents){m.alive=m===source||m===ally;m.hp=m.maxHp=10000;m.aggroUntil=0;m.returning=false;m.behaviorState='idle';m.lastSeenAt=undefined;m.targetX=m.targetY=undefined;m.aur203Tactics=undefined;}
     const around=(center,spread)=>{for(let i=0;i<64;i++){const angle=i*Math.PI/32,q={x:center.x+Math.cos(angle)*spread,y:center.y+Math.sin(angle)*spread};if(s.world.isWalkable(q.x,q.y,18)&&system.sight(source,q)&&system.sight(ally,q))return q;}throw Error('No clear relocated fixture position');};
     Object.assign(s.hero,around(source,70));
     const otherCamp=content.camps.find(c=>c.speciesId==='forest-species-081'),oldCamp=content.camps.find(c=>c.spawns.some(d=>d.id==='forest-starter-wolf-0'));
     const create=(d,c,point)=>{const m=system.stream.loaded.get(d.id)||system.spawn({...d,...point,campId:c.id,campX:point.x,campY:point.y,campRadius:210});Object.assign(m,point,{homeX:point.x,homeY:point.y,campId:c.id,campX:point.x,campY:point.y,campRadius:210,alive:true,active:true});system.stream.loaded.set(m.id,m);m.hp=m.maxHp=10000;m.aggroUntil=0;m.behaviorState='idle';m.returning=false;system.setMonsterVisible(m,true);return m;};
     // These actors retain real type/ID but are explicitly relocated close so
     // removing the same-camp or opt-in guard would make this test fail.
     const stranger=create(otherCamp.spawns[0],otherCamp,around(source,35));
     const legacy=create(oldCamp.spawns[0],camp,around(source,45));
     const before={ally:ally.hp,stranger:stranger.hp,legacy:legacy.hp};system.hit(source,10,now);
     const alerted={source:source.aggroUntil,ally:ally.aggroUntil,stranger:stranger.aggroUntil,legacy:legacy.aggroUntil,allyHp:ally.hp,strangerHp:stranger.hp,legacyHp:legacy.hp,legacyState:legacy.aur203Tactics??null,sourceOwned:system.stream.loaded.get(source.id)===source,strangerOwned:system.stream.loaded.get(stranger.id)===stranger};
     ally.aggroUntil=0;system.hit(source,10,now+100);const cooldownKept=ally.aggroUntil===0;
     const obstacles=s.obstacles,wall={kind:'house',flightBlocked:true,x:(source.x+ally.x)/2,y:(source.y+ally.y)/2,r:12};s.obstacles=[...obstacles,wall];ally.aggroUntil=0;system.hit(source,10,now+2000);const blocked={sight:system.sight(source,ally),aggro:ally.aggroUntil};s.obstacles=obstacles;
     let hp=legacy.hp;system.hit(legacy,17.25,now+2100);const oldDamage=hp-legacy.hp;
     return{now,sourceId:source.id,allyId:ally.id,strangerId:stranger.id,sourceCamp:source.campId,strangerCamp:stranger.campId,before,alerted,cooldownKept,blocked,oldDamage,oldConfig:legacy.kind.behaviorConfig??null,oldState:legacy.aur203Tactics??null};
    });
    assert.ok(record.pack.alerted.ally>record.pack.now);assert.ok(record.pack.alerted.source>record.pack.now);assert.equal(record.pack.alerted.stranger,0);assert.equal(record.pack.alerted.legacy,0);
    assert.equal(record.pack.alerted.allyHp,record.pack.before.ally);assert.equal(record.pack.alerted.strangerHp,record.pack.before.stranger);assert.equal(record.pack.alerted.legacyHp,record.pack.before.legacy);
    assert.equal(record.pack.alerted.sourceOwned,true);assert.equal(record.pack.alerted.strangerOwned,true);assert.notEqual(record.pack.sourceCamp,record.pack.strangerCamp);assert.equal(record.pack.cooldownKept,true);assert.equal(record.pack.blocked.sight,false);assert.equal(record.pack.blocked.aggro,0);assert.equal(record.pack.oldDamage,17.25);assert.equal(record.pack.oldConfig,null);assert.equal(record.pack.oldState,null);
    record.pack.fixture=packFixture;console.log('PASS actual received hit alerts only same-camp opt-in allies; wall, cooldown, legacy actor and other camp stay protected');
    record.lifecycle=[];
    for(const action of ['hide','death','stream-unload','region']){
     await encounter('forest-species-080');
     const result=await p.evaluate(action=>{
      const s=Auralis.game.scene.getScene('world'),m=s.__aur203Actor,system=s.monsters,now=s.__aur203FixtureNow;system.update(now,0);const guard=m.aur203Tactics.guard,marker=guard.marker;
      if(action==='hide')system.setMonsterVisible(m,false);
      else if(action==='death')system.hit(m,1000000,now+1);
      else if(action==='stream-unload'){
       const spawn=s.regionContent.spawn;Object.assign(s.hero,spawn);const q=s.project(spawn.x,spawn.y);s.body.setPosition(q.x,q.y);s.cameras.main.centerOn(q.x,q.y);m.aggroUntil=0;m.returning=false;m.behaviorState='idle';system.stream.options.viewport=()=>null;system.stream.update();
      }else s.world.load({region:'north',x:1500,y:1800});
      return{action,markerInactive:marker.active===false,guardCleared:m.aur203Tactics.guard===null,loaded:system.stream?.loaded.has(m.id)??false,death:m.hp===0?structuredClone(s.hero.worldState.monsters[m.key]):null};
     },action);
     assert.equal(result.markerInactive,true,action+' removes actual Phaser warning');assert.equal(result.guardCleared,true,action+' clears guard state');if(action==='stream-unload'||action==='region')assert.equal(result.loaded,false);if(action==='death')assert.ok(result.death.deadUntil>=result.death.killedAt+30000);record.lifecycle.push(result);
    }
    await encounter('forest-species-080');
    record.persistence=await p.evaluate(async()=>{
     const s=Auralis.game.scene.getScene('world'),m=s.__aur203Actor,now=s.__aur203FixtureNow;s.monsters.update(now,0);const marker=m.aur203Tactics.guard.marker;
     if(s.save()===false)throw Error('Isolated guard save failed');const {Save}=await import('/js/systems/save.js'),saved=Save.load(1);if(!saved)throw Error('Saved character is missing');const raw=JSON.stringify(saved),state=saved.worldState.monsters[m.key];s.world.load({region:'north',x:1500,y:1800});if(s.save()===false)throw Error('Region save failed');
     return{oldMarkerInactive:marker.active===false,hasTransientState:state?Object.hasOwn(state,'aur203Tactics'):false,rawContainsTransient:raw.includes('aur203Tactics'),region:s.hero.region};
    });
    assert.equal(record.persistence.oldMarkerInactive,true);assert.equal(record.persistence.hasTransientState,false);assert.equal(record.persistence.rawContainsTransient,false);assert.equal(record.persistence.region,'north');
    await p.reload();await p.locator('[data-menu-action=continue]').tap();await p.locator('.slot-row').filter({hasText:name}).locator('button.primary').tap();await p.waitForFunction(()=>Auralis.game.scene.getScene('world')?.world);
    const restored=await p.evaluate(()=>{const s=Auralis.game.scene.getScene('world');s.scene.pause();return{region:s.hero.region,hero:s.hero.name,oldGuardActors:s.monsters.monsters.filter(m=>m.campId==='forest-spot-080').length};});assert.equal(restored.region,'north');assert.equal(restored.hero,name);assert.equal(restored.oldGuardActors,0);record.persistence.restored=restored;
    console.log('PASS actual warning cancellation on hide, death, stream removal, region change and save/reload');
   }
   await p.screenshot({path:path.join(out,classId+'.png')});records.push(record);await context.close();
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({records,errors,physicalAndroid:false,fixtures:'Fresh UI-created characters; explicit isolated HP/positions, temporary house obstacles and paused simulation clock; relocated real descriptor actors test same-camp/opt-in guards; real Phaser engine/geometry/hit/stream/save methods'},null,2)+'\n');
  console.log('PASS AUR203 actual tactics across all six classes with no JavaScript errors');
 }finally{await browser?.close();await host.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
