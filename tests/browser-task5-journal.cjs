// Position, HP and objective progress are explicit fixtures. Acceptance and
// reward claiming use actual rendered NPC buttons; no claim API is called.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {startServer,launchOptions,root,openNpc}=require('./browserHarness.cjs');
const copy={ru:{accept:'Принять задание',claim:'Получить награду',active:'В работе',close:'Закрыть',resume:'Продолжить'},en:{accept:'Accept quest',claim:'Claim reward',active:'In progress',close:'Close',resume:'Continue'},es:{accept:'Aceptar misión',claim:'Recibir recompensa',active:'En curso',close:'Cerrar',resume:'Continuar'}};
(async()=>{const external=process.env.AURALIS_TASK5_URL,host=external?{url:external,close:async()=>{}}:await startServer();let browser;
try{
 browser=await chromium.launch(launchOptions);
 for(const lang of ['ru','en','es']){
  const context=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true});
  await context.addInitScript(l=>localStorage.setItem('auralis_language',l),lang);
  const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(host.url);
  await p.locator('[data-menu-action=new]').click();await p.locator('input').fill('JournalQA');await p.locator('.menu-content>button.primary').click();
  await p.waitForFunction(()=>Auralis.game.scene.getScene('world')?.world);
  await p.evaluate(async()=>{const s=Auralis.game.scene.getScene('world'),{NPCS}=await import('/js/npc/npcData.js'),n=NPCS.find(n=>n.id==='mira');s.world.load({region:n.region,x:n.x,y:n.y});s.hero.hp=s.hero.maxHp=100000;s.save();});
  await openNpc(p,'mira');const npcCard=p.locator('.npc-panel [data-quest-id=forestWolves]');
  await npcCard.getByRole('button',{name:copy[lang].accept,exact:true}).tap();
  assert.equal(await p.evaluate(()=>Auralis.game.scene.getScene('world').hero.quests.forestWolves.state),'active');
  await p.locator('.npc-heading').getByRole('button',{name:copy[lang].close,exact:true}).tap();
  const openJournal=async()=>{await p.locator('#pause-btn').tap();await p.locator('[data-pause-action=quests]').tap();};
  const closeJournal=async()=>{await p.locator('.pause-panel header button').tap();await p.locator('#menu .menu-content>button.primary').tap();};
  const journalCard=p.locator('.pause-panel [data-quest-id=forestWolves]');
  await openJournal();assert.match(await journalCard.innerText(),new RegExp(copy[lang].active));assert.match(await journalCard.innerText(),/0 \/ 5/);await closeJournal();
  await p.evaluate(async()=>{const {recordKill}=await import('/js/quests/quests.js'),s=Auralis.game.scene.getScene('world');recordKill(s.hero,'wolf');s.save();});
  await openJournal();assert.match(await journalCard.innerText(),/1 \/ 5/);await closeJournal();
  await p.evaluate(async()=>{const {recordKill}=await import('/js/quests/quests.js'),s=Auralis.game.scene.getScene('world');for(let i=0;i<4;i++)recordKill(s.hero,'wolf');s.save();});
  await openJournal();assert.match(await journalCard.innerText(),new RegExp(copy[lang].claim));assert.match(await journalCard.innerText(),/5 \/ 5/);
  if(lang!=='ru')assert.doesNotMatch(await p.locator('.pause-panel').innerText(),/[А-Яа-яЁё]/);
  await p.screenshot({path:root+'/work/browser/task5-journal-'+lang+'-pending.png'});await closeJournal();
  // A full page reload must preserve a pending turn-in before any reward.
  await p.reload();await p.locator('[data-menu-action=continue]').tap();await p.locator('.slot-row').first().locator('button.primary').tap();await p.waitForFunction(()=>Auralis.game.scene.getScene('world')?.hero);
  await openJournal();assert.match(await journalCard.innerText(),new RegExp(copy[lang].claim));await closeJournal();
  await openNpc(p,'mira');await npcCard.getByRole('button',{name:copy[lang].claim,exact:true}).tap();
  const claimed=await p.evaluate(()=>{const s=Auralis.game.scene.getScene('world');return {state:s.hero.quests.forestWolves.state,saved:Auralis.Save.load().quests.forestWolves.state,xp:s.hero.xp,level:s.hero.level,inventory:s.hero.inventory};});
  assert.equal(claimed.state,'claimed');assert.equal(claimed.saved,'claimed');
  assert.equal(await npcCard.getByRole('button',{name:copy[lang].claim,exact:true}).count(),0,'claim button is removed immediately');
  await p.locator('.npc-heading').getByRole('button',{name:copy[lang].close,exact:true}).tap();
  await openJournal();assert.equal(await journalCard.count(),0,'claimed quest disappears on next journal open');await p.screenshot({path:root+'/work/browser/task5-journal-'+lang+'-claimed.png'});await closeJournal();
  await p.reload();await p.locator('[data-menu-action=continue]').tap();await p.locator('.slot-row').first().locator('button.primary').tap();await p.waitForFunction(()=>Auralis.game.scene.getScene('world')?.hero);
  await openJournal();assert.equal(await journalCard.count(),0,'claimed quest never returns after reload');await closeJournal();
  const restored=await p.evaluate(async()=>{const {questProgress}=await import('/js/quests/quests.js'),s=Auralis.game.scene.getScene('world');return {state:s.hero.quests.forestWolves.state,xp:s.hero.xp,level:s.hero.level,inventory:s.hero.inventory,dependency:questProgress(s.hero,'forestFangs').state};});
  assert.equal(restored.state,'claimed');assert.equal(restored.xp,claimed.xp);assert.equal(restored.level,claimed.level);assert.deepEqual(restored.inventory,claimed.inventory);assert.equal(restored.dependency,'available');
  await openNpc(p,'mira');assert.equal(await npcCard.locator('button').count(),0,'claimed quest cannot be accepted or rewarded again');assert.deepEqual(errors,[]);
  console.log('PASS task5 journal '+lang+': actual acceptance/reward buttons; active 0/5 and 1/5; localized pending 5/5; pending survives reload; claimed absent immediately and after reload; retained dependency and one-time reward');await context.close();
 }
}finally{if(browser)await browser.close();await host.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
