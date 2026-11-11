import {skillEffect} from '../combat/skillRuntime.js';
import {skillDescription} from './skillDescriptions.js';
import {getSkills,skillRank,learnSkill} from '../skills/skillData.js';
import {assignSkillSlot,removeSkillSlot,equippedSkillSlot,normalizeSkillSlots} from '../skills/skillSlots.js';
const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
const button=(label,callback,cls='')=>{const b=el('button',label,cls);b.type='button';b.onclick=callback;return b;};
export class SkillsPanel{
 constructor(scene){this.scene=scene;this.root=document.getElementById('skills-panel');this.button=document.getElementById('skills-btn');this.opened=false;this.selected=0;this.detailId=null;this.onClick=()=>this.toggle();this.button?.addEventListener('click',this.onClick);this.onEscape=e=>{if(e.key==='Escape'&&this.opened)this.close();};document.addEventListener('keydown',this.onEscape);}
 toggle(){this.opened?this.close():this.show();}
 show(){this.scene.npcPanel?.close();this.scene.controls?.reset?.();this.scene.inventoryPanel?.close();this.scene.characterPanel?.close();this.opened=true;this.root.hidden=false;this.render();}
 close(){this.opened=false;this.detailId=null;this.root.hidden=true;}
 selectSkill(id){this.detailId=id;this.render();}
 render(){
  const h=this.scene.hero,skills=getSkills(h.classId),r=this.root;r.replaceChildren();
  const head=el('header',undefined,'skill-heading');head.append(el('h2','Навыки · '+(h.name||'Герой')),el('span','Очки навыков: '+(h.skillPoints||0)),button('✕',()=>this.close()));r.append(head);
  const tabs=el('nav',undefined,'skill-tabs');for(const [i,name] of ['I · Основы','II · Мастерство','III · Высшее искусство'].entries()){tabs.append(button(name,()=>{this.selected=i;this.detailId=null;this.render();},i===this.selected?'active':''));}r.append(tabs);
  const assigned=normalizeSkillSlots(h);const slots=el('div',undefined,'skill-equipped-slots');slots.append(el('strong','Боевые слоты:'));
  for(let i=0;i<4;i++){const skill=skills.find(s=>s.id===assigned[i]);slots.append(button(skill?skill.icon+' '+(i+1):String(i+1),()=>{if(skill)this.selectSkill(skill.id);},skill?'filled':'empty'));}
  r.append(slots);
  const layout=el('div',undefined,'skill-layout');r.append(layout);const list=el('div',undefined,'skill-list');layout.append(list);
  const group=skills.filter((_,i)=>Math.floor(i*3/skills.length)===this.selected);
  for(const skill of group){const rank=skillRank(h,skill.id),locked=h.level<skill.level,slot=equippedSkillSlot(h,skill.id);const card=button('',()=>this.selectSkill(skill.id),'skill-card skill-select'+(this.detailId===skill.id?' selected':''));card.append(el('div',skill.icon,'skill-icon'));const info=el('div',undefined,'skill-info');info.append(el('strong',skill.name),el('small',skill.description),el('span','Уровень '+skill.level+' · Ранг '+rank+'/5'+(slot?' · Слот '+slot:'')));card.append(info);if(locked)card.append(el('span','🔒'));list.append(card);}
  const detail=el('aside',undefined,'skill-detail');layout.append(detail);
  const skill=skills.find(s=>s.id===this.detailId);
  if(!skill){detail.append(el('h3','Описание навыка'),el('p','Нажми на навык, чтобы посмотреть характеристики и назначить его в слот 1–4.'));return;}
  const rank=skillRank(h,skill.id),slot=equippedSkillSlot(h,skill.id),locked=h.level<skill.level;
  detail.append(el('div',skill.icon,'skill-icon'),el('h3',skill.name),el('p',skill.description));
  for(const line of ['Требуемый уровень: '+skill.level,'Изучено: '+rank+' / 5','Мана: '+skill.mana,'Перезарядка: '+skill.cooldown+' сек.'])detail.append(el('p',line,'skill-stat'));
  detail.append(el('p',skillDescription(skill,rank,skillEffect(h.classId,skill.index),localStorage.getItem('auralis_language')||'ru'),'skill-note'));
  if(!locked&&rank<5)detail.append(button('Изучить / улучшить (+1)',()=>{if(learnSkill(h,skill.id)){this.scene.save();this.render();}},'skill-learn'));
  if(locked)detail.append(el('p','Навык пока недоступен по уровню.'));
  if(rank>0){
   detail.append(el('h4',slot?'Установлен в слот '+slot:'Добавить в слот'));
   const choices=el('div',undefined,'skill-slot-choices');
   for(let i=1;i<=4;i++){const assignedSkill=skills.find(s=>s.id===assigned[i-1]);const label=String(i)+(assignedSkill?' · '+assignedSkill.name:' · свободен');choices.append(button(label,()=>{if(assignSkillSlot(h,skill.id,i)){this.scene.save();this.scene.refreshSkillSlots?.();this.render();}},slot===i?'active':''));}
   detail.append(choices);
   if(slot)detail.append(button('Снять из слота '+slot,()=>{if(removeSkillSlot(h,skill.id)){this.scene.save();this.scene.refreshSkillSlots?.();this.render();}},'skill-remove'));
  }else detail.append(el('p','Сначала изучи навык, чтобы добавить его в боевой слот.'));
 }
 destroy(){document.removeEventListener('keydown',this.onEscape);this.button?.removeEventListener('click',this.onClick);this.close();}
}
