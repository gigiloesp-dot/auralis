// Mechanical atlas packing of generated painted parts. No art is drawn here.
// Kept source PNGs are the production input; alpha components and cuts become
// individual sockets so hands/feet/legs can follow the existing body poses.
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const {launchOptions}=require('../tests/browserHarness.cjs');
(async()=>{const root=path.resolve(__dirname,'..'),out=path.join(root,'assets/equipment/warrior-reference');fs.mkdirSync(out,{recursive:true});const b=await chromium.launch(launchOptions);try{const page=await b.newPage();
 for(const slot of ['helmet','chest','gloves','pants','boots','sword','shield']){
 const source=fs.readFileSync(path.join(root,'art/source/warrior-reference',slot+'.png')).toString('base64');
 const result=await page.evaluate(async({source,slot})=>{
 const image=new Image();image.src='data:image/png;base64,'+source;await image.decode();const src=document.createElement('canvas');src.width=image.width;src.height=image.height;const cx=src.getContext('2d',{willReadFrequently:true});cx.drawImage(image,0,0);
 const dirs=['e','se','s','sw','w','nw','n','ne'],banks=['idle','run-a','run-b','attack'],pieces=[];
 function components(col,row){const im=cx.getImageData(col*192,row*256,192,256),d=im.data,seen=new Uint8Array(192*256),out=[];
 for(let i=0;i<seen.length;i++){if(seen[i]||d[i*4+3]<96)continue;const queue=[i];seen[i]=1;let xmin=192,ymin=256,xmax=0,ymax=0;for(let q=0;q<queue.length;q++){const n=queue[q],x=n%192,y=(n/192)|0;xmin=Math.min(xmin,x);xmax=Math.max(xmax,x);ymin=Math.min(ymin,y);ymax=Math.max(ymax,y);for(const m of [x>0?n-1:-1,x<191?n+1:-1,y>0?n-192:-1,y<255?n+192:-1])if(m>=0&&!seen[m]&&d[m*4+3]>=96){seen[m]=1;queue.push(m);}}
 if(queue.length>45)out.push({x:Math.max(0,xmin-2),y:Math.max(0,ymin-2),w:Math.min(192,xmax+3)-Math.max(0,xmin-2),h:Math.min(256,ymax+3)-Math.max(0,ymin-2),area:queue.length});}
 return out.sort((a,b)=>b.area-a.area);}
 function add(name,col,row,r,extra={}){if(!r||r.w<2||r.h<2)throw Error(slot+' missing '+name);
 if(slot==='boots'){
  const pixels=cx.getImageData(col*192+r.x,row*256+r.y,r.w,r.h).data;
  const centre=(lo,hi)=>{let x=0,y=0,n=0;for(let yy=Math.floor(r.h*lo);yy<r.h*hi;yy++)for(let xx=0;xx<r.w;xx++)if(pixels[(yy*r.w+xx)*4+3]>150){x+=xx;y+=yy;n++;}return n?[x/n,y/n]:[r.w/2,r.h*(lo+hi)/2];};
  const top=centre(0,.22),ankle=centre(.57,.74),sole=centre(.82,1),split=Math.floor(ankle[1]);
  for(const part of ['calf','foot']){
   const cut=part==='calf'?0:Math.max(0,split-5),h=part==='calf'?Math.min(r.h,split+6):r.h-cut;
   const from=part==='calf'?top:ankle,to=part==='calf'?ankle:sole;
   pieces.push({name:part+'-'+name,sx:col*192+r.x,sy:row*256+r.y+cut,w:r.w,h,bootPivot:[ankle[0],ankle[1]-cut],bootAngle:Math.atan2(to[1]-from[1],to[0]-from[0]),bootLength:Math.hypot(to[0]-from[0],to[1]-from[1])});
  }
  return;
 }
 pieces.push({name,sx:col*192+r.x,sy:row*256+r.y,w:r.w,h:r.h,...extra});}
 if(slot==='pants'){
  for(let c=0;c<8;c++){const p=components(c,0)[0],half=p.w/2,waist=Math.round(p.h*.29),knee=Math.round(p.h*.65);
   add('waist/'+dirs[c],c,0,{x:p.x,y:p.y,w:p.w,h:waist});
   for(const [side,offset]of [['left',0],['right',half]]){
    add('thigh-'+side+'/'+dirs[c],c,0,{x:Math.floor(p.x+offset),y:p.y+waist-3,w:Math.ceil(half),h:knee-waist+7});
    add('shin-'+side+'/'+dirs[c],c,0,{x:Math.floor(p.x+offset),y:p.y+knee-3,w:Math.ceil(half),h:p.h-knee+3});
   }
  }
 }else if(slot==='gloves'||slot==='boots'){
  for(let c=0;c<8;c++){
   let row=0,list=components(c,row);
   // Side-view standing pairs touch. Select a separated painted boot from
   // attack poses rather than putting a double boot onto each individual foot.
   if(slot==='boots'&&list.length<2){row=3;list=components(c,row);}
   if(!list.length)throw Error('Missing paired part '+slot+'/'+dirs[c]);
   list=list.slice(0,2).sort((a,b)=>a.x-b.x);
   for(let i=0;i<2;i++)add((i?'right':'left')+'/'+dirs[c],c,row,list[i]||list[0]);
  }
 }else for(let row=0;row<4;row++)for(let c=0;c<8;c++){
  const p=components(c,row)[0];let extra={};
  if(slot==='sword'){
   const data=cx.getImageData(c*192+p.x,row*256+p.y,p.w,p.h).data,gold=[],steel=[];
   for(let y=0;y<p.h;y++)for(let x=0;x<p.w;x++){const i=(y*p.w+x)*4,r=data[i],g=data[i+1],b=data[i+2];if(data[i+3]<150)continue;if(r>g*1.15&&g>b*1.1&&r>65)gold.push([x,y]);if(r>110&&Math.max(r,g,b)-Math.min(r,g,b)<48)steel.push([x,y]);}
   const grip=gold.length?gold.reduce((p,v)=>[p[0]+v[0]/gold.length,p[1]+v[1]/gold.length],[0,0]):[p.w/2,p.h*.12];
   const tip=steel.sort((a,b)=>Math.hypot(b[0]-grip[0],b[1]-grip[1])-Math.hypot(a[0]-grip[0],a[1]-grip[1]))[0]||[p.w/2,p.h];extra={grip,tip,angle:Math.atan2(tip[1]-grip[1],tip[0]-grip[0])};
  }
  add(banks[row]+'/'+dirs[c],c,row,p,extra);
 }
 let x=2,y=2,line=0;const width=512,frames={};for(const p of pieces){p.w=Math.ceil(p.w);p.h=Math.ceil(p.h);if(x+p.w+2>width){x=2;y+=line+4;line=0;}p.dx=x;p.dy=y;x+=p.w+4;line=Math.max(line,p.h);frames[p.name]={frame:{x:p.dx,y:p.dy,w:p.w,h:p.h},rotated:false,trimmed:false,spriteSourceSize:{x:0,y:0,w:p.w,h:p.h},sourceSize:{w:p.w,h:p.h}};}
 const height=2**Math.ceil(Math.log2(y+line+2)),dest=document.createElement('canvas');dest.width=width;dest.height=height;const ctx=dest.getContext('2d');
 for(const p of pieces){ctx.drawImage(src,p.sx,p.sy,p.w,p.h,p.dx,p.dy,p.w,p.h);}
 return {png:dest.toDataURL('image/png').split(',')[1],atlas:{frames,meta:{image:slot+'.png',size:{w:width,h:height},scale:'1'}},parts:Object.fromEntries(pieces.map(({name,grip,tip,angle,bootPivot,bootAngle,bootLength})=>[name,grip?{grip,tip,angle}:bootPivot?{bootPivot,bootAngle,bootLength}:{}])),size:[width,height]};
 },{source,slot});
 fs.writeFileSync(path.join(out,slot+'.png'),Buffer.from(result.png,'base64'));fs.writeFileSync(path.join(out,slot+'.json'),JSON.stringify(result.atlas,null,2)+'\n');if(slot==='sword'){fs.writeFileSync(path.join(out,'sword-pivots.json'),JSON.stringify(result.parts,null,2)+'\n');fs.writeFileSync(path.join(root,'js/characters/warriorSwordPivots.js'),'// Generated from the painted blade and grip pixels by the atlas packer.\nexport const WARRIOR_SWORD_PIVOTS='+JSON.stringify(result.parts,null,1)+';\n');}if(slot==='boots')fs.writeFileSync(path.join(root,'js/characters/warriorBootPivots.js'),'// Generated boot ankle pivots and intrinsic shaft angles.\nexport const WARRIOR_BOOT_PIVOTS='+JSON.stringify(result.parts,null,1)+';\n');console.log(slot,result.size,Object.keys(result.atlas.frames).length+' frames');
 }
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
