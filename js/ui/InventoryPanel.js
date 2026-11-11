import {itemIcon} from './itemIcons.js';
import {EQUIPMENT_SLOTS} from '../equipment/armor.js';
import {INVENTORY_CAPACITY,itemName,itemDefinition,equipItem,unequipItem,equipmentStats} from '../equipment/items.js';
const SLOT_NAMES={weapon:'Оружие',helmet:'Шлем',chest:'Броня',gloves:'Перчатки',pants:'Штаны',boots:'Обувь',ring:'Кольцо',amulet:'Амулет',shield:'Щит'};
const RARITY_NAMES={common:'Обычный',uncommon:'Необычный',rare:'Редкий',epic:'Эпический',legendary:'Легендарный'};
const RARITY_COLORS={common:'#e4e4db',uncommon:'#6ed68b',rare:'#75b8ff',epic:'#d89aff',legendary:'#ffce62'};
const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
const art=(item)=>{const node=el('span',undefined,'item-art-wrap');node.innerHTML=itemIcon(item,itemDefinition(item));return node;};
const btn=(text,callback,cls)=>{const b=el('button',text,cls);b.type='button';b.onclick=callback;return b;};
export class InventoryPanel{
 constructor(scene){this.scene=scene;this.root=document.getElementById('inventory-panel');this.button=document.getElementById('inventory-btn');this.opened=false;this.selected=null;this.onButton=()=>this.toggle();this.button?.addEventListener('click',this.onButton);this.onEscape=e=>{if(e.key==='Escape'&&this.opened)this.close();};document.addEventListener('keydown',this.onEscape);}
 toggle(){this.opened?this.close():this.show();}
 show(){this.scene.characterPanel?.close();this.opened=true;this.root.hidden=false;this.selected=null;this.render();}
 close(){this.opened=false;this.selected=null;this.root.hidden=true;}
 select(source,key){this.selected={source,key};this.render();}
 item(){const h=this.scene.hero;return this.selected?.source==='bag'?h.inventory[this.selected.key]:this.selected?.source==='equip'?h.equipment[this.selected.key]:null;}
 detail(container){const item=this.item();if(!item)return;const def=itemDefinition(item);if(!def)return;const box=el('section',undefined,'item-detail');container.append(box);
 box.append(art(item));box.append(el('h3',itemName(item)));const rarity=el('p',RARITY_NAMES[item.rarity]||RARITY_NAMES.common);rarity.style.color=RARITY_COLORS[item.rarity]||'#fff';box.append(rarity);
 const props=[['Тип',def.slot?SLOT_NAMES[def.slot]:'Материал'],['Требуемый уровень',String(def.level||1)]];
 if(def.attack)props.push(['Атака','+'+def.attack]);if(def.defense)props.push(['Защита','+'+def.defense]);
 if(def.allowedClasses)props.push(['Классы',def.allowedClasses.join(', ')]);
 for(const [k,v] of props)box.append(el('p',k+': '+v));
 const actions=el('div',undefined,'item-actions');box.append(actions);
 const h=this.scene.hero;
 if(this.selected.source==='bag'&&def.slot){actions.append(btn('Надеть',()=>{const result=equipItem(h,this.selected.key);if(!result.ok){this.notice({level:'Недостаточный уровень',class:'Не подходит классу',notEquipment:'Нельзя надеть'}[result.reason]||'Недоступно');return;}this.selected=null;this.scene.save();this.render();},'primary'));}
 if(this.selected.source==='equip'){actions.append(btn('Снять',()=>{if(!unequipItem(h,this.selected.key)){this.notice('В сумке нет места');return;}this.selected=null;this.scene.save();this.render();},'primary'));}
 if(this.selected.source==='bag'){actions.append(btn('Выкинуть',()=>this.confirmDiscard(),'danger'));}
 actions.append(btn('Закрыть',()=>{this.selected=null;this.render();}));
 }
 confirmDiscard(){const item=this.item();if(!item)return;const index=this.selected.key;const name=itemName(item);const box=this.root.querySelector('.item-detail');if(!box)return;box.replaceChildren(el('h3','Выкинуть «'+name+'»?'),el('p','Предмет исчезнет без возможности вернуть его.'));
 const actions=el('div',undefined,'item-actions');box.append(actions);
 actions.append(btn('Да, выкинуть',()=>{if(this.scene.hero.inventory[index]!==item){this.selected=null;this.render();return;}this.scene.hero.inventory.splice(index,1);this.selected=null;this.scene.save();this.render();},'danger'));
 actions.append(btn('Отмена',()=>this.render()));}
 notice(message){const e=this.root.querySelector('.inventory-message');if(e)e.textContent=message;}
 render(){const h=this.scene.hero,r=this.root;r.replaceChildren();
 const heading=el('div',undefined,'inventory-heading');heading.append(el('span','Снаряжение и инвентарь'),btn('✕',()=>this.close()));r.append(heading);
 const stats=equipmentStats(h);r.append(el('p',(h.name||'Герой')+' · Ур. '+h.level+' · Атака +'+stats.attack+' · Защита +'+stats.defense));
 const layout=el('div',undefined,'inventory-layout'),main=el('div',undefined,'inventory-main');layout.append(main);r.append(layout);
 const grid=el('div',undefined,'equipment-grid');main.append(grid);
 for(const slot of EQUIPMENT_SLOTS){const item=h.equipment[slot];const b=btn('',()=>{if(item)this.select('equip',slot);},'equipment-cell');b.setAttribute('aria-label',SLOT_NAMES[slot]+': '+(item?itemName(item):'пусто'));b.append(item?art(item):el('span','+','empty-slot-icon'));b.append(el('small',SLOT_NAMES[slot]));if(item)b.style.borderColor=RARITY_COLORS[item.rarity]||'#fff';grid.append(b);}
 main.append(el('h3','Сумка '+h.inventory.length+'/'+INVENTORY_CAPACITY));
 const items=el('div',undefined,'inventory-grid');main.append(items);
 for(let i=0;i<INVENTORY_CAPACITY;i++){const item=h.inventory[i];const b=btn('',()=>{if(item)this.select('bag',i);},'inventory-cell'+(item?' occupied':''));b.setAttribute('aria-label',item?itemName(item):'Пустая ячейка '+(i+1));if(item){b.append(art(item));b.title=itemName(item);b.style.borderColor=RARITY_COLORS[item.rarity]||'#fff';}else b.append(el('span',undefined,'empty-cell'));items.append(b);}
 if(this.selected&&this.item())this.detail(layout);
 r.append(el('p',undefined,'inventory-message'));
 }
 destroy(){this.button?.removeEventListener('click',this.onButton);document.removeEventListener('keydown',this.onEscape);this.close();}
}
