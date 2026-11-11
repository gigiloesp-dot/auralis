import test from 'node:test';
import assert from 'node:assert/strict';
import {gaitPose} from '../js/characters/animations/gait.js';
test('left and right run reverse horizontal foot travel',()=>{
 const right=gaitPose(Math.PI/2,0,1),left=gaitPose(Math.PI/2,Math.PI,1);
 assert.ok(right.leftFootX>0);
 assert.ok(left.leftFootX<0);
 assert.equal(right.leftFootX,-left.leftFootX);
 assert.equal(right.rightFootX,-left.rightFootX);
});
test('idle does not move legs',()=>{
 const idle=gaitPose(1.2,Math.PI,0);
 for(const key of ['leftHip','rightHip','leftKnee','rightKnee','leftFootX','rightFootX'])assert.equal(idle[key],0);
});
test('diagonal gait stays finite',()=>{
 for(let i=0;i<8;i++){
  const p=gaitPose(1.3,i*Math.PI/4,1);
  assert.ok(Object.values(p).every(Number.isFinite));
 }
});
