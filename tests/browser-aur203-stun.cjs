// Isolated test-created heroes and explicit paused-clock heavy-stomp fixture.
// The authored species catalogue is not altered. Actual Phaser world, LOS,
// warning, damage/status, scene attack, potion, skill, HUD and save APIs run.
// This is touch-emulated Chromium, not physical Android or an earned campaign.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {startServer,launchOptions,root}=require('./browserHarness.cjs');
const classes=['warrior','archer','mage','paladin','assassin','cannoneer'];
(async()=>{
 const host=await startServer(),out=path.join(root,'work/task10/aur203-stun');fs.mkdirSync(out,{recursive:true});let browser;
 try{
  browser=await chromium.launch(launchOptions);const errors=[],records=[];
  for(const [index,classId]of classes.entries()){
   const context=await browser.newContext({viewport:index%2?{width:844,height:390}:{width:740,height:320},hasTouch:true,isMobile:true}),p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
   await p.goto(host.url);await p.locator('[data-menu-action=new]').tap();await p.waitForFunction(()=>document.querySelectorAll('.class-card .has-portrait').length===6);
   await p.locator('.class-card:has(.hero-'+classId+')').tap();await p.locator('input').fill('Stun'+classId);await p.locator('.menu-content>button.primary').tap();await p.waitForFunction(()=>Auralis.game.scene.getScene('world')?.rig?.paintedActive);
   await p.evaluate(async()=>{
    const s=Auralis.game.scene.getScene('world'),{getRegionContent}=await import('/js/world/regionContent.js'),camp=getRegionContent('forest').camps.find(c=>c.speciesId==='forest-species-080');if(!camp)throw Error('Missing actual fixture camp');
    s.world.load({region:'forest',x:camp.x,y:camp.y});s.__stunMonster=s.monsters.monsters.find(m=>m.campId===camp.id&&m.alive);if(!s.__stunMonster)throw Error('Missing streamed fixture actor');
   });
   await p.waitForFunction(()=>Auralis.game.scene.getScene('world').__stunMonster?.paintedActive);
   const record=await p.evaluate(async({classId,index})=>{
    const s=Auralis.game.scene.getScene('world'),system=s.monsters,m=s.__stunMonster,{cancelMonsterAbility,applyHeroAffliction,heroMovementMultiplier}=await import('/js/monsters/movementProfiles.js'),{cancelMonsterStun,isMonsterStunned,monsterStunRemaining}=await import('/js/combat/monsterStun.js'),{AttackCycle}=await import('/js/combat/attackTiming.js'),{usePotion}=await import('/js/systems/potions.js'),{Save}=await import('/js/systems/save.js');
    s.scene.pause();s.controls.reset();s.clearTarget();cancelMonsterStun(s.hero);const h=s.hero;h.level=56;h.hp=h.maxHp=100000;h.mp=h.maxMp=1000;h.learnedSkills={[classId+'_0']:1};h.monsterAfflictions={};h.potions={hp:3,mp:3};s.playNow=Math.max(10000,s.playNow)+1000;
    const now=s.playNow;for(const other of system.monsters)if(other!==m){other.alive=false;other.respawnAt=Date.now()+3600000;system.setMonsterVisible(other,false);}
    cancelMonsterAbility(m);system.cancelWindup(m);m.kind={...m.kind,movementProfile:'heavy',abilityConfig:{ability:'stomp',abilityPattern:['stomp'],windup:1100,cooldown:8000,stunOnStomp:700}};m.attack=10;m.lastAbilityAt=0;m.active=true;m.aggroUntil=now+60000;m.hp=m.maxHp=10000;
    let near,far;for(let i=0;i<64;i++){const angle=i*Math.PI/32,q={x:m.x+Math.cos(angle)*70,y:m.y+Math.sin(angle)*70},r={x:m.x+Math.cos(angle)*180,y:m.y+Math.sin(angle)*180};if(s.world.isWalkable(q.x,q.y,18)&&system.sight(m,q)&&s.world.isWalkable(r.x,r.y,18)&&system.sight(m,r)){near=q;far=r;break;}}if(!near)throw Error('No clear approach/dodge fixture');
    Object.assign(h,near);if(system.safe())throw Error('Fixture unexpectedly safe');const warningResult=system.tickAbility(m,now,0,true),state=m.specialState;if(!state?.marker)throw Error('No actual warned stomp marker');
    const warning={busy:warningResult.busy,duration:state.releaseAt-now,active:state.marker.active,color:state.marker.fillColor};system.tickAbility(m,now+1099,0,true);if(isMonsterStunned(h,now+1099))throw Error('Stun before warning release');
    // Dodge the first real release. Next cast is a full warning and hit.
    Object.assign(h,far);system.tickAbility(m,now+1100,0,true);const dodged=!isMonsterStunned(h,now+1100);Object.assign(h,near);const hitAt=now+10000;system.tickAbility(m,hitAt,0,true);system.tickAbility(m,hitAt+1100,0,true);s.playNow=hitAt+1100;
    const hit={active:isMonsterStunned(h,s.playNow),remaining:monsterStunRemaining(h,s.playNow),movement:heroMovementMultiplier(h,s.playNow)};if(!hit.active)throw Error('Real stomp did not stun');
    // Direct boundary must return before target/RNG/combo/facing/resources.
    const before={combo:system.combo,facing:s.facing,mp:h.mp,cooldowns:JSON.stringify([...system.cooldowns]),hero:JSON.stringify(h)},attack=system.attack(s.playNow),skill=system.useSkill(classId+'_0',s.playNow),after={combo:system.combo,facing:s.facing,mp:h.mp,cooldowns:JSON.stringify([...system.cooldowns]),hero:JSON.stringify(h)};
    h.hp-=100;const potion=usePotion(h,'hp',s.playNow,{});
    const locales=[];for(const language of ['ru','en','es']){s.language=language;s.effectsHud.update();const node=document.querySelector('[data-effect-id="affliction-stun"]');locales.push({language,title:node?.title,time:node?.querySelector('b')?.textContent});}
    s.language=['ru','en','es'][index%3];s.effectsHud.update();s.__stunScreenshot={x:h.x,y:h.y};const view=s.project(h.x,h.y);s.body.setPosition(view.x,view.y);s.cameras.main.centerOn(view.x,view.y);
    // Calling the real update while paused permits deterministic input/impact
    // verification without changing any engine timer or combat implementation.
    const stationary={x:h.x,y:h.y};s.attackCycle=new AttackCycle();s.controls.axis.x=1;s.controls.attackQueued=true;s.update(s.playNow+40,40);const tapConsumed=!s.controls.attackQueued&&s.attackCycle.sequence===0,stationaryDuring=Math.hypot(h.x-stationary.x,h.y-stationary.y)===0;
    s.controls.reset();s.attackCycle.start(s.playNow,h);s.update(s.playNow+40,40);const impactCanceled=s.attackCycle.impactDone;
    const saveOk=s.save(),saved=Save.load(s.saveSlot),serialized=JSON.stringify(saved),savedHasStun=serialized.includes('affliction-stun')||Object.hasOwn(saved||{},'monsterStun');
    s.__stunResult={classId,warning,dodged,hit,attack,skill,before,after,potion,locales,tapConsumed,stationaryDuring,impactCanceled,saveOk,savedHasStun};return s.__stunResult;
   },{classId,index});
   assert.equal(record.warning.busy,true);assert.equal(record.warning.duration,1100);assert.equal(record.warning.active,true);assert.equal(record.dodged,true);assert.equal(record.hit.active,true);assert.equal(record.hit.remaining,700);assert.equal(record.hit.movement,0);assert.equal(record.attack,false);assert.deepEqual(record.skill,{ok:false,reason:'stun'});assert.deepEqual(record.before,record.after);assert.equal(record.potion,true);assert.equal(record.tapConsumed,true);assert.equal(record.stationaryDuring,true);assert.equal(record.impactCanceled,true);assert.equal(record.saveOk,true);assert.equal(record.savedHasStun,false);assert.deepEqual(record.locales.map(l=>l.time),['1','1','1']);assert.equal(new Set(record.locales.map(l=>l.title)).size,3);
   await p.screenshot({path:path.join(out,classId+'.png')});
   record.cleanup=await p.evaluate(async()=>{
    const s=Auralis.game.scene.getScene('world'),{isMonsterStunned,monsterStunRemaining}=await import('/js/combat/monsterStun.js'),{applyHeroAffliction,heroMovementMultiplier}=await import('/js/monsters/movementProfiles.js');s.controls.reset();const now=s.playNow;
    applyHeroAffliction(s.hero,{type:'slow',multiplier:.55,duration:3000},now);s.playNow+=1000;s.effectsHud.update();const result={expired:!isMonsterStunned(s.hero,s.playNow),remaining:monsterStunRemaining(s.hero,s.playNow),slowRestored:heroMovementMultiplier(s.hero,s.playNow),hudGone:!document.querySelector('[data-effect-id="affliction-stun"]'),immuneReject:applyHeroAffliction(s.hero,{type:'stun',duration:700},s.playNow)===false};
    s.world.load({region:'north',x:1500,y:1800});result.transitionClear=!isMonsterStunned(s.hero,s.playNow);result.immunityReset=applyHeroAffliction(s.hero,{type:'stun',duration:200},s.playNow)===true;return result;
   });
   assert.equal(record.cleanup.expired,true);assert.equal(record.cleanup.remaining,0);assert.equal(record.cleanup.slowRestored,.55);assert.equal(record.cleanup.hudGone,true);assert.equal(record.cleanup.immuneReject,true);assert.equal(record.cleanup.transitionClear,true);assert.equal(record.cleanup.immunityReset,true);
   records.push(record);console.log('PASS actual bounded stun APIs',classId);await context.close();
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({records,errors,physicalAndroid:false,fixtures:'UI-created heroes; cloned kind in isolated real forest resident uses explicit heavy stomp opt-in; paused simulation clock, declared HP/MP/skill and position fixture. Not authored species acceptance or physical touch-device approval.'},null,2)+'\n');
 }finally{await browser?.close();await host.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
