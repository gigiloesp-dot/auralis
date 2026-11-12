// Export only committed runtime files; provenance is verified again after HTTPS deploy.
import {mkdirSync,readdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
const destination=process.argv[2];
if(!destination)throw Error('Usage: node scripts/export-static.mjs /absolute/empty/output');
const target=resolve(destination);mkdirSync(target,{recursive:true});
if(readdirSync(target).length)throw Error('Output directory must be empty: '+target);
const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const archive=execFileSync('git',['archive','--format=tar',sourceCommit,'index.html','css','js','assets'],{maxBuffer:64*1024*1024});
execFileSync('tar',['-x','-C',target],{input:archive});
writeFileSync(resolve(target,'build.json'),JSON.stringify({repository:'gigiloesp-dot/auralis',branch:'codex/auralis-master-development',sourceCommit,exportedAt:new Date().toISOString()},null,2)+'\n');
console.log(JSON.stringify({directory:target,sourceCommit}));
