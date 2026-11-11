// Decorative buildings, trees and preview NPCs. Returns collision circles.
export function createLandmarks(scene){
 const obstacles=[];
  obstacles=[];
  const house=(x,y)=>{const base=scene.add.graphics().setPosition(x,y).setDepth(y);
   base.fillStyle(0x000000,.22).fillEllipse(0,17,132,40);
   base.fillStyle(0xcab58b).fillRoundedRect(-53,-54,106,70,6);
   base.fillStyle(0x654334).fillTriangle(-68,-51,0,-111,68,-51);
   base.fillStyle(0x8c5a3b).fillRect(-12,-12,24,28);
   base.fillStyle(0x432e22).fillRect(-8,-8,16,24);
   obstacles.push({x,y:y-14,r:65});};
  house(865,885);house(990,885);house(865,1010);
  const tree=(x,y,size=1)=>{const c=scene.add.container(x,y).setDepth(y);c.add(scene.add.ellipse(0,5,55*size,18*size,0x0b2114,.25));c.add(scene.add.rectangle(0,-30*size,12*size,68*size,0x6e4931));c.add(scene.add.ellipse(-17*size,-70*size,59*size,64*size,0x2c5a33));c.add(scene.add.ellipse(18*size,-77*size,60*size,66*size,0x377745));c.add(scene.add.ellipse(0,-99*size,65*size,55*size,0x478a4a));obstacles.push({x,y:y-9,r:24*size});};
  for(let i=0;i<105;i++){let x=100+(i*337)%2200,y=110+(i*587)%2180;if(Math.abs(x-1190)<180||Math.abs(y-1150)<170||x>750&&x<1080&&y>730&&y<1100)continue;tree(x,y,.8+(i%4)*.13);}
  const npc=(x,y,name,color)=>{const c=scene.add.container(x,y).setDepth(y);c.add(scene.add.ellipse(0,2,29,10,0x07190e,.35));c.add(scene.add.ellipse(0,-24,24,31,color));c.add(scene.add.circle(0,-46,11,0xe7bd92));scene.add.text(x,y-82,name,{fontFamily:'Arial',fontSize:'14px',color:'#fff6ce',stroke:'#19231a',strokeThickness:3}).setOrigin(.5).setDepth(y+1);};
  npc(935,1080,'Мира · торговец',0x466aa1);npc(1090,1000,'Борин · кузнец',0x9b5c40);
  scene.add.text(1180,1180,'ЛЕСНАЯ ДОЛИНА',{fontFamily:'Georgia',fontSize:'28px',color:'#fff4ca',stroke:'#243521',strokeThickness:5}).setOrigin(.5).setDepth(10000);
 
 return obstacles;
}
