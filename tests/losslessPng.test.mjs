import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {deflateSync} from 'node:zlib';
import {crc32,pngChunk,readPngChunks,decodePng,losslessPng} from '../scripts/lossless-png.mjs';

const signature=Buffer.from([137,80,78,71,13,10,26,10]);
function paeth(a,b,c){const p=a+b-c,da=Math.abs(p-a),db=Math.abs(p-b),dc=Math.abs(p-c);return da<=db&&da<=dc?a:db<=dc?b:c;}
function fixture(channels=4,filter=0,{depth=8,interlace=0,zeroRows=[]}={}){
 const width=37,height=15,stride=width*channels,pixels=Buffer.alloc(stride*height),scanlines=Buffer.alloc((stride+1)*height);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++)for(let c=0;c<channels;c++)pixels[y*stride+x*channels+c]=zeroRows.includes(y)?0:c===3?(x%3?120:0):(x*17+y*9+c*41)&255;
 for(let y=0;y<height;y++){scanlines[y*(stride+1)]=filter;for(let x=0;x<stride;x++){const i=y*stride+x,a=x>=channels?pixels[i-channels]:0,b=y?pixels[i-stride]:0,c=y&&x>=channels?pixels[i-stride-channels]:0,p=[0,a,b,Math.floor((a+b)/2),paeth(a,b,c)][filter];scanlines[y*(stride+1)+1+x]=(pixels[i]-p)&255;}}
 const header=Buffer.alloc(13);header.writeUInt32BE(width);header.writeUInt32BE(height,4);header[8]=depth;header[9]=channels===4?6:2;header[12]=interlace;
 const compressed=deflateSync(scanlines,{level:0}),mid=Math.floor(compressed.length/2);
 return {pixels,bytes:Buffer.concat([signature,pngChunk('IHDR',header),pngChunk('tEXt',Buffer.from('Comment\0keep every byte')),pngChunk('IDAT',compressed.subarray(0,mid)),pngChunk('IDAT',compressed.subarray(mid)),pngChunk('tEXt',Buffer.from('After\0also unchanged')),pngChunk('IEND',Buffer.alloc(0))])};
}
test('CRC matches standard vector and rejects damaged chunks',()=>{
 assert.equal(crc32(Buffer.from('123456789')),0xcbf43926);
 const {bytes}=fixture();bytes[50]^=1;assert.throws(()=>readPngChunks(bytes),/CRC/);assert.strictEqual(losslessPng(bytes).bytes,bytes);
});
for(const channels of [3,4])for(let filter=0;filter<5;filter++)test(`${channels===4?'RGBA':'RGB'} input filter ${filter}: exact channels, ancillary bytes, deterministic and idempotent`,()=>{
 const {bytes,pixels}=fixture(channels,filter),before=decodePng(bytes),result=losslessPng(bytes),after=decodePng(result.bytes);
 assert.deepEqual(before.pixels,pixels);assert.deepEqual(after.pixels,pixels);assert.equal(result.optimized,true);assert.ok(result.outputBytes<result.originalBytes);
 assert.deepEqual(readPngChunks(result.bytes).filter(c=>c.type!=='IDAT').map(c=>c.raw),readPngChunks(bytes).filter(c=>c.type!=='IDAT').map(c=>c.raw));
 assert.deepEqual(losslessPng(bytes).bytes,result.bytes);assert.deepEqual(losslessPng(result.bytes).bytes,result.bytes);
 if(channels===4){assert.equal(pixels[3],0);assert.equal(after.pixels[1],41);assert.equal(after.pixels[2],82);}
});
test('unsupported depth and interlace retain original bytes',()=>{
 for(const options of [{depth:16},{interlace:1}]){const {bytes}=fixture(4,0,options),result=losslessPng(bytes);assert.strictEqual(result.bytes,bytes);assert.equal(result.supported,false);assert.equal(decodePng(bytes),null);}
 const {bytes}=fixture(),chunks=readPngChunks(bytes),header=Buffer.from(chunks[0].data);header[9]=3;
 const indexed=Buffer.concat([signature,pngChunk('IHDR',header),...chunks.slice(1).map(c=>c.raw)]);assert.strictEqual(losslessPng(indexed).bytes,indexed);
});
test('all committed PNG assets round trip without modifying source files',()=>{
 const commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
 const files=execFileSync('git',['ls-tree','-r','--name-only',commit,'assets'],{encoding:'utf8'}).trim().split('\n').filter(f=>f.toLowerCase().endsWith('.png'));
 assert.ok(files.length>0);let originalBytes=0,outputBytes=0,optimized=0,supported=0;
 for(const file of files){
  const bytes=execFileSync('git',['show',commit+':'+file],{maxBuffer:32*1024*1024}),result=losslessPng(bytes),before=decodePng(bytes),after=decodePng(result.bytes);
  originalBytes+=bytes.length;outputBytes+=result.outputBytes;optimized+=Number(result.optimized);supported+=Number(result.supported);
  assert.ok(result.outputBytes<=bytes.length,file);assert.equal(result.reason,undefined,file);
  assert.deepEqual(after.pixels,before.pixels,file);assert.deepEqual([after.width,after.height,after.channels],[before.width,before.height,before.channels],file);
  assert.deepEqual(readPngChunks(result.bytes).filter(c=>c.type!=='IDAT').map(c=>c.raw),readPngChunks(bytes).filter(c=>c.type!=='IDAT').map(c=>c.raw),file);
 }
 console.log('Committed PNG publication measurement',JSON.stringify({commit,files:files.length,supported,optimized,originalBytes,outputBytes,savedBytes:originalBytes-outputBytes}));
});

test('zero scanlines retain exact bytes of the pinned pre-optimization encoder',async()=>{
 const oldSource=execFileSync('git',['show','1466628e16f1529fa2457dc86f1b6a6d0435253e:scripts/lossless-png.mjs']);
 const previous=await import('data:text/javascript;base64,'+oldSource.toString('base64'));
 for(const channels of[3,4])for(let filter=0;filter<5;filter++){
  const {bytes}=fixture(channels,filter,{zeroRows:[0,1,4,7,8,14]});
  assert.deepEqual(losslessPng(bytes).bytes,previous.losslessPng(bytes).bytes);
 }
 const {readFileSync}=await import('node:fs');
 for(const file of['assets/actors/task10-outdoor/desert-world-stone-giant.png','assets/actors/task10-north-expansion5a/north-species-058.png','assets/actors/task10-legacy-upgrade-a/forestWolf.png']){
  const bytes=readFileSync(file);assert.deepEqual(losslessPng(bytes).bytes,previous.losslessPng(bytes).bytes,file);
 }
});
