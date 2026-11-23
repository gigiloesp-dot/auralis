// Strict final pixel validation plus hashes of all 48 visually reviewed poses.
import {spawnSync} from 'node:child_process';
const r=spawnSync('python',['art/source/task10-north-expansion4a/validate.py','4b'],{stdio:'inherit'});
process.exitCode=r.status??1;
