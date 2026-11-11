export const MONSTER_STATES=Object.freeze(['idle','patrol','chase','attack','return','dead']);
export const MONSTER_TYPES=Object.freeze({
 forestWolf:{name:'Лесной волк',names:{ru:'Лесной волк',en:'Forest wolf',es:'Lobo del bosque'},level:1,hp:30,attack:4,xp:15,gold:2,speed:90,loot:'wolf'},
 wildBoar:{name:'Дикий кабан',names:{ru:'Дикий кабан',en:'Wild boar',es:'Jabalí salvaje'},level:3,hp:65,attack:7,xp:24,gold:4,speed:72,loot:'boar'},
 forestRaider:{name:'Лесной разбойник',names:{ru:'Лесной разбойник',en:'Forest raider',es:'Bandido del bosque'},level:4,hp:85,attack:10,xp:32,gold:6,speed:100,loot:'raider'},
 forestGuardian:{name:'Страж чащи · мини-босс',names:{ru:'Страж чащи · мини-босс',en:'Grove guardian · miniboss',es:'Guardián del bosque · minijefe'},level:5,hp:750,attack:20,xp:160,gold:70,speed:55,loot:'guardian',boss:true,respawnMs:60000}
});
export const MONSTER_CAMPS=Object.freeze([
 {type:'forestWolf',points:[[1370,1240],[1450,1320],[1530,1220],[1320,1430],[1600,1450],[1770,1250],[1770,1600],[1430,1660]]},
 {type:'wildBoar',points:[[1740,720],[1810,760],[1880,700],[1850,830]]},
 {type:'forestRaider',points:[[720,1700],[800,1760],[740,1830],[860,1820]]},
 {type:'forestGuardian',points:[[2050,2050]]}
]);
export const MONSTER_ACTIVATION_RADIUS=700;
export function clearDashPosition(hero,target,obstacles=[],clearance=12){
 const dx=target.x-hero.x,dy=target.y-hero.y,d=Math.hypot(dx,dy),length=Math.max(0,d-55);
 let result={x:hero.x,y:hero.y};if(d===0)return result;
 // Sweep in short steps so a fast dash cannot tunnel through a trunk or house.
 for(let step=4;step<=length+4;step+=4){const t=Math.min(step,length),x=hero.x+dx/d*t,y=hero.y+dy/d*t;
  if(obstacles.some(o=>Math.hypot(x-o.x,y-o.y)<o.r+clearance))break;
  result={x,y};
 }
 return result;
}
