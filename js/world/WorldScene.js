import {SavePanel} from '../ui/SavePanel.js';
import {SharedStorage} from '../systems/storage.js';
import {StoragePanel} from '../ui/StoragePanel.js';
import {NpcPanel} from '../ui/NpcPanel.js';
import {SkillsPanel} from '../ui/SkillsPanel.js';
import {CharacterPanel} from '../ui/CharacterPanel.js';
import {InventoryPanel} from '../ui/InventoryPanel.js';
import {DungeonPanel} from '../ui/DungeonPanel.js';
import {Minimap} from '../ui/Minimap.js';
import {MapPanel} from '../ui/MapPanel.js';
import {BattleHud} from '../ui/BattleHud.js';
import {AttackCycle} from '../combat/attackTiming.js';
import {Save} from '../systems/save.js';
import {HeroRig} from '../characters/HeroRig.js';
import {createCharacter} from '../characters/Character.js';
import {updateHud} from '../ui/hud.js';
import {TouchControls} from '../input/TouchControls.js';
import {queueAssets} from '../assets/AssetLoader.js';
import {GAME_CONFIG} from '../config/gameConfig.js';
import {text} from '../i18n/messages.js';
import {WorldRuntime} from './WorldRuntime.js';
import {generateArenaContent} from './arena.js';
import {REGIONS} from './worldData.js';
import {projectAngle} from './projection.js';
import {dungeonContentForHero} from '../dungeons/dungeonSystem.js';
import {updateQuestProgress} from '../quests/quests.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const PANEL_NAMES=['inventoryPanel','characterPanel','skillsPanel','npcPanel','storagePanel','savePanel','mapPanel','dungeonPanel'];
export class WorldScene extends Phaser.Scene{
 constructor(){super('world');}
 preload(){queueAssets(this);}
 create(){
  this.language=localStorage.getItem('auralis_language')||'ru';this.saveSlot=Save.activeSlot;this.closed=false;this.playNow=0;this.lastSave=0;this.lastHud=0;this.facing=0;
  SharedStorage.load();this.hero=createCharacter(Save.load(this.saveSlot)||{x:1030,y:1140});
  this.cameras.main.setBackgroundColor('#263b39');this.shadow=this.add.ellipse(0,0,32,13,0x071d13,.4);this.body=this.add.container(0,0);this.rig=new HeroRig(this,this.body);
  this.controls=new TouchControls();this.axis=this.controls.axis;this.attackCycle=new AttackCycle();this.world=new WorldRuntime(this);this.cameras.main.startFollow(this.body,true,.16,.16);this.resizeViewport(this.scale.width,this.scale.height);this.scale.on('resize',this.onGameResize,this);
  this.inventoryPanel=new InventoryPanel(this);this.characterPanel=new CharacterPanel(this);this.skillsPanel=new SkillsPanel(this);this.npcPanel=new NpcPanel(this);this.storagePanel=new StoragePanel(this);this.dungeonPanel=new DungeonPanel(this);this.mapPanel=new MapPanel(this);
  this.canRestoreCharacter=data=>{const c=(data.region==='arena'?generateArenaContent(data):dungeonContentForHero(data))||REGIONS[data.region];return !!c&&data.x>=0&&data.y>=0&&data.x<=c.width&&data.y<=c.height;};this.savePanel=new SavePanel(this);this.battleHud=new BattleHud(this);this.minimap=new Minimap(this);
  this.onPageHide=()=>this.save();this.onVisibilityChange=()=>{if(document.hidden){this.controls.reset();this.save();}};window.addEventListener('pagehide',this.onPageHide);document.addEventListener('visibilitychange',this.onVisibilityChange);
  this.events.once('shutdown',()=>{this.save();this.closed=true;this.controls.destroy();this.monsters.destroy();this.world.destroy();for(const name of PANEL_NAMES){this[name]?.destroy();this[name]=null;}this.battleHud.destroy();this.minimap.destroy();window.removeEventListener('pagehide',this.onPageHide);document.removeEventListener('visibilitychange',this.onVisibilityChange);this.scale.off('resize',this.onGameResize,this);});this.refreshHud();
 }
 panelsOpen(){return PANEL_NAMES.some(name=>this[name]?.opened);}
 closePanels(except){for(const name of PANEL_NAMES)if(this[name]!==except)this[name]?.close();this.controls?.reset();}
 onGameResize(size){this.resizeViewport(size.width,size.height);}
 resizeViewport(width,height){if(!width||!height)return;this.cameras.main.setSize(width,height);this.cameras.main.setZoom(clamp(Math.min(width/840,height/460),.7,1.3));}
 update(now,delta){
  const h=this.hero;if(!h||this.closed)return;const dt=Math.min(delta,40)/1000;
  if(now-this.lastSave>=GAME_CONFIG.autosaveMs){this.lastSave=now;this.save();}
  if(document.hidden||window.innerHeight>window.innerWidth){this.controls.reset();return;}
  this.world.update();this.npcPanel.update();this.storagePanel.update();this.dungeonPanel.update();
  if(this.panelsOpen()){this.controls.reset();return;}
  this.playNow+=dt*1000;
  if(h.hp>0&&Math.hypot(this.axis.x,this.axis.y)>.08)this.facing=this.world.move(this.axis,h.speed,dt);
  const p=this.project(h.x,h.y);this.body.setPosition(p.x,p.y).setDepth(h.x+h.y+2);this.shadow.setPosition(p.x,p.y+7).setDepth(h.x+h.y-1);
  let swing=this.attackCycle.state(this.playNow);if(swing.impact)this.monsters.attack(this.playNow,this.facing,swing.index);
  const pressed=this.controls.consumeAttack();if(h.hp>0&&(this.controls.attacking||pressed)&&this.attackCycle.start(this.playNow,h))swing=this.attackCycle.state(this.playNow);
  const cast=h.castAnimation,pose=cast?.until>this.playNow?{active:true,special:true,cycleId:cast.startedAt,progress:(this.playNow-cast.startedAt)/(cast.until-cast.startedAt),index:cast.index}:{...swing,cycleId:this.attackCycle.startedAt};
  this.rig.update(dt,this.axis,pose,projectAngle(this.facing));this.monsters.update(this.playNow,dt);
  if(updateQuestProgress(this))this.save();
  if(h.hp<=0){
   h.deathStartedAt??=this.playNow;this.controls.reset();this.rig.update(dt,{x:0,y:0},{active:false},projectAngle(this.facing));this.refreshHud();
   if(this.playNow-h.deathStartedAt>=650){delete h.deathStartedAt;this.world.respawn();this.attackCycle=new AttackCycle();this.save();}
  }
  if(now-this.lastHud>100){this.lastHud=now;this.refreshHud();this.battleHud.update();this.minimap.update();}
 }
 enterDungeon(id,difficulty){return this.world.enterDungeon(id,difficulty);}
 leaveDungeon(){return this.world.leaveDungeon();}
 onMonsterKilled(m){this.world?.onKill(m);}
 refreshSkillSlots(){this.battleHud?.update();}
 refreshPotions(){this.battleHud?.update();}
 requestReload(){this.scene.restart();}
 notify(message){const notice=document.getElementById('notice');notice.textContent=message;this.noticeUntil=Date.now()+3000;}
 save(){if(!this.hero||this.closed)return false;if(this.monsters?.hero===this.hero)this.monsters.persistCooldowns(this.playNow);const ok=Save.write(this.hero,this.saveSlot);if(!ok)this.notify(text('saveFailed',this.language));return ok;}
 refreshHud(){if(this.hero)updateHud(this.hero,this.language,this.regionContent);if(this.noticeUntil&&Date.now()>this.noticeUntil){document.getElementById('notice').textContent='';this.noticeUntil=0;}}
}
