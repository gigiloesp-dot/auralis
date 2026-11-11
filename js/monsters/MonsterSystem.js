import {derivedAttributes} from '../systems/attributes.js';
import {rollWolfLoot} from './loot.js';
import {equipmentStats} from '../equipment/items.js';
import {MONSTER_TYPES} from './monsters.js';
import {calculateDamage} from '../combat/combat.js';
import {grantXp} from '../systems/progression.js';
import {nearestTarget} from '../combat/targeting.js';
import {combatSpec,prepareSkill,commitSkill} from '../combat/skillRuntime.js';
import {projectileSpec} from '../combat/projectiles.js';
import {TOWNS} from '../world/towns.js';
import {recordKill} from '../quests/quests.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const spawnPoints=[[1370,1240],[1450,1320],[1530,1220],[1320,1430],[1600,1450],[1770,1250],[1770,1600],[1430,1660]];
export class MonsterSystem{
 constructor(scene,hero,onChange){
  this.scene=scene;this.hero=hero;this.onChange=onChange;this.monsters=[];this.projectiles=[];this.cooldowns=new Map();this.buffs={};this.lastCombat=-Infinity;this.lastRegen=0;
  for(let i=0;i<spawnPoints.length;i++)this.spawn(i);
 }
 spawn(i){
  const [x,y]=spawnPoints[i],kind=MONSTER_TYPES.forestWolf;
  const shadow=this.scene.add.ellipse(x,y+5,38,13,0x0b1d12,.35).setDepth(y-1);
  const body=this.scene.add.container(x,y).setDepth(y);
  const torso=this.scene.add.ellipse(0,-13,38,23,0x68584b),head=this.scene.add.ellipse(17,-20,20,18,0x796758);
  const ears=[this.scene.add.triangle(12,-31,-5,8,0,-9,5,8,0x5c5046),this.scene.add.triangle(23,-31,-5,8,0,-9,5,8,0x5c5046)];
  body.add([torso,head,...ears,this.scene.add.circle(21,-23,2,0xf5ce6a)]);
  const hpBar=this.scene.add.rectangle(x,y-48,36,5,0xc94c42).setDepth(y+1);
  this.monsters.push({i,type:'forestWolf',x,y,homeX:x,homeY:y,hp:kind.hp,maxHp:kind.hp,attack:kind.attack,alive:true,body,shadow,hpBar,lastHit:0,respawnAt:0,phase:i*.7});
 }
 safe(){return Object.values(TOWNS).some(t=>t.region===this.hero.region&&distance(this.hero,t.spawn)<t.safeRadius);}
 label(x,y,text,color='#fff1a0'){
  const label=this.scene.add.text(x,y-60,text,{fontFamily:'Arial',fontSize:'20px',fontStyle:'bold',color,stroke:'#332317',strokeThickness:3}).setOrigin(.5).setDepth(99999);
  this.scene.tweens.add({targets:label,y:label.y-35,alpha:0,duration:600,onComplete:()=>label.destroy()});
 }
 update(now,dt){
  this.now=now;
  for(const m of this.monsters){
   if(!m.alive){if(now<m.respawnAt)continue;m.alive=true;m.hp=m.maxHp;m.x=m.homeX;m.y=m.homeY;m.poison=null;m.body.setVisible(true);m.shadow.setVisible(true);m.hpBar.setVisible(true);}
   if(m.poison&&now<m.poison.until&&now>=m.poison.next){m.poison.next=now+1000;this.hit(m,m.poison.damage,now);if(!m.alive)continue;}
   const dist=distance(m,this.hero),homeDist=Math.hypot(m.x-m.homeX,m.y-m.homeY);
   let tx=m.homeX,ty=m.homeY,speed=62;
   if(homeDist>=295||this.safe())m.returning=true;
   if(m.returning&&homeDist<35){m.returning=false;m.hp=m.maxHp;}
   if(!m.returning&&!this.safe()&&dist<190&&homeDist<300&&this.hero.hp>0){tx=this.hero.x;ty=this.hero.y;speed=90;}
   if(now<(m.rootUntil||0))speed=0;else if(now<(m.slowUntil||0))speed*=.45;
   const d=Math.hypot(tx-m.x,ty-m.y);
   if(d>32){m.x+=(tx-m.x)/d*Math.min(d,speed*dt);m.y+=(ty-m.y)/d*Math.min(d,speed*dt);}
   if(homeDist>295&&dist>190)m.hp=m.maxHp;
   if(!m.returning&&!this.safe()&&dist<42&&now-m.lastHit>1500&&this.hero.hp>0){
    m.lastHit=now;this.lastCombat=now;
    const evade=this.buffs.evade>now&&Math.random()<.65;
    let damage=evade?0:calculateDamage({attack:m.attack,defense:equipmentStats(this.hero).defense+derivedAttributes(this.hero).defense});
    if(this.buffs.guard>now||this.buffs.aura>now)damage=Math.ceil(damage*.45);
    this.hero.hp=Math.max(0,this.hero.hp-damage);this.label(this.hero.x,this.hero.y,damage?'-'+damage:'·','#ff8e82');this.onChange();
   }
   m.body.setPosition(m.x,m.y+Math.sin(now*.007+m.phase)*1.5).setDepth(m.y);
   m.shadow.setPosition(m.x,m.y+5).setDepth(m.y-1);
   m.hpBar.setPosition(m.x,m.y-48).setDepth(m.y+1).setScale(m.hp/m.maxHp,1);
  }
  for(const p of [...this.projectiles]){
   if(!p.target.alive||this.hero.hp<=0){this.removeProjectile(p);continue;}
   const d=distance(p,p.target),step=p.speed*dt;
   if(d<=step+12){p.impact(p.target);this.removeProjectile(p);}
   else{p.x+=(p.target.x-p.x)/d*step;p.y+=(p.target.y-p.y)/d*step;p.body.setPosition(p.x,p.y-18);}
  }
  if(now-this.lastCombat>5000&&this.hero.hp>0&&now-this.lastRegen>=1000){this.lastRegen=now;const h=this.hero,old=h.hp+h.mp;h.hp=Math.min(h.maxHp,h.hp+Math.max(1,Math.round(h.maxHp*.02)));h.mp=Math.min(h.maxMp,h.mp+Math.max(1,Math.round(h.maxMp*.03)));if(h.hp+h.mp!==old)this.onChange();}
 }
 removeProjectile(p){p.body.destroy();this.projectiles=this.projectiles.filter(x=>x!==p);}
 launch(target,impact){
  const spec=combatSpec(this.hero.classId),pSpec=projectileSpec(spec.projectile),p={x:this.hero.x,y:this.hero.y,target,impact,speed:pSpec.speed};
  p.body=this.scene.add.circle(p.x,p.y-18,pSpec.radius,spec.color).setDepth(9990);this.projectiles.push(p);
 }
 damage(multiplier=1,guaranteed=false,now=0){
  const attrs=derivedAttributes(this.hero),magic=this.hero.classId==='mage';
  const critical=guaranteed||Math.random()<attrs.criticalChance/100;
  let attack=12+this.hero.level*2+equipmentStats(this.hero).attack+(magic?attrs.magicAttack:attrs.physicalAttack);
  if(this.buffs.rage>now)attack*=1.35;
  return {damage:calculateDamage({attack:attack*multiplier,critical})+ (critical?Math.round((magic?this.hero.stats.intelligence:this.hero.stats.strength)*.3):0),critical};
 }
 hit(m,amount,now,critical=false){
  if(!m.alive)return;this.lastCombat=now;m.hp=Math.max(0,m.hp-amount);this.label(m.x,m.y,'-'+amount+(critical?'!':''));
  if(m.hp===0){m.alive=false;m.respawnAt=now+11000;m.body.setVisible(false);m.shadow.setVisible(false);m.hpBar.setVisible(false);grantXp(this.hero,15);recordKill(this.hero,'wolf');rollWolfLoot(this.hero);this.onChange();}
 }
 strike(m,now,multiplier=1,critical=false,projectile=true,after=()=>{}){
  const roll=this.damage(multiplier,critical,now),impact=target=>{this.hit(target,roll.damage,this.now??now,roll.critical);after(target);};
  if(projectile&&combatSpec(this.hero.classId).projectile)this.launch(m,impact);else impact(m);
 }
 attack(now){
  const m=nearestTarget(this.hero,this.monsters,combatSpec(this.hero.classId).range);if(!m||this.hero.hp<=0)return false;
  this.scene.facing=Math.atan2(m.y-this.hero.y,m.x-this.hero.x);
  if(Math.random()<.05&&!(this.buffs.focus>now)){this.label(m.x,m.y,'·');return true;}
  this.strike(m,now);if(Math.random()<derivedAttributes(this.hero).doubleHitChance/100)this.strike(m,now,.5);
  return true;
 }
 skillRemaining(id,now){return Math.max(0,((this.cooldowns.get(id)||0)-now)/1000);}
 useSkill(id,now){
  const cast=prepareSkill(this.hero,id,now,this.cooldowns);if(!cast.ok)return cast;
  const {effect,multiplier,duration}=cast,range=effect==='dash'?240:Math.max(combatSpec(this.hero.classId).range,140);
  const noTarget=['guard','rage','focus','heal','aura','evade'].includes(effect),target=nearestTarget(this.hero,this.monsters,range);
  if(!noTarget&&!target)return {ok:false,reason:'target'};
  if(effect==='heal'&&this.hero.hp>=this.hero.maxHp)return {ok:false,reason:'full'};
  commitSkill(this.hero,cast,now,this.cooldowns);this.lastCombat=now;
  if(noTarget){
   if(effect==='heal'){const before=this.hero.hp;this.hero.hp=Math.min(this.hero.maxHp,this.hero.hp+Math.round(this.hero.maxHp*(.2+cast.rank*.04)));this.label(this.hero.x,this.hero.y,'+'+(this.hero.hp-before),'#9ff1ad');}
   else{this.buffs[effect]=now+duration;this.label(this.hero.x,this.hero.y,cast.skill.name,'#9fcfff');}
  }else{
   this.scene.facing=Math.atan2(target.y-this.hero.y,target.x-this.hero.x);
   if(effect==='dash'){const d=distance(this.hero,target),step=Math.max(0,d-55);this.hero.x+=(target.x-this.hero.x)/d*step;this.hero.y+=(target.y-this.hero.y)/d*step;}
   const area=['area','meteor','cone','judgment'].includes(effect),targets=area?this.monsters.filter(m=>m.alive&&distance(m,target)<(effect==='meteor'?150:110)):effect==='volley'?this.monsters.filter(m=>m.alive&&distance(m,this.hero)<=range).slice(0,3):[target];
   for(const m of targets)this.strike(m,now,multiplier*(effect==='execute'&&m.hp/m.maxHp<.35?2:1),['precise','backstab','execute'].includes(effect),true,t=>{
    if(effect==='root')t.rootUntil=now+duration;if(effect==='slow')t.slowUntil=now+duration;
    if(effect==='poison'||effect==='burn')t.poison={damage:Math.max(2,cast.rank*3),next:now+1000,until:now+duration};
    if(effect==='holy'){this.hero.hp=Math.min(this.hero.maxHp,this.hero.hp+cast.rank*4);this.onChange();}
   });
   if(area){const ring=this.scene.add.circle(target.x,target.y,100,combatSpec(this.hero.classId).color,.18).setDepth(target.y);this.scene.tweens.add({targets:ring,alpha:0,scale:1.5,duration:400,onComplete:()=>ring.destroy()});}
  }
  this.onChange();return {ok:true};
 }
 destroy(){for(const p of this.projectiles)p.body.destroy();this.projectiles=[];for(const m of this.monsters){m.body.destroy();m.shadow.destroy();m.hpBar.destroy();}this.monsters=[];}
}
