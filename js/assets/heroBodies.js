// Neutral adult body atlases are independent of the preserved dressed images.
// Heights and foot registration were measured from the accepted native PNGs.
const bodies={
 warrior:{height:80,width:34,feet:[246,227.5,221,218],heights:[197.5,177.5,177.5,168]},
 archer:{height:80,width:31,feet:[242,219,210.5,215.5],heights:[184,156,159.5,154]},
 mage:{height:82,width:31,feet:[240,227.5,225,226],heights:[216,197.5,193.5,189.5]},
 paladin:{height:82,width:36,feet:[239.5,223.5,208,196],heights:[173,160.5,154.5,133]},
 assassin:{height:80,width:32,feet:[233.5,213.5,202,192],heights:[178.5,150,151.5,131]},
 cannoneer:{height:62,width:42,feet:[229,219,208.5,198],heights:[134,140,138.5,120.5],bodyType:'adult-dwarf'}
};
const banks=['idle','run-a','run-b','attack'];
export const HERO_BASE_ART=Object.freeze(Object.fromEntries(Object.entries(bodies).map(([id,b])=>{
 const scale=b.height/b.heights[0];
 return [id,{key:'actor-'+id+'-base',url:'assets/actors/heroes/base/'+id+'.png',atlasURL:'assets/actors/heroes/base/'+id+'.json',baseBody:true,bakedEquipment:false,underwear:'neutral-gray',bodyType:b.bodyType||'adult-human',bodyDwarf:b.bodyType==='adult-dwarf',bodyHeight:b.height,bodyWidth:b.width,equipment:true,equipmentScaleY:1,scale,baselines:Object.fromEntries(banks.map((bank,i)=>[bank,b.feet[i]])),poseHeights:Object.fromEntries(banks.map((bank,i)=>[bank,b.heights[i]*scale]))}];
})));
