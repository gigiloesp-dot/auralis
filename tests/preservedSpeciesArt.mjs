import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {decodePng} from '../scripts/lossless-png.mjs';
import {uniqueSpeciesEntries} from '../js/assets/speciesAssets.js';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const bytes = readFileSync(new URL('../docs/qa/task10/legacy-upgrades/original23.json', import.meta.url));
assert.equal(hash(bytes), 'dcfb939933bcdf0cdaefbbc5d3f6ddf23a0c03b00ee539b126181f70df44359d', 'pre-upgrade legacy evidence is immutable');
const fixture = JSON.parse(bytes);
assert.equal(fixture.capturedBeforeRegistryIntegration, true);
assert.equal(fixture.entries.length, 23);
const originals = new Map(fixture.entries.map(row => [row.id, row]));
assert.equal(originals.size, 23);
const directions = ['e','se','s','sw','w','nw','n','ne'];
const banks = ['idle','run-a','run-b','attack','hurt','death'];

// Return the frozen descriptor only after proving the narrowly authorized extension.
// Nonlegacy descriptors are returned untouched and remain subject to old exact hashes.
export function preservedSpeciesArt(id, current) {
 const row = originals.get(id);
 if (!row) return current;
 const old = row.descriptor;
 const isPackA = id.startsWith('forest-') && id !== 'forest-species-011';
 const allowed = new Set([...Object.keys(old),'frameWidth','frameHeight','poseBanks','drawnDeath','footlines',...(isPackA ? ['preservedOriginalKey'] : [])]);
 assert.deepEqual(Object.keys(current).filter(key => !allowed.has(key)), [], id+'/unexpected descriptor fields');
 for (const [key,value] of Object.entries(old)) {
  if (['key','url','atlasURL','baselines'].includes(key)) continue;
  assert.deepEqual(current[key], value, id+'/'+key+' preserved');
 }
 assert.deepEqual(current.baselines,isPackA?{...old.baselines,hurt:225,death:225}:old.baselines,id+'/original bank baselines and exact appended defaults');
 if (isPackA) assert.equal(current.preservedOriginalKey,old.key,id+'/required original identity marker');
 for (const key of ['key','url','atlasURL']) {
  assert.equal(typeof current[key],'string');assert.notEqual(current[key],old[key],id+'/'+key+' extension identity');
  assert.equal(uniqueSpeciesEntries().filter(([,entry])=>entry[key]===current[key]).length,1,id+'/'+key+' unique identity');
 }
 assert.equal(current.frameWidth,192);assert.equal(current.frameHeight,256);
 assert.deepEqual(current.poseBanks,banks);assert.equal(current.drawnDeath,true);
 const oldPNG=readFileSync(old.url),oldAtlasBytes=readFileSync(old.atlasURL);
 assert.equal(hash(oldPNG),row.pngSHA256,id+'/original PNG bytes');
 assert.equal(hash(oldAtlasBytes),row.atlasSHA256,id+'/original atlas bytes');
 const before=decodePng(oldPNG),after=decodePng(readFileSync(current.url));
 assert.deepEqual([before.width,before.height,before.channels],[1536,1024,4]);
 assert.deepEqual([after.width,after.height,after.channels],[1536,1536,4]);
 assert.deepEqual(after.pixels.subarray(0,before.pixels.length),before.pixels,id+'/all original RGBA including transparent pixels');
 const oldAtlas=JSON.parse(oldAtlasBytes),atlas=JSON.parse(readFileSync(current.atlasURL));
 assert.equal(Object.keys(oldAtlas.frames).length,32);assert.equal(Object.keys(row.effectiveFrames).length,32);
 assert.deepEqual(Object.keys(atlas.frames).sort(),banks.flatMap(bank=>directions.map(dir=>bank+'/'+dir)).sort());
 assert.deepEqual(Object.keys(current.footlines).sort(),['hurt','death'].flatMap(bank=>directions.map(dir=>bank+'/'+dir)).sort(),id+'/only16 new footlines');
 for (const [name,evidence] of Object.entries(row.effectiveFrames)) {
  assert.deepEqual(oldAtlas.frames[name],evidence.atlas,id+'/'+name+' frozen source atlas object');
  assert.deepEqual(atlas.frames[name],evidence.atlas,id+'/'+name+' full atlas object preserved');
  const footline=current.footlines[name]??current.baselines[name.split('/')[0]]??225;
  assert.equal(footline,evidence.footline,id+'/'+name+' effective footline');
  assert.equal(.5,evidence.originX);assert.equal(footline/current.frameHeight,evidence.originY,id+'/'+name+' effective origin');
 }
 for (const dir of directions) {
  const newPoses=new Set();
  for (const bank of ['hurt','death']) {
   const name=bank+'/'+dir,frame=atlas.frames[name],f=frame.frame;
   assert.deepEqual(f,{x:directions.indexOf(dir)*192,y:banks.indexOf(bank)*256,w:192,h:256},id+'/'+name+' appended geometry');
   const {sourceRect,...geometry}=frame;
   assert.deepEqual(geometry,{frame:f,rotated:false,trimmed:false,spriteSourceSize:{x:0,y:0,w:192,h:256},sourceSize:{w:192,h:256}},id+'/'+name+' complete frame metadata');
   if(sourceRect){assert.deepEqual(Object.keys(sourceRect).sort(),['h','w','x','y']);for(const value of Object.values(sourceRect))assert.ok(Number.isInteger(value)&&value>=0,id+'/'+name+' source rectangle');assert.ok(sourceRect.w>0&&sourceRect.h>0);}
   const pixels=Buffer.alloc(192*256*4);let count=0,bottom=-1;
   for(let y=0;y<256;y++) for(let x=0;x<192;x++) {
    const offset=((f.y+y)*after.width+f.x+x)*4,alpha=after.pixels[offset+3];
    after.pixels.copy(pixels,(y*192+x)*4,offset,offset+4);
    if(alpha>128){count++;bottom=Math.max(bottom,y);}
    if(x<8||x>=184||y<8||y>=248) assert.equal(alpha,0,id+'/'+name+' bounded gutters');
   }
   assert.ok(count>200,id+'/'+name+' actual painted body');
   assert.equal(current.footlines[name],bottom,id+'/'+name+' measured footline');
   newPoses.add(hash(pixels));
   for(const oldBank of banks.slice(0,4)) {
    const oldFrame=atlas.frames[oldBank+'/'+dir].frame,oldPixels=Buffer.alloc(pixels.length);
    for(let y=0;y<256;y++) after.pixels.copy(oldPixels,y*192*4,((oldFrame.y+y)*1536+oldFrame.x)*4,((oldFrame.y+y)*1536+oldFrame.x+192)*4);
    assert.notEqual(hash(pixels),hash(oldPixels),id+'/'+name+' independently drawn from '+oldBank);
   }
  }
  assert.equal(newPoses.size,2,id+'/'+dir+' distinct hurt and death paintings');
 }
 return old;
}

export function assertPreservedSpeciesArt(row,current) {
 const original=preservedSpeciesArt(row.id,current);
 assert.equal(hash(JSON.stringify(original)),row.artHash,row.id+'/original art descriptor');
 assert.equal(original.url,row.image);assert.equal(original.atlasURL,row.atlas);
 assert.equal(hash(readFileSync(row.image)),row.imageSha256,row.id+'/original PNG');
 assert.equal(hash(readFileSync(row.atlas)),row.atlasSha256,row.id+'/original atlas');
 const legacy=originals.get(row.id);
 if(legacy){assert.equal(row.imageSha256,legacy.pngSHA256);assert.equal(row.atlasSha256,legacy.atlasSHA256);}
}
