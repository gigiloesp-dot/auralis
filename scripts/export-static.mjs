// Export only committed runtime files; provenance is verified again after HTTPS deploy.
import {mkdirSync,readdirSync,readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {losslessPng,LOSSLESS_PNG_TRANSFORM} from './lossless-png.mjs';
const destination=process.argv[2];
if(!destination)throw Error('Usage: node scripts/export-static.mjs /absolute/empty/output');
const target=resolve(destination);mkdirSync(target,{recursive:true});
if(readdirSync(target).length)throw Error('Output directory must be empty: '+target);
const requested=process.argv[3]||'HEAD';if(requested!=='HEAD'&&!/^[0-9a-f]{7,40}$/.test(requested))throw Error('Expected a committed hexadecimal source SHA');
const sourceCommit=execFileSync('git',['rev-parse',requested],{encoding:'utf8'}).trim();
// Large painted packs are streamed by Git/tar through a private temporary file;
// do not buffer the complete game archive in the Node process (formerly64MiB).
const scratch=mkdtempSync(join(tmpdir(),'auralis-export-'));
try{
 const archive=join(scratch,'runtime.tar');
 execFileSync('git',['archive','--format=tar','--output',archive,sourceCommit,'index.html','warrior-equipment-lab.html','css','js','assets']);
 execFileSync('tar',['-x','-f',archive,'-C',target]);
}finally{rmSync(scratch,{recursive:true,force:true});}
// Only explicit, hash-verified delivery substitutions can omit source PNGs.
// Read the manifest from this exact commit, never from the working tree.
const deliveryPath='assets/actors/lossless-delivery.json',actorTextureDelivery={manifest:null,files:0,sourceBytes:0,deliveryBytes:0};
if(execFileSync('git',['ls-tree','--name-only',sourceCommit,deliveryPath],{encoding:'utf8'}).trim()){
 const manifest=JSON.parse(execFileSync('git',['show',sourceCommit+':'+deliveryPath],{encoding:'utf8',maxBuffer:4*1024*1024}));
 if(manifest.version!==1||manifest.encoding?.format!=='WebP'||manifest.encoding.lossless!==true||manifest.encoding.exact!==true||!Array.isArray(manifest.entries))throw Error('Invalid lossless delivery manifest');
 const sourcePaths=new Set(),deliveryPaths=new Set(),hash=bytes=>createHash('sha256').update(bytes).digest('hex');
 const resolverSource=readFileSync(join(target,'js/assets/losslessTextureDelivery.js'),'utf8'),match=resolverSource.match(/Object\.freeze\(([\s\S]*?)\);/);
 if(!match)throw Error('Missing lossless delivery URL map');
 const resolverMap=JSON.parse(match[1]);
 for(const entry of manifest.entries){
  const source=entry.sourceURL,delivery=entry.url;
  if(!/^assets\/actors\/task10-[^/]+\/[^/]+\.png$/.test(source)||delivery!==source.slice(0,-4)+'.webp'||sourcePaths.has(source)||deliveryPaths.has(delivery)||resolverMap[source]!==delivery)throw Error('Invalid lossless delivery mapping');
  const original=readFileSync(join(target,source)),encoded=readFileSync(join(target,delivery));
  if(hash(original)!==entry.sourceSHA256||hash(encoded)!==entry.webpSHA256||original.length!==entry.sourceBytes||encoded.length!==entry.webpBytes)throw Error('Lossless delivery hash mismatch: '+source);
  sourcePaths.add(source);deliveryPaths.add(delivery);actorTextureDelivery.sourceBytes+=original.length;actorTextureDelivery.deliveryBytes+=encoded.length;
 }
 if(Object.keys(resolverMap).length!==sourcePaths.size)throw Error('Lossless resolver and manifest differ');
 for(const source of sourcePaths)rmSync(join(target,source));
 actorTextureDelivery.manifest=deliveryPath;actorTextureDelivery.files=sourcePaths.size;
}
const pngCompression={transform:LOSSLESS_PNG_TRANSFORM,files:0,optimized:0,originalBytes:0,outputBytes:0};
function compressDirectory(directory){for(const entry of readdirSync(directory,{withFileTypes:true})){const path=join(directory,entry.name);if(entry.isDirectory())compressDirectory(path);else if(entry.isFile()&&entry.name.toLowerCase().endsWith('.png')){const result=losslessPng(readFileSync(path));pngCompression.files++;pngCompression.optimized+=Number(result.optimized);pngCompression.originalBytes+=result.originalBytes;pngCompression.outputBytes+=result.outputBytes;if(result.optimized)writeFileSync(path,result.bytes);}}}
compressDirectory(target);
writeFileSync(resolve(target,'build.json'),JSON.stringify({repository:'gigiloesp-dot/auralis',branch:'codex/auralis-master-development',sourceCommit,exportedAt:new Date().toISOString(),pngCompression,actorTextureDelivery},null,2)+'\n');
console.log(JSON.stringify({directory:target,sourceCommit,pngCompression,actorTextureDelivery}));
