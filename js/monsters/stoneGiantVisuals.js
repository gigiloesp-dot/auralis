// Telegraph geometry uses the same persistent world units as the encounter.
// Surface projection keeps warnings attached to the desert ground,not the HUD.
const polar=(g,r,a)=>({x:g.x+Math.cos(a)*r,y:g.y+Math.sin(a)*r});
export function giantWarningPolygons(g,segments=48){
 if(!g||![g.x,g.y].every(Number.isFinite))return [];
 if(g.shape==='line'){const angle=Math.atan2(g.toY-g.y,g.toX-g.x),dx=Math.sin(angle)*g.width/2,dy=-Math.cos(angle)*g.width/2;return [[{x:g.x+dx,y:g.y+dy},{x:g.toX+dx,y:g.toY+dy},{x:g.toX-dx,y:g.toY-dy},{x:g.x-dx,y:g.y-dy}]];}
 if(g.shape==='ring'){const result=[];for(let i=0;i<segments;i++){const a=i/segments*Math.PI*2,b=(i+1)/segments*Math.PI*2;result.push([polar(g,g.innerRadius,a),polar(g,g.radius,a),polar(g,g.radius,b),polar(g,g.innerRadius,b)]);}return result;}
 if(g.shape==='cone'){const n=Math.max(8,Math.ceil(segments*g.arc/(Math.PI*2))),points=[{x:g.x,y:g.y}];for(let i=0;i<=n;i++)points.push(polar(g,g.radius,g.angle-g.arc/2+g.arc*i/n));return [points];}
 return [Array.from({length:segments},(_,i)=>polar(g,g.radius,i/segments*Math.PI*2))];
}
export function drawStoneGiantWarning(scene,config,{impact=false}={}){
 const geometry=config.geometry||config,project=(p)=>scene.project?scene.project(p.x,p.y):p,polygons=giantWarningPolygons(geometry),projected=polygons.map(p=>p.map(project)),points=projected.flat(),graphic=scene.add.graphics(),color=impact?0xf28d52:config.phase===3?0xff7454:0xffc16d;
 graphic.setDepth?.((scene.depthAt?.(geometry.x,geometry.y)||0)+.2);graphic.fillStyle(color,impact?.32:.20);
 for(const polygon of projected)graphic.fillPoints(polygon,true);
 graphic.lineStyle(2,color,.92);
 // Segment edges of a ring are not painted: its safe central hole stays clear.
 const outline=(radius)=>{const points=Array.from({length:65},(_,i)=>project(polar(geometry,radius,i/64*Math.PI*2)));graphic.strokePoints(points,false);};
 if(geometry.shape==='ring'){outline(geometry.innerRadius);outline(geometry.radius);}else for(const polygon of projected)graphic.strokePoints(polygon,true);
 const originalDestroy=graphic.destroy.bind(graphic);let destroyed=false;
 graphic.giantWarning={shape:geometry.shape,geometry:{...geometry},phase:config.phase,encounterId:config.encounterId,bounds:{x:Math.min(...points.map(p=>p.x)),y:Math.min(...points.map(p=>p.y)),width:Math.max(...points.map(p=>p.x))-Math.min(...points.map(p=>p.x)),height:Math.max(...points.map(p=>p.y))-Math.min(...points.map(p=>p.y))}};
 graphic.destroy=()=>{if(destroyed)return;destroyed=true;scene.tweens?.killTweensOf?.(graphic);originalDestroy();};
 if(impact)scene.tweens.add({targets:graphic,alpha:0,duration:350,onComplete:()=>graphic.destroy()});
 else scene.tweens.add({targets:graphic,alpha:{from:.55,to:1},duration:Math.min(800,config.duration||800),yoyo:true,repeat:-1});
 return graphic;
}
