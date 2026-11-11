import {EQUIPMENT_SLOTS} from '../equipment/armor.js';
import {INVENTORY_CAPACITY,itemName,itemDefinition,equipItem,unequipItem,equipmentStats} from '../equipment/items.js';
const SLOT_NAMES={weapon:'Оружие',helmet:'Шлем',chest:'Броня',gloves:'Перчатки',pants:'Штаны',boots:'Обувь',ring:'Кольцо',amulet:'Амулет',shield:'Щит'};
const RARITY_COLORS={common:'#e4e4db',uncommon:'#6ed68b',rare:'#75b8ff',epic:'#d89aff',legendary:'#ffce62'};
export class InventoryPanel{
 constructor(scene){this.scene=scene;this.root=document.getElementById('inventory-panel');this.opened=false;this.onButton=()=>this.toggle();document.getElementById('inventory-btn')?.addEventListener('click',this.onButton);this.onEscape=e=>{if(e.key==='Escape'&&this.opened)this.close();};document.addEventListener('keydown',this.onEscape);}
 toggle(){this.opened?this.close():this.show();}
 show(){this.opened=true;this.root.hidden=false;this.render();}
 close(){this.opened=false;this.root.hidden=true;}
 render(){const h=this.scene.hero,r=this.root;r.replaceChildren();const heading=document.createElement('div');heading.className='inventory-heading';heading.textContent='Снаряжение и инвентарь';const close=document.createElement('button');close.textContent='✕';close.onclick=()=>this.close();heading.append(close);r.append(heading);
 const stats=equipmentStats(h),summary=document.createElement('p');summary.textContent=(h.name||'Герой')+' · Ур. '+h.level+' · Атака +'+stats.attack+' · Защита +'+stats.defense;r.append(summary);
 const grid=document.createElement('div');grid.className='equipment-grid';for(const slot of EQUIPMENT_SLOTS){const item=h.equipment[slot];const b=document.createElement('button');b.textContent=SLOT_NAMES[slot]+': '+(item?itemName(item):'—');if(item){b.style.color=RARITY_COLORS[item.rarity]||'#fff';b.onclick=()=>{if(unequipItem(h,slot)){this.scene.save();this.render();}};}grid.append(b);}r.append(grid);
 const title=document.createElement('h3');title.textContent='Сумка '+h.inventory.length+'/'+INVENTORY_CAPACITY;r.append(title);
 const items=document.createElement('div');items.className='inventory-grid';h.inventory.forEach((item,i)=>{const b=document.createElement('button');const def=itemDefinition(item);b.textContent=itemName(item)+(def?.slot?' · '+(def.attack?'⚔'+def.attack:'🛡'+(def.defense||0)):'');b.style.color=RARITY_COLORS[item.rarity]||'#fff';b.onclick=()=>{const result=equipItem(h,i);if(!result.ok){this.message.textContent={level:'Недостаточный уровень',class:'Не подходит классу',notEquipment:'Материал нельзя надеть'}[result.reason]||'Недоступно';return;}this.scene.save();this.render();};items.append(b);});r.append(items);
 this.message=document.createElement('p');this.message.className='inventory-message';r.append(this.message);
 }
 destroy(){document.getElementById('inventory-btn')?.removeEventListener('click',this.onButton);document.removeEventListener('keydown',this.onEscape);this.close();}
}
