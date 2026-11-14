// Explicit isolated encounter fixtures; firing, pursuit, patrol, death and
// respawn are performed by the actual Phaser runtime and touch control.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {startServer,launchOptions,root}=require('./browserHarness.cjs');
(async()=>{const host=await startServer();let browser;try{
 browser=await chromium.launch(launchOptions);const context=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true}),p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(host.url);await p.getByRole('button',{name:'Продолжить',exact:true}).click();await p.getByRole('button',{name:'Создать персонажа',exact:true}).first().click();await p.locator('.class-card:has(.hero-mage)').click();await p.locator('input').fill('ThreatQA');await p.getByRole('button',{name:'Начать приключение',exact:true}).click();await p.waitForFunction(()=>Auralis.game.scene.getScene('world')?.rig?.paintedActive);
 const initial=await p.evaluate(()=>{
  const s=Auralis.game.scene.getScene('world');s.world.load({region:'forest',x:1330,y:1240});s.hero.hp=s.hero.maxHp=100000;s.hero.mp=s.hero.maxMp=1000;
  const id='forest-starter-wolf-2';for(const d of s.monsters.stream.descriptors)if(d.id!==id)s.hero.worldState.monsters[s.monsters.stateKey(d)]={deadUntil:Date.now()+3600000,killedAt:Date.now(),hp:0};
  for(const m of s.monsters.monsters)if(m.id!==id){m.alive=false;m.respawnAt=Date.now()+3600000;s.monsters.setMonsterVisible(m,false);}
  const m=s.monsters.monsters.find(m=>m.id===id);if(!m)throw Error('Missing actual wolf');m.x=m.homeX=1530;m.y=m.homeY=1220;m.hp=m.maxHp=5000;m.aggroUntil=0;m.behaviorState='idle';m.returning=false;m.nextPatrolAt=s.playNow+60000;m.patrolTarget=null;
  if(!s.monsters.sight(s.hero,m))throw Error('Fixture must have clear physical sight');s.clearTarget();s.monsters.update(s.playNow,0);
  return {id,distance:Math.hypot(m.x-s.hero.x,m.y-s.hero.y),hp:m.hp};
 });assert.ok(initial.distance>190&&initial.distance<300);
 const cdp=await context.newCDPSession(p),attack=await p.locator('#attack').boundingBox();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:2,x:attack.x+attack.width/2,y:attack.y+attack.height/2}]});await p.waitForFunction(({id,hp})=>Auralis.game.scene.getScene('world').monsters.monsters.find(m=>m.id===id)?.hp<hp,initial);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await p.waitForFunction(({id,distance})=>{const s=Auralis.game.scene.getScene('world'),m=s.monsters.monsters.find(m=>m.id===id);return m?.alive&&m.behaviorState==='chase'&&Math.hypot(m.x-s.hero.x,m.y-s.hero.y)<distance-25;},initial);console.log('PASS actual ranged touch damage outside detection activates pursuit');
 await p.evaluate(id=>{const s=Auralis.game.scene.getScene('world'),m=s.monsters.monsters.find(m=>m.id===id);Object.assign(s.hero,{x:1030,y:1140});m.x=m.homeX=1370;m.y=m.homeY=1240;m.aggroUntil=0;m.returning=false;m.behaviorState='idle';m.patrolTarget=null;m.nextPatrolAt=s.playNow;s.clearTarget();},initial.id);
 await p.waitForFunction(id=>{const s=Auralis.game.scene.getScene('world'),m=s.monsters.monsters.find(m=>m.id===id);return m?.behaviorState==='patrol'&&Math.hypot(m.x-m.homeX,m.y-m.homeY)>10;},initial.id);
 await p.waitForFunction(id=>Auralis.game.scene.getScene('world').monsters.monsters.find(m=>m.id===id)?.behaviorState==='idle',initial.id,{timeout:15000});console.log('PASS actual idle patrol moves and pauses while player is in a safe settlement');
 const dead=await p.evaluate(id=>{const s=Auralis.game.scene.getScene('world'),m=s.monsters.monsters.find(m=>m.id===id);s.monsters.hit(m,999999,s.playNow);return {deadUntil:s.hero.worldState.monsters[m.key].deadUntil,killedAt:s.hero.worldState.monsters[m.key].killedAt};},initial.id);assert.equal(dead.deadUntil-dead.killedAt,30000);
 await p.evaluate(id=>{const s=Auralis.game.scene.getScene('world'),m=s.monsters.monsters.find(m=>m.id===id);s.hero.x=m.homeX;s.hero.y=m.homeY;const before=Date.now;Date.now=()=>before()+30001;try{s.monsters.update(s.playNow+1000,0);}finally{Date.now=before;}},initial.id);
 const respawned=await p.evaluate(id=>{const s=Auralis.game.scene.getScene('world'),m=s.monsters.monsters.find(m=>m.id===id);return {alive:m.alive,distance:Math.hypot(m.x-s.hero.x,m.y-s.hero.y),walkable:s.world.isWalkable(m.x,m.y),homeDistance:Math.hypot(m.x-m.homeX,m.y-m.homeY)};},initial.id);assert.equal(respawned.alive,true);assert.ok(respawned.distance>=56);assert.equal(respawned.walkable,true);assert.ok(respawned.homeDistance<150);console.log('PASS actual thirty-second respawn finds a free camp position away from the player');
 assert.deepEqual(errors,[]);await p.screenshot({path:root+'/work/browser/task1-ai.png'});console.log('PASS combat behavior integration without JavaScript errors');
 }finally{await browser?.close();await host.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
