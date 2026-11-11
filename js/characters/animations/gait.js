// Eight-way procedural gait. Pure math: independent from Phaser and rendering.
export function gaitPose(phase, direction, moving){
 const run=Math.max(0,Math.min(1,moving));
 const horizontal=Math.cos(direction),side=Math.abs(horizontal);
 const sign=horizontal<0?-1:1;
 const wave=Math.sin(phase);
 const stride=(.58+.09*side)*run;
 return {
  leftHip:wave*stride*((1-side)+sign*side),
  rightHip:-wave*stride*((1-side)+sign*side),
  leftKnee:Math.max(0,-wave*sign)*(.9+.1*side)*run,
  rightKnee:Math.max(0,wave*sign)*(.9+.1*side)*run,
  leftFootX:wave*5.5*side*run*sign,
  rightFootX:-wave*5.5*side*run*sign,
  leftArmSwing:-wave*stride*(.65+.12*side)*((1-side)+sign*side),
  rightArmSwing:wave*stride*(.65+.12*side)*((1-side)+sign*side)
 };
}
