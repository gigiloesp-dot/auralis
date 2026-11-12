// Only produced atlases belong here. Missing families retain their existing rig.
export const ACTOR_ART=Object.freeze({
 warrior:{key:'actor-warrior',url:'assets/actors/heroes/warrior.png',atlasURL:'assets/actors/heroes/warrior.json',scale:.40,baselines:{idle:246,'run-a':230,'run-b':224,attack:220},equipment:true},
 archer:{key:'actor-archer',url:'assets/actors/heroes/archer.png',atlasURL:'assets/actors/heroes/archer.json',scale:.46,baselines:{idle:242,'run-a':222,'run-b':214,attack:216},equipment:true,weaponType:'bow'},
 mage:{key:'actor-mage',url:'assets/actors/heroes/mage.png',atlasURL:'assets/actors/heroes/mage.json',scale:.40,baselines:{idle:238,'run-a':230,'run-b':227,attack:227},equipment:true,weaponType:'staff'},
 paladin:{key:'actor-paladin',url:'assets/actors/heroes/paladin.png',atlasURL:'assets/actors/heroes/paladin.json',scale:.52,baselines:{idle:230,'run-a':212,'run-b':198,attack:182},equipment:true,weaponType:'sword'},
 assassin:{key:'actor-assassin',url:'assets/actors/heroes/assassin.png',atlasURL:'assets/actors/heroes/assassin.json',scale:.47,baselines:{idle:237,'run-a':218,'run-b':209,attack:201},equipment:true,weaponType:'dagger'},
 cannoneer:{key:'actor-cannoneer',url:'assets/actors/heroes/cannoneer.png',atlasURL:'assets/actors/heroes/cannoneer.json',scale:.50,baselines:{idle:231,'run-a':220,'run-b':210,attack:200},equipment:true,weaponType:'cannon',equipmentScaleY:.78},
 forestWolf:{key:'actor-forest-wolf',url:'assets/actors/monsters/forestWolf.png',atlasURL:'assets/actors/monsters/forestWolf.json',scale:.35,baselines:{idle:225,'run-a':225,'run-b':225,attack:225}}
});
export const ACTOR_DIRECTIONS=Object.freeze(['e','se','s','sw','w','nw','n','ne']);
export function actorPose(state,angle,elapsed,progress=0){
 const direction=ACTOR_DIRECTIONS[(Math.round(angle/(Math.PI/4))+8)%8];
 const bank=state==='run'?(Math.floor(elapsed*9)%2?'run-b':'run-a'):['attack','special'].includes(state)&&progress>.22&&progress<.94?'attack':'idle';
 return {bank,direction,frame:bank+'/'+direction};
}
