// Task 1 integration coverage. Level/resources, position, wall clock and lethal
// hits are explicit fixtures. Portal and ordinary exit use actual touch input.
// Earned progression remains covered separately by browser-first-dungeon.cjs.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {startServer,launchOptions,root}=require('./browserHarness.cjs');

(async()=>{
 const host=await startServer();let browser;
 try{
  browser=await chromium.launch(launchOptions);
  const page=await browser.newPage({viewport:{width:844,height:390},isMobile:true,hasTouch:true}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(host.url);
  await page.getByRole('button',{name:'Продолжить',exact:true}).click();
  await page.getByRole('button',{name:'Создать персонажа',exact:true}).first().click();
  await page.locator('input').fill('Task1Dungeon');
  await page.getByRole('button',{name:'Начать приключение',exact:true}).click();
  await page.waitForFunction(()=>Auralis.game.scene.getScene('world')?.hero?.name==='Task1Dungeon');
  const variants=await page.evaluate(async()=>{
   const {DUNGEONS,DIFFICULTIES}=await import('/js/dungeons/dungeonSystem.js');
   return DUNGEONS.flatMap(d=>Object.keys(DIFFICULTIES).map(difficulty=>({...d,difficulty})));
  });
  const frames=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const moveFixture=async point=>{
   await page.evaluate(point=>{
    const s=Auralis.game.scene.getScene('world');s.hero.x=point.x;s.hero.y=point.y;s.hero.hp=s.hero.maxHp=1000000;
    const p=s.project(point.x,point.y);s.body.setPosition(p.x,p.y);s.cameras.main.centerOn(p.x,p.y);
    s.world.chunkWorld.update(s.hero,s.cameras.main);s.obstacles=s.world.chunkWorld.obstacles;s.monsters.update(s.playNow,0);
   },point);await frames();
  };
  const tapPortal=async()=>{
   const point=await page.evaluate(()=>{
    const s=Auralis.game.scene.getScene('world'),portal=s.exitPortal,c=s.cameras.main;
    if(!portal.root?.visible||!portal.zone?.input?.enabled)throw Error('Completion portal is not an enabled visible world object');
    return {x:(portal.root.x-c.worldView.x)*c.zoom+c.x,y:(portal.root.y-35-c.worldView.y)*c.zoom+c.y};
   });
   assert.ok(point.x>0&&point.x<844&&point.y>0&&point.y<390,'portal tap must fall on the real mobile canvas');
   await page.touchscreen.tap(point.x,point.y);await frames();
  };
  for(const variant of variants){
   const entered=await page.evaluate(variant=>{
    const s=Auralis.game.scene.getScene('world');
    if(window.__task1RealDateNow)Date.now=window.__task1RealDateNow;
    s.hero.level=42;s.hero.hp=s.hero.maxHp=1000000;s.closePanels();
    s.world.load({region:variant.region,x:variant.x,y:variant.y});
    const result=s.enterDungeon(variant.id,variant.difficulty);if(!result.ok)throw Error('Dungeon fixture could not enter '+result.reason);
    const content=s.regionContent,first=content.camps[0].spawns[0];
    return {id:content.id,visit:s.hero.dungeonSession.visitId,minion:{id:first.id,x:first.x,y:first.y},far:{x:content.rooms.at(-1).x+160,y:content.rooms.at(-1).y+140},bosses:content.bosses.map(b=>({id:b.id,x:b.x,y:b.y}))};
   },variant);
   await moveFixture(entered.minion);
   const death=await page.evaluate(id=>{
    const s=Auralis.game.scene.getScene('world'),m=s.monsters.monsters.find(m=>m.id===id);if(!m?.alive)throw Error('Missing live ordinary dungeon monster');
    s.monsters.hit(m,100000000,s.playNow);s.save();
    window.__task1RealDateNow??=Date.now;const offset=6*60*1000+1;Date.now=()=>window.__task1RealDateNow()+offset;
    return {at:m.deathAt,alive:m.alive,ledger:s.hero.dungeonSession.killedMinions.includes(id)};
   },entered.minion.id);
   assert.equal(death.alive,false);assert.equal(death.ledger,true);
   await moveFixture(entered.far);
   assert.equal(await page.evaluate(id=>Auralis.game.scene.getScene('world').monsters.monsters.some(m=>m.id===id),entered.minion.id),false,'dead minion must really unload when moving to another room');
   await moveFixture(entered.minion);
   assert.equal(await page.evaluate(id=>Auralis.game.scene.getScene('world').monsters.monsters.find(m=>m.id===id)?.alive,entered.minion.id),false,'returning after more than six minutes must not resurrect a visit minion');
   if(variant.difficulty==='easy'&&[1,4,8].includes(variant.number)){
    await page.evaluate(()=>Auralis.game.scene.getScene('world').save());await page.reload();
    await page.getByRole('button',{name:'Продолжить',exact:true}).click();
    await page.getByRole('button',{name:'Продолжить',exact:true}).first().click();
    await page.waitForFunction(()=>Auralis.game.scene.getScene('world')?.hero?.name==='Task1Dungeon');
    assert.equal(await page.evaluate(()=>Auralis.game.scene.getScene('world').hero.dungeonSession.visitId),entered.visit);
    await moveFixture(entered.minion);
    assert.equal(await page.evaluate(id=>Auralis.game.scene.getScene('world').monsters.monsters.find(m=>m.id===id)?.alive,entered.minion.id),false,'actual page reload retains cleared minion');
    console.log('PASS real page reload retains current visit death',variant.region);
   }
   assert.equal(await page.evaluate(()=>!!Auralis.game.scene.getScene('world').exitPortal.root),false,'no completion portal before a valid final kill');
   for(const [index,boss]of entered.bosses.entries()){
    await moveFixture({x:boss.x-40,y:boss.y});
    const result=await page.evaluate(id=>{
     const s=Auralis.game.scene.getScene('world'),m=s.monsters.monsters.find(m=>m.id===id);if(!m?.alive)throw Error('Missing live boss '+id);
     s.monsters.hit(m,100000000,s.playNow);
     const progress=s.hero.dungeonProgress[s.regionContent.dungeonId+':'+s.regionContent.difficulty];
     return {alive:m.alive,completed:progress?.completed,visitCompleted:s.hero.dungeonSession.completed,readyAt:progress?.bossReadyAt?.[id],deathAt:m.deathAt};
    },boss.id);
    assert.equal(result.alive,false);assert.equal(result.readyAt,result.deathAt+3600000);
    assert.equal(result.visitCompleted,index===entered.bosses.length-1);
    await frames();
    if(index<entered.bosses.length-1)assert.equal(await page.evaluate(()=>!!Auralis.game.scene.getScene('world').exitPortal.root),false);
   }
   await page.waitForFunction(()=>Auralis.game.scene.getScene('world').exitPortal.root?.visible);
   const completion=await page.evaluate(()=>{const s=Auralis.game.scene.getScene('world'),progress=s.hero.dungeonProgress[s.regionContent.dungeonId+':'+s.regionContent.difficulty];return {region:s.hero.region,gold:s.hero.gold,state:{...s.exitPortal.state},rewarded:progress.rewarded,timers:{...progress.bossReadyAt}};});
   assert.equal(completion.region,entered.id,'completion does not automatically leave');assert.equal(completion.rewarded,true);
   if(variant.number===12&&variant.difficulty==='hard'){
    await page.evaluate(()=>Auralis.game.scene.getScene('world').save());await page.reload();
    await page.getByRole('button',{name:'Продолжить',exact:true}).click();await page.getByRole('button',{name:'Продолжить',exact:true}).first().click();
    await page.waitForFunction(()=>Auralis.game.scene.getScene('world')?.exitPortal?.root?.visible);
    const restored=await page.evaluate(lastBossId=>{const s=Auralis.game.scene.getScene('world');return {gold:s.hero.gold,portalId:s.exitPortal.state.id,timers:s.hero.dungeonProgress['dungeon12:hard'].bossReadyAt,bossAlive:s.monsters.monsters.find(m=>m.id===lastBossId)?.alive};},entered.bosses.at(-1).id);
    assert.equal(restored.gold,completion.gold);assert.equal(restored.portalId,completion.state.id);assert.deepEqual(restored.timers,completion.timers);assert.equal(restored.bossAlive,false);
    console.log('PASS actual completed-visit reload preserves the portal, all boss timers and one-time reward');
   }
   await moveFixture({x:completion.state.x+180,y:completion.state.y});await tapPortal();
   assert.equal(await page.evaluate(()=>Auralis.game.scene.getScene('world').hero.region),entered.id,'a distant portal touch must be rejected');
   await moveFixture({x:completion.state.x+30,y:completion.state.y});await tapPortal();
   await page.waitForFunction(region=>Auralis.game.scene.getScene('world').hero.region===region,variant.region);
   const outside=await page.evaluate(()=>{const s=Auralis.game.scene.getScene('world');const again=s.exitPortal.tryUse();return {x:s.hero.x,y:s.hero.y,gold:s.hero.gold,session:s.hero.dungeonSession,repeated:again.ok};});
   assert.equal(outside.x,variant.x);assert.equal(outside.y,variant.y+80);assert.equal(outside.gold,completion.gold);assert.equal(outside.session,null);assert.equal(outside.repeated,false);
   await page.evaluate(variant=>{const s=Auralis.game.scene.getScene('world');const result=s.enterDungeon(variant.id,variant.difficulty);if(!result.ok)throw Error(result.reason);},variant);
   assert.notEqual(await page.evaluate(()=>Auralis.game.scene.getScene('world').hero.dungeonSession.visitId),entered.visit);
   await moveFixture(entered.minion);
   assert.equal(await page.evaluate(id=>Auralis.game.scene.getScene('world').monsters.monsters.find(m=>m.id===id)?.alive,entered.minion.id),true,'new visit creates fresh ordinary monsters');
   assert.equal(await page.evaluate(()=>!!Auralis.game.scene.getScene('world').exitPortal.root),false,'re-entry never inherits the old portal');
   for(const boss of entered.bosses){
    await moveFixture(boss);
    assert.equal(await page.evaluate(id=>Auralis.game.scene.getScene('world').monsters.monsters.find(m=>m.id===id)?.alive,boss.id),false,'new visit cannot bypass a boss cooldown');
   }
   const exit=await page.evaluate(()=>({...Auralis.game.scene.getScene('world').regionContent.exit}));await moveFixture(exit);
   await page.getByRole('button',{name:'Покинуть подземелье',exact:true}).click();
   assert.equal(await page.evaluate(()=>Auralis.game.scene.getScene('world').hero.region),variant.region,'normal exit remains available');
   console.log('PASS visit minion death/unload/time, boss hour timer, voluntary glowing portal/touch, reward and fresh re-entry',variant.id,variant.difficulty);
  }
  assert.deepEqual(errors,[]);await page.screenshot({path:root+'/work/browser/task1-dungeons.png'});
  console.log('PASS all 36 task1 dungeon variants and four actual in-dungeon page reloads; no JavaScript errors');
 }finally{if(browser)await browser.close();await host.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
