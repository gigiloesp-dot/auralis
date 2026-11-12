import {movementProfile,blockingObstacles,tickMonsterAbility,cancelMonsterAbility,applyHeroAffliction,tickHeroAfflictions} from './movementProfiles.js';
import {PaintedActor} from '../characters/PaintedActor.js';
import {monsterArt} from '../assets/monsterArt.js';
import {projectAngle} from '../world/projection.js';
import {recoverLivingMonster,restoredLivingHp,MONSTER_RECOVERY_DELAY} from './health.js';
import {placeTrap,tickClassEffects,guardBlock,guardResponse,clearClassEffects} from '../combat/classEffects.js';
import {derivedAttributes} from '../systems/attributes.js';
import {rollMonsterLoot} from './loot.js';
import {equipmentStats} from '../equipment/items.js';
import {MONSTER_TYPES,MONSTER_CAMPS,MONSTER_ACTIVATION_RADIUS,clearDashPosition,monsterKind} from './monsters.js';
import {MonsterStream} from './MonsterStream.js';
import {drawMonster,animateMonsterParts} from './monsterVisuals.js';
import {calculateDamage} from '../combat/combat.js';
import {grantXp} from '../systems/progression.js';
import {nearestTarget} from '../combat/targeting.js';
import {lineClear,moveWithCollision,segmentDistanceSquared} from '../combat/geometry.js';
import {combatSpec,prepareSkill,commitSkill} from '../combat/skillRuntime.js';
import {projectileSpec} from '../combat/projectiles.js';
import {TOWNS} from '../world/towns.js';
import {recordKill} from '../quests/quests.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const spawnPoints=MONSTER_CAMPS.flatMap(c=>c.points.map(([x,y],i)=>({id:`legacy-${c.type}-${i}`,x,y,type:c.type})));
export class MonsterSystem{
 constructor(scene,hero,onChange,content=null){
  Object.assign(this,{scene,hero,onChange,content,monsters:[],projectiles:[],hostileProjectiles:[],buffs:{},lastCombat:scene.playNow||0,lastRegen:scene.playNow||0,combo:0,pendingEffects:[]});
  this.cooldowns=new Map(Object.entries(hero.combatCooldowns||{}).map(([id,at])=>[id,(scene.playNow||0)+Math.max(0,at-Date.now())]));
  hero.worldState??={monsters:{}};hero.worldState.monsters??={};
  if(content){this.stream=new MonsterStream(content,hero,d=>this.spawn(d),m=>this.removeMonster(m));this.stream.update();}
  else for(let i=0;i<spawnPoints.length;i++)this.spawn({...spawnPoints[i],i});
 }
 view(x,y){return this.scene.project?this.scene.project(x,y):{x,y};}
 depth(x,y){return this.scene.project?x+y:y;}
 sight(a,b,radius=0){const kind=a.kind||a.source?.kind||b.kind,obstacles=kind?blockingObstacles(this.obstacles,kind):this.obstacles;if(!lineClear(a,b,obstacles,radius))return false;if(this.content?.dungeon&&this.scene.world?.isWalkable){const length=distance(a,b),steps=Math.max(1,Math.ceil(length/8));for(let i=0;i<=steps;i++)if(!this.scene.world.isWalkable(a.x+(b.x-a.x)*i/steps,a.y+(b.y-a.y)*i/steps,radius))return false;}return true;}
 nearest(range){return nearestTarget(this.hero,this.monsters.filter(m=>this.canSee(m)),range,this.obstacles);}
 canSee(m){return m.alive&&m.active!==false&&this.sight(this.hero,m)&&!this.scene.world?.occludes?.(m);}
 select(m,now=this.now||this.scene.playNow||0){if(!m?.alive||!this.monsters.includes(m)||!this.canSee(m))return false;this.selected=m;this.scene.onTarget?.(m,now);return true;}
 preferred(range){const m=this.selected;if(m?.alive&&this.monsters.includes(m)&&distance(this.hero,m)<=range&&this.canSee(m))return m;return this.nearest(range);}
 persistHealth(m,now=this.now??this.scene.playNow??0){if(!m.alive||this.hero.worldState.monsters[m.key]?.deadUntil>Date.now())return;if(m.hp>=m.maxHp){delete this.hero.worldState.monsters[m.key];return;}this.hero.worldState.monsters[m.key]={hp:m.hp,healthAt:Date.now(),recoverAfter:Date.now()+Math.max(0,MONSTER_RECOVERY_DELAY-(now-(m.lastEngagedAt??now)))};}
 syncAnnotations(m){const visible=this.canSee(m)&&m.hp<m.maxHp; m.hpBar.setVisible(visible);m.nameLabel.setVisible(visible);}
 get obstacles(){return this.scene.obstacles||[];}
 get diagnostics(){return this.stream?.diagnostics||{totalDescriptors:spawnPoints.length,loadedMonsters:this.monsters.length};}
 stateKey(d){return `${this.content?.id||'legacy'}:${d.id}`;}
 spawn(d){
  const {x,y,type}=d,kind=this.content?monsterKind(d):MONSTER_TYPES[type],key=this.stateKey(d),saved=this.hero.worldState.monsters[key];
  const point=this.view(x,y),depth=this.depth(x,y);
  const shadow=this.scene.add.ellipse(point.x,point.y+5,38,13,0x0b1d12,.35).setDepth(depth-1),body=this.scene.add.container(point.x,point.y).setDepth(depth);
  drawMonster(this.scene,body,type,kind.boss);
  const hpBar=this.scene.add.rectangle(point.x,point.y-48,36,5,0xc94c42).setDepth(depth+1),name=kind.names?.[this.scene.language||'ru']||kind.name;
  const nameLabel=this.scene.add.text(point.x,point.y-(kind.boss?(kind.visualScale||1.45)*110:76),name+' · '+kind.level,{fontFamily:'Arial',fontSize:kind.boss?'13px':'10px',color:kind.boss?'#ffd47b':'#e5d9ba',stroke:'#15251a',strokeThickness:3}).setOrigin(.5).setDepth(depth+2);
  const alive=!(saved?.deadUntil>Date.now());
  const m={...d,key,kind,nameLabel,active:false,x,y,homeX:x,homeY:y,hp:alive?restoredLivingHp(saved,kind.hp):0,maxHp:kind.hp,lastEngagedAt:(this.scene.playNow||0)-MONSTER_RECOVERY_DELAY+Math.max(0,(saved?.recoverAfter||0)-Date.now()),attack:kind.attack,alive,body,shadow,hpBar,lastHit:0,respawnAt:alive?0:(this.content?saved.deadUntil:Math.max(0,saved.deadUntil-Date.now())),phase:(d.i||0)*.7};
  const paintedEntry=monsterArt(type,kind);if(paintedEntry&&this.scene.actorTextures){const fallback=[...body.list];m.painted=new PaintedActor(this.scene,body,paintedEntry);m.painted.ready.then(loaded=>{if(!loaded)return;for(const child of fallback)child.destroy();body.motionParts=null;m.paintedActive=true;m.annotationHeight=(paintedEntry.annotationHeight||paintedEntry.scale*170)*(kind.visualScale||1);});}
  this.monsters.push(m);this.setMonsterVisible(m,distance(this.hero,m)<=MONSTER_ACTIVATION_RADIUS);return m;
 }
 removeMonster(m){m.painted?.destroy();cancelMonsterAbility(m);this.persistHealth(m);if(this.selected===m){this.selected=null;this.scene.onTargetLost?.(m);}this.cancelWindup(m);for(const key of ['body','shadow','hpBar','nameLabel'])m[key]?.destroy();this.monsters=this.monsters.filter(item=>item!==m);for(const p of [...this.projectiles])if(p.target===m)this.removeProjectile(p);}
 setMonsterVisible(m,active){m.active=active;for(const key of ['body','shadow'])m[key]?.setVisible(active&&(m.alive||m.dyingUntil>(this.now||0)));this.syncAnnotations(m);}
 cancelWindup(m){m.warning?.destroy();m.warning=null;m.windup=null;}
 schedule(at,run){this.pendingEffects.push({at,run});}
 tickEffects(now){const ready=this.pendingEffects.filter(e=>e.at<=now);this.pendingEffects=this.pendingEffects.filter(e=>e.at>now);if(this.hero.hp<=0){this.pendingEffects=[];return;}for(const effect of ready)effect.run();}
 blast(x,y,radius,multiplier,now,after=()=>{}){for(const m of this.monsters.filter(m=>m.alive&&m.active!==false&&distance(m,{x,y})<=radius&&this.sight({x,y},m)))this.strike(m,now,multiplier,false,false,after);const screen=this.view(x,y),ring=this.scene.add.circle(screen.x,screen.y,radius,combatSpec(this.hero.classId).color,.2).setDepth(this.depth(x,y));if(this.scene.project)ring.setScale?.(1,.5);this.scene.tweens.add({targets:ring,alpha:0,duration:400,onComplete:()=>ring.destroy()});}
 hurtHero(attack,now,magic=false,source=null){
  if(this.hero.hp<=0||this.safe())return;
  if(source){source.lastEngagedAt=now;if(!this.selected?.alive||!this.canSee(this.selected)||this.selected===source)this.select(source,now);}this.lastCombat=now;const evade=this.buffs.evade>now&&Math.random()<.65,spec=combatSpec(this.hero.classId);
  let damage=evade?0:calculateDamage({attack,defense:magic?Math.round(equipmentStats(this.hero).defense*.35+(this.hero.stats.intelligence||5)*.4+spec.magicDefense):equipmentStats(this.hero).defense+derivedAttributes(this.hero).defense+spec.defense});
  if(this.buffs.guard>now)damage=Math.ceil(damage*(this.hero.classId==='paladin'?.35:this.hero.classId==='cannoneer'?.65:.55));
  if(this.buffs.aura>now)damage=Math.ceil(damage*.55);
  if(this.buffs.iceWard>0&&this.buffs.guard>now){const absorbed=Math.min(damage,this.buffs.iceWard);damage-=absorbed;this.buffs.iceWard-=absorbed;for(const m of this.monsters)if(distance(m,this.hero)<100)m.slowUntil=now+1500;}
  damage=guardBlock(this,damage,now);this.hero.hp=Math.max(0,this.hero.hp-damage);guardResponse(this,now);if(damage>0){this.hero.hurtUntil=now+220;this.hero.lastHitAt=now;}this.label(this.hero.x,this.hero.y,damage?'-'+damage:'·','#ff8e82');this.onChange();
 }
 safe(){return (this.content?.towns||Object.values(TOWNS)).some(t=>t.region===this.hero.region&&distance(this.hero,t.spawn||t)<t.safeRadius);}
 label(x,y,text,color='#fff1a0'){
  const point=this.view(x,y);
  const label=this.scene.add.text(point.x,point.y-60,text,{fontFamily:'Arial',fontSize:'14px',fontStyle:'bold',color,stroke:'#332317',strokeThickness:3}).setOrigin(.5).setDepth(this.depth(x,y)+4);
  this.scene.tweens.add({targets:label,y:label.y-35,alpha:0,duration:600,onComplete:()=>label.destroy()});
 }
 canOccupy(m,x,y,radius=movementProfile(m.kind).collisionRadius){const world=this.scene.world,flight=movementProfile(m.kind).movement==='flight',check=flight?(world?.isFlightWalkable||world?.isWalkable):world?.isWalkable;return !check||check.call(world,x,y,radius);}
 move(m,x,y,amount){const old={x:m.x,y:m.y},radius=movementProfile(m.kind).collisionRadius;moveWithCollision(m,x,y,amount,blockingObstacles(this.obstacles,m.kind),radius,(x,y)=>this.canOccupy(m,x,y,radius));if(!this.canOccupy(m,m.x,m.y,radius))Object.assign(m,old);}
 warnAbility(config){const point=this.view(config.x,config.y),colors={venom:0x91c965,frost:0x88cfff,roots:0xa6bf66,blink:0xb891ed},marker=this.scene.add.circle(point.x,point.y,config.radius,colors[config.kind]||0xea7750,.24).setDepth(this.depth(config.x,config.y));if(this.scene.project)marker.setScale?.(1,.5);return marker;}
 abilityEffect(config){const point=this.view(config.x,config.y),ring=this.scene.add.circle(point.x,point.y,config.radius,config.kind==='blink'?0xb891ed:0xe0b17b,.25).setDepth(this.depth(config.x,config.y)+1);if(this.scene.project)ring.setScale?.(1,.5);this.scene.tweens.add({targets:ring,alpha:0,duration:350,onComplete:()=>ring.destroy()});if(config.kind==='stomp')this.scene.cameras?.main?.shake?.(130,.003);}
 shootHostile(m,shot){const angle=Math.atan2(shot.targetY-shot.y,shot.targetX-shot.x)+(shot.angleOffset||0),p={...shot,vx:Math.cos(angle)*shot.speed,vy:Math.sin(angle)*shot.speed,remaining:shot.range||600,source:m};const screen=this.view(p.x,p.y);p.body=this.scene.add.circle(screen.x,screen.y-18,shot.magic?6:4,shot.status?.type==='poison'?0x9ac76b:shot.magic?0xb49aeb:0xd5b98a).setDepth(this.depth(p.x,p.y)+5);this.hostileProjectiles.push(p);}
 tickAbility(m,now,dt,engaged){return tickMonsterAbility({monster:m,hero:this.hero,now,dt,engaged,safe:this.safe(),canSee:(a,b)=>this.sight(a,b),canOccupy:(x,y,r)=>this.canOccupy(m,x,y,r),move:(x,y,amount)=>this.move(m,x,y,amount),damage:(attack,magic,status)=>{this.hurtHero(attack,now,magic,m);applyHeroAffliction(this.hero,status,now);},shoot:shot=>this.shootHostile(m,shot),warn:config=>this.warnAbility(config),effect:config=>this.abilityEffect(config)});}

