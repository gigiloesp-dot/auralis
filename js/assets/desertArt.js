const url=name=>new URL('../../assets/world/desert/'+name,import.meta.url).href;
export const DESERT_ART=Object.freeze({key:'desertEnvironment',entry:{type:'atlas',url:url('props.png'),atlasURL:url('props.json')}});
const bases={palm:476,house:466,tower:468,wall:468};
export const desertFrame=kind=>Object.hasOwn(bases,kind)?{texture:DESERT_ART.key,frame:kind,originX:.5,originY:bases[kind]/512,scale:176/512}:null;
