import {REGIONS} from '../world/worldData.js';
import {getRegionContent} from '../world/regionContent.js';
import {buildQuestCatalog} from './questCatalog.js';
import {itemCount,addItem} from '../equipment/items.js';
import {grantXp} from '../systems/progression.js';
export const QUEST_STATES=Object.freeze(['locked','available','active','completed','claimed']);
export const QUEST_TEXT=Object.freeze({
 ru:{talk:'Поговорить с Мирой',name:'Мира · поручения',title:'Безопасная дорога',body:'Волки подходят слишком близко к деревне. Победи пять волков в лесу, затем вернись за наградой.',progress:'Побеждено волков',reward:'Награда: 90 опыта и 3 клыка волка',accept:'Принять задание',claim:'Получить награду',active:'Задание принято. Возвращайся после охоты.',claimed:'Спасибо! Дорога стала безопаснее.',full:'Освободи место в инвентаре для награды.',close:'Закрыть',journal:'Поручение Миры',questsTab:'Поручение',shopTab:'Торговля',gold:'Золото',hpPotion:'Зелье HP',mpPotion:'Зелье MP',buy:'Купить',sell:'Продать',each:'за шт.',emptyShop:'Нет материалов для продажи.',funds:'Недостаточно золота.',limit:'Можно нести до 99 зелий каждого вида.',wolfFang:'Клык волка',wolfPelt:'Волчья шкура',common:'Обычный',uncommon:'Необычный',rare:'Редкий',epic:'Эпический',legendary:'Легендарный'},
 en:{talk:'Talk to Mira',name:'Mira · quests',title:'A safer road',body:'Wolves are getting too close to the village. Defeat five wolves in the forest, then return for your reward.',progress:'Wolves defeated',reward:'Reward: 90 XP and 3 wolf fangs',accept:'Accept quest',claim:'Claim reward',active:'Quest accepted. Return after the hunt.',claimed:'Thank you! The road is safer now.',full:'Make room in your inventory for the reward.',close:'Close',journal:'Mira’s request',questsTab:'Quest',shopTab:'Shop',gold:'Gold',hpPotion:'HP potion',mpPotion:'MP potion',buy:'Buy',sell:'Sell',each:'each',emptyShop:'No materials to sell.',funds:'Not enough gold.',limit:'You can carry up to 99 potions of each kind.',wolfFang:'Wolf fang',wolfPelt:'Wolf pelt',common:'Common',uncommon:'Uncommon',rare:'Rare',epic:'Epic',legendary:'Legendary'},
 es:{talk:'Hablar con Mira',name:'Mira · misiones',title:'Un camino seguro',body:'Los lobos se acercan demasiado al pueblo. Derrota a cinco lobos en el bosque y vuelve por tu recompensa.',progress:'Lobos derrotados',reward:'Recompensa: 90 EXP y 3 colmillos de lobo',accept:'Aceptar misión',claim:'Recibir recompensa',active:'Misión aceptada. Vuelve después de la caza.',claimed:'¡Gracias! El camino es más seguro.',full:'Haz espacio en el inventario para la recompensa.',close:'Cerrar',journal:'El encargo de Mira',questsTab:'Misión',shopTab:'Tienda',gold:'Oro',hpPotion:'Poción de HP',mpPotion:'Poción de MP',buy:'Comprar',sell:'Vender',each:'por unidad',emptyShop:'No tienes materiales para vender.',funds:'No tienes suficiente oro.',limit:'Puedes llevar hasta 99 pociones de cada tipo.',wolfFang:'Colmillo de lobo',wolfPelt:'Piel de lobo',common:'Común',uncommon:'Poco común',rare:'Raro',epic:'Épico',legendary:'Legendario'}
});
// The catalog references actual NPCs, towns and camp identifiers from the world data.
const regions=Object.fromEntries(Object.keys(REGIONS).map(id=>[id,getRegionContent(id)]));
export const QUESTS=Object.freeze(buildQuestCatalog(regions));
export const STARTER_QUESTS=Object.freeze(QUESTS.filter(q=>q.id==='forestWolves'));
const QUEST_INDEX=new Map(QUESTS.map(quest=>[quest.id,quest]));
export const questDefinition=id=>QUEST_INDEX.get(id);
const required=q=>Math.max(1,q.required||1);
const hasItems=(hero,id)=>hero.inventory?.filter(i=>i.id===id).reduce((sum,i)=>sum+itemCount(i),0)||0;
const matchesType=(a,b)=>a===b||({forestWolf:'wolf',wildBoar:'boar',forestRaider:'raider'}[a]||a)===({forestWolf:'wolf',wildBoar:'boar',forestRaider:'raider'}[b]||b);
export const questTitle=(q,lang='ru')=>q.title?.[lang]||q.title?.ru||q.id;
export const questDescription=(q,lang='ru')=>q.description?.[lang]||q.description?.ru||'';
export function questProgress(hero,id='forestWolves'){
 const q=questDefinition(id);if(!q)return null;
 const saved=hero.quests?.[id];
 const progress=q.type==='collect'?Math.min(required(q),hasItems(hero,q.itemId)):Math.max(0,Math.min(required(q),Math.trunc(Number(saved?.progress)||0)));
 const prerequisites=(q.requires||[]).every(key=>hero.quests?.[key]?.state==='claimed');
 let state=saved?.state==='claimed'?'claimed':saved?.state==='active'||saved?.state==='completed'?(progress>=required(q)?'completed':'active'):(hero.level||1)<(q.level||1)||!prerequisites?'locked':'available';
 if(state==='completed'&&q.type==='deliver'&&hasItems(hero,q.itemId)<(q.quantity||1))state='active';
 return {state,progress,required:required(q)};
}
export function questsForNpc(hero,npcId){return QUESTS.filter(q=>q.npcId===npcId||q.turnInNpcId===npcId&&['active','completed'].includes(questProgress(hero,q.id).state));}
export function acceptQuest(hero,id='forestWolves',npcId){
 const q=questDefinition(id);if(!q||npcId&&q.npcId!==npcId||questProgress(hero,id)?.state!=='available')return false;
 hero.quests??={};hero.quests[id]={state:'active',progress:0};return true;
}
export function recordEvent(hero,type,data={}){
 let changed=false;
 for(const q of QUESTS){const p=questProgress(hero,q.id);if(p.state!=='active')continue;
 if(q.region&&data.region&&q.region!==data.region)continue;
 let matched=false;
 if(q.type==='kill'&&type==='kill')matched=matchesType(q.target,data.type)&&(!q.targetCampId||q.targetCampId===data.campId);
 if(q.type==='boss'&&type==='boss')matched=q.target===data.id;
 if(q.type==='talk'&&type==='talk')matched=q.target===data.npcId;
 if(q.type==='deliver'&&type==='talk')matched=q.target===data.npcId&&hasItems(hero,q.itemId)>=(q.quantity||1);
 if(q.type==='dungeon'&&type==='dungeon')matched=q.target===data.id;
 if(q.type==='explore'&&type==='explore')matched=q.target===data.id;
 if(!matched)continue;
 const progress=Math.min(required(q),p.progress+1);hero.quests[q.id]={state:progress>=required(q)?'completed':'active',progress};changed=true;
 }
 return changed;
}
export function recordKill(hero,type,details={}){const data={type,region:hero.region||'forest',...details};const normal=recordEvent(hero,'kill',data);const boss=data.boss?recordEvent(hero,'boss',data):false;return normal||boss;}
export function updateQuestProgress(scene){
 const hero=scene.hero;if(!hero)return false;let changed=false;
 for(const q of QUESTS){const p=questProgress(hero,q.id);if(p.state!=='active'&&p.state!=='completed')continue;
 if(q.type==='collect'){const previous=hero.quests[q.id];if(previous.progress!==p.progress||previous.state!==p.state){hero.quests[q.id]={state:p.state,progress:p.progress};changed=true;}}
 if(q.type==='explore'&&q.location&&hero.region===q.location.region&&Math.hypot(hero.x-q.location.x,hero.y-q.location.y)<=(q.location.radius||130))changed=recordEvent(hero,'explore',{id:q.target,region:hero.region})||changed;
 }
 return changed;
}
export function claimQuest(hero,id='forestWolves',npcId){
 const q=questDefinition(id);if(!q||questProgress(hero,id).state!=='completed'||npcId&&(q.turnInNpcId||q.npcId)!==npcId)return {ok:false,reason:'state'};
 const preview={inventory:(hero.inventory||[]).map(item=>({...item}))};
 if(q.type==='deliver'){
  let left=q.quantity||1;if(hasItems(hero,q.itemId)<left)return {ok:false,reason:'items'};
  for(let i=preview.inventory.length-1;i>=0&&left;i--){const item=preview.inventory[i];if(item.id!==q.itemId)continue;const count=itemCount(item),used=Math.min(count,left);left-=used;if(used===count)preview.inventory.splice(i,1);else item.quantity=count-used;}
 }
 if(q.reward&&!addItem(preview,q.reward))return {ok:false,reason:'full'};
 const gold=Math.max(0,Number(hero.gold)||0)+(q.gold||0);if(!Number.isSafeInteger(gold))return {ok:false,reason:'invalid'};
 hero.inventory=preview.inventory;hero.gold=gold;hero.quests[id]={state:'claimed',progress:required(q)};grantXp(hero,q.xp);
 return {ok:true};
}
