// Authored floor plans for the five desert dungeons. These are geometry and
// encounter anchors, not a claim that their bosses, paintings or rewards ship.
// All positions are local dungeon coordinates. World entrances are configured
// separately so existing region objects and saved coordinates need not move.
const names=(ru,en,es)=>({ru,en,es});
const room=(x,y,width=320,height=320)=>({x,y,width,height});
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
export const DESERT_DUNGEON_BLUEPRINTS=freeze([
 {id:'dungeon13',worldEntrance:{x:1875,y:2536},level:42,theme:'buried-cistern',names:names('Погребённая цистерна','The buried cistern','La cisterna sepultada'),
  palette:{ground:0x302b22,detail:0x8a7757,road:0xb99b62,water:0x45716b},corridorWidth:120,
  // A complete outer ring and two approaches to the central reservoir.
  rooms:[room(120,800),room(120,240),room(680,120),room(1240,240),room(1240,800),room(680,1360),room(660,720,360,360)],
  links:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[2,6],[5,6]]},
 {id:'dungeon14',worldEntrance:{x:6107,y:4946},level:46,theme:'scorpion-warren',names:names('Норы алого жала','Warrens of the scarlet sting','Madrigueras del aguijón escarlata'),
  palette:{ground:0x312321,detail:0x955d43,road:0xb17a54,water:0x4e392d},corridorWidth:140,
  // A southern hub splits into western and eastern nests, then rejoins at
  // the brood chamber. Both branches remain usable throughout the visit.
  rooms:[room(820,1480),room(780,800,400,360),room(120,820),room(120,200),room(1440,200),room(1440,820),room(800,120,360,360)],
  links:[[0,1],[1,2],[2,3],[1,5],[5,4],[3,6],[4,6],[1,6]]},
 {id:'dungeon15',worldEntrance:{x:5094,y:11160},level:49,theme:'mirror-tomb',names:names('Гробница треснувших зеркал','Tomb of cracked mirrors','Tumba de los espejos rotos'),
  palette:{ground:0x253035,detail:0x758b91,road:0xb1b7a2,water:0x447582},corridorWidth:120,
  // A long north/south processional axis with four genuine side chapels.
  rooms:[room(700,1680),room(700,1180),room(120,1180),room(1280,1180),room(700,620),room(120,620),room(1280,620),room(680,120,360,360)],
  links:[[0,1],[1,2],[1,3],[1,4],[4,5],[4,6],[4,7]]},
 {id:'dungeon16',worldEntrance:{x:6843,y:15844},level:53,theme:'broken-aqueduct',names:names('Разлом караванного акведука','The broken caravan aqueduct','La falla del acueducto de la caravana'),
  palette:{ground:0x262f28,detail:0x698174,road:0xaaa57a,water:0x3d8580},corridorWidth:140,
  // Two widely separated channels flank a dry central basin; neither is a
  // renamed segment of the legacy zigzag chamber generator.
  rooms:[room(120,740),room(560,180),room(1080,180),room(560,1300),room(1080,1300),room(1600,740),room(2160,720,360,360)],
  links:[[0,1,'vertical-first'],[1,2],[0,3,'vertical-first'],[3,4],[2,5],[4,5],[5,6]]},
 {id:'dungeon17',worldEntrance:{x:15664,y:17387},level:56,theme:'sunken-orrery',names:names('Обсерватория погасшего солнца','Orrery of the extinguished sun','Observatorio del sol apagado'),
  palette:{ground:0x25243a,detail:0x817a9d,road:0xb8a369,water:0x56698c},corridorWidth:160,
  // A broad lower loop feeds the central astrolabe hall; the final chamber
  // has a second route around the eastern gallery and a northern approach.
  rooms:[room(980,2080),room(960,1460),room(280,1460),room(1640,1460),room(920,800,400,400),room(280,820),room(1640,820),room(960,200),room(1640,180,400,400)],
  links:[[0,1],[1,2],[1,3],[2,5],[3,6],[5,4],[6,4],[4,7],[7,8],[6,8]]}
]);
export function createDesertDungeonLayout(id){
 const blueprint=DESERT_DUNGEON_BLUEPRINTS.find(d=>d.id===id);if(!blueprint)throw new RangeError('Unknown desert dungeon layout: '+id);
 const rooms=blueprint.rooms.map((r,i)=>({...r,id:'room'+i})),center=i=>({x:rooms[i].x+rooms[i].width/2,y:rooms[i].y+rooms[i].height/2}),walkableRects=rooms.map(r=>({...r})),roads=[];
 const appendSegment=(a,b,width)=>{if(a.x===b.x&&a.y===b.y)return;walkableRects.push({x:Math.min(a.x,b.x)-width/2,y:Math.min(a.y,b.y)-width/2,width:Math.abs(b.x-a.x)+width,height:Math.abs(b.y-a.y)+width});};
 for(const [i,[from,to,order]]of blueprint.links.entries()){
  const a=center(from),b=center(to),corner=order==='vertical-first'?{x:a.x,y:b.y}:{x:b.x,y:a.y},points=[a,corner,b].filter((p,i,all)=>!i||p.x!==all[i-1].x||p.y!==all[i-1].y),width=blueprint.corridorWidth;
  for(let j=1;j<points.length;j++)appendSegment(points[j-1],points[j],width);
  roads.push({id:id+'-passage-'+i,fromRoom:rooms[from].id,toRoom:rooms[to].id,points,width});
 }
 const entry={x:rooms[0].x+70,y:rooms[0].y+rooms[0].height/2},exit={...entry,radius:90};
 // Room0 is an empty arrival sanctuary. Six anchors use generous clearances
 // for the current enemy radii; bosses live only in the final chamber.
 const encounters=rooms.slice(1,-1).map((r,index)=>({id:id+'-room-'+(index+1),roomId:r.id,kind:'minions',x:r.x+r.width/2,y:r.y+r.height/2,
  points:[[-85,-60],[0,-60],[85,-60],[-85,60],[0,60],[85,60]].map(([dx,dy],i)=>({id:id+'-room-'+(index+1)+'-mob-'+i,x:r.x+r.width/2+dx,y:r.y+r.height/2+dy}))}));
 const last=rooms.at(-1),bossPoint={id:id+'-boss-0',x:last.x+last.width/2+50,y:last.y+last.height/2};encounters.push({id:id+'-final-encounter',roomId:last.id,kind:'boss',x:bossPoint.x,y:bossPoint.y,points:[bossPoint]});
 return {id:blueprint.id,worldEntrance:{...blueprint.worldEntrance},level:blueprint.level,theme:blueprint.theme,names:{...blueprint.names},palette:{...blueprint.palette},width:Math.max(...walkableRects.map(r=>r.x+r.width))+120,height:Math.max(...walkableRects.map(r=>r.y+r.height))+120,
  rooms,walkableRects,roads,entry,exit,encounters,dungeon:true,river:false,towns:[],npcs:[],portals:[],obstacles:[],landmarks:[]};
}
