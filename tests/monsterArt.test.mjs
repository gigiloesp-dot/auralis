import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {MONSTER_ART,monsterArt} from '../js/assets/monsterArt.js';
test('painted monster families use distinct real RGBA atlases with complete direction and stride banks',()=>{
 const signatures=new Set();for(const [type,entry]of Object.entries(MONSTER_ART)){const bytes=readFileSync(entry.url);signatures.add(createHash('sha256').update(bytes).digest('hex'));assert.equal(bytes.readUInt32BE(16),1536,type);assert.equal(bytes.readUInt32BE(20),1024,type);assert.equal(bytes[25],6,type+' must have true alpha');const j=JSON.parse(readFileSync(entry.atlasURL));assert.equal(Object.keys(j.frames).length,32,type);for(const bank of ['idle','run-a','run-b','attack'])for(const dir of ['e','se','s','sw','w','nw','n','ne']){const f=j.frames[bank+'/'+dir]?.frame;assert.ok(f&&f.x>=0&&f.y>=0&&f.x+f.w<=1536&&f.y+f.h<=1024,type+' '+bank+'/'+dir);}}
 assert.equal(signatures.size,Object.keys(MONSTER_ART).length,'Families must not reuse the same PNG');
});
test('missing species and unique bosses retain separate existing rigs instead of silently reusing ordinary art',()=>{assert.ok(monsterArt('forestWolf',{}));assert.equal(monsterArt('forestWolf',{boss:true}),null);assert.equal(monsterArt('iceWolf',{}),null);assert.equal(monsterArt('frostGolem',{}).key,'actor-monster-frostGolem');});
