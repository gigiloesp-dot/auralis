import {PAUSE_ACTIONS,pauseText} from './pauseText.js';
import {QUESTS,questProgress,questTitle,questDescription} from '../quests/quests.js';
const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
export class PauseInterface{
 constructor(game,menu){this.game=game;this.menu=menu;this.active=false;this.panelOpened=false;menu.pauseAction=action=>this.open(action);this.root=el('section');this.root.className='pause-panel';this.root.hidden=true;this.root.setAttribute('role','dialog');this.root.setAttribute('aria-modal','true');document.body.append(this.root);
  this.observer=new MutationObserver(()=>{if(this.active&&menu.root.hidden&&!this.panelOpened&&!this.scene()?.panelsOpen())this.back();});this.observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['hidden']});
  this.escape=e=>{if(e.key!=='Escape'||!this.active)return;if(this.panelOpened){e.preventDefault();this.back();}else if(!this.menu.root.hidden&&this.menu.page==='settings'){e.preventDefault();this.back();}else if(!this.menu.root.hidden&&this.menu.page==='pause'){e.preventDefault();this.resume();}};document.addEventListener('keydown',this.escape);
 }
 scene(){return this.game.scene.getScene('world');}
 t(key){return pauseText(key,this.menu.lang);}
 pause(){const s=this.scene();if(!s?.hero||!this.game.scene.isActive('world'))return;this.active=true;s.save();s.closePanels();s.controls.reset();s.input.enabled=false;this.game.scene.pause('world');document.body.classList.add('pause-open');this.menu.pauseError='';this.menu.show('pause');}
 onSceneReady(s){if(this.active){s.controls.reset();s.input.enabled=false;this.game.scene.pause('world');this.back();}}
 resume(){const s=this.scene();this.active=false;this.panelOpened=false;this.root.hidden=true;s?.closePanels();s?.controls.reset();if(s?.input)s.input.enabled=true;document.body.classList.remove('pause-open');this.menu.hide();if(this.game.scene.isPaused('world'))this.game.scene.resume('world');}
 back(){if(!this.active)return;this.panelOpened=false;this.root.hidden=true;this.scene()?.closePanels();this.menu.show('pause');}
 exit(){const s=this.scene();if(s?.hero&&!s.save()){this.menu.pauseError=true;this.menu.show('pause');return false;}this.active=false;this.panelOpened=false;this.root.hidden=true;s?.controls.reset();this.game.scene.stop('world');document.body.classList.remove('pause-open');this.menu.show('slots');return true;}
 open(action){if(!this.active||!PAUSE_ACTIONS.includes(action))return;const s=this.scene();if(action==='main'){this.exit();return;}if(action==='settings'){this.menu.settingsReturn='pause';this.menu.show('settings');return;}
  this.menu.hide();const target={inventory:'inventoryPanel',skills:'skillsPanel',character:'characterPanel',backups:'savePanel'}[action];if(target){s[target].show();return;}this.showReadOnly(action);
 }
 showReadOnly(action){this.panelOpened=true;this.root.replaceChildren();const head=el('header'),close=el('button',this.t('close'));close.type='button';close.onclick=()=>this.back();head.append(el('h2',this.t(action)),close);const body=el('div');body.className='pause-panel-body';this.root.append(head,body);this.root.setAttribute('aria-label',this.t(action));
  if(action==='quests'){const h=this.scene().hero,list=QUESTS.filter(q=>h.quests?.[q.id]);if(!list.length)body.append(el('p',this.t('empty')));for(const q of list){const p=questProgress(h,q.id),card=el('article');card.dataset.questId=q.id;card.append(el('h3',questTitle(q,this.menu.lang)),el('p',questDescription(q,this.menu.lang)),el('p',this.t(p.state)+' · '+p.progress+' / '+p.required));body.append(card);}body.append(el('p',this.t('return')));}
  else for(const [heading,description]of [['movement','movementBody'],['skills','skillsBody'],['loot','lootBody'],['saves','savesBody']])body.append(el('h3',this.t(heading)),el('p',this.t(description)));
  this.root.hidden=false;
 }
 destroy(){this.observer.disconnect();document.removeEventListener('keydown',this.escape);this.root.remove();}
}