 beginBossAttack(m,now){
  const basic=m.patterns?.length?m.patterns:['slam'],patterns=m.bossType==='world'&&m.hp/m.maxHp<.5?[...new Set([...basic,'slam','charge','volley'])]:basic,effect=patterns[(m.attackSequence||0)%patterns.length];m.attackSequence=(m.attackSequence||0)+1;
  m.lastSlam=now;m.windup={effect,x:this.hero.x,y:this.hero.y,at:now+(effect==='charge'?850:1200)};
  const point=this.view(m.windup.x,m.windup.y);
  m.warning=this.scene.add.circle(point.x,point.y,effect==='volley'?65:m.bossType==='world'?140:100,0xea5144,.3).setDepth(this.depth(m.x,m.y)+3);if(this.scene.project)m.warning.setScale?.(1,.5);
 }
 finishBossAttack(m,now){
  const center=m.windup;this.cancelWindup(m);
  if(center.effect==='charge'){this.move(m,center.x,center.y,Math.min(270,distance(m,center)));if(distance(this.hero,m)<65)this.hurtHero(m.attack*1.7,now,false,m);}
  else if(center.effect==='volley'){
   const aim=Math.atan2(center.y-m.y,center.x-m.x);
   for(const offset of (m.bossType==='world'&&m.hp/m.maxHp<.5?[-.4,-.2,0,.2,.4]:[-.22,0,.22])){const angle=aim+offset,p={x:m.x,y:m.y,vx:Math.cos(angle)*230,vy:Math.sin(angle)*230,damage:m.attack,remaining:700,magic:m.kind.magic,source:m};const screen=this.view(p.x,p.y);p.body=this.scene.add.circle(screen.x,screen.y-18,7,0xf28c61).setDepth(this.depth(p.x,p.y)+5);this.hostileProjectiles.push(p);}
  }else if(distance(this.hero,center)<=(m.bossType==='world'?140:100))this.hurtHero(m.attack*2,now,false,m);
 }
 update(now,dt){
  this.now=now;this.stream?.update();this.tickEffects(now);tickHeroAfflictions(this.hero,now,(attack,magic)=>this.hurtHero(attack,now,magic));if(this.hero.hp>0)tickClassEffects(this,now);
  for(const m of this.monsters){
   const active=distance(m,this.hero)<=MONSTER_ACTIVATION_RADIUS;if(active!==m.active)this.setMonsterVisible(m,active);
   if(!active){this.cancelWindup(m);cancelMonsterAbility(m);continue;}
   if(!m.alive){if((this.content?Date.now():now)<m.respawnAt){m.painted?.update('death',projectAngle(m.facing||0),dt);const fraction=Math.max(0,Math.min(1,((m.dyingUntil||0)-now)/350));m.body.alpha=fraction;m.body.rotation=(1-fraction)*1.1;if(!fraction){m.body.setVisible(false);m.shadow.setVisible(false);}continue;}m.body.alpha=1;m.body.rotation=0;m.dyingUntil=0;m.alive=true;m.hp=m.maxHp;m.x=m.homeX;m.y=m.homeY;m.poison=null;delete this.hero.worldState.monsters[m.key];this.setMonsterVisible(m,true);}
   if(this.hero.hp>0&&m.poison&&now<m.poison.until&&now>=m.poison.next){m.poison.next=now+1000;this.hit(m,m.poison.damage,now);if(!m.alive)continue;}
   const profile=movementProfile(m.kind),dist=distance(m,this.hero),homeDist=Math.hypot(m.x-m.homeX,m.y-m.homeY);let tx=m.homeX,ty=m.homeY,speed=62;
   if(homeDist>=295||this.safe())m.returning=true;if(m.returning&&homeDist<35){m.returning=false;}
   const engaged=!m.returning&&!this.safe()&&dist<Math.max(190,profile.range)&&homeDist<300&&this.hero.hp>0&&this.sight(m,this.hero);
   if(engaged){tx=this.hero.x;ty=this.hero.y;speed=m.kind.speed;this.lastCombat=now;m.lastEngagedAt=now;if(profile.preferredDistance){if(dist<profile.preferredDistance*.65){tx=m.x+(m.x-this.hero.x);ty=m.y+(m.y-this.hero.y);speed*=.65;}else if(dist<profile.preferredDistance){tx=m.x;ty=m.y;}}}
   const controlled=now<(m.rootUntil||0)||now<(m.stunUntil||0);if(controlled){cancelMonsterAbility(m);m.abilityBlockedUntil=Math.max(m.rootUntil||0,m.stunUntil||0)+250;}
   const ability=this.tickAbility(m,now,dt,engaged&&!controlled);if(ability.busy)speed=0;if(ability.fired)m.lastHit=now;
   if(now<(m.rootUntil||0)||now<(m.stunUntil||0))speed=0;else if(now<(m.slowUntil||0))speed*=.45;
   if(m.windup){if(m.returning||this.safe()||this.hero.hp<=0)this.cancelWindup(m);else if(now>=m.windup.at)this.finishBossAttack(m,now);speed=0;}
   const interval=m.hp/m.maxHp<.5?4200:6000;
   if(m.kind.boss&&!m.specialState&&!ability.fired&&!m.windup&&!m.returning&&!this.safe()&&dist<260&&now-(m.lastSlam||0)>interval&&this.hero.hp>0&&this.sight(m,this.hero)){this.beginBossAttack(m,now);speed=0;}
   const previous={x:m.x,y:m.y};if(Math.hypot(tx-m.x,ty-m.y)>32){m.facing=Math.atan2(ty-m.y,tx-m.x);this.move(m,tx,ty,speed*dt);}
   if(dt>0)for(const other of this.monsters){if(other===m||!other.alive||other.active===false)continue;const d=distance(m,other);if(d>0&&d<24)this.move(m,m.x+(m.x-other.x)/d*4,m.y+(m.y-other.y)/d*4,Math.min(3,24-d));}
   const walking=distance(previous,m)>.01;animateMonsterParts(m,now,walking,profile);const state=m.hurtUntil>now?'hurt':m.specialState?'special':now-m.lastHit<240?'attack':walking?'run':'idle';m.painted?.update(state,projectAngle(m.facing||0),dt,{progress:m.specialState?(now-m.specialState.releaseAt+profile.windup)/profile.windup:(now-m.lastHit)/240});m.body.alpha=m.hurtUntil>now?.6:1;m.body.rotation=m.hurtUntil>now?Math.sin(now*.05)*.09:now-m.lastHit<240?Math.sin((now-m.lastHit)/240*Math.PI)*.12:0;m.body.scaleX=(m.paintedActive?1:Math.cos(m.facing||0)<0?-1:1)*(m.kind.visualScale||(m.kind.boss?1.45:1));m.body.scaleY=(m.kind.visualScale||(m.kind.boss?1.45:1))*(walking?1+Math.sin(now*.012)*.035:1);
   if(recoverLivingMonster(m,now,dt,engaged))this.persistHealth(m,now);
   if(!ability.busy&&!m.windup&&!controlled&&!m.returning&&!this.safe()&&dist<42&&now-m.lastHit>1500&&this.hero.hp>0&&this.sight(m,this.hero)){m.lastHit=now;this.hurtHero(m.attack,now,m.kind.magic,m);}
   const point=this.view(m.x,m.y),depth=this.depth(m.x,m.y);
   const elevation=profile.elevation||0,bob=Math.sin(now*(profile.locomotion==='winged'?.016:.007)+m.phase)*(elevation?4:1.5);m.body.setPosition(point.x,point.y-elevation+bob).setDepth(depth);m.shadow.scaleX=elevation?.72:1;m.shadow.alpha=elevation?.24:.35;m.shadow.setPosition(point.x,point.y+5).setDepth(depth-1);
   m.hpBar.setPosition(point.x,point.y-elevation-(m.annotationHeight??(m.kind.boss?(m.kind.visualScale||1.45)*93:48))).setDepth(depth+1).setScale((m.kind.boss?2.5:1)*m.hp/m.maxHp,1);m.nameLabel.setPosition(point.x,point.y-elevation-(m.annotationHeight?m.annotationHeight+17:m.kind.boss?(m.kind.visualScale||1.45)*110:76)).setDepth(depth+2);this.syncAnnotations(m);
  }
  for(const p of [...this.projectiles]){
   if(!p.target.alive||!this.monsters.includes(p.target)||this.hero.hp<=0){this.removeProjectile(p);continue;}
   const d=distance(p,p.target),step=Math.min(d,p.speed*dt),next={x:p.x+(p.target.x-p.x)/Math.max(1,d)*step,y:p.y+(p.target.y-p.y)/Math.max(1,d)*step};
   if(!this.sight(p,next,p.radius)){this.removeProjectile(p);continue;}
   if(d<=step+12){p.impact(p.target);this.removeProjectile(p);}else{Object.assign(p,next);const screen=this.view(p.x,p.y),fade=p.initialDistance?Math.min(1,Math.max(0,d-step)/p.initialDistance):0;p.body.setPosition(screen.x+(p.visualOffset?.x||0)*fade,screen.y-18+(p.visualOffset?.y||0)*fade).setDepth(this.depth(p.x,p.y)+5);}
  }
  for(const p of [...this.hostileProjectiles]){
   const next={x:p.x+p.vx*dt,y:p.y+p.vy*dt};p.remaining-=Math.hypot(p.vx*dt,p.vy*dt);
   const blocked=!this.sight(p,next,7),hit=!this.safe()&&segmentDistanceSquared(p,next,this.hero)<21**2;
   if(blocked||hit||p.remaining<=0||this.hero.hp<=0){if(hit&&!blocked){this.hurtHero(p.damage,now,p.magic,p.source);applyHeroAffliction(this.hero,p.status,now);}p.body.destroy();this.hostileProjectiles=this.hostileProjectiles.filter(q=>q!==p);}else{Object.assign(p,next);const screen=this.view(p.x,p.y);p.body.setPosition(screen.x,screen.y-18).setDepth(this.depth(p.x,p.y)+5);}
  }
  if(now-this.lastCombat>=10000&&this.hero.hp>0&&now-this.lastRegen>=1000){this.lastRegen=now;const h=this.hero,old=h.hp+h.mp;h.hp=Math.min(h.maxHp,h.hp+Math.max(1,Math.round(h.maxHp*.07)));h.mp=Math.min(h.maxMp,h.mp+Math.max(1,Math.round(h.maxMp*.04)));if(h.hp+h.mp!==old)this.onChange();}
 }
 removeProjectile(p){p.body.destroy();this.projectiles=this.projectiles.filter(x=>x!==p);}
 launch(target,impact){
  const spec=combatSpec(this.hero.classId),pSpec=projectileSpec(spec.projectile),angle=Math.atan2(target.y-this.hero.y,target.x-this.hero.x),p={x:this.hero.x+Math.cos(angle)*25,y:this.hero.y+Math.sin(angle)*25,target,impact,speed:pSpec.speed,radius:pSpec.radius};
  if(!this.sight(this.hero,p,p.radius))return false;
  const screen=this.view(p.x,p.y),muzzle=this.scene.rig?.weaponMuzzleScreen?.();p.initialDistance=distance(p,target);p.visualOffset=muzzle?{x:muzzle.x-screen.x,y:muzzle.y-(screen.y-18)}:{x:0,y:0};p.body=this.scene.add.circle(screen.x+p.visualOffset.x,screen.y-18+p.visualOffset.y,pSpec.radius,spec.color).setDepth(this.depth(p.x,p.y)+5);this.projectiles.push(p);return true;
 }
 damage(multiplier=1,guaranteed=false,now=0,magicOverride){
  const attrs=derivedAttributes(this.hero),magic=magicOverride??this.hero.classId==='mage',spec=combatSpec(this.hero.classId),critical=guaranteed||Math.random()<(attrs.criticalChance+(this.buffs.focus>now?20:0))/100;
  let attack=(12+this.hero.level*2+equipmentStats(this.hero).attack+(magic?attrs.magicAttack:attrs.physicalAttack))*spec.attackMultiplier;
  if(Math.hypot(this.scene.axis?.x||0,this.scene.axis?.y||0)>.08)attack*=1-(spec.movingPenalty||0);if(this.buffs.rage>now)attack*=1.35;
  return {magic,damage:calculateDamage({attack:attack*multiplier,critical})+(critical?Math.round((magic?this.hero.stats.intelligence:this.hero.stats.strength)*.3):0),critical};
 }
 hit(m,amount,now,critical=false){
  if(!m.alive)return;this.lastCombat=now;m.lastEngagedAt=now;if(!this.selected?.alive||this.selected===m)this.select(m,now);m.hp=Math.max(0,m.hp-amount);m.hurtUntil=now+180;this.label(m.x,m.y,'-'+amount+(critical?'!':''),critical?'#ffb45c':'#fff1a0');
  this.persistHealth(m,now);this.syncAnnotations(m);if(m.hp===0){m.alive=false;if(this.selected===m)this.selected=null;this.scene.onTargetLost?.(m);m.dyingUntil=now+350;const deadUntil=Date.now()+(m.kind.respawnMs||11000);m.respawnAt=this.content?deadUntil:now+(m.kind.respawnMs||11000);this.hero.worldState.monsters[m.key]={deadUntil,killedAt:Date.now()};this.cancelWindup(m);cancelMonsterAbility(m);this.setMonsterVisible(m,m.active);grantXp(this.hero,m.kind.xp);recordKill(this.hero,m.type,{id:m.id,campId:m.campId,region:this.hero.region,boss:m.kind.boss,bossType:m.bossType});this.hero.gold=(this.hero.gold||0)+m.kind.gold;rollMonsterLoot(this.hero,m.kind);this.scene.onMonsterKilled?.(m);this.onChange();}
 }
 strike(m,now,multiplier=1,critical=false,projectile=true,after=()=>{},magicOverride){
  const roll=this.damage(multiplier,critical,now,magicOverride),impact=target=>{if(!this.sight(this.hero,target)&&!projectile)return;this.hit(target,Math.max(1,roll.damage-Math.round((target.kind[roll.magic?'magicDefense':'defense']||0)*(target.armorBreakUntil>(this.now??now)&&!roll.magic?.5:1)*.45)),this.now??now,roll.critical);if(this.hero.classId==='cannoneer'&&this.buffs.powder>(this.now??now))for(const other of this.monsters)if(other!==target&&other.alive&&distance(other,target)<55&&this.sight(target,other))this.hit(other,Math.max(1,Math.round(roll.damage*.25)),this.now??now);after(target);};
  if(projectile&&combatSpec(this.hero.classId).projectile)this.launch(m,impact);else impact(m);
 }
 attack(now){
  const spec=combatSpec(this.hero.classId),m=this.preferred(spec.range+(this.buffs.focus>now?70:0));if(!m||this.hero.hp<=0)return false;
  this.select(m,now);this.scene.facing=Math.atan2(m.y-this.hero.y,m.x-this.hero.x);this.combo=(this.combo+1)%3;
  if(Math.random()<(spec.missChance??.05)&&!(this.buffs.focus>now)){this.label(m.x,m.y,'·');return true;}
  const shield=this.hero.classId==='paladin'&&this.combo===0;this.scene.lastComboAttack=shield?'shield':this.combo===0?'finisher':'strike';this.hero.lastComboAttack=this.scene.lastComboAttack;
  this.strike(m,now,shield?1.45:1);if(shield){m.stunUntil=now+900;this.label(m.x,m.y,'◇','#e6edff');}
  if(Math.random()<derivedAttributes(this.hero).doubleHitChance/100)this.strike(m,now,.5);return true;
 }
 persistCooldowns(now=this.scene.playNow||0){for(const m of this.monsters)this.persistHealth(m,now);this.hero.combatCooldowns=Object.fromEntries([...this.cooldowns].map(([id,ready])=>[id,Date.now()+Math.max(0,ready-now)]));}
 skillRemaining(id,now){return Math.max(0,((this.cooldowns.get(id)||0)-now)/1000);}
 useSkill(id,now){
  const cast=prepareSkill(this.hero,id,now,this.cooldowns);if(!cast.ok)return cast;
  const {effect,multiplier,duration}=cast,range=effect==='dash'?240:Math.max(combatSpec(this.hero.classId).range,140),noTarget=['guard','rage','focus','heal','aura','evade'].includes(effect),target=this.preferred(range);
  if(!noTarget&&!target)return {ok:false,reason:'target'};if(effect==='heal'&&this.hero.hp>=this.hero.maxHp)return {ok:false,reason:'full'};
  if(target&&!noTarget)this.select(target,now);commitSkill(this.hero,cast,now,this.cooldowns);this.hero.castAnimation={startedAt:now,until:now+650,index:cast.skill.index%3};this.hero.combatCooldowns??={};this.hero.combatCooldowns[id]=Date.now()+cast.skill.cooldown*1000;this.lastCombat=now;
  const classId=this.hero.classId;
  if(effect==='root'&&classId==='archer'){placeTrap(this,cast,target,now);this.onChange();return {ok:true};}
  if(effect==='backstab'){const facing=target.facing??Math.atan2(this.hero.y-target.y,this.hero.x-target.x),point={x:target.x-Math.cos(facing)*35,y:target.y-Math.sin(facing)*35};moveWithCollision(this.hero,point.x,point.y,distance(this.hero,point),this.obstacles,12,(x,y)=>!this.scene.world?.isWalkable||this.scene.world.isWalkable(x,y,12));}
  if(effect==='charged'){
   const point={x:target.x,y:target.y};this.label(this.hero.x,this.hero.y,'◉','#ffc67c');this.schedule(now+1000,()=>this.blast(point.x,point.y,65,multiplier*1.3,this.now,m=>{const angle=Math.atan2(m.y-point.y,m.x-point.x);this.move(m,m.x+Math.cos(angle)*60,m.y+Math.sin(angle)*60,60);}));this.onChange();return {ok:true};
  }
  if(effect==='meteor'){
   const point={x:target.x,y:target.y},radius=classId==='cannoneer'?165:145,screen=this.view(point.x,point.y),warning=this.scene.add.circle(screen.x,screen.y,radius,combatSpec(classId).color,.12).setDepth(this.depth(point.x,point.y));if(this.scene.project)warning.setScale?.(1,.5);
   this.scene.tweens.add({targets:warning,alpha:0,duration:900,onComplete:()=>warning.destroy()});this.schedule(now+900,()=>this.blast(point.x,point.y,radius,multiplier,this.now,m=>{if(classId==='mage')m.poison={damage:cast.rank*4,next:this.now+1000,until:this.now+3000};else m.stunUntil=this.now+800;}));this.onChange();return {ok:true};
  }
  if(effect==='area'&&classId==='archer'){
   const point={x:target.x,y:target.y};for(let i=0;i<4;i++)this.schedule(now+i*350,()=>this.blast(point.x,point.y,120,multiplier*.35,this.now));this.onChange();return {ok:true};
  }
  if(effect==='area'&&classId==='warrior'){
   for(let i=0;i<3;i++)this.schedule(now+i*250,()=>this.blast(this.hero.x,this.hero.y,125,multiplier*.45,this.now));this.onChange();return {ok:true};
  }
  if(noTarget){if(effect==='heal'){const before=this.hero.hp;this.hero.hp=Math.min(this.hero.maxHp,this.hero.hp+Math.round(this.hero.maxHp*(.2+cast.rank*.04)));this.label(this.hero.x,this.hero.y,'+'+(this.hero.hp-before),'#9ff1ad');}else{this.buffs[effect]=now+duration;if(effect==='guard'){this.buffs.guardRank=cast.rank;this.buffs.guardCharges=1+Math.floor(cast.rank/2);}if(effect==='aura'){this.buffs.auraRank=cast.rank;this.lastAuraAt=now;}if(effect==='guard'&&classId==='mage')this.buffs.iceWard=Math.round(this.hero.maxHp*(.2+cast.rank*.05));if(effect==='rage'&&classId==='cannoneer')this.buffs.powder=now+duration;this.label(this.hero.x,this.hero.y,cast.skill.name,'#9fcfff');}}
  else{
   this.scene.facing=Math.atan2(target.y-this.hero.y,target.x-this.hero.x);if(effect==='dash'){const destination=clearDashPosition(this.hero,target,this.obstacles);moveWithCollision(this.hero,destination.x,destination.y,distance(this.hero,destination),this.obstacles,12,(x,y)=>!this.scene.world?.isWalkable||this.scene.world.isWalkable(x,y,12));}
   const area=['area','meteor','cone','judgment'].includes(effect),visible=this.monsters.filter(m=>m.alive&&m.active!==false&&this.sight(this.hero,m)),targets=effect==='cone'?visible.filter(m=>distance(m,this.hero)<=range&&Math.abs(Math.atan2(Math.sin(Math.atan2(m.y-this.hero.y,m.x-this.hero.x)-this.scene.facing),Math.cos(Math.atan2(m.y-this.hero.y,m.x-this.hero.x)-this.scene.facing)))<.6):area?visible.filter(m=>distance(m,target)<(effect==='meteor'?150:110)):effect==='volley'?visible.filter(m=>distance(m,this.hero)<=range).slice(0,3):[target];
   for(const m of targets)this.strike(m,now,multiplier*(effect==='execute'&&m.hp/m.maxHp<.35?2:1),['precise','backstab','execute'].includes(effect),true,t=>{if(effect==='strike'&&classId==='warrior')t.armorBreakUntil=(this.now??now)+duration;if(effect==='execute'&&classId==='assassin'&&t.poison){const bonus=Math.ceil(Math.max(0,t.poison.until-(this.now??now))/1000)*t.poison.damage;t.poison=null;if(bonus)this.hit(t,bonus,this.now??now,true);}if(effect==='root')t.rootUntil=now+duration;if(effect==='slow')t.slowUntil=now+duration;if(effect==='poison'||effect==='burn')t.poison={damage:Math.max(2,cast.rank*3),next:(this.now??now)+1000,until:(this.now??now)+duration};if(effect==='judgment'){this.hero.hp=Math.min(this.hero.maxHp,this.hero.hp+cast.rank*8);this.onChange();}if(effect==='holy'){this.hero.hp=Math.min(this.hero.maxHp,this.hero.hp+cast.rank*4);this.onChange();}},classId==='paladin'&&['holy','judgment'].includes(effect)?true:undefined);
   if(area){const screen=this.view(target.x,target.y),ring=this.scene.add.circle(screen.x,screen.y,100,combatSpec(this.hero.classId).color,.18).setDepth(this.depth(target.x,target.y));if(this.scene.project)ring.setScale?.(1,.5);this.scene.tweens.add({targets:ring,alpha:0,scaleX:1.5,scaleY:this.scene.project?.75:1.5,duration:400,onComplete:()=>ring.destroy()});}
  }
  this.onChange();return {ok:true};
 }
 destroy(){clearClassEffects(this);this.pendingEffects=[];if(this.stream)this.stream.destroy();else for(const m of [...this.monsters])this.removeMonster(m);for(const p of [...this.projectiles])this.removeProjectile(p);for(const p of this.hostileProjectiles)p.body.destroy();this.hostileProjectiles=[];}
}
