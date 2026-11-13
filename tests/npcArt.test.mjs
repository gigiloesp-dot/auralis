import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {NPC_ART} from '../js/assets/npcArt.js';import {NPCS} from '../js/npc/npcData.js';
test('all21 actual residents have their own8painted facings in six lazily shared packs',()=>{
 assert.deepEqual(Object.keys(NPC_ART).sort(),NPCS.map(n=>n.id).sort());assert.equal(new Set(Object.values(NPC_ART).map(e=>e.key)).size,6);
 for(const [id,e]of Object.entries(NPC_ART)){const atlas=JSON.parse(readFileSync(e.atlasURL)),png=readFileSync(e.url);assert.equal(png.readUInt32BE(16),1536);assert.equal(png.readUInt32BE(20),1024);assert.equal(png[25],6);for(const d of ['e','se','s','sw','w','nw','n','ne'])assert.ok(atlas.frames[id+'/'+d],id+'/'+d);assert.ok(e.originY>.85&&e.originY<1);}
});
test('resident feet use measured pose origins and compact paintings keep a comparable game height',()=>{
 const expected={ronan:[231,.43],lyra:[226,.43],bram:[229,.43],freya:[229,.43],gunnar:[229,.43],ysra:[226,.43],torvin:[226,.43],ida:[222,.43],skeld:[242.5,.36],aster:[246.5,.36],sera:[245,.36],orion:[249,.36],nyx:[244,.36]};
 for(const [id,[feet,scale]]of Object.entries(expected)){assert.equal(NPC_ART[id].originY*256,feet,id);assert.equal(NPC_ART[id].scale,scale,id);}
 for(const pack of new Set(Object.values(NPC_ART).map(e=>e.key))){const ids=Object.keys(NPC_ART).filter(id=>NPC_ART[id].key===pack),frames=new Set();for(const id of ids){const atlas=JSON.parse(readFileSync(NPC_ART[id].atlasURL));for(const d of ['e','se','s','sw','w','nw','n','ne']){const f=atlas.frames[id+'/'+d].frame,position=[f.x,f.y,f.w,f.h].join(',');assert.ok(!frames.has(position),'Residents must not share the same painted frame: '+id+'/'+d);frames.add(position);}}}
});
