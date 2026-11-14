import {curveRegionRoads} from './roadPaths.js';
// Persistent descriptors only: these counts do not imply that the runtime has
// switched from its legacy preview to full-region streaming yet.
import {REGIONS} from './worldData.js';
import {MONSTER_TYPES} from '../monsters/monsters.js';
import {getRegionTowns} from './towns.js';
import {getRegionNpcs} from '../npc/npcData.js';
import {DUNGEONS} from '../dungeons/dungeonData.js';
import {movementProfile} from '../monsters/movementProfiles.js';
import {regionRoads,distanceToSegment,worldWalkable} from './chunkGeometry.js';
const CONFIG={forest:{camps:94,monsters:425,types:['forestWolf','forestBat','wildBoar','forestRaider','thornSnake','bear','spider','forestOrc','skeleton']},north:{camps:85,monsters:380,types:['iceWolf','iceBat','snowRaider','snowBear','frostGolem','iceElemental','wraith']},ancient:{camps:75,monsters:340,types:['desertSnake','scarab','ancientSentinel','fallenKnight','arcaneWisp','ancientGargoyle','voidElemental']}};
const PORTALS={forest:[{id:'forest-north',x:11200,y:10800,toRegion:'north',toX:1500,toY:1900}],north:[{id:'north-forest',x:1500,y:1600,toRegion:'forest',toX:11200,toY:10950},{id:'north-ancient',x:12500,y:12600,toRegion:'ancient',toX:1600,toY:1900}],ancient:[{id:'ancient-north',x:1600,y:1600,toRegion:'north',toX:12500,toY:12750}]};
const seedFor=id=>{let n=0;for(const char of id)n=(Math.imul(n,31)+char.charCodeAt(0))>>>0;return ()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};};
const segmentDistance=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,d=dx*dx+dy*dy,t=d?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/d)):0;return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);};
const BOSSES={
 forest:[['forestGuardian','Терновый страж','Thornback guardian','Guardián de espinas'],['spider','Матка ежевики','Briar mother','Madre de las zarzas'],['wildBoar','Старый клык','Old tusk','Colmillo viejo'],['forestWolf','Серая грива','Grey mane','Melena gris'],['forestGuardian','Сердце дубравы','Oakheart','Corazón del roble'],['forestRaider','Король изгнанников','Outcast king','Rey de los exiliados']],
 north:[['iceWolf','Белый оскал','White fang','Colmillo blanco'],['frostGolem','Кулак ледника','Glacier fist','Puño del glaciar'],['skeleton','Жнец инея','Rime reaver','Segador de escarcha'],['snowBear','Страж перевала','Peak watcher','Vigía del paso'],['frostGolem','Король метели','Blizzard king','Rey de la ventisca'],['wraith','Снежный призрак','Snow wraith','Espectro de nieve']],
 ancient:[['ancientSentinel','Бронзовый дозорный','Bronze sentinel','Centinela de bronce'],['scarab','Ткач пепла','Ash weaver','Tejedor de ceniza'],['fallenKnight','Хранитель рун','Rune keeper','Guardián de runas'],['arcaneWisp','Забытый оракул','Lost oracle','Oráculo perdido'],['ancientSentinel','Колосс Ауралиса','Colossus of Auralis','Coloso de Auralis'],['voidElemental','Владыка пустоты','Void sovereign','Soberano del vacío']]
};
const cache=new Map();
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
// Additions use their own random streams so the original encounter, boss and
// road anchors remain stable for saved worlds. Only the wolf standing directly
// on the village's main road is moved, with its persistent ID unchanged.
function expandCamps(content){
 const entrances=DUNGEONS.filter(d=>d.region===content.id),geometry={...content,dungeons:entrances};
 const roads=regionRoads(geometry),mainRoads=roads.filter(r=>!r.secondary);
 const existing=content.camps.flatMap(c=>c.spawns),maxDistance=Math.max(...content.camps.map(c=>distance(c,content.spawn)));
 const starter=content.camps.find(c=>c.id==='forest-starter-wolves');
 if(starter)Object.assign(starter.spawns.find(s=>s.id==='forest-starter-wolf-3'),{x:1400,y:1410});
 const radiusFor=type=>movementProfile(MONSTER_TYPES[type]).collisionRadius;
 for(const camp of content.camps){
  const level=camp===starter?1:Math.min(content.maxLevel,content.minLevel+Math.floor(distance(camp,content.spawn)/maxDistance*(content.maxLevel-content.minLevel)));
  camp.level=level;for(const spawn of camp.spawns)spawn.level=level;
  camp.radius=Math.max(145,Math.ceil(Math.max(...camp.spawns.map(p=>distance(p,camp)))+35));
  const random=seedFor(camp.id+':reinforcements'),radius=radiusFor(camp.type),originalCount=camp.spawns.length;
  for(let i=0;i<5;i++){
   let chosen=null;
   for(let tries=0;tries<6000&&!chosen;tries++){
    const angle=camp===starter?.3+random()*.9:random()*Math.PI*2;
    const spread=camp===starter?160+random()*150:65+Math.sqrt(random())*68;
    const p={x:Math.round(camp.x+Math.cos(angle)*spread),y:Math.round(camp.y+Math.sin(angle)*spread)};
    if(content.towns.some(t=>distance(p,t.spawn||t)<Math.max(260,t.safeRadius+radius+60)))continue;
    if(entrances.some(d=>distance(p,d)<170+radius)||content.portals.some(d=>distance(p,d)<140+radius))continue;
    if(roads.some(r=>distanceToSegment(p,r.from,r.to)<r.width/2+radius+14))continue;
    if(existing.some(s=>distance(p,s)<Math.max(34,radius+radiusFor(s.type)+1)))continue;
    // Reinforcements occupy the far side of the authored starter camp. The
    // first three wolves can still be approached before the extra pack joins.
    if(camp===starter&&(p.x<1580||p.y<1490||starter.spawns.slice(0,3).some(s=>distance(p,s)<250)))continue;
    if(!worldWalkable(geometry,p.x,p.y,radius))continue;
    chosen=p;
   }
   if(!chosen)throw new Error('Unable to expand camp '+camp.id+' at reinforcement '+i);
   const spawn={id:camp.id+'-reinforcement-'+i,type:camp.type,level,...chosen};
   camp.spawns.push(spawn);existing.push(spawn);
  }
  if(camp.spawns.length!==originalCount+5)throw new Error('Incorrect camp reinforcement budget');
 }
 // Check authored spawns as well, rather than only validating new additions.
 for(const spawn of existing){const radius=radiusFor(spawn.type);
  if(mainRoads.some(r=>distanceToSegment(spawn,r.from,r.to)<r.width/2+radius+10)||entrances.some(d=>distance(spawn,d)<160)||!worldWalkable(geometry,spawn.x,spawn.y,radius))throw new Error('Invalid regional spawn placement '+spawn.id);
 }
 return content;
}
export function getRegionContent(id='forest'){
 if(!Object.hasOwn(REGIONS,id))throw new RangeError('Unknown region: '+id);
 if(cache.has(id))return cache.get(id);
 const region=REGIONS[id],config=CONFIG[id],towns=getRegionTowns(id),npcs=getRegionNpcs(id),portals=PORTALS[id].map(p=>({...p,region:id}));
 const roads=[];const anchors=[...towns.map(t=>t.spawn),...portals];
 for(let i=1;i<anchors.length;i++)roads.push({id:id+'-road-'+i,from:anchors[i-1],to:anchors[i],width:90});
 const random=seedFor(id),occupied=[];
 const position=()=>{for(let tries=0;tries<20000;tries++){
  const p={x:Math.round(450+random()*(region.width-900)),y:Math.round(450+random()*(region.height-900))};
  if(towns.some(t=>Math.hypot(p.x-t.x,p.y-t.y)<420)||portals.some(t=>Math.hypot(p.x-t.x,p.y-t.y)<260)||occupied.some(t=>Math.hypot(p.x-t.x,p.y-t.y)<310))continue;
  if(roads.some(r=>segmentDistance(p,r.from,r.to)<180)||Math.abs(p.x-(region.width*.58+Math.sin(p.y/850)*48))<170)continue;
  occupied.push(p);return p;
 }throw new Error('Unable to place region encounter '+id);};
 const camps=[];let remaining=config.monsters;
 if(id==='forest'){
  const points=[[1370,1240],[1450,1320],[1530,1220],[1320,1430],[1600,1450],[1770,1250],[1770,1600],[1430,1660]];
  camps.push({id:'forest-starter-wolves',region:id,type:'forestWolf',level:1,x:1500,y:1400,spawns:points.map(([x,y],i)=>({id:'forest-starter-wolf-'+i,type:'forestWolf',level:1,x,y}))});occupied.push({x:1500,y:1400});remaining-=8;
 }
 while(camps.length<config.camps){
  const index=camps.length,slots=config.camps-index,count=remaining>slots*4?5:4,p=position();
  const fraction=Math.min(1,Math.hypot(p.x-region.spawn.x,p.y-region.spawn.y)/Math.hypot(region.width,region.height));
  const level=Math.min(region.maxLevel,region.minLevel+Math.floor(fraction*(region.maxLevel-region.minLevel+1)));
  const eligible=config.types.filter(type=>MONSTER_TYPES[type].level<=level),type=eligible.find(type=>!camps.some(camp=>camp.type===type))||eligible[index%eligible.length],campId=id+'-camp-'+index;
  const spawns=Array.from({length:count},(_,i)=>{const angle=i/count*Math.PI*2+.2;return {id:campId+'-mob-'+i,type,level,x:Math.round(p.x+Math.cos(angle)*42),y:Math.round(p.y+Math.sin(angle)*42)};});
  camps.push({id:campId,region:id,type,level,...p,spawns});remaining-=count;
 }
 if(remaining!==0)throw new Error('Incorrect monster budget');
 const bosses=BOSSES[id].map(([type,ru,en,es],i)=>{const p=position(),bossType=i<4?'mini':'world',level=Math.min(region.maxLevel,region.minLevel+4+i*3);const themes={forest:['roots','venom','tusk','pack','oakstorm','outcast'],north:['frostRush','iceQuake','rimeVolley','avalanche','whiteout','haunt'],ancient:['bronzeShock','ashVenom','runeSlash','oracleBlink','colossusQuake','voidRift']};return {id:id+'-'+bossType+'-'+i,region:id,type,bossType,bossTheme:themes[id][i],level,...p,patterns:[['slam','volley'],['volley','charge'],['charge','slam']][i%3],names:{ru,en,es}};});
 const landmarks=id==='ancient'?[{id:'fallen-observatory',x:3700,y:4200,names:{ru:'Разрушенная обсерватория',en:'Fallen observatory',es:'Observatorio caído'}},{id:'moon-garden',x:6900,y:8100,names:{ru:'Лунный сад',en:'Moon garden',es:'Jardín lunar'}},{id:'elder-gate',x:10900,y:12400,names:{ru:'Врата предков',en:'Elder gate',es:'Puerta ancestral'}}]:[];
 const content=expandCamps(curveRegionRoads({...region,towns,npcs,camps,bosses,portals,roads,landmarks}));cache.set(id,content);return content;
}
