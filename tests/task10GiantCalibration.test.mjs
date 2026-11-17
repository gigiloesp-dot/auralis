import test from 'node:test';import assert from 'node:assert/strict';
import {calibrationHero,simulateGiantDps,giantCalibration,paladinBuildVariants} from '../scripts/measure-stone-giant-dps.mjs';
import {ITEM_DEFS} from '../js/equipment/items.js';
import {canEquip} from '../js/equipment/armor.js';
import {getSkills} from '../js/skills/skillData.js';
const classes=['warrior','archer','mage','paladin','assassin','cannoneer'];
test('outgoing calibration fixtures earn165 attributes and110 skill points,learn five real rank5 skills and equip only compatible unchanged rare level42-or-lower items',()=>{
 const original=JSON.stringify(ITEM_DEFS);
 for(const classId of classes){const h=calibrationHero(classId);assert.equal(h.level,56);assert.equal(h.attributePoints,0);assert.equal(Object.values(h.stats).reduce((sum,n)=>sum+n,0),25+165);assert.equal(h.skillPoints,85);assert.equal(Object.keys(h.learnedSkills).length,5);assert.ok(Object.values(h.learnedSkills).every(n=>n===5));assert.equal(h.skillSlots.length,4);assert.equal(new Set(h.skillSlots).size,4);for(const item of Object.values(h.equipment)){const def=ITEM_DEFS[item.id];assert.ok(def&&def.level<=42&&canEquip(def,h));assert.equal(item.rarity,'rare');}assert.deepEqual(h.potions,{hp:10,mp:5});}
 assert.equal(JSON.stringify(ITEM_DEFS),original);
});
test('seeded real combat is reproducible and restores random/time globals after the isolated dummy run',()=>{
 const random=Math.random,dateNow=Date.now,a=simulateGiantDps('warrior',{durationSeconds:30,seed:123456}),b=simulateGiantDps('warrior',{durationSeconds:30,seed:123456});assert.deepEqual(a,b);assert.equal(Math.random,random);assert.equal(Date.now,dateNow);assert.ok(a.damage>0&&a.basicAttackImpacts>0&&a.scheduledEffects>0);assert.ok(a.criticalHits>0);assert.equal(a.durationSeconds,30);
});
test('all six180-second simulations use real finite mana,real potion and skill cooldowns,projectiles,scheduled impacts and poison rather than a DPS formula',()=>{
 const report=giantCalibration();assert.equal(report.completeBossBalance,false);assert.equal(report.proposal.appliedToRuntime,false);assert.equal(report.results.length,6);assert.equal(report.durationPerHealthPhaseSeconds,180);assert.equal(report.proposal.uptime,.75);assert.equal(report.proposal.hp%1000,0);assert.equal(report.proposal.hpIntervalForAllClassesWithin25To35Minutes.exists,report.proposal.hpIntervalForAllClassesWithin25To35Minutes.lower<=report.proposal.hpIntervalForAllClassesWithin25To35Minutes.upper);
 for(const row of report.results){assert.ok(row.weightedDps>0&&Number.isFinite(row.estimatedTtkMinutes));for(const result of [row.highHealth,row.executeHealth]){const skills=new Map(getSkills(row.classId).map(s=>[s.id,s])),f=result.fixture;assert.equal(result.durationSeconds,180);assert.equal(result.incomingAttackAttempts,0);assert.ok(result.mpPotionsUsed<=5);assert.equal(result.mpPotionsUsed+f.remainingMpPotions,5);assert.ok(f.remainingMp>=0&&f.remainingMp<=f.maxMp);assert.equal(result.mpRegenerated,0,'continuous real combat does not receive out-of-combat regen');let spent=0;const prior=new Map();let previousInput=-Infinity;
   for(const e of result.castTimeline){assert.ok(f.skillSlots.includes(e.id),'no hidden fifth active button');const skill=skills.get(e.id);assert.equal(e.beforeMp-e.afterMp,skill.mana);assert.ok(e.afterMp>=0);if(prior.has(e.id))assert.ok(e.at-prior.get(e.id)>=skill.cooldown*1000-1e-5,e.id+' cooldown');assert.ok(e.at-previousInput>=650-1e-5,'declared controller input policy');prior.set(e.id,e.at);previousInput=e.at;spent+=skill.mana;}
   assert.equal(f.remainingMp,f.initialMp+result.mpPotionsUsed*Math.ceil(f.maxMp*.45)+result.mpRegenerated-spent,'every mana point is accounted for');
   for(let i=0;i<result.potionTimeline.length;i++){const e=result.potionTimeline[i];assert.equal(e.after-e.before,Math.ceil(f.maxMp*.45));if(i)assert.ok(e.at-result.potionTimeline[i-1].at>=3000-1e-5);}
   if(['mage','assassin'].includes(row.classId))assert.ok(result.poisonTicks>0,row.classId+' actual poison');if(['archer','mage','cannoneer'].includes(row.classId))assert.ok(result.projectilesLaunched>0,row.classId+' actual projectile path');if(['warrior','archer','mage','cannoneer'].includes(row.classId))assert.ok(result.scheduledEffects>0,row.classId+' delayed effects');
  }}
});
test('paladin sensitivity retains judgment and four legal slots in strength and165-point hybrid builds without changing the engine',()=>{
 const variants=paladinBuildVariants();assert.equal(variants.length,4);for(const v of variants){assert.ok(v.assignedSkillIndices.includes(0)&&v.assignedSkillIndices.includes(3)&&v.assignedSkillIndices.includes(4));assert.equal(v.assignedSkillIndices.length,4);assert.equal(Object.values(v.allocation).reduce((sum,n)=>sum+n,0),165);assert.ok(v.weightedDps>0);assert.ok(v.highHealth.casts.paladin_4>0,'judgment is actually cast');assert.ok(v.highHealth.mpPotionsUsed<=5);if(v.name.startsWith('hybrid'))assert.deepEqual(v.highHealth.fixture.stats,{strength:60,endurance:60,agility:5,luck:5,intelligence:60});if(v.name.endsWith('heal'))assert.equal(v.highHealth.casts.paladin_2,undefined,'full-health outgoing dummy never fabricates healing demand');}
});
