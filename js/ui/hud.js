import {applyPortrait} from './Portrait.js';
import {xpForNextLevel} from '../systems/progression.js';
export function updateHud(character,language='ru',content){
 let portrait=document.getElementById('hud-portrait');if(!portrait){portrait=document.createElement('span');portrait.id='hud-portrait';portrait.setAttribute('aria-hidden','true');document.getElementById('hud').append(portrait);}
 if(portrait.dataset.classId!==character.classId){const color={warrior:'#6d8da1',archer:'#7b9a63',mage:'#997bba',paladin:'#c0b06d',assassin:'#6f657f',cannoneer:'#a87b53'}[character.classId]||'#6d8da1';portrait.innerHTML='<svg viewBox="0 0 40 48"><path d="M4 48V36q16-18 32 0v12" fill="'+color+'"/><ellipse cx="20" cy="19" rx="11" ry="14" fill="#ddb88e"/><path d="M9 18V8q12-10 22 0v12l-6-9-16 7" fill="#4c382c"/><path d="M15 23h2m6 0h2" stroke="#493a2b" stroke-width="2"/></svg>';portrait.dataset.classId=character.classId;applyPortrait(portrait,character.classId);}

 const level=document.getElementById('hero-level');if(level)level.textContent=({ru:'Ур.',en:'Lv.',es:'Nv.'}[language]||'Lv.')+' '+character.level;
 const e=document.getElementById('coords');if(e)e.textContent='X '+Math.round(character.x)+' / Y '+Math.round(character.y);
 const set=(bar,label,current,max)=>{const b=document.getElementById(bar),t=document.getElementById(label);const a=Math.max(0,Math.floor(Number(current)||0)),m=Math.max(1,Math.floor(Number(max)||1));if(b)b.style.width=Math.max(0,Math.min(100,100*a/m))+'%';if(t)t.textContent=a+' / '+m;};
 set('hpbar','hptext',character.hp,character.maxHp);
 set('mpbar','mptext',character.mp,character.maxMp);
 const capped=character.level>=42;set('xpbar','xptext',capped?1:character.xp,capped?1:xpForNextLevel(character.level));
 const status=document.getElementById('status');if(status)status.textContent=content?.names?.[language]||content?.name||'Auralis';
}
