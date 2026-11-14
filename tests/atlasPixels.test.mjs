import test from 'node:test';import assert from 'node:assert/strict';
import {ACTOR_ART} from '../js/assets/actorArt.js';import {MONSTER_ART} from '../js/assets/monsterArt.js';import {NPC_ART} from '../js/assets/npcArt.js';
import {BOSS_ART} from '../js/assets/bossArt.js';
import {pngAlpha} from './pngAlpha.mjs';
test('every integrated actor atlas has real transparent gutters without opaque fragments crossing a frame boundary',()=>{
 const paths=new Set([...Object.values(ACTOR_ART),...Object.values(MONSTER_ART),...Object.values(NPC_ART),...Object.values(BOSS_ART)].map(e=>e.url));
 for(const path of paths){
  const {width,height,alpha}=pngAlpha(path);assert.equal(width,1536,path);assert.equal(height,1024,path);
  assert.ok(alpha[0]<=2&&alpha[width-1]<=2,path+' background must be transparent');let visible=0,clear=0;
  for(const a of alpha){if(a>127)visible++;if(a<=2)clear++;}assert.ok(visible>1000,path+' cannot be an empty replacement');assert.ok(clear>width*height*.20,path+' cannot retain a backdrop');
  for(let x=192;x<width;x+=192)for(let y=0;y<height;y++)assert.ok(alpha[y*width+x]<=127,path+' opaque vertical frame seam '+x+','+y);
  for(let y=256;y<height;y+=256)for(let x=0;x<width;x++)assert.ok(alpha[y*width+x]<=127,path+' opaque horizontal frame seam '+x+','+y);
 }
});
