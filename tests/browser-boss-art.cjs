// Boss art integration through the actual character menu, WorldRuntime and
// streamed encounters. Level, HP, positions and animation clocks are fixtures;
// descriptors, dungeon entry, image loading, damage and lease cleanup are real.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const path=require('node:path');
const {startServer,launchOptions,root}=require('./browserHarness.cjs');
const directions=['e','se','s','sw','w','nw','n','ne'];
const banks=['idle','run-a','run-b','attack'];
const expectedFrames=banks.flatMap(bank=>directions.map(direction=>bank+'/'+direction));

(async()=>{
 const host=await startServer();let browser;
 try{
  browser=await chromium.launch(launchOptions);
  const context=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true});
  const page=await context.newPage(),errors=[],failedAssets=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('response',response=>{if(response.status()>=400&&response.url().includes('/assets/actors/bosses/'))failedAssets.push(response.status()+' '+response.url());});
  await page.goto(host.url);
  await page.getByRole('button',{name:'Продолжить',exact:true}).click();
  await page.getByRole('button',{name:'Создать персонажа',exact:true}).first().click();
  await page.locator('input').fill('BossAtlasIntegration');
  await page.getByRole('button',{name:'Начать приключение',exact:true}).click();
  await page.waitForFunction(()=>window.Auralis?.game.scene.getScene('world')?.rig?.paintedActive);

  // Snapshot the registry once: newly produced files cannot change coverage
  // halfway through a run. Every snapshot ID must resolve to a real descriptor.
  const cases=await page.evaluate(async()=>{
   const {BOSS_ART}=await import('/js/assets/bossArt.js');
   const {getRegionContent}=await import('/js/world/regionContent.js');
   const {DUNGEONS,createDungeonContent}=await import('/js/dungeons/dungeonSystem.js');
   const encounters=new Map();
   for(const region of ['forest','north','ancient'])for(const descriptor of getRegionContent(region).bosses)encounters.set(descriptor.id,{descriptor,region});
   for(const dungeon of DUNGEONS)for(const descriptor of createDungeonContent(dungeon.id,'easy').bosses)encounters.set(descriptor.id,{descriptor,dungeon});
   return Object.entries(BOSS_ART).map(([id,entry])=>{const encounter=encounters.get(id);if(!encounter)throw Error('No real encounter for registered boss '+id);return {id,entry,...encounter};});
  });
  assert.equal(cases.filter(test=>!test.dungeon).length,18,'The complete outdoor boss roster must be registered');
  for(const field of ['key','url','atlasURL'])assert.equal(new Set(cases.map(test=>test.entry[field])).size,cases.length,'Boss atlases must have unique '+field);
  const pixelHashes=new Set(),screenshots=new Set();
  console.log('Boss atlas registry snapshot:',cases.map(test=>test.id).join(', '));

  for(const test of cases){
   await page.evaluate(({descriptor,dungeon,region})=>{
    const s=Auralis.game.scene.getScene('world'),h=s.hero;
    h.level=42;h.hp=h.maxHp=1000000;h.mp=h.maxMp=1000;
    if(dungeon){
     s.world.load({region:dungeon.region,x:dungeon.x,y:dungeon.y});
     // WorldRuntime may move a position off an obstacle; the entrance fixture
     // is restored before exercising the real distance/level-gated helper.
     h.x=dungeon.x;h.y=dungeon.y;
     const entered=s.enterDungeon(dungeon.id,'easy');if(!entered.ok)throw Error('Cannot enter '+dungeon.id+': '+entered.reason);
     h.x=descriptor.x-65;h.y=descriptor.y;
     s.world.update();s.monsters.update(s.playNow,0);
    }else s.world.load({region,x:descriptor.x-65,y:descriptor.y});
   },test);
   await page.waitForFunction(id=>Auralis.game.scene.getScene('world').monsters.monsters.some(m=>m.id===id&&m.paintedActive),test.id);
   await page.waitForFunction(()=>Auralis.game.scene.getScene('world').actorTextures.diagnostics.actorPending===0);

   const art=await page.evaluate(async id=>{
    const s=Auralis.game.scene.getScene('world'),m=s.monsters.monsters.find(m=>m.id===id),a=m.painted,sprite=a.sprite;
    // Stop locomotion and ability windup only while sampling the real actor.
    m.kind={...m.kind,speed:0};m.stunUntil=s.playNow+60000;m.lastSlam=s.playNow;s.monsters.cancelWindup(m);s.monsters.update(s.playNow,0);
    const frames=[],origins=[];
    for(let i=0;i<8;i++){
     const angle=i*Math.PI/4;
     a.elapsed=0;a.update('idle',angle,0);frames.push(sprite.frame.name);origins.push([a.poseBank,sprite.originY]);
     a.elapsed=0;a.update('run',angle,0);frames.push(sprite.frame.name);origins.push([a.poseBank,sprite.originY]);
     a.update('run',angle,.12);frames.push(sprite.frame.name);origins.push([a.poseBank,sprite.originY]);
     a.update('attack',angle,0,{progress:.6});frames.push(sprite.frame.name);origins.push([a.poseBank,sprite.originY]);
    }
    a.update('idle',Math.PI/2,0);
    const source=sprite.texture.getSourceImage(),canvas=document.createElement('canvas');canvas.width=source.width;canvas.height=source.height;
    const ctx=canvas.getContext('2d');ctx.drawImage(source,0,0);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
    const digest=async data=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',data))].map(v=>v.toString(16).padStart(2,'0')).join('');
    const hash=await digest(pixels);
    // Phaser loads images through blob URLs. Compare decoded pixels against
    // the declared PNG itself instead of treating that blob URL as a filename.
    const response=await fetch('/'+a.entry.url);if(!response.ok)throw Error('Cannot verify boss PNG '+a.entry.url);
    const expectedImage=await createImageBitmap(await response.blob());ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(expectedImage,0,0);expectedImage.close();
    const expectedHash=await digest(ctx.getImageData(0,0,canvas.width,canvas.height).data);
    const measurements=[];
    for(const name of sprite.texture.getFrameNames().filter(name=>name!=='__BASE')){
     const f=sprite.texture.get(name);let top=f.cutHeight,bottom=-1;
     for(let y=0;y<f.cutHeight;y++)for(let x=0;x<f.cutWidth;x++)if(pixels[((f.cutY+y)*canvas.width+f.cutX+x)*4+3]>=100){top=Math.min(top,y);bottom=Math.max(bottom,y);}
     measurements.push({name,width:f.cutWidth,height:f.cutHeight,visibleHeight:(bottom-top+1)*sprite.scaleY*m.body.scaleY,footOffset:(bottom+1-a.entry.baselines[name.split('/')[0]])*sprite.scaleY*m.body.scaleY});
    }
    const socket=a.weaponMuzzleScreen();
    // Damage goes through MonsterSystem, which selects the hurt state and
    // updates both body feedback and healthy/damaged annotations.
    s.monsters.hit(m,1,s.playNow);s.monsters.update(s.playNow,0);
    const hurt={frame:sprite.frame.name,tinted:sprite.isTinted,bodyAlpha:m.body.alpha,hp:m.hp,maxHp:m.maxHp};
    m.hurtUntil=0;a.update('idle',Math.PI/2,0);m.body.alpha=1;m.body.rotation=0;
    const p=s.project(s.hero.x,s.hero.y);s.body.setPosition(p.x,p.y);s.cameras.main.centerOn(p.x,p.y);
    return {id:m.id,boss:m.kind.boss,dungeon:s.world.content.dungeon===true,region:s.world.content.id,descriptor:s.monsters.stream.loaded.get(id)===m,key:sprite.texture.key,entry:a.entry,sourceSize:[source.width,source.height],hash,expectedHash,frames,origins,measurements,children:m.body.list.map(child=>child.type),motionParts:!!m.body.motionParts,gear:!!a.gear,spriteScale:[sprite.scaleX,sprite.scaleY],bodyScale:[m.body.scaleX,m.body.scaleY],visualScale:m.kind.visualScale,annotationHeight:m.annotationHeight,socket,hurt};
   },test.id);

   assert.equal(art.id,test.id);assert.equal(art.boss,true);assert.equal(art.descriptor,true,'Boss must be owned by the actual MonsterStream');
   assert.equal(art.dungeon,!!test.dungeon);assert.equal(art.region,test.dungeon?'dungeon:'+test.dungeon.id+':easy':test.region);
   assert.equal(art.key,test.entry.key);assert.deepEqual(art.entry,test.entry);assert.equal(art.hash,art.expectedHash,'Loaded texture pixels must match the exact boss PNG');assert.deepEqual(art.sourceSize,[1536,1024]);
   assert.ok(!pixelHashes.has(art.hash),'Distinct bosses cannot reuse the same loaded image: '+test.id);pixelHashes.add(art.hash);
   assert.deepEqual(art.frames,directions.flatMap(direction=>banks.map(bank=>bank+'/'+direction)));
   assert.deepEqual(art.measurements.map(frame=>frame.name).sort(),[...expectedFrames].sort());
   assert.deepEqual(art.children,['Image'],'Painted boss must replace every procedural fallback part');assert.equal(art.motionParts,false);assert.equal(art.gear,false,'Bosses have no player equipment overlay');
   assert.equal(art.bodyScale[0],art.visualScale);assert.equal(art.bodyScale[1],art.visualScale);
   assert.equal(art.spriteScale[0],test.entry.scale);assert.ok(Math.abs(art.spriteScale[1]/test.entry.scale-1)<.01,'Only subtle idle breathing may change the declared sprite scale');
   for(const [bank,origin]of art.origins)assert.equal(origin,test.entry.baselines[bank]/256,'Foot origin must follow the sampled pose bank');
   for(const frame of art.measurements){assert.equal(frame.width,192);assert.equal(frame.height,256);assert.ok(frame.visibleHeight>35&&frame.visibleHeight<260,test.id+'/'+frame.name+' has unreasonable body height '+frame.visibleHeight);assert.ok(Math.abs(frame.footOffset)<40,test.id+'/'+frame.name+' floats away from its ground anchor: '+frame.footOffset);}
   const idleHeights=art.measurements.filter(frame=>frame.name.startsWith('idle/')).map(frame=>frame.visibleHeight).sort((a,b)=>a-b),medianHeight=(idleHeights[3]+idleHeights[4])/2;
   assert.ok(medianHeight>70&&medianHeight<220,test.id+' has inconsistent rendered scale '+medianHeight);
   assert.ok(Math.abs(art.annotationHeight-test.entry.annotationHeight*art.visualScale)<.01);assert.ok(art.annotationHeight-medianHeight>5&&art.annotationHeight-medianHeight<25,test.id+' annotations must sit above its painted silhouette');
   assert.ok(Number.isFinite(art.socket?.x)&&Number.isFinite(art.socket?.y),'The common actor socket transform must remain valid without a weapon overlay');
   assert.equal(art.hurt.tinted,true);assert.equal(art.hurt.bodyAlpha,.6);assert.equal(art.hurt.hp,art.hurt.maxHp-1);assert.match(art.hurt.frame,/^idle\//);

   const example=test.dungeon?'dungeon':test.region;
   if(!screenshots.has(example)){await page.screenshot({path:path.join(root,'work/browser/boss-art-'+example+'.png')});screenshots.add(example);}
   const death=await page.evaluate(id=>{
    const s=Auralis.game.scene.getScene('world'),m=s.monsters.monsters.find(m=>m.id===id),a=m.painted;
    s.monsters.hit(m,m.maxHp+1,s.playNow);s.monsters.update(s.playNow+100,.1);
    return {alive:m.alive,frame:a.sprite.frame.name,rotation:a.sprite.rotation,alpha:a.sprite.alpha,bodyAlpha:m.body.alpha,annotations:m.hpBar.visible||m.nameLabel.visible,key:a.sprite.texture.key};
   },test.id);
   assert.equal(death.alive,false);assert.match(death.frame,/^idle\//);assert.ok(death.rotation>0&&death.alpha<1&&death.bodyAlpha>0&&death.bodyAlpha<1);assert.equal(death.annotations,false);assert.equal(death.key,test.entry.key);

   await page.evaluate(()=>Auralis.game.scene.getScene('world').world.load({region:'north',x:1500,y:1800}));
   await page.waitForFunction(key=>{const s=Auralis.game.scene.getScene('world');return s.actorTextures.diagnostics.actorPending===0&&!s.load.isLoading()&&!s.textures.exists(key)&&!s.actorTextures.entries.has(key);},test.entry.key);
   const residency=await page.evaluate(id=>{
    const s=Auralis.game.scene.getScene('world'),expected=new Map(),keep=entry=>{if(entry)expected.set(entry.key,(expected.get(entry.key)||0)+1);};
    keep(s.rig.painted?.entry);for(const chunk of s.world.chunkWorld.chunks.values())for(const npc of chunk.npcActors||[])keep(npc.entry);for(const m of s.monsters.monsters)keep(m.painted?.entry);
    return {oldEncounter:s.monsters.monsters.some(m=>m.id===id),expected:[...expected].sort(),actual:[...s.actorTextures.entries].map(([key,record])=>[key,record.refs]).sort()};
   },test.id);
   assert.equal(residency.oldEncounter,false);assert.deepEqual(residency.actual,residency.expected,'Only current streamed actors may retain atlas leases after '+test.id);
   console.log('PASS real boss atlas,32 directional poses,hurt/death,scale,socket and release',test.id);
  }
  assert.deepEqual(failedAssets,[]);assert.deepEqual(errors,[]);
  console.log('PASS all '+cases.length+' registered boss encounters with unique loaded artwork and no JavaScript errors');
  await context.close();
 }finally{if(browser)await browser.close();await host.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
