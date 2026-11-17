import {project,unproject} from './projection.js';
export const SAND_HILLS=Object.freeze([
 {id:'western-sand-ridge',x:5400,y:4200,rx:1800,ry:1100,height:56},
 {id:'eastern-sand-ridge',x:12500,y:4500,rx:1900,ry:1300,height:64},
 {id:'caravan-saddle',x:9000,y:7900,rx:2100,ry:1250,height:46},
 {id:'eastern-low-mountain',x:16900,y:8700,rx:1900,ry:1400,height:68},
 {id:'ruin-foothills',x:14500,y:11500,rx:1700,ry:1200,height:52},
 {id:'western-low-mountain',x:3800,y:12000,rx:1700,ry:1250,height:58},
 {id:'southern-sand-ridge',x:6000,y:14500,rx:2200,ry:1400,height:62},
 {id:'far-dunes',x:16600,y:16600,rx:2000,ry:1500,height:68}
]);
export function chunkHasRelief(content,chunk){if(content.id!=='desert'||!content.reliefRevision||content.dungeon)return false;return SAND_HILLS.some(h=>{const x=Math.max(chunk.x,Math.min(chunk.x+chunk.width,h.x)),y=Math.max(chunk.y,Math.min(chunk.y+chunk.height,h.y));return ((x-h.x)/h.rx)**2+((y-h.y)/h.ry)**2<1;});}
export function surfaceHeight(content,x,y){
 if(content.dungeon||content.id!=='desert'||!content.reliefRevision||!Number.isFinite(x)||!Number.isFinite(y))return 0;
 let h=0;for(const hill of SAND_HILLS){const r=((x-hill.x)/hill.rx)**2+((y-hill.y)/hill.ry)**2;if(r<1)h+=hill.height*(1-r)**3;}return h;
}
export function projectSurface(x,y,content){const p=project(x,y,content.height);p.y-=surfaceHeight(content,x,y);return p;}
export function unprojectSurface(x,y,content){let p=unproject(x,y,content.height);for(let i=0;i<12;i++)p=unproject(x,y+surfaceHeight(content,p.x,p.y),content.height);return p;}
// Camera forward depth: elevation moves a point towards the viewing camera;
// planar physics/range/saved XY remain untouched by this visual height field.
export const surfaceDepth=(content,x,y)=>x+y+surfaceHeight(content,x,y)*Math.SQRT1_2;
export function surfaceMesh(content,chunk,step=64){
 const vertices=[],triangles=[];
 // Partial edge chunks need their exact endpoint even when not a multiple64.
 const xs=Array.from({length:Math.ceil(chunk.width/step)+1},(_,i)=>Math.min(chunk.width,i*step)),ys=Array.from({length:Math.ceil(chunk.height/step)+1},(_,i)=>Math.min(chunk.height,i*step));vertices.length=0;
 for(const v of ys)for(const u of xs)vertices.push({u,v,...projectSurface(chunk.x+u,chunk.y+v,content)});
 for(let y=0;y<ys.length-1;y++)for(let x=0;x<xs.length-1;x++){const a=y*xs.length+x,b=a+1,c=a+xs.length,d=c+1;triangles.push([a,b,c],[b,d,c]);}
 const left=Math.floor(Math.min(...vertices.map(p=>p.x)))-2,top=Math.floor(Math.min(...vertices.map(p=>p.y)))-2,width=Math.ceil(Math.max(...vertices.map(p=>p.x)))-left+2,height=Math.ceil(Math.max(...vertices.map(p=>p.y)))-top+2;
 return {vertices,triangles,left,top,width,height};
}
export function paintRelief(g,content,chunk){
 if(!content.reliefRevision||content.dungeon||content.id!=='desert')return;
 for(let y=0;y<chunk.height;y+=64)for(let x=0;x<chunk.width;x+=64){const wx=chunk.x+x+32,wy=chunk.y+y+32,dx=surfaceHeight(content,wx+32,wy)-surfaceHeight(content,wx-32,wy),dy=surfaceHeight(content,wx,wy+32)-surfaceHeight(content,wx,wy-32),shade=(dx+dy)/64;
  if(Math.abs(shade)>.002)g.fillStyle(shade>0?0xffecac:0x77592f,Math.min(.22,Math.abs(shade)*2)).fillRect(x,y,Math.min(64,chunk.width-x),Math.min(64,chunk.height-y));}
}
function drawTriangle(ctx,source,points,left,top){
 const [a,b,c]=points,den=a.u*(b.v-c.v)+b.u*(c.v-a.v)+c.u*(a.v-b.v);if(Math.abs(den)<.00001)return;
 const solve=(av,bv,cv)=>[(av*(b.v-c.v)+bv*(c.v-a.v)+cv*(a.v-b.v))/den,(av*(c.u-b.u)+bv*(a.u-c.u)+cv*(b.u-a.u))/den,(av*(b.u*c.v-c.u*b.v)+bv*(c.u*a.v-a.u*c.v)+cv*(a.u*b.v-b.u*a.v))/den];
 const tx=solve(a.x-left,b.x-left,c.x-left),ty=solve(a.y-top,b.y-top,c.y-top),mx=(a.x+b.x+c.x)/3-left,my=(a.y+b.y+c.y)/3-top;
 ctx.save();ctx.beginPath();points.forEach((p,i)=>{const x=p.x-left,y=p.y-top,dx=x-mx,dy=y-my,l=Math.hypot(dx,dy)||1;ctx[i?'lineTo':'moveTo'](x+dx/l*2,y+dy/l*2);});ctx.closePath();ctx.clip();ctx.setTransform(tx[0],ty[0],tx[1],ty[1],tx[2],ty[2]);ctx.drawImage(source,-4,-4);ctx.restore();
}
export function createSurfaceGround(scene,content,chunk,sourceKey,key){
 const mesh=surfaceMesh(content,chunk),original=scene.textures.get(sourceKey).getSourceImage(),source=document.createElement('canvas');source.width=original.width+8;source.height=original.height+8;const padding=source.getContext('2d');padding.drawImage(original,4,4);padding.drawImage(original,0,0,original.width,1,4,0,original.width,4);padding.drawImage(original,0,original.height-1,original.width,1,4,original.height+4,original.width,4);padding.drawImage(source,4,0,1,source.height,0,0,4,source.height);padding.drawImage(source,original.width+3,0,1,source.height,original.width+4,0,4,source.height);const texture=scene.textures.createCanvas(key,mesh.width,mesh.height),ctx=texture.context;
 for(const triangle of mesh.triangles)drawTriangle(ctx,source,triangle.map(i=>mesh.vertices[i]),mesh.left,mesh.top);
 texture.refresh();scene.textures.remove(sourceKey);return scene.add.image(mesh.left,mesh.top,key).setOrigin(0).setDepth(-100000);
}
