const url=name=>new URL('../../assets/world/climate/'+name,import.meta.url).href;
export const CLIMATE_ART=Object.freeze({key:'climateProps',entry:Object.freeze({type:'atlas',url:url('props.png'),atlasURL:url('props.json')})});
const sizes={ruinHouse:220,ivyWall:190,ruinTower:190,charredTree:176,lavaRock:176,snowPine:185,snowRock:176,cactus:135};
export const climateFrame=kind=>Object.hasOwn(sizes,kind)?{texture:CLIMATE_ART.key,frame:kind,originX:.5,originY:366/384,scale:sizes[kind]/384}:null;
