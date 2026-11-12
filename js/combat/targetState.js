export const TARGET_LINGER_MS=4000;
const alive=monster=>!!monster&&monster.alive!==false&&Number.isFinite(monster.hp)&&monster.hp>0;
const snapshot=monster=>({id:monster.id,key:monster.key,type:monster.type,kind:monster.kind,name:monster.name,level:monster.level,hp:monster.hp,maxHp:monster.maxHp,alive:true});
// Visibility alone is not a combat action: it must never keep this timer alive.
// A lost target exposes only its last observed values for the brief linger time.
export class TargetState{
 constructor({lingerMs=TARGET_LINGER_MS}={}){this.lingerMs=lingerMs;this.clear();}
 engage(monster,now=0){
  if(!alive(monster)||!Number.isFinite(now))return false;
  this.target=monster;this.engagedAt=now;this.lastVisible=snapshot(monster);return true;
 }
 clear(monster){
  if(monster&&this.target!==monster)return false;
  this.target=null;this.engagedAt=-Infinity;this.lastVisible=null;return true;
 }
 update(now,{hero,monsters=[],visible=()=>true}={}){
  const target=this.target;
  if(!target)return null;
  if(!hero||hero.hp<=0||!alive(target)||!Number.isFinite(now)||now<this.engagedAt||now-this.engagedAt>=this.lingerMs){this.clear();return null;}
  if(monsters.includes(target)&&target.active!==false&&visible(target)){this.lastVisible=snapshot(target);return target;}
  return this.lastVisible;
 }
}
