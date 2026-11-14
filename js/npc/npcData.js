import {TOWNS} from '../world/towns.js';
export const NPC_ROLES=Object.freeze(['merchant','questGiver','storage','resident','specialMerchant']);
const npc=(id,townId,dx,dy,roles,names,minLevel,maxLevel)=>{
 const town=TOWNS[townId];
 return Object.freeze({id,townId,region:town.region,x:town.x+dx,y:town.y+dy,name:names.ru,names:Object.freeze(names),role:roles[0],roles:Object.freeze(roles),level:minLevel,minLevel,maxLevel});
};
export const NPCS=Object.freeze([
 npc('mira','forestVillage',-95,-60,['merchant','questGiver'],{ru:'Мира',en:'Mira',es:'Mira'},1,5),
 npc('borin','forestVillage',60,-140,['storage'],{ru:'Борин',en:'Borin',es:'Borin'},1,5),
 npc('aldric','forestVillage',-50,60,['questGiver'],{ru:'Алдрик',en:'Aldric',es:'Aldric'},1,5),
 npc('elia','forestVillage',120,25,['resident'],{ru:'Элия',en:'Elia',es:'Elia'},1,5),
 npc('tera','forestVillage',-90,50,['merchant'],{ru:'Тера',en:'Tera',es:'Tera'},1,8),
 npc('sella','riverhaven',-100,-45,['merchant'],{ru:'Селла',en:'Sella',es:'Sella'},8,18),
 npc('oren','riverhaven',85,-60,['questGiver'],{ru:'Орен',en:'Oren',es:'Oren'},8,18),
 npc('tovis','riverhaven',15,85,['storage'],{ru:'Товис',en:'Tovis',es:'Tovis'},8,18),
 npc('ronan','oakwatch',-90,-55,['specialMerchant'],{ru:'Ронан',en:'Ronan',es:'Ronan'},18,25),
 npc('lyra','oakwatch',80,-50,['questGiver'],{ru:'Лира',en:'Lyra',es:'Lira'},18,25),
 npc('bram','oakwatch',0,85,['resident'],{ru:'Брам',en:'Bram',es:'Bram'},18,25),
 npc('freya','frostford',-90,-50,['merchant','questGiver'],{ru:'Фрейя',en:'Freya',es:'Freya'},22,29),
 npc('gunnar','frostford',85,-65,['storage'],{ru:'Гуннар',en:'Gunnar',es:'Gunnar'},22,29),
 npc('ysra','frostford',10,90,['resident'],{ru:'Исра',en:'Ysra',es:'Ysra'},22,29),
 npc('torvin','highpass',-100,-45,['specialMerchant'],{ru:'Торвин',en:'Torvin',es:'Torvin'},29,38),
 npc('ida','highpass',85,-55,['questGiver'],{ru:'Ида',en:'Ida',es:'Ida'},29,38),
 npc('skeld','highpass',10,90,['storage'],{ru:'Скельд',en:'Skeld',es:'Skeld'},29,38),
 npc('aster','dawncamp',-80,-40,['merchant','questGiver'],{ru:'Астер',en:'Aster',es:'Aster'},35,39),
 npc('sera','dawncamp',85,20,['storage'],{ru:'Сера',en:'Sera',es:'Sera'},35,39),
 npc('orion','elderSanctum',-80,-45,['specialMerchant'],{ru:'Орион',en:'Orion',es:'Orión'},39,42),
 npc('nyx','elderSanctum',85,25,['questGiver'],{ru:'Никс',en:'Nyx',es:'Nyx'},39,42)
]);
export const STARTER_NPCS=Object.freeze(NPCS.filter(npc=>npc.townId==='forestVillage'));
export const getRegionNpcs=region=>NPCS.filter(npc=>npc.region===region);
