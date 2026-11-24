// Export only committed runtime files; provenance is verified again after HTTPS deploy.
import {mkdirSync,readdirSync,readFileSync,writeFileSync,renameSync,rmSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync,spawn} from 'node:child_process';
import {pipeline} from 'node:stream/promises';
import {createHash} from 'node:crypto';
import {losslessPng,LOSSLESS_PNG_TRANSFORM} from './lossless-png.mjs';
// Exact original descriptor atlas names, never player classes, bodies or gear.
export const LEGACY_ACTOR_NAMES=Object.freeze({
  "monsters": [
    "ancientGargoyle",
    "ancientSentinel",
    "arcaneWisp",
    "bear",
    "desertSnake",
    "fallenKnight",
    "forestBat",
    "forestOrc",
    "forestRaider",
    "forestWolf",
    "frostGolem",
    "iceBat",
    "iceElemental",
    "iceWolf",
    "scarab",
    "skeleton",
    "snowBear",
    "snowRaider",
    "spider",
    "thornSnake",
    "voidElemental",
    "wildBoar",
    "wraith"
  ],
  "npcs": [
    "ancient-residents",
    "forest-residents",
    "highpass",
    "nyx",
    "oak-north",
    "river-residents"
  ],
  "bosses": [
    "ancient-mini-0",
    "ancient-mini-1",
    "ancient-mini-2",
    "ancient-mini-3",
    "ancient-world-4",
    "ancient-world-5",
    "dungeon1-boss-0",
    "dungeon10-boss-0",
    "dungeon10-boss-1",
    "dungeon10-boss-2",
    "dungeon11-boss-0",
    "dungeon11-boss-1",
    "dungeon11-boss-2",
    "dungeon12-boss-0",
    "dungeon12-boss-1",
    "dungeon12-boss-2",
    "dungeon2-boss-0",
    "dungeon3-boss-0",
    "dungeon4-boss-0",
    "dungeon4-boss-1",
    "dungeon5-boss-0",
    "dungeon5-boss-1",
    "dungeon6-boss-0",
    "dungeon6-boss-1",
    "dungeon7-boss-0",
    "dungeon7-boss-1",
    "dungeon8-boss-0",
    "dungeon8-boss-1",
    "dungeon8-boss-2",
    "dungeon9-boss-0",
    "dungeon9-boss-1",
    "dungeon9-boss-2",
    "forest-mini-0",
    "forest-mini-1",
    "forest-mini-2",
    "forest-mini-3",
    "forest-world-4",
    "forest-world-5",
    "north-mini-0",
    "north-mini-1",
    "north-mini-2",
    "north-mini-3",
    "north-world-4",
    "north-world-5"
  ]
});
const legacySources=new Set(Object.entries(LEGACY_ACTOR_NAMES).flatMap(([role,names])=>names.map(name=>'assets/actors/'+role+'/'+name+'.png')));
export function approvedActorSource(source){return typeof source==='string'&&(/^assets\/actors\/task10-[a-z0-9-]+\/[a-zA-Z0-9_-]+\.png$/.test(source)||legacySources.has(source));}

async function extractRuntime(sourceCommit,target,repository){
 // Stream directly into isolated copies. No full-size intermediate archive and
 // no hardlinks to mutable source files; at most one PNG replacement per file.
 // tar consumes padding through EOF so early close cannot break the pipeline.
 const archive=spawn('git',['archive','--format=tar',sourceCommit,'index.html','warrior-equipment-lab.html','css','js','assets'],{cwd:repository,stdio:['ignore','pipe','pipe']});
 const tar=spawn('tar',['-x','--ignore-zeros','-f','-','-C',target],{cwd:repository,stdio:['pipe','ignore','pipe']});
 function completion(child,label){let stderr='';child.stderr.on('data',data=>{stderr=(stderr+data.toString()).slice(-8192);});return new Promise((resolve,reject)=>{child.once('error',reject);child.once('close',code=>code===0?resolve():reject(Error(label+' failed ('+code+'): '+stderr)));});}
 const pending=[completion(archive,'git archive'),completion(tar,'tar'),pipeline(archive.stdout,tar.stdin)];
 try{await Promise.all(pending);}catch(error){archive.kill();tar.kill();await Promise.allSettled(pending);throw error;}
}

