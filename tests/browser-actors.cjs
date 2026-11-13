// Runtime asset integration fixtures. Every class is created via real menu UI;
// direction/state clocks and regional positions are set explicitly for coverage.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {startServer,launchOptions,root}=require('./browserHarness.cjs');
(async()=>{const host=await startServer();let browser;
 try{
  browser=await chromium.launch(launchOptions);const errors=[];
  for(const classId of ['warrior','archer','mage','paladin','assassin','cannoneer']){
   const context=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
   await page.goto(host.url);await page.getByRole('button',{name:'Играть',exact:true}).click();await page.getByRole('button',{name:'Создать персонажа',exact:true}).first().click();await page.locator('.class-card:has(.hero-'+classId+')').click();await page.locator('input').fill('Painted'+classId);await page.getByRole('button',{name:'Начать приключение',exact:true}).click();
   await page.waitForFunction(()=>Auralis.game.scene.getScene('world')?.rig?.paintedActive);
   const art=await page.evaluate(()=>{
    const s=Auralis.game.scene.getScene('world'),rig=s.rig,frames=[];
    for(let i=0;i<8;i++){rig.update(.1,{x:0,y:0},{active:false},i*Math.PI/4);frames.push(rig.painted.sprite.frame.name);}
    rig.update(.12,{x:1,y:0},{active:false},0);const runA=rig.painted.sprite.frame.name;rig.update(.12,{x:1,y:0},{active:false},0);const runB=rig.painted.sprite.frame.name;
    rig.update(.1,{x:0,y:0},{active:true,progress:.6,index:0},Math.PI/2);const attack=rig.painted.sprite.frame.name;
    s.hero.hurtUntil=s.playNow+250;rig.update(.1,{x:0,y:0},{active:false},0);const hurt=rig.animationState;delete s.hero.hurtUntil;
    const sprite=rig.painted.sprite,f=sprite.frame,canvas=document.createElement('canvas');canvas.width=f.cutWidth;canvas.height=f.cutHeight;const ctx=canvas.getContext('2d');ctx.drawImage(sprite.texture.getSourceImage(),f.cutX,f.cutY,f.cutWidth,f.cutHeight,0,0,f.cutWidth,f.cutHeight);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;let minY=256,maxY=0;for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++)if(pixels[(y*canvas.width+x)*4+3]>96){minY=Math.min(minY,y);maxY=Math.max(maxY,y);}return {visibleHeight:(maxY-minY)*sprite.scaleY,frames,runA,runB,attack,hurt,key:rig.painted.sprite.texture.key,children:s.body.list.length,width:rig.painted.sprite.displayWidth,height:rig.painted.sprite.displayHeight,muzzle:rig.weaponMuzzleScreen(),atlases:s.actorTextures.diagnostics};
   });
   assert.deepEqual(art.frames,['idle/e','idle/se','idle/s','idle/sw','idle/w','idle/nw','idle/n','idle/ne']);assert.notEqual(art.runA,art.runB);assert.equal(art.attack,'attack/s');assert.equal(art.hurt,'hurt');assert.equal(art.key,'actor-'+classId);assert.ok(art.width>40&&art.height>60&&art.visibleHeight>45&&art.visibleHeight<115);assert.equal(art.children,2,'Temporary joint rig must be replaced by painted body and gear');assert.ok(Number.isFinite(art.muzzle.x)&&Number.isFinite(art.muzzle.y));
   const equipment=await page.evaluate(async()=>{
    const s=Auralis.game.scene.getScene('world'),h=s.hero,{ITEM_DEFS,equipItem,unequipItem}=await import('/js/equipment/items.js'),originalGear=h.equipment,originalBag=h.inventory;
    h.equipment={};h.inventory=[];const draw=()=>{s.rig.update(0,{x:0,y:0},{active:false},0);return s.rig.painted.gear.commandBuffer.length;},baseline=draw(),result=[];let previous=baseline;
    for(const slot of ['weapon','helmet','chest','gloves','pants','boots','ring','amulet','shield']){
     const pair=Object.entries(ITEM_DEFS).find(([,d])=>d.slot===slot&&d.level<=h.level&&(!d.allowedClasses||d.allowedClasses.includes(h.classId)));if(!pair)continue;
     h.inventory=[{id:pair[0],rarity:'rare',quantity:1}];if(!equipItem(h,0).ok)throw Error('Real equipment rules rejected '+slot);const commands=draw();result.push({slot,previous,commands});previous=commands;
    }
    for(const slot of Object.keys(h.equipment))if(!unequipItem(h,slot))throw Error('Real unequip failed '+slot);
    const cleared=draw();h.equipment=originalGear;h.inventory=originalBag;draw();return {baseline,cleared,result};
   });
   assert.ok(equipment.result.length>=8);for(const e of equipment.result)assert.ok(e.commands>e.previous,'Painted equipment layer did not change for '+classId+'/'+e.slot);assert.equal(equipment.cleared,equipment.baseline,'Unequipping must clear every visible gear layer');
   await page.screenshot({path:root+'/work/browser/painted-'+classId+'.png'});console.log('PASS actual painted class body,8directions,opposite strides,attack,hurt,socket and all allowed equipped slots',classId);
   if(classId==='warrior'){
    const checkResidency=async()=>{
     await page.waitForFunction(()=>Auralis.game.scene.getScene('world').actorTextures.diagnostics.actorPending===0);
     const state=await page.evaluate(()=>{const s=Auralis.game.scene.getScene('world'),expected=new Map(),keep=entry=>{if(entry)expected.set(entry.key,(expected.get(entry.key)||0)+1);};keep(s.rig.painted?.entry);for(const c of s.world.chunkWorld.chunks.values())for(const npc of c.npcActors||[])keep(npc.entry);for(const m of s.monsters.monsters)keep(m.painted?.entry);return {expected:[...expected].sort(),actual:[...s.actorTextures.entries].map(([key,record])=>[key,record.refs]).sort()};});
     assert.deepEqual(state.actual,state.expected,'Only the actual streamed actors may retain atlas leases');
    };
    await page.waitForFunction(()=>{const s=Auralis.game.scene.getScene('world'),actors=[...s.world.chunkWorld.chunks.values()].flatMap(c=>c.npcActors||[]);return actors.length===5&&actors.every(a=>a.sprite)&&s.monsters.monsters.some(m=>m.type==='forestWolf'&&m.paintedActive);});
    const resident=await page.evaluate(()=>{const s=Auralis.game.scene.getScene('world'),actors=[...s.world.chunkWorld.chunks.values()].flatMap(c=>c.npcActors||[]),wolf=s.monsters.monsters.find(m=>m.type==='forestWolf'&&m.paintedActive);return {residents:actors.map(a=>a.sprite.frame.name.split('/')[0]).sort(),wolf:wolf.painted.sprite.texture.key,leases:s.actorTextures.diagnostics};});
    assert.deepEqual(resident.residents,['aldric','borin','elia','mira','tera']);assert.equal(resident.wolf,'actor-forest-wolf');assert.equal(resident.leases.actorAtlases,4);assert.ok(resident.leases.actorLeases>5);
    // Settlements and wolves really release shared atlases when all consumers leave.
    await page.evaluate(()=>Auralis.game.scene.getScene('world').world.load({region:'north',x:1500,y:1800}));await page.waitForFunction(()=>{const s=Auralis.game.scene.getScene('world');return !s.load.isLoading()&&!s.textures.exists('actor-forest-residents')&&!s.textures.exists('actor-forest-wolf');});
    await checkResidency();
    await page.evaluate(()=>Auralis.game.scene.getScene('world').world.load({region:'forest',x:1030,y:1140}));await page.waitForFunction(()=>{const s=Auralis.game.scene.getScene('world');return s.textures.exists('actor-forest-residents')&&s.textures.exists('actor-forest-wolf')&&s.actorTextures.diagnostics.actorPending===0;});
    console.log('PASS distinct painted residents and wolf; shared atlas release and reload across regions');
    const npcs=await page.evaluate(async()=>{const {NPCS}=await import('/js/npc/npcData.js');return NPCS.map(({id,region,x,y})=>({id,region,x,y}));});
    for(const npc of npcs){
     await page.evaluate(npc=>{const s=Auralis.game.scene.getScene('world');s.hero.hp=s.hero.maxHp=100000;s.world.load({region:npc.region,x:npc.x,y:npc.y});},npc);
     await page.waitForFunction(id=>[...Auralis.game.scene.getScene('world').world.chunkWorld.chunks.values()].flatMap(c=>c.npcActors||[]).some(a=>a.npc.id===id&&a.sprite),npc.id);
     const resident=await page.evaluate(async id=>{
      const s=Auralis.game.scene.getScene('world'),actor=[...s.world.chunkWorld.chunks.values()].flatMap(c=>c.npcActors||[]).find(a=>a.npc.id===id),{screenDirection}=await import('/js/world/projection.js'),frames=[];
      for(let i=0;i<8;i++){const d=screenDirection(Math.cos(i*Math.PI/4),Math.sin(i*Math.PI/4));actor.update({x:actor.npc.x+d.x*60,y:actor.npc.y+d.y*60},.1);frames.push(actor.sprite.frame.name);}
      const sprite=actor.sprite,f=sprite.frame,canvas=document.createElement('canvas');canvas.width=f.cutWidth;canvas.height=f.cutHeight;const ctx=canvas.getContext('2d');ctx.drawImage(sprite.texture.getSourceImage(),f.cutX,f.cutY,f.cutWidth,f.cutHeight,0,0,f.cutWidth,f.cutHeight);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;let min=256,max=0;for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++)if(pixels[(y*canvas.width+x)*4+3]>96){min=Math.min(min,y);max=Math.max(max,y);}
      return {frames,key:sprite.texture.key,expectedKey:actor.entry.key,scale:actor.entry.scale,origin:sprite.originY,expectedOrigin:actor.entry.originY,height:(max-min)*sprite.scaleY,children:actor.root.list.map(o=>o.type)};
     },npc.id);
     assert.deepEqual(resident.frames,['e','se','s','sw','w','nw','n','ne'].map(d=>npc.id+'/'+d));assert.equal(resident.key,resident.expectedKey);assert.equal(resident.origin,resident.expectedOrigin);assert.ok(resident.height>45&&resident.height<110,npc.id+' has inconsistent game size '+resident.height);assert.equal(resident.children.filter(type=>type==='Image').length,1);assert.equal(resident.children.filter(type=>type==='Ellipse').length,1,'Only the shadow may remain procedural');assert.ok(!resident.children.includes('Arc'),'The temporary head must be replaced');console.log('PASS distinct streamed resident,8real facings,measured origin and body replacement',npc.id);
    }
    await page.evaluate(()=>{const s=Auralis.game.scene.getScene('world');s.hero.level=42;s.world.load({region:'forest',x:1820,y:1780});const result=s.enterDungeon('dungeon1','easy');if(!result.ok)throw Error(result.reason);});
    await page.waitForFunction(async()=>{const s=Auralis.game.scene.getScene('world'),{NPC_ART}=await import('/js/assets/npcArt.js');return s.actorTextures.diagnostics.actorPending===0&&Object.values(NPC_ART).every(e=>!s.textures.exists(e.key));});
    console.log('PASS all six resident packs release when streamed settlements unload');
    const species=await page.evaluate(async()=>Object.keys((await import('/js/assets/monsterArt.js')).MONSTER_ART));
    for(const type of species){
     const id=await page.evaluate(async type=>{const s=Auralis.game.scene.getScene('world'),{getRegionContent}=await import('/js/world/regionContent.js');for(const region of ['forest','north','ancient']){const descriptor=getRegionContent(region).camps.flatMap(c=>c.spawns).find(d=>d.type===type);if(!descriptor)continue;s.hero.hp=s.hero.maxHp=100000;s.world.load({region,x:descriptor.x-50,y:descriptor.y});return descriptor.id;}throw Error('No actual regional encounter '+type);},type);
     await page.waitForFunction(id=>Auralis.game.scene.getScene('world').monsters.monsters.some(m=>m.id===id&&m.paintedActive),id);
     const body=await page.evaluate(id=>{const m=Auralis.game.scene.getScene('world').monsters.monsters.find(m=>m.id===id),a=m.painted;a.update('idle',0,.1);const idle=a.sprite.frame.name;a.update('run',Math.PI/4,.1);const walk=a.sprite.frame.name;a.update('attack',Math.PI/2,.1,{progress:.6});return {key:a.sprite.texture.key,idle,walk,attack:a.sprite.frame.name,flipped:m.body.scaleX<0,height:m.annotationHeight,top:a.sprite.displayHeight};},id);
     assert.equal(body.key,'actor-monster-'+type);assert.equal(body.idle,'idle/e');assert.match(body.walk,/run-[ab]\/se/);assert.equal(body.attack,'attack/s');assert.equal(body.flipped,false);assert.ok(body.height>40&&body.top>50);console.log('PASS real regional encounter uses its own painted animated atlas',type);
    }
    await page.evaluate(()=>Auralis.game.scene.getScene('world').world.load({region:'north',x:1500,y:1800}));await checkResidency();
    console.log('PASS all produced monster families release their atlases after leaving their encounters');
   }
   await context.close();
  }
  assert.deepEqual(errors,[]);console.log('PASS actual lazy actor atlases without JavaScript errors');
 }finally{if(browser)await browser.close();await host.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
