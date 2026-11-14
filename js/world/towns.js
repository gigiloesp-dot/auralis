const town=(id,region,x,y,names)=>Object.freeze({id,region,x,y,name:names.ru,names:Object.freeze(names),spawn:Object.freeze({x,y}),safeRadius:120});
export const TOWNS=Object.freeze({
 forestVillage:town('forestVillage','forest',1030,1140,{ru:'Лесная деревня',en:'Forest village',es:'Aldea del bosque'}),
 riverhaven:town('riverhaven','forest',5250,5200,{ru:'Речная гавань',en:'Riverhaven',es:'Puerto del río'}),
 oakwatch:town('oakwatch','forest',9700,9500,{ru:'Дубовая стража',en:'Oakwatch',es:'Guardia del roble'}),
 frostford:town('frostford','north',1500,1800,{ru:'Морозный брод',en:'Frostford',es:'Vado helado'}),
 highpass:town('highpass','north',10300,10600,{ru:'Высокий перевал',en:'Highpass',es:'Paso alto'}),
 dawncamp:town('dawncamp','ancient',1600,1800,{ru:'Лагерь рассвета',en:'Dawn camp',es:'Campamento del alba'}),
 elderSanctum:town('elderSanctum','ancient',11700,11400,{ru:'Древнее святилище',en:'Elder sanctum',es:'Santuario ancestral'})
});
export const getRegionTowns=region=>Object.values(TOWNS).filter(town=>town.region===region);
export function nearestTown(hero){
 const available=getRegionTowns(hero.region);const towns=available.length?available:[TOWNS.forestVillage];
 return towns.reduce((nearest,town)=>Math.hypot(hero.x-town.x,hero.y-town.y)<Math.hypot(hero.x-nearest.x,hero.y-nearest.y)?town:nearest);
}
// Explicit anchors remain available to scripted encounters; ordinary deaths choose
// the nearest settlement in the current region instead of silently changing maps.
export function respawnAtTown(hero,town=nearestTown(hero)){
 hero.region=town.region;hero.x=town.spawn.x;hero.y=town.spawn.y;
 hero.hp=Math.max(1,Math.round(hero.maxHp*.4));hero.mp=Math.max(0,Math.round(hero.maxMp*.4));return hero;
}
