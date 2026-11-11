// Static terrain is rasterized once into small reusable textures. Keeping each
// tile <=1024 also works on devices that cannot upload a 2400px world texture.
const TILE_SIZE=1024;
const TERRAIN_REVISION=1;
export function drawTerrain(ground,worldSize,offsetX=0,offsetY=0,width=worldSize,height=worldSize){
 const g=ground;g.fillStyle(0x527b43);g.fillRect(0,0,width,height);
 for(let i=0;i<1900;i++){
  const x=(i*7919+29)%worldSize-offsetX,y=(i*3929+67)%worldSize-offsetY,r=2+(i%5);
  if(x+r<0||y+r<0||x-r>width||y-r>height)continue;
  g.fillStyle(i%3?0x668c50:0x3f6e3d,.3);g.fillEllipse(x,y,r*2,r);
 }
 g.fillStyle(0xa89a6d);g.fillRoundedRect(1100-offsetX,-offsetY,180,worldSize,65);g.fillRoundedRect(-offsetX,1080-offsetY,worldSize,140,55);
 g.lineStyle(3,0x83734f,.22);g.strokeRoundedRect(1100-offsetX,-offsetY,180,worldSize,65);
}
export function createTerrain(scene,worldSize){
 const terrain=scene.add.container(0,0).setDepth(-50);
 for(let y=0;y<worldSize;y+=TILE_SIZE)for(let x=0;x<worldSize;x+=TILE_SIZE){
  const width=Math.min(TILE_SIZE,worldSize-x),height=Math.min(TILE_SIZE,worldSize-y);
  const key=`auralis-ground-${TERRAIN_REVISION}-${worldSize}-${x}-${y}`;
  if(!scene.textures.exists(key)){
   const graphics=scene.make.graphics({x:0,y:0,add:false});
   drawTerrain(graphics,worldSize,x,y,width,height);
   graphics.generateTexture(key,width,height);graphics.destroy();
  }
  terrain.add(scene.add.image(x,y,key).setOrigin(0));
 }
 return terrain;
}
