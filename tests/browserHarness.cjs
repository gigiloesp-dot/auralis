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
module.exports={startServer,launchOptions,root,openNpc,openStorage};
