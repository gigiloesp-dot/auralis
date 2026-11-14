import {CLASSES} from '../characters/classes.js';
import {combatSpec} from '../combat/skillRuntime.js';
import {skillIcon} from '../assets/skillIcons.js';

// These entries describe the existing class rules. They never add a modifier,
// consume skill points or write to the character's saved active-skill ranks.
const UI={
 ru:{active:'Активные',passive:'Пассивные',types:'Тип навыков',automatic:'Действует автоматически',hint:'Пассивные свойства класса действуют автоматически с 1-го уровня. Они не занимают боевые слоты.',rank:'Ранг 1 / 1'},
 en:{active:'Active',passive:'Passive',types:'Skill types',automatic:'Always active',hint:'Class passives work automatically from level 1. They do not occupy combat slots.',rank:'Rank 1 / 1'},
 es:{active:'Activas',passive:'Pasivas',types:'Tipos de habilidad',automatic:'Activa automáticamente',hint:'Las pasivas de clase funcionan automáticamente desde el nivel 1. No ocupan ranuras de combate.',rank:'Rango 1 / 1'}
};
export function skillPanelText(key,language='ru'){return (UI[language]||UI.ru)[key]||key;}

const NAMES={
 ru:{guard:'Классовая защита',warrior:'Мастерство меча',archer:'Меткость лучника',mage:'Магические снаряды',paladin:'Удар щитом',assassin:'Проворство',cannoneer:'Пушкарь'},
 en:{guard:'Class defenses',warrior:'Sword mastery',archer:'Archer precision',mage:'Magic projectiles',paladin:'Shield strike',assassin:'Nimbleness',cannoneer:'Cannoneer training'},
 es:{guard:'Defensas de clase',warrior:'Dominio de la espada',archer:'Puntería del arquero',mage:'Proyectiles mágicos',paladin:'Golpe de escudo',assassin:'Agilidad',cannoneer:'Entrenamiento de artillería'}
};
const DESCRIPTIONS={
 ru:{
  guard:(s)=>`Базовая физическая защита класса: ${s.defense}. Магическая защита: ${s.magicDefense}. Учитывается автоматически при получении урона.`,
  warrior:()=> 'Обычные атаки мечом автоматически чередуются в серии из трёх ударов.',
  archer:(s)=>`Шанс промаха обычного выстрела — ${Math.round(s.missChance*100)}%. При стрельбе на ходу урон снижается на ${Math.round(s.movingPenalty*100)}%.`,
  mage:()=> 'Обычные атаки выпускают магические снаряды и используют магическую атаку и интеллект персонажа.',
  paladin:()=> 'Каждый третий обычный удар автоматически выполняется щитом и наносит усиленный урон.',
  assassin:(s,c)=>`Скорость передвижения выше на ${Math.round((c.speed-1)*100)}%, а базовый промежуток между атаками короче на ${Math.round((1-s.attackIntervalMultiplier)*100)}%.`,
  cannoneer:()=> 'Обычные атаки выпускают настоящие пушечные снаряды. Попадание учитывает расстояние и препятствия.'
 },
 en:{
  guard:(s)=>`Base class physical defense: ${s.defense}. Magic defense: ${s.magicDefense}. Applied automatically when taking damage.`,
  warrior:()=> 'Basic sword attacks automatically alternate through a three-strike sequence.',
  archer:(s)=>`Basic arrows have a ${Math.round(s.missChance*100)}% miss chance. Shooting while moving reduces damage by ${Math.round(s.movingPenalty*100)}%.`,
  mage:()=> 'Basic attacks launch magic projectiles and use the character’s magic attack and intelligence.',
  paladin:()=> 'Every third basic attack automatically strikes with the shield and deals increased damage.',
  assassin:(s,c)=>`Movement speed is ${Math.round((c.speed-1)*100)}% higher, and the base interval between attacks is ${Math.round((1-s.attackIntervalMultiplier)*100)}% shorter.`,
  cannoneer:()=> 'Basic attacks launch real cannon projectiles. Hits respect range and obstacles.'
 },
 es:{
  guard:(s)=>`Defensa física base de clase: ${s.defense}. Defensa mágica: ${s.magicDefense}. Se aplica automáticamente al recibir daño.`,
  warrior:()=> 'Los ataques básicos de espada alternan automáticamente una secuencia de tres golpes.',
  archer:(s)=>`Las flechas básicas tienen un ${Math.round(s.missChance*100)}% de probabilidad de fallar. Disparar en movimiento reduce el daño un ${Math.round(s.movingPenalty*100)}%.`,
  mage:()=> 'Los ataques básicos lanzan proyectiles mágicos y usan el ataque mágico y la inteligencia del personaje.',
  paladin:()=> 'Cada tercer ataque básico golpea automáticamente con el escudo e inflige más daño.',
  assassin:(s,c)=>`La velocidad de movimiento aumenta un ${Math.round((c.speed-1)*100)}% y el intervalo base entre ataques es un ${Math.round((1-s.attackIntervalMultiplier)*100)}% más corto.`,
  cannoneer:()=> 'Los ataques básicos lanzan proyectiles de cañón reales. Los impactos respetan la distancia y los obstáculos.'
 }
};

export function getPassiveSkills(classId,language='ru'){
 const id=Object.hasOwn(CLASSES,classId)?classId:'warrior',lang=Object.hasOwn(NAMES,language)?language:'ru',spec=combatSpec(id),cls=CLASSES[id];
 const entry=(kind,index)=>({id:`passive_${id}_${kind}`,type:'passive',classId:id,level:1,rank:1,maxRank:1,automatic:true,name:NAMES[lang][kind==='guard'?'guard':id],description:DESCRIPTIONS[lang][kind==='guard'?'guard':id](spec,cls),iconSvg:skillIcon({classId:id,index})});
 return [entry('guard',1),entry('style',id==='archer'?3:0)];
}
