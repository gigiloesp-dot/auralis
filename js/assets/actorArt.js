// Only produced atlases belong here. Missing families retain their existing rig.
export const ACTOR_ART=Object.freeze({
 warrior:{key:'actor-warrior',url:'assets/actors/heroes/warrior.png',atlasURL:'assets/actors/heroes/warrior.json',scale:.40,baselines:{idle:246,'run-a':230,'run-b':224,attack:220},equipment:true},
 forestWolf:{key:'actor-forest-wolf',url:'assets/actors/monsters/forestWolf.png',atlasURL:'assets/actors/monsters/forestWolf.json',scale:.35,baselines:{idle:225,'run-a':225,'run-b':225,attack:225}}
});
export const ACTOR_DIRECTIONS=Object.freeze(['e','se','s','sw','w','nw','n','ne']);
export function actorPose(state,angle,elapsed,progress=0){
 const direction=ACTOR_DIRECTIONS[(Math.round(angle/(Math.PI/4))+8)%8];
 const bank=state==='run'?(Math.floor(elapsed*9)%2?'run-b':'run-a'):['attack','special'].includes(state)&&progress>.22&&progress<.94?'attack':'idle';
 return {bank,direction,frame:bank+'/'+direction};
}
