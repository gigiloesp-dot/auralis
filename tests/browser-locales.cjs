const {startServer,launchOptions}=require('./browserHarness.cjs');
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const cyr=/[А-Яа-яЁё]/;
(async()=>{const hosting=await startServer();let b;try{b=await chromium.launch(launchOptions);
for(const lang of ['en','es']){
 const context=await b.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true});await context.addInitScript(lang=>localStorage.setItem('auralis_language',lang),lang);const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(hosting.url,{waitUntil:'networkidle'});
 // Network idleness can precede module evaluation and Menu construction on a
 // busy runner. Scan the ready home screen, after the actual menu is rendered.
 await p.waitForFunction(()=>window.Auralis?.menu?.page==='home');await p.getByRole('button',{name:lang==='en'?'Continue':'Continuar',exact:true}).waitFor({state:'visible'});
 const scan=async(label,selector='body')=>{const text=await p.locator(selector).innerText();assert.equal(cyr.test(text),false,lang+' '+label+' has untranslated text: '+text);if(!cyr.test(text)) console.log('PASS',lang,label);};
 await scan('home');await p.getByRole('button',{name:lang==='en'?'Continue':'Continuar',exact:true}).click();await p.getByRole('button',{name:lang==='en'?'Create character':'Crear personaje',exact:true}).first().click();await scan('six class menu','.class-grid');assert.equal(await p.locator('.class-card').count(),6);await p.locator('input').fill('LocaleTest');await p.getByRole('button',{name:lang==='en'?'Begin adventure':'Comenzar aventura',exact:true}).click();await p.waitForFunction(()=>Auralis.game.scene.getScene('world').hero?.name==='LocaleTest');await p.waitForTimeout(250);await scan('HUD');
 await p.evaluate(async()=>{const s=Auralis.game.scene.getScene('world'),{grantXp}=await import('/js/systems/progression.js');grantXp(s.hero,1000000);s.hero.skillPoints=50;const{addItem}=await import('/js/equipment/items.js');addItem(s.hero,{id:'rustySword',rarity:'common'});});
 await p.locator('#character-btn').click();await scan('stats','#character-panel');await p.keyboard.press('Escape');
 for(const cls of ['warrior','archer','mage','paladin','assassin','cannoneer']){await p.evaluate(cls=>{const s=Auralis.game.scene.getScene('world');s.hero.classId=cls;s.skillsPanel.show();s.skillsPanel.selectSkill(cls+'_0');},cls);await scan('skills '+cls,'#skills-panel');await p.keyboard.press('Escape');}
 await p.evaluate(()=>Auralis.game.scene.getScene('world').hero.classId='warrior');await p.locator('#inventory-btn').click();await scan('gear','#inventory-panel');await p.locator('.inventory-tabs button').last().click();await p.locator('.inventory-cell.occupied').first().click();await scan('item detail','.item-detail');await p.keyboard.press('Escape');
 await p.locator('.save-backup-btn').click();await scan('backup','.save-panel');await p.keyboard.press('Escape');await p.locator('.map-open').click();await scan('map','.world-map');await p.keyboard.press('Escape');
 const npcs=await p.evaluate(()=>Auralis.game.scene.getScene('world').regionContent.npcs.map(n=>({id:n.id,x:n.x,y:n.y,roles:n.roles})));for(const npc of npcs){await p.evaluate(n=>{const s=Auralis.game.scene.getScene('world');s.closePanels();s.hero.x=n.x;s.hero.y=n.y;s.world.update();s.npcPanel.show(s.regionContent.npcs.find(x=>x.id===n.id));},npc);await scan('NPC '+npc.id,'.npc-panel');for(const tab of await p.locator('.npc-tabs button').all()){await tab.click();await scan('NPC '+npc.id+' tab','.npc-panel');}await p.keyboard.press('Escape');}
 await p.evaluate(()=>{const s=Auralis.game.scene.getScene('world'),d=s.regionContent.dungeons[0];s.hero.x=d.x;s.hero.y=d.y;s.world.update();s.dungeonPanel.show();});await scan('dungeon','.dungeon-panel');await p.keyboard.press('Escape');
 const death=await p.evaluate(async()=>{const s=Auralis.game.scene.getScene('world');s.hero.hp=0;await new Promise(r=>setTimeout(r,160));return {hp:s.hero.hp,state:s.rig.animationState,rotation:s.body.rotation};});console.log('ANIMATION',lang,death);assert.equal(death.state,'death');await p.waitForFunction(()=>Auralis.game.scene.getScene('world').hero.hp>0,null,{timeout:15000});
 assert.deepEqual(errors,[]);console.log('PASS no page errors',lang);await context.close();
}
}finally{if(b)await b.close();await hosting.close()}})().catch(e=>{console.error(e);process.exitCode=1});
