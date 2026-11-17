const assert=require('node:assert/strict');
// Check the actual clickable44px region, including transparent CSS expansion.
// This keeps the touch guarantee when the requested visual face is34–38px.
async function assertTouchTarget(locator,{width=44,height=44}={}){
 const result=await locator.evaluate((n,{width,height})=>{const r=n.getBoundingClientRect(),cx=r.x+r.width/2,cy=r.y+r.height/2,owns=(x,y)=>{const h=document.elementFromPoint(x,y);return h===n||n.contains(h);};return {text:n.textContent,face:{width:r.width,height:r.height},horizontal:r.width>=width-.1||[cx-width/2+.5,cx+width/2-.5].every(x=>owns(x,cy)),vertical:r.height>=height-.1||[cy-height/2+.5,cy+height/2-.5].every(y=>owns(cx,y)),centre:owns(cx,cy)};},{width,height});
 assert.ok(result.horizontal&&result.vertical&&result.centre,'Touch region is smaller than required or covered: '+JSON.stringify(result));
}
module.exports={assertTouchTarget};
