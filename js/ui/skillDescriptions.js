// Values describe the actual rank effects; class-specific protection is not shared.
const TEXT={
 ru:{damage:'Базовый множитель урона',duration:'Длительность',seconds:'сек.',heal:'Восстановление HP',guard:'Снижение входящего урона',evade:'Шанс уклонения',rage:'Бонус урона',focus:'Обычные атаки без промахов; критический шанс +20%',rank:'Параметры ранга',blocks:'Блоков',absorb:'Щит от максимального HP',aura:'Лечение в секунду от максимального HP',trap:'Ловушка ожидает цель до 12 секунд',pulses:'Волны',delay:'Задержка'},
 en:{damage:'Base damage multiplier',duration:'Duration',seconds:'sec.',heal:'HP restored',guard:'Incoming damage reduction',evade:'Dodge chance',rage:'Damage bonus',focus:'Ordinary attacks cannot miss; critical chance +20%',rank:'Rank parameters',blocks:'Blocked hits',absorb:'Shield from maximum HP',aura:'Maximum HP healed per second',trap:'Trap waits for a target for up to 12 seconds',pulses:'Waves',delay:'Delay'},
 es:{damage:'Multiplicador de daño base',duration:'Duración',seconds:'seg.',heal:'HP recuperados',guard:'Reducción de daño recibido',evade:'Probabilidad de esquivar',rage:'Bonificación de daño',focus:'Los ataques normales no fallan; probabilidad de crítico +20%',rank:'Parámetros de rango',blocks:'Golpes bloqueados',absorb:'Escudo del HP máximo',aura:'HP máximo recuperado por segundo',trap:'La trampa espera un objetivo hasta 12 segundos',pulses:'Oleadas',delay:'Retraso'}
};
export function skillDescription(skill,rank,effect,language='ru'){
 const t=TEXT[language]||TEXT.ru,r=Math.max(1,Math.min(5,rank)),classId=skill.id.split('_')[0],power=skill.power+20*(r-1);let line;
 if(effect==='heal')line=`${t.heal}: ${20+4*r}%`;
 else if(effect==='guard'){
  const reduction={warrior:45,paladin:65,cannoneer:35,mage:45}[classId]||45;line=`${t.guard}: ${reduction}%`;
  if(classId==='paladin')line+=` · ${t.blocks}: ${1+Math.floor(r/2)}`;
  if(classId==='mage')line+=` · ${t.absorb}: ${20+5*r}%`;
 }else if(effect==='aura')line=`${t.guard}: 45% · ${t.aura}: ${Number((.5+r*.3).toFixed(1))}%`;
 else if(effect==='evade')line=`${t.evade}: 65%`;
 else if(effect==='rage')line=`${t.rage}: +35%`;
 else if(effect==='focus')line=t.focus;
 else line=`${t.damage}: ${power}%`;
 if(effect==='root')line+=` · ${t.trap}`;
 if(effect==='area'&&classId==='warrior')line+=` · ${t.pulses}: 3 × 45%`;
 if(effect==='area'&&classId==='archer')line+=` · ${t.pulses}: 4 × 35%`;
 if(effect==='charged')line+=` × 130% · ${t.delay}: 1 ${t.seconds}`;
 if(effect==='meteor')line+=` · ${t.delay}: 0.9 ${t.seconds}`;
 const duration=['guard','aura','evade','rage','focus','root','slow','poison','burn'].includes(effect)?` · ${t.duration}: ${3+r} ${t.seconds}`:'';
 return `${t.rank} ${r}: ${line}${duration}`;
}
