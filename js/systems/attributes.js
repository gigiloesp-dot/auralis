export const ATTRIBUTE_DEFS=Object.freeze({
 strength:{name:'Сила',desc:'Физический урон и сила критического удара'},
 endurance:{name:'Выносливость',desc:'Максимальное здоровье и защита'},
 agility:{name:'Ловкость',desc:'Скорость атаки и шанс критического удара'},
 luck:{name:'Удача',desc:'Шанс добычи и двойного удара'},
 intelligence:{name:'Интеллект',desc:'Магический урон и сила критического удара'}
});
export const DEFAULT_ATTRIBUTES=Object.freeze({strength:5,endurance:5,agility:5,luck:5,intelligence:5});
export function attributePoints(hero){return Math.max(0,Math.floor(Number(hero?.attributePoints)||0));}
export function maxResources(hero){const endurance=Math.max(0,Number(hero?.stats?.endurance)||5);const intelligence=Math.max(0,Number(hero?.stats?.intelligence)||5);return {maxHp:100+(hero.level-1)*12+Math.max(0,endurance-5)*8,maxMp:100+(hero.level-1)*7+Math.max(0,intelligence-5)*5};}
export function derivedAttributes(hero){const s={...DEFAULT_ATTRIBUTES,...hero.stats};return {physicalAttack:Math.round(s.strength*1.5),magicAttack:Math.round(s.intelligence*1.5),defense:Math.floor(s.endurance*.6),criticalChance:Math.min(50,Math.round(s.agility*.3)),doubleHitChance:Math.min(33,Math.round(s.luck*.2)),lootBonus:Math.round(s.luck*.5),attackSpeedBonus:Math.max(0,s.agility-5)*.004};}
export function allocateAttribute(hero,key){if(!Object.hasOwn(ATTRIBUTE_DEFS,key)||attributePoints(hero)<1)return false;hero.stats??={...DEFAULT_ATTRIBUTES};hero.stats[key]=Math.max(0,Number(hero.stats[key])||0)+1;hero.attributePoints--;const oldHp=hero.maxHp,oldMp=hero.maxMp;const max=maxResources(hero);hero.maxHp=max.maxHp;hero.maxMp=max.maxMp;hero.hp=Math.min(max.maxHp,hero.hp+Math.max(0,max.maxHp-oldHp));hero.mp=Math.min(max.maxMp,hero.mp+Math.max(0,max.maxMp-oldMp));return true;}
