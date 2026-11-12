import {text as message} from '../i18n/messages.js';
import {QUEST_TEXT,QUESTS,questProgress,questTitle,questDescription,questsForNpc,acceptQuest,claimQuest,recordEvent} from '../quests/quests.js';
import {buyPotion,sellItem,materialPrice,equipmentPrice,merchantStock,buyEquipment,commitTrade,POTION_PRICE} from '../systems/trading.js';
import {itemCount,itemName,itemDefinition} from '../equipment/items.js';
import {NPCS} from '../npc/npcData.js';
import {REGIONS} from '../world/worldData.js';
import {NPC_UI_TEXT} from './npcText.js';
const element=(tag,text,className)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;};
const roles=npc=>npc.roles||[npc.role];
// Keep the live hero identity used by combat, but make quest acceptance and
// rewards atomic with their durable save (including level-up side effects).
export function commitQuestChange(hero,operation,persist){
 let before;try{before=JSON.parse(JSON.stringify(hero));}catch{return {ok:false,reason:'storage'};}
 const rollback=()=>{for(const key of Object.keys(hero))if(!Object.hasOwn(before,key))delete hero[key];Object.assign(hero,before);};
 try{
  const changed=operation(),result=typeof changed==='boolean'?{ok:changed}:changed||{ok:false,reason:'state'};
  if(!result.ok){rollback();return result;}
  if(persist()!==false)return result;
 }catch{}
 rollback();return {ok:false,reason:'storage'};
}
export class NpcPanel{
 constructor(scene){
  this.scene=scene;this.opened=false;this.tab='quest';this.npc=null;this.messageUntil=0;
  this.language=scene.language||document.documentElement.lang||'ru';this.text=QUEST_TEXT[this.language]||QUEST_TEXT.ru;this.t=NPC_UI_TEXT[this.language]||NPC_UI_TEXT.ru;
  this.button=element('button','','npc-interact');this.button.hidden=true;this.button.onclick=()=>this.show();
  this.journal=element('div','','quest-tracker');this.journal.hidden=true;this.journal.setAttribute('role','button');this.journal.tabIndex=0;this.journal.setAttribute('aria-label',message('questMap',this.language));this.journal.title=message('questMap',this.language);this.journal.onclick=()=>this.scene.mapPanel?.show();this.journal.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();this.scene.mapPanel?.show();}};
  this.root=element('section','','npc-panel');this.root.hidden=true;this.root.setAttribute('role','dialog');this.root.setAttribute('aria-modal','true');
  document.body.append(this.button,this.journal,this.root);
  this.onKey=e=>{if(e.key==='Escape'&&this.opened)this.close();};document.addEventListener('keydown',this.onKey);
 }
 name(npc){return npc.names?.[this.language]||npc.name||npc.id;}
 residents(){return (this.scene.regionContent?.npcs||NPCS).filter(n=>(!n.region||n.region===(this.scene.hero.region||'forest'))&&Math.hypot(this.scene.hero.x-n.x,this.scene.hero.y-n.y)<=150).sort((a,b)=>Math.hypot(this.scene.hero.x-a.x,this.scene.hero.y-a.y)-Math.hypot(this.scene.hero.x-b.x,this.scene.hero.y-b.y));}
 nearest(){const list=this.residents();const starter=questProgress(this.scene.hero);return starter.state!=='claimed'&&list.some(n=>n.id==='mira')?list.find(n=>n.id==='mira'):list[0];}
 nearby(){return !!this.nearest()&&this.scene.hero.hp>0;}
 update(){
  if(this.messageUntil&&Date.now()>=this.messageUntil){this.messageUntil=0;this.root.querySelectorAll('.npc-status').forEach(node=>node.remove());}
  const blocked=['storagePanel','inventoryPanel','characterPanel','skillsPanel','savePanel','mapPanel','dungeonPanel','travelPanel'].some(key=>this.scene[key]?.opened);
  const npc=this.nearest();this.button.hidden=this.opened||blocked||!npc||this.scene.hero.hp<=0;
  if(npc)this.button.textContent=npc.id==='mira'?this.text.talk:this.t.talk+': '+this.name(npc);
  if(this.opened&&!this.residents().some(n=>n.id===this.npc?.id))this.close();
  const active=QUESTS.filter(q=>['active','completed'].includes(questProgress(this.scene.hero,q.id).state));
  this.journal.hidden=blocked||this.opened||!active.length;
  this.journal.textContent=active.slice(0,3).map(q=>{const p=questProgress(this.scene.hero,q.id);return `${questTitle(q,this.language)}: ${p.progress}/${p.required}`;}).join(' · ');
 }
 show(npc=this.nearest()){
  if(!npc||this.scene.hero.hp<=0)return;this.scene.savePanel?.close();this.scene.storagePanel?.close();this.scene.mapPanel?.close();this.scene.dungeonPanel?.close();this.scene.controls?.reset?.();
  this.scene.inventoryPanel?.close();this.scene.characterPanel?.close();this.scene.skillsPanel?.close();this.npc=npc;this.tab='quest';this.opened=true;this.button.hidden=true;this.journal.hidden=true;this.root.hidden=false;
  if(recordEvent(this.scene.hero,'talk',{npcId:npc.id,region:this.scene.hero.region}))this.scene.save();this.render();
 }
 close(){this.opened=false;this.root.hidden=true;}
 action(label,fn){const button=element('button',label);button.type='button';button.onclick=fn;return button;}
 render(message=''){
  if(!this.npc)return;const t=this.t,npc=this.npc;this.root.replaceChildren();this.root.setAttribute('aria-label',this.name(npc));
  const heading=element('div','','npc-heading');heading.append(element('h2',this.name(npc)),this.action(t.close,()=>this.close()));this.root.append(heading);
  const residents=this.residents();if(residents.length>1){const label=element('label',t.nearby,'npc-selector'),select=element('select');for(const resident of residents){const option=element('option',this.name(resident));option.value=resident.id;select.append(option);}select.value=npc.id;select.onchange=()=>this.show(residents.find(n=>n.id===select.value));label.append(select);this.root.append(label);}
  const tabs=element('div','','npc-tabs'),available=[['quest',this.text.questsTab],...(roles(npc).some(role=>['merchant','specialMerchant'].includes(role))?[['shop',this.text.shopTab]]:[]),['info',t.info]];
  for(const [id,label]of available){const button=this.action(label,()=>{this.tab=id;this.render();});button.setAttribute('aria-pressed',String(this.tab===id));tabs.append(button);}this.root.append(tabs);
  if(roles(npc).includes('storage'))this.root.append(this.action(t.storage,()=>{this.close();this.scene.storagePanel?.show(npc);}));
  if(this.tab==='shop')this.renderShop(message);else if(this.tab==='info')this.renderInfo();else this.renderQuests(message);
 }
 renderQuests(message=''){
  const h=this.scene.hero,t=this.t,npc=this.npc,quests=questsForNpc(h,npc.id);
  if(!quests.length){this.root.append(element('p',t.empty));this.renderInfo();return;}
  for(const quest of quests){
   const p=questProgress(h,quest.id),card=element('article','','npc-quest');card.dataset.questId=quest.id;
   card.append(element('h3',questTitle(quest,this.language)),element('p',questDescription(quest,this.language)),element('p',`${t.level}: ${quest.level||1} · ${p.progress}/${p.required}`));
   if(quest.location){const region=REGIONS[quest.location.region];card.append(element('p',`${t.target}: ${region?.names?.[this.language]||quest.location.region} · X ${Math.round(quest.location.x)} / Y ${Math.round(quest.location.y)}`,'npc-target'));}
   const reward=[`${quest.xp||0} ${t.xp}`,`${quest.gold||0} ${t.gold}`];if(quest.reward)reward.push(`${itemName(quest.reward,this.language)} ×${quest.reward.quantity||1}`);card.append(element('p',t.reward+': '+reward.join(' · ')));
   if(p.state==='available'&&quest.npcId===npc.id){const button=this.action(this.text.accept,()=>{const result=commitQuestChange(h,()=>acceptQuest(h,quest.id,npc.id),()=>this.scene.save());if(result.ok)this.render();else this.render(result.reason==='storage'?t.storageFailure:t.invalid);});if(quest.id!=='forestWolves')button.setAttribute('aria-label',this.text.accept+': '+questTitle(quest,this.language));card.append(button);}
   else if(p.state==='completed'&&(quest.turnInNpcId||quest.npcId)===npc.id){const button=this.action(this.text.claim,()=>{const result=commitQuestChange(h,()=>claimQuest(h,quest.id,npc.id),()=>this.scene.save());this.scene.refreshHud();if(result.ok)this.render();else this.render(result.reason==='storage'?t.storageFailure:t.full);});if(quest.id!=='forestWolves')button.setAttribute('aria-label',this.text.claim+': '+questTitle(quest,this.language));card.append(button);}
   else{card.append(element('p',t[p.state]||t.active));if(p.state==='locked'&&quest.requires?.length)card.append(element('p',t.requires+': '+quest.requires.map(id=>questTitle(QUESTS.find(q=>q.id===id)||{id},this.language)).join(', ')));if(['active','completed'].includes(p.state)){const target=NPCS.find(n=>n.id===(quest.turnInNpcId||quest.npcId));if(target)card.append(element('p',`${t.returnTo}: ${this.name(target)} · X ${target.x} / Y ${target.y}`));}}
   this.root.append(card);
  }
  if(message)this.root.append(element('p',message,'npc-status'));
 }
 renderInfo(){
  const content=this.scene.regionContent,t=this.t,npc=this.npc,region=REGIONS[npc.region];
  this.root.append(element('p',`${t.region}: ${region?.names?.[this.language]||npc.region} · X ${npc.x} / Y ${npc.y}`));
  this.root.append(element('p',roles(npc).map(role=>t[role==='storage'?'storageRole':role]||role).join(' · ')));
  if(content?.towns?.length){this.root.append(element('h3',t.roads));for(const town of content.towns)this.root.append(element('p',`${town.names?.[this.language]||town.name}: X ${town.x??town.spawn.x} / Y ${town.y??town.spawn.y}`));}
  if(content?.portals?.length){this.root.append(element('h3',t.portals));for(const portal of content.portals)this.root.append(element('p',`${REGIONS[portal.toRegion]?.names?.[this.language]||portal.toRegion}: X ${portal.x} / Y ${portal.y}`));}
 }
 renderShop(message=''){
  const h=this.scene.hero,t=this.text,u=this.t;this.root.append(element('h3',`${t.gold}: ${h.gold||0}`));
  for(const resource of ['hp','mp']){const row=element('div','','npc-shop-row');row.append(element('span',`${resource==='hp'?t.hpPotion:t.mpPotion} ×${h.potions?.[resource]||0} · ${POTION_PRICE} ${t.gold}`));const buy=this.action(t.buy,()=>{const result=commitTrade(h,()=>buyPotion(h,resource),()=>this.scene.save());if(result.ok)this.persistTrade(u.bought);else this.render(result.reason==='storage'?u.storageFailure:result.reason==='funds'?u.funds:u.limit);});buy.disabled=(h.gold||0)<POTION_PRICE||(h.potions?.[resource]||0)>=99;row.append(buy);this.root.append(row);}
  h.inventory.forEach((item,index)=>{const price=itemDefinition(item)?.slot?Math.max(1,Math.floor(equipmentPrice(item)*.25)):materialPrice(item);if(!price)return;const quantity=itemCount(item),row=element('div','','npc-shop-row');row.append(element('span',`${itemName(item,this.language)} · ${t[item.rarity||'common']||t.common} ×${quantity} · ${price} ${t.each}`));const sell=this.action(`${t.sell} ×${quantity} (+${price*quantity})`,()=>{const result=commitTrade(h,()=>sellItem(h,index,quantity),()=>this.scene.save());if(result.ok)this.persistTrade(u.sold);else this.render(result.reason==='storage'?u.storageFailure:u.invalid);});row.append(sell);this.root.append(row);});
  this.root.append(element('p',u.equipped),element('h3',u.goods));
  for(const offer of merchantStock(h,this.npc)){
   const row=element('div','','npc-shop-row'),definition=itemDefinition(offer);row.append(element('span',`${itemName(offer,this.language)} · ${t[offer.rarity]} · ${u.level} ${definition.level} · ${offer.price} ${t.gold}`));
   const button=this.action(t.buy,()=>{const result=commitTrade(h,()=>buyEquipment(h,this.npc,offer.offerId),()=>this.scene.save());if(result.ok)this.persistTrade(u.bought);else this.render(result.reason==='storage'?u.storageFailure:u[result.reason]||u.invalid);});button.setAttribute('aria-label',t.buy+': '+itemName(offer,this.language)+' · '+t[offer.rarity]);button.disabled=(h.gold||0)<offer.price||(h.level||1)<(this.npc.minLevel||1);row.append(button);this.root.append(row);
  }
  if(message)this.root.append(element('p',message,'npc-status'));
 }
 persistTrade(message){this.scene.refreshHud();this.scene.refreshPotions?.();this.scene.notify?.(message);this.messageUntil=Date.now()+3000;this.render(message);}
 destroy(){document.removeEventListener('keydown',this.onKey);this.button.remove();this.journal.remove();this.root.remove();this.opened=false;}
}
