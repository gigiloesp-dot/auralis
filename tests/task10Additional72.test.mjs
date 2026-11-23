import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {monsterArt} from '../js/assets/monsterArt.js';
import {uniqueSpeciesArt,uniqueSpeciesEntries} from '../js/assets/speciesAssets.js';
import {integratedSpeciesArt,INTEGRATED_SPECIES_ART} from '../js/assets/speciesArtRegistry.js';
import {speciesTraits} from '../js/monsters/speciesRuntime.js';
import {getRegionContent} from '../js/world/regionContent.js';
import {monsterKind} from '../js/monsters/monsters.js';
import {movementProfile,tickMonsterAbility} from '../js/monsters/movementProfiles.js';
import {pngAlpha} from './pngAlpha.mjs';
import {NORTH_EXPANSION4A_ART} from '../js/assets/northExpansion4aArt.js';
import {NORTH_EXPANSION4B_ART} from '../js/assets/northExpansion4bArt.js';
import {ANCIENT_EXPANSION4_ART} from '../js/assets/ancientExpansion4Art.js';
import {DESERT_EXPANSION4_ART} from '../js/assets/desertExpansion4Art.js';
import {FOREST_EXPANSION5A_ART} from '../js/assets/forestExpansion5aArt.js';
import {FOREST_EXPANSION5B_ART} from '../js/assets/forestExpansion5bArt.js';
import {DESERT_EXPANSION5A_ART} from '../js/assets/desertExpansion5aArt.js';
import {DESERT_EXPANSION5B_ART} from '../js/assets/desertExpansion5bArt.js';
import {FINAL_SPECIES_ART} from '../js/assets/finalSpeciesArt.js';
const packs=[
{slug:"north-expansion4a",entries:NORTH_EXPANSION4A_ART},{slug:"north-expansion4b",entries:NORTH_EXPANSION4B_ART},{slug:"ancient-expansion4",entries:ANCIENT_EXPANSION4_ART},{slug:"desert-expansion4",entries:DESERT_EXPANSION4_ART},{slug:"forest-expansion5a",entries:FOREST_EXPANSION5A_ART},{slug:"forest-expansion5b",entries:FOREST_EXPANSION5B_ART},{slug:"desert-expansion5a",entries:DESERT_EXPANSION5A_ART},{slug:"desert-expansion5b",entries:DESERT_EXPANSION5B_ART},{slug:"final-species",entries:FINAL_SPECIES_ART}];
const pendingModels=(()=>{const bytes=readFileSync(new URL("../docs/qa/task10/additional72-fixtures/models.json",import.meta.url));assert.equal(createHash("sha256").update(bytes).digest("hex"),"a2c3450049993fb803aa0afd585995008f19a4a601a3bd6fb665909c8f748ac0");return JSON.parse(bytes);})();
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const directions=['n','ne','e','se','s','sw','w','nw'];
const banks=['idle','run-a','run-b','attack','hurt','death'];
const manifestModels=slug=>pendingModels.filter(m=>m.pack===slug);
const allEntries=packs.flatMap(pack=>Object.entries(pack.entries));

test('additional seventy-two integration contains nine packs of eight new identities with no model, key or texture collisions',()=>{
 assert.equal(allEntries.length,72);
 for(const pack of packs){assert.equal(Object.keys(pack.entries).length,8);assert.deepEqual(Object.keys(pack.entries).sort(),manifestModels(pack.slug).map(m=>m.id).sort());}
 for(const value of [allEntries.map(([id])=>id),allEntries.map(([,e])=>e.key),allEntries.map(([,e])=>e.url),allEntries.map(([,e])=>hash(readFileSync(e.url)))])assert.equal(new Set(value).size,72);
});

for(const pack of packs)test(pack.slug+' has original 48-pose transparent models, eight directions, six unique state silhouettes and measured feet',()=>{
 for(const[id,entry]of Object.entries(pack.entries)){
  const image=pngAlpha(entry.url),atlas=JSON.parse(readFileSync(entry.atlasURL));
  assert.equal(image.width,1024);assert.equal(image.height,1152);
  assert.equal(entry.frameWidth,128);assert.equal(entry.frameHeight,192);
  assert.deepEqual(entry.poseBanks,banks);assert.equal(entry.drawnDeath,true);
  assert.deepEqual(Object.keys(atlas.frames).sort(),banks.flatMap(bank=>directions.map(d=>bank+'/'+d)).sort());
  assert.ok(image.alpha.filter(a=>a===0).length>image.alpha.length*.6,id+'/transparent');
  for(const direction of directions){const states=new Set();
   for(const bank of banks){const name=bank+'/'+direction,f=atlas.frames[name].frame,alpha=[];let count=0,bottom=0;
    assert.equal(f.w,128);assert.equal(f.h,192);
    assert.ok(f.x>=0&&f.y>=0&&f.x+f.w<=image.width&&f.y+f.h<=image.height);
    for(let y=0;y<f.h;y++)for(let x=0;x<f.w;x++){const a=image.alpha[(f.y+y)*image.width+f.x+x];alpha.push(a);if(a>128){count++;bottom=Math.max(bottom,y);}if(x<12||x>=116||y<70||y>=174)assert.equal(a,0,id+'/'+name+'/gutter');}
    assert.ok(count>200,id+'/'+name+'/painted');assert.equal(bottom,entry.footlines[name],id+'/'+name+'/footline');states.add(hash(Buffer.from(alpha)));
   }
   assert.equal(states.size,6,id+'/'+direction+'/distinct states');
  }
  const directionalIdle=new Set(directions.map(d=>{const f=atlas.frames['idle/'+d].frame,alpha=[];for(let y=0;y<f.h;y++)for(let x=0;x<f.w;x++)alpha.push(image.alpha[(f.y+y)*image.width+f.x+x]);return hash(Buffer.from(alpha));}));
  assert.equal(directionalIdle.size,8,id+'/eight distinct facing silhouettes');
  assert.equal(uniqueSpeciesArt(id),entry);assert.equal(integratedSpeciesArt(id),entry);
 }
});

