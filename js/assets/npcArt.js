const packs=[
 ['forest-residents',['mira','borin','aldric','elia']],
 ['river-residents',['tera','sella','oren','tovis']],
 ['oak-north',['ronan','lyra','bram','freya']],
 ['highpass',['gunnar','ysra','torvin','ida']],
 ['ancient-residents',['skeld','aster','sera','orion']],
 ['nyx',['nyx']]
];
const feet={ronan:231,lyra:226,bram:229,freya:229,gunnar:229,ysra:226,torvin:226,ida:222,skeld:242.5,aster:246.5,sera:245,orion:249,nyx:244};
const compactPacks=new Set(['oak-north','highpass']);
// One shared texture lease per pack, only for residents in streamed chunks.
export const NPC_ART=Object.freeze(Object.fromEntries(packs.flatMap(([pack,ids])=>ids.map(id=>[id,{key:'actor-'+pack,url:'assets/actors/npcs/'+pack+'.png',atlasURL:'assets/actors/npcs/'+pack+'.json',originY:(feet[id]||242)/256,scale:compactPacks.has(pack)?.43:.36}]))));
