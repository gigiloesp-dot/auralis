import {itemDefinition} from '../equipment/items.js';
import {GENERATED_ITEMS} from '../equipment/catalog.js';

// Equipment probabilities are exact, separate from materials and character luck.
export const NORMAL_EQUIPMENT_RATES=Object.freeze({common:.008,uncommon:.003,rare:.001,epic:.0001,legendary:0});
// Original bases were wolfFang .35 and wolfPelt .20. Luck still modifies only materials.
export const MATERIAL_DROP_RATES=Object.freeze({wolfFang:.175,wolfPelt:.10});
const CLASSES=['warrior','archer','mage','paladin','assassin','cannoneer'];
const SLOTS=['weapon','helmet','chest','gloves','pants','boots','ring','amulet','shield'];
const catalog=Object.entries(GENERATED_ITEMS);
const index=(rng,length)=>Math.min(length-1,Math.max(0,Math.floor(rng()*length)));
const enemyLevel=value=>Math.max(1,Math.min(42,Math.trunc(Number(value)||1)));
const heroClass=hero=>CLASSES.includes(hero?.classId)?hero.classId:'warrior';

// Material rarity distribution is unchanged. Legendary equipment has one source:
// the explicit world-boss group below, never an elite/material shortcut.
export function rollRarity(rng=Math.random){const r=rng();if(r<.01)return 'epic';if(r<.08)return 'rare';if(r<.26)return 'uncommon';return 'common';}
function materials(hero,type,rng){
 const drops=[],luck=Math.max(0,Number(hero?.stats?.luck)||5),bonus=1+Math.max(0,luck-5)*.005;
 if(type==='wolf')for(const [id,rate]of Object.entries(MATERIAL_DROP_RATES))if(rng()<Math.min(1,rate*bonus))drops.push({id,rarity:rollRarity(rng),quantity:1});
 return drops;
}
function equipment(level,rarity,classId,rng,slot){
 const target=enemyLevel(level),minimum=Math.max(1,target-5),maximum=Math.min(42,target+5);
 const optionsFor=slot=>catalog.filter(([,d])=>d.slot===slot&&d.level>=minimum&&d.level<=maximum&&(!d.allowedClasses||d.allowedClasses.includes(classId)));
 let options=optionsFor(slot||SLOTS[index(rng,SLOTS.length)]);
 if(!options.length)options=optionsFor('weapon');
 if(!options.length)return null;
 return {id:options[index(rng,options.length)][0],rarity,quantity:1};
}
function ordinaryEquipment(hero,level,rng){
 const r=rng();let bound=0;
 for(const rarity of ['epic','rare','uncommon','common']){bound+=NORMAL_EQUIPMENT_RATES[rarity];if(r<bound)return equipment(level,rarity,heroClass(hero),rng);}
 return null;
}
export function rollLoot(hero,{type='wolf',level=1}={},rng=Math.random){
 const drops=materials(hero,type,rng),item=ordinaryEquipment(hero,level,rng);if(item)drops.push(item);return drops;
}
export function rollWolfLoot(hero,rng=Math.random){return rollLoot(hero,{type:'wolf',level:hero?.level||1},rng);}

const group=(rarity,chance,min,max=min)=>Object.freeze({rarity,chance,min,max});
const groups=Object.freeze([group('common',.20,3,5),group('uncommon',.03,2,3),group('rare',.007,1,2),group('epic',.001,1)]);
export const BOSS_LOOT_TABLES=Object.freeze({
 mini:Object.freeze({groups}),
 world:Object.freeze({groups:Object.freeze([...groups,group('legendary',.0001,1)])}),
 // Preserve these encounters' existing ordinary check and guaranteed source roll.
 // Newly dropped legendary equipment is now restricted to world bosses.
 dungeon:Object.freeze({epic:.35,legendary:0,slots:Object.freeze(['weapon','helmet','pants','gloves','shield','weapon'])}),
 arena:Object.freeze({epic:0,legendary:0,slots:Object.freeze(['weapon'])})
});
function groupedBossEquipment(hero,level,table,rng){
 // Roll all groups before item selection: generating another group's items cannot
 // consume or cancel an independent rarity check.
 const successful=table.groups.filter(g=>rng()<g.chance),drops=[];
 for(const g of successful){
  const count=g.min+(g.max>g.min?index(rng,g.max-g.min+1):0),classId=heroClass(hero),start=CLASSES.indexOf(classId);
  for(let n=0;n<count;n++){
   const diverse=count>1&&g.rarity!=='common',chosenClass=diverse?CLASSES[(start+n)%CLASSES.length]:classId;
   // Multi-item green/blue groups use real class weapons, making diversity
   // visible and useful instead of labelling identical generic armor differently.
   const item=equipment(level,g.rarity,chosenClass,rng,diverse?'weapon':undefined);if(item)drops.push(item);
  }
 }
 return drops;
}
export function rollMonsterLoot(hero,kind,rng=Math.random){
 const level=enemyLevel(kind.level),type=kind.bossType||'mini';
 if(!kind.boss)return rollLoot(hero,{type:kind.loot,level},rng);
 const table=BOSS_LOOT_TABLES[type]||BOSS_LOOT_TABLES.mini;
 if(table.groups)return [...materials(hero,kind.loot,rng),...groupedBossEquipment(hero,level,table,rng)];
 const drops=rollLoot(hero,{type:kind.loot,level},rng),rarity=rng()<table.epic?'epic':'rare',slot=table.slots[index(rng,table.slots.length)];
 const item=equipment(level,rarity,heroClass(hero),rng,slot);if(item)drops.push(item);return drops;
}
