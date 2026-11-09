import { Save } from '../systems/save.js';
import { createCharacter } from '../characters/Character.js';
import { updateHud } from '../ui/hud.js';
import { TouchControls } from '../input/TouchControls.js';
import { queueAssets } from '../assets/AssetLoader.js';
import { GAME_CONFIG } from '../config/gameConfig.js';
const WORLD=GAME_CONFIG.worldPreviewSize;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export class WorldScene extends Phaser.Scene{
 constructor(){super('world');this.axis={x:0,y:0};this.facing=0;this.lastSave=0;this.attackUntil=0;}
 preload(){queueAssets(this);}
 create(){
  this.cameras.main.setBackgroundColor('#426b3b');
  this.ground=this.add.graphics().setDepth(-50);
  this.drawGround();
  this.addLandmarks();
  const saved=Save.load();
  this.hero=createCharacter({classId:saved?.classId??'warrior',x:clamp(saved?.x??WORLD/2,45,WORLD-45),y:clamp(saved?.y??WORLD/2,45,WORLD-45),hp:saved?.hp??100,level:saved?.level??1});
  this.shadow=this.add.ellipse(0,0,32,13,0x071d13,.4).setDepth(10);
  this.body=this.add.container(0,0).setDepth(12);
  this.drawHero();
  this.cameras.main.startFollow(this.body,true,.12,.12);
  this.cameras.main.setBounds(0,0,WORLD,WORLD);
  this.resizeViewport(this.scale.width,this.scale.height);
  this.scale.on('resize',this.onGameResize,this);
  this.setupControls();
  this.events.once('shutdown',()=>{this.save();this.controls?.destroy();this.scale.off('resize',this.onGameResize,this);});
  window.addEventListener('pagehide',()=>this.save());
  document.addEventListener('visibilitychange',()=>{if(document.hidden)this.save();});
  this.refreshHud();
 }
 onGameResize(gameSize){this.resizeViewport(gameSize.width,gameSize.height);}
 resizeViewport(width,height){if(!width||!height)return;const camera=this.cameras.main;camera.setSize(width,height);camera.setZoom(clamp(Math.min(width/840,height/460),.7,1.3));camera.setBounds(0,0,WORLD,WORLD);if(this.hero)camera.centerOn(this.hero.x,this.hero.y);}
 drawGround(){
  const g=this.ground;g.fillStyle(0x527b43);g.fillRect(0,0,WORLD,WORLD);
  for(let i=0;i<1900;i++){const x=(i*7919+29)%WORLD,y=(i*3929+67)%WORLD,r=2+(i%5);g.fillStyle(i%3?0x668c50:0x3f6e3d,.3);g.fillEllipse(x,y,r*2,r);}
  g.fillStyle(0xa89a6d);g.fillRoundedRect(1100,0,180,WORLD,65);g.fillRoundedRect(0,1080,WORLD,140,55);
  g.lineStyle(3,0x83734f,.22);g.strokeRoundedRect(1100,0,180,WORLD,65);
 }
 addLandmarks(){
  this.obstacles=[];
  const house=(x,y)=>{const base=this.add.graphics().setPosition(x,y).setDepth(y);
   base.fillStyle(0x000000,.22).fillEllipse(0,17,132,40);
   base.fillStyle(0xcab58b).fillRoundedRect(-53,-54,106,70,6);
   base.fillStyle(0x654334).fillTriangle(-68,-51,0,-111,68,-51);
   base.fillStyle(0x8c5a3b).fillRect(-12,-12,24,28);
   base.fillStyle(0x432e22).fillRect(-8,-8,16,24);
   this.obstacles.push({x,y:y-14,r:65});};
  house(865,885);house(990,885);house(865,1010);
  const tree=(x,y,size=1)=>{const c=this.add.container(x,y).setDepth(y);c.add(this.add.ellipse(0,5,55*size,18*size,0x0b2114,.25));c.add(this.add.rectangle(0,-30*size,12*size,68*size,0x6e4931));c.add(this.add.ellipse(-17*size,-70*size,59*size,64*size,0x2c5a33));c.add(this.add.ellipse(18*size,-77*size,60*size,66*size,0x377745));c.add(this.add.ellipse(0,-99*size,65*size,55*size,0x478a4a));this.obstacles.push({x,y:y-9,r:24*size});};
  for(let i=0;i<105;i++){let x=100+(i*337)%2200,y=110+(i*587)%2180;if(Math.abs(x-1190)<180||Math.abs(y-1150)<170||x>750&&x<1080&&y>730&&y<1100)continue;tree(x,y,.8+(i%4)*.13);}
  const npc=(x,y,name,color)=>{const c=this.add.container(x,y).setDepth(y);c.add(this.add.ellipse(0,2,29,10,0x07190e,.35));c.add(this.add.ellipse(0,-24,24,31,color));c.add(this.add.circle(0,-46,11,0xe7bd92));this.add.text(x,y-82,name,{fontFamily:'Arial',fontSize:'14px',color:'#fff6ce',stroke:'#19231a',strokeThickness:3}).setOrigin(.5).setDepth(y+1);};
  npc(935,1080,'Мира · торговец',0x466aa1);npc(1090,1000,'Борин · кузнец',0x9b5c40);
  this.add.text(1180,1180,'ЛЕСНАЯ ДОЛИНА',{fontFamily:'Georgia',fontSize:'28px',color:'#fff4ca',stroke:'#243521',strokeThickness:5}).setOrigin(.5).setDepth(10000);
 }
 drawHero(){
  const b=this.body;b.removeAll(true);
  b.add(this.add.ellipse(0,-15,27,36,0x4d6483));
  b.add(this.add.ellipse(0,-41,24,27,0xe6b78d));
  b.add(this.add.ellipse(0,-52,28,14,0x503927));
  this.leftLeg=this.add.rectangle(-7,8,10,25,0x463c37);this.rightLeg=this.add.rectangle(7,8,10,25,0x463c37);
  b.addAt(this.leftLeg,0);b.addAt(this.rightLeg,1);
  this.leftArm=this.add.rectangle(-19,-17,10,28,0xc7a37f);this.rightArm=this.add.rectangle(19,-17,10,28,0xc7a37f);
  b.add(this.leftArm);b.add(this.rightArm);
  this.weapon=this.add.rectangle(27,-25,5,35,0xb6c0c6);this.weapon.rotation=.3;b.add(this.weapon);
  b.add(this.add.triangle(0,-39,-5,0,0,5,5,0,0x3a302a));
 }
 setupControls(){this.controls=new TouchControls();this.axis=this.controls.axis;}

 update(now,delta){
  const dt=Math.min(delta,40)/1000,h=this.hero;if(!h)return;
  const mag=Math.hypot(this.axis.x,this.axis.y),speed=h.speed;
  if(mag>.08){
   let dx=this.axis.x/mag*speed*dt,dy=this.axis.y/mag*speed*dt;
   const allowed=(x,y)=>!this.obstacles.some(o=>Math.hypot(x-o.x,y-o.y)<o.r+12);
   if(allowed(h.x+dx,h.y))h.x=clamp(h.x+dx,20,WORLD-20);
   if(allowed(h.x,h.y+dy))h.y=clamp(h.y+dy,20,WORLD-20);
   this.facing=Math.atan2(dy,dx);
  }
  const walk=mag>.08?Math.sin(now*.013)*8:0;
  this.leftLeg.y=8+walk;this.rightLeg.y=8-walk;
  this.leftArm.rotation=walk*.025;this.rightArm.rotation=-walk*.025;
  this.body.x=h.x;this.body.y=h.y;this.body.setDepth(h.y+2);
  this.shadow.setPosition(h.x,h.y+7).setDepth(h.y-1);
  this.body.scaleX=Math.cos(this.facing)<-.1?-1:1;
  this.weapon.rotation=this.controls?.attacking?Math.sin(now*.045)*1.2:.3;
  if(now-this.lastSave>GAME_CONFIG.autosaveMs){this.lastSave=now;this.save();this.refreshHud();}
 }
 save(){if(this.hero)Save.write(this.hero);}
 refreshHud(){updateHud(this.hero);}
}