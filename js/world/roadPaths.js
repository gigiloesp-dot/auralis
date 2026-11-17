// Keep encounter placement based on its original routes, then add shallow,
// deterministic bends without moving a single camp, resident or portal.
const pointDistance=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,den=dx*dx+dy*dy,t=den?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/den)):0;return Math.hypot(p.x-a.x-dx*t,p.y-a.y-dy*t);};
const roadCache=new WeakMap();
function seed(id){let n=0;for(const c of id)n=(Math.imul(n,31)+c.charCodeAt(0))>>>0;return n/4294967296*Math.PI*2;}
const minDistance=(p,points)=>Math.min(...points.slice(1).map((b,i)=>pointDistance(p,points[i],b)));
function protectedSites(content,width){
 const result=[];
 for(const camp of content.camps||[]){result.push({x:camp.x,y:camp.y,clearance:width/2+65});for(const p of camp.spawns||[])result.push({...p,clearance:width/2+28});}
 for(const p of content.bosses||[])result.push({...p,clearance:width/2+60});
 return result;
}
export function naturalRoadPoints(road,content){
 const points=road.points||[road.from,road.to];if(content.dungeon||road.curved||points.length<2)return points;
 let byRegion=roadCache.get(road);if(!byRegion){byRegion=new WeakMap();roadCache.set(road,byRegion);}const cacheKey=content.camps||content;
 if(byRegion.has(cacheKey))return byRegion.get(cacheKey);
 const sites=protectedSites(content,road.width||70),phase=seed((content.id||'world')+':'+road.id),result=[{...points[0]}];
 for(let index=1;index<points.length;index++){
  const a=points[index-1],b=points[index],dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy),samples=Math.max(2,Math.ceil(length/220));
  if(length<360){result.push({...b});continue;}
  const baseline=[a,b],nearby=sites.filter(p=>pointDistance(p,a,b)<250).map(p=>({...p,min:Math.min(p.clearance,Math.max(0,minDistance(p,baseline)-8))}));
  let curved;
  for(const amplitude of [Math.min(80,length*.085),48,24,0]){
   curved=Array.from({length:samples+1},(_,i)=>{const t=i/samples,bend=Math.sin(Math.PI*t)*(Math.sin(t*Math.PI*3+phase+index)*.7+Math.sin(t*Math.PI*7-phase)*.3)*amplitude;
    return {x:Math.round(Math.max(35,Math.min(content.width-35,a.x+dx*t-dy/length*bend))*100)/100,y:Math.round(Math.max(35,Math.min(content.height-35,a.y+dy*t+dx/length*bend))*100)/100};});
   curved[0]={...a};curved[curved.length-1]={...b};
   if(nearby.every(p=>minDistance(p,curved)>=p.min-1e-6))break;
  }
  result.push(...curved.slice(1));
 }
 byRegion.set(cacheKey,result);return result;
}
export function curveRegionRoads(content){for(const road of content.roads||[]){road.points=naturalRoadPoints(road,content);road.curved=true;}return content;}
