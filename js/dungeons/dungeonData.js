const titles=[
 ['Корни под старой мельницей','Roots beneath the old mill','Raíces bajo el molino'],['Паутина каменного колодца','The stone well web','La telaraña del pozo'],['Гробница дубового короля','Tomb of the oak king','Tumba del rey del roble'],
 ['Тоннели морозного брода','Frostford tunnels','Túneles del vado helado'],['Рудник синего льда','Blue ice mine','Mina de hielo azul'],['Крепость белой бури','White storm fortress','Fortaleza de la tormenta'],['Предел северного дозора','The northern watch','La guardia del norte'],
 ['Забытый архив','The forgotten archive','El archivo olvidado'],['Храм расколотой луны','Temple of the shattered moon','Templo de la luna rota'],['Катакомбы вечного света','Catacombs of eternal light','Catacumbas de la luz eterna'],['Залы безмолвного суда','Halls of silent judgment','Salas del juicio silencioso'],['Сердце Ауралиса','Heart of Auralis','Corazón de Auralis']
];
// Entrances lie beside the region roads. World geometry reserves these clearings.
const locations=[['forest',5,1820,1780],['forest',10,4880,4860],['forest',18,9050,8950],['north',22,1960,2240],['north',25,4100,4460],['north',29,7500,7820],['north',33,10580,10870],['ancient',35,2060,2240],['ancient',36,4400,4440],['ancient',38,6940,6900],['ancient',40,9550,9300],['ancient',42,11960,11720]];
export const DIFFICULTIES=Object.freeze({easy:{id:'easy',multiplier:1,names:{ru:'Лёгкая',en:'Easy',es:'Fácil'}},medium:{id:'medium',multiplier:1.2,names:{ru:'Средняя',en:'Medium',es:'Media'}},hard:{id:'hard',multiplier:1.3,names:{ru:'Сложная',en:'Hard',es:'Difícil'}}});
export const DUNGEONS=Object.freeze(locations.map(([region,level,x,y],index)=>Object.freeze({id:'dungeon'+(index+1),number:index+1,region,level,x,y,names:{ru:titles[index][0],en:titles[index][1],es:titles[index][2]},size:index<3?'small':index<7?'medium':'large',bossCount:index<3?1:index<7?2:3})));
export const dungeonDefinition=id=>DUNGEONS.find(d=>d.id===id);
export const dungeonName=(d,language='ru')=>d?.names?.[language]||d?.names?.ru||d?.id||'';
export function createDungeonContent(id,difficulty='easy'){
 const definition=dungeonDefinition(id),mode=DIFFICULTIES[difficulty];
 if(!definition||!mode)throw new RangeError('Unknown dungeon or difficulty');
 const count=definition.bossCount+3+(definition.number%2),rooms=[];
 // A deliberate zigzag of separate chambers, linked by wide two-leg corridors.
 // Chamber positions and encounter locations vary with the dungeon number.
 for(let i=0;i<count;i++)rooms.push({id:'room'+i,x:100+i*440,y:160+(i%2)*(260+definition.number%3*35),width:320,height:280});
 const walkableRects=rooms.map(r=>({...r})),roads=[];
 for(let i=1;i<rooms.length;i++){
  const a={x:rooms[i-1].x+160,y:rooms[i-1].y+140},b={x:rooms[i].x+160,y:rooms[i].y+140},corner={x:b.x,y:a.y};
  walkableRects.push({x:Math.min(a.x,b.x)-50,y:a.y-50,width:Math.abs(a.x-b.x)+100,height:100},{x:b.x-50,y:Math.min(a.y,b.y)-50,width:100,height:Math.abs(a.y-b.y)+100});
  roads.push({id:'passage'+i,points:[a,corner,b],width:100});
 }
 const types=definition.region==='forest'?['forestRaider','spider','bear','skeleton']:definition.region==='north'?['iceWolf','skeleton','frostGolem']:['skeleton','arcaneWisp','ancientSentinel'];
 const camps=rooms.slice(0,-1).map((room,index)=>{const type=types[(index+definition.number)%types.length],center={x:room.x+160,y:room.y+140},campId=id+'-room-'+index;return {id:campId,type,region:id,level:definition.level,...center,spawns:Array.from({length:4+(index%2)},(_,i)=>({id:campId+'-mob-'+i,type,level:definition.level,x:center.x+(i%3-1)*55,y:center.y+(Math.floor(i/3)-.5)*65,hpMultiplier:mode.multiplier,damageMultiplier:mode.multiplier}))};});
 const bosses=Array.from({length:definition.bossCount},(_,i)=>{const room=rooms[rooms.length-definition.bossCount+i];const bossId=id+'-boss-'+i;return {id:bossId,type:types[(definition.number+i+1)%types.length],region:id,level:definition.level,x:room.x+210,y:room.y+140,bossType:'dungeon',patterns:[['slam','charge'],['volley','slam'],['charge','volley','slam']][(definition.number+i)%3],names:{ru:['Смотритель','Палач','Хранитель'][i]+' · '+definition.names.ru,en:['Warden','Executioner','Keeper'][i]+' · '+definition.names.en,es:['Celador','Verdugo','Guardián'][i]+' · '+definition.names.es},hpMultiplier:mode.multiplier,damageMultiplier:mode.multiplier,respawnMs:3600000,dungeonId:id,difficulty};});
 const entry={x:rooms[0].x+70,y:rooms[0].y+140};
 return {id:`dungeon:${id}:${difficulty}`,region:definition.region,names:definition.names,name:definition.names.ru,width:rooms.at(-1).x+rooms.at(-1).width+120,height:Math.max(...rooms.map(r=>r.y+r.height))+120,dungeon:true,dungeonId:id,difficulty,definition,rooms,walkableRects,entry,exit:{...entry,radius:90},towns:[],npcs:[],camps,bosses,portals:[],roads,obstacles:[],landmarks:[],river:false,palette:{ground:definition.region==='north'?0x283d49:definition.region==='ancient'?0x24283a:0x282a23,detail:0x6f725f,road:0x847b65,water:0x34434b}};
}
