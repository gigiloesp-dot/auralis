// World-space circle collision, shared by targeting, projectiles and movement.
export function segmentDistanceSquared(a,b,p){
 const dx=b.x-a.x,dy=b.y-a.y,length=dx*dx+dy*dy;
 const t=length?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/length)):0;
 return (a.x+dx*t-p.x)**2+(a.y+dy*t-p.y)**2;
}
export function lineClear(a,b,obstacles=[],radius=0){return !obstacles.some(o=>segmentDistanceSquared(a,b,o)<((o.r||0)+radius)**2);}
export function walkable(point,obstacles=[],radius=12){return !obstacles.some(o=>Math.hypot(point.x-o.x,point.y-o.y)<(o.r||0)+radius);}
export function moveWithCollision(entity,tx,ty,distance,obstacles=[],radius=12,allowed=()=>true){
 const dx=tx-entity.x,dy=ty-entity.y,length=Math.hypot(dx,dy);if(!length)return;
 const steps=Math.ceil(Math.min(length,distance)/4),step=Math.min(length,distance)/Math.max(1,steps);
 for(let i=0;i<steps;i++){
  const x=entity.x+dx/length*step,y=entity.y+dy/length*step;
  if(allowed(x,y)&&walkable({x,y},obstacles,radius)){entity.x=x;entity.y=y;}
  else{if(allowed(x,entity.y)&&walkable({x,y:entity.y},obstacles,radius))entity.x=x;if(allowed(entity.x,y)&&walkable({x:entity.x,y},obstacles,radius))entity.y=y;}
 }
}
