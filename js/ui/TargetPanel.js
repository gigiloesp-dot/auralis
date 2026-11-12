import {targetText} from '../i18n/targetText.js';
const finite=(v,fallback)=>Number.isFinite(v)?v:fallback;
export function targetPanelBounds(width,{hudRight=260,minimapLeft=width-200,toolbarBottom=50,pauseBottom=50}={}){
 const leftLimit=Math.max(8,hudRight+10),rightLimit=Math.min(width-8,minimapLeft-10),available=rightLimit-leftLimit;
 if(available>=112){const panelWidth=Math.min(240,available);return {left:leftLimit+(available-panelWidth)/2,top:Math.max(toolbarBottom,pauseBottom)+8,width:panelWidth};}
 // Very narrow screens retain a top panel below both HUD bands.
 return {left:Math.max(8,(width-Math.min(220,width-16))/2),top:Math.max(144,toolbarBottom+8),width:Math.min(220,width-16)};
}
export class TargetPanel{
 constructor(scene){
  this.scene=scene;this.root=document.createElement('section');this.root.id='target-panel';this.root.className='target-panel';this.root.hidden=true;this.root.setAttribute('role','region');this.root.setAttribute('aria-label',targetText('selected',scene.language));
  const heading=document.createElement('div');heading.className='target-heading';this.name=document.createElement('strong');this.name.id='target-name';this.level=document.createElement('span');this.level.id='target-level';heading.append(this.name,this.level);
  this.track=document.createElement('div');this.track.className='target-health';this.track.setAttribute('role','progressbar');this.track.setAttribute('aria-label',targetText('health',scene.language));this.track.setAttribute('aria-valuemin','0');this.fill=document.createElement('span');this.fill.className='target-health-fill';this.values=document.createElement('b');this.values.id='target-health-text';this.track.append(this.fill,this.values);this.root.append(heading,this.track);document.body.append(this.root);
  this.resize=()=>this.position();window.addEventListener('resize',this.resize);this.position();
 }
 position(){
  const health=document.getElementById('health')?.getBoundingClientRect(),map=document.getElementById('minimap')?.getBoundingClientRect(),toolbar=document.querySelector('.rpg-toolbar')?.getBoundingClientRect(),pause=document.getElementById('pause-btn')?.getBoundingClientRect();
  const bounds=targetPanelBounds(window.innerWidth,{hudRight:health?.right,minimapLeft:map?.left,toolbarBottom:toolbar?.bottom,pauseBottom:pause?.bottom});
  this.root.style.left=bounds.left+'px';this.root.style.top=bounds.top+'px';this.root.style.width=bounds.width+'px';
 }
 update(monster){
  if(!monster||monster.alive===false||!(monster.hp>0)||this.scene.hero?.hp<=0){this.root.hidden=true;this.currentKey=null;return;}
  const language=this.scene.language||'ru',name=monster.kind?.names?.[language]||monster.name||monster.kind?.name||monster.type||'',level=Math.max(1,Math.floor(finite(monster.level,finite(monster.kind?.level,1)))),max=Math.max(1,Math.ceil(finite(monster.maxHp,1))),hp=Math.max(0,Math.min(max,Math.ceil(monster.hp))),key=monster.key||monster.id||monster;
  if(this.currentKey!==key){this.healingUntil=0;this.lastHp=hp;}else if(hp>this.lastHp)this.healingUntil=Date.now()+650;
  this.currentKey=key;this.lastHp=hp;this.root.hidden=false;this.root.dataset.monsterId=String(monster.id||'');this.name.textContent=name;this.name.title=name;this.level.textContent=targetText('level',language)+' '+level;this.values.textContent=hp+' / '+max;this.fill.style.width=Math.min(100,100*hp/max)+'%';this.track.setAttribute('aria-valuenow',String(hp));this.track.setAttribute('aria-valuemax',String(max));this.root.classList.toggle('recovering',Date.now()<(this.healingUntil||0));this.root.title=this.root.classList.contains('recovering')?targetText('recovering',language):name;this.position();
 }
 destroy(){window.removeEventListener('resize',this.resize);this.root.remove();this.currentKey=null;}
}
