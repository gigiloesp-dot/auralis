import {itemDefinition,itemName,itemCount} from '../equipment/items.js';
import {itemArt} from './itemPresentation.js';
const COPY={
 ru:{title:'Добыча',close:'Закрыть',pickup:'Взять',all:'Забрать всё',level:'Ур.',quantity:'Количество',picked:'Подобрано',full:'Инвентарь заполнен',save:'Не удалось сохранить подбор',distance:'Предмет слишком далеко',missing:'Предмет уже подобран',busy:'Подбор выполняется',blocked:'Подбор недоступен',common:'Обычный',uncommon:'Необычный',rare:'Редкий',epic:'Эпический',legendary:'Легендарный'},
 en:{title:'Loot',close:'Close',pickup:'Take',all:'Take all',level:'Lv.',quantity:'Quantity',picked:'Picked up',full:'Inventory full',save:'Could not save pickup',distance:'Item is too far away',missing:'Item already collected',busy:'Pickup in progress',blocked:'Pickup unavailable',common:'Common',uncommon:'Uncommon',rare:'Rare',epic:'Epic',legendary:'Legendary'},
 es:{title:'Botín',close:'Cerrar',pickup:'Tomar',all:'Recoger todo',level:'Nv.',quantity:'Cantidad',picked:'Recogido',full:'Inventario lleno',save:'No se pudo guardar',distance:'El objeto está demasiado lejos',missing:'Objeto ya recogido',busy:'Recogida en curso',blocked:'Recogida no disponible',common:'Común',uncommon:'Inusual',rare:'Raro',epic:'Épico',legendary:'Legendario'}
};
const COLORS={common:'#aaa79f',uncommon:'#62c07b',rare:'#6fa9e2',epic:'#bb83df',legendary:'#f39a45'};
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
export class LootPanel{
 constructor(scene,loot){
  this.scene=scene;this.loot=loot;this.opened=false;this.signature='';this.root=el('section',undefined,'loot-panel auralis-panel');this.root.id='loot-panel';this.root.hidden=true;this.root.setAttribute('role','region');
  this.header=el('header');this.title=el('h2');this.closeButton=this.button('×',()=>this.close(),'close');this.header.append(this.title,this.closeButton);
  this.list=el('div',undefined,'loot-items');this.list.setAttribute('role','list');this.status=el('p',undefined,'loot-status');this.status.setAttribute('role','status');this.status.setAttribute('aria-live','polite');
  this.footer=el('footer');this.allButton=this.button('',()=>{const r=this.loot.takeAll(),t=this.copy(),amount=r.picked.reduce((n,p)=>n+itemCount(p.item),0),failure=r.failed[0];this.status.textContent=[amount?t.picked+': '+amount:'',failure?t[failure.reason]||t.blocked:''].filter(Boolean).join(' · ');this.update();},'all');this.footer.append(this.status,this.allButton);this.root.append(this.header,this.list,this.footer);document.body.append(this.root);
  this.stop=e=>e.stopPropagation();for(const name of ['pointerdown','pointerup','click'])this.root.addEventListener(name,this.stop);
  this.escape=e=>{if(this.opened&&e.key==='Escape'){e.stopImmediatePropagation();this.close();}};document.addEventListener('keydown',this.escape);
  this.visibility=()=>{if(document.hidden)this.close();};document.addEventListener('visibilitychange',this.visibility);
  this.resize=()=>{if(window.innerHeight>window.innerWidth)this.close();};window.addEventListener('resize',this.resize);
  this.observer=new MutationObserver(()=>{if(document.body.classList.contains('menu-open')||document.body.classList.contains('pause-open'))this.close();});this.observer.observe(document.body,{attributes:true,attributeFilter:['class']});
 }
 copy(){return COPY[this.scene.language]||COPY.ru;}
 button(label,fn,action){const b=el('button',label,'auralis-button');b.type='button';b.dataset.lootAction=action;b.addEventListener('click',fn);return b;}
 show(id){if(this.loot.blocked()||!this.loot.nearbyDrops().some(d=>d.id===id))return false;this.region=this.scene.hero.region;this.signature='';this.status.textContent='';this.opened=true;this.root.hidden=false;this.update();return true;}
 update(){
  if(!this.opened)return;
  if(this.scene.closed||this.scene.hero.region!==this.region||this.loot.blocked()){this.close();return;}
  const drops=this.loot.nearbyDrops();if(!drops.length){this.close();return;}
  const language=this.scene.language||'ru',signature=JSON.stringify([language,drops.map(d=>[d.id,d.item.id,d.item.rarity,d.item.quantity])]);if(signature===this.signature)return;this.signature=signature;
  const t=this.copy();this.title.textContent=t.title+' · '+drops.length;this.root.setAttribute('aria-label',t.title);this.closeButton.setAttribute('aria-label',t.close);this.allButton.textContent=t.all;
  const scroll=this.list.scrollTop,focus=document.activeElement?.closest?.('[data-loot-id]')?.dataset.lootId;this.list.replaceChildren();
  for(const d of drops){
   const item=d.item,def=itemDefinition(item),color=COLORS[item.rarity]||COLORS.common,row=el('article',undefined,'loot-row auralis-card');row.dataset.lootId=d.id;row.dataset.rarity=item.rarity;row.style.borderColor=color;row.setAttribute('role','listitem');
   const art=itemArt(item,def);art.querySelector('rect')?.setAttribute('stroke',color);const copy=el('div',undefined,'loot-copy'),name=el('strong',itemName(item,language));name.style.color=color;const meta=[t[item.rarity]||t.common];if(def?.slot)meta.push(t.level+' '+def.level);meta.push('×'+itemCount(item));copy.append(name,el('small',meta.join(' · ')));
   const pick=this.button(t.pickup,()=>{const r=this.loot.tryPickup(d.id);this.status.textContent=r.ok?t.picked+': '+itemName(r.item,language):t[r.reason]||t.blocked;this.update();},'pickup');pick.setAttribute('aria-label',t.pickup+': '+itemName(item,language));row.append(art,copy,pick);this.list.append(row);if(d.id===focus)pick.focus({preventScroll:true});
  }
  this.list.scrollTop=scroll;
 }
 close(){this.opened=false;this.root.hidden=true;this.signature='';this.list.replaceChildren();this.status.textContent='';}
 destroy(){this.close();this.observer.disconnect();document.removeEventListener('keydown',this.escape);document.removeEventListener('visibilitychange',this.visibility);window.removeEventListener('resize',this.resize);for(const name of ['pointerdown','pointerup','click'])this.root.removeEventListener(name,this.stop);this.root.remove();}
}
