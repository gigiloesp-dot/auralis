import {DUNGEONS,DIFFICULTIES,dungeonDefinition,canEnterDungeon} from '../dungeons/dungeonSystem.js';
import {dungeonName} from '../dungeons/dungeonData.js';
const TEXT={
 ru:{enter:'Войти',leave:'Покинуть подземелье',choose:'Выбери сложность',level:'Требуемый уровень',close:'Закрыть',reward:'За победу над всеми боссами: опыт и золото. Награды и возрождение боссов отдельные для каждой сложности.',cooldown:'Боссы возрождаются через 60 минут после победы.',levelError:'Недостаточный уровень персонажа.',distance:'Подойди ближе ко входу.',dead:'Нельзя войти после смерти.',invalid:'Подземелье недоступно.',inside:'Сначала выйди из текущего подземелья.'},
 en:{enter:'Enter',leave:'Leave dungeon',choose:'Choose difficulty',level:'Required level',close:'Close',reward:'Defeat all bosses for experience and gold. Each difficulty has separate rewards and boss respawns.',cooldown:'Bosses respawn 60 minutes after defeat.',levelError:'Your character level is too low.',distance:'Move closer to the entrance.',dead:'You cannot enter while dead.',invalid:'Dungeon unavailable.',inside:'Leave your current dungeon first.'},
 es:{enter:'Entrar',leave:'Salir de la mazmorra',choose:'Elige dificultad',level:'Nivel requerido',close:'Cerrar',reward:'Derrota a todos los jefes para ganar experiencia y oro. Cada dificultad tiene recompensas y reapariciones independientes.',cooldown:'Los jefes reaparecen 60 minutos después de ser derrotados.',levelError:'El nivel de tu personaje es demasiado bajo.',distance:'Acércate a la entrada.',dead:'No puedes entrar mientras estás muerto.',invalid:'Mazmorra no disponible.',inside:'Sal primero de la mazmorra actual.'}
};
const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
export class DungeonPanel{
 constructor(scene){
  this.scene=scene;this.opened=false;this.language=scene.language||'ru';this.text=TEXT[this.language]||TEXT.ru;
  this.button=el('button','','dungeon-interact');this.button.type='button';this.button.hidden=true;this.button.onclick=()=>{if(this.scene.hero.dungeonSession){this.scene.controls?.reset();this.scene.leaveDungeon?.();}else this.show();};
  this.root=el('section','','dungeon-panel');this.root.hidden=true;this.root.setAttribute('role','dialog');this.root.setAttribute('aria-modal','true');this.root.setAttribute('aria-label',this.text.choose);document.body.append(this.button,this.root);
  this.onKey=e=>{if(e.key==='Escape')this.close();};document.addEventListener('keydown',this.onKey);
 }
 nearest(){const h=this.scene.hero;return DUNGEONS.filter(d=>d.region===h.region&&Math.hypot(h.x-d.x,h.y-d.y)<=160).sort((a,b)=>Math.hypot(h.x-a.x,h.y-a.y)-Math.hypot(h.x-b.x,h.y-b.y))[0];}
 blocked(){return ['inventoryPanel','characterPanel','skillsPanel','npcPanel','storagePanel','savePanel','mapPanel','travelPanel'].some(key=>this.scene[key]?.opened);}
 update(){
  const h=this.scene.hero;if(!h)return;const session=h.dungeonSession;
  if(session){const exit=this.scene.regionContent?.exit;this.button.hidden=this.opened||this.blocked()||!exit||h.hp<=0||Math.hypot(h.x-exit.x,h.y-exit.y)>(exit.radius||90);this.button.textContent=this.text.leave;}
  else{const d=this.nearest();this.button.hidden=this.opened||this.blocked()||!d||h.hp<=0;this.button.textContent=d?`${this.text.enter}: ${dungeonName(d,this.language)}`:'';if(this.opened&&!d)this.close();}
 }
 show(){const d=this.nearest();if(!d)return;for(const name of ['inventoryPanel','characterPanel','skillsPanel','npcPanel','storagePanel','savePanel','mapPanel','travelPanel'])this.scene[name]?.close();this.scene.controls?.reset();this.selected=d.id;this.opened=true;this.button.hidden=true;this.root.hidden=false;this.render();}
 close(){this.opened=false;this.root.hidden=true;}
 render(message=''){
  const d=dungeonDefinition(this.selected),t=this.text;if(!d){this.close();return;}this.root.replaceChildren();const head=el('header');head.append(el('h2',dungeonName(d,this.language)));const close=el('button',t.close);close.type='button';close.onclick=()=>this.close();head.append(close);this.root.append(head,el('p',`${t.level}: ${d.level}`),el('p',t.reward),el('p',t.cooldown),el('h3',t.choose));
  const choices=el('div','','dungeon-difficulties');for(const mode of Object.values(DIFFICULTIES)){
   const b=el('button',`${mode.names[this.language]||mode.names.ru} · HP/ATK ×${mode.multiplier}`);b.type='button';b.disabled=this.scene.hero.level<d.level;
   b.onclick=()=>{const allowed=canEnterDungeon(this.scene.hero,d.id,mode.id);if(!allowed.ok){this.render(t[allowed.reason==='level'?'levelError':allowed.reason]||t.invalid);return;}const result=this.scene.enterDungeon?.(d.id,mode.id);if(result?.ok===false){this.render(t[result.reason==='level'?'levelError':result.reason]||t.invalid);return;}this.close();};choices.append(b);
  }
  this.root.append(choices);const status=el('p',message||(this.scene.hero.level<d.level?t.levelError:''),'dungeon-status');status.setAttribute('role','status');this.root.append(status);
 }
 destroy(){document.removeEventListener('keydown',this.onKey);this.button.remove();this.root.remove();this.opened=false;}
}
