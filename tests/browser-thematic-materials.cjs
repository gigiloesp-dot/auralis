// New isolated browser contexts only. Position/HP/RNG/inventory fixtures are
// explicit: actual MonsterSystem death creates boar loot; acquisition always
// uses the rendered ground marker and the real single/Take-all buttons.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {startServer,launchOptions,root,tapGroundDrop}=require('./browserHarness.cjs');
const {assertTouchTarget}=require('./touchGeometry.cjs');
(async()=>{
 const materialStage=process.env.AURALIS_MATERIALS_STAGE||'aur203-final';
 const totals={task10:16,'aur203-first20':36,'aur203-final':100},sizes={task10:[16],'aur203-first20':[16,10,10],'aur203-final':[16,10,10,16,16,16,16]};
 assert.ok(Object.hasOwn(totals,materialStage),'Unknown material test stage');const expectedTotalCount=totals[materialStage];
 const external=process.env.AURALIS_MATERIALS_URL,host=external?{url:external,close:async()=>{}}:await startServer(),out=path.join(root,'work/task10/thematic-materials');fs.mkdirSync(out,{recursive:true});let browser;
 const records=[];
 try{
  browser=await chromium.launch(launchOptions);
  for(const language of ['ru','en','es']){
   const context=await browser.newContext({viewport:{width:740,height:320},hasTouch:true,isMobile:true});await context.addInitScript(l=>localStorage.setItem('auralis_language',l),language);
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(host.url);await page.locator('[data-menu-action=new]').tap();await page.locator('input').fill('MaterialsQA');await page.locator('.menu-content>button.primary').tap();await page.waitForFunction(()=>Auralis.game.scene.getScene('world')?.groundLoot?.panel);
   const preparation=await page.evaluate(async()=>{
    const s=Auralis.game.scene.getScene('world'),{getRegionContent}=await import('/js/world/regionContent.js'),c=getRegionContent('forest'),camp=c.camps.find(c=>c.spawns[0]?.type==='wildBoar');if(!camp)throw Error('No actual boar camp');
    s.hero.hp=s.hero.maxHp=100000;s.hero.inventory=[];s.world.load({region:'forest',x:camp.x,y:camp.y});const m=s.monsters.monsters.find(m=>m.id===camp.spawns[0].id);if(!m||m.kind.loot!=='boar')throw Error('Boar is not streamed');
    for(const other of s.monsters.monsters)if(other!==m){other.alive=false;other.respawnAt=Date.now()+600000;other.body.setVisible(false);}
    const point=Array.from({length:32},(_,i)=>({x:m.x+Math.cos(i*Math.PI/16)*70,y:m.y+Math.sin(i*Math.PI/16)*70})).find(q=>s.world.isWalkable(q.x,q.y)&&s.monsters.sight(m,q));if(!point)throw Error('No real boar approach');Object.assign(s.hero,point);s.controls.reset();s.clearTarget();s.__materialBoar=m;const p=s.project(s.hero.x,s.hero.y);s.body.setPosition(p.x,p.y);s.cameras.main.centerOn(p.x,p.y);
    return {id:m.id,speciesId:m.speciesId||camp.speciesId,campId:camp.id,loot:m.kind.loot};
   });
   await page.waitForFunction(()=>Auralis.game.scene.getScene('world').__materialBoar.paintedActive);
   const killed=await page.evaluate(()=>{
    const s=Auralis.game.scene.getScene('world'),m=s.__materialBoar,original=Math.random;
    try{Math.random=()=>.05;s.monsters.hit(m,1000000,s.playNow);}finally{Math.random=original;}
    s.groundLoot.update(true);const drops=Object.values(s.hero.worldState.groundLoot.drops);if(s.save()===false)throw Error('Failed boar checkpoint save');
    return {inventory:s.hero.inventory.length,alive:m.alive,drops:drops.map(d=>({id:d.id,item:d.item,distance:Math.hypot(s.hero.x-d.x,s.hero.y-d.y)})),death:s.hero.worldState.monsters[m.key],painted:m.paintedActive};
   });
   assert.equal(killed.alive,false);assert.equal(killed.inventory,0);assert.equal(killed.drops.length,1);assert.deepEqual(killed.drops[0].item,{id:'boarTusk',rarity:'rare',quantity:1});assert.ok(killed.drops[0].distance<=180);assert.ok(killed.death.deadUntil>=killed.death.killedAt+30000);
   const firstId=killed.drops[0].id;await page.waitForFunction(id=>Auralis.game.scene.getScene('world').groundLoot.markers.has(id),firstId);const anonymous=await page.evaluate(id=>{const m=Auralis.game.scene.getScene('world').groundLoot.markers.get(id);return {category:m.category,types:m.root.list.map(n=>n.type),data:m.root.data.getAll()};},firstId);assert.equal(anonymous.category,'chest');assert.deepEqual(anonymous.types,['Graphics']);assert.deepEqual(Object.keys(anonymous.data).sort(),['category','lootId']);
   await tapGroundDrop(page,firstId);await page.locator('.loot-panel').waitFor({state:'visible'});const row=page.locator('[data-loot-id="'+firstId+'"]');assert.equal(await row.locator('.item-art').getAttribute('data-item-kind'),'boarTusk');assert.match(await row.locator('.item-art image').getAttribute('href'),/assets\/icons\/monster-materials\/boar-tusk\.png$/);if(language!=='ru')assert.doesNotMatch(await page.locator('.loot-panel').innerText(),/[А-Яа-яЁё]/);
   await row.locator('[data-loot-action=pickup]').tap();assert.deepEqual(await page.evaluate(()=>Auralis.game.scene.getScene('world').hero.inventory),[{id:'boarTusk',rarity:'rare',quantity:1}]);assert.equal(await page.evaluate(id=>!!Auralis.game.scene.getScene('world').hero.worldState.groundLoot.drops[id],firstId),false);
   await page.reload();await page.locator('[data-menu-action=continue]').tap();await page.locator('.slot-row').filter({hasText:'MaterialsQA'}).locator('button.primary').tap();await page.waitForFunction(()=>Auralis.game.scene.getScene('world')?.groundLoot);
   const restored=await page.evaluate(id=>{const s=Auralis.game.scene.getScene('world');s.hero.hp=s.hero.maxHp=100000;return{inventory:s.hero.inventory,drop:!!s.hero.worldState.groundLoot.drops[id]};},firstId);assert.deepEqual(restored,{inventory:[{id:'boarTusk',rarity:'rare',quantity:1}],drop:false});
   // A corpse is an explicit nearby-loot fixture, not all materials in one
   // oversized pile. Keep the original16 case and independently test every
   // added item in bounded groups without changing placement or pickup rules.
   const materialPlan=await page.evaluate(async stage=>{
    const {MONSTER_MATERIALS}=await import('/js/equipment/monsterMaterials.js');
    const oldIds=Object.entries(MONSTER_MATERIALS).filter(([,d])=>!d.aur203Material).map(([id])=>id);
    if(oldIds.length!==16)throw Error('Expected exactly16 original material definitions');
    const groups=[{id:'task10-original16',expectedCount:16,ids:oldIds}];
    if(stage!=='task10'){
     const {AUR203_MATERIALS}=await import('/js/equipment/aur203Materials.js'),ids=Object.keys(AUR203_MATERIALS);
     if(ids.length!==20)throw Error('Expected exactly20 first-expansion definitions');
     groups.push({id:'aur203-first20-a',expectedCount:10,ids:ids.slice(0,10)},{id:'aur203-first20-b',expectedCount:10,ids:ids.slice(10,20)});
    }
    if(stage==='aur203-final'){
     const {AUR203_EXPANSION_MATERIALS}=await import('/js/equipment/aur203ExpansionMaterials.js'),ids=Object.keys(AUR203_EXPANSION_MATERIALS);
     if(ids.length!==64)throw Error('Expected exactly64 final-expansion definitions');
     for(let i=0;i<4;i++)groups.push({id:'aur203-final-'+(i+1),expectedCount:16,ids:ids.slice(i*16,(i+1)*16)});
    }
    return{registeredIds:Object.keys(MONSTER_MATERIALS),groups};
   },materialStage);
   assert.equal(materialPlan.registeredIds.length,expectedTotalCount);
   assert.deepEqual(materialPlan.groups.map(g=>g.expectedCount),sizes[materialStage]);
   const allIds=materialPlan.groups.flatMap(g=>g.ids);assert.equal(allIds.length,expectedTotalCount);assert.equal(new Set(allIds).size,expectedTotalCount,'Groups cannot duplicate material IDs');assert.deepEqual(allIds.slice().sort(),materialPlan.registeredIds.slice().sort(),'Every registered material must be tested exactly once per viewport');
   const views=[];
   for(const group of materialPlan.groups){
    const expectedCount=group.expectedCount;assert.equal(group.ids.length,expectedCount);assert.ok(expectedCount>=10,'Every group keeps the internal scrolling check');
    for(const [width,height]of [[740,320],[640,360]]){
    await page.setViewportSize({width,height});
    const fixture=await page.evaluate(async group=>{
     const s=Auralis.game.scene.getScene('world'),{MONSTER_MATERIALS}=await import('/js/equipment/monsterMaterials.js'),{itemName}=await import('/js/equipment/items.js'),{normalizeGroundLoot,createGroundDrops}=await import('/js/loot/groundLoot.js'),{getRegionContent}=await import('/js/world/regionContent.js'),camp=getRegionContent('forest').camps.find(c=>c.spawns[0]?.type==='wildBoar');
     s.groundLoot.panel.close();s.world.load({region:'forest',x:camp.x,y:camp.y});for(const other of s.monsters.monsters){other.alive=false;other.respawnAt=Date.now()+600000;other.body.setVisible(false);}s.hero.hp=s.hero.maxHp=100000;s.hero.inventory=Array.from({length:60},()=>({id:'rustySword',rarity:'common',quantity:1}));s.hero.worldState.groundLoot=normalizeGroundLoot(null);s.controls.reset();
     const ids=group.ids;if(ids.length!==group.expectedCount||new Set(ids).size!==group.expectedCount||ids.some(id=>!Object.hasOwn(MONSTER_MATERIALS,id)))throw Error('Invalid explicit material fixture group');const items=ids.map((id,i)=>({id,rarity:['common','uncommon','rare','epic'][i%4],quantity:1}));
     const made=createGroundDrops(s.hero,{id:'prepared-materials',key:'forest:prepared-materials',x:camp.x,y:camp.y},items,Date.now(),{region:'forest',project:(x,y)=>s.project(x,y),walkable:(x,y,r)=>s.groundLoot.walkable(x,y,r)});if(!made.ok)throw Error('Prepared material placement failed '+made.reason);
     const drops=made.ids.map(id=>s.hero.worldState.groundLoot.drops[id]);if(drops.some(d=>Math.hypot(d.x-s.hero.x,d.y-s.hero.y)>180))throw Error('Prepared material would exceed true pickup radius');s.groundLoot.clearVisuals();s.groundLoot.update(true);const p=s.project(s.hero.x,s.hero.y);s.body.setPosition(p.x,p.y);s.cameras.main.centerOn(p.x,p.y);if(s.save()===false)throw Error('Failed prepared material save');return {group:group.id,ids:made.ids,itemIds:ids,maxDistance:Math.max(...drops.map(d=>Math.hypot(d.x-s.hero.x,d.y-s.hero.y))),names:ids.map(id=>itemName({id},s.language)),expectedURLs:ids.map(id=>MONSTER_MATERIALS[id].iconURL)};
    },group);
    assert.equal(fixture.ids.length,expectedCount);assert.ok(fixture.maxDistance<=180,'Every material must be within180 actual world units');await tapGroundDrop(page,fixture.ids[0]);await page.locator('.loot-panel').waitFor({state:'visible'});assert.equal(await page.locator('.loot-panel [data-loot-id]').count(),expectedCount);
    const actualNames=await page.locator('.loot-panel .loot-copy strong').allTextContents();assert.deepEqual(actualNames.slice().sort(),fixture.names.slice().sort());if(language!=='ru')assert.doesNotMatch(await page.locator('.loot-panel').innerText(),/[А-Яа-яЁё]/);
    const icons=await page.locator('.loot-panel .item-art image').evaluateAll(async nodes=>{
     const records=[];for(const node of nodes){const href=node.getAttribute('href'),image=new Image();image.src=href;await image.decode();const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;const g=canvas.getContext('2d');g.drawImage(image,0,0);const rgba=g.getImageData(0,0,canvas.width,canvas.height).data;let opaque=0,transparent=0,checksum=2166136261;for(let i=0;i<rgba.length;i++){checksum=Math.imul(checksum^rgba[i],16777619)>>>0;if(i%4===3){if(rgba[i]>=128)opaque++;if(rgba[i]===0)transparent++;}}const bounds=node.getBoundingClientRect();records.push({href,width:image.naturalWidth,height:image.naturalHeight,opaque,transparent,checksum,cssWidth:bounds.width,cssHeight:bounds.height});}return records;
    });
    assert.equal(icons.length,expectedCount);assert.equal(new Set(icons.map(i=>i.checksum)).size,expectedCount);assert.deepEqual(icons.map(i=>i.href).sort(),fixture.expectedURLs.slice().sort());for(const icon of icons){assert.equal(icon.width,128);assert.equal(icon.height,128);assert.ok(icon.opaque>500);assert.ok(icon.transparent>128*128*.25);assert.ok(icon.cssWidth>20&&icon.cssHeight>20);}
    const geometry=await page.locator('.loot-panel').evaluate(n=>{const r=n.getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom,overflow:n.scrollWidth>n.clientWidth+1,scrollable:n.querySelector('.loot-items').scrollHeight>n.querySelector('.loot-items').clientHeight};});assert.ok(geometry.x>=0&&geometry.y>=0&&geometry.right<=width+1&&geometry.bottom<=height+1);assert.equal(geometry.overflow,false);assert.equal(geometry.scrollable,true);await assertTouchTarget(page.locator('[data-loot-action=all]'));await assertTouchTarget(page.locator('[data-loot-action=close]'));
    await page.screenshot({path:path.join(out,'materials-'+group.id+'-'+language+'-'+width+'x'+height+'-top.png')});await page.locator('.loot-items').evaluate(n=>{n.scrollTop=n.scrollHeight;});await page.screenshot({path:path.join(out,'materials-'+group.id+'-'+language+'-'+width+'x'+height+'-bottom.png')});
    await page.locator('[data-loot-action=all]').tap();assert.equal(await page.evaluate(()=>Auralis.game.scene.getScene('world').hero.inventory.length),60);assert.equal(await page.evaluate(()=>Object.keys(Auralis.game.scene.getScene('world').hero.worldState.groundLoot.drops).length),expectedCount);
    // Closing and reloading a full bag must retain every anonymous ground
    // record. This exercises normalization of each new material before pickup.
    await page.locator('[data-loot-action=close]').tap();assert.equal(await page.locator('.loot-panel').isVisible(),false);
    const closed=await page.evaluate(()=>{const s=Auralis.game.scene.getScene('world');return{slots:s.hero.inventory.length,ids:Object.keys(s.hero.worldState.groundLoot.drops).sort()};});assert.deepEqual(closed,{slots:60,ids:fixture.ids.slice().sort()});
    await page.reload();await page.locator('[data-menu-action=continue]').tap();await page.locator('.slot-row').filter({hasText:'MaterialsQA'}).locator('button.primary').tap();await page.waitForFunction(()=>Auralis.game.scene.getScene('world')?.groundLoot);
    const fullReload=await page.evaluate(()=>{const s=Auralis.game.scene.getScene('world');s.hero.hp=s.hero.maxHp=100000;return{slots:s.hero.inventory.length,ids:Object.keys(s.hero.worldState.groundLoot.drops).sort()};});assert.deepEqual(fullReload,closed);await tapGroundDrop(page,fixture.ids[0]);await page.locator('.loot-panel').waitFor({state:'visible'});assert.equal(await page.locator('.loot-panel [data-loot-id]').count(),expectedCount);
    await page.evaluate(()=>{const s=Auralis.game.scene.getScene('world');s.hero.inventory.splice(0,3);});await page.locator('[data-loot-action=all]').tap();const partial=await page.evaluate(()=>{const s=Auralis.game.scene.getScene('world');return {slots:s.hero.inventory.length,remaining:Object.keys(s.hero.worldState.groundLoot.drops).length,materials:s.hero.inventory.filter(i=>i.id!=='rustySword').length};});assert.deepEqual(partial,{slots:60,remaining:expectedCount-3,materials:3});
    await page.evaluate(()=>{const s=Auralis.game.scene.getScene('world');s.hero.inventory=s.hero.inventory.filter(i=>i.id!=='rustySword');});await page.locator('[data-loot-action=all]').tap();const complete=await page.evaluate(()=>{const s=Auralis.game.scene.getScene('world');return {inventory:s.hero.inventory,remaining:Object.keys(s.hero.worldState.groundLoot.drops).length};});assert.equal(complete.remaining,0);assert.equal(complete.inventory.length,expectedCount);assert.equal(new Set(complete.inventory.map(i=>i.id)).size,expectedCount);assert.ok(complete.inventory.every(i=>i.quantity===1));
    await page.reload();await page.locator('[data-menu-action=continue]').tap();await page.locator('.slot-row').filter({hasText:'MaterialsQA'}).locator('button.primary').tap();await page.waitForFunction(()=>Auralis.game.scene.getScene('world')?.groundLoot);const reload=await page.evaluate(()=>{const s=Auralis.game.scene.getScene('world');return {inventory:s.hero.inventory,remaining:Object.keys(s.hero.worldState.groundLoot.drops).length};});assert.deepEqual(reload,complete);views.push({group:group.id,expectedCount,width,height,fixture,icons,geometry,closed,fullReload,partial,complete,reload});console.log('PASS thematic materials '+materialStage+' '+group.id+' '+language+' '+width+'x'+height+' all'+expectedCount+'nativeicons, full/partial/freebag, close/Takeall, ground and pickup reload/no duplicates');
    }
   }
   const nativeCoverage=[];
   for(const [width,height]of [[740,320],[640,360]]){
    const tested=views.filter(v=>v.width===width&&v.height===height),icons=tested.flatMap(v=>v.icons);
    assert.equal(tested.length,sizes[materialStage].length);assert.equal(icons.length,expectedTotalCount);
    assert.equal(new Set(icons.map(icon=>icon.href)).size,expectedTotalCount,'All material groups must retain distinct PNG URLs');
    assert.equal(new Set(icons.map(icon=>icon.checksum)).size,expectedTotalCount,'No group may reuse another group’s decoded icon');
    nativeCoverage.push({width,height,groups:tested.map(v=>v.group),materials:icons.length,uniqueDecodedIcons:new Set(icons.map(icon=>icon.checksum)).size});
   }
   assert.deepEqual(errors,[]);records.push({language,preparation,killed,anonymous,restored,materialPlan,views,nativeCoverage,errors});await context.close();
  }
  const verificationPath=path.join(out,'verification.json'),temporaryPath=verificationPath+'.tmp';fs.writeFileSync(temporaryPath,JSON.stringify({materialStage,expectedCount:expectedTotalCount,expectedTotalCount,groupCounts:sizes[materialStage],records,errors:records.flatMap(r=>r.errors),physicalAndroid:false,scope:'Actual boar MonsterSystem kill with declared HP/position/Math.random=.05 fixture; real anonymous ground marker tap, singlepickup and reload. Prepared groups'+JSON.stringify(sizes[materialStage])+' cover exactly'+expectedTotalCount+' materials within180worldunits and verify actualTakeall/full/partial/freebag/close controls, ground and pickup reload, all nativeChromeImageCanvasdecodes, twoAndroidlandscapeviewports andRU/EN/ES. Isolatednewcontexts; no player saves touched.'},null,2)+'\n');fs.renameSync(temporaryPath,verificationPath);
 }finally{await browser?.close();await host.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
