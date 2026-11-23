// Export only committed runtime files; provenance is verified again after HTTPS deploy.
import {mkdirSync,readdirSync,readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
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
const pngCompression={transform:LOSSLESS_PNG_TRANSFORM,files:0,optimized:0,originalBytes:0,outputBytes:0};
function compressDirectory(directory){for(const entry of readdirSync(directory,{withFileTypes:true})){const path=join(directory,entry.name);if(entry.isDirectory())compressDirectory(path);else if(entry.isFile()&&entry.name.toLowerCase().endsWith('.png')){const result=losslessPng(readFileSync(path));pngCompression.files++;pngCompression.optimized+=Number(result.optimized);pngCompression.originalBytes+=result.originalBytes;pngCompression.outputBytes+=result.outputBytes;if(result.optimized)writeFileSync(path,result.bytes);}}}
compressDirectory(target);
writeFileSync(resolve(target,'build.json'),JSON.stringify({repository:'gigiloesp-dot/auralis',branch:'codex/auralis-master-development',sourceCommit,exportedAt:new Date().toISOString(),pngCompression},null,2)+'\n');
console.log(JSON.stringify({directory:target,sourceCommit,pngCompression}));
