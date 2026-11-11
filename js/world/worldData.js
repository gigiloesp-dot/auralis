// Region dimensions and progression bounds are gameplay coordinates, not texture sizes.
export const REGIONS=Object.freeze({
 forest:{id:'forest',name:'Лесная долина',names:{ru:'Лесная долина',en:'Forest valley',es:'Valle del bosque'},width:12000,height:12000,minLevel:1,maxLevel:25,spawn:{x:1030,y:1140},palette:{ground:0x527b43,detail:0x668c50,road:0xa89a6d,water:0x487d93}},
 north:{id:'north',name:'Северные земли',names:{ru:'Северные земли',en:'Northern lands',es:'Tierras del norte'},width:14000,height:14000,minLevel:22,maxLevel:38,spawn:{x:1500,y:1800},palette:{ground:0xa5b8bf,detail:0xd1dedc,road:0x8c969a,water:0x6c9ba9}},
 ancient:{id:'ancient',name:'Древние земли',names:{ru:'Древние земли',en:'Ancient lands',es:'Tierras antiguas'},width:15000,height:15000,minLevel:35,maxLevel:42,spawn:{x:1600,y:1800},palette:{ground:0x656e55,detail:0x89966b,road:0x9a947d,water:0x497f79}}
});
export const REGION_IDS=Object.freeze(Object.keys(REGIONS));
export const getRegion=id=>REGIONS[id]||REGIONS.forest;
