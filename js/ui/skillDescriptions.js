// Runtime values are shared with combat; these labels can follow the menu locale.
const TEXT={
 ru:{damage:'Урон',duration:'Длительность',seconds:'сек.',heal:'Восстановление HP',guard:'Снижение входящего урона',evade:'Шанс уклонения',rage:'Бонус урона',focus:'Обычные атаки без промахов',rank:'Параметры ранга'},
 en:{damage:'Damage',duration:'Duration',seconds:'sec.',heal:'HP restored',guard:'Incoming damage reduction',evade:'Dodge chance',rage:'Damage bonus',focus:'Ordinary attacks cannot miss',rank:'Rank parameters'},
 es:{damage:'Daño',duration:'Duración',seconds:'seg.',heal:'HP recuperados',guard:'Reducción de daño recibido',evade:'Probabilidad de esquivar',rage:'Bonificación de daño',focus:'Los ataques normales no fallan',rank:'Parámetros de rango'}
};
export function skillDescription(skill,rank,effect,language='ru'){
 const t=TEXT[language]||TEXT.ru,r=Math.max(1,Math.min(5,rank));
 const line=effect==='heal'?`${t.heal}: ${20+4*r}%`:effect==='guard'||effect==='aura'?`${t.guard}: 55%`:effect==='evade'?`${t.evade}: 65%`:effect==='rage'?`${t.rage}: +35%`:effect==='focus'?t.focus:`${t.damage}: ${skill.power+20*(r-1)}%`;
 const duration=['guard','aura','evade','rage','focus','root','slow','poison','burn'].includes(effect)?` · ${t.duration}: ${3+r} ${t.seconds}`:'';
 return `${t.rank} ${r}: ${line}${duration}`;
}
