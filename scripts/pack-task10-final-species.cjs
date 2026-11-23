// Mechanical complete-pose registration and RGBA resampling; no alpha cleanup.
const {spawnSync}=require('node:child_process');
const r=spawnSync('python',['art/source/task10-final-species/pack.py'],{stdio:'inherit'});
process.exitCode=r.status??1;
