import {MONSTER_TYPES} from './monsters.js';
import {calculateDamage} from '../combat/combat.js';
import {grantXp} from '../systems/progression.js';
import {nearestTarget} from '../combat/targeting.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const spawnPoints=[[1370,1240],[1450,1320],[1530,1220],[1320,1430],[1600,1450],[1770,1250],[1770,1600],[1430,1660]];
export class MonsterSystem{
 constructor(scene,hero,onChange){
  this.scene=scene;this.hero=hero;this.onChange=onChange;this.monsters=[];this.lastStrike=0;this.lastAttackHeld=false;
  for(let i=0;i<spawnPoints.length;i++)this.spawn(i);
 }
 spawn(i){
  const [x,y]=spawnPoints[i],kind=MONSTER_TYPES.forestWolf;
  const shadow=this.scene.add.ellipse(x,y+5,38,13,0x0b1d12,.35).setDepth(y-1);
  const body=this.scene.add.container(x,y).setDepth(y);
  const torso=this.scene.add.ellipse(0,-13,38,23,0x68584b),head=this.scene.add.ellipse(17,-20,20,18,0x796758);
  const ears=[this.scene.add.triangle(12,-31,-5,8,0,-9,5,8,0x5c5046),this.scene.add.triangle(23,-31,-5,8,0,-9,5,8,0x5c5046)];
  const eye=this.scene.add.circle(21,-23,2,0xf5ce6a);
  body.add([torso,head,...ears,eye]);
  const hpBar=this.scene.add.rectangle(x,y-48,36,5,0xc94c42).setDepth(y+1);
  const m={i,x,y,homeX:x,homeY:y,hp:kind.hp,maxHp:kind.hp,attack:kind.attack,alive:true,body,shadow,hpBar,lastHit:0,respawnAt:0,phase:i*.7};
  this.monsters.push(m);
 }
 update(now,dt){
  for(const m of this.monsters){
   if(!m.alive){
    if(now>=m.respawnAt){m.alive=true;m.hp=m.maxHp;m.x=m.homeX;m.y=m.homeY;m.body.setVisible(true);m.shadow.setVisible(true);m.hpBar.setVisible(true);}
    else continue;
   }
   const dist=distance(m,this.hero),homeDist=Math.hypot(m.x-m.homeX,m.y-m.homeY);
   let tx=m.homeX,ty=m.homeY,speed=62;
   if(dist<190&&homeDist<300&&this.hero.hp>0){tx=this.hero.x;ty=this.hero.y;speed=90;}
   const d=Math.hypot(tx-m.x,ty-m.y);
   if(d>45){m.x+=(tx-m.x)/d*Math.min(d,speed*dt);m.y+=(ty-m.y)/d*Math.min(d,speed*dt);}
   if(dist<38&&now-m.lastHit>1500&&this.hero.hp>0){
    m.lastHit=now;this.hero.hp=Math.max(0,this.hero.hp-calculateDamage({attack:m.attack}));
    this.onChange();
   }
   m.body.setPosition(m.x,m.y+Math.sin(now*.007+m.phase)*1.5).setDepth(m.y);
   m.shadow.setPosition(m.x,m.y+5).setDepth(m.y-1);
   m.hpBar.setPosition(m.x,m.y-48).setDepth(m.y+1).setScale(m.hp/m.maxHp,1);
  }
 }
 attack(now,facing){
  if(now-this.lastStrike<450)return false;
  this.lastStrike=now;
  const m=nearestTarget(this.hero,this.monsters,100);
  if(!m)return true;
  this.scene.facing=Math.atan2(m.y-this.hero.y,m.x-this.hero.x);
  const damage=calculateDamage({attack:12+this.hero.level*2});
  m.hp=Math.max(0,m.hp-damage);
  const label=this.scene.add.text(m.x,m.y-67,'-'+damage,{fontFamily:'Arial',fontSize:'20px',fontStyle:'bold',color:'#fff1a0',stroke:'#332317',strokeThickness:3}).setOrigin(.5).setDepth(99999);
  this.scene.tweens.add({targets:label,y:label.y-35,alpha:0,duration:600,onComplete:()=>label.destroy()});
  if(m.hp===0){
   m.alive=false;m.respawnAt=now+11000;m.body.setVisible(false);m.shadow.setVisible(false);m.hpBar.setVisible(false);
   grantXp(this.hero,15);this.onChange();
  }
  return true;
 }
 destroy(){for(const m of this.monsters){m.body.destroy();m.shadow.destroy();m.hpBar.destroy();}this.monsters=[];}
}