for(const pack of packs)test(pack.slug+' exact manifest names and ability pairs preserve the complete base kind and movement profile',()=>{
 for(const model of manifestModels(pack.slug)){
  const {id}=model,entry=pack.entries[id],region=getRegionContent(id.split('-species-')[0]),camp=region.camps.find(c=>c.speciesId===id);
  assert.ok(camp,id+'/real camp');assert.equal(camp.type,model.baseType);assert.ok(typeof model.biome==='string'&&model.biome.length>0);
  assert.equal(camp.spawns.length,11,id+'/residents');
  assert.deepEqual(speciesTraits(id),{names:model.names,abilityConfig:{abilityPattern:model.proposedAbilityPattern}});
  assert.equal(new Set(model.proposedAbilityPattern).size,2);
  for(const spawn of camp.spawns){
   const kind=monsterKind(spawn),base=monsterKind({...spawn,speciesId:undefined,plannedSpeciesId:undefined});
   assert.equal(monsterArt(spawn.type,kind,spawn),entry);assert.equal(kind.speciesId,id);assert.deepEqual(kind.names,model.names);assert.equal(kind.name,model.names.ru);
   const {name,names,speciesId,abilityConfig,...rest}=kind,{name:baseName,names:baseNames,speciesId:baseId,abilityConfig:baseConfig,...baseRest}=base;
   assert.deepEqual(rest,baseRest,id+'/all base-kind properties');
   assert.deepEqual(abilityConfig,{abilityPattern:model.proposedAbilityPattern},id+'/only ability pattern override');
   const {abilityPattern,...profileRest}=movementProfile(kind);assert.deepEqual(abilityPattern,model.proposedAbilityPattern);assert.deepEqual(profileRest,movementProfile(base),id+'/complete base profile');
  }
 }
});

for(const pack of packs)test(pack.slug+' releases both real timed abilities and their actual damage, projectiles, effects or movement',()=>{
 for(const model of manifestModels(pack.slug)){
  const id=model.id,camp=getRegionContent(id.split('-species-')[0]).camps.find(c=>c.speciesId===id),kind=monsterKind(camp.spawns[0]),profile=movementProfile(kind);
  const shots=[],hits=[],moves=[],effects=[],warnings=[];
  const monster={kind,x:100,y:100,homeX:100,homeY:100,hp:kind.hp,alive:true,attack:kind.attack,lastAbilityAt:0},hero={x:180,y:100,hp:50000};
  const context={monster,hero,now:10000,engaged:true,safe:false,canSee:()=>true,canOccupy:()=>true,shoot:s=>shots.push(s),damage:(...args)=>hits.push(args),move:(x,y,maxDistance)=>{assert.ok(Math.hypot(x-monster.x,y-monster.y)<=maxDistance);monster.x=x;monster.y=y;moves.push({x,y,maxDistance});},warn:warning=>{warnings.push(warning);return{destroy(){}};},effect:e=>effects.push(e)};
  for(const ability of model.proposedAbilityPattern){
   hero.x=monster.x+(['pounce','charge','dive'].includes(ability)?80:Math.min(80,profile.radius*.6));hero.y=monster.y;
   const before={shots:shots.length,hits:hits.length,moves:moves.length,effects:effects.length};
   assert.deepEqual(tickMonsterAbility(context),{busy:true,ability},id+'/'+ability+'/telegraph');
   assert.equal(monster.specialState.releaseAt,context.now+profile.windup);
   context.now+=profile.windup-1;assert.deepEqual(tickMonsterAbility(context),{busy:true,ability});
   assert.equal(shots.length,before.shots);assert.equal(hits.length,before.hits);
   context.now++;assert.deepEqual(tickMonsterAbility(context),{busy:false,fired:ability},id+'/'+ability+'/real release');assert.equal(monster.specialState,null);
   if(['pounce','charge','dive','burrow'].includes(ability)){assert.equal(moves.length,before.moves+1);assert.equal(hits.length,before.hits+1);}
   else if(['cleave','stomp','roots','frost'].includes(ability))assert.equal(hits.length,before.hits+1);
   else assert.equal(shots.length-before.shots,ability==='fan'?3:1);
   assert.ok(shots.length>before.shots||hits.length>before.hits,id+'/'+ability+'/real combat callback');
   for(const hit of hits.slice(before.hits))assert.equal(hit[0],kind.attack*profile.multiplier);
   for(const shot of shots.slice(before.shots)){assert.equal(shot.damage,kind.attack*profile.multiplier);assert.equal(shot.range,600);assert.ok(shot.speed<=245);}
   if(['pounce','charge','dive','burrow','cleave','stomp','roots','frost','blink'].includes(ability))assert.ok(effects.slice(before.effects).some(e=>e.kind===ability),id+'/'+ability+'/actual effect');
   assert.ok(Math.hypot(monster.x-monster.homeX,monster.y-monster.homeY)<=260,id+'/bounded movement');
   context.now+=profile.cooldown;
  }
  assert.equal(monster.abilityStep,2);assert.equal(warnings.length,2);
 }
});


