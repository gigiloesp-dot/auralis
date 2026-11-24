import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const bytes=readFileSync(new URL('../docs/qa/aur203/task10-baseline.json',import.meta.url));
assert.equal(createHash('sha256').update(bytes).digest('hex'),'3441745cd6743e6ad21bcd024323b9ab2fb746124ac2502b8ac2320fa79ee338');
const baseline=JSON.parse(bytes);
export const WORLD_REGIONS=Object.freeze(['forest','north','ancient','desert']);
// Independent accepted-stage expectations. Never derive these from live data.
export const FIRST20_SPECIES=Object.freeze({
 forest:Object.freeze(['forest-species-080','forest-species-081','forest-species-082','forest-species-083','forest-species-084','forest-species-085','forest-species-086','forest-species-087']),
 north:Object.freeze(['north-species-076','north-species-077','north-species-078','north-species-079']),
 ancient:Object.freeze(['ancient-species-045','ancient-species-046','ancient-species-047','ancient-species-048']),
 desert:Object.freeze(['desert-species-056','desert-species-057','desert-species-058','desert-species-059'])
});
export const EXPECTED_LIVE_COUNTS=Object.freeze({
 forest:Object.freeze({camps:88,normal:968}),north:Object.freeze({camps:80,normal:880}),
 ancient:Object.freeze({camps:49,normal:539}),desert:Object.freeze({camps:60,normal:660})
});
export function expectedCampIds(region,{first20=true}={}){
 const previous=baseline.regions[region];assert.ok(previous,'Known outdoor region required');
 return [...previous.camps.map(camp=>camp.id),...(first20?FIRST20_SPECIES[region].map(id=>id.replace('-species-','-spot-')):[])];
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
export function assertActiveExpansion(content){
 const region=content.id,original=originalTask10Camps(content),expected=EXPECTED_LIVE_COUNTS[region],species=FIRST20_SPECIES[region];
 assert.ok(expected&&species,'Known outdoor region required');
 const additions=content.camps.slice(original.length);
 assert.deepEqual(additions.map(camp=>camp.speciesId),species,region+'/exact accepted species sequence');
 assert.deepEqual(additions.map(camp=>camp.id),species.map(id=>id.replace('-species-','-spot-')),region+'/exact accepted camp sequence');
 assert.equal(content.camps.length,expected.camps,region+'/all runtime camps');
 assert.equal(content.camps.reduce((n,camp)=>n+camp.spawns.length,0),expected.normal,region+'/all runtime residents');
 for(const camp of additions){
  assert.equal(camp.spawns.length,11,camp.id+'/all eleven residents');assert.equal(camp.plannedSpeciesId,camp.speciesId);
  assert.deepEqual(camp.spawns.map(spawn=>spawn.id),Array.from({length:11},(_,i)=>camp.id+'-mob-'+i));
  for(const spawn of camp.spawns){assert.equal(spawn.speciesId,camp.speciesId);assert.equal(spawn.plannedSpeciesId,camp.speciesId);assert.equal(spawn.type,camp.type);assert.equal(spawn.level,camp.level);}
 }
 return additions;
}
