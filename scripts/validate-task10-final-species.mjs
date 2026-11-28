// Final atlas pixel checks and hashes binding each approved visual review.
import {spawnSync} from 'node:child_process';
const r=spawnSync('python',['art/source/task10-final-species/validate.py'],{stdio:'inherit'});
process.exitCode=r.status??1;
