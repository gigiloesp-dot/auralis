import {readdirSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
const files=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(join(dir,entry.name)):/\.(?:js|mjs|cjs)$/.test(entry.name)?[join(dir,entry.name)]:[]);
const targets=['js','scripts','tests'].flatMap(files);
for(const file of targets){const result=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});if(result.status!==0)process.exit(result.status||1);}
console.log(`Syntax checked ${targets.length} source and test files`);
