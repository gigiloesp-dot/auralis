import {skillIcon} from '../assets/skillIcons.js';
import {SKILL_TRANSLATIONS} from '../i18n/skillNames.js';
export const SKILL_DATA=Object.freeze({
 warrior:[['Мощный удар',1,'⚔','Усиленный удар мечом'],['Стойкость',5,'⬡','Повышает защиту'],['Вихрь клинков',12,'✦','Круговой удар'],['Боевой клич',20,'♜','Усиливает атаку'],['Казнь',30,'◆','Сильный завершающий удар']],
 archer:[['Точный выстрел',1,'➶','Прицельный выстрел'],['Ловушка',5,'◇','Останавливает врага'],['Залп',12,'➳','Серия стрел'],['Орлиный глаз',20,'◎','Повышает точность'],['Шторм стрел',30,'✹','Атака по области']],
 mage:[['Огненная искра',1,'✹','Магический снаряд'],['Ледяной щит',5,'❄','Защитная магия'],['Ледяная стрела',12,'✧','Замедляет врага'],['Магический взрыв',20,'✺','Урон по области'],['Метеор',30,'☄','Мощное заклинание']],
 paladin:[['Святой удар',1,'✝','Удар светом'],['Защита веры',5,'⬟','Укрепляет защиту'],['Исцеление',12,'✚','Восстанавливает здоровье'],['Аура стража',20,'☼','Защитная аура'],['Суд света',30,'✦','Сильная атака светом']],
 assassin:[['Удар тени',1,'✥','Быстрый удар'],['Уклонение',5,'◈','Повышает уклонение'],['Ядовитый клинок',12,'☠','Отравляет цель'],['Теневой шаг',20,'➤','Быстрое перемещение'],['Смертельный удар',30,'✴','Мощный удар']],
 cannoneer:[['Заряженный выстрел',1,'✹','Мощный выстрел'],['Броня механика',5,'⬡','Укрепляет защиту'],['Картечь',12,'✷','Выстрел по области'],['Пороховой заряд',20,'◉','Усиливает атаку'],['Большой взрыв',30,'✺','Мощный взрыв']]
});
export const getSkills=(classId,language='ru')=>(SKILL_DATA[classId]||SKILL_DATA.warrior).map(([name,level,icon,description],index)=>({id:classId+'_'+index,name:SKILL_TRANSLATIONS[language]?.[classId]?.[index]?.[0]||name,level,icon,iconSvg:skillIcon({classId,index}),description:SKILL_TRANSLATIONS[language]?.[classId]?.[index]?.[1]||description,index,mana:8+index*7,cooldown:Math.max(3,5+index*2),power:Math.round(120+index*30)}));
export function skillRank(hero,id){return Math.max(0,Math.floor(Number(hero.learnedSkills?.[id])||0));}
export function learnSkill(hero,id){const skill=getSkills(hero.classId).find(s=>s.id===id);if(!skill||hero.level<skill.level||(hero.skillPoints||0)<1||skillRank(hero,id)>=5)return false;hero.learnedSkills??={};hero.learnedSkills[id]=skillRank(hero,id)+1;hero.skillPoints--;return true;}
