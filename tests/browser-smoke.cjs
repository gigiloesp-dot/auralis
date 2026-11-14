const {openPausePanel,resumeGame,closeToGame,openMap}=require('./panelNavigation.cjs');
const {openNpc,openStorage}=require('./browserHarness.cjs');
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const root=path.resolve(__dirname,'..');
const server=http.createServer((request,response)=>{
 const file=path.resolve(root,'.'+decodeURIComponent(new URL(request.url,'http://localhost').pathname));
 if(!file.startsWith(root+path.sep)&&file!==root){response.writeHead(403).end();return;}
 const target=file===root?path.join(root,'index.html'):file;
 fs.readFile(target,(error,data)=>{if(error){response.writeHead(404).end();return;}response.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png'})[path.extname(target)]||'application/octet-stream');response.end(data);});
});

(async()=>{await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url='http://127.0.0.1:'+server.address().port;const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),headless:true,args:['--no-sandbox']});try{const p=await b.newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true});let errors=[];p.on('pageerror',e=>{errors.push(e.stack);console.log('PAGEERROR',e.stack)});const run=async(name,fn)=>{await fn();console.log('PASS',name)};const scene=fn=>p.evaluate(fn);const cdp=await p.context().newCDPSession(p);const down=async(sel)=>{const r=await p.locator(sel).boundingBox();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x+r.width*.73,y:r.y+r.height/2,id:1}]});};const up=()=>cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
await p.route('https://**/*',route=>route.abort());await p.goto(url);await p.getByRole('button',{name:'Продолжить',exact:true}).click();await p.getByRole('button',{name:'Создать персонажа',exact:true}).first().click();await p.locator('input').fill('Tester');await p.getByRole('button',{name:'Начать приключение',exact:true}).click();await p.waitForFunction(()=>window.Auralis?.game.scene.getScene('world')?.hero?.name==='Tester');
await run('create and enter',async()=>assert.equal(await scene(()=>Auralis.game.scene.getScene('world').hero.name),'Tester'));
await run('touch joystick movement and reset',async()=>{const before=await scene(()=>Auralis.game.scene.getScene('world').hero.x);const r=await p.locator('#joy').boundingBox();await down('#joy');await p.waitForFunction(before=>Auralis.game.scene.getScene('world').hero.x>before+30,before);await up();assert.ok(await scene(()=>Auralis.game.scene.getScene('world').hero.x)>before+30);assert.equal(await scene(()=>Auralis.game.scene.getScene('world').controls.axis.x),0)});
await run('NPC quest accept',async()=>{await scene(()=>{const s=Auralis.game.scene.getScene('world');s.hero.x=1030;s.hero.y=1140;});await p.waitForTimeout(150);await openNpc(p,'mira');await p.getByRole('button',{name:'Принять задание',exact:true}).click();assert.equal(await scene(()=>Auralis.game.scene.getScene('world').hero.quests.forestWolves.state),'active');await p.getByRole('button',{name:'Закрыть',exact:true}).click()});
await run('quest tracker opens actual objective coordinates on map',async()=>{await p.getByRole('button',{name:'Открыть цели заданий на карте',exact:true}).click();assert.ok((await p.locator('.map-quest-objectives').textContent()).includes('X 1500 / Y 1400'));await p.locator('.world-map header button').click()});
await run('basic attack hold and loot',async()=>{await scene(()=>{const s=Auralis.game.scene.getScene('world');const m=s.monsters.monsters.find(m=>m.id==='forest-starter-wolf-0');s.hero.x=1300;s.hero.y=1240;m.x=m.homeX=1330;m.y=m.homeY=1240;m.hp=1;m.returning=false;m.patrolTarget=null;for(const other of s.monsters.monsters.filter(other=>other!==m)){other.x=2200;other.y=2200;}});await down('#attack');await p.waitForFunction(()=>Auralis.game.scene.getScene('world').hero.xp>=15,null,{timeout:20000});await up();assert.ok(await scene(()=>Auralis.game.scene.getScene('world').hero.xp)>=15);assert.equal(await scene(()=>Auralis.game.scene.getScene('world').hero.quests.forestWolves.progress),1)});
await run('damage and death respawn',async()=>{await scene(()=>{const s=Auralis.game.scene.getScene('world');s.hero.x=1450;s.hero.y=1320;const m=s.monsters.monsters.find(m=>m.id==='forest-starter-wolf-1');m.x=1450;m.y=1320;m.homeX=1450;m.homeY=1320;m.lastHit=-99999;m.returning=false;});const old=await scene(()=>Auralis.game.scene.getScene('world').hero.hp);await p.waitForFunction(old=>Auralis.game.scene.getScene('world').hero.hp<old,old);await scene(()=>Auralis.game.scene.getScene('world').hero.hp=0);await p.waitForFunction(()=>Auralis.game.scene.getScene('world').hero.x===1030);assert.equal(await scene(()=>Auralis.game.scene.getScene('world').hero.x),1030)});
await run('XP level and stat allocation UI',async()=>{await p.evaluate(async()=>{const {grantXp}=await import('/js/systems/progression.js');const s=Auralis.game.scene.getScene('world');grantXp(s.hero,80);s.refreshHud()});assert.equal(await scene(()=>Auralis.game.scene.getScene('world').hero.level),2);await openPausePanel(p,'character');await p.getByRole('button',{name:'Увеличить Сила'}).click();assert.equal(await scene(()=>Auralis.game.scene.getScene('world').hero.stats.strength),6);await closeToGame(p)});
await run('learn and assign skill UI',async()=>{await openPausePanel(p,'skills');await p.locator('.skill-select').first().click();await p.getByRole('button',{name:'Изучить / улучшить (+1)',exact:true}).click();await p.locator('.skill-slot-choices button').first().click();assert.equal(await scene(()=>Auralis.game.scene.getScene('world').hero.skillSlots[0]),'warrior_0');await closeToGame(p);assert.equal(await p.locator('#skills .skill').first().isEnabled(),true)});
await run('skill uses mana cooldown and damage',async()=>{await scene(()=>{const s=Auralis.game.scene.getScene('world');s.hero.x=1450;s.hero.y=1320;s.hero.mp=100;const m=s.monsters.monsters.find(m=>m.id==='forest-starter-wolf-1');m.hp=100;m.maxHp=100;m.x=1490;m.y=1320;s.refreshSkillSlots()});await p.locator('#skills .skill').first().click();assert.ok(await scene(()=>Auralis.game.scene.getScene('world').hero.mp)<100);assert.equal(await p.locator('#skills .skill').first().isDisabled(),true)});
await run('equip item UI',async()=>{await p.evaluate(async()=>{const {addItem}=await import('/js/equipment/items.js');addItem(Auralis.game.scene.getScene('world').hero,{id:'rustySword',rarity:'common'});});await openPausePanel(p,'inventory');await p.getByRole('button',{name:'II · Рюкзак',exact:true}).click();await p.getByRole('button',{name:'Ржавый меч',exact:true}).click();await p.getByRole('button',{name:'Надеть',exact:true}).click();assert.equal(await scene(()=>Auralis.game.scene.getScene('world').hero.equipment.weapon.id),'rustySword');await closeToGame(p)});
await run('potion consumable',async()=>{await scene(()=>{const s=Auralis.game.scene.getScene('world');s.hero.x=1030;s.hero.y=1140;s.hero.hp=20;s.refreshPotions()});await p.getByRole('button',{name:'Зелье здоровья',exact:true}).click();assert.equal(await scene(()=>Auralis.game.scene.getScene('world').hero.potions.hp),2)});
await run('autosave while panel open',async()=>{await openMap(p);await scene(()=>Auralis.game.scene.getScene('world').hero.name='Persisted');await p.waitForTimeout(5300);assert.equal(await scene(()=>Auralis.Save.load(1).name),'Persisted');await closeToGame(p)});
await run('reload restores full hero',async()=>{await p.reload();await p.getByRole('button',{name:'Продолжить',exact:true}).click();await p.getByRole('button',{name:'Продолжить',exact:true}).first().click();await p.waitForFunction(()=>Auralis.game.scene.getScene('world')?.hero?.name==='Persisted');const h=await scene(()=>Auralis.game.scene.getScene('world').hero);assert.equal(h.name,'Persisted');assert.equal(h.equipment.weapon.id,'rustySword');assert.equal(h.skillSlots[0],'warrior_0');assert.equal(h.potions.hp,2);assert.equal(h.quests.forestWolves.progress,1);assert.equal(h.stats.strength,6)});
await run('mobile viewport no overflow and 44px skill targets',async()=>{for(const [width,height] of [[844,390],[640,360],[740,320]]){await p.setViewportSize({width,height});await p.waitForTimeout(150);assert.ok(await scene(()=>document.documentElement.scrollWidth<=innerWidth));const r=await p.locator('#skills .skill').first().boundingBox();assert.ok(r.width>=44&&r.height>=44)}});
await run('quest completion, reward and merchant',async()=>{
 await p.evaluate(async()=>{const {recordKill}=await import('/js/quests/quests.js');const s=Auralis.game.scene.getScene('world');s.hero.x=1030;s.hero.y=1140;for(let i=0;i<4;i++)recordKill(s.hero,'wolf');});
 await p.waitForTimeout(200);await openNpc(p,'mira');await p.locator('[data-quest-id=forestWolves]').getByRole('button',{name:'Получить награду',exact:true}).click();
 assert.equal(await scene(()=>Auralis.game.scene.getScene('world').hero.quests.forestWolves.state),'claimed');
 await p.getByRole('button',{name:'Торговля',exact:true}).click();
 await p.locator('.npc-panel').getByRole('button',{name:/Продать/}).first().click();
 await scene(()=>{const s=Auralis.game.scene.getScene('world');s.hero.gold+=20;s.npcPanel.render();});
 const count=await scene(()=>Auralis.game.scene.getScene('world').hero.potions.hp);
 await p.locator('.npc-panel').getByRole('button',{name:'Купить',exact:true}).first().click();
 assert.equal(await scene(()=>Auralis.game.scene.getScene('world').hero.potions.hp),count+1);await closeToGame(p);
});
await run('shared storage deposit and withdraw',async()=>{
 await p.evaluate(async()=>{const {addItem}=await import('/js/equipment/items.js');const s=Auralis.game.scene.getScene('world');s.hero.x=1090;s.hero.y=1050;addItem(s.hero,{id:'leatherBoots',rarity:'common'});});
 await p.waitForTimeout(200);await openStorage(p,'borin');
 await p.getByRole('button',{name:'Положить: Кожаные сапоги',exact:true}).click();
 assert.equal(await p.evaluate(async()=>{const {SharedStorage}=await import('/js/systems/storage.js');return SharedStorage.load().some(i=>i.id==='leatherBoots');}),true);
 await p.getByRole('button',{name:'Забрать: Кожаные сапоги',exact:true}).click();assert.equal(await scene(()=>Auralis.game.scene.getScene('world').hero.inventory.some(i=>i.id==='leatherBoots')),true);await closeToGame(p);
});
await run('all game panels close by touch and portrait hint works',async()=>{
 for(const [trigger,header] of [['inventory','.inventory-heading'],['character','.character-heading'],['skills','.skill-heading']]){
  await openPausePanel(p,trigger);await p.locator(header+' button').last().click();await resumeGame(p);
  assert.equal(await scene(()=>{const s=Auralis.game.scene.getScene('world');return !!(s.inventoryPanel.opened||s.characterPanel.opened||s.skillsPanel.opened);}),false);
 }
 await p.setViewportSize({width:390,height:844});await p.locator('#rotate-hint').waitFor({state:'visible'});assert.equal(await p.locator('#rotate-hint').isVisible(),true);
 const pausedClock=await scene(()=>Auralis.game.scene.getScene('world').playNow);await p.waitForTimeout(300);assert.equal(await scene(()=>Auralis.game.scene.getScene('world').playNow),pausedClock);
 // CDP viewport acknowledgement precedes delivery of the page's resize event.
 // Wait for the actual orientation response, retaining the visibility check.
 await p.setViewportSize({width:844,height:390});await p.locator('#rotate-hint').waitFor({state:'hidden'});assert.equal(await p.locator('#rotate-hint').isVisible(),false);
});
await run('pause closes overlays and resume restores active scene',async()=>{
 await scene(()=>{const s=Auralis.game.scene.getScene('world');s.hero.x=935;s.hero.y=1080;});
 await openNpc(p,'mira');
 await p.locator('#pause-btn').click();assert.equal(await scene(()=>Auralis.game.scene.isPaused('world')),true);
 assert.equal(await scene(()=>Auralis.game.scene.getScene('world').npcPanel.opened),false);
 await p.getByRole('button',{name:'Продолжить',exact:true}).click();assert.equal(await scene(()=>Auralis.game.scene.isActive('world')),true);
});
await run('save backup rejects invalid input without changing character',async()=>{
 await openPausePanel(p,'backups');
 await p.getByLabel('Или вставь JSON сохранения').fill('{broken');await p.getByRole('button',{name:'Проверить сохранение',exact:true}).click();
 assert.ok((await p.locator('.save-status').innerText()).includes('JSON'));
 assert.equal(await scene(()=>Auralis.game.scene.getScene('world').hero.name),'Persisted');
 await p.getByLabel('Или вставь JSON сохранения').fill(JSON.stringify({version:999,x:100,y:100}));await p.getByRole('button',{name:'Проверить сохранение',exact:true}).click();
 assert.ok((await p.locator('.save-status').innerText()).includes('не поддерживается'));
 await p.getByLabel('Или вставь JSON сохранения').fill(JSON.stringify({version:2,region:'unknown',x:9000,y:9000}));await p.getByRole('button',{name:'Проверить сохранение',exact:true}).click();
 assert.ok((await p.locator('.save-status').innerText()).includes('недоступна'));
 assert.equal(await scene(()=>Auralis.Save.load(1).name),'Persisted');
 await p.locator('.save-panel header button').click();await resumeGame(p);
});
await run('download and confirmed import restore the character across scene restart',async()=>{
 await openPausePanel(p,'backups');
 const downloading=p.waitForEvent('download');await p.getByRole('button',{name:'Скачать персонажа',exact:true}).click();
 const download=await downloading;const data=JSON.parse(fs.readFileSync(await download.path(),'utf8'));assert.equal(data.name,'Persisted');assert.equal(data.equipment.weapon.id,'rustySword');
 data.name='BackupHero';data.gold=1234;
 await p.getByLabel('Или вставь JSON сохранения').fill(JSON.stringify(data));await p.getByRole('button',{name:'Проверить сохранение',exact:true}).click();
 assert.equal(await p.getByRole('button',{name:'Заменить персонажа',exact:true}).isDisabled(),true);
 await p.getByRole('checkbox').check();await p.getByRole('button',{name:'Заменить персонажа',exact:true}).click();
 await p.waitForFunction(()=>Auralis.game.scene.getScene('world').hero?.name==='BackupHero');
 assert.equal(await scene(()=>Auralis.Save.load(1).gold),1234);assert.equal(await scene(()=>JSON.parse(Auralis.Save.exportReplacementBackup(1)).name),'Persisted');
 assert.equal(await scene(()=>Auralis.game.scene.getScene('world').hero.equipment.weapon.id),'rustySword');
});
fs.mkdirSync(path.join(root,'work/browser'),{recursive:true});
await p.screenshot({path:path.join(root,'work/browser/smoke-final.png')});assert.deepEqual(errors,[]);console.log('PASS no page errors');
}finally{await b.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
