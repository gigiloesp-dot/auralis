export const MONSTER_STATES=Object.freeze(['idle','patrol','chase','attack','return','dead']);
const mechanics=(family,movementProfile,values)=>({family,movementProfile,...values});
export const MONSTER_TYPES=Object.freeze({
 forestWolf:mechanics('wolf','predator',{ name:'Лесной волк',names:{ru:'Лесной волк',en:'Forest wolf',es:'Lobo del bosque'},level:1,hp:30,attack:4,xp:15,gold:2,speed:90,loot:'wolf'}),
 wildBoar:mechanics('boar','charger',{ name:'Дикий кабан',names:{ru:'Дикий кабан',en:'Wild boar',es:'Jabalí salvaje'},level:3,hp:65,attack:7,xp:24,gold:4,speed:72,loot:'boar'}),
 forestRaider:mechanics('raider','skirmisher',{ name:'Лесной разбойник',names:{ru:'Лесной разбойник',en:'Forest raider',es:'Bandido del bosque'},level:4,hp:85,attack:10,xp:32,gold:6,speed:100,loot:'raider'}),
 bear:mechanics('bear','mauler',{ name:'Лесной медведь',names:{ru:'Лесной медведь',en:'Forest bear',es:'Oso del bosque'},level:6,hp:125,attack:14,xp:48,gold:9,speed:68,loot:'bear',defense:4}),
 spider:mechanics('spider','crawler',{ name:'Ядовитый паук',names:{ru:'Ядовитый паук',en:'Venom spider',es:'Araña venenosa'},level:8,hp:115,attack:17,xp:62,gold:10,speed:104,loot:'spider',defense:2}),
 skeleton:mechanics('skeleton','fighter',{ name:'Скелет',names:{ru:'Скелет',en:'Skeleton',es:'Esqueleto'},level:14,hp:190,attack:25,xp:104,gold:15,speed:83,loot:'skeleton',defense:8}),
 iceWolf:mechanics('wolf','predator',{ name:'Ледяной хищник',names:{ru:'Ледяной хищник',en:'Frost predator',es:'Depredador helado'},level:22,hp:260,attack:36,xp:170,gold:24,speed:112,loot:'iceWolf',defense:10}),
 frostGolem:mechanics('golem','heavy',{ name:'Ледяной исполин',names:{ru:'Ледяной исполин',en:'Frost golem',es:'Gólem de hielo'},level:26,hp:380,attack:43,xp:210,gold:29,speed:52,loot:'frostGolem',defense:20}),
 ancientSentinel:mechanics('sentinel','heavy',{ name:'Древний страж',names:{ru:'Древний страж',en:'Ancient sentinel',es:'Centinela antiguo'},level:35,hp:520,attack:55,xp:290,gold:38,speed:76,loot:'ancientSentinel',defense:27}),
 arcaneWisp:mechanics('elemental','elemental',{ name:'Чародейский огонёк',names:{ru:'Чародейский огонёк',en:'Arcane wisp',es:'Fuego arcano'},level:37,hp:390,attack:62,xp:310,gold:42,speed:94,loot:'arcaneWisp',defense:12,magic:true}),
 forestBat:mechanics('bat','bat',{name:'Ночная крылатка',names:{ru:'Ночная крылатка',en:'Dusk bat',es:'Murciélago del ocaso'},level:2,hp:36,attack:5,xp:19,gold:3,speed:138,loot:'bat',defense:0}),
 thornSnake:mechanics('snake','serpent',{name:'Терновая змея',names:{ru:'Терновая змея',en:'Thorn snake',es:'Serpiente de espinas'},level:5,hp:86,attack:12,xp:40,gold:7,speed:95,loot:'snake',defense:1}),
 forestOrc:mechanics('orc','fighter',{name:'Дубравный орк',names:{ru:'Дубравный орк',en:'Grove orc',es:'Orco del robledal'},level:10,hp:160,attack:21,xp:82,gold:13,speed:79,loot:'orc',defense:9}),
 snowBear:mechanics('bear','mauler',{name:'Снежный медведь',names:{ru:'Снежный медведь',en:'Snow bear',es:'Oso de las nieves'},level:24,hp:315,attack:41,xp:190,gold:27,speed:66,loot:'bear',defense:16}),
 iceBat:mechanics('bat','bat',{name:'Ледокрыл',names:{ru:'Ледокрыл',en:'Frostwing bat',es:'Murciélago escarchado'},level:22,hp:230,attack:34,xp:165,gold:23,speed:142,loot:'bat',defense:6}),
 snowRaider:mechanics('raider','skirmisher',{name:'Северный налётчик',names:{ru:'Северный налётчик',en:'Northern marauder',es:'Saqueador del norte'},level:23,hp:275,attack:38,xp:180,gold:25,speed:100,loot:'raider',defense:12}),
 iceElemental:mechanics('elemental','elemental',{name:'Стихия льда',names:{ru:'Стихия льда',en:'Ice elemental',es:'Elemental de hielo'},level:29,hp:350,attack:48,xp:245,gold:33,speed:82,loot:'elemental',defense:12,magicDefense:25,magic:true}),
 wraith:mechanics('ghost','ghost',{name:'Призрак перевала',names:{ru:'Призрак перевала',en:'Pass wraith',es:'Espectro del paso'},level:31,hp:340,attack:50,xp:265,gold:35,speed:101,loot:'ghost',defense:8,magicDefense:28,magic:true}),
 desertSnake:mechanics('snake','serpent',{name:'Пепельная гадюка',names:{ru:'Пепельная гадюка',en:'Ash viper',es:'Víbora de ceniza'},level:35,hp:410,attack:54,xp:288,gold:38,speed:116,loot:'snake',defense:16}),
 scarab:mechanics('scarab','scarab',{name:'Рунный скарабей',names:{ru:'Рунный скарабей',en:'Rune scarab',es:'Escarabajo rúnico'},level:35,hp:470,attack:52,xp:290,gold:38,speed:76,loot:'scarab',defense:30}),
 fallenKnight:mechanics('skeleton','fighter',{name:'Падший рыцарь',names:{ru:'Падший рыцарь',en:'Fallen knight',es:'Caballero caído'},level:36,hp:545,attack:58,xp:304,gold:40,speed:73,loot:'skeleton',defense:32}),
 ancientGargoyle:mechanics('gargoyle','gargoyle',{name:'Древняя горгулья',names:{ru:'Древняя горгулья',en:'Ancient gargoyle',es:'Gárgola antigua'},level:38,hp:520,attack:61,xp:330,gold:43,speed:99,loot:'gargoyle',defense:26}),
 voidElemental:mechanics('elemental','elemental',{name:'Стихия пустоты',names:{ru:'Стихия пустоты',en:'Void elemental',es:'Elemental del vacío'},level:40,hp:500,attack:67,xp:360,gold:46,speed:88,loot:'elemental',defense:15,magicDefense:35,magic:true}),
 forestGuardian:mechanics('treant','heavy',{ name:'Страж чащи · мини-босс',names:{ru:'Страж чащи · мини-босс',en:'Grove guardian · miniboss',es:'Guardián del bosque · minijefe'},level:5,hp:750,attack:20,xp:160,gold:70,speed:55,loot:'guardian',boss:true,respawnMs:2400000})
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
 const delta=Math.max(0,level-base.level),downscale=Math.min(1,(level+5)/(base.level+5)),boss=!!descriptor.bossType||base.boss;
 // Dungeon species can be introduced below their outdoor level. A Lv5
 // skeleton must not silently retain Lv14 damage, defence and XP rewards.
 // Outdoor encounters at or above the species' level keep their exact stats.
 const hp=(base.hp*downscale+delta*16+delta*delta*.55)*(descriptor.bossType?(base.boss?(descriptor.bossType==='world'?4:descriptor.bossType==='dungeon'?2:1):(descriptor.bossType==='world'?12:descriptor.bossType==='dungeon'?8:6)):1);
 return {...base,assetSize:descriptor.bossType==='world'?360:boss?280:220,visualScale:descriptor.bossType==='world'?1.9:boss?1.45:1,...(descriptor.names?{names:descriptor.names}:{}),level,boss,bossTheme:descriptor.bossTheme||null,bossType:descriptor.bossType||(base.boss?'mini':null),defense:(base.defense||0)*downscale+delta*.8,
  magicDefense:Math.round((base.magicDefense??((base.defense||0)*.6))*downscale+delta*.65),hp:Math.round(hp*(descriptor.hpMultiplier||1)),attack:Math.round((base.attack*downscale+delta*2)*(descriptor.damageMultiplier||1)),
  xp:descriptor.xp||Math.round((base.xp*downscale+delta*12)*(boss?3:1)),gold:descriptor.gold||Math.round((base.gold*downscale+delta)*(boss?7:1)),
  respawnMs:descriptor.respawnMs||(boss?2400000:11000)};
}
