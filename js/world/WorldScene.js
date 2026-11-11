import {SavePanel} from '../ui/SavePanel.js';
import {SharedStorage} from '../systems/storage.js';
import {StoragePanel} from '../ui/StoragePanel.js';
import {usePotion} from '../systems/potions.js';
import {text} from '../i18n/messages.js';
import {Minimap} from '../ui/Minimap.js';
import { NpcPanel } from '../ui/NpcPanel.js';
import {normalizeSkillSlots} from '../skills/skillSlots.js';
import {getSkills} from '../skills/skillData.js';
import { SkillsPanel } from '../ui/SkillsPanel.js';
import { CharacterPanel } from '../ui/CharacterPanel.js';
import { InventoryPanel } from '../ui/InventoryPanel.js';
import { AttackCycle } from '../combat/attackTiming.js';
import { respawnAtTown } from './towns.js';
import { MonsterSystem } from '../monsters/MonsterSystem.js';
import { createTerrain } from './render/Terrain.js';
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
  this.ground=createTerrain(this,WORLD);
  this.language=localStorage.getItem('auralis_language')||'ru';
  this.obstacles=createLandmarks(this);
  this.saveSlot=Save.activeSlot;
  this.playNow=0;this.lastSave=0;this.lastHud=0;this.closed=false;
  SharedStorage.load();
  const saved=Save.load(this.saveSlot);
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
  this.inventoryPanel=new InventoryPanel(this);
  this.characterPanel=new CharacterPanel(this);
  this.skillsPanel=new SkillsPanel(this);
  this.npcPanel=new NpcPanel(this);
  this.storagePanel=new StoragePanel(this);
  this.canRestoreCharacter=data=>data.region==='forest'&&data.x>=0&&data.y>=0&&data.x<=WORLD&&data.y<=WORLD;
  this.savePanel=new SavePanel(this);
  this.bindSkills();
  this.bindPotions();
  this.minimap=new Minimap(this,WORLD);
  this.refreshSkillSlots();
  this.onPageHide=()=>this.save();
  this.onVisibilityChange=()=>{if(document.hidden){this.controls?.reset();this.save();}};
  window.addEventListener('pagehide',this.onPageHide);
  document.addEventListener('visibilitychange',this.onVisibilityChange);
  this.events.once('shutdown',()=>{
   this.save();this.closed=true;this.controls?.destroy();this.monsters?.destroy();
   this.inventoryPanel?.destroy();this.characterPanel?.destroy();this.skillsPanel?.destroy();this.npcPanel?.destroy();this.storagePanel?.destroy();this.savePanel?.destroy();this.minimap?.destroy();this.potionRoot?.remove();
   this.skillBindings.forEach(([b,fn])=>b.removeEventListener('click',fn));
   window.removeEventListener('pagehide',this.onPageHide);
   document.removeEventListener('visibilitychange',this.onVisibilityChange);
   this.scale.off('resize',this.onGameResize,this);
  });
  this.refreshHud();
 }
 onGameResize(gameSize){this.resizeViewport(gameSize.width,gameSize.height);}
 resizeViewport(width,height){if(!width||!height)return;const camera=this.cameras.main;camera.setSize(width,height);camera.setZoom(clamp(Math.min(width/840,height/460),.7,1.3));camera.setBounds(0,0,WORLD,WORLD);if(this.hero)camera.centerOn(this.hero.x,this.hero.y);}
 drawHero(){this.body.removeAll(true);this.rig=new HeroRig(this,this.body);}
 setupControls(){this.controls=new TouchControls();this.axis=this.controls.axis;}

 update(now,delta){
  const dt=Math.min(delta,40)/1000,h=this.hero;if(!h)return;
  if(now-this.lastSave>=GAME_CONFIG.autosaveMs){this.lastSave=now;this.save();}
  this.npcPanel?.update();this.storagePanel?.update();
  if(this.inventoryPanel?.opened||this.characterPanel?.opened||this.skillsPanel?.opened||this.npcPanel?.opened||this.storagePanel?.opened||this.savePanel?.opened){this.controls?.reset();return;}
  this.playNow+=dt*1000;
  const combatNow=this.playNow;
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
  if(held)this.attackCycle.start(combatNow,h);
  const swing=this.attackCycle.state(combatNow);
  if(swing.impact)this.monsters.attack(combatNow,this.facing);
  this.rig.update(dt,this.axis,swing,this.facing);
  this.monsters.update(combatNow,dt);
  if(h.hp<=0){respawnAtTown(h);this.attackCycle=new AttackCycle();this.controls?.reset();this.save();this.refreshHud();}
  if(now-this.lastHud>100){this.lastHud=now;this.refreshHud();this.refreshSkillSlots();this.refreshPotions();this.minimap?.update();}
 }
 bindSkills(){
  this.skillBindings=[];
  document.querySelectorAll('#skills .skill').forEach((b,i)=>{
   const fn=()=>{
    if(this.closed||this.inventoryPanel?.opened||this.characterPanel?.opened||this.skillsPanel?.opened||this.npcPanel?.opened||this.storagePanel?.opened||this.savePanel?.opened||!this.sys.isActive())return;
    const id=normalizeSkillSlots(this.hero)[i];
    if(id){const result=this.monsters.useSkill(id,this.playNow);if(!result.ok&&['target','mana'].includes(result.reason))this.notify(text(result.reason==='target'?'noTarget':'mana',this.language));this.refreshSkillSlots();this.refreshHud();}
   };
   b.addEventListener('click',fn);this.skillBindings.push([b,fn]);
  });
 }
 refreshSkillSlots(){
  if(!this.hero)return;
  const ids=normalizeSkillSlots(this.hero),skills=getSkills(this.hero.classId);
  document.querySelectorAll('#skills .skill').forEach((b,i)=>{
   const skill=skills.find(s=>s.id===ids[i]);
   const remaining=skill?this.monsters.skillRemaining(skill.id,this.playNow):0;
   b.textContent=remaining>0?String(Math.ceil(remaining)):skill?skill.icon:String(i+1);
   b.title=skill?skill.name:text('emptySkill',this.language)+' '+(i+1);b.setAttribute('aria-label',b.title);
   b.disabled=!skill||remaining>0||this.hero.mp<skill.mana||this.hero.hp<=0;
  });
 }
 bindPotions(){
  this.potionState={};this.potionRoot=document.createElement('div');this.potionRoot.id='potions';
  this.potionButtons={};
  for(const resource of ['hp','mp']){
   const button=document.createElement('button');button.type='button';button.className='potion '+resource;
   button.setAttribute('aria-label',text(resource+'Potion',this.language));
   button.onclick=()=>{if(this.sys.isActive()&&!this.inventoryPanel?.opened&&!this.characterPanel?.opened&&!this.skillsPanel?.opened&&!this.npcPanel?.opened&&!this.storagePanel?.opened&&!this.savePanel?.opened&&usePotion(this.hero,resource,this.playNow,this.potionState)){this.save();this.refreshHud();this.refreshPotions();}};
   this.potionButtons[resource]=button;this.potionRoot.append(button);
  }
  document.body.append(this.potionRoot);this.refreshPotions();
 }
 refreshPotions(){for(const [resource,b] of Object.entries(this.potionButtons||{})){const left=Math.max(0,Math.ceil(((this.potionState.readyAt||0)-this.playNow)/1000));b.textContent=resource.toUpperCase()+' '+(left||this.hero.potions?.[resource]||0);b.disabled=left>0||!(this.hero.potions?.[resource]>0)||this.hero[resource]>=this.hero[resource==='hp'?'maxHp':'maxMp'];}}
 notify(message){const notice=document.getElementById('notice');notice.textContent=message;}
 save(){if(this.hero&&!this.closed){const ok=Save.write(this.hero,this.saveSlot);if(!ok)this.notify(text('saveFailed',this.language));return ok;}return false;}

 refreshHud(){updateHud(this.hero);}
}
