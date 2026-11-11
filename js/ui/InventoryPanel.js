import {derivedAttributes} from '../systems/attributes.js';
import {itemIcon} from './itemIcons.js';
import {EQUIPMENT_SLOTS} from '../equipment/armor.js';
import {INVENTORY_CAPACITY,itemName,itemDefinition,equipItem,unequipItem,equipmentStats,itemCount} from '../equipment/items.js';
const SLOT_NAMES={weapon:'Оружие',helmet:'Шлем',chest:'Броня',gloves:'Перчатки',pants:'Штаны',boots:'Обувь',ring:'Кольцо',amulet:'Амулет',shield:'Щит'};
const RARITY_NAMES={common:'Обычный',uncommon:'Необычный',rare:'Редкий',epic:'Эпический',legendary:'Легендарный'};
const RARITY_COLORS={common:'#ded9c8',uncommon:'#6ed68b',rare:'#75b8ff',epic:'#d89aff',legendary:'#ffce62'};
const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
const btn=(text,fn,cls)=>{const b=el('button',text,cls);b.type='button';b.onclick=fn;return b;};
const art=item=>{const node=el('span',undefined,'item-art-wrap');node.innerHTML=itemIcon(item,itemDefinition(item));return node;};
export class InventoryPanel{
 constructor(scene){
  this.scene=scene;this.root=document.getElementById('inventory-panel');this.button=document.getElementById('inventory-btn');
  this.opened=false;this.page='equipment';this.selected=null;this.anchor=null;
  this.onButton=()=>this.toggle();this.button?.addEventListener('click',this.onButton);
  this.onEscape=e=>{if(e.key==='Escape'&&this.opened)this.close();};
  this.onResize=()=>this.positionDetail();
  document.addEventListener('keydown',this.onEscape);window.addEventListener('resize',this.onResize);
 }
 toggle(){this.opened?this.close():this.show();}
 show(){this.scene.storagePanel?.close();this.scene.npcPanel?.close();this.scene.controls?.reset?.();this.scene.skillsPanel?.close();this.scene.characterPanel?.close();this.opened=true;this.root.hidden=false;this.page='equipment';this.selected=null;this.render();}
 close(){this.opened=false;this.selected=null;this.anchor=null;this.root.hidden=true;}
 changePage(page){if(this.page===page)return;this.page=page;this.selected=null;this.anchor=null;this.render();}
 select(source,key,button){
  this.selected={source,key};this.anchor=button;this.renderDetail();
 }
 item(){const h=this.scene.hero;return this.selected?.source==='bag'?h.inventory[this.selected.key]:this.selected?.source==='equip'?h.equipment[this.selected.key]:null;}
 positionDetail(){
  const box=this.root.querySelector('.item-detail');if(!box||!this.anchor?.isConnected)return;
  const rect=this.anchor.getBoundingClientRect();
  const width=Math.min(300,Math.max(220,window.innerWidth-20));
  box.style.width=width+'px';
  const measured=box.getBoundingClientRect(),height=measured.height;
  const left=rect.right+width+10<=window.innerWidth-8?rect.right+8:rect.left-width-8>=8?rect.left-width-8:Math.max(8,Math.min(rect.left,window.innerWidth-width-8));
  const top=Math.max(8,Math.min(rect.top,Math.max(8,window.innerHeight-height-8)));
  box.style.left=left+'px';box.style.top=top+'px';
 }
 renderDetail(){
  this.root.querySelector('.item-detail')?.remove();
  const item=this.item();if(!item||!this.anchor?.isConnected)return;
  const def=itemDefinition(item);if(!def)return;
  const box=el('section',undefined,'item-detail');box.setAttribute('role','dialog');box.setAttribute('aria-label','Сведения о предмете');this.root.append(box);
  box.append(el('div',this.selected.source==='equip'?'ЭКИПИРОВАНО':'В РЮКЗАКЕ','detail-status'));
  const head=el('div',undefined,'detail-heading');head.append(art(item),el('h3',itemName(item)));box.append(head);
  const rarity=el('p',RARITY_NAMES[item.rarity]||RARITY_NAMES.common);rarity.style.color=RARITY_COLORS[item.rarity]||'#fff';box.append(rarity);
  const props=[['Тип',def.slot?SLOT_NAMES[def.slot]:'Материал'],['Требуемый уровень',String(def.level||1)]];
  if(!def.slot)props.push(['Количество',itemCount(item)+' / 100']);
  const multiplier={common:1,uncommon:1.12,rare:1.28,epic:1.5,legendary:1.85}[item.rarity]||1;
  if(def.attack)props.push(['Атака','+'+Math.round(def.attack*multiplier)]);
  if(def.defense)props.push(['Защита','+'+Math.round(def.defense*multiplier)]);
  if(def.allowedClasses)props.push(['Классы',def.allowedClasses.join(', ')]);
  for(const [k,v] of props)box.append(el('p',k+': '+v));
  if(this.selected.source==='bag'&&def.slot){const equipped=this.scene.hero.equipment?.[def.slot];const comparison=el('section',undefined,'item-comparison');comparison.append(el('h4','Сравнение · '+SLOT_NAMES[def.slot]));if(equipped){comparison.append(el('div','ЭКИПИРОВАНО','detail-status'));const row=el('div',undefined,'detail-heading');row.append(art(equipped),el('strong',itemName(equipped)));comparison.append(row);const old=itemDefinition(equipped),oldMult={common:1,uncommon:1.12,rare:1.28,epic:1.5,legendary:1.85}[equipped.rarity]||1;for(const [label,key] of [['Атака','attack'],['Защита','defense']]){const oldVal=Math.round((old?.[key]||0)*oldMult),newVal=Math.round((def[key]||0)*multiplier);if(oldVal||newVal){const diff=newVal-oldVal;const line=el('p',label+': '+oldVal+' → '+newVal+' ('+(diff>0?'+':'')+diff+')');line.className=diff>0?'compare-better':diff<0?'compare-worse':'compare-equal';comparison.append(line);}}}else comparison.append(el('p','Ничего не экипировано в этот слот'));box.append(comparison);}
  const actions=el('div',undefined,'item-actions');box.append(actions);
  const h=this.scene.hero;
  if(this.selected.source==='bag'&&def.slot)actions.append(btn('Надеть',()=>{const result=equipItem(h,this.selected.key);if(!result.ok){this.notice({level:'Недостаточный уровень',class:'Не подходит классу'}[result.reason]||'Нельзя надеть');return;}this.selected=null;this.anchor=null;this.scene.save();this.render();},'primary'));
  if(this.selected.source==='equip')actions.append(btn('Снять',()=>{if(!unequipItem(h,this.selected.key)){this.notice('Сумка заполнена');return;}this.selected=null;this.anchor=null;this.scene.save();this.render();},'primary'));
  if(this.selected.source==='bag')actions.append(btn('Выкинуть',()=>this.confirmDiscard(),'danger'));
  actions.append(btn('Закрыть',()=>{this.selected=null;this.anchor=null;box.remove();}));
  this.positionDetail();
 }
 confirmDiscard(){
  const item=this.item(),index=this.selected?.key;if(!item)return;
  const box=this.root.querySelector('.item-detail');if(!box)return;
  box.replaceChildren(el('h3','Выкинуть «'+itemName(item)+'»?'),el('p','Предмет исчезнет без возможности вернуть его.'));
  const actions=el('div',undefined,'item-actions');box.append(actions);
  actions.append(btn('Да, выкинуть',()=>{if(this.scene.hero.inventory[index]!==item){this.selected=null;this.render();return;}this.scene.hero.inventory.splice(index,1);this.selected=null;this.anchor=null;this.scene.save();this.render();},'danger'));
  actions.append(btn('Отмена',()=>this.renderDetail()));
  this.positionDetail();
 }
 notice(message){const e=this.root.querySelector('.inventory-message');if(e)e.textContent=message;}
 render(){
  const h=this.scene.hero,r=this.root;r.replaceChildren();
  const header=el('header',undefined,'inventory-heading');header.append(el('strong','AURALIS · Персонаж и сумка'),btn('✕',()=>this.close()));r.append(header);
  const tabs=el('nav',undefined,'inventory-tabs');
  for(const [page,label] of [['equipment','I · Снаряжение и характеристики'],['bag','II · Рюкзак']]){
   const tab=btn(label,()=>this.changePage(page),this.page===page?'active':'');tab.setAttribute('aria-pressed',String(this.page===page));tabs.append(tab);
  }
  r.append(tabs);
  const content=el('main',undefined,'inventory-page');r.append(content);
  if(this.page==='equipment'){
   const stats=equipmentStats(h),derived=derivedAttributes(h);content.append(el('h2',(h.name||'Герой')+' · Уровень '+h.level));
   const columns=el('div',undefined,'equipment-layout');content.append(columns);
   const grid=el('div',undefined,'equipment-grid');columns.append(grid);
   for(const slot of EQUIPMENT_SLOTS){const item=h.equipment[slot];const b=btn('',()=>{if(item)this.select('equip',slot,b);},'equipment-cell');b.setAttribute('aria-label',SLOT_NAMES[slot]+': '+(item?itemName(item):'пусто'));b.append(item?art(item):el('span','+','empty-slot-icon'));b.append(el('small',SLOT_NAMES[slot]));if(item)b.style.borderColor=RARITY_COLORS[item.rarity]||'#fff';grid.append(b);}
   const summary=el('aside',undefined,'equipment-summary');summary.append(el('h3','Характеристики персонажа'));
   for(const [k,v] of [['Физическая атака',derived.physicalAttack+stats.attack],['Магическая атака',derived.magicAttack+stats.attack],['Защита',derived.defense+stats.defense],['Шанс критического удара',derived.criticalChance+'%'],['Двойной удар',derived.doubleHitChance+'%'],['Скорость атаки','+'+Math.round(derived.attackSpeedBonus*100)+'%'],['Бонус добычи',derived.lootBonus+'%']]){const row=el('div',undefined,'stat-line');row.append(el('span',k),el('strong',String(v)));summary.append(row);}columns.append(summary);
  }else{
   content.append(el('h2','Рюкзак · '+h.inventory.length+' / '+INVENTORY_CAPACITY+' ячеек'));
   const grid=el('div',undefined,'inventory-grid');content.append(grid);
   for(let i=0;i<INVENTORY_CAPACITY;i++){const item=h.inventory[i];const b=btn('',()=>{if(item)this.select('bag',i,b);},'inventory-cell'+(item?' occupied':''));b.setAttribute('aria-label',item?itemName(item):'Пустая ячейка '+(i+1));if(item){b.append(art(item));if(!itemDefinition(item)?.slot&&itemCount(item)>1)b.append(el('span',String(itemCount(item)),'stack-count'));b.title=itemName(item);b.style.borderColor=RARITY_COLORS[item.rarity]||'#fff';}else b.append(el('span',undefined,'empty-cell'));grid.append(b);}
  }
  r.append(el('p',undefined,'inventory-message'));
 }
 destroy(){this.button?.removeEventListener('click',this.onButton);document.removeEventListener('keydown',this.onEscape);window.removeEventListener('resize',this.onResize);this.close();}
}
