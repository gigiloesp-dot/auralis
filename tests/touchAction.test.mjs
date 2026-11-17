import test from 'node:test';import assert from 'node:assert/strict';import {bindTouchAction} from '../js/input/bindTouchAction.js';
class Button extends EventTarget{
 disabled=false;capture=null;
 getBoundingClientRect(){return {left:0,top:0,width:100,height:100};}
 setPointerCapture(id){this.capture=id;}
 hasPointerCapture(id){return this.capture===id;}
 releasePointerCapture(id){if(this.capture===id)this.capture=null;}
 send(type,{id=2,x=50,y=50,detail=1}={}){const e=new Event(type,{cancelable:true});Object.assign(e,{pointerId:id,clientX:x,clientY:y,detail});this.dispatchEvent(e);return e;}
}
test('secondary touch release activates once and does not also run its synthetic click',()=>{
 const b=new Button();let count=0;const cleanup=bindTouchAction(b,()=>count++);
 b.send('pointerdown');assert.equal(b.capture,2);b.send('pointerup',{id:3});assert.equal(count,0);b.send('pointerup');assert.equal(count,1);
 b.send('click');assert.equal(count,1);b.send('click',{detail:0});assert.equal(count,2,'keyboard/AT activation remains available');
 cleanup();b.send('pointerdown');b.send('pointerup');b.send('click',{detail:0});assert.equal(count,2,'scene destruction releases every listener');
});
test('cancel, lost capture, drag outside and disabled buttons never invoke actions',()=>{
 const b=new Button();let count=0;const cleanup=bindTouchAction(b,()=>count++);
 for(const type of ['pointercancel','lostpointercapture']){b.send('pointerdown');b.send(type);b.send('pointerup');}
 b.send('pointerdown');b.send('pointerup',{x:140,y:50});b.disabled=true;b.send('pointerdown');b.send('pointerup');b.send('click',{detail:0});assert.equal(count,0);cleanup();
});
test('blur, orientation and hidden-document signals cancel pending action captures',()=>{
 const previousWindow=globalThis.window,previousDocument=globalThis.document;const win=new EventTarget(),doc=new EventTarget();doc.hidden=false;globalThis.window=win;globalThis.document=doc;
 try{const b=new Button();let count=0;const cleanup=bindTouchAction(b,()=>count++);
  for(const signal of ['blur','resize','orientationchange']){b.send('pointerdown');win.dispatchEvent(new Event(signal));assert.equal(b.capture,null);b.send('pointerup');}
  b.send('pointerdown');doc.hidden=true;doc.dispatchEvent(new Event('visibilitychange'));b.send('pointerup');assert.equal(count,0);cleanup();
 }finally{if(previousWindow===undefined)delete globalThis.window;else globalThis.window=previousWindow;if(previousDocument===undefined)delete globalThis.document;else globalThis.document=previousDocument;}
});
