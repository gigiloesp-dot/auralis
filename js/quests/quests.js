import {addItem} from '../equipment/items.js';
import {grantXp} from '../systems/progression.js';
export const QUEST_STATES=Object.freeze(['locked','available','active','completed','claimed']);
export const STARTER_QUESTS=Object.freeze([{id:'forestWolves',npcId:'mira',type:'kill',target:'wolf',required:5,xp:90,reward:{id:'wolfFang',rarity:'common',quantity:3}}]);
export const QUEST_TEXT=Object.freeze({
 ru:{talk:'Поговорить с Мирой',name:'Мира · поручения',title:'Безопасная дорога',body:'Волки подходят слишком близко к деревне. Победи пять волков в лесу, затем вернись за наградой.',progress:'Побеждено волков',reward:'Награда: 90 опыта и 3 клыка волка',accept:'Принять задание',claim:'Получить награду',active:'Задание принято. Возвращайся после охоты.',claimed:'Спасибо! Дорога стала безопаснее.',full:'Освободи место в инвентаре для награды.',close:'Закрыть',journal:'Поручение Миры',questsTab:'Поручение',shopTab:'Торговля',gold:'Золото',hpPotion:'Зелье HP',mpPotion:'Зелье MP',buy:'Купить',sell:'Продать',each:'за шт.',emptyShop:'Нет материалов для продажи.',funds:'Недостаточно золота.',limit:'Можно нести до 99 зелий каждого вида.',wolfFang:'Клык волка',wolfPelt:'Волчья шкура',common:'Обычный',uncommon:'Необычный',rare:'Редкий',epic:'Эпический',legendary:'Легендарный'},
 en:{talk:'Talk to Mira',name:'Mira · quests',title:'A safer road',body:'Wolves are getting too close to the village. Defeat five wolves in the forest, then return for your reward.',progress:'Wolves defeated',reward:'Reward: 90 XP and 3 wolf fangs',accept:'Accept quest',claim:'Claim reward',active:'Quest accepted. Return after the hunt.',claimed:'Thank you! The road is safer now.',full:'Make room in your inventory for the reward.',close:'Close',journal:'Mira’s request',questsTab:'Quest',shopTab:'Shop',gold:'Gold',hpPotion:'HP potion',mpPotion:'MP potion',buy:'Buy',sell:'Sell',each:'each',emptyShop:'No materials to sell.',funds:'Not enough gold.',limit:'You can carry up to 99 potions of each kind.',wolfFang:'Wolf fang',wolfPelt:'Wolf pelt',common:'Common',uncommon:'Uncommon',rare:'Rare',epic:'Epic',legendary:'Legendary'},
 es:{talk:'Hablar con Mira',name:'Mira · misiones',title:'Un camino seguro',body:'Los lobos se acercan demasiado al pueblo. Derrota a cinco lobos en el bosque y vuelve por tu recompensa.',progress:'Lobos derrotados',reward:'Recompensa: 90 EXP y 3 colmillos de lobo',accept:'Aceptar misión',claim:'Recibir recompensa',active:'Misión aceptada. Vuelve después de la caza.',claimed:'¡Gracias! El camino es más seguro.',full:'Haz espacio en el inventario para la recompensa.',close:'Cerrar',journal:'El encargo de Mira',questsTab:'Misión',shopTab:'Tienda',gold:'Oro',hpPotion:'Poción de HP',mpPotion:'Poción de MP',buy:'Comprar',sell:'Vender',each:'por unidad',emptyShop:'No tienes materiales para vender.',funds:'No tienes suficiente oro.',limit:'Puedes llevar hasta 99 pociones de cada tipo.',wolfFang:'Colmillo de lobo',wolfPelt:'Piel de lobo',common:'Común',uncommon:'Poco común',rare:'Raro',epic:'Épico',legendary:'Legendario'}
});
const definition=id=>STARTER_QUESTS.find(q=>q.id===id);
export function questProgress(hero,id='forestWolves'){
 const q=definition(id);if(!q)return null;
 const saved=hero.quests?.[id];
 const progress=Math.max(0,Math.min(q.required,Math.trunc(Number(saved?.progress)||0)));
 const state=saved?.state==='claimed'?'claimed':saved?.state==='active'||saved?.state==='completed'?(progress>=q.required?'completed':'active'):'available';
 return {state,progress,required:q.required};
}
export function acceptQuest(hero,id='forestWolves'){
 if(questProgress(hero,id)?.state!=='available')return false;
 hero.quests??={};hero.quests[id]={state:'active',progress:0};return true;
}
export function recordKill(hero,type){
 let changed=false;
 for(const q of STARTER_QUESTS){const p=questProgress(hero,q.id);if(q.target!==type||p.state!=='active')continue;
 const progress=p.progress+1;hero.quests[q.id]={state:progress>=q.required?'completed':'active',progress};changed=true;}
 return changed;
}
export function claimQuest(hero,id='forestWolves'){
 const q=definition(id);if(!q||questProgress(hero,id).state!=='completed')return {ok:false,reason:'state'};
 // Preflight on a copy: a partially inserted stack must never duplicate rewards on retry.
 const preview={inventory:(hero.inventory||[]).map(item=>({...item}))};
 if(!addItem(preview,q.reward))return {ok:false,reason:'full'};
 hero.inventory=preview.inventory;hero.quests[id]={state:'claimed',progress:q.required};grantXp(hero,q.xp);
 return {ok:true};
}
