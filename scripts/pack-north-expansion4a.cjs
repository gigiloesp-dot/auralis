// Pillow preserves all RGBA pixels inside measured complete-pose sourceRects.
const {spawnSync}=require('node:child_process');
const result=spawnSync('python',['art/source/task10-north-expansion4a/pack.py','4a'],{stdio:'inherit'});
process.exitCode=result.status??1;
