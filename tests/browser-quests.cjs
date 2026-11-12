const {startServer,launchOptions}=require('./browserHarness.cjs');
const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const hosting=await startServer();let browser;try{browser=await chromium.launch(launchOptions);const p=await browser.newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true});const errors=[];p.on('pageerror',e=>{errors.push(e.message);console.log('PAGEERROR',e.message)});await p.goto(hosting.url);await p.getByRole('button',{name:'Играть',exact:true}).click();await p.getByRole('button',{name:'Создать персонажа',exact:true}).first().click();await p.locator('input').fill('QuestAudit');await p.getByRole('button',{name:'Начать приключение',exact:true}).click();await p.waitForFunction(()=>window.Auralis?.game.scene.getScene('world')?.world);
await p.evaluate(async()=>{const {createCharacter}=await import('/js/characters/Character.js');const s=Auralis.game.scene.getScene('world');Object.assign(s.hero,createCharacter({...s.hero,level:42,gold:1000000,stats:{strength:100,endurance:1000,agility:100,luck:5,intelligence:100}}));});
const ids=await p.evaluate(async()=>{const {QUESTS}=await import('/js/quests/quests.js');return QUESTS.map(q=>q.id)});
for(const id of ids){const result=await p.evaluate(async id=>{
 const {questDefinition,questProgress}=await import('/js/quests/quests.js'),{NPCS}=await import('/js/npc/npcData.js'),{getRegionContent}=await import('/js/world/regionContent.js'),{addItem,itemDefinition}=await import('/js/equipment/items.js');
 const s=Auralis.game.scene.getScene('world'),h=s.hero,q=questDefinition(id),giver=NPCS.find(n=>n.id===q.npcId),receiver=NPCS.find(n=>n.id===(q.turnInNpcId||q.npcId));
 const load=(region,x,y)=>{s.closePanels();s.world.load({region,x,y});h.hp=h.maxHp;};
 h.inventory=h.inventory.filter(item=>!itemDefinition(item)?.slot);h.worldState.monsters={};
 load(giver.region,giver.x,giver.y);s.npcPanel.show(giver);let card=s.npcPanel.root.querySelector(`[data-quest-id="${id}"]`),button=card?.querySelector('button');if(!button)throw Error('No accept UI '+id+' state '+questProgress(h,id).state);button.click();s.npcPanel.close();
 if(q.type==='kill'){
  const c=getRegionContent(q.region),camp=q.targetCampId?c.camps.find(camp=>camp.id===q.targetCampId):c.camps.find(camp=>camp.type==='forestWolf');
  let rounds=0;while(questProgress(h,id).state!=='completed'&&rounds++<12){h.worldState.monsters={};load(q.region,camp.x,camp.y);const targets=[...s.monsters.monsters].filter(m=>m.alive&&(q.targetCampId?m.campId===q.targetCampId:m.type==='forestWolf'));if(!targets.length)throw Error('No runtime target '+id);for(const m of targets){s.monsters.hit(m,100000000,s.playNow);if(questProgress(h,id).state==='completed')break;}}
 }
 if(q.type==='boss'){const boss=getRegionContent(q.region).bosses.find(b=>b.id===q.target);load(q.region,boss.x,boss.y);const m=s.monsters.monsters.find(m=>m.id===q.target);if(!m)throw Error('No runtime boss '+id);s.monsters.hit(m,100000000,s.playNow);}
 if(['collect','deliver'].includes(q.type)){if(!addItem(h,{id:q.itemId,rarity:'common',quantity:q.type==='collect'?q.required:q.quantity}))throw Error('Fixture inventory full '+id);}
 if(['talk','deliver'].includes(q.type)){const target=NPCS.find(n=>n.id===q.target);load(target.region,target.x,target.y);s.npcPanel.show(target);s.npcPanel.close();}
 if(q.type==='explore')load(q.location.region,q.location.x,q.location.y);
 if(q.type==='dungeon'){
  load(q.region,q.location.x,q.location.y);const entered=s.enterDungeon(q.target,'easy');if(!entered.ok)throw Error('Dungeon entry '+id+':'+entered.reason);const content=s.regionContent;
  for(const boss of content.bosses){load(content.id,boss.x,boss.y);const m=s.monsters.monsters.find(m=>m.id===boss.id);if(!m)throw Error('Missing dungeon boss '+id);s.monsters.hit(m,100000000,s.playNow);}
  s.leaveDungeon();
 }
 return {id,type:q.type,state:questProgress(h,id).state,receiver};
 },id);
 if(['collect','explore'].includes(result.type))await p.waitForFunction(async id=>{const {questProgress}=await import('/js/quests/quests.js');return questProgress(Auralis.game.scene.getScene('world').hero,id).state==='completed';},id,{timeout:10000});
 const claimed=await p.evaluate(async ({id,receiver})=>{const {questProgress}=await import('/js/quests/quests.js'),s=Auralis.game.scene.getScene('world');s.closePanels();s.world.load({region:receiver.region,x:receiver.x,y:receiver.y});s.npcPanel.show(receiver);const card=s.npcPanel.root.querySelector(`[data-quest-id="${id}"]`),button=card?.querySelector('button');if(!button)throw Error('No claim UI '+id+' state '+questProgress(s.hero,id).state);button.click();const state=questProgress(s.hero,id).state;s.npcPanel.close();return state;},{id,receiver:result.receiver});assert.equal(claimed,'claimed',id);console.log('PASS runtime quest',id,result.type);
}
assert.deepEqual(errors,[]);console.log('PASS all'+ids.length+' quests via NPC UI callbacks and live monster/dungeon/exploration paths; fixtures set level/resources/position/respawn resets, not a manual playthrough');
}finally{if(browser)await browser.close();await hosting.close();}})().catch(e=>{console.error(e);process.exitCode=1});
