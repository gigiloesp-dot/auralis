import {naturalRoadPoints} from './roadPaths.js';
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
const EXTRA_ZONES={
 forest:[zone('far-oaklands','grove',15300,4800,2100,2200,0x436f3c,{ru:'Дальние дубравы',en:'Far oaklands',es:'Robledales lejanos'}),zone('southern-meadows','hills',7200,15600,4000,1600,0x849b5a,{ru:'Южные луга',en:'Southern meadows',es:'Prados del sur'})],
 north:[zone('eastern-glacier','icebasin',18100,6000,2100,3300,0x82b4ca,{ru:'Восточный ледник',en:'Eastern glacier',es:'Glaciar oriental'}),zone('southern-snowfields','snowfield',9000,18500,6200,1800,0xc3d1d3,{ru:'Южные снежные поля',en:'Southern snowfields',es:'Campos nevados del sur'})],
 desert:[zone('golden-dunes','dunes',6500,4200,5000,3200,0xd9bb7d,{ru:'Золотые дюны',en:'Golden dunes',es:'Dunas doradas'}),zone('southern-dunes','dunes',16100,16600,3500,3000,0xd8b578,{ru:'Южные дюны',en:'Southern dunes',es:'Dunas del sur'}),zone('stony-wastes','wastes',6500,12000,3500,4000,0xa99576,{ru:'Каменистые пустоши',en:'Stony wastes',es:'Yermos pedregosos'}),zone('caravan-oasis','oasis',1600,1800,650,600,0x92ac78,{ru:'Караванный оазис',en:'Caravan oasis',es:'Oasis de caravanas'}),zone('mirror-oasis','oasis',11700,7600,800,700,0x8fa979,{ru:'Зеркальный оазис',en:'Mirror oasis',es:'Oasis del espejo'}),zone('south-oasis','oasis',7200,16800,900,600,0x91a878,{ru:'Южный оазис',en:'Southern oasis',es:'Oasis del sur'}),zone('lost-desert-ruins','ruinfield',13200,10500,1700,1500,0xb49e78,{ru:'Затерянные руины',en:'Lost ruins',es:'Ruinas perdidas'}),zone('tower-precinct','ruinfield',7000,3500,1000,800,0xc3a77e,{ru:'Квартал древних башен',en:'Ancient tower precinct',es:'Recinto de torres antiguas'})]
};
const ALL_ZONES=Object.fromEntries(['forest','north','ancient','desert'].map(id=>[id,Object.freeze([...(ZONES[id]||[]),...(EXTRA_ZONES[id]||[])])]));
const PATHS=Object.freeze({
 forest:[{id:'forest-woodland-trail',width:36,secondary:true,points:[{x:1030,y:1140},{x:2200,y:3200},{x:4100,y:3450},{x:5250,y:5200}]}],
 north:[{id:'north-basin-trail',width:40,secondary:true,points:[{x:1500,y:1800},{x:3300,y:4100},{x:4000,y:7700},{x:7300,y:7150},{x:10300,y:10600}]}],
 ancient:[{id:'ancient-pilgrim-trail',width:40,secondary:true,points:[{x:1600,y:1800},{x:3700,y:4200},{x:6900,y:8100},{x:10900,y:12400},{x:11700,y:11400}]}]
});
export const biomeZones=content=>content.dungeon?[]:ALL_ZONES[content.id]||[];
const EMPTY_PATHS=Object.freeze([]),sidePathCache=new WeakMap();
export function biomeSidePaths(content){if(content.dungeon||!PATHS[content.id])return EMPTY_PATHS;const cached=sidePathCache.get(content);if(cached)return cached;const paths=PATHS[content.id].map(path=>({...path,points:naturalRoadPoints(path,content),curved:true}));sidePathCache.set(content,paths);return paths;}
export function biomeAt(content,x,y){
 const zones=biomeZones(content);for(let i=zones.length-1;i>=0;i--){const z=zones[i];if(((x-z.x)/z.rx)**2+((y-z.y)/z.ry)**2<=1)return z;}return null;
}
export function biomeDecoration(content,x,y,roll){
 const type=biomeAt(content,x,y)?.type;
 if(content.id==='desert'){if(type==='oasis')return roll<.65?'palm':roll<.78?'rock':null;if(type==='ruinfield'||type==='wastes')return roll<.08?'tower':roll<.23?'wall':roll<.62?'rock':null;return roll<.15?'rock':roll<.175?'wall':null;}
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
  if(z.type==='oasis'){graphics.fillStyle(0x4eacb0,.85).fillEllipse(x+z.rx*.55,y-z.ry*.4,z.rx*.42,z.ry*.35);graphics.fillStyle(0xb6d3bb,.3).fillEllipse(x+z.rx*.53,y-z.ry*.41,z.rx*.32,z.ry*.23);}
  else if(z.type==='dunes'){for(let i=0;i<6;i++)graphics.fillStyle(i%2?0xf0d49a:0xa88551,.18).fillEllipse(x-z.rx*.3+i*z.rx*.13,y-z.ry*.2+i*z.ry*.08,z.rx*(1.5-i*.13),z.ry*(.9-i*.08));}
  else if(z.type==='hills'){
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
