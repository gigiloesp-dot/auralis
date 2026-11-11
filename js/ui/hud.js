import {xpForNextLevel} from '../systems/progression.js';
export function updateHud(character){
 const level=document.getElementById('hero-level');if(level)level.textContent='Ур. '+character.level;
 const e=document.getElementById('coords');if(e)e.textContent='X '+Math.round(character.x)+' / Y '+Math.round(character.y);
 const set=(bar,label,current,max)=>{const b=document.getElementById(bar),t=document.getElementById(label);const a=Math.max(0,Math.floor(Number(current)||0)),m=Math.max(1,Math.floor(Number(max)||1));if(b)b.style.width=Math.max(0,Math.min(100,100*a/m))+'%';if(t)t.textContent=a+' / '+m;};
 set('hpbar','hptext',character.hp,character.maxHp);
 set('mpbar','mptext',character.mp,character.maxMp);
 const capped=character.level>=42;set('xpbar','xptext',capped?1:character.xp,capped?1:xpForNextLevel(character.level));
 const status=document.getElementById('status');if(status)status.textContent='Лесная долина';
}