// This file is prepared outside the test glob. Copy to tests only AFTER the
// matching runtime patch is accepted. These are candidate integration assertions,
// not a statement that the current live game contains these72 models.
const previousModels=(()=>{const bytes=readFileSync(new URL("../docs/qa/task10/additional72-fixtures/previous169.json",import.meta.url));assert.equal(createHash("sha256").update(bytes).digest("hex"),"3c2c3eb7ea5b8ecd63f70ff5b7eac3436afba7ae9b986cd1aa23109c36e4c19d");return JSON.parse(bytes);})();
test('all169 previous identities preserve descriptors, PNG/atlas bytes, traits,11 resident kinds and complete profiles',()=>{
 assert.equal(previousModels.length,169);assert.equal(new Set(previousModels.map(m=>m.id)).size,169);
 const own=new Set(allEntries.map(([id])=>id));
 for(const row of previousModels){
  assert.ok(!own.has(row.id));const art=uniqueSpeciesArt(row.id);assert.ok(art,row.id+'/retained');
  assert.equal(hash(JSON.stringify(art)),row.artHash,row.id+'/art descriptor');assert.equal(art.url,row.image);assert.equal(art.atlasURL,row.atlas);
  assert.equal(hash(readFileSync(row.image)),row.imageSha256,row.id+'/PNG');assert.equal(hash(readFileSync(row.atlas)),row.atlasSha256,row.id+'/atlas');
  assert.deepEqual(speciesTraits(row.id),row.traits,row.id+'/traits');
  const c=getRegionContent(row.id.split('-species-')[0]),camp=c.camps.find(c=>c.speciesId===row.id);
  assert.equal(hash(JSON.stringify(camp)),row.campHash,row.id+'/camp and all11 descriptors');
  assert.equal(hash(JSON.stringify(camp.spawns.map(monsterKind))),row.residentKindsHash,row.id+'/all11 complete kinds');
  assert.equal(hash(JSON.stringify(camp.spawns.map(s=>movementProfile(monsterKind(s))))),row.residentProfilesHash,row.id+'/all11 complete movement profiles');
 }
});
test('new descriptors and texture/atlas bytes equal the frozen reviewed72-model inputs',()=>{
 assert.equal(pendingModels.length,72);
 for(const model of pendingModels){assert.deepEqual(integratedSpeciesArt(model.id),model.entry,model.id+'/frozen descriptor');assert.equal(hash(readFileSync(model.entry.url)),model.imageSha256);assert.equal(hash(readFileSync(model.entry.atlasURL)),model.atlasSha256);}
});
test('accepted72-model registration produces241 primary models,218 six-bank models and16 honestly unfinished species',()=>{
 const entries=uniqueSpeciesEntries(),ids=new Set(entries.map(([id])=>id));assert.equal(entries.length,241);assert.equal(ids.size,241);assert.equal(Object.keys(INTEGRATED_SPECIES_ART).length,218);
 const camps=['forest','north','ancient','desert'].flatMap(r=>getRegionContent(r).camps);assert.equal(camps.length,257);
 const pending=camps.filter(c=>!uniqueSpeciesArt(c.speciesId));assert.equal(pending.length,16);
 assert.ok(pending.every(c=>/^north-species-0(5[89]|6[0-9]|7[0-3])$/.test(c.speciesId)),'north5a/5b remain explicitly unfinished');
 for(const field of ['key','url','atlasURL'])assert.equal(new Set(entries.map(([,e])=>e[field])).size,241,field+'/global identity collision');
 assert.equal(new Set(entries.map(([,e])=>hash(readFileSync(e.url)))).size,241,'global PNG uniqueness');
 assert.equal(entries.filter(([,e])=>e.poseBanks?.includes('hurt')&&e.drawnDeath).length,218);
});
