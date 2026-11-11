import {DUNGEONS} from '../dungeons/dungeonData.js';
import {MONSTER_TYPES} from '../monsters/monsters.js';
const text=(ru,en,es)=>({ru,en,es});
const name=(entry,lang)=>entry.names?.[lang]||entry.name||entry.id;
const place=(point,region)=>({region,x:Math.round(point.x),y:Math.round(point.y),radius:130});
const progressLevel=(c,fraction)=>Math.min(c.maxLevel,Math.round(c.minLevel+(c.maxLevel-c.minLevel)*fraction));
const reward=level=>({xp:Math.round((60+level*level*18)*.68),gold:30+level*12});
export function buildRegionalContracts(contentByRegion){
 const quests=[];
 for(const [region,c]of Object.entries(contentByRegion)){
  const givers=c.npcs.filter(n=>(n.roles||[n.role]).includes('questGiver'));
  const giver=level=>givers.reduce((best,n)=>Math.abs((n.minLevel||1)-level)<Math.abs((best.minLevel||1)-level)?n:best,givers[0]||c.npcs[0]);
  let previous;
  for(let i=0;i<8;i++){
   const requested=progressLevel(c,i/7),camp=[...c.camps].sort((a,b)=>Math.abs(a.level-requested)-Math.abs(b.level-requested)||a.id.localeCompare(b.id)).find(camp=>!quests.some(q=>q.targetCampId===camp.id))||c.camps[i%c.camps.length];
   const level=Math.min(c.maxLevel,Math.max(c.minLevel,requested)),npc=giver(level),kind=MONSTER_TYPES[camp.type],id=region+'_contract_'+(i+1);
   quests.push({id,npcId:npc.id,region,type:'kill',target:camp.type,targetCampId:camp.id,required:4+(i%3),level,requires:previous?[previous]:[],...reward(level),location:place(camp,region),
    title:text('Охрана тропы: '+(i+1),'Trail patrol: '+(i+1),'Patrulla del sendero: '+(i+1)),
    description:text(`Победи ${4+i%3} противников «${name(kind,'ru')}» в лагере ${camp.id}. После охоты вернись к ${name(npc,'ru')}.`,`Defeat ${4+i%3} ${name(kind,'en')} enemies at camp ${camp.id}, then return to ${name(npc,'en')}.`,`Derrota a ${4+i%3} enemigos ${name(kind,'es')} del campamento ${camp.id} y vuelve con ${name(npc,'es')}.`)});previous=id;
  }
  const sites=[...c.towns.map(t=>({...t,targetId:t.id})),...c.portals.map(p=>({...p,targetId:p.id})),...c.camps.slice(3,8).map(p=>({...p,targetId:p.id}))].slice(0,5);
  sites.forEach((site,i)=>{const level=progressLevel(c,i/5),npc=giver(level);quests.push({id:region+'_survey_'+(i+1),npcId:npc.id,region,type:'explore',target:site.targetId,required:1,level,...reward(level),location:place(site,region),
   title:text('Разведка маршрута: '+(i+1),'Route survey: '+(i+1),'Reconocimiento de ruta: '+(i+1)),
   description:text(`Проверь отмеченный участок маршрута ${site.targetId} и вернись с донесением.`,`Visit the marked route location ${site.targetId}, then return with your report.`,`Visita el lugar marcado de la ruta ${site.targetId} y regresa con tu informe.`)});});
  for(let i=0;i<3;i++){
   const level=progressLevel(c,i/3),npc=giver(level),receiver=c.npcs.filter(n=>n.id!==npc.id)[(i*3)%Math.max(1,c.npcs.length-1)];
   quests.push({id:region+'_dispatch_'+(i+1),npcId:npc.id,turnInNpcId:receiver.id,region,type:'talk',target:receiver.id,required:1,level,...reward(level),location:place(receiver,region),
    title:text('Посланник: '+name(receiver,'ru'),'Messenger: '+name(receiver,'en'),'Mensajero: '+name(receiver,'es')),
    description:text(`Передай устное сообщение ${name(receiver,'ru')}. Награду выдаст получатель.`,`Deliver a spoken message to ${name(receiver,'en')}. The recipient pays the reward.`,`Entrega un mensaje oral a ${name(receiver,'es')}. El destinatario entrega la recompensa.`)});
  }
  for(let i=0;i<2;i++){
   const level=progressLevel(c,.2+i*.5),npc=giver(level),itemId=i?'wolfPelt':'wolfFang',quantity=i?4:3,receiver=c.npcs.find(n=>n.id!==npc.id&&(n.roles||[n.role]).includes('storage'))||c.npcs.find(n=>n.id!==npc.id),collectId=region+'_supplies_'+i;
   const item=text(i?'волчьи шкуры':'клыки волка',i?'wolf pelts':'wolf fangs',i?'pieles de lobo':'colmillos de lobo');
   quests.push({id:collectId,npcId:npc.id,region,type:'collect',itemId,required:quantity,level,...reward(level),location:{region:'forest',x:1500,y:1400,radius:160},
    title:text('Снабжение: '+item.ru,'Supplies: '+item.en,'Suministros: '+item.es),description:text(`Собери ${quantity}: ${item.ru}. Их можно добыть у волков Лесной долины. Покажи припасы заказчику.`,`Gather ${quantity} ${item.en} from Forest valley wolves. Show the supplies to the quest giver.`,`Reúne ${quantity} ${item.es} de los lobos del Valle del bosque. Muestra los suministros al solicitante.`)});
   quests.push({id:region+'_delivery_'+i,npcId:npc.id,turnInNpcId:receiver.id,region,type:'deliver',target:receiver.id,itemId,quantity,required:1,level,requires:[collectId],...reward(level),location:place(receiver,region),
    title:text('Доставка: '+name(receiver,'ru'),'Delivery: '+name(receiver,'en'),'Entrega: '+name(receiver,'es')),
    description:text(`Передай ${quantity}: ${item.ru}, получатель ${name(receiver,'ru')}. При сдаче припасы будут изъяты.`,`Deliver ${quantity} ${item.en} to ${name(receiver,'en')}. The supplies are consumed on completion.`,`Entrega ${quantity} ${item.es} a ${name(receiver,'es')}. Los suministros se consumen al completar la misión.`)});
  }
  c.bosses.forEach((boss,i)=>{const level=Math.min(c.maxLevel,Math.max(c.minLevel,boss.level)),npc=giver(level);quests.push({id:region+'_bounty_'+i,npcId:npc.id,region,type:'boss',target:boss.id,required:1,level,...reward(level),xp:reward(level).xp*2,gold:reward(level).gold*3,location:place(boss,region),
   title:text('Награда за голову: '+name(boss,'ru'),'Bounty: '+name(boss,'en'),'Recompensa: '+name(boss,'es')),
   description:text(`Победи ${name(boss,'ru')} в отмеченном месте. Учитывается только этот противник.`,`Defeat ${name(boss,'en')} at the marked location. Only this named enemy counts.`,`Derrota a ${name(boss,'es')} en el lugar marcado. Solo cuenta este enemigo concreto.`)});});
 }
 for(const dungeon of DUNGEONS){
  const content=contentByRegion[dungeon.region];if(!content)continue;
  const npc=content.npcs.filter(n=>(n.roles||[n.role]).includes('questGiver')).sort((a,b)=>Math.abs((a.minLevel||1)-dungeon.level)-Math.abs((b.minLevel||1)-dungeon.level))[0]||content.npcs[0];
  quests.push({id:dungeon.id+'_clearance',npcId:npc.id,region:dungeon.region,type:'dungeon',target:dungeon.id,required:1,level:dungeon.level,...reward(dungeon.level),xp:reward(dungeon.level).xp*2,location:place(dungeon,dungeon.region),
   title:text('Зачистка: '+dungeon.names.ru,'Clearance: '+dungeon.names.en,'Limpieza: '+dungeon.names.es),
   description:text('Пройди «'+dungeon.names.ru+'» на любой сложности: победи всех боссов и вернись за наградой.','Clear '+dungeon.names.en+' on any difficulty: defeat all bosses and return for your reward.','Completa '+dungeon.names.es+' en cualquier dificultad: derrota a todos los jefes y vuelve por tu recompensa.')});
 }
 return quests;
}
