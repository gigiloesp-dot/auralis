// Art-only validation; live resolver/ability integration is deliberately checked elsewhere.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {NORTH_EXPANSION5A_ART as entries} from '../js/assets/northExpansion5aArt.js';
import {pngAlpha} from '../tests/pngAlpha.mjs';
assert.equal(Object.keys(entries).length,8);
const result={status:'PASS',runtimeRegistered:false,browserVerified:false,models:[]};
for(const[id,e]of Object.entries(entries)){
 const im=pngAlpha(e.url),atlas=JSON.parse(fs.readFileSync(e.atlasURL));
 assert.equal(fs.readFileSync(e.url)[25],6,'RGBA PNG required');assert.equal(im.width,1024);assert.equal(im.height,1152);assert.equal(Object.keys(atlas.frames).length,48);assert.equal(Object.keys(atlas.meta.sourceRects).length,48);assert.equal(atlas.meta.alphaEditing,false);assert.ok(fs.existsSync(atlas.meta.source));
 assert.ok(im.alpha.filter(a=>a===0).length>im.alpha.length*.6);
 let min=Infinity;const idleHeights=[];
 for(const direction of['n','ne','e','se','s','sw','w','nw']){
  const hashes=new Set();
  for(const bank of e.poseBanks){
   const name=bank+'/'+direction,f=atlas.frames[name].frame,alpha=[];let count=0,bottom=0,top=192;
   for(let y=0;y<f.h;y++)for(let x=0;x<f.w;x++){
    const a=im.alpha[(f.y+y)*im.width+f.x+x];alpha.push(a);
    if(a>128){count++;bottom=Math.max(bottom,y);top=Math.min(top,y);}
    if(x<12||x>=116||y<70||y>=174)assert.equal(a,0,id+'/'+name+' gutter');
   }
   assert.ok(count>200,id+'/'+name+' painted pixels');assert.equal(bottom,e.footlines[name]);min=Math.min(min,count);
   if(bank==='idle')idleHeights.push(bottom-top+1);
   hashes.add(createHash('sha256').update(Buffer.from(alpha)).digest('hex'));
  }
  assert.equal(hashes.size,6,id+'/'+direction+' distinct state silhouettes');
 }
 if(['north-species-061','north-species-062','north-species-063'].includes(id))assert.ok(Math.max(...idleHeights)>=60&&Math.max(...idleHeights)<=75,id+' humanoid native height');
 result.models.push({nativeIdleHeight:Math.max(...idleHeights),zeroAlphaFraction:im.alpha.filter(a=>a===0).length/im.alpha.length,id,image:e.url,atlas:e.atlasURL,width:im.width,height:im.height,poses:48,minimumOpaquePixelsPerFrame:min,rgbaBytes:1024*1152*4,sha256:createHash('sha256').update(fs.readFileSync(e.url)).digest('hex'),scale:e.scale,annotationHeight:e.annotationHeight});
}
fs.writeFileSync('art/source/task10-north-expansion5a/validation.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
