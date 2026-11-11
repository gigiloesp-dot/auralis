// Visual ground only; no gameplay or character state.
export function drawTerrain(ground,worldSize){
  const g=ground;g.fillStyle(0x527b43);g.fillRect(0,0,worldSize,worldSize);
  for(let i=0;i<1900;i++){const x=(i*7919+29)%worldSize,y=(i*3929+67)%worldSize,r=2+(i%5);g.fillStyle(i%3?0x668c50:0x3f6e3d,.3);g.fillEllipse(x,y,r*2,r);}
  g.fillStyle(0xa89a6d);g.fillRoundedRect(1100,0,180,worldSize,65);g.fillRoundedRect(0,1080,worldSize,140,55);
  g.lineStyle(3,0x83734f,.22);g.strokeRoundedRect(1100,0,180,worldSize,65);
 
}
