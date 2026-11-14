import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {HERO_BASE_ART} from '../js/assets/heroBodies.js';import {ACTOR_ART,LEGACY_HERO_ART} from '../js/assets/actorArt.js';
test('all preserved character images and animations remain byte-identical after base-body migration',()=>{
 const snapshot=JSON.parse(readFileSync('docs/art/PRESERVED_CHARACTER_ASSETS.json'));assert.equal(snapshot.assets.length,12);
 for(const record of snapshot.assets){for(const [file,hash]of [[record.image,record.imageSha256],[record.atlas,record.atlasSha256]])assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'),hash,file);assert.equal(Object.keys(JSON.parse(readFileSync(record.atlas)).frames).length,record.frames);}
});
test('all six playable classes use separate neutral bases with the exact preserved directional pose keys',()=>{
 assert.deepEqual(Object.keys(HERO_BASE_ART).sort(),['warrior','archer','mage','paladin','assassin','cannoneer'].sort());
 for(const [id,body]of Object.entries(HERO_BASE_ART)){const legacy=LEGACY_HERO_ART[id],entry=ACTOR_ART[id];assert.equal(entry.baseBody,true);assert.equal(entry.bakedEquipment,false);assert.equal(entry.underwear,'neutral-gray');assert.notEqual(entry.key,legacy.key);assert.notEqual(entry.url,legacy.url);assert.equal(entry.preservedAppearance,legacy.url);assert.deepEqual(Object.keys(JSON.parse(readFileSync(body.atlasURL)).frames),Object.keys(JSON.parse(readFileSync(legacy.atlasURL)).frames));assert.equal(Object.keys(body.poseHeights).length,4);assert.ok(body.bodyHeight>=60&&body.bodyHeight<=85);}
 assert.equal(ACTOR_ART.forestWolf.baseBody,undefined,'Monster art is outside the character-body migration');
});
