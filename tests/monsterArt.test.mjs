import {AUR203_SPECIES,AUR203_SPECIES_ART} from '../js/monsters/aur203Species.js';
import {getRegionContent} from '../js/world/regionContent.js';
import {FIRST20_SPECIES} from './worldExpansionScope.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {MONSTER_ART,monsterArt} from '../js/assets/monsterArt.js';
import {MONSTER_TYPES,monsterKind} from '../js/monsters/monsters.js';
test('painted monster families use distinct real RGBA atlases with complete direction and stride banks',()=>{
 const signatures=new Set();for(const [type,entry]of Object.entries(MONSTER_ART)){const bytes=readFileSync(entry.url);signatures.add(createHash('sha256').update(bytes).digest('hex'));assert.equal(bytes.readUInt32BE(16),1536,type);assert.equal(bytes.readUInt32BE(20),1024,type);assert.equal(bytes[25],6,type+' must have true alpha');const j=JSON.parse(readFileSync(entry.atlasURL));assert.equal(Object.keys(j.frames).length,32,type);for(const bank of ['idle','run-a','run-b','attack'])for(const dir of ['e','se','s','sw','w','nw','n','ne']){const f=j.frames[bank+'/'+dir]?.frame;assert.ok(f&&f.x>=0&&f.y>=0&&f.x+f.w<=1536&&f.y+f.h<=1024,type+' '+bank+'/'+dir);}}
 assert.equal(signatures.size,Object.keys(MONSTER_ART).length,'Families must not reuse the same PNG');
});
test('all original23 ordinary species have distinct produced art and missing bosses cannot reuse an ordinary model',()=>{const species=Object.entries(MONSTER_TYPES).filter(([,kind])=>!kind.boss&&!kind.aur203Revision);assert.equal(species.length,23);const keys=species.map(([id,kind])=>{const entry=monsterArt(id,kind);assert.ok(entry,id);return entry.key;});assert.equal(new Set(keys).size,23);assert.equal(monsterArt('forestWolf',{boss:true}),null);assert.equal(monsterArt('not-produced',{}),null);assert.equal(monsterArt('iceWolf',{}).key,'actor-monster-iceWolf');assert.equal(monsterArt('frostGolem',{}).key,'actor-monster-frostGolem');});

// New types must work through both the actual camp descriptor and the generic
// kind-only API; filtering the immutable old contract must not hide null art.
test('all20 accepted AUR203 types resolve their own real camp and kind-only artwork without overriding explicit descriptor priority',()=>{
 const ids=Object.values(FIRST20_SPECIES).flat();assert.equal(ids.length,20);assert.deepEqual(Object.keys(AUR203_SPECIES).sort(),[...ids].sort());const keys=new Set();
 for(const id of ids){
  const row=AUR203_SPECIES[id],camp=getRegionContent(row.region).camps.find(camp=>camp.speciesId===id);assert.ok(camp,id+'/active camp');const descriptor=camp.spawns[0],actualKind=monsterKind(descriptor),entry=AUR203_SPECIES_ART[id];
  assert.equal(monsterArt(descriptor.type,actualKind,descriptor),entry,id+'/real descriptor');
  const kind=monsterKind({type:row.type,level:row.nativeLevel});assert.equal(kind.speciesId,id);assert.equal(monsterArt(row.type,kind),entry,id+'/kind-only identity');assert.equal(monsterArt(row.type,MONSTER_TYPES[row.type]),entry,id+'/generic registered type');
  assert.equal(monsterArt(row.type,kind,{plannedSpeciesId:id}),entry);assert.equal(monsterArt(row.type,kind,{speciesId:'forest-species-000'}),monsterArt('forestWolf',MONSTER_TYPES.forestWolf,{speciesId:'forest-species-000'}),'Explicit descriptor identity takes priority over kind-only identity');
  assert.equal(monsterArt(row.type,kind,{speciesId:'unregistered-species'}),null,'An explicit unknown descriptor cannot silently display another species');keys.add(entry.key);
 }
 assert.equal(keys.size,20);
});
