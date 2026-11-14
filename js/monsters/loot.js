import {itemDefinition} from '../equipment/items.js';
import {equipmentForLevel} from '../equipment/catalog.js';
const RATES=Object.freeze({common:.15,uncommon:.04,rare:.01,epic:.001});
export function rollRarity(rng=Math.random,elite=false){const r=rng();if(elite&&r<.001)return 'legendary';if(r<.01)return 'epic';if(r<.08)return 'rare';if(r<.26)return 'uncommon';return 'common';}
export function rollLoot(hero,{type='wolf',elite=false,boss=false,level=1}={},rng=Math.random){
 const drops=[],luck=Math.max(0,Number(hero?.stats?.luck)||5),bonus=1+Math.max(0,luck-5)*.005;
 const add=(id,rarity='common',quantity=1)=>{if(itemDefinition({id}))drops.push({id,rarity,quantity});};
 if(type==='wolf'){if(rng()<Math.min(1,.35*bonus))add('wolfFang',rollRarity(rng));if(rng()<Math.min(1,.2*bonus))add('wolfPelt',rollRarity(rng));}
 // Normal monsters: 15% common, 4% uncommon, 1% rare, 0.1% epic. Never legendary.
 const roll=rng()/bonus;
 let rarity=null;
 if(roll<RATES.epic)rarity='epic';
 else if(roll<RATES.epic+RATES.rare)rarity='rare';
 else if(roll<RATES.epic+RATES.rare+RATES.uncommon)rarity='uncommon';
 else if(roll<RATES.epic+RATES.rare+RATES.uncommon+RATES.common)rarity='common';
 if(rarity){
  const slots=['weapon','helmet','chest','gloves','pants','boots','ring','amulet','shield'];
  const slot=slots[Math.floor(rng()*slots.length)];
  const options=equipmentForLevel(level,slot,hero.classId);
  if(options.length){const tierOptions=options.slice(0,Math.min(3,options.length));add(tierOptions[Math.floor(rng()*tierOptions.length)],rarity);}
 }
 if(boss&&rng()<.12*bonus){const choices=equipmentForLevel(level,'weapon',hero.classId);if(choices.length)add(choices[0],elite&&rng()<.03?'legendary':'epic');}
 return drops;
}
export function rollWolfLoot(hero,rng=Math.random){return rollLoot(hero,{type:'wolf',level:hero.level||1},rng);}

// Boss rewards use source-specific rarity and slot tables. High-level world and
// dungeon encounters can supply legendary gear; ordinary kills never enter here.
export const BOSS_LOOT_TABLES=Object.freeze({
 mini:Object.freeze({epic:.10,legendary:0,slots:['weapon','chest','boots','weapon']}),
 world:Object.freeze({epic:1,legendary:.10,slots:['weapon','ring','amulet','chest','weapon']}),
 dungeon:Object.freeze({epic:.35,legendary:.05,slots:['weapon','helmet','pants','gloves','shield','weapon']}),
 arena:Object.freeze({epic:0,legendary:0,slots:['weapon']})
});
export function rollMonsterLoot(hero,kind,rng=Math.random){
 const level=Math.max(1,Math.min(hero.level||1,kind.level||1));
 const drops=rollLoot(hero,{type:kind.loot,level},rng);
 if(!kind.boss)return drops;
 const table=BOSS_LOOT_TABLES[kind.bossType]||BOSS_LOOT_TABLES.mini;
 const roll=rng(),legendary=level>=35&&roll<table.legendary;
 const rarity=legendary?'legendary':roll<table.epic?'epic':'rare';
 const slot=table.slots[Math.min(table.slots.length-1,Math.floor(rng()*table.slots.length))];
 let options=equipmentForLevel(level,slot,hero.classId).filter(id=>{const d=itemDefinition({id});return !d.allowedClasses||d.allowedClasses.includes(hero.classId);});
 if(!options.length)options=equipmentForLevel(level,'weapon',hero.classId);
 if(options.length)drops.push({id:options[0],rarity,quantity:1});
 return drops;
}
