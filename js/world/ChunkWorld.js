import {ENVIRONMENT_ART,environmentFrame} from '../assets/environmentArt.js';
import {bakeTexture} from '../assets/bakeTexture.js';
import {biomeZones,paintBiomes} from './biomes.js';
import {CHUNK_SIZE,visibleChunkCoordinates,chunkDistance,describeChunk,regionRoads,riverX,riverBlocked,dungeonFloorContains} from './chunkGeometry.js';
import {project,unproject} from './projection.js';
const named=(o,lang)=>o.names?.[lang]||o.names?.ru||o.name||o.id;
export class ChunkWorld{
 constructor(scene,content){this.scene=scene;this.content=content;this.chunks=new Map();this.serial=0;this.lastArea='';this.makeArt();}
 makeArt(){
  const scene=this.scene;this.paintedArt=scene.textures.exists(ENVIRONMENT_ART.key);const atlasKey='world-art-atlas-2',kinds=['oak','pine','cypress','rock','ruin','ruin1','ruin2','house','cliff','ice'];
  if(scene.textures.exists(atlasKey)){this.artTexture=atlasKey;return;}
  for(const kind of kinds){
   const key='world-art-'+kind;if(scene.textures.exists(key))continue;const g=scene.make.graphics({add:false});
   g.fillStyle(0x091e19,.22).fillEllipse(80,145,90,32);
   if(kind==='house'){
    g.fillStyle(0xd0b58b).fillPoints([{x:20,y:78},{x:78,y:102},{x:78,y:150},{x:20,y:124}],true);
    g.fillStyle(0x9d886a).fillPoints([{x:78,y:102},{x:138,y:76},{x:138,y:124},{x:78,y:150}],true);
    g.fillStyle(0x7e4a38).fillPoints([{x:10,y:78},{x:70,y:28},{x:150,y:76},{x:78,y:110}],true);
    g.fillStyle(0x47352d).fillRect(48,104,18,34);g.fillStyle(0xe8c87e).fillRect(106,98,15,14);
   }else if(kind==='cliff'){
    g.fillStyle(0x5b6c76).fillPoints([{x:22,y:139},{x:30,y:61},{x:61,y:22},{x:108,y:39},{x:137,y:133},{x:80,y:156}],true);g.fillStyle(0x7a8d97).fillTriangle(30,61,61,22,80,156);g.fillStyle(0xd6e2df).fillPoints([{x:30,y:61},{x:61,y:22},{x:108,y:39},{x:116,y:64},{x:85,y:53},{x:63,y:70}],true);g.lineStyle(3,0x475a63).beginPath().moveTo(83,62).lineTo(94,115).lineTo(88,146).strokePath();
   }else if(kind==='ice'){
    g.fillStyle(0x72b5cb,.9).fillPoints([{x:52,y:140},{x:45,y:76},{x:77,y:37},{x:109,y:116},{x:98,y:147}],true);g.fillStyle(0xc0e7e6,.8).fillTriangle(45,76,77,37,72,143);g.lineStyle(2,0xe6ffff,.8).beginPath().moveTo(77,41).lineTo(80,112).lineTo(99,138).strokePath();
   }else if(kind==='rock'||kind.startsWith('ruin')){
    g.fillStyle(kind==='rock'?0x7f8b89:0xa59e86).fillPoints([{x:30,y:139},{x:40,y:95},{x:72,y:73},{x:120,y:103},{x:130,y:136},{x:80,y:155}],true);
    g.fillStyle(0x566965).fillTriangle(80,155,72,73,130,136);
    if(kind.startsWith('ruin')){g.fillStyle(0xaaa38b).fillRect(48,51,21,72).fillRect(95,65,19,63);g.fillStyle(0xc1b99b).fillRect(43,46,31,10);if(kind==='ruin1'){g.fillStyle(0xc1b99b).fillRect(40,42,80,13);g.fillStyle(0x75875e).fillEllipse(89,134,65,20);}if(kind==='ruin2'){g.fillStyle(0x6a8979).fillCircle(79,75,25);g.fillStyle(0xd4c897).fillTriangle(61,91,79,48,99,91);}}
   }else{
    g.fillStyle(0x6a4a35).fillRect(75,75,11,73);
    if(kind==='oak'){g.fillStyle(0x315b39).fillEllipse(58,76,74,82);g.fillStyle(0x54864b).fillEllipse(91,57,81,90);g.fillStyle(0x66975a).fillEllipse(71,38,72,65);}
    else{g.fillStyle(kind==='pine'?0x3e6d58:0x4c6453).fillTriangle(31,122,80,12,130,122);g.fillStyle(0x668870).fillTriangle(41,84,80,4,115,84);}
   }
   bakeTexture(g,key,160,176);
  }
  if(scene.textures.createCanvas){
   const atlas=scene.textures.createCanvas(atlasKey,640,Math.ceil(kinds.length/4)*176);
   kinds.forEach((kind,index)=>{const x=index%4*160,y=Math.floor(index/4)*176;atlas.context.drawImage(scene.textures.get('world-art-'+kind).getSourceImage(),x,y);atlas.add(kind,0,x,y,160,176);});
   atlas.refresh();for(const kind of kinds)scene.textures.remove('world-art-'+kind);this.artTexture=atlasKey;
  }
 }
 area(hero,camera){
  const v=camera?.worldView,focus=project(hero.x,hero.y,this.content.height);if(!v?.width||Math.hypot(v.x+v.width/2-focus.x,v.y+v.height/2-focus.y)>1800)return {x:hero.x-400,y:hero.y-400,width:800,height:800};
  const corners=[[v.x,v.y],[v.right??v.x+v.width,v.y],[v.x,v.bottom??v.y+v.height],[v.x+v.width,v.y+v.height]].map(([x,y])=>unproject(x,y,this.content.height));
  const minX=Math.min(...corners.map(p=>p.x)),minY=Math.min(...corners.map(p=>p.y));
  // Include the hero even before a following camera has caught up after travel.
  return {x:Math.min(minX,hero.x-100),y:Math.min(minY,hero.y-100),width:Math.max(...corners.map(p=>p.x),hero.x+100)-Math.min(minX,hero.x-100),height:Math.max(...corners.map(p=>p.y),hero.y+100)-Math.min(minY,hero.y-100)};
 }
 update(hero,camera){
  const area=this.area(hero,camera),stamp=[area.x,area.y,area.width,area.height].map(n=>Math.round(n/64)).join(',');if(stamp===this.lastArea)return;this.lastArea=stamp;
  for(const [key,c]of this.chunks)if(chunkDistance(c.data.cx,c.data.cy,area)>700)this.unload(key);
  for(const coord of visibleChunkCoordinates(this.content,area,500))if(!this.chunks.has(coord.key))this.load(coord.cx,coord.cy);
 }
 load(cx,cy){
  const s=this.scene,c=this.content,data=describeChunk(c,cx,cy),key=`chunk-${c.id}-${cx}-${cy}-${this.serial++}`,g=s.make.graphics({add:false}),palette=c.palette||{ground:0x323b3a,road:0x777264,water:0x486e86};
  g.fillStyle(c.dungeon?0x20292a:palette.ground).fillRect(0,0,data.width,data.height);
  if(c.dungeon){for(const r of c.walkableRects||[]){g.fillStyle(0x706b5b).fillRect(r.x-data.x,r.y-data.y,r.width,r.height);g.lineStyle(2,0xb5aa88,.4).strokeRect(r.x-data.x,r.y-data.y,r.width,r.height);}}
  else{
   paintBiomes(g,c,data);
   for(let i=0;i<70;i++){g.fillStyle(palette.detail||0x849078,.2).fillEllipse((i*149+cx*71)%512,(i*251+cy*41)%512,7,3);}
   g.lineStyle((c.river?.halfWidth||24)*2,palette.water);g.beginPath();for(let y=data.y-40;y<data.y+data.height+40;y+=12){const x=riverX(c,y)-data.x;if(y===data.y-40)g.moveTo(x,y-data.y);else g.lineTo(x,y-data.y);}g.strokePath();
   for(const road of regionRoads(c)){g.lineStyle(road.width,road.secondary?0xb1a17a:palette.road,road.secondary?.75:1);g.beginPath().moveTo(road.from.x-data.x,road.from.y-data.y).lineTo(road.to.x-data.x,road.to.y-data.y).strokePath();}
  }
  bakeTexture(g,key,data.width,data.height);const at=project(data.x,data.y,c.height),ground=s.add.container(at.x,at.y).setScale(1,.5).setDepth(-100000);ground.add(s.add.image(0,0,key).setOrigin(0).setScale((data.width+1)/data.width,(data.height+1)/data.height).setRotation(Math.PI/4));
  const objects=[ground];
  for(const d of data.decorations){const p=project(d.x,d.y,c.height),painted=this.paintedArt&&environmentFrame(d.kind);objects.push(s.add.image(p.x,p.y,painted?.texture||this.artTexture||'world-art-'+d.kind,painted?.frame||(this.artTexture?d.kind:undefined)).setOrigin(painted?.originX??.5,painted?.originY??145/176).setScale(d.scale*(painted?.scale||1)).setDepth(d.x+d.y));}
  for(const bridge of data.bridges){const p=project(bridge.x,bridge.y,c.height),b=s.add.graphics().setPosition(p.x,p.y).setDepth(-99000);b.fillStyle(0x806445).fillPoints([{x:-52,y:0},{x:0,y:-24},{x:52,y:0},{x:0,y:24}],true);b.lineStyle(2,0xcfb98d).strokePoints([{x:-52,y:0},{x:0,y:-24},{x:52,y:0},{x:0,y:24}],true);objects.push(b);}
  for(const z of biomeZones(c))if(Math.floor(z.x/512)===cx&&Math.floor(z.y/512)===cy){const p=project(z.x,z.y,c.height);objects.push(s.add.text(p.x,p.y-55,z.names[s.language]||z.names.ru,{fontSize:'15px',color:'#e1e5bd',stroke:'#24392d',strokeThickness:3}).setOrigin(.5).setDepth(z.x+z.y));}
  for(const npc of data.npcs){const p=project(npc.x,npc.y,c.height),b=s.add.container(p.x,p.y).setDepth(npc.x+npc.y);b.add([s.add.ellipse(0,3,30,12,0x0d211a,.3),s.add.ellipse(0,-24,23,34,npc.roles?.includes('merchant')?0x537da4:0x967349),s.add.circle(0,-48,11,0xddb893),s.add.text(0,-77,named(npc,s.language),{fontSize:'13px',color:'#ffe4ac',stroke:'#152b22',strokeThickness:3}).setOrigin(.5)]);objects.push(b);}
  const markers=[...data.portals,...(c.dungeons||[]).filter(p=>Math.floor(p.x/512)===cx&&Math.floor(p.y/512)===cy),...(c.dungeon&&!(c.portals||[]).some(p=>Math.hypot(p.x-c.exit.x,p.y-c.exit.y)<1)?[c.exit].filter(p=>p&&Math.floor(p.x/512)===cx&&Math.floor(p.y/512)===cy):[])];
  for(const marker of markers){const p=project(marker.x,marker.y,c.height),b=s.add.container(p.x,p.y).setDepth(marker.x+marker.y);b.add([s.add.ellipse(0,0,55,25,0x85cfca,.45),s.add.rectangle(0,-33,40,65,0x394d62).setStrokeStyle(3,0xd5c485),s.add.ellipse(0,-33,26,49,0x51a5bb,.7),s.add.text(0,-90,named(marker,s.language),{fontSize:'13px',color:'#b6f1ee',stroke:'#17232e',strokeThickness:3}).setOrigin(.5)]);objects.push(b);}
  this.chunks.set(data.key,{data,objects,key});
 }
 unload(key){const chunk=this.chunks.get(key);if(!chunk)return;for(const o of chunk.objects)o.destroy();this.scene.textures.remove(chunk.key);this.chunks.delete(key);}
 get obstacles(){return [...this.chunks.values()].flatMap(c=>c.data.obstacles);}
 isWalkable(x,y,radius=12){const c=this.content;if(!Number.isFinite(x)||!Number.isFinite(y)||x<radius||y<radius||x>c.width-radius||y>c.height-radius)return false;if(c.dungeon&&!dungeonFloorContains(c,x,y,radius)||riverBlocked(c,x,y,radius))return false;return !this.obstacles.some(o=>Math.hypot(x-o.x,y-o.y)<o.r+radius);}
 get diagnostics(){return {loadedChunks:this.chunks.size,chunkTextures:this.chunks.size,objects:[...this.chunks.values()].reduce((n,c)=>n+c.objects.length,0)};}
 destroy(){for(const key of [...this.chunks.keys()])this.unload(key);}
}
