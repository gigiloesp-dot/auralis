import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {inflateSync} from 'node:zlib';
import {approvedActorSource,LEGACY_ACTOR_NAMES} from '../scripts/export-static.mjs';
import {MONSTER_ART} from '../js/assets/monsterArt.js';
import {NPC_ART} from '../js/assets/npcArt.js';
import {BOSS_ART} from '../js/assets/bossArt.js';
import {ACTOR_ART} from '../js/assets/actorArt.js';
import {decodePng} from '../scripts/lossless-png.mjs';
import {LOSSLESS_ACTOR_TEXTURE_URLS,resolveActorTextureURL} from '../js/assets/losslessTextureDelivery.js';
import {ActorTextureCache} from '../js/assets/ActorTextureCache.js';
import {queueAssets} from '../js/assets/AssetLoader.js';

function losslessWebpChunks(encoded){
 assert.equal(encoded.toString('ascii',0,4),'RIFF');assert.equal(encoded.toString('ascii',8,12),'WEBP');assert.equal(encoded.readUInt32LE(4)+8,encoded.length);
 const chunks=[];let at=12;
 while(at<encoded.length){assert.ok(at+8<=encoded.length);const type=encoded.toString('ascii',at,at+4),length=encoded.readUInt32LE(at+4),end=at+8+length;assert.ok(end<=encoded.length);chunks.push({type,data:encoded.subarray(at+8,end)});at=end+(length%2);}
 assert.equal(at,encoded.length);assert.equal(chunks.filter(chunk=>chunk.type==='VP8L').length,1);assert.equal(chunks.some(chunk=>chunk.type==='VP8 '),false);
 assert.ok(['VP8L','VP8X'].includes(chunks[0]?.type));
 if(chunks[0].type==='VP8X'){assert.equal(chunks[0].data.length,10);assert.equal(chunks[0].data[0]&0x20, chunks.some(chunk=>chunk.type==='ICCP')?0x20:0);}
 return chunks;
}
test('legacy delivery allowlist exactly matches original monster, NPC and boss descriptors and excludes all player assets',()=>{
 const expected=new Set([...Object.values(MONSTER_ART),ACTOR_ART.forestWolf,...Object.values(NPC_ART),...Object.values(BOSS_ART)].map(entry=>entry.url));
 const actual=new Set(Object.entries(LEGACY_ACTOR_NAMES).flatMap(([role,names])=>names.map(name=>'assets/actors/'+role+'/'+name+'.png')));
 assert.deepEqual(actual,expected);assert.equal(actual.size,73);
 for(const source of actual)assert.equal(approvedActorSource(source),true,source);
 for(const source of ['assets/actors/heroes/warrior.png','assets/actors/hero-bodies/warrior.png','assets/equipment/sword.png','assets/portraits/mira.png','assets/actors/monsters/unknown.png','assets/actors/npcs/unknown.png','assets/actors/bosses/unknown.png','assets/actors/task10-x/../heroes/warrior.png'])assert.equal(approvedActorSource(source),false,source);
});
test('lossless WebP RIFF validation supports ICC extended headers without allowing lossy chunks',()=>{
 const chunk=(type,data)=>{const out=Buffer.alloc(8+data.length+(data.length%2));out.write(type);out.writeUInt32LE(data.length,4);data.copy(out,8);return out;};
 const riff=chunks=>{const out=Buffer.concat([Buffer.from('RIFF0000WEBP'),...chunks]);out.writeUInt32LE(out.length-8,4);return out;};
 const extended=Buffer.alloc(10);extended[0]=0x20;
 const bytes=riff([chunk('VP8X',extended),chunk('ICCP',Buffer.from('profile')),chunk('VP8L',Buffer.from([0x2f]))]);
 assert.deepEqual(losslessWebpChunks(bytes).map(c=>c.type),['VP8X','ICCP','VP8L']);
 assert.throws(()=>losslessWebpChunks(riff([chunk('VP8 ',Buffer.alloc(0))])));
 assert.throws(()=>losslessWebpChunks(bytes.subarray(0,-1)));
});

