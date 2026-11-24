import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {MONSTER_TYPES,monsterKind} from '../js/monsters/monsters.js';
import {AUR203_SPECIES,createAur203MonsterTypes} from '../js/monsters/aur203Species.js';
import {INTEGRATED_SPECIES_ART} from '../js/assets/speciesArtRegistry.js';
import {monsterArt} from '../js/assets/monsterArt.js';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex'),bytes=readFileSync(new URL('../docs/qa/aur203/old24-monster-types-e80.json',import.meta.url));
const baseline=JSON.parse(bytes),rows=Object.values(AUR203_SPECIES);

test('the exact24 release26 archetypes and every old formula byte survive only the additive type-registry extension',()=>{
 assert.equal(sha(bytes),'d9f9fe7da847fab873dbe2c43b083b99097e334905880b06edcc73a5a8389791');assert.equal(baseline.sourceCommit,'e80d0efc6f12577d31364abfc8448d905f299227');assert.equal(baseline.capturedBeforeFirst20RuntimeRegistration,true);
 assert.equal(Object.keys(baseline.types).length,24);assert.equal(Object.keys(MONSTER_TYPES).length,44);
 for(const [id,kind]of Object.entries(baseline.types))assert.deepEqual(MONSTER_TYPES[id],kind,id+' cannot change for a new species');
 assert.equal(sha(monsterKind.toString()),baseline.monsterKindFunctionSHA256);
 let source=readFileSync(new URL('../js/monsters/monsters.js',import.meta.url),'utf8');
 const addedImport="import {createAur203MonsterTypes} from"+" './aur203Species.js';\n",addedFactory='export const MONSTER_TYPES=Object.freeze({...BASE_MONSTER_TYPES,...createAur203MonsterTypes(BASE_MONSTER_TYPES)});\n',oldDeclaration='export const MONSTER_TYPES=Object.freeze({',newDeclaration='const BASE_MONSTER_TYPES=Object.freeze({';
 for(const fragment of [addedImport,addedFactory,newDeclaration])assert.equal(source.split(fragment).length,2,'Registry integration must have exactly its documented lines');
 source=source.replace(addedImport,'').replace(addedFactory,'').replace(newDeclaration,oldDeclaration);assert.equal(sha(source),baseline.sourceSHA256,'No original source, skill, loot or combat formula changed');
});

test('actual monsterKind resolves all20 new IDs through56 with their own names, material loot, real abilities and optional tactics',()=>{
 const generated=createAur203MonsterTypes(baseline.types);assert.equal(rows.length,20);
 for(const row of rows){
  assert.equal(baseline.types[row.type],undefined);assert.deepEqual(MONSTER_TYPES[row.type],generated[row.type]);assert.notEqual(row.type,row.baseType,'Old quest kill aliases must remain separate');
  for(const level of [1,7,22,35,42,43,50,55,56]){const kind=monsterKind({type:row.type,level,speciesId:row.id});assert.equal(kind.name,row.names.ru);assert.deepEqual(kind.names,row.names);assert.equal(kind.level,level);assert.equal(kind.speciesId,row.id);assert.equal(kind.loot,row.loot);assert.equal(kind.family,row.family);assert.deepEqual(kind.abilityConfig,row.abilityConfig);assert.deepEqual(kind.behaviorConfig,row.behaviorConfig);assert.equal(kind.boss,false);assert.equal(kind.respawnMs,30000);for(const field of ['hp','attack','xp','gold','speed'])assert.ok(Number.isFinite(kind[field])&&kind[field]>0,row.id+'/'+level+'/'+field);}
 }
});

test('the full resolver preserves257 exact paintings and never disguises an unregistered new type as an old generic model',()=>{
 assert.equal(Object.keys(baseline.originalArtBySpecies).length,257);const resolverSource=readFileSync(new URL('../js/assets/monsterArt.js',import.meta.url),'utf8'),addedFallback='||kind?.speciesId';assert.equal(resolverSource.split(addedFallback).length,2,'Exactly one kind-only fallback');assert.equal(sha(resolverSource.replace(addedFallback,'')),baseline.monsterArtSourceSHA256,'All prior resolver bytes and imports remain exact');
 for(const [id,hash]of Object.entries(baseline.originalArtBySpecies)){assert.equal(sha(JSON.stringify(INTEGRATED_SPECIES_ART[id])),hash,id+' original descriptor');assert.equal(sha(JSON.stringify(monsterArt('unused',{}, {speciesId:id}))),hash,id+' resolver result');}
 let registered=0;for(const row of rows){const actual=monsterArt(row.type,monsterKind({type:row.type,speciesId:row.id}),{speciesId:row.id});if(Object.hasOwn(INTEGRATED_SPECIES_ART,row.id)){assert.deepEqual(actual,row.art);assert.deepEqual(monsterArt(row.type,monsterKind({type:row.type})),row.art,'Kind-only lookups resolve the exact new painting');registered++;}else assert.equal(actual,null,'A missing original painting must not display another family as finished');}
 assert.ok(registered===0||registered===20,'The parent must append the complete ready-art set atomically');console.log('AUR203 actual newly registered art descriptors:',registered,'of20; browser acceptance remains separate');
});
