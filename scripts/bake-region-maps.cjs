/* Offline, deterministic cartography. Geography is imported from the game;
   painted symbols describe its actual vegetation/ruins, never invented routes.
   Run after assets/maps/features.png + features.json have been generated. */
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {startServer,launchOptions,root}=require('../tests/browserHarness.cjs');
(async()=>{const host=await startServer();let browser;try{browser=await chromium.launch(launchOptions);const page=await browser.newPage();await page.goto(host.url+'/index.html');const manifest={version:1,projection:'x / worldWidth * imageWidth; y / worldHeight * imageHeight',source:'actual regionContent,regionRoads,climateAt,biomeZones,describeChunk,SAND_HILLS',images:{}};
 const requested=process.argv.slice(2),regions=requested.length?requested:['forest','north','ancient','desert'];if(requested.length&&fs.existsSync(path.join(root,'assets/maps/manifest.json')))Object.assign(manifest.images,JSON.parse(fs.readFileSync(path.join(root,'assets/maps/manifest.json'))).images);for(const region of regions)for(const [variant,width,height]of [['wide',2048,1152],['ultrawide',2048,910]]){
 const result=await page.evaluate(async({region,width,height})=>{
  const {getRegionContent}=await import('/js/world/regionContent.js'),{regionRoads,riverX,describeChunk,distanceToSegment}=await import('/js/world/chunkGeometry.js'),{climateAt}=await import('/js/world/climate.js'),{biomeAt,biomeZones}=await import('/js/world/biomes.js'),{SAND_HILLS,surfaceHeight}=await import('/js/world/surface.js');const c=getRegionContent(region),roads=regionRoads(c),canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d',{alpha:false}),sx=width/c.width,sy=height/c.height;
  const image=async url=>{const i=new Image();i.src=url;await i.decode();return i;},atlas=await image('/assets/maps/features.png'),meta=await(await fetch('/assets/maps/features.json')).json();
  const frame=name=>{const f=meta.frames[name];if(!f)throw Error('Missing painted map symbol '+name);return f.frame||f;};
  const hash=(x,y)=>{let z=(Math.imul(x|0,374761393)+Math.imul(y|0,668265263))|0;z=Math.imul(z^(z>>>13),1274126177);return ((z^(z>>>16))>>>0)/4294967296;};
  // Sample the exact continuous climate field. Paper grain and hill lighting
  // add relief without moving a single geographic anchor.
  const pixels=ctx.createImageData(width,height);for(let y=0;y<height;y++)for(let x=0;x<width;x++){const wx=x/sx,wy=y/sy,a=climateAt(c,wx,wy),biome=biomeAt(c,wx,wy);let color=a?.color||c.palette.ground;if(biome&&!biome.labelOnly&&biome.color&&!(c.id==='ancient'||['abandonedCity','volcanic'].includes(a?.type))){const d=((wx-biome.x)/biome.rx)**2+((wy-biome.y)/biome.ry)**2,t=Math.min(.7,Math.max(0,(1-d)*2));let mixed=0;for(const shift of [16,8,0])mixed|=Math.round(((color>>shift)&255)*(1-t)+((biome.color>>shift)&255)*t)<<shift;color=mixed;}
   const cloud=Math.sin(wx/1800+Math.sin(wy/1300))*11+Math.sin((wx+wy)/480)*3,grain=(hash(x,y)-.5)*12,relief=c.id==='desert'?(surfaceHeight(c,wx+45,wy)-surfaceHeight(c,wx-45,wy)+surfaceHeight(c,wx,wy+45)-surfaceHeight(c,wx,wy-45))*.7:0,shade=cloud+grain-relief,i=(y*width+x)*4;pixels.data[i]=Math.min(255,((color>>16)&255)*.94+shade);pixels.data[i+1]=Math.min(255,((color>>8)&255)*.94+shade);pixels.data[i+2]=Math.min(255,(color&255)*.87+shade);pixels.data[i+3]=255;}ctx.putImageData(pixels,0,0);
  const stamp=(name,x,y,w,opacity=1)=>{const f=frame(name),h=w*f.h/f.w;ctx.save();ctx.globalAlpha=opacity;ctx.translate(x*sx,y*sy);if(hash(Math.round(x),Math.round(y))>.5)ctx.scale(-1,1);ctx.drawImage(atlas,f.x,f.y,f.w,f.h,-w/2,-h*.68,w,h);ctx.restore();};
  // True river centreline. Small bank and water highlights are cartographic
  // exaggerations of the actual width, not a fictional course.
  if(c.river!==false){const river=(stroke,lineWidth)=>{ctx.strokeStyle=stroke;ctx.lineWidth=lineWidth;ctx.lineJoin='round';ctx.beginPath();for(let y=0;y<=c.height;y+=35){const x=riverX(c,y);y?ctx.lineTo(x*sx,y*sy):ctx.moveTo(x*sx,y*sy);}ctx.stroke();};river('#365e4e',10);river(c.id==='north'?'#9cc8d3':'#477f8a',6);river(c.id==='north'?'#e2ecdf':'#9fd7cf',1.4);}
  const decorations=[];for(let cy=0;cy<Math.ceil(c.height/512);cy++)for(let cx=0;cx<Math.ceil(c.width/512);cx++){const ch=describeChunk(c,cx,cy);const source=ch.decorations||[];if(!source.length)continue;const chosen=source[Math.floor(hash(cx+8,cy+3)*source.length)];if(chosen)decorations.push({...chosen,cx,cy});}
  const forestKinds=['oak','pine','cypress','snowPine'],ruinKinds=['ruin','ruin1','ruin2','ruinHouse','ivyWall','ruinTower','tower','wall'];let symbols=0;
  for(const p of decorations.sort((a,b)=>a.y-b.y)){
   if((c.towns||[]).some(t=>Math.hypot(p.x-t.x,p.y-t.y)<450))continue;
   if(roads.some(r=>distanceToSegment(p,r.from,r.to)<145))continue;
   const climate=climateAt(c,p.x,p.y),b=biomeAt(c,p.x,p.y),roll=hash(p.cx,p.cy),cluster=(Math.sin(p.x/1450+Math.cos(p.y/1200))+Math.cos(p.y/1750+Math.sin(p.x/1000)))*.19+.5;let name,size=70+roll*65;
   // Nonuniform, continuous vegetation/ruin clusters leave recognizable fields
   // and snowy plains, rather than stamping a repeated object in every chunk.
   if(c.id!=='desert'&&roll>cluster+(climate?.type==='abandonedCity'?.02:0))continue;
   if(climate?.type==='abandonedCity'){name=roll>.4?'overgrownRuins':'ancientRuins';size=75+roll*65;}
   else if(climate?.type==='volcanic'){name=p.cx%5===0&&p.cy%5===0?'volcanicRidge':'dryRocks';size=name==='volcanicRidge'?130+roll*50:45+roll*40;}
   else if(c.id==='north'){if(['mountainpass','icebasin'].includes(b?.type)){name='snowRidge';size=100+roll*65;}else {if(roll>.27)continue;name=forestKinds.includes(p.kind)?'snowGrove':'snowRidge';size=forestKinds.includes(p.kind)?80+roll*80:48+roll*45;}}
   else if(c.id==='desert'){if(b?.type==='oasis')name='palmOasis';else if(ruinKinds.includes(p.kind)&&b?.type==='ruinfield')name='ancientRuins';else if(b?.type==='wastes'&&roll>.45)name='desertMesa';else continue;}
   else if(ruinKinds.includes(p.kind))name='ancientRuins';
   else if(c.id==='ancient'){name=climate?.type==='marsh'?'swampGrove':['wastes','dryground'].includes(climate?.type)?'dryRocks':'elderGrove';}
   else if(forestKinds.includes(p.kind))name='forestGrove';else if(roll>.6)name='dryRocks';else continue;
   stamp(name,p.x,p.y,size,.92);symbols++;
  }
  if(c.id==='desert'){for(const hill of SAND_HILLS){stamp('duneRidge',hill.x,hill.y,hill.rx*sx*1.55);symbols++;}for(const z of biomeZones(c).filter(z=>z.type==='oasis'))stamp('palmOasis',z.x,z.y,Math.max(65,z.rx*sx*1.5));}
  // Keep the real river legible above woodland symbols. Vegetation never
  // hides its course; the water contains no invented tributaries.
  if(c.river!==false){for(const [color,lineWidth]of [[c.id==='north'?'#718d91':'#375e53',8],[c.id==='north'?'#bdd8df':'#5398a6',4.5],[c.id==='north'?'#e5f1ed':'#b0d9cf',1]]){ctx.strokeStyle=color;ctx.lineWidth=lineWidth;ctx.lineJoin='round';ctx.beginPath();for(let y=0;y<=c.height;y+=35){const x=riverX(c,y);y?ctx.lineTo(x*sx,y*sy):ctx.moveTo(x*sx,y*sy);}ctx.stroke();}}
  // Draw real curved road segments above the illustration so every path is
  // usable at phone scale. No straight-line invented city connections.
  for(const secondary of [false,true]){const segments=roads.filter(r=>r.secondary===secondary);for(const pass of [0,1,2]){ctx.strokeStyle=pass===0?'#51412c':pass===1?'#d3b17a':'#f1d6a0';ctx.lineCap='round';ctx.lineJoin='round';ctx.globalAlpha=pass===0?.65:pass===1?.95:.65;for(const road of segments){ctx.lineWidth=Math.max(secondary?1.4:2.4,road.width*sx*.75)+(pass===0?2:pass===1?.4:-.8);ctx.beginPath();ctx.moveTo(road.from.x*sx,road.from.y*sy);ctx.lineTo(road.to.x*sx,road.to.y*sy);ctx.stroke();}}}ctx.globalAlpha=1;
  const villages={forest:'forestVillage',north:'snowVillage',ancient:'ancientVillage',desert:'desertVillage'};for(const town of c.towns||[])stamp(villages[c.id],town.spawn?.x??town.x,town.spawn?.y??town.y,85);
  // Subtle edge shading retains the full geographic extent; no frame/matte.
  const v=ctx.createRadialGradient(width*.5,height*.5,height*.25,width*.5,height*.5,width*.7);v.addColorStop(0,'#00000000');v.addColorStop(1,'#18201435');ctx.fillStyle=v;ctx.fillRect(0,0,width,height);
  return {data:canvas.toDataURL('image/webp',.9).split(',')[1],width,height,symbols,worldWidth:c.width,worldHeight:c.height,roads:roads.length,towns:(c.towns||[]).map(t=>({id:t.id,x:t.x,y:t.y}))};
 },{region,width,height});const file=`${region}-${variant}.webp`,buffer=Buffer.from(result.data,'base64');delete result.data;fs.writeFileSync(path.join(root,'assets/maps',file),buffer);manifest.images[file]={...result,bytes:buffer.length,sha256:crypto.createHash('sha256').update(buffer).digest('hex')};console.log(file,buffer.length,result.symbols,'painted symbols');
 }
 const art=fs.readFileSync(path.join(root,'assets/maps/features.png'));manifest.featureAtlasSha256=crypto.createHash('sha256').update(art).digest('hex');fs.writeFileSync(path.join(root,'assets/maps/manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 }finally{await browser?.close();await host.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
