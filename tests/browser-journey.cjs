const {startServer,launchOptions,root,openNpc,collectNearbyLoot}=require('./browserHarness.cjs');
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');

// A genuine fresh-character journey. Scene access is read-only: every change to
// movement, combat, quests, resources and progression comes from visible controls.
(async()=>{
 const hosting=await startServer();let browser;
 const started=Date.now();
 try{
  browser=await chromium.launch(launchOptions);
  const page=await browser.newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(hosting.url);
  await page.getByRole('button',{name:'Играть',exact:true}).click();
  await page.getByRole('button',{name:'Создать персонажа',exact:true}).first().click();
  await page.locator('input').fill('Journey');
  await page.getByRole('button',{name:'Начать приключение',exact:true}).click();
  await page.waitForFunction(()=>window.Auralis?.game.scene.getScene('world')?.world);
  const read=()=>page.evaluate(()=>{
   const s=Auralis.game.scene.getScene('world'),h=s.hero;
   return {x:h.x,y:h.y,hp:h.hp,maxHp:h.maxHp,level:h.level,xp:h.xp,gold:h.gold,attributePoints:h.attributePoints,skillPoints:h.skillPoints,stats:{...h.stats},potions:{...h.potions},quests:JSON.parse(JSON.stringify(h.quests)),learnedSkills:{...h.learnedSkills},skillSlots:[...h.skillSlots],wolves:s.monsters.monsters.filter(m=>m.alive&&m.type==='forestWolf').map(m=>({id:m.id,x:m.x,y:m.y,hp:m.hp})),axis:{...s.controls.axis},attacking:s.controls.attacking};
  });
  assert.equal((await read()).level,1);assert.deepEqual((await read()).quests,{});
  await openNpc(page,'mira');
  await page.locator('[data-quest-id=forestWolves]').getByRole('button',{name:'Принять задание',exact:true}).click();
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
   if(!touching){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[points[0]]});if(holdAttack)await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points});}
   else if(!holdAttack&&attacking){await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[{id:2,...attackPoint}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[points[0]]});}
   else await cdp.send('Input.dispatchTouchEvent',{type:holdAttack&&!attacking?'touchStart':'touchMove',touchPoints:points});touching=true;attacking=holdAttack;
  };
  const release=async()=>{if(touching)await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});touching=false;attacking=false;};
  const directionTo=async target=>page.evaluate(target=>{
   const s=Auralis.game.scene.getScene('world'),h=s.hero;
   const clear=(a,b)=>{const distance=Math.hypot(a.x-b.x,a.y-b.y);for(let d=0;d<=distance;d+=8){const t=distance?d/distance:0;if(!s.world.isWalkable(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t))return false;}return true;};
   if(clear(h,target))return {x:target.x-h.x,y:target.y-h.y};
   // Read-only local route search lets the touch driver walk around real scenery.
   const step=32,origin={x:Math.round(h.x/step)*step,y:Math.round(h.y/step)*step},key=(x,y)=>x+','+y;
   const queue=[origin],seen=new Map([[key(origin.x,origin.y),null]]);let goal=null;
   for(let index=0;index<queue.length&&queue.length<2000;index++){
    const p=queue[index];if(Math.hypot(p.x-target.x,p.y-target.y)<step*1.5&&clear(p,target)){goal=p;break;}
    for(const [dx,dy]of [[step,0],[-step,0],[0,step],[0,-step]]){
     const next={x:p.x+dx,y:p.y+dy},id=key(next.x,next.y);
     if(seen.has(id)||Math.hypot(next.x-h.x,next.y-h.y)>650||!s.world.isWalkable(next.x,next.y)||!clear(p,next))continue;
     seen.set(id,p);queue.push(next);
    }
   }
   if(!goal)throw Error('No walkable local route to '+JSON.stringify(target));
   let waypoint=goal,parent=seen.get(key(goal.x,goal.y));
   while(parent&&seen.get(key(parent.x,parent.y))){waypoint=parent;parent=seen.get(key(parent.x,parent.y));}
   return {x:waypoint.x-h.x,y:waypoint.y-h.y};
  },target);
  const walkTo=async(target,tolerance=30)=>{
   const deadline=Date.now()+20000;
   while(Date.now()<deadline){
    const h=await read();if(Math.hypot(h.x-target.x,h.y-target.y)<=tolerance){await release();return;}
    const dir=await directionTo(target);await touch(dir.x,dir.y,false);await page.waitForTimeout(100);
   }
   await release();throw Error('Walking timed out: '+JSON.stringify({target,hero:await read()}));
  };
  await walkTo({x:1270,y:1240});
  const combatDeadline=Date.now()+55000;let lastProgress=-1,multitouch=false;
  while(Date.now()<combatDeadline){
   const h=await read(),progress=h.quests.forestWolves.progress;
   if(progress!==lastProgress){console.log('JOURNEY hunt',JSON.stringify({progress,hp:h.hp,level:h.level,gold:h.gold,x:Math.round(h.x),y:Math.round(h.y)}));lastProgress=progress;}
   if(progress>=5)break;
   assert.ok(h.hp>0,'fresh hero should survive starter hunt');
   const target=h.wolves.sort((a,b)=>Math.hypot(a.x-h.x,a.y-h.y)-Math.hypot(b.x-h.x,b.y-h.y))[0];assert.ok(target,'starter camp must have reachable living wolves');
   if(Math.hypot(target.x-h.x,target.y-h.y)>65){const dir=await directionTo(target);await touch(dir.x,dir.y,true);}
   else await touch(0,0,true);
   const state=await read();multitouch ||= state.attacking&&Math.hypot(state.axis.x,state.axis.y)>.1;
   await page.waitForTimeout(150);
  }
  await release();assert.equal((await read()).quests.forestWolves.progress,5,'five kills must come from held basic attack');assert.equal(multitouch,true,'joystick and attack should work simultaneously');
  console.log('PASS five wolves defeated by real multitouch movement and basic attacks');
  if((await read()).hp<(await read()).maxHp*.65&&await page.getByRole('button',{name:'Зелье здоровья',exact:true}).isEnabled())await page.getByRole('button',{name:'Зелье здоровья',exact:true}).click();
  console.log('JOURNEY physically collected anonymous drops',await collectNearbyLoot(page,walkTo));
  await walkTo({x:1000,y:1120},25);
  await openNpc(page,'mira');
  await page.locator('[data-quest-id=forestWolves]').getByRole('button',{name:'Получить награду',exact:true}).click();
  assert.equal((await read()).quests.forestWolves.state,'claimed');assert.ok((await read()).level>=2);
  await page.locator('[data-quest-id=forestFangs]').getByRole('button',{name:/Принять задание/}).click();
  await page.locator('.npc-heading button').click();
  await walkTo({x:1090,y:1050},18);
  await page.locator('.npc-interact').click();
  if(await page.locator('.npc-selector select').count())await page.locator('.npc-selector select').selectOption('borin');
  await page.locator('[data-quest-id=forestFangs]').getByRole('button',{name:/Получить награду/}).click();
  assert.equal((await read()).quests.forestFangs.state,'claimed');assert.ok((await read()).gold>=25);
  await page.locator('.npc-heading button').click();
  console.log('PASS wolf reward and earned fangs delivered to Borin through UI');

  const beforeSpend=await read();assert.ok(beforeSpend.attributePoints>=3&&beforeSpend.skillPoints>=1);
  await page.locator('#character-btn').click();
  await page.getByRole('button',{name:'Увеличить Сила',exact:true}).click();
  await page.locator('.character-heading button').click();
  await page.locator('#skills-btn').click();await page.locator('.skill-select').first().click();
  await page.getByRole('button',{name:'Изучить / улучшить (+1)',exact:true}).click();
  await page.locator('.skill-slot-choices button').first().click();await page.locator('.skill-heading button').click();
  const afterSpend=await read();assert.equal(afterSpend.stats.strength,beforeSpend.stats.strength+1);assert.equal(afterSpend.attributePoints,beforeSpend.attributePoints-1);assert.equal(afterSpend.skillPoints,beforeSpend.skillPoints-1);assert.equal(afterSpend.learnedSkills.warrior_0,1);assert.equal(afterSpend.skillSlots[0],'warrior_0');
  console.log('PASS legitimately earned attribute and skill points spent through UI');
  await walkTo({x:1000,y:1120},25);await page.locator('.npc-interact').click();
  if(await page.locator('.npc-selector select').count())await page.locator('.npc-selector select').selectOption('mira');
  await page.getByRole('button',{name:'Торговля',exact:true}).click();
  const beforePurchase=await read();assert.ok(beforePurchase.gold>=10);
  await page.locator('.npc-shop-row').first().getByRole('button',{name:'Купить',exact:true}).click();
  const purchased=await read();assert.equal(purchased.potions.hp,beforePurchase.potions.hp+1);assert.equal(purchased.gold,beforePurchase.gold-10);
  await page.locator('.npc-heading button').click();
  await page.screenshot({path:path.join(root,'work/browser/journey-earned-progress.png')});
  await page.reload();await page.getByRole('button',{name:'Играть',exact:true}).click();await page.getByRole('button',{name:'Продолжить',exact:true}).first().click();
  await page.waitForFunction(()=>window.Auralis?.game.scene.getScene('world')?.world);
  const restored=await read();for(const id of ['forestWolves','forestFangs'])assert.equal(restored.quests[id].state,'claimed');assert.equal(restored.gold,purchased.gold);assert.equal(restored.level,purchased.level);assert.equal(restored.stats.strength,purchased.stats.strength);assert.equal(restored.skillSlots[0],'warrior_0');assert.equal(restored.potions.hp,purchased.potions.hp);assert.deepEqual(errors,[]);
  console.log('PASS earned progress, purchase and two claimed quests survive reload; no runtime-state writes or fixture damage');
  console.log('JOURNEY RESULT',JSON.stringify({seconds:Math.round((Date.now()-started)/1000),level:restored.level,xp:restored.xp,gold:restored.gold,quests:['forestWolves','forestFangs'],strength:restored.stats.strength,skill:restored.skillSlots[0],hpPotions:restored.potions.hp}));
 }finally{if(browser)await browser.close();await hosting.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
