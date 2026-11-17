const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
async function startServer(){fs.mkdirSync(path.join(root,'work/browser'),{recursive:true});const server=http.createServer((request,response)=>{let file;try{file=path.resolve(root,'.'+decodeURIComponent(new URL(request.url,'http://localhost').pathname));}catch{response.writeHead(400).end();return;}if(!file.startsWith(root+path.sep)&&file!==root){response.writeHead(403).end();return;}const target=file===root?path.join(root,'index.html'):file;fs.readFile(target,(error,data)=>{if(error){response.writeHead(404).end();return;}response.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png'})[path.extname(target)]||'application/octet-stream');response.end(data);});});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));return {url:'http://127.0.0.1:'+server.address().port,close:()=>new Promise(resolve=>server.close(resolve))};}
const launchOptions={executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),headless:true,args:['--no-sandbox']};
// Interact through the one nearest-NPC prompt, then use the actual nearby
// resident selector. This does not teleport, open panels programmatically or
// modify character state, so it is also suitable for earned-progression tests.
async function openNpc(page,id){
 await page.locator('.npc-interact').click();
 const selected=await page.evaluate(()=>Auralis.game.scene.getScene('world').npcPanel.npc?.id);
 if(selected!==id)await page.locator('.npc-selector select').selectOption(id);
 await page.waitForFunction(id=>{const s=Auralis.game.scene.getScene('world');return s.npcPanel.opened&&s.npcPanel.npc?.id===id&&s.npcPanel.residents().some(n=>n.id===id);},id);
}
async function openStorage(page,id='borin'){
 await openNpc(page,id);
 const label=await page.evaluate(()=>Auralis.game.scene.getScene('world').npcPanel.t.storage);
 await page.locator('.npc-panel').getByRole('button',{name:label,exact:true}).click();
 await page.waitForFunction(()=>Auralis.game.scene.getScene('world').storagePanel.opened);
}
// Actual canvas touch. Reads only the anonymous marker ID and coordinates;
// neither this helper nor earned-progression drivers invoke pickup APIs.
async function tapGroundDrop(page,id){
 let point=null,previous=null;const deadline=Date.now()+3000;
 do{
  await page.evaluate(()=>new Promise(requestAnimationFrame));
  point=await page.evaluate(id=>{const s=Auralis.game.scene.getScene('world'),m=s.groundLoot.markers.get(id),c=s.cameras.main;if(!m)return null;return {x:(m.root.x-c.worldView.x)*c.zoom+c.x,y:(m.root.y-7-c.worldView.y)*c.zoom+c.y};},id);
  if(point&&previous&&Math.hypot(point.x-previous.x,point.y-previous.y)<.7)break;previous=point;
 }while(Date.now()<deadline);
 if(!point)throw Error('No rendered loot marker '+id);
 const viewport=page.viewportSize();if(point.x<0||point.y<0||point.x>viewport.width||point.y>viewport.height)throw Error('Loot marker outside viewport '+JSON.stringify(point));
 await page.touchscreen.tap(point.x,point.y);
}
// A marker tap opens details; acquiring an item requires its real pickup button.
async function pickGroundDrop(page,id,{close=true}={}){
 await tapGroundDrop(page,id);
 const row=page.locator('.loot-panel [data-loot-id="'+id+'"]');await row.locator('[data-loot-action=pickup]').tap();
 const button=page.locator('.loot-panel [data-loot-action=close]');if(close&&await button.isVisible())await button.tap();
}
async function collectNearbyLoot(page,walkTo){
 let collected=0;
 const candidates=await page.evaluate(()=>{const s=Auralis.game.scene.getScene('world');return s.groundLoot.visibleDrops().map(d=>({...d,distance:Math.hypot(d.x-s.hero.x,d.y-s.hero.y)})).filter(d=>d.distance<=140).sort((a,b)=>a.distance-b.distance);});
 for(const d of candidates){
  const current=await page.evaluate(id=>{const s=Auralis.game.scene.getScene('world'),d=s.groundLoot.visibleDrops().find(d=>d.id===id);return d?{distance:Math.hypot(d.x-s.hero.x,d.y-s.hero.y),slots:s.hero.inventory.length}:null;},d.id);
  if(!current||current.slots>=60)continue;
  if(current.distance>75){
   if(!walkTo)continue;
   // Loot can lie beside scenery. Reach a walkable point inside the real
   // pickup radius rather than requiring the character to stand on its centre.
   const approach=await page.evaluate(drop=>{
    const s=Auralis.game.scene.getScene('world'),origin={x:s.hero.x,y:s.hero.y},step=12;
    const clear=(a,b)=>{for(let i=1;i<=4;i++)if(!s.world.isWalkable(a.x+(b.x-a.x)*i/4,a.y+(b.y-a.y)*i/4))return false;return true;};
    const queue=[origin],seen=new Set(['0,0']);
    for(let i=0;i<queue.length&&i<3000;i++){
     const p=queue[i];if(Math.hypot(p.x-drop.x,p.y-drop.y)<=50)return p;
     for(const [dx,dy]of [[step,0],[-step,0],[0,step],[0,-step]]){const next={x:p.x+dx,y:p.y+dy},key=Math.round((next.x-origin.x)/step)+','+Math.round((next.y-origin.y)/step);if(seen.has(key)||Math.hypot(next.x-origin.x,next.y-origin.y)>260||!clear(p,next))continue;seen.add(key);queue.push(next);}
    }
    throw Error('No reachable loot pickup point: '+drop.id);
   },d);
   await walkTo(approach,15);
  }
  await pickGroundDrop(page,d.id);
  await page.waitForFunction(id=>!Auralis.game.scene.getScene('world').hero.worldState.groundLoot.drops[id],d.id,{timeout:3000});collected++;
 }
 return collected;
}
// Release after the first observed movement frame, independently of the input
// acknowledgement. Fixed 70ms gestures can finish before a software-rendered
// game frame and move nowhere; awaiting the ACK first can overshoot instead.
async function pulseJoystick(page,cdp,centre,attackPoint,joyWidth,dx,dy,holdAttack=false){
 const before=await page.evaluate(()=>{const h=Auralis.game.scene.getScene('world').hero;return {x:h.x,y:h.y};});
 const length=Math.hypot(dx-dy,(dx+dy)/2),scale=length?joyWidth*.24/length:0,point={id:1,x:centre.x+(dx-dy)*scale,y:centre.y+(dx+dy)/2*scale};
 const actions=[cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]})];
 if(holdAttack)actions.push(cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point,{id:2,...attackPoint}]}));
 let movementError;
 try{await page.waitForFunction(before=>{const s=Auralis.game.scene.getScene('world');return s.controls.pointerId!==null&&Math.hypot(s.hero.x-before.x,s.hero.y-before.y)>=2;},before,{polling:'raf',timeout:1500}).then(handle=>handle.dispose());}
 catch(error){movementError=error;}
 finally{actions.push(cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]}));await Promise.all(actions);}
 if(movementError)throw movementError;
}

module.exports={startServer,launchOptions,root,openNpc,openStorage,tapGroundDrop,pickGroundDrop,collectNearbyLoot,pulseJoystick};
