export const MONSTER_STATES=Object.freeze(['idle','patrol','chase','attack','return','dead']);
export const MONSTER_TYPES=Object.freeze({
 forestWolf:{name:'Лесной волк',names:{ru:'Лесной волк',en:'Forest wolf',es:'Lobo del bosque'},level:1,hp:30,attack:4,xp:15,gold:2,speed:90,loot:'wolf'},
 wildBoar:{name:'Дикий кабан',names:{ru:'Дикий кабан',en:'Wild boar',es:'Jabalí salvaje'},level:3,hp:65,attack:7,xp:24,gold:4,speed:72,loot:'boar'},
 forestRaider:{name:'Лесной разбойник',names:{ru:'Лесной разбойник',en:'Forest raider',es:'Bandido del bosque'},level:4,hp:85,attack:10,xp:32,gold:6,speed:100,loot:'raider'},
 bear:{name:'Лесной медведь',names:{ru:'Лесной медведь',en:'Forest bear',es:'Oso del bosque'},level:6,hp:125,attack:14,xp:48,gold:9,speed:68,loot:'bear',defense:4},
 spider:{name:'Ядовитый паук',names:{ru:'Ядовитый паук',en:'Venom spider',es:'Araña venenosa'},level:8,hp:115,attack:17,xp:62,gold:10,speed:104,loot:'spider',defense:2},
 skeleton:{name:'Скелет',names:{ru:'Скелет',en:'Skeleton',es:'Esqueleto'},level:14,hp:190,attack:25,xp:104,gold:15,speed:83,loot:'skeleton',defense:8},
 iceWolf:{name:'Ледяной хищник',names:{ru:'Ледяной хищник',en:'Frost predator',es:'Depredador helado'},level:22,hp:260,attack:36,xp:170,gold:24,speed:112,loot:'iceWolf',defense:10},
 frostGolem:{name:'Ледяной исполин',names:{ru:'Ледяной исполин',en:'Frost golem',es:'Gólem de hielo'},level:26,hp:380,attack:43,xp:210,gold:29,speed:52,loot:'frostGolem',defense:20},
 ancientSentinel:{name:'Древний страж',names:{ru:'Древний страж',en:'Ancient sentinel',es:'Centinela antiguo'},level:35,hp:520,attack:55,xp:290,gold:38,speed:76,loot:'ancientSentinel',defense:27},
 arcaneWisp:{name:'Чародейский огонёк',names:{ru:'Чародейский огонёк',en:'Arcane wisp',es:'Fuego arcano'},level:37,hp:390,attack:62,xp:310,gold:42,speed:94,loot:'arcaneWisp',defense:12,magic:true},
 forestGuardian:{name:'Страж чащи · мини-босс',names:{ru:'Страж чащи · мини-босс',en:'Grove guardian · miniboss',es:'Guardián del bosque · minijefe'},level:5,hp:750,attack:20,xp:160,gold:70,speed:55,loot:'guardian',boss:true,respawnMs:2400000}
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

export function monsterKind(descriptor){
 const base=MONSTER_TYPES[descriptor.type]||MONSTER_TYPES.forestWolf;
 const level=Math.max(1,Math.min(42,Math.floor(descriptor.level||base.level)));
 const delta=Math.max(0,level-base.level),boss=!!descriptor.bossType||base.boss;
 const hp=(base.hp+delta*16+delta*delta*.55)*(descriptor.bossType?(base.boss?(descriptor.bossType==='world'?4:descriptor.bossType==='dungeon'?2:1):(descriptor.bossType==='world'?12:descriptor.bossType==='dungeon'?8:6)):1);
 return {...base,...(descriptor.names?{names:descriptor.names}:{}),level,boss,defense:(base.defense||0)+delta*.8,
  hp:Math.round(hp*(descriptor.hpMultiplier||1)),attack:Math.round((base.attack+delta*2)*(descriptor.damageMultiplier||1)),
  xp:descriptor.xp||Math.round((base.xp+delta*12)*(boss?3:1)),gold:descriptor.gold||Math.round((base.gold+delta)*(boss?7:1)),
  respawnMs:descriptor.respawnMs||(boss?2400000:11000)};
}
