import {className} from '../characters/classes.js';
import {uiText,uiLanguage} from '../i18n/uiText.js';
import {derivedAttributes} from '../systems/attributes.js';
import {itemArt,itemSaleText} from './itemPresentation.js';
import {EQUIPMENT_SLOTS} from '../equipment/armor.js';
import {INVENTORY_CAPACITY,itemName,itemDefinition,equipItem,unequipItem,equipmentStats,itemCount} from '../equipment/items.js';
const SLOT_NAMES={weapon:'Оружие',helmet:'Шлем',chest:'Броня',gloves:'Перчатки',pants:'Штаны',boots:'Обувь',ring:'Кольцо',amulet:'Амулет',shield:'Щит'};
const RARITY_NAMES={common:'Обычный',uncommon:'Необычный',rare:'Редкий',epic:'Эпический',legendary:'Легендарный'};
const RARITY_COLORS={common:'#ded9c8',uncommon:'#6ed68b',rare:'#75b8ff',epic:'#d89aff',legendary:'#ffce62'};
const SORT_MODES=['type','rarity','level'];
const rarityRank={common:0,uncommon:1,rare:2,epic:3,legendary:4};
// Return the same item objects in a stable order; sorting never merges stacks.
export function sortedInventory(items,mode='type',language='ru'){
 if(!SORT_MODES.includes(mode))return [...items];
 const slot=item=>{const i=EQUIPMENT_SLOTS.indexOf(itemDefinition(item)?.slot);return i<0?EQUIPMENT_SLOTS.length:i;};
 const rarity=item=>rarityRank[item.rarity]??0,level=item=>itemDefinition(item)?.level||1;
 return items.map((item,index)=>({item,index})).sort((a,b)=>{
  const x=a.item,y=b.item,type=slot(x)-slot(y),rare=rarity(y)-rarity(x),tier=level(y)-level(x);
  return (mode==='rarity'?rare||type||tier:mode==='level'?tier||type||rare:type||rare||tier)||itemName(x,language).localeCompare(itemName(y,language),language)||a.index-b.index;
 }).map(entry=>entry.item);
}
const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
const btn=(text,fn,cls)=>{const b=el('button',text,cls);b.type='button';b.onclick=fn;return b;};
const art=item=>itemArt(item);
export class InventoryPanel{
 constructor(scene){
  this.scene=scene;this.root=document.getElementById('inventory-panel');this.button=document.getElementById('inventory-btn');
  this.opened=false;this.page='equipment';this.selected=null;this.anchor=null;
  this.onButton=()=>this.toggle();this.button?.addEventListener('click',this.onButton);
  this.onEscape=e=>{if(e.key==='Escape'&&this.opened)this.close();};
  this.onResize=()=>this.positionDetail();
  document.addEventListener('keydown',this.onEscape);window.addEventListener('resize',this.onResize);
 }
 get language(){return uiLanguage(this.scene);}
 t(key){return uiText(key,this.language);}
 toggle(){this.opened?this.close():this.show();}
 show(){this.scene.closePanels?.(this);this.scene.mapPanel?.close();this.scene.dungeonPanel?.close();this.scene.travelPanel?.close();this.scene.savePanel?.close();this.scene.storagePanel?.close();this.scene.npcPanel?.close();this.scene.controls?.reset?.();this.scene.skillsPanel?.close();this.scene.characterPanel?.close();this.opened=true;this.root.hidden=false;this.page='equipment';this.selected=null;this.render();}
 close(){this.opened=false;this.selected=null;this.anchor=null;this.root.hidden=true;}
 sort(mode){
  const h=this.scene.hero,before=h.inventory;h.inventory=sortedInventory(before,mode,this.language);let saved=false;
  try{saved=this.scene.save()!==false;}catch{}
  if(!saved)h.inventory=before;this.selected=null;this.anchor=null;this.render();if(!saved)this.notice(this.t('Save failed'));return saved;
 }
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
  const box=el('section',undefined,'item-detail');box.setAttribute('role','dialog');box.setAttribute('aria-label',this.t('Сведения о предмете'));this.root.append(box);
  box.append(el('div',this.selected.source==='equip'?this.t('ЭКИПИРОВАНО'):this.t('В РЮКЗАКЕ'),'detail-status'));
  const head=el('div',undefined,'detail-heading');head.append(art(item),el('h3',itemName(item,this.language)));box.append(head);
  const rarity=el('p',this.t(RARITY_NAMES[item.rarity]||RARITY_NAMES.common));rarity.style.color=RARITY_COLORS[item.rarity]||'#fff';box.append(rarity);
  box.append(el('p',itemSaleText(item,this.language),'item-sale-value'));
  const props=[[this.t('Тип'),def.slot?this.t(SLOT_NAMES[def.slot]):this.t('Материал')],[this.t('Требуемый уровень'),String(def.level||1)]];
  if(!def.slot)props.push([this.t('Количество'),itemCount(item)+' / 100']);
  const multiplier={common:1,uncommon:1.12,rare:1.28,epic:1.5,legendary:1.85}[item.rarity]||1;
  if(def.attack)props.push([this.t('Атака'),'+'+Math.round(def.attack*multiplier)]);
  if(def.defense)props.push([this.t('Защита'),'+'+Math.round(def.defense*multiplier)]);
  if(def.allowedClasses)props.push([this.t('Классы'),def.allowedClasses.map(id=>className(id,this.language)).join(', ')]);
  for(const [k,v] of props)box.append(el('p',k+': '+v));
  if(this.selected.source==='bag'&&def.slot){const equipped=this.scene.hero.equipment?.[def.slot];const comparison=el('section',undefined,'item-comparison');comparison.append(el('h4',this.t('Сравнение · ')+this.t(SLOT_NAMES[def.slot])));if(equipped){comparison.append(el('div',this.t('ЭКИПИРОВАНО'),'detail-status'));const row=el('div',undefined,'detail-heading');row.append(art(equipped),el('strong',itemName(equipped,this.language)));comparison.append(row);const old=itemDefinition(equipped),oldMult={common:1,uncommon:1.12,rare:1.28,epic:1.5,legendary:1.85}[equipped.rarity]||1;for(const [label,key] of [[this.t('Атака'),'attack'],[this.t('Защита'),'defense']]){const oldVal=Math.round((old?.[key]||0)*oldMult),newVal=Math.round((def[key]||0)*multiplier);if(oldVal||newVal){const diff=newVal-oldVal;const line=el('p',label+': '+oldVal+' → '+newVal+' ('+(diff>0?'+':'')+diff+')');line.className=diff>0?'compare-better':diff<0?'compare-worse':'compare-equal';comparison.append(line);}}}else comparison.append(el('p',this.t('Ничего не экипировано в этот слот')));box.append(comparison);}
  const actions=el('div',undefined,'item-actions');box.append(actions);
  const h=this.scene.hero;
  if(this.selected.source==='bag'&&def.slot)actions.append(btn(this.t('Надеть'),()=>{const result=equipItem(h,this.selected.key);if(!result.ok){this.notice({level:this.t('Недостаточный уровень'),class:this.t('Не подходит классу')}[result.reason]||this.t('Нельзя надеть'));return;}this.selected=null;this.anchor=null;this.scene.save();this.render();},'primary'));
  if(this.selected.source==='equip')actions.append(btn(this.t('Снять'),()=>{if(!unequipItem(h,this.selected.key)){this.notice(this.t('Сумка заполнена'));return;}this.selected=null;this.anchor=null;this.scene.save();this.render();},'primary'));
  if(this.selected.source==='bag')actions.append(btn(this.t('Выкинуть'),()=>this.confirmDiscard(),'danger'));
  actions.append(btn(this.t('Закрыть'),()=>{this.selected=null;this.anchor=null;box.remove();}));
  this.wrapDetailContent(box,actions);this.positionDetail();
 }
 wrapDetailContent(box,actions){const body=el('div',undefined,'item-detail-body');for(const child of [...box.childNodes])if(child!==actions)body.append(child);box.replaceChildren(body,actions);}
 confirmDiscard(){
  const item=this.item(),index=this.selected?.key;if(!item)return;
  const box=this.root.querySelector('.item-detail');if(!box)return;
  box.replaceChildren(el('h3',this.t('Выкинуть «')+itemName(item,this.language)+this.t('»?')),el('p',this.t('Предмет исчезнет без возможности вернуть его.')));
  const actions=el('div',undefined,'item-actions');box.append(actions);
  actions.append(btn(this.t('Да, выкинуть'),()=>{if(this.scene.hero.inventory[index]!==item){this.selected=null;this.render();return;}this.scene.hero.inventory.splice(index,1);this.selected=null;this.anchor=null;this.scene.save();this.render();},'danger'));
  actions.append(btn(this.t('Отмена'),()=>this.renderDetail()));
  this.wrapDetailContent(box,actions);this.positionDetail();
 }
 notice(message){const e=this.root.querySelector('.inventory-message');if(e)e.textContent=message;}
 render(){
  const h=this.scene.hero,r=this.root;r.replaceChildren();
  const header=el('header',undefined,'inventory-heading');header.append(el('strong',this.t('AURALIS · Персонаж и сумка')),btn('✕',()=>this.close()));r.append(header);
  const tabs=el('nav',undefined,'inventory-tabs');
  for(const [page,label] of [['equipment',this.t('I · Снаряжение и характеристики')],['bag',this.t('II · Рюкзак')]]){
   const tab=btn(label,()=>this.changePage(page),this.page===page?'active':'');tab.setAttribute('aria-pressed',String(this.page===page));tabs.append(tab);
  }
  r.append(tabs);
  const content=el('main',undefined,'inventory-page');r.append(content);
  if(this.page==='equipment'){
   const stats=equipmentStats(h),derived=derivedAttributes(h);content.append(el('h2',(h.name||this.t('Герой'))+this.t(' · Уровень ')+h.level));
   const columns=el('div',undefined,'equipment-layout');content.append(columns);
   const grid=el('div',undefined,'equipment-grid');columns.append(grid);
   for(const slot of EQUIPMENT_SLOTS){const item=h.equipment[slot];const b=btn('',()=>{if(item)this.select('equip',slot,b);},'equipment-cell');b.setAttribute('aria-label',this.t(SLOT_NAMES[slot])+': '+(item?itemName(item,this.language):this.t('пусто')));b.append(item?art(item):el('span','+','empty-slot-icon'));b.append(el('small',this.t(SLOT_NAMES[slot])));if(item)b.style.borderColor=RARITY_COLORS[item.rarity]||'#fff';grid.append(b);}
   const summary=el('aside',undefined,'equipment-summary');summary.append(el('h3',this.t('Характеристики персонажа')));
   for(const [k,v] of [[this.t('Физическая атака'),derived.physicalAttack+stats.attack],[this.t('Магическая атака'),derived.magicAttack+stats.attack],[this.t('Защита'),derived.defense+stats.defense],[this.t('Шанс критического удара'),derived.criticalChance+'%'],[this.t('Двойной удар'),derived.doubleHitChance+'%'],[this.t('Скорость атаки'),'+'+Math.round(derived.attackSpeedBonus*100)+'%'],[this.t('Бонус добычи'),derived.lootBonus+'%']]){const row=el('div',undefined,'stat-line');row.append(el('span',k),el('strong',String(v)));summary.append(row);}columns.append(summary);
  }else{
   content.append(el('h2',this.t('Рюкзак · ')+h.inventory.length+' / '+INVENTORY_CAPACITY+this.t(' ячеек')));
   const sorting=el('nav',undefined,'inventory-tabs');sorting.setAttribute('aria-label',this.t('Сортировка'));
   for(const [mode,label]of [['type','По типу'],['rarity','По редкости'],['level','По уровню']])sorting.append(btn(this.t(label),()=>this.sort(mode)));content.append(sorting);
   const grid=el('div',undefined,'inventory-grid');content.append(grid);
   for(let i=0;i<INVENTORY_CAPACITY;i++){const item=h.inventory[i];const b=btn('',()=>{if(item)this.select('bag',i,b);},'inventory-cell'+(item?' occupied':''));b.setAttribute('aria-label',item?itemName(item,this.language):this.t('Пустая ячейка ')+(i+1));if(item){b.append(art(item));if(!itemDefinition(item)?.slot&&itemCount(item)>1)b.append(el('span',String(itemCount(item)),'stack-count'));b.title=itemName(item,this.language);b.style.borderColor=RARITY_COLORS[item.rarity]||'#fff';}else b.append(el('span',undefined,'empty-cell'));grid.append(b);}
  }
  r.append(el('p',undefined,'inventory-message'));
 }
 destroy(){this.button?.removeEventListener('click',this.onButton);document.removeEventListener('keydown',this.onEscape);window.removeEventListener('resize',this.onResize);this.close();}
}
