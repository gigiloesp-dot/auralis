// Isolated encounter positions/HP; the actual world loop, hostile projectile,
// collision and affliction clocks perform the attack and its expiration.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const {startServer,launchOptions,root}=require('./browserHarness.cjs');
(async()=>{const host=await startServer();let browser;try{
 browser=await chromium.launch(launchOptions);const p=await browser.newPage({viewport:{width:740,height:320},isMobile:true,hasTouch:true}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(host.url);await p.locator('[data-menu-action=continue]').tap();await p.getByRole('button',{name:'Создать персонажа',exact:true}).first().tap();await p.locator('input').fill('WebQA');await p.getByRole('button',{name:'Начать приключение',exact:true}).tap();await p.waitForFunction(()=>Auralis.game.scene.getScene('world')?.world);
 const records=[];
 for(const species of ['forest-species-048','forest-species-053']){
  const fixture=await p.evaluate(async species=>{
   const s=Auralis.game.scene.getScene('world'),{getRegionContent}=await import('/js/world/regionContent.js');
   const content=getRegionContent('forest'),camp=content.camps.find(c=>c.speciesId===species);if(!camp)throw Error('Missing real spider camp');
   s.world.load({region:'forest',x:camp.x,y:camp.y});s.hero.hp=s.hero.maxHp=100000;
   const selected=s.monsters.monsters.find(m=>m.id===camp.spawns[0].id);if(!selected)throw Error('Missing streamed spider '+species);
   for(const m of s.monsters.monsters)if(m!==selected){m.alive=false;m.respawnAt=Date.now()+3600000;s.monsters.setMonsterVisible(m,false);}
   let point;for(let i=0;i<32;i++){const angle=i*Math.PI/16,q={x:selected.x+Math.cos(angle)*125,y:selected.y+Math.sin(angle)*125};if(s.world.isWalkable(q.x,q.y,18)&&s.monsters.sight(selected,q)){point=q;break;}}
   if(!point)throw Error('No clear real collision path for spider fixture');Object.assign(s.hero,point);s.hero.monsterAfflictions={};
   selected.homeX=selected.x;selected.homeY=selected.y;selected.abilityStep=1;selected.lastAbilityAt=s.playNow-20000;selected.aggroUntil=s.playNow+60000;selected.returning=false;selected.nextPatrolAt=s.playNow+60000;s.__webMonster=selected;
   const previous=s.monsters.shootHostile.bind(s.monsters);if(!s.monsters.__webCaptureInstalled){s.monsters.shootHostile=(m,shot)=>{if(m===s.__webMonster&&shot.status?.type==='slow')s.__webShot={...shot,releasedAt:s.playNow};return previous(m,shot);};s.monsters.__webCaptureInstalled=true;}s.__webShot=null;
   return{species,hp:s.hero.hp};
  },species);
  await p.waitForFunction(()=>{const s=Auralis.game.scene.getScene('world');return s.__webShot&&s.hero.monsterAfflictions?.slow?.until>s.playNow;},null,{timeout:20000}).catch(async error=>{console.error('WEB STATE',await p.evaluate(async()=>{const s=Auralis.game.scene.getScene('world'),m=s.__webMonster,{movementProfile}=await import('/js/monsters/movementProfiles.js');return {shot:s.__webShot,hero:{x:s.hero.x,y:s.hero.y,hp:s.hero.hp,afflictions:s.hero.monsterAfflictions},monster:{id:m.id,x:m.x,y:m.y,alive:m.alive,step:m.abilityStep,last:m.lastAbilityAt,blocked:m.abilityBlockedUntil,returning:m.returning,behavior:m.behaviorState,state:m.specialState&&{ability:m.specialState.ability,target:m.specialState.target,at:m.specialState.releaseAt}},now:s.playNow,safe:s.monsters.safe(),sight:s.monsters.sight(m,s.hero),profile:movementProfile(m.kind),projectiles:s.monsters.hostileProjectiles.length};}));throw error;});
  const impact=await p.evaluate(()=>{const s=Auralis.game.scene.getScene('world'),m=s.__webMonster,slow={...s.hero.monsterAfflictions.slow};m.abilityBlockedUntil=Infinity;m.lastAttackAt=Infinity;return{shot:s.__webShot,slow,hp:s.hero.hp,now:s.playNow};});
  assert.equal(impact.shot.status.type,'slow');assert.equal(impact.slow.multiplier,.55);assert.equal(impact.shot.status.duration,1800);assert.ok(impact.hp<fixture.hp,'Actual projectile collision damages the hero');assert.ok(impact.slow.until>impact.now);
  await p.waitForFunction(()=>!Auralis.game.scene.getScene('world').hero.monsterAfflictions?.slow,null,{timeout:6000});records.push({fixture,impact,expired:true});console.log('PASS actual web projectile collision, slow and natural expiration',species);
 }
 assert.deepEqual(errors,[]);const out=root+'/work/task10/web-ability';fs.mkdirSync(out,{recursive:true});await p.screenshot({path:out+'/game.png'});fs.writeFileSync(out+'/verification.json',JSON.stringify({records,errors,physicalAndroid:false,fixture:'Prepared encounter position/HP; real Phaser projectile collision and affliction clocks'},null,2));
}finally{await browser?.close();await host.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
