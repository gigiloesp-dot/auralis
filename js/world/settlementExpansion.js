import {regionRoads,distanceToSegment,worldWalkable} from './chunkGeometry.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
// Additions are deterministic and run after legacy encounter generation, so
// bigger clearings cannot reroll an existing monster, road or boss.
export function expandSettlements(content){
 content.towns=content.towns.map(t=>({...t,footprintRadius:235*Math.SQRT2,safeRadius:120*Math.SQRT2,futurePlots:[-50,50].map((dx,i)=>({id:t.id+'-future-slot-'+i,x:t.x+dx,y:t.y+160,role:'reserved'}))}));
 content.settlementHouses=[];
 const spawns=content.camps.flatMap(c=>c.spawns),legacyHouses=[];
 for(const t of content.towns){const offsets=t.id==='forestVillage'?[[-165,-255],[-40,-255],[-165,-130]]:[[-170,-150],[150,-170],[-170,150],[155,145]];for(const [x,y]of offsets)legacyHouses.push({x:t.x+x,y:t.y+y});}
 for(const town of content.towns){let count=0;
  for(let i=0;i<72&&count<2;i++){
   const radius=280+Math.floor(i/24)*20,angle=i%24*Math.PI/12,p={id:town.id+'-extension-house-'+count,townId:town.id,x:Math.round(town.x+Math.cos(angle)*radius),y:Math.round(town.y+Math.sin(angle)*radius)};
   if(p.x<100||p.y<100||p.x>content.width-100||p.y>content.height-100)continue;
   if(content.npcs.some(n=>distance(p,n)<130)||content.portals.some(n=>distance(p,n)<200)||(content.dungeons||[]).some(n=>distance(p,n)<200)||spawns.some(n=>distance(p,n)<150)||content.bosses.some(n=>distance(p,n)<230))continue;
   if([...legacyHouses,...content.settlementHouses].some(n=>distance(p,n)<155)||regionRoads(content).some(r=>distanceToSegment(p,r.from,r.to)<r.width/2+82))continue;
   const end={x:p.x-Math.cos(angle)*90,y:p.y-Math.sin(angle)*90},from={...town.spawn};
   if(spawns.some(n=>distanceToSegment(n,from,end)<70)||!worldWalkable(content,p.x,p.y-14,74))continue;
   let clear=true;for(let step=0;step<=12;step++)if(!worldWalkable(content,from.x+(end.x-from.x)*step/12,from.y+(end.y-from.y)*step/12,16)){clear=false;break;}if(!clear)continue;
   content.settlementHouses.push(p);content.roads=[...content.roads,{id:town.id+'-extension-lane-'+count,from,to:end,width:44,points:[from,{x:(from.x+end.x)/2,y:(from.y+end.y)/2},end],curved:true,secondary:true}];count++;
  }
  if(count!==2)throw Error('Cannot safely expand settlement '+town.id);
 }
 return content;
}
