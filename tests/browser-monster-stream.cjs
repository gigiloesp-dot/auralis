// Stream coverage and timing fixtures. Camera paths and positions are supplied
// explicitly; the browser executes the actual stream module on real descriptors.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const {startServer,launchOptions,root}=require('./browserHarness.cjs');
(async()=>{const server=await startServer();let browser;try{
 browser=await chromium.launch(launchOptions);const page=await browser.newPage({viewport:{width:844,height:390},isMobile:true,hasTouch:true});await page.goto(server.url);
 const baseline=process.env.AURALIS_STREAM_BASELINE==='1';
 const result=await page.evaluate(async baseline=>{
  const {MonsterStream}=await import(baseline?'/work/stream-benchmark/MonsterStream-baseline.js':'/js/monsters/MonsterStream.js');
  const {project}=await import('/js/world/projection.js');
  const content=await fetch('/work/stream-benchmark/content-baseline.json').then(r=>r.json());
  const rows=[];
  for(const [width,height]of [[844,390],[915,412],[1280,720]]){
   const zoom=Math.max(.7,Math.min(1.3,Math.min(width/840,height/460))),view={x:0,y:0,width:width/zoom,height:height/zoom};
   let created=0,removed=0,max=0,missing=0,visible=0;const hero={x:0,y:0};let samples=0,time=0,maxCorner=0;
   for(const region of content){
    const stream=new MonsterStream(region,hero,d=>{created++;return {...d,alive:true,homeX:d.x,homeY:d.y};},()=>removed++,{viewport:()=>view});
    for(const camp of region.camps){
     for(const offset of [{x:0,y:0},{x:300,y:-200},{x:-240,y:300}]){
      hero.x=camp.x+offset.x;hero.y=camp.y+offset.y;const p=project(hero.x,hero.y);view.x=p.x-view.width/2;view.y=p.y-view.height/2;
      const start=performance.now();stream.update();time+=performance.now()-start;samples++;max=Math.max(max,stream.loaded.size);
      for(const d of stream.descriptors){const q=project(d.x,d.y),boss=!!d.bossType,half=boss?160:56,tall=boss?320:120;
       if(q.x>=view.x-half&&q.x<=view.x+view.width+half&&q.y>=view.y&&q.y<=view.y+view.height+tall){visible++;if(!stream.loaded.has(d.id))missing++;}
      }
      maxCorner=Math.max(maxCorner,Math.hypot(view.width/2,view.height));
     }
    }
    // Oscillating near a boundary must not repeatedly create/remove actors.
    for(let i=0;i<120;i++){hero.x+=i%2?15:-15;const p=project(hero.x,hero.y);view.x=p.x-view.width/2;view.y=p.y-view.height/2;const start=performance.now();stream.update();time+=performance.now()-start;samples++;max=Math.max(max,stream.loaded.size);}
    stream.destroy();
   }
   rows.push({width,height,zoom,maxCornerWorld:Math.round(maxCorner),descriptorCount:content.reduce((n,r)=>n+r.camps.reduce((x,c)=>x+c.spawns.length,0),0),samples,created,removed,maxLoaded:max,visibleChecks:visible,missingVisible:missing,streamCpuMs:Number(time.toFixed(3)),meanUpdateMs:Number((time/samples).toFixed(5))});
  }
  return rows;
 },baseline);
 fs.mkdirSync(root+'/work/stream-benchmark',{recursive:true});fs.writeFileSync(root+'/work/stream-benchmark/'+(baseline?'baseline':'candidate')+'.json',JSON.stringify(result,null,2));
 for(const row of result){console.log((baseline?'BASELINE':'CANDIDATE')+' stream coverage',JSON.stringify(row));if(!baseline){assert.equal(row.missingVisible,0,'Visible descriptor must be resident before it enters the viewport');assert.ok(row.maxLoaded<150,'Only a bounded local subset may load');}}
 if(!baseline)console.log('PASS viewport coverage at3sizes, bounded descriptors and measured stream update cost');
 }finally{if(browser)await browser.close();await server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
