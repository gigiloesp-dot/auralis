// Offline, reproducible encounter layout. The shipped client reads lightweight
// descriptors; it never generates the retired470 camps just to replace them.
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {getRelease21RegionContent} from '../js/world/regionContent.js';
import * as quests from '../js/quests/quests.js';
import {MONSTER_TYPES} from '../js/monsters/monsters.js';
import {movementProfile} from '../js/monsters/movementProfiles.js';
import {DUNGEONS} from '../js/dungeons/dungeonData.js';
import {biomeSidePaths} from '../js/world/biomes.js';
import {regionRoads,distanceToSegment,riverX,worldWalkable} from '../js/world/chunkGeometry.js';
const check=process.argv.includes('--check'),output=(file,text)=>{if(check){if(readFileSync(file,'utf8')!==text)throw Error('Non-reproducible layout artifact: '+file);}else writeFileSync(file,text);};
const COUNTS={forest:80,north:76,ancient:45,desert:56},TYPES={forest:['forestWolf','forestBat','wildBoar','forestRaider','thornSnake','bear','spider','forestOrc','skeleton'],north:['iceWolf','iceBat','snowRaider','snowBear','frostGolem','iceElemental','wraith'],ancient:['desertSnake','scarab','ancientSentinel','fallenKnight','arcaneWisp','ancientGargoyle','voidElemental'],desert:['desertSnake','scarab','ancientSentinel','arcaneWisp']};
const prior=quests.LEGACY_QUESTS||quests.QUESTS,world={},aliases={camps:{},monsters:{}},questTargets={},distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),baseType=t=>({wolf:'forestWolf',boar:'wildBoar',raider:'forestRaider'}[t]||t),hash=s=>{let n=2166136261;for(const ch of s)n=Math.imul(n^ch.charCodeAt(0),16777619);return n>>>0;},randomFor=s=>{let n=hash(s);return ()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};};
for(const [id,count]of Object.entries(COUNTS)){
 const old=getRelease21RegionContent(id),c={...old,camps:[],authoredSidePaths:biomeSidePaths(old),dungeons:DUNGEONS.filter(d=>d.region===id),encounterRevision:2},roads=regionRoads(c),random=randomFor(id+':spots-v2'),occupied=[],allocated=new Set();
 if(id==='forest'){const starter=old.camps.find(c=>c.id==='forest-starter-wolves');c.camps.push({...structuredClone(starter),spawns:structuredClone(starter.spawns.slice(0,11)),layoutVersion:2,plannedSpeciesId:'forest-species-000',temporaryBestiary:true});occupied.push(c.camps[0]);}
 for(let index=c.camps.length;index<count;index++){
  let point;for(let attempt=0;attempt<100000;attempt++){
   const p={x:Math.round(650+random()*(c.width-1300)),y:Math.round(650+random()*(c.height-1300))};
   if(occupied.some(q=>distance(p,q)<1400)||c.towns.some(q=>distance(p,q)<(q.footprintRadius||335)+500)||c.portals.some(q=>distance(p,q)<650)||c.dungeons.some(q=>distance(p,q)<650)||c.bosses.some(q=>distance(p,q)<1050)||(c.landmarks||[]).some(q=>distance(p,q)<400)||(c.futureSettlements||[]).some(q=>distance(p,q)<650))continue;
   if(c.river!==false&&Math.abs(p.x-riverX(c,p.y))<250)continue;
   if(roads.some(r=>distanceToSegment(p,r.from,r.to)<r.width/2+285))continue;
   point=p;break;
  }
  if(!point)throw Error('No safe spot '+id+'/'+index);
  const camp={id:id+'-spot-'+String(index).padStart(3,'0'),region:id,...point,radius:210,spawns:[],layoutVersion:2,plannedSpeciesId:id+'-species-'+String(index).padStart(3,'0'),temporaryBestiary:true};c.camps.push(camp);occupied.push(camp);
 }
 const nearest=Math.min(...c.camps.map(p=>distance(p,c.spawn))),farthest=Math.max(...c.camps.map(p=>distance(p,c.spawn)));
 for(const camp of c.camps){camp.level=Math.min(c.maxLevel,c.minLevel+Math.floor((distance(camp,c.spawn)-nearest)/(farthest-nearest)*(c.maxLevel-c.minLevel+1)));const eligible=TYPES[id].filter(t=>MONSTER_TYPES[t].level<=camp.level);camp.type=eligible[hash(camp.id)%eligible.length]||TYPES[id][0];}
 if(id==='forest'){c.camps[0].type='forestWolf';c.camps[0].level=1;allocated.add(c.camps[0].id);}
 for(const q of prior.filter(q=>q.region===id&&q.type==='kill')){
  const type=baseType(q.target),level=Math.max(c.minLevel,Math.min(c.maxLevel,q.level));let camp=c.camps.find(p=>p.type===type&&p.level===level);
  if(!camp){const origin=old.camps.find(p=>p.id===q.targetCampId)||c.spawn;camp=c.camps.filter(p=>!allocated.has(p.id)).sort((a,b)=>Math.abs(a.level-level)-Math.abs(b.level-level)||distance(a,origin)-distance(b,origin))[0];camp.type=type;camp.level=level;}
  allocated.add(camp.id);questTargets[q.id]={region:id,campId:camp.id,type,level:camp.level,x:camp.x,y:camp.y};
 }
 for(const type of TYPES[id])if(!c.camps.some(p=>p.type===type)){const camp=c.camps.filter(p=>!allocated.has(p.id)).sort((a,b)=>Math.abs(a.level-MONSTER_TYPES[type].level)-Math.abs(b.level-MONSTER_TYPES[type].level))[0];if(!camp)throw Error('No base prototype coverage '+type);camp.type=type;allocated.add(camp.id);}
 for(const camp of c.camps){
  if(camp.id==='forest-starter-wolves'){camp.spawns.forEach(p=>{p.plannedSpeciesId=camp.plannedSpeciesId;});continue;}
  const r=randomFor(camp.id+':residents'),radius=movementProfile(MONSTER_TYPES[camp.type]).collisionRadius;
  for(let i=0;i<11;i++){let chosen;for(let n=0;n<10000;n++){const angle=r()*Math.PI*2,spread=55+Math.sqrt(r())*110,p={x:Math.round(camp.x+Math.cos(angle)*spread),y:Math.round(camp.y+Math.sin(angle)*spread)};if(camp.spawns.some(q=>distance(p,q)<radius*2+9))continue;if(!worldWalkable(c,p.x,p.y,radius))continue;chosen=p;break;}if(!chosen)throw Error('Unable to place resident '+camp.id+'/'+i);camp.spawns.push({id:camp.id+'-mob-'+i,type:camp.type,level:camp.level,...chosen,plannedSpeciesId:camp.plannedSpeciesId});}
 }
 const ids=new Set(c.camps.flatMap(p=>p.spawns).map(p=>p.id));
 for(const camp of old.camps){const target=camp.id==='forest-starter-wolves'?c.camps[0]:c.camps.filter(p=>p.type===camp.type).sort((a,b)=>Math.abs(a.level-camp.level)-Math.abs(b.level-camp.level)||distance(a,camp)-distance(b,camp))[0];if(!target)throw Error('Missing legacy camp alias '+camp.id);aliases.camps[id+':'+camp.id]=target.id;for(const s of camp.spawns)aliases.monsters[id+':'+s.id]=id+':'+(ids.has(s.id)?s.id:target.spawns[hash(s.id)%11].id);}
 delete c.dungeons;world[id]=c;console.log(id,c.camps.length,c.camps.reduce((n,p)=>n+p.spawns.length,0));
}
mkdirSync('js/world',{recursive:true});output('js/world/task10Layout.js','// Generated by scripts/generate-task10-layout.mjs; regenerate only for approved placement changes.\nexport const TASK10_LAYOUT='+JSON.stringify(world)+';\n');
output('js/world/campAliases.js','// Immutable release21→257-spot aliases. Bosses/dungeon/loot IDs are not rewritten.\nexport const CAMP_ALIASES='+JSON.stringify(aliases.camps)+';\nexport const MONSTER_ALIASES='+JSON.stringify(aliases.monsters)+';\nexport const LEGACY_QUEST_TARGETS='+JSON.stringify(questTargets)+';\n');
output('js/quests/release21QuestData.js','// Original104 quest IDs,conditions,rewards and descriptions; task10 redirects only replaced objectives.\nexport const RELEASE21_QUESTS='+JSON.stringify(prior)+';\n');
console.log('aliases',Object.keys(aliases.camps).length,Object.keys(aliases.monsters).length,'quests',prior.length,Object.keys(questTargets).length);

if(check)console.log('PASS deterministic layout,aliases and104 original quest artifacts match their generator');
