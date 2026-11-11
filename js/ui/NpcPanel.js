import {QUEST_TEXT,questProgress,acceptQuest,claimQuest} from '../quests/quests.js';
import {buyPotion,sellMaterial,materialPrice,POTION_PRICE} from '../systems/trading.js';
import {itemCount,itemName} from '../equipment/items.js';
const element=(tag,text,className)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(className)e.className=className;return e;};
export class NpcPanel{
 constructor(scene){
  this.scene=scene;this.opened=false;this.tab='quest';this.text=QUEST_TEXT[scene.language||document.documentElement.lang]||QUEST_TEXT.ru;
  this.button=element('button',this.text.talk,'npc-interact');this.button.hidden=true;this.button.onclick=()=>this.show();
  this.journal=element('div','','quest-tracker');this.journal.hidden=true;
  this.root=element('section','','npc-panel');this.root.hidden=true;this.root.setAttribute('role','dialog');this.root.setAttribute('aria-modal','true');this.root.setAttribute('aria-label',this.text.name);
  document.body.append(this.button,this.journal,this.root);
 }
 nearby(){const h=this.scene.hero;return h&&h.hp>0&&(!h.region||h.region==='forest')&&Math.hypot(h.x-935,h.y-1080)<150;}
 update(){
  const blocked=this.scene.inventoryPanel?.opened||this.scene.characterPanel?.opened||this.scene.skillsPanel?.opened;
  this.button.hidden=this.opened||blocked||!this.nearby();
  const p=questProgress(this.scene.hero);this.journal.hidden=blocked||this.opened||!['active','completed'].includes(p.state);
  this.journal.textContent=`${this.text.journal}: ${p.progress}/${p.required}`;
 }
 show(){if(!this.nearby())return;this.scene.inventoryPanel?.close();this.scene.characterPanel?.close();this.scene.skillsPanel?.close();this.opened=true;this.button.hidden=true;this.journal.hidden=true;this.root.hidden=false;this.render();}
 close(){this.opened=false;this.root.hidden=true;}
 render(message=''){
  const t=this.text,p=questProgress(this.scene.hero);this.root.replaceChildren();const heading=element('div','','npc-heading');heading.append(element('h2',t.name));
  const close=element('button',t.close);close.onclick=()=>this.close();heading.append(close);this.root.append(heading);
  const tabs=element('div','','npc-tabs');for(const [id,label] of [['quest',t.questsTab],['shop',t.shopTab]]){const tab=element('button',label);tab.setAttribute('aria-pressed',String(this.tab===id));tab.onclick=()=>{this.tab=id;this.render();};tabs.append(tab);}this.root.append(tabs);
  if(this.tab==='shop'){this.renderShop(message);return;}
  this.root.append(element('h3',t.title),element('p',t.body),element('p',`${t.progress}: ${p.progress}/${p.required}`),element('p',t.reward));
  if(p.state==='available'){const accept=element('button',t.accept,'npc-action');accept.onclick=()=>{if(acceptQuest(this.scene.hero)){this.scene.save();this.render();}};this.root.append(accept);}
  else if(p.state==='completed'){const claim=element('button',t.claim,'npc-action');claim.onclick=()=>{const result=claimQuest(this.scene.hero);if(result.ok){this.scene.save();this.scene.refreshHud();this.render();}else this.render(t.full);};this.root.append(claim);}
  else this.root.append(element('p',p.state==='claimed'?t.claimed:t.active));
  if(message){const status=element('p',message,'npc-status');status.setAttribute('role','status');this.root.append(status);}
 }
 renderShop(message=''){
  const h=this.scene.hero,t=this.text;this.root.append(element('h3',`${t.gold}: ${h.gold||0}`));
  for(const resource of ['hp','mp']){const row=element('div','','npc-shop-row');row.append(element('span',`${resource==='hp'?t.hpPotion:t.mpPotion} ×${h.potions?.[resource]||0} · ${POTION_PRICE} ${t.gold}`));const buy=element('button',t.buy);buy.disabled=(h.gold||0)<POTION_PRICE||(h.potions?.[resource]||0)>=99;buy.onclick=()=>{const result=buyPotion(h,resource);if(result.ok)this.persistTrade();else this.render(result.reason==='funds'?t.funds:t.limit);};row.append(buy);this.root.append(row);}
  let any=false;h.inventory.forEach((item,index)=>{const price=materialPrice(item);if(!price)return;any=true;const quantity=itemCount(item),row=element('div','','npc-shop-row');row.append(element('span',`${t[item.id]||itemName(item)} · ${t[item.rarity||'common']||t.common} ×${quantity} · ${price} ${t.each}`));const sell=element('button',`${t.sell} ×${quantity} (+${price*quantity})`);sell.onclick=()=>{if(sellMaterial(h,index,quantity).ok)this.persistTrade();};row.append(sell);this.root.append(row);});
  if(!any)this.root.append(element('p',t.emptyShop));if(message)this.root.append(element('p',message,'npc-status'));
 }
 persistTrade(){this.scene.save();this.scene.refreshHud();this.scene.refreshPotions?.();this.render();}
 destroy(){this.button.remove();this.journal.remove();this.root.remove();this.opened=false;}
}
