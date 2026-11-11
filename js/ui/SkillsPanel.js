import {getSkills,skillRank,learnSkill} from '../skills/skillData.js';
const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
export class SkillsPanel{
 constructor(scene){this.scene=scene;this.root=document.getElementById('skills-panel');this.button=document.getElementById('skills-btn');this.opened=false;this.selected=0;this.onClick=()=>this.toggle();this.button?.addEventListener('click',this.onClick);}
 toggle(){this.opened?this.close():this.show();}
 show(){this.scene.inventoryPanel?.close();this.scene.characterPanel?.close();this.opened=true;this.root.hidden=false;this.render();}
 close(){this.opened=false;this.root.hidden=true;}
 render(){const h=this.scene.hero,skills=getSkills(h.classId),r=this.root;r.replaceChildren();const head=el('header',undefined,'skill-heading');head.append(el('h2','Навыки · '+(h.name||'Герой')),el('span','Очки навыков: '+(h.skillPoints||0)));const x=el('button','✕');x.onclick=()=>this.close();head.append(x);r.append(head);
 const tabs=el('nav',undefined,'skill-tabs');for(const [i,name] of ['I · Основы','II · Мастерство','III · Высшее искусство'].entries()){const b=el('button',name,i===this.selected?'active':'');b.onclick=()=>{this.selected=i;this.render();};tabs.append(b);}r.append(tabs);
 const list=el('div',undefined,'skill-list');r.append(list);
 const group=skills.filter((_,i)=>Math.floor(i*3/skills.length)===this.selected);
 if(!group.length)list.append(el('p','Навыки этой ступени появятся позднее.'));
 for(const skill of group){const rank=skillRank(h,skill.id),locked=h.level<skill.level;const card=el('article',undefined,'skill-card');card.append(el('div',skill.icon,'skill-icon'));const info=el('div',undefined,'skill-info');info.append(el('strong',skill.name),el('small',skill.description),el('span','Требуется уровень '+skill.level+' · Изучено '+rank+'/5'));card.append(info);const b=el('button',locked?'🔒':rank>=5?'Макс.':'+');b.disabled=locked||rank>=5||(h.skillPoints||0)<1;b.setAttribute('aria-label','Изучить '+skill.name);b.onclick=()=>{if(learnSkill(h,skill.id)){this.scene.save();this.render();}};card.append(b);list.append(card);}
 r.append(el('p','Изучение навыков сохраняется. Их боевые эффекты будут подключены отдельно.','skill-note'));
 }
 destroy(){this.button?.removeEventListener('click',this.onClick);this.close();}
}
