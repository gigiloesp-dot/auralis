// Decorative buildings, trees and preview NPCs. Returns collision circles.
export function createLandmarks(scene){
 const labels={ru:{mira:'Мира · поручения и торговля',borin:'Борин · общее хранилище',forest:'ЛЕСНАЯ ДОЛИНА'},en:{mira:'Mira · quests and shop',borin:'Borin · shared storage',forest:'FOREST VALLEY'},es:{mira:'Mira · misiones y tienda',borin:'Borin · almacén compartido',forest:'VALLE DEL BOSQUE'}};
 const text=labels[scene.language]||labels.ru;
 const obstacles=[];
  const texture=(key,width,height,draw)=>{if(scene.textures.exists(key))return;const g=scene.make.graphics({x:0,y:0,add:false});draw(g);g.generateTexture(key,width,height);g.destroy();};
  texture('auralis-house-1',160,180,g=>{
   g.fillStyle(0x000000,.22).fillEllipse(80,147,132,40);
   g.fillStyle(0xcab58b).fillRoundedRect(27,76,106,70,6);
   g.fillStyle(0x654334).fillTriangle(12,79,80,19,148,79);
   g.fillStyle(0x8c5a3b).fillRect(68,118,24,28);
   g.fillStyle(0x432e22).fillRect(72,122,16,24);
  });
  const house=(x,y)=>{scene.add.image(x,y,'auralis-house-1').setOrigin(.5,130/180).setDepth(y);obstacles.push({x,y:y-14,r:65});};
  house(865,885);house(990,885);house(865,1010);
  texture('auralis-tree-1',140,180,g=>{
   g.fillStyle(0x0b2114,.25).fillEllipse(70,165,55,18);
   g.fillStyle(0x6e4931).fillRect(64,96,12,68);
   g.fillStyle(0x2c5a33).fillEllipse(53,90,59,64);
   g.fillStyle(0x377745).fillEllipse(88,83,60,66);
   g.fillStyle(0x478a4a).fillEllipse(70,61,65,55);
  });
  const tree=(x,y,size=1)=>{scene.add.image(x,y,'auralis-tree-1').setOrigin(.5,160/180).setScale(size).setDepth(y);obstacles.push({x,y:y-9,r:24*size});};
  for(let i=0;i<105;i++){let x=100+(i*337)%2200,y=110+(i*587)%2180;if(Math.abs(x-1190)<180||Math.abs(y-1150)<170||x>750&&x<1080&&y>730&&y<1100)continue;tree(x,y,.8+(i%4)*.13);}
  const npc=(x,y,name,color)=>{const c=scene.add.container(x,y).setDepth(y);c.add(scene.add.ellipse(0,2,29,10,0x07190e,.35));c.add(scene.add.ellipse(0,-24,24,31,color));c.add(scene.add.circle(0,-46,11,0xe7bd92));scene.add.text(x,y-82,name,{fontFamily:'Arial',fontSize:'14px',color:'#fff6ce',stroke:'#19231a',strokeThickness:3}).setOrigin(.5).setDepth(y+1);};
  npc(935,1080,text.mira,0x466aa1);npc(1090,1000,text.borin,0x9b5c40);
  scene.add.text(1180,1180,text.forest,{fontFamily:'Georgia',fontSize:'28px',color:'#fff4ca',stroke:'#243521',strokeThickness:5}).setOrigin(.5).setDepth(10000);
 
 return obstacles;
}
