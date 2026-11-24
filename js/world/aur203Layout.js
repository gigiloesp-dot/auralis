// Offline additive placement preparation only. No runtime module imports this
// builder: a complete species/AI/loot record must exist before activation.
import {regionRoads,distanceToSegment,riverX,worldWalkable,describeChunk,CHUNK_SIZE} from './chunkGeometry.js';
import {lineClear} from '../combat/geometry.js';
import {climateAt} from './climate.js';
import {MONSTER_LEASH_RADIUS} from '../monsters/monsterBehavior.js';
export const AUR203_REGIONS=Object.freeze({
 forest:Object.freeze({first:80,count:17,total:97}),
 north:Object.freeze({first:76,count:18,total:94}),
 ancient:Object.freeze({first:45,count:17,total:62}),
 desert:Object.freeze({first:56,count:32,total:88})
});
export const AUR203_PLACEMENT=Object.freeze({revision:1,residents:11,collisionRadius:24,residentSpread:165,campRadius:210,minCenterDistance:1400,maxAttemptsPerCamp:100000,patrolProbeRadius:56});
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function randomFor(id){let n=2166136261;for(const c of id)n=Math.imul(n^c.charCodeAt(0),16777619);return ()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
const envelope=camp=>Math.max(0,...(camp.spawns||[]).map(s=>distance(s,camp)))+MONSTER_LEASH_RADIUS;

// Full current runtime content and all current dungeon descriptors are explicit
// inputs, keeping this deterministic and independently testable. No mutation,
// hidden scene/cache ownership, elapsed-time seeds, or old-layout regeneration.
export function buildAur203Region(content,dungeons,{maxAttemptsPerCamp=AUR203_PLACEMENT.maxAttemptsPerCamp}={}){
 const region=content.id,config=AUR203_REGIONS[region],p=AUR203_PLACEMENT;
 if(!config)throw new RangeError('Unknown AUR-203 region: '+region);
 if(!Array.isArray(dungeons))throw new TypeError('Current dungeon descriptors are required');
 if(!Number.isInteger(maxAttemptsPerCamp)||maxAttemptsPerCamp<1||maxAttemptsPerCamp>1000000)throw new RangeError('Invalid bounded placement attempt budget');
 if(content.camps.length!==config.first)throw Error('AUR-203 requires the unchanged Task10 baseline for '+region);
 const geometry={...content,dungeons:dungeons.filter(d=>d.region===region)},roads=regionRoads(geometry),camps=[],attempts=[],occupied=content.camps.map(c=>({camp:c,reach:envelope(c)}));
 const chunks=new Map();
 const patrolSegmentClear=(from,to)=>{
  const obstacles=[],margin=p.collisionRadius+60;
  for(let cy=Math.max(0,Math.floor((Math.min(from.y,to.y)-margin)/CHUNK_SIZE));cy<=Math.min(Math.ceil(content.height/CHUNK_SIZE)-1,Math.floor((Math.max(from.y,to.y)+margin)/CHUNK_SIZE));cy++)for(let cx=Math.max(0,Math.floor((Math.min(from.x,to.x)-margin)/CHUNK_SIZE));cx<=Math.min(Math.ceil(content.width/CHUNK_SIZE)-1,Math.floor((Math.max(from.x,to.x)+margin)/CHUNK_SIZE));cx++){
   const key=cx+','+cy;if(!chunks.has(key))chunks.set(key,describeChunk(geometry,cx,cy).obstacles);obstacles.push(...chunks.get(key));
  }
  return lineClear(from,to,obstacles,p.collisionRadius);
 };
 const pointClear=point=>{
  if(roads.some(r=>distanceToSegment(point,r.from,r.to)<=r.width/2+p.collisionRadius+12))return false;
  if((content.towns||[]).some(t=>distance(point,t)<t.safeRadius+p.collisionRadius+25))return false;
  if((content.portals||[]).some(t=>distance(point,t)<140+p.collisionRadius))return false;
  if((content.receivers||[]).some(t=>distance(point,t)<180+p.collisionRadius))return false;
  if(geometry.dungeons.some(t=>distance(point,t)<160+p.collisionRadius))return false;
  if((content.npcs||[]).some(t=>distance(point,t)<100+p.collisionRadius))return false;
  return worldWalkable(geometry,point.x,point.y,p.collisionRadius);
 };
 const centerClear=point=>{
  const reach=p.residentSpread+MONSTER_LEASH_RADIUS;
  if(occupied.some(({camp,reach:other})=>distance(point,camp)<Math.max(p.minCenterDistance,reach+other+31)))return false;
  if((content.towns||[]).some(t=>distance(point,t)<(t.footprintRadius||335)+500))return false;
  if((content.portals||[]).some(t=>distance(point,t)<650)||(content.receivers||[]).some(t=>distance(point,t)<650))return false;
  if(geometry.dungeons.some(t=>distance(point,t)<650)||(content.bosses||[]).some(t=>distance(point,t)<1050))return false;
  if((content.npcs||[]).some(t=>distance(point,t)<450)||(content.landmarks||[]).some(t=>distance(point,t)<400)||(content.futureSettlements||[]).some(t=>distance(point,t)<650))return false;
  if(content.river!==false&&Math.abs(point.x-riverX(content,point.y))<250)return false;
  if(roads.some(r=>distanceToSegment(point,r.from,r.to)<r.width/2+285))return false;
  return pointClear(point);
 };
 const spawnCandidates=(center,campId)=>{
  const random=randomFor(campId+':residents'),spawns=[];
  for(let index=0;index<p.residents;index++){
   let chosen;
   for(let attempt=0;attempt<2000;attempt++){
    const angle=random()*Math.PI*2,spread=55+Math.sqrt(random())*110;
    const point={x:Math.round(center.x+Math.cos(angle)*spread),y:Math.round(center.y+Math.sin(angle)*spread)};
    if(spawns.some(s=>distance(s,point)<p.collisionRadius*2+9)||!pointClear(point))continue;
    // Existing patrol steering checks actual obstacles on every step. Prove at
    // least two short, connected patrol alternatives at generation time too.
    let choices=0;
    for(let d=0;d<8;d++){
     const a=d*Math.PI/4,offset={x:Math.cos(a)*p.patrolProbeRadius,y:Math.sin(a)*p.patrolProbeRadius};
     const target={x:point.x+offset.x,y:point.y+offset.y};
     if(distance(target,center)>p.campRadius-8)continue;
     if(pointClear(target)&&pointClear({x:point.x+offset.x*.5,y:point.y+offset.y*.5})&&patrolSegmentClear(point,target))choices++;
     if(choices>=2)break;
    }
    if(choices>=2){chosen=point;break;}
   }
   if(!chosen)return null;
   spawns.push({id:campId+'-mob-'+index,...chosen});
  }
  return spawns;
 };
 for(let offset=0;offset<config.count;offset++){
  const index=config.first+offset,campId=region+'-spot-'+String(index).padStart(3,'0'),speciesId=region+'-species-'+String(index).padStart(3,'0'),random=randomFor(campId+':aur203-layout-v1');
  let chosen;
  for(let attempt=1;attempt<=maxAttemptsPerCamp;attempt++){
   const point={x:Math.round(650+random()*(content.width-1300)),y:Math.round(650+random()*(content.height-1300))};
   if(!centerClear(point))continue;
   const spawns=spawnCandidates(point,campId);if(!spawns)continue;
   const longest=Math.max(...[{x:0,y:0},{x:content.width,y:0},{x:0,y:content.height},{x:content.width,y:content.height}].map(corner=>distance(corner,content.spawn)));
   const fraction=Math.min(1,distance(point,content.spawn)/longest),level=Math.min(content.maxLevel,content.minLevel+Math.floor(fraction*(content.maxLevel-content.minLevel+1)));
   chosen={id:campId,region,...point,radius:p.campRadius,level,plannedSpeciesId:speciesId,biome:climateAt(content,point.x,point.y)?.id||region,layoutVersion:2,placementRevision:p.revision,spawns:spawns.map(s=>({...s,level,plannedSpeciesId:speciesId}))};
   attempts.push(attempt);break;
  }
  if(!chosen)throw Error('No safe additive AUR-203 placement for '+campId+' after '+maxAttemptsPerCamp+' attempts');
  camps.push(chosen);occupied.push({camp:chosen,reach:envelope(chosen)});
 }
 return {region,revision:p.revision,baselineCount:config.first,camps,diagnostics:{attempts,totalAttempts:attempts.reduce((a,b)=>a+b,0),residents:camps.reduce((n,c)=>n+c.spawns.length,0),collisionRadius:p.collisionRadius,runtimeIntegrated:false}};
}
