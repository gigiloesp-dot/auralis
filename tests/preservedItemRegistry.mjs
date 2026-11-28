import assert from 'node:assert/strict';
// Permit only the two additive registry lines. Existing complete-source hashes
// still protect all prior definitions, functions and imports after removal.
export function withoutMonsterMaterialRegistration(source){
 const addedImport="import {MONSTER_MATERIALS} from"+" './monsterMaterials.js';\n";
 const addedSpread=",\n ...MONSTER_MATERIALS\n";
 assert.equal(source.split(addedImport).length,2,'Exactly one explicit material import');
 assert.equal(source.split(addedSpread).length,2,'Exactly one trailing material registry spread');
 return source.replace(addedImport,'').replace(addedSpread,'\n');
}
