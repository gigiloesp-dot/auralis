import {uiText,uiLanguage} from '../i18n/uiText.js';
import {ATTRIBUTE_DEFS,attributePoints,allocateAttribute,derivedAttributes} from '../systems/attributes.js';
import {equipmentStats} from '../equipment/items.js';
const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
export class CharacterPanel{
 constructor(scene){this.scene=scene;this.root=document.getElementById('character-panel');this.button=document.getElementById('character-btn');this.opened=false;this.onClick=()=>this.toggle();this.button.addEventListener('click',this.onClick);this.onEscape=e=>{if(e.key==='Escape'&&this.opened)this.close();};document.addEventListener('keydown',this.onEscape);}
 get language(){return uiLanguage(this.scene);}
 t(key){return uiText(key,this.language);}
 toggle(){this.opened?this.close():this.show();}
 show(){this.scene.closePanels?.(this);this.scene.mapPanel?.close();this.scene.dungeonPanel?.close();this.scene.travelPanel?.close();this.scene.savePanel?.close();this.scene.storagePanel?.close();this.scene.npcPanel?.close();this.scene.controls?.reset?.();this.scene.skillsPanel?.close();this.scene.inventoryPanel?.close();this.opened=true;this.root.hidden=false;this.render();}
 close(){this.opened=false;this.root.hidden=true;}
 render(){const h=this.scene.hero,r=this.root;r.replaceChildren();const top=el('div',undefined,'character-heading');top.append(el('h2',(h.name||this.t('Герой'))+this.t(' · Ур. ')+h.level));const close=el('button','✕');close.onclick=()=>this.close();top.append(close);r.append(top);r.append(el('p',this.t('Свободных очков характеристик: ')+attributePoints(h),'attribute-points'));
 const grid=el('div',undefined,'attribute-grid');r.append(grid);for(const [key,def] of Object.entries(ATTRIBUTE_DEFS)){const row=el('div',undefined,'attribute-row');const info=el('div');info.append(el('strong',this.t(def.name)+' · '+(h.stats[key]??5)));info.append(el('small',this.t(def.desc)));row.append(info);const plus=el('button','+');plus.disabled=attributePoints(h)<1;plus.setAttribute('aria-label',this.t('Увеличить ')+this.t(def.name));plus.onclick=()=>{if(allocateAttribute(h,key)){this.scene.save();this.scene.refreshHud();this.render();}};row.append(plus);grid.append(row);}
 const stats=derivedAttributes(h),gear=equipmentStats(h);r.append(el('h3',this.t('Боевые показатели')));const summary=el('div',undefined,'character-summary');for(const [name,value] of [[this.t('Физическая атака'),stats.physicalAttack+gear.attack],[this.t('Магическая атака'),stats.magicAttack+gear.attack],[this.t('Защита'),stats.defense+gear.defense],[this.t('Шанс крита'),stats.criticalChance+'%'],[this.t('Двойной удар'),stats.doubleHitChance+'%'],[this.t('Бонус добычи'),stats.lootBonus+'%']])summary.append(el('span',name+': '+value));r.append(summary);}
 destroy(){document.removeEventListener('keydown',this.onEscape);this.button.removeEventListener('click',this.onClick);this.close();}
}
