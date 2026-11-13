const {startServer,launchOptions,root,openNpc}=require('./browserHarness.cjs');
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');

// A genuine fresh-character journey. Scene access is read-only: every change to
// movement, combat, quests, resources and progression comes from visible controls.
(async()=>{
 const hosting=await startServer();let browser,page;
 const started=Date.now();
 try{
  browser=await chromium.launch(launchOptions);
  page=await browser.newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(hosting.url);
  await page.getByRole('button',{name:'Играть',exact:true}).click();
  await page.getByRole('button',{name:'Создать персонажа',exact:true}).first().click();
  await page.locator('input').fill('FirstDungeon');
  await page.getByRole('button',{name:'Начать приключение',exact:true}).click();
  await page.waitForFunction(()=>window.Auralis?.game.scene.getScene('world')?.world);
  const read=()=>page.evaluate(async()=>{
   const {itemDefinition,itemName}=await import('/js/equipment/items.js');
   const s=Auralis.game.scene.getScene('world'),h=s.hero;
   return {deathStartedAt:h.deathStartedAt??null,x:h.x,y:h.y,hp:h.hp,maxHp:h.maxHp,mp:h.mp,maxMp:h.maxMp,dead:Object.entries(h.worldState?.monsters||{}).filter(([,state])=>state.killedAt>0&&state.deadUntil>0).map(([id])=>id),level:h.level,xp:h.xp,gold:h.gold,attributePoints:h.attributePoints,skillPoints:h.skillPoints,stats:{...h.stats},potions:{...h.potions},quests:JSON.parse(JSON.stringify(h.quests)),learnedSkills:{...h.learnedSkills},skillSlots:[...h.skillSlots],region:h.region,dungeonProgress:JSON.parse(JSON.stringify(h.dungeonProgress||{})),inventory:h.inventory.map((item,index)=>({index,...item,...itemDefinition(item),name:itemName(item)})),equipment:JSON.parse(JSON.stringify(h.equipment)),monsters:s.monsters.monsters.filter(m=>m.alive).map(m=>({id:m.id,campId:m.campId,x:m.x,y:m.y,hp:m.hp,boss:!!m.kind.boss})),wolves:s.monsters.monsters.filter(m=>m.alive&&m.type==='forestWolf').map(m=>({id:m.id,x:m.x,y:m.y,hp:m.hp})),axis:{...s.controls.axis},attacking:s.controls.attacking};
  });
  assert.equal((await read()).level,1);assert.deepEqual((await read()).quests,{});
  await openNpc(page,'mira');
  await page.locator('[data-quest-id=forestWolves]').getByRole('button',{name:'Принять задание',exact:true}).click();
  for(const id of ['forest_contract_1','forest_survey_1','forest_dispatch_1'])await page.locator('[data-quest-id='+id+']').getByRole('button',{name:/Принять задание/}).click();
  await page.locator('.npc-heading button').click();
  assert.equal((await read()).quests.forestWolves.state,'active');
  console.log('PASS fresh warrior accepted Mira quest through UI');

  const cdp=await page.context().newCDPSession(page);
  const joy=await page.locator('#joy').boundingBox(),attack=await page.locator('#attack').boundingBox();
  const centre={x:joy.x+joy.width/2,y:joy.y+joy.height/2},attackPoint={x:attack.x+attack.width/2,y:attack.y+attack.height/2};
  let touching=false,attacking=false;
  const touch=async(dx=0,dy=0,holdAttack=false)=>{
   const length=Math.hypot(dx-dy,(dx+dy)/2),scale=length?joy.width*.24/length:0;
   const points=[{id:1,x:centre.x+(dx-dy)*scale,y:centre.y+(dx+dy)/2*scale}];
   if(holdAttack)points.push({id:2,...attackPoint});
   // Add fingers individually, as on a phone and in the independent soak test.
   // A batched initial touchStart can leave Chromium's second capture inactive.
   if(!touching){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[points[0]]});if(holdAttack)await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points});}
   else{const type=holdAttack&&!attacking?'touchStart':!holdAttack&&attacking?'touchEnd':'touchMove';await cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points});}
   touching=true;attacking=holdAttack;
  };
  const release=async()=>{if(touching)await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});touching=false;attacking=false;};
  const directionTo=async target=>page.evaluate(target=>{
   const s=Auralis.game.scene.getScene('world'),h=s.hero;
   const distance=Math.hypot(target.x-h.x,target.y-h.y);
   if(distance>480){
    const direction={x:(target.x-h.x)/distance,y:(target.y-h.y)/distance},centre={x:h.x+direction.x*380,y:h.y+direction.y*380};
    const candidates=[];for(let radius=0;radius<=96;radius+=24)for(let angle=0;angle<8;angle++){const p={x:centre.x+Math.cos(angle*Math.PI/4)*radius,y:centre.y+Math.sin(angle*Math.PI/4)*radius};if(s.world.isWalkable(p.x,p.y))candidates.push(p);}
    if(!candidates.length)throw Error('No local walking destination');target=candidates.sort((a,b)=>Math.hypot(a.x-target.x,a.y-target.y)-Math.hypot(b.x-target.x,b.y-target.y))[0];
   }
   const clear=(a,b)=>{const distance=Math.hypot(a.x-b.x,a.y-b.y);for(let d=0;d<=distance;d+=8){const t=distance?d/distance:0;if(!s.world.isWalkable(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t))return false;}return true;};
   if(clear(h,target))return {x:target.x-h.x,y:target.y-h.y};
   // Read-only local route search lets the touch driver walk around real scenery.
   const step=16,origin={x:h.x,y:h.y},key=(x,y)=>Math.round((x-origin.x)/step)+','+Math.round((y-origin.y)/step);
   const queue=[origin],seen=new Map([[key(origin.x,origin.y),null]]);let goal=null;
   for(let index=0;index<queue.length&&queue.length<10000;index++){
    const p=queue[index];if(Math.hypot(p.x-target.x,p.y-target.y)<step*1.5&&clear(p,target)){goal=p;break;}
    for(const [dx,dy]of [[step,0],[-step,0],[0,step],[0,-step]]){
     const next={x:p.x+dx,y:p.y+dy},id=key(next.x,next.y);
     if(seen.has(id)||Math.hypot(next.x-h.x,next.y-h.y)>650||!s.world.isWalkable(next.x,next.y)||!clear(p,next))continue;
     seen.set(id,p);queue.push(next);
    }
   }
   if(!goal)throw Error('No walkable local route to '+JSON.stringify({target,hero:{x:h.x,y:h.y}}));
   const route=[];let waypoint=goal;
   while(waypoint){route.push(waypoint);waypoint=seen.get(key(waypoint.x,waypoint.y));}
   waypoint=route.find(p=>clear(h,p))||route.at(-2);
   return {x:waypoint.x-h.x,y:waypoint.y-h.y};
  },target);
  let maintainWalkingHealth=null;
  const walkTo=async(target,tolerance=30)=>{
   const deadline=Date.now()+45000,expectedRegion=(await read()).region;
   while(Date.now()<deadline){
    const h=await read();assert.equal(h.region,expectedRegion,'Unexpected transition or death while walking');assert.ok(h.hp>0&&h.deathStartedAt===null,'Hero died while walking');
    if(Math.hypot(h.x-target.x,h.y-target.y)<=tolerance){await release();return;}
    const threatened=h.region.startsWith('dungeon:')&&h.monsters.some(m=>Math.hypot(m.x-h.x,m.y-h.y)<220);
    if(maintainWalkingHealth)await maintainWalkingHealth(h,threatened);
    const dir=await directionTo(target);await touch(dir.x,dir.y,threatened);await page.waitForTimeout(100);await release();
   }
   await release();throw Error('Walking timed out: '+JSON.stringify({target,hero:await read()}));
  };
  await walkTo({x:1270,y:1240});
  const combatDeadline=Date.now()+65000;let lastProgress=-1,multitouch=false,touchSampled=false;
  while(Date.now()<combatDeadline){
   const h=await read(),progress=h.quests.forestWolves.progress;
   if(progress!==lastProgress){console.log('JOURNEY hunt',JSON.stringify({progress,hp:h.hp,level:h.level,gold:h.gold,x:Math.round(h.x),y:Math.round(h.y)}));lastProgress=progress;}
   if(progress>=5)break;
   assert.ok(h.hp>0,'fresh hero should survive starter hunt');
   const target=h.wolves.filter(m=>m.id.startsWith('forest-starter-wolf-')).sort((a,b)=>Math.hypot(a.x-h.x,a.y-h.y)-Math.hypot(b.x-h.x,b.y-h.y))[0];assert.ok(target,'starter camp must have reachable living wolves');
   if(!multitouch||Math.hypot(target.x-h.x,target.y-h.y)>65){const dir=await directionTo(target);await touch(dir.x,dir.y,true);}
   else await touch(0,0,true);
   await page.waitForTimeout(60);const state=await read();if(!touchSampled){console.log('JOURNEY initial touch',JSON.stringify({attacking:state.attacking,axis:state.axis}));touchSampled=true;}multitouch ||= state.attacking&&Math.hypot(state.axis.x,state.axis.y)>.1;
   await page.waitForTimeout(150);
  }
  await release();assert.equal((await read()).quests.forestWolves.progress,5,'five kills must come from held basic attack');assert.equal(multitouch,true,'joystick and attack should work simultaneously');
  console.log('PASS five wolves defeated by real multitouch movement and basic attacks');
  await walkTo({x:1000,y:1120},25);
  await openNpc(page,'mira');
  await page.locator('[data-quest-id=forestWolves]').getByRole('button',{name:'Получить награду',exact:true}).click();
  assert.equal((await read()).quests.forestWolves.state,'claimed');assert.ok((await read()).level>=2);
  for(const id of ['forest_contract_1','forest_survey_1'])await page.locator('[data-quest-id='+id+']').getByRole('button',{name:/Получить награду/}).click();
  await page.locator('[data-quest-id=forestFangs]').getByRole('button',{name:/Принять задание/}).click();
  await page.locator('.npc-heading button').click();
  await walkTo({x:1090,y:1050},18);
  await page.locator('.npc-interact').click();
  if(await page.locator('.npc-selector select').count())await page.locator('.npc-selector select').selectOption('borin');
  await page.locator('[data-quest-id=forestFangs]').getByRole('button',{name:/Получить награду/}).click();
  assert.equal((await read()).quests.forestFangs.state,'claimed');assert.ok((await read()).gold>=25);
  await page.locator('[data-quest-id=forest_dispatch_1]').getByRole('button',{name:/Получить награду/}).click();
  await page.locator('.npc-heading button').click();
  console.log('PASS wolf reward and earned fangs delivered to Borin through UI');

  const spend=async()=>{
   await page.locator('#character-btn').click();
   while((await read()).attributePoints>0){const h=await read(),attribute=h.stats.endurance<=h.stats.strength?'Выносливость':'Сила';await page.getByRole('button',{name:'Увеличить '+attribute,exact:true}).click();}
   await page.locator('.character-heading button').click();
   await page.locator('#skills-btn').click();await page.locator('.skill-select').first().click();
   while((await read()).skillPoints>0&&((await read()).learnedSkills.warrior_0||0)<2)await page.getByRole('button',{name:'Изучить / улучшить (+1)',exact:true}).click();
   await page.locator('.skill-slot-choices button').first().click();
   if((await read()).level>=5&&(await read()).skillPoints>0){
    await page.locator('.skill-select').nth(1).click();while((await read()).skillPoints>0&&((await read()).learnedSkills.warrior_1||0)<5)await page.getByRole('button',{name:'Изучить / улучшить (+1)',exact:true}).click();await page.locator('.skill-slot-choices button').nth(1).click();
   }
   await page.locator('.skill-heading button').click();
  };
  await spend();
  const clickReady=async locator=>{if(!await locator.isEnabled())return;await release();try{await locator.click({timeout:5000});}catch(error){if(await locator.isEnabled())throw error;}};
  const useCombatUI=async()=>{
   const h=await read();
   if(h.hp<h.maxHp*.65)await clickReady(page.getByRole('button',{name:'Зелье здоровья',exact:true}));
   else if(h.mp<h.maxMp*.25&&h.hp>h.maxHp*.7)await clickReady(page.getByRole('button',{name:'Зелье маны',exact:true}));
   await clickReady(page.locator('#skills .skill').first());
   if(h.learnedSkills.warrior_1)await clickReady(page.locator('#skills .skill').nth(1));
  };
  maintainWalkingHealth=async(h,threatened)=>{
   if(h.hp<h.maxHp*.75)await clickReady(page.getByRole('button',{name:'Зелье здоровья',exact:true}));
   if(threatened)await useCombatUI();
  };
  const recoverBeforeAdvance=async label=>{
   await release();const expectedRegion=(await read()).region,deadline=Date.now()+60000;
   while(Date.now()<deadline){
    const h=await read();assert.equal(h.region,expectedRegion,'Unexpected transition or death while resting');assert.ok(h.hp>0&&h.deathStartedAt===null,'Hero died while resting');
    if(h.hp>=h.maxHp*.90&&h.mp>=h.maxMp*.40){console.log('PASS rested before '+label,JSON.stringify({hp:h.hp,maxHp:h.maxHp,mp:h.mp}));return;}
    const threatened=h.monsters.some(m=>Math.hypot(m.x-h.x,m.y-h.y)<290);
    if(threatened){await maintainWalkingHealth(h,true);return;}
    if(h.hp<h.maxHp*.60)await clickReady(page.getByRole('button',{name:'Зелье здоровья',exact:true}));
    await page.waitForTimeout(350);
   }
   throw Error('Real regeneration did not recover hero before '+label+' '+JSON.stringify(await read()));
  };
  const fightUntil=async(predicate,label,filter=()=>true,maxMs=90000)=>{
   const deadline=Date.now()+maxMs,expectedRegion=(await read()).region;let lastLevel=0;
   while(Date.now()<deadline){
    const h=await read();assert.equal(h.region,expectedRegion,'Unexpected transition or death during '+label);if(predicate(h)){await release();console.log('PASS',label,JSON.stringify({level:h.level,xp:h.xp,gold:h.gold,hp:h.hp,seconds:Math.round((Date.now()-started)/1000)}));return;}
    assert.ok(h.hp>0&&h.deathStartedAt===null,'hero died during '+label);
    if(h.level!==lastLevel){console.log('DUNGEON JOURNEY',label,JSON.stringify({level:h.level,xp:h.xp,gold:h.gold,hp:h.hp}));lastLevel=h.level;}
    const target=h.monsters.filter(filter).sort((a,b)=>Math.hypot(a.x-h.x,a.y-h.y)-Math.hypot(b.x-h.x,b.y-h.y))[0];
    if(!target){await release();await page.waitForTimeout(250);continue;}
    if(Math.hypot(target.x-h.x,target.y-h.y)>60){const dir=await directionTo(target);await touch(dir.x,dir.y,true);await page.waitForTimeout(100);await touch(0,0,true);}else await touch(0,0,true);
    await useCombatUI();await page.waitForTimeout(140);
   }
   await release();throw Error(label+' timed out '+JSON.stringify(await read()));
  };
  await walkTo({x:1360,y:1280});
  await fightUntil(h=>h.level>=4,'earn level4 from real wolves',m=>m.id.startsWith('forest-starter-wolf-'));
  await spend();
  await fightUntil(h=>h.level>=5,'earn level5 from real starter-camp wolves',m=>m.id.startsWith('forest-starter-wolf-'),150000);
  assert.ok((await read()).level>=5,'dungeon gate is unlocked through earned experience');await spend();
  console.log('PASS earned level5 and allocated all earned attributes and combat skills');

  await walkTo({x:1000,y:1120},25);
  const eligible=(await read()).inventory.filter(item=>item.slot&&item.level<=(5)&&(!item.allowedClasses||item.allowedClasses.includes('warrior')));
  if(eligible.length){
   await page.locator('#inventory-btn').click();await page.getByRole('button',{name:'II · Рюкзак',exact:true}).click();
   for(const item of eligible){await page.locator('.inventory-grid').getByRole('button',{name:item.name,exact:true}).first().click();await page.getByRole('button',{name:'Надеть',exact:true}).click();}
   await page.locator('.inventory-heading button').click();
  }
  await page.locator('.npc-interact').click();if(await page.locator('.npc-selector select').count())await page.locator('.npc-selector select').selectOption('mira');await page.getByRole('button',{name:'Торговля',exact:true}).click();
  while(await page.locator('.npc-shop-row').getByRole('button',{name:/^Продать/}).count())await page.locator('.npc-shop-row').getByRole('button',{name:/^Продать/}).first().click();
  const weapon=page.getByRole('button',{name:'Купить: Стальной меч · Обычный',exact:true});
  if(await weapon.isEnabled())await weapon.click();
  const goldAfterGear=(await read()).gold;
  while((await read()).potions.hp<12&&(await read()).gold>=10)await page.locator('.npc-shop-row').first().getByRole('button',{name:'Купить',exact:true}).click();
  await page.locator('.npc-heading button').click();
  const sword=(await read()).inventory.find(i=>i.id==='weapon_warrior_1');
  if(sword){await page.locator('#inventory-btn').click();await page.getByRole('button',{name:'II · Рюкзак',exact:true}).click();await page.getByRole('button',{name:'Стальной меч',exact:true}).click();await page.getByRole('button',{name:'Надеть',exact:true}).click();await page.locator('.inventory-heading button').click();}
  console.log('PASS earned gold spent on dungeon supplies',JSON.stringify({gear:(await read()).equipment,goldAfterGear,potions:(await read()).potions}));
  await recoverBeforeAdvance('first dungeon approach');
  for(const target of [{x:1530,y:1220},{x:1770,y:1600},{x:1820,y:1780}])await walkTo(target,35);
  await recoverBeforeAdvance('first dungeon entry');
  await page.locator('.dungeon-interact').click();await page.getByRole('button',{name:'Лёгкая · HP/ATK ×1',exact:true}).click();
  assert.equal((await read()).region,'dungeon:dungeon1:easy');console.log('PASS entered first dungeon by real level gate and entrance UI');
  const roomData=await page.evaluate(()=>{const c=Auralis.game.scene.getScene('world').regionContent;return c.rooms.map((r,index)=>({id:r.id,x:r.x+r.width/2,y:r.y+r.height/2,spawnIds:c.camps.find(camp=>camp.id==='dungeon1-room-'+index)?.spawns.map(m=>m.id)||[]}));});
  const originalMobIds=roomData.slice(0,-1).flatMap(room=>room.spawnIds),defeatedOriginalIds=new Set();assert.equal(originalMobIds.length,18,'The full first dungeon must contain18 original ordinary enemies');
  for(let index=0;index<roomData.length;index++){
   const room=roomData[index];await recoverBeforeAdvance('dungeon room '+index);await useCombatUI();if(index){const previous=roomData[index-1];await walkTo({x:room.x,y:previous.y},24);}await walkTo(room,40);
   const campId='dungeon1-room-'+index;
   if(index<roomData.length-1){
    const defeated=new Set();
    await fightUntil(h=>{for(const id of room.spawnIds)if(h.dead.some(key=>key.endsWith(':'+id))){defeated.add(id);defeatedOriginalIds.add(id);}return defeated.size===room.spawnIds.length;},'defeat every original enemy in real dungeon room '+index,m=>m.campId===campId&&!defeated.has(m.id),85000);
   }
   else await fightUntil(h=>h.dungeonProgress['dungeon1:easy']?.completed===true,'defeat real first dungeon boss',m=>m.boss,110000);
   if((await read()).attributePoints>0||(await read()).skillPoints>0)await spend();
  }
  assert.deepEqual([...defeatedOriginalIds].sort(),[...originalMobIds].sort(),'All18 original enemies must have actual kill records, not injury records');
  const completed=await read();assert.equal(completed.dungeonProgress['dungeon1:easy'].rewarded,true);assert.deepEqual(completed.dungeonProgress['dungeon1:easy'].killed,['dungeon1-boss-0']);
  await page.screenshot({path:path.join(root,'work/browser/first-dungeon-earned-victory.png')});
  for(let index=roomData.length-2;index>=0;index--){await useCombatUI();await walkTo({x:roomData[index+1].x,y:roomData[index].y},25);await walkTo(roomData[index],30);}
  await walkTo({x:170,y:300},30);await page.getByRole('button',{name:'Покинуть подземелье',exact:true}).click();assert.equal((await read()).region,'forest');
  await page.reload();await page.getByRole('button',{name:'Играть',exact:true}).click();await page.getByRole('button',{name:'Продолжить',exact:true}).first().click();await page.waitForFunction(()=>window.Auralis?.game.scene.getScene('world')?.world);
  const restored=await read();assert.equal(restored.region,'forest');assert.equal(restored.dungeonProgress['dungeon1:easy'].completed,true);assert.equal(restored.dungeonProgress['dungeon1:easy'].rewarded,true);assert.equal(restored.dungeonProgress['dungeon1:easy'].readyAt,completed.dungeonProgress['dungeon1:easy'].readyAt);assert.ok(restored.level>=5);assert.deepEqual(errors,[]);
  console.log('PASS first dungeon genuinely cleared, exited and restored without runtime-state writes or fixture damage');
  console.log('FIRST DUNGEON RESULT',JSON.stringify({seconds:Math.round((Date.now()-started)/1000),level:restored.level,xp:restored.xp,gold:restored.gold,completed:restored.dungeonProgress['dungeon1:easy']}));
 }catch(error){if(page){console.error('DUNGEON FAILURE STATE',await page.evaluate(()=>{const s=window.Auralis?.game.scene.getScene('world');return s?{hero:s.hero,controls:{axis:{...s.controls.axis},pointerId:s.controls.pointerId,attackPointerId:s.controls.attackPointerId,attacking:s.controls.attacking},monsters:s.monsters.monsters.map(m=>({id:m.id,x:m.x,y:m.y,hp:m.hp,alive:m.alive}))}:null;}).catch(()=>null));await page.screenshot({path:path.join(root,'work/browser/first-dungeon-failure.png')}).catch(()=>{});}throw error;}finally{if(browser)await browser.close();await hosting.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
