#!/usr/bin/env node
// Read-only audit of the immutable original257 scope, even after append-only growth.
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {getRegionContent} from '../js/world/regionContent.js';
import {monsterKind} from '../js/monsters/monsters.js';
import {movementProfile} from '../js/monsters/movementProfiles.js';
import {rollMonsterLoot,NORMAL_EQUIPMENT_RATES,MATERIAL_DROP_RATES} from '../js/monsters/loot.js';
import {itemDefinition} from '../js/equipment/items.js';
const baselineBytes=readFileSync(new URL('../docs/qa/aur203/task10-baseline.json',import.meta.url));
const baseline=JSON.parse(baselineBytes);
if(createHash('sha256').update(baselineBytes).digest('hex')!=='3441745cd6743e6ad21bcd024323b9ab2fb746124ac2502b8ac2320fa79ee338')throw Error('Original257 fixture changed');
const tally=values=>Object.fromEntries([...values.reduce((map,value)=>map.set(value,(map.get(value)||0)+1),new Map())].sort((a,b)=>b[1]-a[1]||String(a[0]).localeCompare(String(b[0]))));
const webImplemented=readFileSync(new URL('../js/monsters/movementProfiles.js',import.meta.url),'utf8').includes("state.ability==='web'");
const implementedSpecials=new Set(['pounce','charge','dive','burrow','stomp','roots','frost','cleave','blink','fan','venom','haunt','shot']);if(webImplemented)implementedSpecials.add('web');
const hero={classId:'warrior',level:1,stats:{luck:5}};
const rows=[];
for(const [region,previous] of Object.entries(baseline.regions)){
 const runtime=getRegionContent(region),byId=new Map(runtime.camps.map(camp=>[camp.id,camp]));
 for(const frozenCamp of previous.camps){
  const camp=byId.get(frozenCamp.id);if(!camp)throw Error('Missing original camp '+frozenCamp.id);
  const spawn=camp.spawns[0],kind=monsterKind(spawn),profile=movementProfile(kind),abilities=profile.abilityPattern||[profile.ability];
  const materialProbe=rollMonsterLoot(hero,kind,()=>0).filter(item=>!itemDefinition(item)?.slot);
  const tacticalConfig={movement:profile.movement,locomotion:profile.locomotion,abilities,speed:kind.speed,preferredDistance:profile.preferredDistance||0,detection:Math.max(190,profile.range||0),cooldown:profile.cooldown,windup:profile.windup,range:profile.range,radius:profile.radius,multiplier:profile.multiplier,status:profile.status||null,projectileMagic:profile.projectileMagic??null,projectileStatus:profile.projectileStatus||null};
  rows.push({region,campId:camp.id,speciesId:kind.speciesId,x:camp.x,y:camp.y,level:kind.level,baseType:spawn.type,movementProfile:kind.movementProfile,tacticalConfig,abilityPattern:abilities,abilityPatternKey:abilities.join('→'),materialTable:kind.loot,materialProbeAtAllSuccessfulRolls:materialProbe.map(item=>item.id),hp:kind.hp,attack:kind.attack,defense:kind.defense,magicDefense:kind.magicDefense,xp:kind.xp,gold:kind.gold,respawnMs:kind.respawnMs});
 }
}
if(rows.length!==257||new Set(rows.map(row=>row.speciesId)).size!==257)throw Error('Expected exactly257 distinct original species');
const nearest=rows.map(row=>{
 const other=rows.filter(candidate=>candidate.region===row.region&&candidate!==row).sort((a,b)=>Math.hypot(row.x-a.x,row.y-a.y)-Math.hypot(row.x-b.x,row.y-b.y))[0];
 return {speciesId:row.speciesId,nearest:other.speciesId,distance:Math.round(Math.hypot(row.x-other.x,row.y-other.y)),sameMovementProfile:row.movementProfile===other.movementProfile,sameAbilityPattern:row.abilityPatternKey===other.abilityPatternKey,sameTacticalConfig:JSON.stringify(row.tacticalConfig)===JSON.stringify(other.tacticalConfig)};
});
const profileSummary=Object.fromEntries(Object.keys(baseline.regions).map(region=>{const subset=rows.filter(row=>row.region===region);return[region,{species:subset.length,movementProfiles:tally(subset.map(row=>row.movementProfile)),abilityPatterns:tally(subset.map(row=>row.abilityPatternKey)),uniqueTacticalConfigs:new Set(subset.map(row=>JSON.stringify(row.tacticalConfig))).size,materialProducingSpecies:subset.filter(row=>row.materialProbeAtAllSuccessfulRolls.length).length}];}));
const report={schemaVersion:1,scope:'Original257 species only; static source inspection and pure runtime calls, not browser or physical-device acceptance',sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),auditedModuleSHA256:Object.fromEntries(['monsters/speciesRuntime.js','monsters/movementProfiles.js','monsters/monsterBehavior.js','monsters/monsters.js','monsters/loot.js','monsters/MonsterSystem.js'].map(file=>[file,createHash('sha256').update(readFileSync(new URL('../js/'+file,import.meta.url))).digest('hex')])),workingTreeAudit:true,baselineSHA256:createHash('sha256').update(baselineBytes).digest('hex'),counts:{species:rows.length,movementProfiles:new Set(rows.map(row=>row.movementProfile)).size,abilityPatterns:new Set(rows.map(row=>row.abilityPatternKey)).size,uniqueTacticalConfigs:new Set(rows.map(row=>JSON.stringify(row.tacticalConfig))).size,multipleAbilitySpecies:rows.filter(row=>row.abilityPattern.length>1).length,singleAbilitySpecies:rows.filter(row=>row.abilityPattern.length===1).length,materialProducingSpecies:rows.filter(row=>row.materialProbeAtAllSuccessfulRolls.length).length,nearestNeighborSameAbilityPattern:nearest.filter(row=>row.sameAbilityPattern).length,nearestNeighborSameMovementProfile:nearest.filter(row=>row.sameMovementProfile).length,nearestNeighborSameTacticalConfig:nearest.filter(row=>row.sameTacticalConfig).length},regions:profileSummary,abilities:tally(rows.flatMap(row=>row.abilityPattern)),genericFallbackAbilityLabels:[...new Set(rows.flatMap(row=>row.abilityPattern).filter(ability=>!implementedSpecials.has(ability)))].sort(),materialTables:tally(rows.map(row=>row.materialTable)),equipmentRates:NORMAL_EQUIPMENT_RATES,materialRates:MATERIAL_DROP_RATES,capabilities:{rangedDistanceKiting:true,poisonDamageOverTime:true,slow:true,telegraphedAOE:true,groundDash:true,flightObstacleFiltering:true,boundedBlink:true,homeLeash:true,idlePatrol:true,packCoordination:false,lowHealthFlee:false,ordinaryDefensiveGuard:false,monsterInflictedStun:false,dedicatedWebMechanic:webImplemented},nearestNeighbors:nearest,species:rows};
const destination=new URL('../docs/qa/aur203/behavior-baseline.json',import.meta.url);writeFileSync(destination,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({sourceCommit:report.sourceCommit,counts:report.counts,abilities:report.abilities,genericFallbackAbilityLabels:report.genericFallbackAbilityLabels,regions:report.regions,materialTables:report.materialTables},null,2));
