import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {AUR203_SPECIES} from '../js/monsters/aur203Species.js';
import {monsterKind} from '../js/monsters/monsters.js';
import {getRegionContent} from '../js/world/regionContent.js';
import {movementProfile} from '../js/monsters/movementProfiles.js';
const report=JSON.parse(readFileSync('docs/bestiary/AUR_203_SPECIES.json')),sha=value=>createHash('sha256').update(value).digest('hex');

test('separate full-world catalogue preserves original257 catalogue bytes and actual identity sequence',()=>{
 const original=JSON.parse(readFileSync('docs/bestiary/TASK_10_SPECIES.json'));
 for(const row of report.preservation.earlierCatalogueFiles)assert.equal(sha(readFileSync(row.path)),row.sha256);
 const preserved=report.species.filter(row=>row.cohort==='preserved257').map(row=>row.id);assert.equal(preserved.length,257);assert.deepEqual(preserved,original.species.map(row=>row.id));
 assert.equal(sha(JSON.stringify(preserved)),'3ca1ac323627f23655215091b5f769a1c80238dfd1699f2dc603246f1f3b01ac');
 assert.equal(report.totalCamps,341);assert.equal(report.totalResidents,3751);assert.equal(new Set(report.species.map(row=>row.id)).size,341);
 assert.deepEqual(Object.fromEntries(Object.entries(report.regions).map(([id,row])=>[id,row.camps])),{forest:97,north:94,ancient:62,desert:88});
});

test('catalogue native stats, exact current homes and effective abilities match all actual341 runtime camps',()=>{
 const byId=new Map(report.species.map(row=>[row.id,row]));let residents=0;
 for(const region of ['forest','north','ancient','desert'])for(const camp of getRegionContent(region).camps){
  const row=byId.get(camp.plannedSpeciesId),kind=monsterKind(camp.spawns[0]),profile=movementProfile(kind);assert.equal(row.nativeLevel,camp.level);assert.deepEqual(row.position,{x:camp.x,y:camp.y});assert.deepEqual(row.names,kind.names);
  for(const field of Object.keys(row.stats))assert.equal(row.stats[field],kind[field]);assert.deepEqual(row.abilities,profile.abilityPattern||[profile.ability]);assert.deepEqual(row.behaviorConfig,kind.behaviorConfig||{});
  assert.deepEqual(row.residents,camp.spawns.map(spawn=>({id:spawn.id,x:spawn.x,y:spawn.y,level:spawn.level})));residents+=row.residents.length;
 }assert.equal(residents,3751);
});

test('all new84 catalogue entries carry canonical source hashes and48 native RGBA provenance hashes',()=>{
 const added=report.species.filter(row=>row.cohort==='aur203-added84');assert.equal(added.length,84);
 for(const row of added){assert.ok(AUR203_SPECIES[row.id]);assert.equal(row.art.frameCount,48);assert.equal(row.art.poseBanks.length,6);assert.equal(row.art.drawnDeath,true);assert.equal(row.art.provenance.validatedId,row.id);
  const hashes=Object.values(row.art.provenance.nativeRGBAFrameSHA256);assert.equal(hashes.length,48);assert.equal(new Set(hashes).size,48);
  for(const ref of [row.art.png,row.art.atlas,row.art.provenance,row.art.provenance.validation,row.art.provenance.source,row.loot.material.icon].filter(Boolean))assert.equal(sha(readFileSync(ref.path)),ref.sha256);
  assert.equal(row.loot.material.slot,null);assert.equal(row.loot.material.saleValue,0);assert.equal(row.loot.materialId,AUR203_SPECIES[row.id].materialId);
  assert.match(row.art.animationScope,/not six new multi-frame clips/);
 }
 assert.deepEqual(added.filter(row=>row.stunOnStomp).map(row=>[row.id,row.stunOnStomp.durationMs]),[['north-species-084',700],['ancient-species-052',600],['desert-species-078',800]]);
 assert.equal(report.acceptance.finalBrowserAcceptanceClaim,false);assert.equal(report.acceptance.physicalAndroidClaim,false);
});

test('dependency-free catalogue generator deterministically checks JSON and Markdown without rewriting',()=>{
 const before=['docs/bestiary/AUR_203_SPECIES.json','docs/bestiary/AUR_203_SPECIES.md'].map(p=>sha(readFileSync(p)));
 const output=execFileSync(process.execPath,['scripts/generate-aur203-catalog.mjs','--check'],{encoding:'utf8'});assert.deepEqual(JSON.parse(output),{camps:341,residents:3751,preserved:257,added:84,check:true});
 assert.deepEqual(['docs/bestiary/AUR_203_SPECIES.json','docs/bestiary/AUR_203_SPECIES.md'].map(p=>sha(readFileSync(p))),before);
});
