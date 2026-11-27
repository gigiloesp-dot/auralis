import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {AUR203_SPECIES} from '../js/monsters/aur203Species.js';
import {AUR203_EXPANSION_SPECIES_ROWS} from '../js/monsters/aur203ExpansionSpecies.js';
import {AUR203_EXPANSION_MATERIALS,AUR203_EXPANSION_MATERIAL_BY_LOOT} from '../js/equipment/aur203ExpansionMaterials.js';
import {MONSTER_MATERIALS,MONSTER_MATERIAL_BY_LOOT} from '../js/equipment/monsterMaterials.js';
import {ITEM_DEFS} from '../js/equipment/items.js';
import {pngAlpha} from './pngAlpha.mjs';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const ranges={forest:[88,97],north:[80,94],ancient:[49,62],desert:[60,88]};
const ids=Object.entries(ranges).flatMap(([region,[start,end]])=>Array.from({length:end-start},(_,index)=>`${region}-species-${String(start+index).padStart(3,'0')}`));

test('all first20 prepared species and their material source survive final64 registration exactly as checkpoint b9db320',()=>{
 const bytes=readFileSync('docs/qa/aur203/first20-before-final64.json');assert.equal(sha(bytes),'0ffe77848696664187c6ce17160c974dd99913c1dd3c02fd80034e5a7f8348bd');
 const prior=JSON.parse(bytes);assert.equal(prior.sourceCommit,'b9db320fe0299b5c9137596faefe0f5b9e07c423');assert.equal(prior.rows.length,20);
 for(const before of prior.rows){const {art,...actual}=AUR203_SPECIES[before.id];assert.deepEqual(actual,before,before.id+' complete authored data');assert.ok(art.drawnDeath);}
 assert.equal(sha(readFileSync('js/equipment/aur203Materials.js')),prior.first20MaterialModuleSHA256);
});

test('the added64 use independent fixed IDs and unique original material icons with exact species-to-loot bindings',()=>{
 assert.equal(ids.length,64);assert.deepEqual(AUR203_EXPANSION_SPECIES_ROWS.map(row=>row.id).sort(),[...ids].sort());
 assert.equal(Object.keys(AUR203_EXPANSION_MATERIALS).length,64);assert.equal(Object.keys(AUR203_EXPANSION_MATERIAL_BY_LOOT).length,64);
 const keys=new Set(),pixels=new Set(),names={ru:new Set(),en:new Set(),es:new Set()};
 for(const id of ids){const row=AUR203_SPECIES[id],def=AUR203_EXPANSION_MATERIALS[row.materialId];assert.ok(def,id);assert.equal(row.loot,row.type);assert.equal(AUR203_EXPANSION_MATERIAL_BY_LOOT[row.type],row.materialId);assert.equal(MONSTER_MATERIAL_BY_LOOT[row.type],row.materialId);assert.equal(MONSTER_MATERIALS[row.materialId],def);assert.equal(ITEM_DEFS[row.materialId],def);
  assert.ok(!keys.has(row.materialId));keys.add(row.materialId);assert.equal(def.level,row.nativeLevel);assert.equal(def.slot,null);assert.equal(def.saleValue,0);assert.equal(def.attack,undefined);assert.equal(def.defense,undefined);assert.equal(def.monsterMaterial,true);assert.equal(def.aur203Material,true);
  for(const locale of ['ru','en','es']){assert.ok(def.names[locale]?.length>3);assert.ok(!names[locale].has(def.names[locale]),row.materialId+' distinct '+locale);names[locale].add(def.names[locale]);}
  const png=readFileSync(def.iconURL),digest=sha(png);assert.ok(!pixels.has(digest));pixels.add(digest);const {width,height,alpha}=pngAlpha(def.iconURL);assert.equal(width,128);assert.equal(height,128);assert.ok(alpha.filter(value=>value===0).length>4096);assert.ok(alpha.filter(value=>value>=128).length>500);for(let n=0;n<128;n++)assert.equal(alpha[n]+alpha[127*128+n]+alpha[n*128]+alpha[n*128+127],0);
 }
 assert.equal(keys.size,64);assert.equal(pixels.size,64);for(const set of Object.values(names))assert.equal(set.size,64);
});

test('only three explicit new stomp kinds receive bounded, visually warned stun; all old20 and other61 retain normal abilities',()=>{
 const expected={'north-species-084':{duration:700,windup:1100},'ancient-species-052':{duration:600,windup:1100},'desert-species-078':{duration:800,windup:1200}};
 assert.deepEqual(Object.values(AUR203_SPECIES).filter(row=>row.abilityConfig.stunOnStomp).map(row=>row.id).sort(),Object.keys(expected).sort());
 for(const proposed of AUR203_EXPANSION_SPECIES_ROWS){const actual=AUR203_SPECIES[proposed.id],{art,...data}=actual,stun=expected[proposed.id],config=stun?{...proposed.abilityConfig,stunOnStomp:stun.duration,windup:Math.max(proposed.abilityConfig.windup,stun.windup)}:proposed.abilityConfig;assert.deepEqual(data,{...proposed,abilityConfig:config});if(stun){assert.ok(config.abilityPattern.includes('stomp'));assert.ok(config.windup>=1100);assert.ok(config.stunOnStomp<=800);}}
});
