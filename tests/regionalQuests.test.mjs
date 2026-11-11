import test from 'node:test';
import assert from 'node:assert/strict';
import {QUESTS,questDefinition,questProgress,acceptQuest,recordKill,recordEvent,updateQuestProgress,claimQuest,questsForNpc} from '../js/quests/quests.js';
import {getRegionContent} from '../js/world/regionContent.js';
import {createCharacter} from '../js/characters/Character.js';
import {NPCS} from '../js/npc/npcData.js';
const validTypes=new Set(['kill','explore','talk','collect','deliver','boss','dungeon']);
test('all regional quest objectives reference reachable world descriptors and localized text',()=>{
 assert.ok(QUESTS.length>=90);assert.equal(new Set(QUESTS.map(q=>q.id)).size,QUESTS.length);
 for(const q of QUESTS){
  const c=getRegionContent(q.region);assert.ok(validTypes.has(q.type));assert.ok(c.npcs.some(n=>n.id===q.npcId),q.id);
  if(q.turnInNpcId)assert.ok(NPCS.some(n=>n.id===q.turnInNpcId),q.id);
  if(q.targetCampId)assert.ok(c.camps.some(camp=>camp.id===q.targetCampId&&camp.type===q.target),q.id);
  if(q.type==='boss')assert.ok(c.bosses.some(b=>b.id===q.target),q.id);
  if(['talk','deliver'].includes(q.type))assert.ok(NPCS.some(n=>n.id===q.target),q.id);
  if(q.location){const region=getRegionContent(q.location.region);assert.ok(q.location.x>=0&&q.location.x<region.width&&q.location.y>=0&&q.location.y<region.height,q.id);}
  for(const lang of ['ru','en','es']){assert.ok(q.title[lang]?.length>0,q.id);assert.ok(q.description[lang]?.length>0,q.id);}
  const visit=(id,path=[])=>{assert.ok(!path.includes(id),'Cyclic prerequisite '+q.id);const definition=questDefinition(id);assert.ok(definition,'Missing prerequisite '+id);for(const parent of definition.requires||[])visit(parent,[...path,id]);};visit(q.id);
 }
});
test('every listed quest can be accepted, completed through its real event type and claimed exactly once',()=>{
 for(const q of QUESTS){
  const hero=createCharacter({level:42,region:q.region,x:1000,y:1000});for(const id of q.requires||[])hero.quests[id]={state:'claimed',progress:99};
  assert.equal(acceptQuest(hero,q.id,'invalid-npc'),false,q.id);assert.equal(acceptQuest(hero,q.id,q.npcId),true,q.id);
  if(q.type==='kill'){for(let i=0;i<q.required;i++)recordKill(hero,q.target,{campId:q.targetCampId,region:q.region});}
  if(q.type==='boss')recordEvent(hero,'boss',{id:q.target,region:q.region});
  if(q.type==='talk')recordEvent(hero,'talk',{npcId:q.target,region:q.region});
  if(['collect','deliver'].includes(q.type)){hero.inventory.push({id:q.itemId,rarity:'common',quantity:q.type==='deliver'?q.quantity:q.required});if(q.type==='deliver')recordEvent(hero,'talk',{npcId:q.target,region:q.region});else updateQuestProgress({hero});}
  if(q.type==='explore'){hero.region=q.location.region;hero.x=q.location.x;hero.y=q.location.y;updateQuestProgress({hero});}
  if(q.type==='dungeon')recordEvent(hero,'dungeon',{id:q.target,region:q.region});
  assert.equal(questProgress(hero,q.id).state,'completed',q.id);
  assert.equal(claimQuest(hero,q.id,'wrong-npc').ok,false,q.id);assert.equal(claimQuest(hero,q.id,q.turnInNpcId||q.npcId).ok,true,q.id);
  const snapshot=JSON.stringify(hero);assert.equal(claimQuest(hero,q.id).ok,false,q.id);assert.equal(JSON.stringify(hero),snapshot,q.id);
  if(['deliver','collect'].includes(q.type))assert.ok(!hero.inventory.some(item=>item.id===q.itemId),q.id);
 }
});
test('contract kills require the specific camp and region, not a matching monster elsewhere',()=>{
 const q=QUESTS.find(q=>q.targetCampId),hero=createCharacter({level:42,region:q.region});for(const id of q.requires||[])hero.quests[id]={state:'claimed'};acceptQuest(hero,q.id);
 assert.equal(recordKill(hero,q.target,{campId:'wrong',region:q.region}),false);assert.equal(questProgress(hero,q.id).progress,0);
 recordKill(hero,q.target,{campId:q.targetCampId,region:q.region==='forest'?'north':'forest'});assert.equal(questProgress(hero,q.id).progress,0);
 recordKill(hero,q.target,{campId:q.targetCampId,region:q.region});assert.equal(questProgress(hero,q.id).progress,1);
});
test('delivery receiver sees the active task and resources are rechecked before payout',()=>{
 const hero=createCharacter({level:42,region:'forest'}),q=questDefinition('forestFangs');hero.quests.forestWolves={state:'claimed'};assert.equal(acceptQuest(hero,q.id,'mira'),true);
 hero.inventory.push({id:'wolfFang',rarity:'common',quantity:3});recordEvent(hero,'talk',{npcId:'borin',region:'forest'});assert.ok(questsForNpc(hero,'borin').some(x=>x.id===q.id));
 hero.inventory=[];assert.equal(claimQuest(hero,q.id,'borin').ok,false);assert.equal(hero.gold,0);
});
