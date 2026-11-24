import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,existsSync,rmSync,statSync,readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {deflateSync} from 'node:zlib';
import {exportStatic} from '../scripts/export-static.mjs';
import {pngChunk,decodePng,losslessPng} from '../scripts/lossless-png.mjs';

const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
function fixture(t){
 const scratch=mkdtempSync(join(tmpdir(),'auralis-export-test-')),repository=join(scratch,'source'),destination=join(scratch,'published');
 t.after(()=>rmSync(scratch,{recursive:true,force:true}));mkdirSync(repository);
 const git=(...args)=>execFileSync('git',args,{cwd:repository,encoding:'utf8'}).trim();
 git('init','--quiet');git('config','user.email','fixture@example.invalid');git('config','user.name','Export fixture');git('config','commit.gpgsign','false');
 const write=(file,bytes)=>{mkdirSync(dirname(join(repository,file)),{recursive:true});writeFileSync(join(repository,file),bytes);};
 const header=Buffer.alloc(13);header.writeUInt32BE(16);header.writeUInt32BE(16,4);header[8]=8;header[9]=6;
 const rows=Buffer.alloc(16*(16*4+1));for(let y=0;y<16;y++)for(let x=0;x<16;x++)rows.set([12,34,56,0],y*65+1+x*4);
 const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),pngChunk('IHDR',header),pngChunk('IDAT',deflateSync(rows,{level:0})),pngChunk('IEND',Buffer.alloc(0))]);
 const source='assets/actors/npcs/forest-residents.png',hero='assets/actors/heroes/warrior.png',delivery=source.slice(0,-4)+'.webp';
 write('index.html','committed index');write('warrior-equipment-lab.html','committed lab');write('css/game.css','committed css');write('js/game.js','committed code');write(source,png);write(hero,png);
 git('add','.');git('commit','--quiet','-m','original sources');const pinned=git('rev-parse','HEAD');
 const webp=Buffer.from('UklGRhwAAABXRUJQVlA4TBAAAAAvD8ADEAdQkTIUJwIR0f8A','base64');
 const manifest={version:1,sourceCommit:pinned,encoding:{format:'WebP',lossless:true,exact:true,method:6},entries:[{sourceURL:source,url:delivery,sourceSHA256:hash(png),webpSHA256:hash(webp),rgbaSHA256:hash(decodePng(png).pixels),width:16,height:16,sourceBytes:png.length,webpBytes:webp.length}]};
 function saveManifest(){write('assets/actors/lossless-delivery.json',JSON.stringify(manifest));write('js/assets/losslessTextureDelivery.js','export const LOSSLESS_ACTOR_TEXTURE_URLS=Object.freeze('+JSON.stringify(Object.fromEntries(manifest.entries.map(e=>[e.sourceURL,e.url])))+');\n');}
 write(delivery,webp);saveManifest();git('add','.');git('commit','--quiet','-m','verified delivery');const commit=git('rev-parse','HEAD');
 return {repository,destination,git,write,saveManifest,manifest,commit,pinned,source,hero,delivery,png,webp};
}
test('streamed publication uses exact Git source, isolates original PNGs, and removes only approved derived source copies',async t=>{
 const f=fixture(t);f.write('js/game.js','uncommitted code');f.write(f.source,'uncommitted source');
 const before=readFileSync(join(f.repository,f.hero)),result=await exportStatic(f.destination,f.commit,{repository:f.repository});
 assert.equal(result.sourceCommit,f.commit);assert.equal(result.actorTextureDelivery.files,1);assert.equal(result.pngCompression.optimized,1);
 assert.equal(readFileSync(join(f.destination,'js/game.js'),'utf8'),'committed code');
 assert.equal(readFileSync(join(f.repository,'js/game.js'),'utf8'),'uncommitted code');
 assert.equal(readFileSync(join(f.repository,f.source),'utf8'),'uncommitted source');
 assert.equal(existsSync(join(f.destination,f.source)),false);assert.deepEqual(readFileSync(join(f.destination,f.delivery)),f.webp);
 const published=readFileSync(join(f.destination,f.hero));assert.deepEqual(published,losslessPng(before).bytes);assert.deepEqual(decodePng(published).pixels,decodePng(before).pixels);
 assert.deepEqual(readFileSync(join(f.repository,f.hero)),before);assert.notEqual(statSync(join(f.repository,f.hero)).ino,statSync(join(f.destination,f.hero)).ino);
 assert.equal(readFileSync(join(f.destination,'build.json'),'utf8').includes(f.commit),true);
 assert.equal(readdirSync(dirname(join(f.destination,f.hero))).some(name=>name.endsWith('.export-png-tmp')),false);
 await assert.rejects(exportStatic(f.destination,f.commit,{repository:f.repository}),/must be empty/);
});
test('publication rejects altered mapped source hashes before deleting any source copies',async t=>{
 const f=fixture(t);f.manifest.entries[0].sourceSHA256='0'.repeat(64);f.saveManifest();f.git('add','.');f.git('commit','--quiet','-m','invalid hash');
 await assert.rejects(exportStatic(f.destination,'HEAD',{repository:f.repository}),/hash mismatch/);
 assert.deepEqual(readFileSync(join(f.destination,f.source)),f.png);assert.deepEqual(readFileSync(join(f.repository,f.source)),f.png);
});
test('publication rejects a source changed after the manifest pinned commit even if its replacement hash is updated',async t=>{
 const f=fixture(t),changed=Buffer.concat([f.png,Buffer.from('changed')]);f.write(f.source,changed);f.manifest.entries[0].sourceSHA256=hash(changed);f.manifest.entries[0].sourceBytes=changed.length;f.saveManifest();f.git('add','.');f.git('commit','--quiet','-m','changed pinned source');
 await assert.rejects(exportStatic(f.destination,'HEAD',{repository:f.repository}),/hash mismatch/);assert.equal(existsSync(join(f.destination,f.source)),true);
});
test('publication rejects player texture substitutions and encoded binary corruption',async t=>{
 const f=fixture(t);f.write(f.delivery,Buffer.from('corrupt WebP'));f.git('add','.');f.git('commit','--quiet','-m','corrupt delivery');
 await assert.rejects(exportStatic(f.destination,'HEAD',{repository:f.repository}),/hash mismatch/);
 const second=join(dirname(f.destination),'second');f.manifest.entries[0].sourceURL=f.hero;f.manifest.entries[0].url=f.hero.slice(0,-4)+'.webp';f.saveManifest();f.git('add','.');f.git('commit','--quiet','-m','invalid player substitution');
 await assert.rejects(exportStatic(second,'HEAD',{repository:f.repository}),/Invalid lossless delivery mapping/);assert.equal(existsSync(join(second,f.hero)),true);
});
