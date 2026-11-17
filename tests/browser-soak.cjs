// Desktop Chromium with touch emulation. This is a repeatable resource regression,
// not a physical Android performance certification or a manual full playthrough.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {startServer,launchOptions,root}=require('./browserHarness.cjs');
const cycles=Math.max(7,Math.min(120,Math.floor(Number(process.env.AURALIS_SOAK_CYCLES)||7))),started=Date.now();
const path=require('node:path');
(async()=>{const hosting=await startServer();let browser;
 try{
  browser=await chromium.launch(launchOptions);
  const context=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(hosting.url);await page.getByRole('button',{name:'Продолжить',exact:true}).click();
  await page.getByRole('button',{name:'Создать персонажа',exact:true}).first().click();
  await page.locator('input').fill('TouchSoak');await page.getByRole('button',{name:'Начать приключение',exact:true}).click();
  await page.waitForFunction(()=>window.Auralis?.game.scene.getScene('world')?.world);
  const cdp=await context.newCDPSession(page);await cdp.send('Performance.enable');
  const start=await page.evaluate(()=>{
   const s=Auralis.game.scene.getScene('world'),h=s.hero;h.level=42;h.maxHp=h.hp=100000;h.speed=45;h.attackSpeedBonus=2;
   s.world.load({region:'forest',x:1330,y:1240});s.monsters.update(s.playNow,0);
   const m=s.monsters.monsters.find(m=>m.id==='forest-starter-wolf-0');if(!m)throw Error('Missing touch target');
   for(const other of s.monsters.monsters)if(other!==m)other.alive=false;
   m.x=m.homeX=1370;m.y=m.homeY=1240;m.hp=m.maxHp=100000;m.rootUntil=s.playNow+10000;
   return {x:h.x,y:h.y,targetHp:m.hp};
  });
  const joy=await page.locator('#joy').boundingBox(),attack=await page.locator('#attack').boundingBox();assert.ok(joy&&attack);
  const finger1={id:1,x:joy.x+joy.width/2,y:joy.y+joy.height/2},finger2={id:2,x:attack.x+attack.width/2,y:attack.y+attack.height/2};
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[finger1]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[finger1,finger2]});
  finger1.x+=joy.width/4;
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[finger1,finger2]});
  await page.waitForFunction(start=>{const s=Auralis.game.scene.getScene('world'),m=s.monsters.monsters.find(m=>m.id==='forest-starter-wolf-0');return s.controls.pointerId!==null&&s.controls.attackPointerId!==null&&s.controls.attacking&&Math.hypot(s.hero.x-start.x,s.hero.y-start.y)>5&&m.hp<start.targetHp;},start,{timeout:10000}).catch(async error=>{console.error('TOUCH STATE',await page.evaluate(()=>{const s=Auralis.game.scene.getScene('world'),c=s.controls;return {hero:{x:s.hero.x,y:s.hero.y,hp:s.hero.hp},axis:s.axis,controls:{pointerId:c.pointerId,attackPointerId:c.attackPointerId,attacking:c.attacking},target:s.monsters.selected?.id,monsters:s.monsters.monsters.map(m=>({id:m.id,hp:m.hp,x:m.x,y:m.y,alive:m.alive,visible:s.monsters.canSee(m)}))};}));throw error;});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await page.waitForFunction(()=>{const c=Auralis.game.scene.getScene('world').controls;return c.pointerId===null&&c.attackPointerId===null&&!c.attacking&&c.axis.x===0&&c.axis.y===0;});
  console.log('PASS simultaneous real CDP joystick and attack touch pointers; movement, damage and release reset');
  const samples=[];
  for(let cycle=0;cycle<cycles;cycle++){
   const peak=await page.evaluate(async()=>{
    const s=Auralis.game.scene.getScene('world'),{DUNGEONS}=await import('/js/dungeons/dungeonSystem.js');let chunks=0,monsters=0;
    for(const region of ['forest','north','ancient']){
     s.hero.hp=s.hero.maxHp;s.world.load({region,x:1030,y:1140});
     const c=s.regionContent;
     for(const point of [c.spawn,{x:c.width-100,y:c.height-100},c.camps[Math.floor(c.camps.length/2)]]){
      s.hero.x=point.x;s.hero.y=point.y;s.world.chunkWorld.update(s.hero);s.obstacles=s.world.chunkWorld.obstacles;s.monsters.update(s.playNow,0);
      chunks=Math.max(chunks,s.world.diagnostics.loadedChunks);monsters=Math.max(monsters,s.monsters.monsters.length);await new Promise(requestAnimationFrame);
     }
     const d=DUNGEONS.find(d=>d.region===region);s.world.load({region,x:d.x,y:d.y});const result=s.enterDungeon(d.id,'hard');if(!result.ok)throw Error('Soak dungeon entry '+result.reason);
     await new Promise(requestAnimationFrame);if(!s.leaveDungeon().ok)throw Error('Soak dungeon exit');
    }
    s.world.load({region:'forest',x:1030,y:1140});await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);
    return {chunks,monsters};
   });
   // Region changes can queue atlas downloads beyond the two rendering frames.
   // Compare resident resources only after all pending loads have completed and
   // their zero-owner leases have been released. Keep every original bound.
   await page.waitForFunction(()=>{const s=Auralis.game.scene.getScene('world');return !s.load.isLoading()&&s.actorTextures.diagnostics.actorPending===0;});
   const ownership=await page.evaluate(()=>{const s=Auralis.game.scene.getScene('world'),expected=new Map(),keep=e=>{if(e)expected.set(e.key,(expected.get(e.key)||0)+1);};keep(s.rig.painted?.entry);for(const c of s.world.chunkWorld.chunks.values())for(const a of c.npcActors||[])keep(a.entry);for(const m of s.monsters.monsters)keep(m.painted?.entry);return {expected:[...expected].sort(),actual:[...s.actorTextures.entries].map(([key,r])=>[key,r.refs]).sort(),textures:s.textures.getTextureKeys().filter(key=>key.startsWith('actor-')).sort()};});
   assert.deepEqual(ownership.actual,ownership.expected,'Every atlas lease must have exactly its live owners');
   assert.deepEqual(ownership.textures,ownership.expected.map(([key])=>key),'Released or orphan actor textures must not survive loader completion');
   await cdp.send('HeapProfiler.collectGarbage');
   const metrics=(await cdp.send('Performance.getMetrics')).metrics;
   const sample=await page.evaluate(()=>{const s=Auralis.game.scene.getScene('world');return {children:s.children.list.length,textures:s.textures.getTextureKeys().length,dom:document.querySelectorAll('*').length,loadedChunks:s.world.diagnostics.loadedChunks,loadedMonsters:s.monsters.monsters.length,textureScratchReferences:Phaser.GameObjects.Graphics.TargetCamera.renderList.length};});
   sample.heap=metrics.find(m=>m.name==='JSHeapUsedSize').value;sample.cycle=cycle;sample.peakChunks=peak.chunks;sample.peakMonsters=peak.monsters;samples.push(sample);assert.equal(sample.textureScratchReferences,0,'Offscreen camera retains baked Graphics objects');
   assert.ok(peak.chunks<=55,'Chunk bound: '+JSON.stringify(sample));assert.ok(peak.monsters<100,'Entity bound: '+JSON.stringify(sample));
   console.log('PASS resource cycle',JSON.stringify(sample));
  }
  const baseline=samples[1],last=samples.at(-1);
  assert.ok(last.children<=baseline.children+10,'Display objects accumulate across transitions');
  assert.ok(last.textures<=baseline.textures+2,'Textures accumulate across transitions');
  assert.ok(last.dom<=baseline.dom+5,'DOM nodes accumulate across transitions');
  assert.ok(last.heap<=baseline.heap+12*1024*1024,'Retained JS heap grows by more than12MiB after GC');
  const frames=await page.evaluate(async()=>{const delta=[];let before=performance.now();for(let i=0;i<60;i++){await new Promise(requestAnimationFrame);const now=performance.now();delta.push(now-before);before=now;}return {samples:delta.length,meanMs:delta.reduce((a,b)=>a+b,0)/delta.length,p95Ms:[...delta].sort((a,b)=>a-b)[Math.floor(delta.length*.95)]};});
  console.log('OBSERVED desktop headless Chromium frame timing (not Android)',JSON.stringify(frames));
  assert.deepEqual(errors,[]);await page.screenshot({path:path.join(root,'work/browser/soak-mobile.png')});
  console.log('PASS'+cycles+' resource cycles,'+(cycles*3)+' regional dungeon entries/exits; no JavaScript errors; elapsedSeconds='+Math.round((Date.now()-started)/1000));
 }finally{if(browser)await browser.close();await hosting.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
