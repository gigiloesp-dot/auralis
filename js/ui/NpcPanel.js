import {QUEST_TEXT,questProgress,acceptQuest,claimQuest} from '../quests/quests.js';
const element=(tag,text,className)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(className)e.className=className;return e;};
export class NpcPanel{
 constructor(scene){
  this.scene=scene;this.opened=false;this.text=QUEST_TEXT[scene.language||document.documentElement.lang]||QUEST_TEXT.ru;
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
  const close=element('button',t.close);close.onclick=()=>this.close();heading.append(close);this.root.append(heading,element('h3',t.title),element('p',t.body),element('p',`${t.progress}: ${p.progress}/${p.required}`),element('p',t.reward));
  if(p.state==='available'){const accept=element('button',t.accept,'npc-action');accept.onclick=()=>{if(acceptQuest(this.scene.hero)){this.scene.save();this.render();}};this.root.append(accept);}
  else if(p.state==='completed'){const claim=element('button',t.claim,'npc-action');claim.onclick=()=>{const result=claimQuest(this.scene.hero);if(result.ok){this.scene.save();this.scene.refreshHud();this.render();}else this.render(t.full);};this.root.append(claim);}
  else this.root.append(element('p',p.state==='claimed'?t.claimed:t.active));
  if(message){const status=element('p',message,'npc-status');status.setAttribute('role','status');this.root.append(status);}
 }
 destroy(){this.button.remove();this.journal.remove();this.root.remove();this.opened=false;}
}
