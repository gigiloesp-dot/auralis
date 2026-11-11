// Deterministic, renderer-independent descriptions. No world-sized geometry cache.
export const CHUNK_SIZE=512;
export const LOAD_DISTANCE=500;
export const UNLOAD_DISTANCE=700;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const distanceToSegment=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,d=dx*dx+dy*dy,t=d?clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/d,0,1):0;return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);};
export function regionRoads(content){return (content.roads||[]).flatMap((r,i)=>{const points=r.points||[r.from,r.to];return points.slice(1).map((b,j)=>({id:r.id||`road-${i}-${j}`,from:points[j],to:b,width:r.width||70}));}).filter(r=>r.from&&r.to);}
export const riverX=(content,y)=>(content.river?.baseX??content.width*.58)+Math.sin(y/(content.river?.wavelength||850))*(content.river?.amplitude??48);
export function riverBlocked(content,x,y,radius=12){if(content.dungeon||content.river===false)return false;const half=content.river?.halfWidth??24;if(Math.abs(x-riverX(content,y))>=half+radius)return false;return !regionRoads(content).some(road=>distanceToSegment({x,y},road.from,road.to)<=Math.max(10,road.width/2-radius));}
export function areaFor(hero,camera){const v=camera?.worldView;if(v&&v.width>0&&v.height>0)return {x:v.x,y:v.y,width:v.width,height:v.height};return {x:hero.x,y:hero.y,width:0,height:0};}
export function chunkDistance(cx,cy,area){const x=cx*CHUNK_SIZE,y=cy*CHUNK_SIZE,dx=Math.max(area.x-x-CHUNK_SIZE,x-area.x-area.width,0),dy=Math.max(area.y-y-CHUNK_SIZE,y-area.y-area.height,0);return Math.hypot(dx,dy);}
export function visibleChunkCoordinates(content,area,radius=LOAD_DISTANCE){const result=[];for(let cy=Math.max(0,Math.floor((area.y-radius)/CHUNK_SIZE));cy<=Math.min(Math.ceil(content.height/CHUNK_SIZE)-1,Math.floor((area.y+area.height+radius)/CHUNK_SIZE));cy++)for(let cx=Math.max(0,Math.floor((area.x-radius)/CHUNK_SIZE));cx<=Math.min(Math.ceil(content.width/CHUNK_SIZE)-1,Math.floor((area.x+area.width+radius)/CHUNK_SIZE));cx++)if(chunkDistance(cx,cy,area)<=radius)result.push({cx,cy,key:`${cx},${cy}`});return result;}
function randomFor(region,cx,cy){let seed=2166136261;for(const char of `${region}:${cx}:${cy}`)seed=Math.imul(seed^char.charCodeAt(0),16777619);return ()=>{seed+=0x6D2B79F5;let t=seed;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
const owned=(p,cx,cy)=>Math.floor(p.x/CHUNK_SIZE)===cx&&Math.floor(p.y/CHUNK_SIZE)===cy;
function reserved(content,p,clearance=0){
 if(p.x<65||p.y<65||p.x>content.width-65||p.y>content.height-65)return true;
 if(regionRoads(content).some(r=>distanceToSegment(p,r.from,r.to)<r.width/2+45+clearance))return true;
 if((content.towns||[]).some(t=>Math.hypot(p.x-(t.x??t.spawn.x),p.y-(t.y??t.spawn.y))<235+clearance))return true;
 if((content.npcs||[]).some(n=>Math.hypot(p.x-n.x,p.y-n.y)<80+clearance))return true;
 if((content.portals||[]).some(n=>Math.hypot(p.x-n.x,p.y-n.y)<120+clearance))return true;
 if((content.camps||[]).some(c=>Math.hypot(p.x-c.x,p.y-c.y)<145+clearance||(c.spawns||[]).some(s=>Math.hypot(p.x-s.x,p.y-s.y)<68+clearance)))return true;
 if((content.bosses||[]).some(b=>Math.hypot(p.x-b.x,p.y-b.y)<190+clearance))return true;
 if(content.river!==false&&Math.abs(p.x-riverX(content,p.y))<80+clearance)return true;
 return false;
}
export function bridgeDescriptors(content){
 if(content.dungeon||content.river===false)return [];
 const bridges=[];
 for(const road of regionRoads(content)){
  const length=Math.hypot(road.to.x-road.from.x,road.to.y-road.from.y),steps=Math.max(1,Math.ceil(length/40));
  for(let i=1;i<=steps;i++){
   const at=t=>({x:road.from.x+(road.to.x-road.from.x)*t,y:road.from.y+(road.to.y-road.from.y)*t});let lo=(i-1)/steps,hi=i/steps,a=at(lo),b=at(hi);
   if((a.x-riverX(content,a.y))*(b.x-riverX(content,b.y))>0)continue;
   for(let n=0;n<10;n++){const m=(lo+hi)/2,p=at(m);if((a.x-riverX(content,a.y))*(p.x-riverX(content,p.y))<=0)hi=m;else{lo=m;a=p;}}
   const p=at((lo+hi)/2);if(!bridges.some(b=>Math.hypot(b.x-p.x,b.y-p.y)<100))bridges.push({...p,kind:'bridge',angle:Math.atan2(road.to.y-road.from.y,road.to.x-road.from.x),width:road.width});
  }
 }
 return bridges;
}
export function describeChunk(content,cx,cy){
 const x=cx*CHUNK_SIZE,y=cy*CHUNK_SIZE,width=Math.max(0,Math.min(CHUNK_SIZE,content.width-x)),height=Math.max(0,Math.min(CHUNK_SIZE,content.height-y)),random=randomFor(content.id||content.region||'forest',cx,cy),decorations=[],obstacles=[];
 if(!content.dungeon){
  const count=content.id==='forest'?20:content.id==='north'?13:11;
  for(let i=0;i<count;i++){
   const p={x:x+random()*width,y:y+random()*height},scale=.75+random()*.45,roll=random();
   if(reserved(content,p,20))continue;
   const kind=content.id==='ancient'?(roll<.24?'ruin':roll<.55?'rock':'cypress'):content.id==='north'?(roll<.25?'rock':'pine'):(roll<.12?'rock':roll<.58?'oak':'pine');
   const r=(kind==='rock'?19:kind==='ruin'?36:22)*scale;
   if(decorations.some(d=>Math.hypot(d.x-p.x,d.y-p.y)<d.r+r+16))continue;
   decorations.push({...p,kind,scale,r});obstacles.push({...p,r});
  }
  for(const town of content.towns||[]){
   const center=town.spawn||town,positions=town.id==='forestVillage'?[{x:865,y:885},{x:990,y:885},{x:865,y:1010}]:[[-170,-150],[150,-170],[-170,150],[155,145]].map(([dx,dy])=>({x:center.x+dx,y:center.y+dy}));
   for(const p of positions){if(!owned(p,cx,cy)||p.x<70||p.y<100||p.x>content.width-70||p.y>content.height-70)continue;
    if((content.npcs||[]).some(n=>Math.hypot(n.x-p.x,n.y-(p.y-14))<100)||(content.portals||[]).some(n=>Math.hypot(n.x-p.x,n.y-p.y)<150)||regionRoads(content).some(r=>distanceToSegment(p,r.from,r.to)<r.width/2+68))continue;
    decorations.push({...p,kind:'house',scale:1,r:55});obstacles.push({x:p.x,y:p.y-14,r:55});
   }
  }
 }
 for(const obstacle of content.obstacles||[])if(obstacle.r&&owned(obstacle,cx,cy))obstacles.push({...obstacle});
 return {key:`${cx},${cy}`,cx,cy,x,y,width,height,decorations,obstacles,npcs:(content.npcs||[]).filter(p=>owned(p,cx,cy)),portals:(content.portals||[]).filter(p=>owned(p,cx,cy)),bridges:bridgeDescriptors(content).filter(p=>owned(p,cx,cy))};
}
export function dungeonFloorContains(content,x,y,radius=12){
 const rects=content.walkableRects||[];
 // Cardinal and diagonal samples reject clipping through room/corridor corners.
 return [[0,0],[radius,0],[-radius,0],[0,radius],[0,-radius],[radius*.707,radius*.707],[-radius*.707,radius*.707],[radius*.707,-radius*.707],[-radius*.707,-radius*.707]].every(([dx,dy])=>rects.some(r=>x+dx>=r.x&&x+dx<=r.x+r.width&&y+dy>=r.y&&y+dy<=r.y+r.height));
}
export function worldWalkable(content,x,y,radius=12){
 if(!Number.isFinite(x)||!Number.isFinite(y)||x<radius||y<radius||x>content.width-radius||y>content.height-radius)return false;
 if(content.dungeon&&!dungeonFloorContains(content,x,y,radius))return false;
 if(riverBlocked(content,x,y,radius))return false;
 for(let cy=Math.max(0,Math.floor((y-radius-60)/CHUNK_SIZE));cy<=Math.min(Math.ceil(content.height/CHUNK_SIZE)-1,Math.floor((y+radius+60)/CHUNK_SIZE));cy++)for(let cx=Math.max(0,Math.floor((x-radius-60)/CHUNK_SIZE));cx<=Math.min(Math.ceil(content.width/CHUNK_SIZE)-1,Math.floor((x+radius+60)/CHUNK_SIZE));cx++)if(describeChunk(content,cx,cy).obstacles.some(o=>Math.hypot(x-o.x,y-o.y)<radius+o.r))return false;
 return true;
}