const manifest=JSON.parse(readFileSync(new URL('../assets/actors/lossless-delivery.json',import.meta.url))),hash=bytes=>createHash('sha256').update(bytes).digest('hex');
test('lossless actor delivery manifest pins committed sources, encoded bytes, and every source RGBA channel',()=>{
 assert.equal(manifest.version,1);assert.match(manifest.sourceCommit,/^[0-9a-f]{40}$/);assert.deepEqual([manifest.encoding.format,manifest.encoding.lossless,manifest.encoding.exact,manifest.encoding.method],['WebP',true,true,6]);
 assert.ok(manifest.entries.length>0);assert.equal(Object.keys(LOSSLESS_ACTOR_TEXTURE_URLS).length,manifest.entries.length);
 const paths=execFileSync('git',['ls-tree','-r','--name-only',manifest.sourceCommit,'assets/actors'],{encoding:'utf8'}).trim().split('\n'),sources=new Set();
 for(const entry of manifest.entries){
  assert.ok(approvedActorSource(entry.sourceURL),entry.sourceURL);assert.ok(paths.includes(entry.sourceURL),entry.sourceURL);assert.ok(!sources.has(entry.sourceURL));sources.add(entry.sourceURL);
  assert.equal(entry.url,entry.sourceURL.slice(0,-4)+'.webp');assert.equal(resolveActorTextureURL(entry.sourceURL),entry.url);
  const original=readFileSync(new URL('../'+entry.sourceURL,import.meta.url)),encoded=readFileSync(new URL('../'+entry.url,import.meta.url)),committed=execFileSync('git',['show',manifest.sourceCommit+':'+entry.sourceURL],{maxBuffer:32*1024*1024});
  assert.equal(hash(original),entry.sourceSHA256,entry.sourceURL);assert.deepEqual(original,committed,entry.sourceURL);assert.equal(hash(encoded),entry.webpSHA256,entry.url);assert.equal(original.length,entry.sourceBytes);assert.equal(encoded.length,entry.webpBytes);assert.ok(encoded.length<original.length);
  const webpChunks=losslessWebpChunks(encoded);
  const decoded=decodePng(original);assert.ok(decoded,entry.sourceURL);
  const icc=decoded.chunks.find(chunk=>chunk.type==='iCCP');
  if(icc){const end=icc.data.indexOf(0);assert.ok(end>0);assert.equal(icc.data[end+1],0);assert.deepEqual(webpChunks.find(chunk=>chunk.type==='ICCP')?.data,inflateSync(icc.data.subarray(end+2)));}
  else assert.equal(webpChunks.some(chunk=>chunk.type==='ICCP'),false);
  assert.equal(decoded.chunks.some(chunk=>['gAMA','cHRM','sRGB','cICP','mDCV','cLLI','tRNS','acTL'].includes(chunk.type)),false,entry.sourceURL);assert.deepEqual([decoded.width,decoded.height],[entry.width,entry.height]);
  let rgba=decoded.pixels;
  if(decoded.channels===3){rgba=Buffer.alloc(entry.width*entry.height*4);for(let pixel=0;pixel<entry.width*entry.height;pixel++){decoded.pixels.copy(rgba,pixel*4,pixel*3,pixel*3+3);rgba[pixel*4+3]=255;}}
  assert.equal(hash(rgba),entry.rgbaSHA256,entry.sourceURL);
 }
 for(const original of ['assets/actors/warrior.png','assets/actors/task10-unmapped/future.png','assets/npcs/mira.png','assets/equipment/sword.png','unknown.png'])assert.equal(resolveActorTextureURL(original),original);
});
test('both loaders substitute only mapped image URLs while retaining atlas keys, JSON URLs, frame geometry and lease lifetime',async()=>{
 const mapped=manifest.entries[0],textures=new Set(),queued=[],handlers=new Set(),scene={textures:{exists:key=>textures.has(key),remove:key=>textures.delete(key)},load:{on:(name,fn)=>handlers.add(fn),off:(name,fn)=>handlers.delete(fn),atlas:(...args)=>queued.push(['atlas',...args]),image:(...args)=>queued.push(['image',...args]),spritesheet:(...args)=>queued.push(['spritesheet',...args]),isLoading:()=>true,start(){}}};
 const entry={key:'delivery-actor',type:'atlas',url:mapped.sourceURL,atlasURL:mapped.sourceURL.slice(0,-4)+'.json'},cache=new ActorTextureCache(scene),a=cache.acquire(entry),b=cache.acquire(entry);
 assert.deepEqual(queued,[['atlas',entry.key,mapped.url,entry.atlasURL]]);assert.equal(entry.url,mapped.sourceURL);assert.equal(cache.diagnostics.actorLeases,2);
 textures.add(entry.key);for(const handler of handlers)handler();assert.equal(await a.ready,true);a.release();assert.equal(textures.has(entry.key),true);b.release();assert.equal(textures.has(entry.key),false);assert.equal(cache.entries.size,0);cache.destroy();assert.equal(handlers.size,0);
 queued.length=0;queueAssets(scene,{actors:{actor:entry,sheet:{type:'spritesheet',url:mapped.sourceURL,frameWidth:128,frameHeight:96},image:{type:'image',url:mapped.sourceURL},hero:{type:'image',url:'assets/actors/warrior.png'}}});
 assert.deepEqual(queued,[['atlas','actor',mapped.url,entry.atlasURL],['spritesheet','sheet',mapped.url,{frameWidth:128,frameHeight:96}],['image','image',mapped.url],['image','hero','assets/actors/warrior.png']]);
});
