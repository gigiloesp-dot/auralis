// Secondary touch fingers do not reliably synthesize click while the joystick
// owns the primary capture. Activate on release, and keep keyboard/AT click.
export function bindTouchAction(button,action){
 let pointerId=null,lastPointerAt=-Infinity;const bindings=[];
 const on=(target,type,fn)=>{if(!target?.addEventListener)return;target.addEventListener(type,fn,{passive:false});bindings.push(()=>target.removeEventListener(type,fn));};
 const cancel=()=>{const captured=pointerId;pointerId=null;if(captured!==null&&button.hasPointerCapture?.(captured))try{button.releasePointerCapture?.(captured);}catch{}};
 on(button,'pointerdown',event=>{if(button.disabled||pointerId!==null)return;event.preventDefault();pointerId=event.pointerId;button.setPointerCapture?.(pointerId);});
 on(button,'pointerup',event=>{
  if(event.pointerId!==pointerId)return;pointerId=null;event.preventDefault();
  const r=button.getBoundingClientRect();
  if(button.disabled||event.clientX<r.left||event.clientX>r.left+r.width||event.clientY<r.top||event.clientY>r.top+r.height)return;
  lastPointerAt=event.timeStamp;action(event);
 });
 for(const type of ['pointercancel','lostpointercapture'])on(button,type,event=>{if(event.pointerId===pointerId)cancel();});
 on(button,'click',event=>{
  if(button.disabled)return;
  if(event.detail!==0&&event.timeStamp-lastPointerAt>=0&&event.timeStamp-lastPointerAt<1000){event.preventDefault();return;}
  action(event);
 });
 on(globalThis.window,'blur',cancel);on(globalThis.window,'resize',cancel);on(globalThis.window,'orientationchange',cancel);
 on(globalThis.document,'visibilitychange',()=>{if(document.hidden)cancel();});
 return ()=>{cancel();for(const remove of bindings)remove();};
}