export async function exportStatic(destination,requested='HEAD',{repository=process.cwd()}={}){
 if(!destination)throw Error('Usage: node scripts/export-static.mjs /absolute/empty/output [source-SHA]');
 const target=resolve(destination);mkdirSync(target,{recursive:true});
 if(readdirSync(target).length)throw Error('Output directory must be empty: '+target);
 if(requested!=='HEAD'&&!/^[0-9a-f]{7,40}$/.test(requested))throw Error('Expected a committed hexadecimal source SHA');
 const sourceCommit=execFileSync('git',['rev-parse','--verify',requested+'^{commit}'],{cwd:repository,encoding:'utf8'}).trim();
 if(!/^[0-9a-f]{40}$/.test(sourceCommit))throw Error('Expected an exact committed source SHA');
 await extractRuntime(sourceCommit,target,repository);
// Only explicit, hash-verified delivery substitutions can omit source PNGs.
// Read the manifest from this exact commit, never from the working tree.
const deliveryPath='assets/actors/lossless-delivery.json',actorTextureDelivery={manifest:null,files:0,sourceBytes:0,deliveryBytes:0};
if(execFileSync('git',['ls-tree','--name-only',sourceCommit,deliveryPath],{cwd:repository,encoding:'utf8'}).trim()){
 const manifest=JSON.parse(execFileSync('git',['show',sourceCommit+':'+deliveryPath],{cwd:repository,encoding:'utf8',maxBuffer:4*1024*1024}));
 if(!/^[0-9a-f]{40}$/.test(manifest.sourceCommit)||manifest.version!==1||manifest.encoding?.format!=='WebP'||manifest.encoding.lossless!==true||manifest.encoding.exact!==true||!Array.isArray(manifest.entries))throw Error('Invalid lossless delivery manifest');
 const sourcePaths=new Set(),deliveryPaths=new Set(),hash=bytes=>createHash('sha256').update(bytes).digest('hex');
 const resolverSource=readFileSync(join(target,'js/assets/losslessTextureDelivery.js'),'utf8'),match=resolverSource.match(/Object\.freeze\(([\s\S]*?)\);/);
 if(!match)throw Error('Missing lossless delivery URL map');
 const resolverMap=JSON.parse(match[1]);
 for(const entry of manifest.entries){
  const source=entry.sourceURL,delivery=entry.url;
  if(!approvedActorSource(source)||delivery!==source.slice(0,-4)+'.webp'||sourcePaths.has(source)||deliveryPaths.has(delivery)||resolverMap[source]!==delivery)throw Error('Invalid lossless delivery mapping');
  const original=readFileSync(join(target,source)),encoded=readFileSync(join(target,delivery));
  const pinned=execFileSync('git',['show',manifest.sourceCommit+':'+source],{cwd:repository,maxBuffer:32*1024*1024});
  if(!original.equals(pinned)||hash(original)!==entry.sourceSHA256||hash(encoded)!==entry.webpSHA256||original.length!==entry.sourceBytes||encoded.length!==entry.webpBytes)throw Error('Lossless delivery hash mismatch: '+source);
  sourcePaths.add(source);deliveryPaths.add(delivery);actorTextureDelivery.sourceBytes+=original.length;actorTextureDelivery.deliveryBytes+=encoded.length;
 }
 if(Object.keys(resolverMap).length!==sourcePaths.size)throw Error('Lossless resolver and manifest differ');
 for(const source of sourcePaths)rmSync(join(target,source));
 actorTextureDelivery.manifest=deliveryPath;actorTextureDelivery.files=sourcePaths.size;
}
const pngCompression={transform:LOSSLESS_PNG_TRANSFORM,files:0,optimized:0,originalBytes:0,outputBytes:0};
function compressDirectory(directory){for(const entry of readdirSync(directory,{withFileTypes:true})){const path=join(directory,entry.name);if(entry.isDirectory())compressDirectory(path);else if(entry.isFile()&&entry.name.toLowerCase().endsWith('.png')){const result=losslessPng(readFileSync(path));pngCompression.files++;pngCompression.optimized+=Number(result.optimized);pngCompression.originalBytes+=result.originalBytes;pngCompression.outputBytes+=result.outputBytes;if(result.optimized){const temporary=path+'.export-png-tmp';try{writeFileSync(temporary,result.bytes,{flag:'wx'});renameSync(temporary,path);}finally{rmSync(temporary,{force:true});}}}}}
compressDirectory(target);
writeFileSync(resolve(target,'build.json'),JSON.stringify({repository:'gigiloesp-dot/auralis',branch:'codex/auralis-master-development',sourceCommit,exportedAt:new Date().toISOString(),pngCompression,actorTextureDelivery},null,2)+'\n');
return {directory:target,sourceCommit,pngCompression,actorTextureDelivery};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const result=await exportStatic(process.argv[2],process.argv[3]);
 console.log(JSON.stringify(result));
}

