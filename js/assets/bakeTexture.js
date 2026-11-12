// Phaser3.90 Graphics.generateTexture uses a shared offscreen camera whose
// renderList retains temporary Graphics objects until explicitly cleared.
// This adapter owns the temporary source and releases it even on bake failure.
export function bakeTexture(graphics,key,width,height){
 try{graphics.generateTexture(key,width,height);}
 finally{
  const camera=globalThis.Phaser?.GameObjects?.Graphics?.TargetCamera;
  if(camera?.renderList)camera.renderList.length=0;
  graphics.destroy();
 }
}
