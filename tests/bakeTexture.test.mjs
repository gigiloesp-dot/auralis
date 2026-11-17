import test from 'node:test';
import assert from 'node:assert/strict';
import {bakeTexture} from '../js/assets/bakeTexture.js';
test('texture baking releases the shared Phaser camera references and the temporary Graphics source',()=>{
 const old=globalThis.Phaser,renderList=[],calls=[];globalThis.Phaser={GameObjects:{Graphics:{TargetCamera:{renderList}}}};
 try{const g={generateTexture(...args){calls.push(args);renderList.push(this);},destroy(){calls.push('destroy');}};for(let i=0;i<100;i++){bakeTexture(g,'chunk'+i,512,512);assert.equal(renderList.length,0);}assert.deepEqual(calls[0],['chunk0',512,512]);assert.equal(calls.filter(c=>c==='destroy').length,100);}finally{if(old===undefined)delete globalThis.Phaser;else globalThis.Phaser=old;}
});
test('failed texture baking still clears references and destroys the source',()=>{
 const old=globalThis.Phaser,renderList=[],g={generateTexture(){renderList.push(this);throw Error('GPU unavailable');},destroy(){this.destroyed=true;}};globalThis.Phaser={GameObjects:{Graphics:{TargetCamera:{renderList}}}};
 try{assert.throws(()=>bakeTexture(g,'bad',512,512),/GPU unavailable/);assert.equal(renderList.length,0);assert.equal(g.destroyed,true);}finally{if(old===undefined)delete globalThis.Phaser;else globalThis.Phaser=old;}
});
