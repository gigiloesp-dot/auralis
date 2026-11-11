import {readdirSync,readFileSync,existsSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {spawnSync} from 'node:child_process';
const files=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(join(dir,entry.name)):/\.(?:js|mjs|cjs)$/.test(entry.name)?[join(dir,entry.name)]:[]);
const targets=['js','scripts','tests'].flatMap(files);
for(const file of targets){const result=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});if(result.status!==0)process.exit(result.status||1);}
for(const file of targets){
 const source=readFileSync(file,'utf8');
 for(const match of source.matchAll(/(?:\bfrom\s*|\bimport\s*)['"](\.[^'"]+)['"]/g)){
  if(!existsSync(resolve(dirname(file),match[1]))){console.error(`Missing relative import ${match[1]} in ${file}`);process.exit(1);}
 }
}
console.log(`Syntax checked ${targets.length} source and test files`);
