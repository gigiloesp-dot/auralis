// Approximate anatomical sockets for neutral atlases, in world pixels relative
// to the body's foot baseline. These are replaceable estimates, not calibrated
// per-frame art sockets; measured entry.attachments overrides take precedence.
const ANGLES={e:0,se:Math.PI/4,s:Math.PI/2,sw:3*Math.PI/4,w:Math.PI,nw:-3*Math.PI/4,n:-Math.PI/2,ne:-Math.PI/4};
const positive=(value,fallback)=>Number.isFinite(value)&&value>0?value:fallback;
export function bodyAttachments(entry={},frame='idle/s',direction=frame.split('/')[1]||'s',state='idle',pose={}){
 const bank=frame.split('/')[0],angle=ANGLES[direction]??ANGLES.s;
 const height=positive(entry.poseHeights?.[bank],positive(entry.bodyHeight,90));
 const width=positive(entry.bodyWidth,height*((entry.bodyDwarf||entry.bodyType==='adult-dwarf')?.58:.37));
 const dx=Math.cos(angle),dy=Math.sin(angle),back=dy<-.3;
 const lateral=-dy,depth=dx*.08,attack=bank==='attack',run=bank.startsWith('run-');
 const stride=run?(bank==='run-a'?1:-1):0;
 const lean=attack?dx*width*.1:run?dx*width*.04:0;
 const point=(x,y)=>({x,y});
 const armSpread=width*(Math.abs(dx)>.9?.16:.48),handY=-height*.43;
 let rightHand=point(lean+lateral*armSpread+depth*width,handY+dx*height*.025);
 let leftHand=point(lean-lateral*armSpread-depth*width,handY-dx*height*.025);
 if(attack){
  rightHand=point(rightHand.x+dx*width*.4,rightHand.y+dy*height*.08+height*.04);
  leftHand=point(leftHand.x+dx*width*.1,leftHand.y-height*.025);
  if(entry.weaponType==='bow'||entry.id==='archer'){
   leftHand=point(lean+dx*width*.7-lateral*width*.12,-height*.60+dy*height*.06);
   rightHand=point(lean-dx*width*.05+lateral*width*.2,-height*.59);
  }
 }else if(run){
  rightHand.x+=dx*width*.12*stride;leftHand.x-=dx*width*.12*stride;
  rightHand.y-=height*.025*stride;leftHand.y+=height*.025*stride;
 }
 // The cannon is supported along its barrel with the anatomical left hand.
 if(entry.weaponType==='cannon'){
  const aim=Math.atan2(dy*.45,dx);
  leftHand=point(rightHand.x+Math.cos(aim)*height*.18,rightHand.y+Math.sin(aim)*height*.18+height*.055);
 }
 const footSpread=width*(Math.abs(dx)>.9?.12:.23);
 const rightFoot=point(lateral*footSpread+dx*width*.35*stride,stride>0?-height*.09:0);
 const leftFoot=point(-lateral*footSpread-dx*width*.35*stride,stride<0?-height*.09:0);
 const anchors={height,width,angle,back,bank,head:point(lean*.6,-height*.91),neck:point(lean*.8,-height*.79),chest:point(lean,-height*.65),hips:point(lean*.4,-height*.39),rightHand,leftHand,rightFoot,leftFoot};
 const overrides=entry.attachments?.[frame];
 if(overrides)for(const [key,value]of Object.entries(overrides)){
  if(value&&typeof value==='object'&&Number.isFinite(value.x)&&Number.isFinite(value.y))anchors[key]={...value};
 }
 return anchors;
}
export default bodyAttachments;
