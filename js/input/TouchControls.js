export class TouchControls{
 constructor({joystick=document.getElementById('joy'),nub=document.getElementById('nub'),attack=document.getElementById('attack')}={}){
  this.axis={x:0,y:0};this.attacking=false;this.joystick=joystick;this.nub=nub;this.attack=attack;this.pointerId=null;this.attackPointerId=null;this.cleanup=[];
  if(joystick&&nub)this.bindJoystick();
  if(attack)this.bindAttack();
  if(typeof window!=='undefined')this.on(window,'blur',()=>this.reset());
  if(typeof document!=='undefined')this.on(document,'visibilitychange',()=>{if(document.hidden)this.reset();});
 }
 on(target,type,handler){target.addEventListener(type,handler,{passive:false});this.cleanup.push(()=>target.removeEventListener(type,handler));}
 reset(){this.pointerId=null;this.attackPointerId=null;this.axis.x=0;this.axis.y=0;this.attacking=false;if(this.nub)this.nub.style.transform='';}
 bindJoystick(){
  const joy=this.joystick,nub=this.nub;
  const move=e=>{if(this.pointerId!==e.pointerId)return;e.preventDefault();const r=joy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=e.clientX-cx,dy=e.clientY-cy,max=r.width*.25;if(max<=0)return;const m=Math.hypot(dx,dy),scale=m>max?max/m:1;this.axis.x=dx*scale/max;this.axis.y=dy*scale/max;nub.style.transform='translate('+dx*scale+'px,'+dy*scale+'px)';};
  const start=e=>{if(this.pointerId!==null)return;this.pointerId=e.pointerId;joy.setPointerCapture?.(e.pointerId);move(e);};
  const stop=e=>{if(e.pointerId!==this.pointerId)return;this.pointerId=null;this.axis.x=0;this.axis.y=0;nub.style.transform='';};
  this.on(joy,'pointerdown',start);this.on(joy,'pointermove',move);this.on(joy,'pointerup',stop);this.on(joy,'pointercancel',stop);this.on(joy,'lostpointercapture',stop);
 }
 bindAttack(){
  this.on(this.attack,'pointerdown',e=>{if(this.attackPointerId!==null)return;e.preventDefault();this.attackPointerId=e.pointerId;this.attacking=true;this.attack.setPointerCapture?.(e.pointerId);});
  const stop=e=>{if(e.pointerId!==this.attackPointerId)return;this.attackPointerId=null;this.attacking=false;};
  for(const type of ['pointerup','pointercancel','lostpointercapture'])this.on(this.attack,type,stop);
 }
 destroy(){this.cleanup.forEach(fn=>fn());this.cleanup=[];this.reset();}
}
