import { AttackCycle } from '../combat/attackTiming.js';
import { respawnAtTown } from './towns.js';
import { MonsterSystem } from '../monsters/MonsterSystem.js';
import { drawTerrain } from './render/Terrain.js';
import { createLandmarks } from './render/Landmarks.js';
import { Save } from '../systems/save.js';
import { HeroRig } from '../characters/HeroRig.js';
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
  drawTerrain(this.ground,WORLD);
  this.obstacles=createLandmarks(this);
  const saved=Save.load();
  this.hero=createCharacter({...saved,x:clamp(saved?.x??WORLD/2,45,WORLD-45),y:clamp(saved?.y??WORLD/2,45,WORLD-45)});
  this.shadow=this.add.ellipse(0,0,32,13,0x071d13,.4).setDepth(10);
  this.body=this.add.container(0,0).setDepth(12);
  this.drawHero();
  this.cameras.main.startFollow(this.body,true,.12,.12);
  this.cameras.main.setBounds(0,0,WORLD,WORLD);
  this.resizeViewport(this.scale.width,this.scale.height);
  this.scale.on('resize',this.onGameResize,this);
  this.setupControls();
  this.monsters=new MonsterSystem(this,this.hero,()=>{this.refreshHud();this.save();});
  this.attackCycle=new AttackCycle();
  this.events.once('shutdown',()=>{this.save();this.controls?.destroy();this.monsters?.destroy();this.scale.off('resize',this.onGameResize,this);});
  window.addEventListener('pagehide',()=>this.save());
  document.addEventListener('visibilitychange',()=>{if(document.hidden)this.save();});
  this.refreshHud();
 }
 onGameResize(gameSize){this.resizeViewport(gameSize.width,gameSize.height);}
 resizeViewport(width,height){if(!width||!height)return;const camera=this.cameras.main;camera.setSize(width,height);camera.setZoom(clamp(Math.min(width/840,height/460),.7,1.3));camera.setBounds(0,0,WORLD,WORLD);if(this.hero)camera.centerOn(this.hero.x,this.hero.y);}
 drawHero(){this.body.removeAll(true);this.rig=new HeroRig(this,this.body);}
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
  this.body.x=h.x;this.body.y=h.y;this.body.setDepth(h.y+2);
  this.shadow.setPosition(h.x,h.y+7).setDepth(h.y-1);
  const held=this.controls?.attacking??false;
  if(held)this.attackCycle.start(now,h);
  const swing=this.attackCycle.state(now);
  if(swing.impact)this.monsters.attack(now,this.facing);
  this.rig.update(dt,this.axis,swing,this.facing);
  this.monsters.update(now,dt);
  if(h.hp<=0){respawnAtTown(h);this.save();this.refreshHud();}
  if(now-this.lastSave>GAME_CONFIG.autosaveMs){this.lastSave=now;this.save();this.refreshHud();}
 }
 save(){if(this.hero)Save.write(this.hero);}
 refreshHud(){updateHud(this.hero);}
}