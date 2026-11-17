import {questNavigation,trackedQuest,setTrackedQuest,synchronizeTrackedQuest,QUEST_NAV_TEXT} from '../quests/questNavigation.js';
import {projectSurface} from '../world/surface.js';
import {questDefinition,questTitle} from '../quests/quests.js';
// Reuses NpcPanel's one existing HUD target. No independent animation loop,
// world marker, texture or gameplay object is created by quest navigation.
export class QuestTracker{
 constructor(scene){
  this.scene=scene;this.closed=false;this.lastQuery=-Infinity;this.navigation=null;this.hudRoot=null;this.hudKey='';
  this.arrow=document.createElement('div');this.arrow.className='quest-navigation-arrow';this.arrow.hidden=true;this.arrow.setAttribute('aria-hidden','true');
  const ns='http://www.w3.org/2000/svg';this.glyph=document.createElementNS(ns,'svg');this.glyph.setAttribute('viewBox','0 0 28 28');const path=document.createElementNS(ns,'path');path.setAttribute('d','M24 14L5 5L10 14L5 23Z');this.glyph.append(path);this.arrival=document.createElement('span');this.arrival.textContent='✓';this.arrow.append(this.glyph,this.arrival);document.body.append(this.arrow);
  this.onPostUpdate=()=>this.update();scene.events.on('postupdate',this.onPostUpdate);
 }
 get hud(){return this.scene.npcPanel?.journal||null;}
 select(id){const result=setTrackedQuest(this.scene.hero,id,{persist:()=>this.scene.save()});if(!result.ok)this.scene.notify?.(QUEST_NAV_TEXT[this.scene.language]?.storage||QUEST_NAV_TEXT.ru.storage);this.update(true);return result;}
 createButton(id,onChange){
  const t=QUEST_NAV_TEXT[this.scene.language]||QUEST_NAV_TEXT.ru,selected=trackedQuest(this.scene.hero)?.id===id,button=document.createElement('button');button.type='button';button.className='quest-track-button';button.dataset.trackQuest=id;button.setAttribute('aria-pressed',String(selected));button.textContent=selected?t.tracked:t.track;button.setAttribute('aria-label',(selected?t.untrack:t.track)+': '+(this.scene.hero?this.questTitle(id):id));button.onclick=()=>{if(this.select(selected?null:id).ok)onChange?.();};return button;
 }
 questTitle(id){return questTitle(questDefinition(id)||{id},this.scene.language);}
 blocked(){const s=this.scene;return this.closed||!s.hero||s.hero.hp<=0||s.closed||document.hidden||innerHeight>innerWidth||window.Auralis?.pauseInterface?.active||s.panelsOpen?.()||document.body.classList.contains('menu-open');}
 update(force=false){
  const s=this.scene,hud=this.hud;if(!s.hero||this.closed)return;
  const now=performance.now();if(force||now-this.lastQuery>=100){this.lastQuery=now;synchronizeTrackedQuest(s.hero,{persist:()=>s.save()});this.navigation=questNavigation(s.hero,{content:s.regionContent,language:s.language,liveMonsters:s.monsters?.monsters||[]});}
  const nav=this.navigation,blocked=this.blocked();if(hud){hud.hidden=blocked||!nav;if(nav){const key=nav.questId+'|'+s.language+'|'+nav.title+'|'+nav.objectiveText+'|'+nav.routeText+'|'+nav.progress+'|'+nav.required+'|'+nav.ready;
    if(hud!==this.hudRoot||key!==this.hudKey){this.hudRoot=hud;this.hudKey=key;const title=document.createElement('strong'),row=document.createElement('span'),goal=document.createElement('span'),progress=document.createElement('b');title.className='quest-tracker-title';row.className='quest-tracker-detail';goal.className='quest-tracker-goal';progress.className='quest-tracker-progress';title.textContent=nav.title;goal.textContent=(nav.routeText?nav.routeText+' · ':'')+nav.objectiveText;goal.title=goal.textContent;progress.textContent=nav.progress+'/'+nav.required;progress.dataset.trackProgress='true';row.append(goal,progress);hud.replaceChildren(title,row);hud.dataset.questId=nav.questId;hud.title=nav.title+' · '+goal.textContent+' · '+progress.textContent;}
   }}
  this.arrow.hidden=blocked||!nav;if(!nav)return;
  const c=s.regionContent,hero=projectSurface(s.hero.x,s.hero.y,c),target=projectSurface(nav.waypoint.x,nav.waypoint.y,c),camera=s.cameras.main,view=camera.worldView,zoom=camera.zoom||1,entry=s.rig?.painted?.entry,sprite=s.rig?.painted?.sprite,top=(entry?.annotationHeight||sprite?.displayHeight*sprite?.originY||84)*zoom;
  const x=(hero.x-view.x)*zoom+(camera.x||0),y=(hero.y-view.y)*zoom+(camera.y||0)-top-18;this.arrow.style.left=x+'px';this.arrow.style.top=y+'px';this.glyph.style.transform=`rotate(${Math.atan2(target.y-hero.y,target.x-hero.x)}rad)`;
  const distance=Math.hypot(s.hero.x-nav.waypoint.x,s.hero.y-nav.waypoint.y),arrived=nav.waypoint.kind===nav.objective.kind&&nav.waypoint.region===nav.objective.region&&distance<=nav.objective.radius&&!nav.objective.waitingUntil;this.arrow.dataset.arrived=String(arrived);this.arrow.dataset.questId=nav.questId;this.arrow.dataset.targetRegion=nav.waypoint.region;this.arrow.dataset.targetKind=nav.waypoint.kind;this.arrow.dataset.targetX=String(nav.waypoint.x);this.arrow.dataset.targetY=String(nav.waypoint.y);this.arrow.dataset.worldDistance=String(distance);this.arrow.dataset.angle=String(Math.atan2(target.y-hero.y,target.x-hero.x));
 }
 destroy(){if(this.closed)return;this.closed=true;this.scene.events.off('postupdate',this.onPostUpdate);this.arrow.remove();const hud=this.hud;if(hud){hud.hidden=true;delete hud.dataset.questId;}this.navigation=null;this.hudRoot=null;}
}
