import {addItem} from '../equipment/items.js';
import {equipmentForLevel} from '../equipment/catalog.js';
const RATES=Object.freeze({common:.15,uncommon:.04,rare:.01,epic:.001});
export function rollRarity(rng=Math.random,elite=false){const r=rng();if(elite&&r<.001)return 'legendary';if(r<.01)return 'epic';if(r<.08)return 'rare';if(r<.26)return 'uncommon';return 'common';}
export function rollLoot(hero,{type='wolf',elite=false,boss=false,level=1}={},rng=Math.random){
 const drops=[],luck=Math.max(0,Number(hero?.stats?.luck)||5),bonus=1+Math.max(0,luck-5)*.005;
 const add=(id,rarity='common',quantity=1)=>{const item={id,rarity,quantity};if(addItem(hero,item))drops.push(item);};
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
