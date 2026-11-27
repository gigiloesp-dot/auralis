import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const bytes=readFileSync(new URL('../docs/qa/aur203/task10-baseline.json',import.meta.url));
assert.equal(createHash('sha256').update(bytes).digest('hex'),'3441745cd6743e6ad21bcd024323b9ab2fb746124ac2502b8ac2320fa79ee338');
const baseline=JSON.parse(bytes);
export const WORLD_REGIONS=Object.freeze(['forest','north','ancient','desert']);
export const WORLD_STAGES=Object.freeze(['task10','aur203-first20','aur203-final']);
// Independent accepted-stage expectations. Never derive these from live data.
export const FIRST20_SPECIES=Object.freeze({
 forest:Object.freeze(['forest-species-080','forest-species-081','forest-species-082','forest-species-083','forest-species-084','forest-species-085','forest-species-086','forest-species-087']),
 north:Object.freeze(['north-species-076','north-species-077','north-species-078','north-species-079']),
 ancient:Object.freeze(['ancient-species-045','ancient-species-046','ancient-species-047','ancient-species-048']),
 desert:Object.freeze(['desert-species-056','desert-species-057','desert-species-058','desert-species-059'])
});
const speciesRange=(region,first,count)=>Object.freeze(Array.from({length:count},(_,i)=>region+'-species-'+String(first+i).padStart(3,'0')));
export const FINAL_SPECIES=Object.freeze({
 forest:speciesRange('forest',80,17),north:speciesRange('north',76,18),
 ancient:speciesRange('ancient',45,17),desert:speciesRange('desert',56,32)
});
export const FINAL84_SPECIES=FINAL_SPECIES;
const counts=rows=>Object.freeze(Object.fromEntries(WORLD_REGIONS.map((region,index)=>[region,Object.freeze({camps:rows[index][0],normal:rows[index][1]})])));
export const EXPECTED_COUNTS_BY_STAGE=Object.freeze({
 task10:counts([[80,880],[76,836],[45,495],[56,616]]),
 'aur203-first20':counts([[88,968],[80,880],[49,539],[60,660]]),
 'aur203-final':counts([[97,1067],[94,1034],[62,682],[88,968]])
});
export const EXPECTED_LIVE_COUNTS=EXPECTED_COUNTS_BY_STAGE['aur203-final'];
const emptySpecies=Object.freeze(Object.fromEntries(WORLD_REGIONS.map(region=>[region,Object.freeze([])])));
export const SPECIES_BY_STAGE=Object.freeze({task10:emptySpecies,'aur203-first20':FIRST20_SPECIES,'aur203-final':FINAL_SPECIES});
function stageFor(options={}){
 assert.ok(options&&typeof options==='object'&&!Array.isArray(options),'Explicit stage options required');
 assert.ok(!(Object.hasOwn(options,'stage')&&Object.hasOwn(options,'first20')),'Do not mix old first20 switch with explicit stage');
 if(Object.hasOwn(options,'first20'))assert.equal(typeof options.first20,'boolean');
 const stage=options.stage??(Object.hasOwn(options,'first20')?(options.first20?'aur203-first20':'task10'):'aur203-final');
 assert.ok(WORLD_STAGES.includes(stage),'Known accepted world stage required');return stage;
}
export function expectedCampIds(region,options={}){
 const previous=baseline.regions[region];assert.ok(previous,'Known outdoor region required');
 const stage=stageFor(options);
 return [...previous.camps.map(camp=>camp.id),...SPECIES_BY_STAGE[stage][region].map(id=>id.replace('-species-','-spot-'))];
}
export function originalTask10Camps(content){
 const previous=baseline.regions[content.id];assert.ok(previous,'Task10 outdoor region required');
 const ids=content.camps.map(camp=>camp.id);assert.equal(new Set(ids).size,ids.length,content.id+'/unique camp IDs');
 assert.deepEqual(ids.slice(0,previous.camps.length),previous.camps.map(camp=>camp.id),content.id+'/exact original camp prefix');
 const originalIds=new Set(previous.camps.map(camp=>camp.id));
 const original=content.camps.filter(camp=>originalIds.has(camp.id));assert.equal(original.length,previous.camps.length);
 return original;
}
export function originalTask10View(content){return {...content,camps:originalTask10Camps(content)};}
export function assertActiveExpansion(content,options={}){
 const stage=stageFor(options),region=content.id,original=originalTask10Camps(content),expected=EXPECTED_COUNTS_BY_STAGE[stage][region],species=SPECIES_BY_STAGE[stage][region];
 assert.ok(expected&&species,'Known outdoor region required');
 const additions=content.camps.slice(original.length);
 assert.deepEqual(additions.map(camp=>camp.speciesId),species,region+'/'+stage+'/exact accepted species sequence');
 assert.deepEqual(content.camps.map(camp=>camp.id),expectedCampIds(region,{stage}),region+'/'+stage+'/exact accepted camp sequence');
 assert.equal(content.camps.length,expected.camps,region+'/all runtime camps');
 const allResidents=content.camps.flatMap(camp=>camp.spawns);
 assert.equal(allResidents.length,expected.normal,region+'/all runtime residents');
 assert.equal(new Set(allResidents.map(spawn=>spawn.id)).size,expected.normal,region+'/unique runtime resident IDs');
 for(const camp of additions){
  assert.equal(camp.spawns.length,11,camp.id+'/all eleven residents');assert.equal(camp.plannedSpeciesId,camp.speciesId);
  assert.equal(typeof camp.type,'string');assert.ok(camp.type.length>0,camp.id+'/registered type identity');
  assert.equal(camp.temporaryBestiary,false,camp.id+'/finished painted species rather than a prototype');
  assert.deepEqual(camp.spawns.map(spawn=>spawn.id),Array.from({length:11},(_,i)=>camp.id+'-mob-'+i));
  for(const spawn of camp.spawns){assert.equal(spawn.speciesId,camp.speciesId);assert.equal(spawn.plannedSpeciesId,camp.speciesId);assert.equal(spawn.type,camp.type);assert.equal(spawn.level,camp.level);}
 }
 return additions;
}
