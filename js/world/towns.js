// Respawn anchors are inside safe settlement areas, not the map center.
export const TOWNS=Object.freeze({forestVillage:{id:'forestVillage',region:'forest',name:'Лесная деревня',spawn:{x:1030,y:1140},safeRadius:120}});
export function respawnAtTown(hero,town=TOWNS.forestVillage){hero.region=town.region;hero.x=town.spawn.x;hero.y=town.spawn.y;hero.hp=Math.max(1,Math.round(hero.maxHp*.4));hero.mp=Math.max(0,Math.round(hero.maxMp*.4));return hero;}
