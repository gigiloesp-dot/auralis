// Mechanical8x6 source-sheet registration. No pixels, anatomy or poses are
// synthesized. Original generated paintings/cutouts remain preserved on disk.
const fs=require('node:fs'),{chromium}=require('playwright');
const {launchOptions}=require('../tests/browserHarness.cjs');
const definitions=[
 ['ancient-species-012','spine-chime-wisp',72],
 ['ancient-species-014','sickle-handed-waste-sentinel',84],
 ['ancient-species-017','bog-sickle-scarab',60],
 ['ancient-species-020','long-arm-aqueduct-sentinel',86],
 ['ancient-species-023','crescent-jawed-mystic-viper',67],
 ['ancient-species-027','sickle-gauntlet-drowned-knight',82],
 ['ancient-species-028','shield-collar-forest-viper',72],
 ['ancient-species-036','antler-winged-sun-gargoyle',76]
];
(async()=>{const sourceRoot='art/source/task10-ancient-expansion2/',targetRoot='assets/actors/task10-ancient-expansion2/';fs.mkdirSync(sourceRoot,{recursive:true});fs.mkdirSync(targetRoot,{recursive:true});const browser=await chromium.launch(launchOptions),entries={};try{const page=await browser.newPage();for(const [id,name,targetIdleHeight]of definitions){const original=sourceRoot+id+'-original.png',cutout=sourceRoot+id+'-cutout.png',reflow=sourceRoot+id+'-reflow.png',clean=sourceRoot+id+'-clean.png',alternate=sourceRoot+id+'-alternate-original.png',source=fs.existsSync(alternate)?alternate:fs.existsSync(clean)?clean:fs.existsSync(reflow)?reflow:fs.existsSync(cutout)?cutout:original,input=fs.readFileSync(source).toString('base64');const result=await page.evaluate(async encoded=>{
 const img=new Image();img.src='data:image/png;base64,'+encoded;await img.decode();const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=1152;const g=canvas.getContext('2d');g.imageSmoothingQuality='high';const frames={},footlines={},idleHeights=[],banks=['idle','run-a','run-b','attack','hurt','death'],directions=['n','ne','e','se','s','sw','w','nw'],sw=img.width/8,sh=img.height/6,fit=Math.min(96/sw,96/sh),w=sw*fit,h=sh*fit;
 for(let row=0;row<6;row++)for(let col=0;col<8;col++){g.drawImage(img,col*sw,row*sh,sw,sh,col*128+(128-w)/2,row*192+70+(104-h)/2,w,h);const name=banks[row]+'/'+directions[col];frames[name]={frame:{x:col*128,y:row*192,w:128,h:192}};const p=g.getImageData(col*128,row*192,128,192).data;let baseline=0,top=192,opaque=0;for(let y=0;y<192;y++)for(let x=0;x<128;x++)if(p[(y*128+x)*4+3]>128){baseline=Math.max(baseline,y);top=Math.min(top,y);opaque++;}if(opaque<200)throw Error('Empty painted pose '+name);footlines[name]=baseline;if(row===0)idleHeights.push(baseline-top+1);}
 // Beige compositing is visual QA only: the runtime atlas remains transparent.
 const qa=document.createElement('canvas');qa.width=1024;qa.height=768;const q=qa.getContext('2d');q.fillStyle='#cab582';q.fillRect(0,0,qa.width,qa.height);for(let row=0;row<6;row++)for(let col=0;col<8;col++)q.drawImage(canvas,col*128,row*192,128,192,col*128,row*128-48,128,192);
 return {png:canvas.toDataURL().split(',')[1],qa:qa.toDataURL().split(',')[1],frames,footlines,sourceWidth:img.width,sourceHeight:img.height,idleHeight:Math.max(...idleHeights)};
 },input);const url=targetRoot+id+'.png',atlasURL=targetRoot+id+'.json';fs.writeFileSync(url,Buffer.from(result.png,'base64'));fs.writeFileSync(sourceRoot+id+'-composited-qa.png',Buffer.from(result.qa,'base64'));fs.writeFileSync(atlasURL,JSON.stringify({frames:result.frames,meta:{image:id+'.png',size:{w:1024,h:1152},source,sourceSize:{w:result.sourceWidth,h:result.sourceHeight}}},null,2)+'\n');const scale=targetIdleHeight/result.idleHeight;entries[id]={key:'task10-monster-'+name,url,atlasURL,scale,annotationHeight:Math.max(46,Math.ceil(result.idleHeight*scale+12)),frameHeight:192,frameWidth:128,poseBanks:['idle','run-a','run-b','attack','hurt','death'],drawnDeath:true,footlines:result.footlines};console.log('Packed',id,name,'48 real drawn poses');}
 fs.writeFileSync('js/assets/ancientExpansion2Art.js','// Eight original48-pose models. Not registered in the live resolver yet.\nexport const ANCIENT_EXPANSION2_ART=Object.freeze('+JSON.stringify(entries,null,2)+');\nexport const ancientExpansion2Art=id=>ANCIENT_EXPANSION2_ART[id]||null;\n');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
