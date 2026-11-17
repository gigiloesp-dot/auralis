import test from 'node:test';
import assert from 'node:assert/strict';
import {TouchControls} from '../js/input/TouchControls.js';
class Element extends EventTarget{
 style={};capture=null;
 setPointerCapture(id){this.capture=id;}
 getBoundingClientRect(){return {left:0,top:0,width:100,height:100};}
 send(type,id,x=50,y=50){const e=new Event(type,{cancelable:true});Object.assign(e,{pointerId:id,clientX:x,clientY:y});this.dispatchEvent(e);}
}
test('attack captures the initiating pointer and ignores another finger release',()=>{
 const attack=new Element(),controls=new TouchControls({joystick:null,nub:null,attack});
 attack.send('pointerdown',1);assert.equal(attack.capture,1);assert.equal(controls.attacking,true);
 attack.send('pointerup',2);assert.equal(controls.attacking,true);
 attack.send('pointerup',1);assert.equal(controls.attacking,false);controls.destroy();
});
test('joystick and attack can be used simultaneously and reset safely',()=>{
 const joystick=new Element(),nub=new Element(),attack=new Element(),controls=new TouchControls({joystick,nub,attack});
 joystick.send('pointerdown',1,100,50);attack.send('pointerdown',2);
 assert.equal(controls.axis.x,1);assert.equal(controls.attacking,true);
 attack.send('pointercancel',2);assert.equal(controls.axis.x,1);assert.equal(controls.attacking,false);
 controls.reset();assert.equal(controls.axis.x,0);assert.equal(nub.style.transform,'');
 controls.destroy();attack.send('pointerdown',3);assert.equal(controls.attacking,false);
});
test('a short tap survives a missed render frame but a canceled touch never queues a strike',()=>{
 const attack=new Element(),controls=new TouchControls({joystick:null,nub:null,attack});attack.send('pointerdown',1);attack.send('pointerup',1);assert.equal(controls.attacking,false);assert.equal(controls.consumeAttack(),true);assert.equal(controls.consumeAttack(),false);
 attack.send('pointerdown',2);attack.send('pointercancel',2);assert.equal(controls.consumeAttack(),false);attack.send('pointerdown',3);controls.reset();assert.equal(controls.consumeAttack(),false);controls.destroy();
});
test('landscape-to-landscape orientation change releases both held control pointers',()=>{
 const previous=globalThis.window,win=new EventTarget();globalThis.window=win;
 let controls;
 try{
  const joystick=new Element(),nub=new Element(),attack=new Element();controls=new TouchControls({joystick,nub,attack});
  joystick.send('pointerdown',1,100,50);attack.send('pointerdown',2);assert.equal(controls.axis.x,1);assert.equal(controls.attacking,true);
  win.dispatchEvent(new Event('orientationchange'));
  assert.equal(controls.pointerId,null);assert.equal(controls.attackPointerId,null);assert.equal(controls.axis.x,0);assert.equal(controls.axis.y,0);assert.equal(controls.attacking,false);assert.equal(controls.consumeAttack(),false);assert.equal(nub.style.transform,'');
 }finally{controls?.destroy();if(previous===undefined)delete globalThis.window;else globalThis.window=previous;}
});
