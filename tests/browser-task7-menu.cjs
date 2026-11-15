// Task 7: real home screen at phone sizes, plus raster proof that the scene
// reaches both edges. The journal's existing actual NPC reward test is reused.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {startServer,launchOptions,root}=require('./browserHarness.cjs');
const {assertTouchTarget}=require('./touchGeometry.cjs');
const sizes=[[1536,695],[640,360],[740,320],[844,390],[915,412],[1280,720]];
(async()=>{const external=process.env.AURALIS_TASK7_URL,baseline=process.env.AURALIS_TASK7_BASELINE==='1';
 const host=external?{url:external,close:async()=>{}}:await startServer(),out=path.join(root,'work/task7',external?'public':baseline?'before':'after');fs.mkdirSync(out,{recursive:true});let browser;const records=[];
 try{browser=await chromium.launch(launchOptions);
 for(const lang of ['ru','en','es']){
  const context=await browser.newContext({viewport:{width:1536,height:695},hasTouch:true,isMobile:true,deviceScaleFactor:1});
  await context.addInitScript(l=>localStorage.setItem('auralis_language',l),lang);
  const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(host.url);await p.locator('[data-menu-action=new]').waitFor();
  await p.locator('h1 img').evaluate(i=>i.decode());await p.evaluate(async()=>{const i=new Image();i.src='/assets/ui/medieval-menu-compact.webp';await i.decode();await document.fonts.ready;});
  const initialStore=await p.evaluate(()=>Object.fromEntries(Object.entries(localStorage)));
  for(const [width,height] of sizes){
   await p.setViewportSize({width,height});await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   const m=await p.locator('#menu').evaluate(n=>{const s=getComputedStyle(n),r=n.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,size:s.backgroundSize,position:s.backgroundPosition,image:s.backgroundImage,repeat:s.backgroundRepeat,overflow:document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight};});
   assert.equal(m.x,0);assert.equal(m.y,0);assert.equal(m.w,width);assert.equal(m.h,height);assert.equal(m.overflow,false);
   assert.equal(await p.locator('[data-menu-action]').count(),5);assert.equal((m.image.match(/medieval-menu-compact/g)||[]).length,1,'one background, no duplicated scene');
   for(const b of await p.locator('[data-menu-action]').all()){
    const r=await b.boundingBox();assert.ok(r.x>=0&&r.y>=0&&r.x+r.width<=width&&r.y+r.height<=height,JSON.stringify(r));await assertTouchTarget(b);
    assert.equal(await b.evaluate(n=>n.scrollWidth>n.clientWidth+1),false,'localized label fits');
   }
   const screenshot=await p.screenshot({path:path.join(out,`menu-${lang}-${width}x${height}.png`)});
   if(!baseline){
    assert.equal(m.size.split(',')[0].trim(),'cover');assert.equal(m.position,'50% 50%, 50% 50%');assert.equal(m.repeat,'no-repeat, no-repeat');
    const comparison=await p.evaluate(async png=>{
     const load=src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=src;});
     const [actual,art]=await Promise.all([load('data:image/png;base64,'+png),load('/assets/ui/medieval-menu-compact.webp')]);
     const make=()=>{const c=document.createElement('canvas');c.width=innerWidth;c.height=innerHeight;return c.getContext('2d',{willReadFrequently:true});},a=make(),e=make();a.drawImage(actual,0,0);
     const scale=Math.max(innerWidth/art.width,innerHeight/art.height),w=art.width*scale,h=art.height*scale;e.drawImage(art,(innerWidth-w)/2,(innerHeight-h)/2,w,h);
     let maxError=0,samples=0;
     for(const x of [1,10,innerWidth-11,innerWidth-2])for(const fraction of [.25,.5,.75]){const y=Math.floor(innerHeight*fraction),left=Math.max(0,x-2),top=y-2,ap=a.getImageData(left,top,5,5).data,ep=e.getImageData(left,top,5,5).data;for(let k=0;k<3;k++){let delta=0;for(let pixel=0;pixel<25;pixel++)delta+=ap[pixel*4+k]-ep[pixel*4+k];maxError=Math.max(maxError,Math.abs(delta/25));}samples++;}
     return {maxError,samples,scale,renderedWidth:w,renderedHeight:h};
    },screenshot.toString('base64'));
    assert.ok(comparison.maxError<=5,'screen edges must contain actual proportionally scaled scene pixels: '+JSON.stringify(comparison));Object.assign(m,comparison);
   }
   records.push({lang,width,height,...m});
  }
  assert.deepEqual(await p.evaluate(()=>Object.fromEntries(Object.entries(localStorage))),initialStore,'resizing home must not modify saves/settings');assert.deepEqual(errors,[]);await context.close();
 }
 fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({url:host.url,baseline,records},null,2));console.log('PASS task7 menu: '+records.length+' locale/viewport cases; five touch buttons, full viewport, no JS errors'+(baseline?' (before screenshots)':' and raster-verified cover edges'));
 }finally{await browser?.close();await host.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
