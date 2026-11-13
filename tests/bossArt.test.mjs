import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {BOSS_ART} from '../js/assets/bossArt.js';import {monsterArt} from '../js/assets/monsterArt.js';import {getRegionContent} from '../js/world/regionContent.js';import {DUNGEONS,createDungeonContent} from '../js/dungeons/dungeonData.js';
test('registered bosses use unique produced images bound to actual regional or dungeon entities',()=>{
 const descriptors=[...['forest','north','ancient'].flatMap(r=>getRegionContent(r).bosses),...DUNGEONS.flatMap(d=>createDungeonContent(d.id,'easy').bosses)],hashes=new Set();
 for(const [id,e]of Object.entries(BOSS_ART)){const d=descriptors.find(d=>d.id===id);assert.ok(d,id);assert.equal(monsterArt(d.type,{boss:true},d),e);const png=readFileSync(e.url),j=JSON.parse(readFileSync(e.atlasURL));hashes.add(createHash('sha256').update(png).digest('hex'));assert.equal(png.readUInt32BE(16),1536);assert.equal(png.readUInt32BE(20),1024);assert.equal(Object.keys(j.frames).length,32);assert.ok(e.scale>.1&&e.scale<1.5);assert.ok(e.annotationHeight>40&&e.annotationHeight<170);}
 assert.equal(hashes.size,Object.keys(BOSS_ART).length,'A boss cannot reuse another boss model');
});
