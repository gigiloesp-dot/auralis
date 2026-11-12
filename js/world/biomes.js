// A small authored geography layer over deterministic chunk decoration. Terrain
// patches remain in world coordinates, so their edges continue across chunks.
const zone=(id,type,x,y,rx,ry,color,names)=>Object.freeze({id,type,x,y,rx,ry,color,names:Object.freeze(names)});
const ZONES=Object.freeze({
 forest:Object.freeze([
  zone('sunmeadow','clearing',2750,2300,1450,1050,0x7e9a54,{ru:'Солнечная поляна',en:'Sun meadow',es:'Prado del sol'}),
  zone('oakgrove','grove',4100,3450,1350,1000,0x3f693a,{ru:'Дубовая роща',en:'Oak grove',es:'Robledal'}),
  zone('greenhills','hills',7650,3150,1850,1150,0x698148,{ru:'Зелёные холмы',en:'Green hills',es:'Colinas verdes'}),
  zone('westernpine','pinewood',3300,8750,1650,1400,0x3b6650,{ru:'Западный бор',en:'Western pinewood',es:'Pinar del oeste'})
 ]),
 north:Object.freeze([
  zone('frostfields','snowfield',3650,3200,1800,1500,0xc9d7d8,{ru:'Поля инея',en:'Rime fields',es:'Campos de escarcha'}),
  zone('glassbasin','icebasin',4000,7700,1600,1150,0x80b8cb,{ru:'Зеркальная низина',en:'Mirror basin',es:'Cuenca del espejo'}),
  zone('stonepass','mountainpass',7300,7150,1850,1400,0x899ca3,{ru:'Каменный перевал',en:'Stone pass',es:'Paso de piedra'}),
  zone('snowpine','pinewood',10950,3900,1450,1600,0x9bb4b5,{ru:'Снежный бор',en:'Snow pinewood',es:'Pinar nevado'})
 ]),
 ancient:Object.freeze([
  zone('sunkenarchive','ruinfield',3700,4200,1250,1050,0x83816b,{ru:'Каменное предместье',en:'Stone precinct',es:'Recinto de piedra'}),
  zone('dryreach','dryground',9600,3500,2400,1450,0x9b8b66,{ru:'Сухие пустоши',en:'Dry reaches',es:'Tierras secas'}),
  zone('moongarden','grove',6900,8100,1650,1350,0x435e52,{ru:'Заросший сад',en:'Overgrown garden',es:'Jardín cubierto'}),
  zone('elderruins','ruinfield',10900,12400,1550,1100,0x7c7d70,{ru:'Поле древних руин',en:'Elder ruin field',es:'Campo de ruinas antiguas'})
 ])
});
const PATHS=Object.freeze({
 forest:[{id:'forest-woodland-trail',width:36,secondary:true,points:[{x:1030,y:1140},{x:2200,y:3200},{x:4100,y:3450},{x:5250,y:5200}]}],
 north:[{id:'north-basin-trail',width:40,secondary:true,points:[{x:1500,y:1800},{x:3300,y:4100},{x:4000,y:7700},{x:7300,y:7150},{x:10300,y:10600}]}],
 ancient:[{id:'ancient-pilgrim-trail',width:40,secondary:true,points:[{x:1600,y:1800},{x:3700,y:4200},{x:6900,y:8100},{x:10900,y:12400},{x:11700,y:11400}]}]
});
export const biomeZones=content=>content.dungeon?[]:ZONES[content.id]||[];
export const biomeSidePaths=content=>content.dungeon?[]:PATHS[content.id]||[];
export function biomeAt(content,x,y){
 const zones=biomeZones(content);for(let i=zones.length-1;i>=0;i--){const z=zones[i];if(((x-z.x)/z.rx)**2+((y-z.y)/z.ry)**2<=1)return z;}return null;
}
export function biomeDecoration(content,x,y,roll){
 const type=biomeAt(content,x,y)?.type;
 if(type==='clearing')return roll<.12?'oak':null;
 if(type==='grove')return roll<.9?(content.id==='ancient'?'cypress':'oak'):null;
 if(type==='hills')return roll<.32?'rock':roll<.48?'oak':null;
 if(type==='pinewood')return roll<.86?'pine':'rock';
 if(type==='snowfield')return roll<.25?'rock':null;
 if(type==='icebasin')return roll<.23?'ice':null;
 if(type==='mountainpass')return roll<.62?'cliff':roll<.78?'rock':null;
 if(type==='dryground')return roll<.32?'rock':roll<.4?'cypress':null;
 if(type==='ruinfield')return roll<.05?'ruin1':roll<.10?'ruin2':roll<.48?'rock':null;
 return content.id==='ancient'?(roll<.55?'rock':'cypress'):content.id==='north'?(roll<.25?'rock':'pine'):(roll<.12?'rock':roll<.58?'oak':'pine');
}
export function paintBiomes(graphics,content,chunk){
 for(const z of biomeZones(content)){
  if(z.x+z.rx<chunk.x||z.y+z.ry<chunk.y||z.x-z.rx>chunk.x+chunk.width||z.y-z.ry>chunk.y+chunk.height)continue;
  const x=z.x-chunk.x,y=z.y-chunk.y;
  graphics.fillStyle(z.color,.87).fillEllipse(x,y,z.rx*2,z.ry*2);
  if(z.type==='hills'){
   // Nested contour shading suggests a low, traversable ridge; it has no hidden wall.
   for(let i=0;i<4;i++)graphics.fillStyle(i%2?0x8ba15e:0x425c35,.22).fillEllipse(x-i*100,y-i*100,z.rx*(1.7-i*.25),z.ry*(1.5-i*.20));
  }else if(z.type==='icebasin'){
   graphics.fillStyle(0xb4dfdf,.25).fillEllipse(x-150,y-100,z.rx*1.4,z.ry*1.2);
   for(let i=0;i<9;i++){const px=x-z.rx*.65+i*z.rx*.16,py=y-z.ry*.55+(i%3)*z.ry*.35;graphics.lineStyle(3,0xd9f0ed,.5).beginPath().moveTo(px,py).lineTo(px+100,py+80).lineTo(px+65,py+170).strokePath();}
  }else if(z.type==='ruinfield'){
   for(let i=0;i<24;i++){const px=x-z.rx*.65+(i%6)*z.rx*.25,py=y-z.ry*.55+Math.floor(i/6)*z.ry*.34;graphics.fillStyle(0xb0a98b,.19).fillRect(px,py,80+(i%3)*14,48);}
  }else if(z.type==='dryground'){
   for(let i=0;i<12;i++){const px=x-z.rx*.7+(i%4)*z.rx*.42,py=y-z.ry*.5+Math.floor(i/4)*z.ry*.48;graphics.lineStyle(3,0x675b43,.22).beginPath().moveTo(px,py).lineTo(px+120,py+15).lineTo(px+160,py-55).strokePath();}
  }
 }
}
