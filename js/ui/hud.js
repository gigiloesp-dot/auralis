import {xpForNextLevel} from '../systems/progression.js';
export function updateHud(character){
 const e=document.getElementById('coords');
 if(e)e.textContent='Ур. '+character.level+' · XP '+Math.floor(character.xp||0)+'/'+xpForNextLevel(character.level)+' · X '+Math.round(character.x)+' / Y '+Math.round(character.y);
 const b=document.getElementById('hpbar');
 if(b)b.style.width=Math.max(0,Math.min(100,100*character.hp/(character.maxHp||100)))+'%';
 const fill=(id,current,max)=>{const el=document.getElementById(id);if(el)el.style.width=Math.max(0,Math.min(100,100*(Number(current)||0)/Math.max(1,Number(max)||1)))+'%';};
 fill('mpbar',character.mp,character.maxMp);
 fill('xpbar',character.level>=42?1:character.xp,character.level>=42?1:xpForNextLevel(character.level));
 const status=document.getElementById('status');if(status)status.textContent='Лесная долина · HP '+Math.round(character.hp)+'/'+character.maxHp;
}
