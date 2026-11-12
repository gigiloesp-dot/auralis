import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {ACTOR_ART,ACTOR_DIRECTIONS,actorPose} from '../js/assets/actorArt.js';
import {createHash} from 'node:crypto';
test('all six classes use separate produced paintings, including the short cannon dwarf',()=>{
 const classes=['warrior','archer','mage','paladin','assassin','cannoneer'];
 const hashes=new Set(classes.map(id=>{const entry=ACTOR_ART[id];assert.ok(entry,'Missing class painting '+id);assert.equal(entry.equipment,true);return createHash('sha256').update(readFileSync(entry.url)).digest('hex');}));
 assert.equal(hashes.size,6,'Classes must not share recolored copies of one atlas');
 assert.equal(ACTOR_ART.archer.weaponType,'bow');assert.equal(ACTOR_ART.mage.weaponType,'staff');assert.equal(ACTOR_ART.cannoneer.weaponType,'cannon');assert.ok(ACTOR_ART.cannoneer.equipmentScaleY<1);
});
test('produced actor atlases expose all32 actual direction and stride frames',()=>{for(const entry of Object.values(ACTOR_ART)){const atlas=JSON.parse(readFileSync(entry.atlasURL));assert.equal(Object.keys(atlas.frames).length,32);for(const bank of ['idle','run-a','run-b','attack'])for(const dir of ACTOR_DIRECTIONS){const f=atlas.frames[bank+'/'+dir].frame;assert.equal(f.w,192);assert.equal(f.h,256);assert.ok(f.x>=0&&f.y>=0&&f.x+f.w<=1536&&f.y+f.h<=1024);}const bytes=readFileSync(entry.url);assert.equal(bytes.readUInt32BE(16),1536);assert.equal(bytes.readUInt32BE(20),1024);assert.equal(bytes[25],6,'True RGBA transparency required');}});
test('painted actor selects real opposite strides and attack facings without mirroring weapon hand',()=>{for(let i=0;i<8;i++){assert.equal(actorPose('idle',i*Math.PI/4,0).direction,ACTOR_DIRECTIONS[i]);assert.equal(actorPose('attack',i*Math.PI/4,0,.6).bank,'attack');}assert.notEqual(actorPose('run',0,0).frame,actorPose('run',0,.12).frame);assert.equal(actorPose('hurt',0,0).bank,'idle');assert.equal(actorPose('death',0,0).bank,'idle');});
