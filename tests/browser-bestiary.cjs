// Integration fixtures select real species and simulation times. All movement,
// telegraphs, impacts, statuses and resource cleanup use the actual runtime.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {startServer,launchOptions}=require('./browserHarness.cjs');
(async()=>{const host=await startServer();let browser;try{
 browser=await chromium.launch(launchOptions);const context=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(host.url);await page.getByRole('button',{name:'Играть',exact:true}).click();await page.getByRole('button',{name:'Создать персонажа',exact:true}).first().click();await page.locator('input').fill('Bestiary');await page.getByRole('button',{name:'Начать приключение',exact:true}).click();await page.waitForFunction(()=>Auralis.game.scene.getScene('world').hero);
 const results=await page.evaluate(async()=>{
  const s=Auralis.game.scene.getScene('world'),{movementProfile}=await import('/js/monsters/movementProfiles.js');s.scene.pause();const results=[];
  for(const type of ['forestWolf','wildBoar','forestOrc','spider','forestBat','frostGolem','wraith','iceElemental','scarab','ancientGargoyle']){
   s.world.load({region:'forest',x:1330,y:1240});const system=s.monsters,h=s.hero;h.hp=h.maxHp=100000;h.monsterAfflictions={};for(const m of [...system.monsters])system.removeMonster(m);system.stream=null;
   const m=system.spawn({id:'bestiary-fixture-'+type,type,level:1,x:1450,y:1240}),profile=movementProfile(m.kind);m.attack=40;h.x=m.x-(profile.locomotion==='heavy'||type==='forestOrc'?80:120);h.y=m.y;m.lastHit=100000;m.lastSlam=100000;m.lastAbilityAt=0;const now=20000,before={hp:h.hp,x:m.x,y:m.y};
   system.update(now,0);if(m.specialState?.ability!==profile.ability)throw Error(type+' did not start its actual ability: '+JSON.stringify(m.specialState));const marker=m.specialState.marker;if(!marker?.active)throw Error(type+' missing live Phaser telegraph');
   system.update(now+profile.windup+1,0);const pending=system.hostileProjectiles.length;if(pending)system.update(now+profile.windup+101,.6);
   const damaged=h.hp<before.hp,moved=Math.hypot(m.x-before.x,m.y-before.y)>10,statuses=Object.keys(h.monsterAfflictions||{});if(!damaged)throw Error(type+' ability never hit the stationary target');if(['pounce','charge','dive','burrow','blink'].includes(profile.ability)&&!moved)throw Error(type+' movement ability was only visual');if(type==='spider'&&!statuses.includes('poison'))throw Error('Venom did not inflict poison');if(type==='scarab'&&!statuses.includes('slow'))throw Error('Burrowing did not slow the hero');if(marker.active)throw Error(type+' leaked a telegraph');
   if(profile.elevation>0){const p=s.project(m.x,m.y);if(m.body.y>=p.y-10)throw Error(type+' did not rise above its ground shadow');}
   results.push({type,ability:profile.ability,damage:before.hp-h.hp,moved,projectile:pending>0,statuses});
  }
  // The real world allows flight across its river but retains its physical map
  // bounds and tall decoration collision, unlike ground actors.
  const {riverX}=await import('/js/world/chunkGeometry.js'),{getRegionContent}=await import('/js/world/regionContent.js'),c=getRegionContent('forest'),y=4000,x=riverX(c,y);s.world.load({region:'forest',x:x-110,y});const sys=s.monsters;for(const m of [...sys.monsters])sys.removeMonster(m);sys.stream=null;const bat=sys.spawn({id:'flight-fixture',type:'forestBat',x:x-100,y}),wolf=sys.spawn({id:'ground-fixture',type:'forestWolf',x:x-100,y});sys.move(bat,x+100,y,200);sys.move(wolf,x+100,y,200);if(bat.x<x+80||wolf.x>x-25)throw Error('Ground/flight river traversal did not differ');if(sys.canOccupy(bat,2,2))throw Error('Flying actor escaped map bounds');
  const tall=s.obstacles.find(o=>o.flightBlocked&&o.r>10);if(!tall)throw Error('No actual tall obstruction streamed');if(sys.canOccupy(bat,tall.x,tall.y))throw Error('Flying actor passed through a tall structure/tree');
  results.push({river:true,batX:bat.x,wolfX:wolf.x,bounds:true,tallObstacle:true});
  // A destroyed/streamed actor must release its outstanding warning immediately.
  bat.x=bat.homeX=s.hero.x+120;bat.y=bat.homeY=s.hero.y;s.hero.hp=100000;bat.lastAbilityAt=0;sys.update(40000,0);const warning=bat.specialState?.marker;if(!warning)throw Error('Missing cleanup fixture marker');sys.removeMonster(bat);if(warning.active)throw Error('Streaming leaked an ability telegraph');
  return results;
 });for(const r of results)console.log('PASS real bestiary',JSON.stringify(r));assert.deepEqual(errors,[]);console.log('PASS actual species abilities, statuses, flight collision and telegraph cleanup');
 }finally{if(browser)await browser.close();await host.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
