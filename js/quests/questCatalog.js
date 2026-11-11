import {buildRegionalContracts} from './questContracts.js';
// Concrete objectives are attached to the real region NPCs/camps, not to menu-only content.
// Additional quest types are supported by the engine but only reachable content is listed here.
const text=(ru,en,es)=>({ru,en,es});
export function buildQuestCatalog(contentByRegion={}){
 const list=[{id:'forestWolves',npcId:'mira',region:'forest',type:'kill',target:'wolf',required:5,level:1,xp:90,gold:0,reward:{id:'wolfFang',rarity:'common',quantity:3},title:text('Безопасная дорога','A safer road','Un camino seguro'),description:text('Победи пять лесных волков и вернись к Мире.','Defeat five forest wolves and return to Mira.','Derrota a cinco lobos del bosque y vuelve con Mira.')}];
 list.push({id:'forestFangs',npcId:'mira',turnInNpcId:'borin',region:'forest',type:'deliver',target:'borin',required:1,itemId:'wolfFang',quantity:3,level:2,requires:['forestWolves'],xp:75,gold:25,title:text('Материал для Борина','Materials for Borin','Materiales para Borin'),description:text('Принеси Борину три клыка волка. При сдаче они будут переданы ему.','Bring three wolf fangs to Borin. They are consumed when delivered.','Lleva tres colmillos de lobo a Borin. Se entregan al completar la misión.')});
 for(const [region,c] of Object.entries(contentByRegion)){
  const npcs=c.npcs||[],towns=c.towns||[],camps=c.camps||[],bosses=c.bosses||[];
  const giver=npcs.find(n=>n.role==='questGiver'||n.roles?.includes('questGiver'))||npcs.find(n=>n.id==='mira')||npcs[0];
  if(!giver)continue;
  const level=region==='forest'?3:region==='north'?22:35;
  const receiver=npcs.find(n=>n.townId!==giver.townId)||npcs.find(n=>n.id!==giver.id);
  const town=towns.find(t=>t.id!==giver.townId)||towns[0],camp=camps.find(camp=>camp.level>=level)||camps[0],boss=bosses.find(b=>b.bossType==='mini')||bosses[0];
  const prefix=region+'_';
  const huntId=prefix+'patrol';
  if(camp)list.push({id:huntId,npcId:giver.id,region,type:'kill',target:camp.type,required:6,level,xp:100+level*28,gold:30+level*5,title:text('Очистить охотничью тропу','Clear the hunting trail','Despejar la senda de caza'),description:text('Победи шесть противников указанного лагеря. Место отмечено в поручении.','Defeat six enemies from the marked camp.','Derrota a seis enemigos del campamento indicado.'),location:{x:camp.x,y:camp.y,region},targetCampId:camp.id});
  if(receiver)list.push({id:prefix+'message',npcId:giver.id,turnInNpcId:receiver.id,region,type:'talk',target:receiver.id,required:1,level,xp:90+level*18,gold:20+level*3,title:text('Вести между поселениями','News between settlements','Noticias entre poblados'),description:text('Найди указанного жителя и поговори с ним.','Find and speak with the indicated resident.','Encuentra al habitante indicado y habla con él.'),location:{x:receiver.x,y:receiver.y,region}});
  if(town)list.push({id:prefix+'scout',npcId:giver.id,region,type:'explore',target:town.id,required:1,level:level+1,requires:camp?[huntId]:[],xp:120+level*25,gold:40+level*4,title:text('Проверить дорогу','Survey the road','Reconocer el camino'),description:text('Дойди до другого поселения и вернись с вестями.','Reach the other settlement and return with news.','Llega al otro poblado y regresa con noticias.'),location:{x:town.spawn.x,y:town.spawn.y,region,radius:130}});
  if(boss)list.push({id:prefix+'guardian',npcId:giver.id,region,type:'boss',target:boss.id,required:1,level:Math.max(level,boss.level-1),requires:camp?[huntId]:[],xp:300+boss.level*50,gold:100+boss.level*15,title:text('Угроза на границе','Threat at the frontier','Amenaza en la frontera'),description:text('Победи указанного мини-босса и вернись за наградой.','Defeat the indicated miniboss and return for a reward.','Derrota al minijefe indicado y vuelve por tu recompensa.'),location:{x:boss.x,y:boss.y,region}});
 }
 return [...list,...buildRegionalContracts(contentByRegion)];
}
