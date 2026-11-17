import {temporaryEffects} from './temporaryEffects.js';
export class EffectsHud{
 constructor(scene){this.scene=scene;this.nodes=new Map();this.root=document.createElement('div');this.root.id='active-effects';this.root.hidden=true;document.getElementById('hud').append(this.root);}
 update(){const s=this.scene,effects=temporaryEffects(s.hero,s.monsters?.buffs,s.playNow,s.language),wanted=new Set(effects.map(e=>e.id));
  for(const [id,node]of this.nodes)if(!wanted.has(id)){node.remove();this.nodes.delete(id);}
  for(const effect of effects){let node=this.nodes.get(effect.id);if(!node){node=document.createElement('span');node.className='temporary-effect';node.dataset.effectId=effect.id;const icon=document.createElement('span');icon.className='effect-icon';icon.innerHTML=effect.iconSvg;icon.setAttribute('aria-hidden','true');const timer=document.createElement('b');timer.className='effect-time';node.append(icon,timer);this.nodes.set(effect.id,node);this.root.append(node);}
   node.classList.toggle('negative',effect.negative);node.lastChild.textContent=effect.time;node.title=effect.name;node.setAttribute('aria-label',effect.name+' · '+effect.time);
  }
  this.root.hidden=!effects.length;
 }
 destroy(){this.root.remove();this.nodes.clear();}
}
