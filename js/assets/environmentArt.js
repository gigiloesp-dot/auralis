// Six real, unmodified painted static props. Cliff/ice and the two alternate
// ruin shapes remain independent procedural fallbacks in the world renderer.
const url=name=>new URL('../../assets/world/painted/'+name,import.meta.url).href;
const anchors={oak:480,pine:480,cypress:482,rock:464,ruin:456,house:460};
const frames=Object.freeze({oak:0,pine:1,cypress:2,rock:3,ruin:4,house:5});
const anchorScale=Object.freeze(Object.fromEntries(Object.entries(anchors).map(([kind,baseline])=>[kind,Object.freeze({originX:.5,originY:baseline/512,scale:176/512})])));
export const ENVIRONMENT_ART=Object.freeze({
 key:'paintedEnvironment',
 entry:Object.freeze({type:'atlas',url:url('environment-props.png'),atlasURL:url('environment-props.json')}),
 frameWidth:512,frameHeight:512,frames,anchorScale,
 originX:.5,originY:480/512,worldScale:176/512
});
export const environmentFrame=kind=>Object.hasOwn(frames,kind)?{texture:ENVIRONMENT_ART.key,frame:kind,...anchorScale[kind]}:null;
