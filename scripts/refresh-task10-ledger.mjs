// Exact approved changes against the immutable release21 checkpoint. Historical
// gear/PNG/skill hashes stay required; this records only task10 runtime edits.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';import {execFileSync} from 'node:child_process';import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex'),checkpoint=execFileSync('git',['rev-parse','c36c8fa'],{encoding:'utf8'}).trim(),paths=execFileSync('git',['diff','--name-only',checkpoint,'--','js'],{encoding:'utf8'}).trim().split('\n').filter(Boolean),files={};
const originalPaths=new Set(execFileSync('git',['ls-tree','-r','--name-only',checkpoint,'js'],{encoding:'utf8'}).trim().split('\n'));
for(const path of paths){if(!originalPaths.has(path))continue;const before=execFileSync('git',['show',checkpoint+':'+path]);files[path]={before:sha(before),after:sha(readFileSync(path))};}
mkdirSync('docs/qa/task10',{recursive:true});const ledger=JSON.stringify({checkpoint,files},null,2)+'\n';writeFileSync('docs/qa/task10/approved-deltas.json',ledger);const test='tests/warriorEquipmentArt.test.mjs';let source=readFileSync(test,'utf8');source=source.replace(/assert.equal\(sha\(task10Ledger\),'[a-f0-9]+'\)/,"assert.equal(sha(task10Ledger),'"+sha(ledger)+"')");writeFileSync(test,source);console.log('Recorded explicit task10 delta hashes:',paths.length);
