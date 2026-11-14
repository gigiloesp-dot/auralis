// Explicit level/skill-point fixtures unlock coverage. Learning, assignments,
// casting, pause panels, locale changes and save restoration use real UI.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const {startServer,launchOptions,root,openNpc}=require('./browserHarness.cjs');
const words={ru:{play:'Играть',create:'Создать персонажа',start:'Начать приключение',resume:'Продолжить',back:'Назад',continue:'Продолжить'},en:{play:'Play',create:'Create character',start:'Begin adventure',resume:'Resume',back:'Back',continue:'Continue'},es:{play:'Jugar',create:'Crear personaje',start:'Comenzar aventura',resume:'Continuar',back:'Volver',continue:'Continuar'}};
const classes=['warrior','archer','mage','paladin','assassin','cannoneer'];
const languages=process.env.AURALIS_TASK2_LANGS?.split(',')||['ru','en','es'],selectedClasses=process.env.AURALIS_TASK2_CLASSES?.split(',')||classes;
assert.ok(languages.length&&languages.every(l=>Object.hasOwn(words,l)));assert.ok(selectedClasses.length&&selectedClasses.every(c=>classes.includes(c)));
(async()=>{const external=process.argv[2];if(external&&!external.startsWith('https://'))throw Error('Public target must use HTTPS');const host=external?{url:external,close:async()=>{}}:await startServer();let browser;try{
 browser=await chromium.launch(launchOptions);let cases=0;
 for(const language of languages)for(const classId of selectedClasses){
  const context=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true});await context.addInitScript(lang=>{if(!localStorage.getItem('auralis_language'))localStorage.setItem('auralis_language',lang);},language);
  const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));const w=words[language];await p.goto(host.url);await p.getByRole('button',{name:w.play,exact:true}).click();await p.getByRole('button',{name:w.create,exact:true}).first().click();await p.locator('.class-card:has(.hero-'+classId+')').click();await p.locator('input').fill('InterfaceQA');await p.getByRole('button',{name:w.start,exact:true}).click();await p.waitForFunction(()=>Auralis.game.scene.getScene('world')?.hero?.name==='InterfaceQA');
  await p.evaluate(()=>{const s=Auralis.game.scene.getScene('world');s.hero.level=42;s.hero.skillPoints=25;s.refreshHud();});
  assert.equal(await p.locator('#active-effects').isVisible(),false,'permanent passives and cooldowns must not create timed badges');
  await p.locator('#skills-btn').click();await p.locator('#skills-tab-active').click();assert.equal(await p.locator('.skill-select').count(),5);
  const assigned=[0,1,3,4];
  for(let slot=0;slot<4;slot++){await p.locator('[data-skill-id="'+classId+'_'+assigned[slot]+'"]').click();await p.locator('.skill-learn').click();await p.locator('.skill-slot-choices button').nth(slot).click();}
  await p.locator('[data-skill-id="'+classId+'_0"]').click();await p.locator('.skill-remove').click();assert.equal(await p.evaluate(()=>Auralis.game.scene.getScene('world').hero.skillSlots[0]),null);await p.locator('.skill-slot-choices button').first().click();
  await p.locator('#skills-tab-passive').click();assert.equal(await p.locator('.skill-select').count(),2);await p.locator('.skill-select').first().click();assert.equal(await p.locator('.skill-learn,.skill-slot-choices,.skill-remove').count(),0,'automatic properties must not spend points or occupy active slots');
  const skillText=await p.locator('#skills-panel').innerText();if(language!=='ru')assert.doesNotMatch(skillText,/[А-Яа-яЁё]/);assert.equal(await p.evaluate(()=>Auralis.game.scene.getScene('world').hero.skillPoints),21);
  await p.locator('.skill-heading button').click();
  const effectIndex=classId==='archer'?3:1,effectId=classId+'_'+effectIndex,buttonIndex=assigned.indexOf(effectIndex);await p.locator('#skills .skill').nth(buttonIndex).tap();
  await p.locator('[data-effect-id="'+effectId+'"]').waitFor({state:'visible'});const badge=p.locator('[data-effect-id="'+effectId+'"]');assert.match(await badge.innerText(),/^\d+(?::\d{2})?$/);assert.equal(await badge.locator('svg').count(),1);assert.ok(await badge.getAttribute('aria-label'));if(language==='ru'&&classId==='warrior')await p.screenshot({path:root+'/work/browser/task2-hud.png'});
  if(language==='ru')for(const [width,height]of [[844,390],[640,360],[740,320],[915,412]]){
   await p.setViewportSize({width,height});await p.waitForFunction(({width,height})=>innerWidth===width&&innerHeight===height,{width,height});
   const geometry=await p.evaluate(()=>{const box=id=>{const r=document.getElementById(id).getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};};return {hp:box('health'),mp:box('mana'),xp:box('experience'),portrait:box('hud-portrait'),level:box('hero-level'),overflow:['hptext','mptext','xptext'].some(id=>{const n=document.getElementById(id);return n.scrollWidth>n.clientWidth;})};});
   assert.ok(geometry.hp.w<=170&&geometry.portrait.w<=32&&geometry.portrait.h<=36);assert.ok(geometry.hp.h>geometry.mp.h&&geometry.mp.h>=geometry.xp.h);assert.equal(geometry.overflow,false);assert.ok(geometry.level.w>0&&geometry.level.h>=14);
  }
  await p.setViewportSize({width:844,height:390});
  // Cast can expire while slower geometry checks run. Recast only via the real
  // button if necessary, preserving normal mana and cooldown rules.
  if(!(await badge.isVisible())){await p.waitForFunction(index=>!document.querySelectorAll('#skills .skill')[index].disabled,buttonIndex);await p.locator('#skills .skill').nth(buttonIndex).tap();await badge.waitFor({state:'visible'});}
  await p.locator('#pause-btn').click();assert.equal(await p.evaluate(()=>Auralis.game.scene.isPaused('world')),true);
  const frozen=await p.evaluate(()=>{const s=Auralis.game.scene.getScene('world');return {clock:s.playNow,hp:s.hero.hp,x:s.hero.x,y:s.hero.y,buffs:{...s.monsters.buffs},monsters:s.monsters.monsters.map(m=>[m.id,m.x,m.y,m.hp])};});
  const stable=async()=>assert.deepEqual(await p.evaluate(()=>{const s=Auralis.game.scene.getScene('world');return {clock:s.playNow,hp:s.hero.hp,x:s.hero.x,y:s.hero.y,buffs:{...s.monsters.buffs},monsters:s.monsters.monsters.map(m=>[m.id,m.x,m.y,m.hp])};}),frozen);
  assert.equal(await p.locator('.pause-grid button').count(),8);assert.equal(await p.locator('[data-pause-action=storage]').count(),0);
  for(const tile of await p.locator('.pause-grid button').all()){const r=await tile.boundingBox();assert.ok(r.width>=44&&r.height>=44&&Math.abs(r.width-r.height)<=2);assert.equal(await tile.locator('svg').count(),1);}
  if(language==='ru'&&classId==='warrior')for(const [width,height]of [[640,360],[740,320],[915,412]]){await p.setViewportSize({width,height});const r=await p.locator('.menu-panel').boundingBox();assert.ok(r.y>=0&&r.y+r.height<=height);await p.getByRole('button',{name:w.resume,exact:true}).waitFor({state:'visible'});}
  await p.setViewportSize({width:844,height:390});await p.waitForTimeout(150);await stable();if(language==='ru'&&classId==='warrior')await p.screenshot({path:root+'/work/browser/task2-pause.png'});
  for(const [action,selector]of [['inventory','#inventory-panel'],['skills','#skills-panel'],['character','#character-panel'],['quests','.pause-panel'],['backups','.save-panel'],['guide','.pause-panel']]){
   await p.locator('[data-pause-action='+action+']').click();await p.locator(selector).waitFor({state:'visible'});assert.equal(await p.evaluate(()=>Auralis.game.scene.isPaused('world')),true);await p.waitForTimeout(80);await stable();const content=await p.locator(selector).innerText();if(language!=='ru')assert.doesNotMatch(content,/[А-Яа-яЁё]/);await p.locator(selector+(action==='character'?' .character-heading button':' header button')).last().click();await p.locator('.pause-grid').waitFor({state:'visible'});
  }
  // Switch language in place: no actor restart or simulation-time advancement.
  await p.locator('[data-pause-action=settings]').click();assert.ok((await p.locator('#menu select').boundingBox()).height>=44);assert.ok((await p.getByRole('button',{name:w.back,exact:true}).boundingBox()).height>=44);const changed=language==='en'?'es':'en';await p.locator('#menu select').selectOption(changed);assert.equal(await p.evaluate(()=>Auralis.game.scene.getScene('world').language),changed);await stable();await p.locator('#menu select').selectOption(language);await p.getByRole('button',{name:w.back,exact:true}).click();await p.locator('.pause-grid').waitFor({state:'visible'});await stable();
  await p.getByRole('button',{name:w.resume,exact:true}).click();await p.waitForFunction(()=>Auralis.game.scene.isActive('world'));
  if(language==='ru'){await p.locator('[data-effect-id="'+effectId+'"]').waitFor({state:'hidden',timeout:15000});console.log('PASS real timed effect expires',classId);}
  await p.evaluate(()=>Auralis.game.scene.getScene('world').save());await p.reload();await p.getByRole('button',{name:w.play,exact:true}).click();await p.getByRole('button',{name:w.continue,exact:true}).first().click();await p.waitForFunction(()=>Auralis.game.scene.getScene('world')?.hero?.name==='InterfaceQA');assert.deepEqual(await p.evaluate(()=>Auralis.game.scene.getScene('world').hero.skillSlots),assigned.map(index=>classId+'_'+index));
  if(language==='ru'&&classId==='warrior'){
   await p.locator('#pause-btn').click();await p.locator('[data-pause-action=backups]').click();const data=await p.evaluate(()=>Auralis.Save.export(Auralis.Save.activeSlot));await p.locator('.save-panel textarea').fill(data);await p.getByRole('button',{name:'Проверить сохранение',exact:true}).click();await p.locator('.save-confirmation input').check();await p.getByRole('button',{name:'Заменить персонажа',exact:true}).click();await p.waitForFunction(()=>{const s=Auralis.game.scene.getScene('world');return s?.hero?.name==='InterfaceQA'&&Auralis.game.scene.isPaused('world')&&!Auralis.menu.root.hidden;});await p.waitForTimeout(150);assert.equal(await p.evaluate(()=>Auralis.game.scene.getScene('world').playNow),0,'backup import from pause must never advance the restarted world');await p.getByRole('button',{name:w.resume,exact:true}).click();
   await openNpc(p,'mira');await p.locator('[data-quest-id=forestWolves]').getByRole('button',{name:'Принять задание',exact:true}).click();await p.locator('.npc-heading button').click();const before=await p.evaluate(()=>JSON.stringify(Auralis.game.scene.getScene('world').hero.quests));await p.locator('#pause-btn').click();await p.locator('[data-pause-action=quests]').click();assert.equal(await p.locator('.pause-panel [data-quest-id=forestWolves]').count(),1);assert.equal(await p.locator('.pause-panel button').count(),1,'journal is read-only; quest services remain with NPCs');await p.locator('.pause-panel header button').click();await p.getByRole('button',{name:w.resume,exact:true}).click();assert.equal(await p.evaluate(()=>JSON.stringify(Auralis.game.scene.getScene('world').hero.quests)),before);
  }
  await p.locator('#pause-btn').click();
  if(language==='ru'&&classId==='warrior'){
   await p.evaluate(()=>{window.task2OriginalWrite=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key===Auralis.Save.key(Auralis.Save.activeSlot))throw Error('task2 quota fixture');return window.task2OriginalWrite.call(this,key,value);};});
   try{await p.locator('[data-pause-action=main]').click();assert.equal(await p.evaluate(()=>Auralis.game.scene.isPaused('world')&&Auralis.menu.page==='pause'),true);await p.getByRole('alert').waitFor({state:'visible'});assert.equal(await p.evaluate(()=>Auralis.game.scene.getScene('world').hero.name),'InterfaceQA');}
   finally{await p.evaluate(()=>{Storage.prototype.setItem=window.task2OriginalWrite;delete window.task2OriginalWrite;});}
  }
  await p.locator('[data-pause-action=main]').click();await p.waitForFunction(()=>Auralis.menu.page==='slots'&&!Auralis.game.scene.isActive('world')&&!Auralis.game.scene.isPaused('world'));assert.deepEqual(errors,[]);
  console.log('PASS task2 HUD, active/passive, 4 assignments/reload, real buff, frozen pause and all sections',language,classId);cases++;await context.close();
 }
 assert.equal(cases,languages.length*selectedClasses.length);console.log('PASS task2 all '+cases+' class/language combinations, four phone sizes; no JavaScript errors');
 }finally{if(browser)await browser.close();await host.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
