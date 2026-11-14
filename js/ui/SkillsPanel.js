import {uiText,uiLanguage} from '../i18n/uiText.js';
import {skillEffect} from '../combat/skillRuntime.js';
import {skillDescription} from './skillDescriptions.js';
import {getSkills,skillRank,learnSkill} from '../skills/skillData.js';
import {getPassiveSkills,skillPanelText} from '../skills/passiveSkills.js';
import {assignSkillSlot,removeSkillSlot,equippedSkillSlot,normalizeSkillSlots} from '../skills/skillSlots.js';
const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
const iconNode=(skill,cls='skill-icon')=>{const node=el('div',undefined,cls);node.innerHTML=skill.iconSvg;if(cls==='skill-slot-icon'){node.style.width='22px';node.style.height='22px';node.style.display='inline-block';node.style.verticalAlign='middle';}return node;};
const button=(label,callback,cls='')=>{const b=el('button',label,cls);b.type='button';b.onclick=callback;return b;};
export class SkillsPanel{
 constructor(scene){this.scene=scene;this.root=document.getElementById('skills-panel');this.button=document.getElementById('skills-btn');this.opened=false;this.selected='active';this.detailId=null;this.onClick=()=>this.toggle();this.button?.addEventListener('click',this.onClick);this.onEscape=e=>{if(e.key==='Escape'&&this.opened)this.close();};document.addEventListener('keydown',this.onEscape);}
 get language(){return uiLanguage(this.scene);}
 t(key){return uiText(key,this.language);}
 toggle(){this.opened?this.close():this.show();}
 show(){this.scene.closePanels?.(this);this.scene.mapPanel?.close();this.scene.dungeonPanel?.close();this.scene.travelPanel?.close();this.scene.savePanel?.close();this.scene.storagePanel?.close();this.scene.npcPanel?.close();this.scene.controls?.reset?.();this.scene.inventoryPanel?.close();this.scene.characterPanel?.close();this.opened=true;this.root.hidden=false;this.render();}
 close(){this.opened=false;this.detailId=null;this.root.hidden=true;}
 selectSkill(id){this.selected=id.startsWith('passive_')?'passive':'active';this.detailId=id;this.render();}
 finishDetail(detail){const actions=el('div',undefined,'skill-detail-actions');for(const action of detail.querySelectorAll('.skill-learn,.skill-remove'))actions.append(action);const body=el('div',undefined,'skill-detail-body');while(detail.firstChild)body.append(detail.firstChild);detail.replaceChildren(body);if(actions.childNodes.length)detail.append(actions);}
 render(){
  const h=this.scene.hero,skills=getSkills(h.classId,this.language),r=this.root;r.replaceChildren();
  const head=el('header',undefined,'skill-heading');head.append(el('h2',this.t('Навыки · ')+(h.name||this.t('Герой'))),el('span',this.t('Очки навыков: ')+(h.skillPoints||0)),button('✕',()=>this.close()));r.append(head);
  const tabs=el('nav',undefined,'skill-tabs skill-type-tabs');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label',skillPanelText('types',this.language));
  for(const type of ['active','passive']){const tab=button(skillPanelText(type,this.language),()=>{this.selected=type;this.detailId=null;this.render();},type===this.selected?'active':'');tab.id='skills-tab-'+type;tab.dataset.skillType=type;tab.setAttribute('role','tab');tab.setAttribute('aria-selected',String(type===this.selected));tab.setAttribute('aria-controls','skills-list-'+type);tab.tabIndex=type===this.selected?0:-1;tab.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();this.selected=e.key==='Home'?'active':e.key==='End'?'passive':type==='active'?'passive':'active';this.detailId=null;this.render();this.root.querySelector('#skills-tab-'+this.selected)?.focus();};tabs.append(tab);}r.append(tabs);
  const assigned=normalizeSkillSlots(h);const slots=el('div',undefined,'skill-equipped-slots');slots.append(el('strong',this.t('Боевые слоты:')));
  for(let i=0;i<4;i++){const skill=skills.find(s=>s.id===assigned[i]);const b=button(String(i+1),()=>{if(skill)this.selectSkill(skill.id);},skill?'filled':'empty');if(skill){b.prepend?.(iconNode(skill,'skill-slot-icon'));b.title=skill.name;}slots.append(b);}
  r.append(slots);
  const layout=el('div',undefined,'skill-layout');r.append(layout);const list=el('div',undefined,'skill-list');list.id='skills-list-'+this.selected;list.setAttribute('role','tabpanel');list.setAttribute('aria-labelledby','skills-tab-'+this.selected);layout.append(list);
  const passive=this.selected==='passive',group=passive?getPassiveSkills(h.classId,this.language):skills;
  for(const skill of group){const rank=passive?skill.rank:skillRank(h,skill.id),locked=h.level<skill.level,slot=passive?null:equippedSkillSlot(h,skill.id);const card=button('',()=>this.selectSkill(skill.id),'skill-card skill-select'+(this.detailId===skill.id?' selected':''));card.dataset.skillId=skill.id;card.append(iconNode(skill));const info=el('div',undefined,'skill-info');info.append(el('strong',skill.name),el('small',skill.description),el('span',this.t('Уровень ')+skill.level+this.t(' · Ранг ')+rank+(passive?'/1':'/5')+(slot?this.t(' · Слот ')+slot:'')));if(passive)info.append(el('span',skillPanelText('automatic',this.language),'skill-automatic'));card.append(info);if(locked)card.append(el('span','🔒'));list.append(card);}
  const detail=el('aside',undefined,'skill-detail');layout.append(detail);
  const skill=group.find(s=>s.id===this.detailId);
  if(!skill){detail.append(el('h3',this.t('Описание навыка')),el('p',passive?skillPanelText('hint',this.language):this.t('Нажми на навык, чтобы посмотреть характеристики и назначить его в слот 1–4.')));this.finishDetail(detail);return;}
  if(passive){detail.append(iconNode(skill),el('h3',skill.name),el('p',skill.description),el('p',this.t('Требуемый уровень: ')+skill.level,'skill-stat'),el('p',skillPanelText('rank',this.language),'skill-stat'),el('p',skillPanelText('hint',this.language),'skill-note'));this.finishDetail(detail);return;}
  const rank=skillRank(h,skill.id),slot=equippedSkillSlot(h,skill.id),locked=h.level<skill.level;
  detail.append(iconNode(skill),el('h3',skill.name),el('p',skill.description));
  for(const line of [this.t('Требуемый уровень: ')+skill.level,this.t('Изучено: ')+rank+' / 5',this.t('Мана: ')+skill.mana,this.t('Перезарядка: ')+skill.cooldown+this.t(' сек.')])detail.append(el('p',line,'skill-stat'));
  detail.append(el('p',skillDescription(skill,rank,skillEffect(h.classId,skill.index),this.language),'skill-note'));
  if(!locked&&rank<5)detail.append(button(this.t('Изучить / улучшить (+1)'),()=>{if(learnSkill(h,skill.id)){this.scene.save();this.render();}},'skill-learn'));
  if(locked)detail.append(el('p',this.t('Навык пока недоступен по уровню.')));
  if(rank>0){
   detail.append(el('h4',slot?this.t('Установлен в слот ')+slot:this.t('Добавить в слот')));
   const choices=el('div',undefined,'skill-slot-choices');
   for(let i=1;i<=4;i++){const assignedSkill=skills.find(s=>s.id===assigned[i-1]);const label=String(i)+(assignedSkill?' · '+assignedSkill.name:this.t(' · свободен'));choices.append(button(label,()=>{if(assignSkillSlot(h,skill.id,i)){this.scene.save();this.scene.refreshSkillSlots?.();this.render();}},slot===i?'active':''));}
   detail.append(choices);
   if(slot)detail.append(button(this.t('Снять из слота ')+slot,()=>{if(removeSkillSlot(h,skill.id)){this.scene.save();this.scene.refreshSkillSlots?.();this.render();}},'skill-remove'));
  }else detail.append(el('p',this.t('Сначала изучи навык, чтобы добавить его в боевой слот.')));
  this.finishDetail(detail);
 }
 destroy(){document.removeEventListener('keydown',this.onEscape);this.button?.removeEventListener('click',this.onClick);this.close();}
}
