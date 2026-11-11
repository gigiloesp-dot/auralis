import {addItem} from '../equipment/items.js';
import {grantXp} from '../systems/progression.js';
export const QUEST_STATES=Object.freeze(['locked','available','active','completed','claimed']);
export const STARTER_QUESTS=Object.freeze([{id:'forestWolves',npcId:'mira',type:'kill',target:'wolf',required:5,xp:90,reward:{id:'wolfFang',rarity:'common',quantity:3}}]);
export const QUEST_TEXT=Object.freeze({
 ru:{talk:'Поговорить с Мирой',name:'Мира · поручения',title:'Безопасная дорога',body:'Волки подходят слишком близко к деревне. Победи пять волков в лесу, затем вернись за наградой.',progress:'Побеждено волков',reward:'Награда: 90 опыта и 3 клыка волка',accept:'Принять задание',claim:'Получить награду',active:'Задание принято. Возвращайся после охоты.',claimed:'Спасибо! Дорога стала безопаснее.',full:'Освободи место в инвентаре для награды.',close:'Закрыть',journal:'Поручение Миры'},
 en:{talk:'Talk to Mira',name:'Mira · quests',title:'A safer road',body:'Wolves are getting too close to the village. Defeat five wolves in the forest, then return for your reward.',progress:'Wolves defeated',reward:'Reward: 90 XP and 3 wolf fangs',accept:'Accept quest',claim:'Claim reward',active:'Quest accepted. Return after the hunt.',claimed:'Thank you! The road is safer now.',full:'Make room in your inventory for the reward.',close:'Close',journal:'Mira’s request'},
 es:{talk:'Hablar con Mira',name:'Mira · misiones',title:'Un camino seguro',body:'Los lobos se acercan demasiado al pueblo. Derrota a cinco lobos en el bosque y vuelve por tu recompensa.',progress:'Lobos derrotados',reward:'Recompensa: 90 EXP y 3 colmillos de lobo',accept:'Aceptar misión',claim:'Recibir recompensa',active:'Misión aceptada. Vuelve después de la caza.',claimed:'¡Gracias! El camino es más seguro.',full:'Haz espacio en el inventario para la recompensa.',close:'Cerrar',journal:'El encargo de Mira'}
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
