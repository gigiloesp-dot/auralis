import {MONSTER_TYPES} from '../monsters/monsters.js';
import {movementProfile} from '../monsters/movementProfiles.js';
import {regionRoads,distanceToSegment,worldWalkable,riverX} from './chunkGeometry.js';
export const EXPANSION_DENSITY=Object.freeze({forest:60,north:60,desert:96});
export function worldRandom(id){let n=2166136261;for(const c of id)n=Math.imul(n^c.charCodeAt(0),16777619);return ()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
// Small path search only at descriptor construction, never every frame. New
// routes avoid old encounters; original road IDs/points are not touched.
export function expansionRoute(content,from,to){
 const sites=[...content.camps.map(c=>({...c,r:(c.radius||145)+90})),...content.bosses.map(b=>({...b,r:230})),...(content.settlementHouses||[]).map(h=>({...h,r:105}))];
 const clear=(a,b)=>sites.every(p=>distanceToSegment(p,a,b)>p.r);
 if(clear(from,to))return [from,{x:(from.x+to.x)/2,y:(from.y+to.y)/2},to];
 const step=128,key=p=>Math.round(p.x/step)+','+Math.round(p.y/step),start={x:Math.round(from.x/step)*step,y:Math.round(from.y/step)*step};
 const open=[{p:start,g:0,f:distance(start,to)}],known=new Map([[key(start),{p:start,g:0,parent:null}]]);let goal;
 for(let count=0;open.length&&count<12000;count++){
  open.sort((a,b)=>b.f-a.f);const current=open.pop(),k=key(current.p),record=known.get(k);if(current.g!==record.g)continue;
  if(distance(current.p,to)<step*1.6&&clear(current.p,to)){goal=k;break;}
  for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){const p={x:current.p.x+dx*step,y:current.p.y+dy*step};if(p.x<40||p.y<40||p.x>content.width-40||p.y>content.height-40||!clear(current.p,p))continue;const k2=key(p),g=current.g+Math.hypot(dx,dy)*step;if(known.has(k2)&&known.get(k2).g<=g)continue;known.set(k2,{p,g,parent:k});open.push({p,g,f:g+distance(p,to)});}
 }
 if(!goal)throw Error('No safe extension route '+content.id);
 const reversed=[];for(let k=goal;k;k=known.get(k).parent)reversed.push(known.get(k).p);const raw=[from,...reversed.reverse(),to],points=[from];
 for(let i=0;i<raw.length-1;){let next=i+1;for(let j=raw.length-1;j>i+1;j--)if(clear(raw[i],raw[j])){next=j;break;}points.push(raw[next]);i=next;}
 if(points.length===2)points.splice(1,0,{x:(from.x+to.x)/2,y:(from.y+to.y)/2});return points;
}
export function addExpansionRoad(content,id,from,to,width=76){const points=expansionRoute(content,from,to);content.roads=[...content.roads,{id,from,to,width,points,curved:true}];}
export function addTemporaryCamps(content,{count,types,prefix,accept=()=>true,levelDistance}){
 const random=worldRandom(prefix+':positions'),first=content.camps.length,roads=regionRoads(content);
 for(let i=0;i<count;i++){
  let point;for(let tries=0;tries<30000;tries++){
   const p={x:Math.round(450+random()*(content.width-900)),y:Math.round(450+random()*(content.height-900))};
   if(!accept(p)||(content.river!==false&&Math.abs(p.x-riverX(content,p.y))<260)||content.towns.some(t=>distance(p,t)<520)||content.portals.some(t=>distance(p,t)<350)||content.camps.some(c=>distance(p,c)<500)||content.bosses.some(c=>distance(p,c)<360)||(content.landmarks||[]).some(c=>distance(p,c)<300)||(content.futureSettlements||[]).some(c=>distance(p,c)<700)||roads.some(r=>distanceToSegment(p,r.from,r.to)<270))continue;point=p;break;
  }
  if(!point)throw Error('No temporary camp placement '+prefix+'/'+i);
  const id=prefix+'-camp-'+String(i).padStart(3,'0'),type=types[i%types.length],camp={id,region:content.id,type,...point,level:content.minLevel,radius:150,expansion:true,temporaryBestiary:true,spawns:[]};content.camps.push(camp);
  for(let j=0;j<9;j++){const angle=j/9*Math.PI*2+random()*.06,r=100+random()*12;camp.spawns.push({id:id+'-mob-'+j,type,level:content.minLevel,x:Math.round(point.x+Math.cos(angle)*r),y:Math.round(point.y+Math.sin(angle)*r)});}
 }
 const fresh=content.camps.slice(first),maxDistance=levelDistance||Math.max(...fresh.map(c=>distance(c,content.spawn)));
 for(const camp of fresh){camp.level=Math.min(content.maxLevel,content.minLevel+Math.floor(distance(camp,content.spawn)/maxDistance*(content.maxLevel-content.minLevel)));for(const s of camp.spawns){s.level=camp.level;const r=movementProfile(MONSTER_TYPES[s.type]).collisionRadius;if(!worldWalkable(content,s.x,s.y,r))throw Error('Blocked temporary spawn '+s.id);}}
 return fresh;
}
export function appendExpandedTerritories(content,legacySize){
 if(!['forest','north'].includes(content.id))return;
 const north=content.id==='north',start=content.portals.find(p=>p.toRegion===(north?'ancient':'north'));
 const east={x:north?19000:16200,y:north?12600:10800},south={x:start.x,y:north?19600:16400},far={x:north?19500:16800,y:south.y};
 for(const [name,from,to]of [['east',start,east],['east-watch',east,{x:east.x,y:3500}],['south',start,south],['south-west',south,{x:3500,y:south.y}],['far-crossing',east,far],['south-crossing',south,far]])addExpansionRoad(content,content.id+'-extension-route-'+name,{x:from.x,y:from.y},to);
 const places=[{...east,id:content.id+'-extension-watch',names:{ru:'Дальний дозор',en:'Far watch',es:'Guardia lejana'}},{...south,id:content.id+'-extension-refuge',names:{ru:'Южный привал',en:'Southern rest',es:'Descanso del sur'}},{...far,id:content.id+'-extension-outpost',names:{ru:'Заброшенная застава',en:'Abandoned outpost',es:'Puesto abandonado'}}];
 content.landmarks=[...content.landmarks,...places];content.futureSettlements=places.map(p=>({...p,reserved:true}));
 const max=Math.max(...content.camps.map(c=>distance(c,content.spawn))),types=north?['iceWolf','iceBat','snowRaider','snowBear','frostGolem','iceElemental','wraith']:['forestWolf','forestBat','wildBoar','forestRaider','thornSnake','bear','spider','forestOrc','skeleton'];
 addTemporaryCamps(content,{count:EXPANSION_DENSITY[content.id],types,prefix:content.id+'-extension',accept:p=>p.x>legacySize+250||p.y>legacySize+250,levelDistance:max});
}
export function ringGateway(content,toRegion){
 // On an existing road and away from camps/NPCs/houses: no new road can
 // overwrite an old camp to make room for the extra connection.
 for(const road of content.roads.filter(r=>!r.id.includes('extension'))){const points=road.points||[road.from,road.to];for(let i=1;i<points.length;i++){const p=points[i];
  if(content.towns.some(t=>distance(p,t)<400)||content.npcs.some(n=>distance(p,n)<220)||content.portals.some(n=>distance(p,n)<350)||content.camps.flatMap(c=>c.spawns).some(n=>distance(p,n)<330)||content.bosses.some(n=>distance(p,n)<400)||content.settlementHouses.some(n=>distance(p,n)<200))continue;
  const a=points[i-1],d=distance(a,p),back={x:p.x+(a.x-p.x)*170/d,y:p.y+(a.y-p.y)*170/d};if(!worldWalkable(content,p.x,p.y)||!worldWalkable(content,back.x,back.y))continue;
  return {id:content.id+'-'+toRegion,region:content.id,x:p.x,y:p.y,toRegion,toX:1600,toY:1800,safeRadius:210,returnPoint:back};
 }}throw Error('No safe ring gateway '+content.id);
}
