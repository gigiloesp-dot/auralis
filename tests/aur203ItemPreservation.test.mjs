import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {ITEM_DEFS} from '../js/equipment/items.js';
import {MONSTER_MATERIALS,MONSTER_MATERIAL_BY_LOOT} from '../js/equipment/monsterMaterials.js';
import {AUR203_MATERIALS,AUR203_MATERIAL_BY_LOOT} from '../js/equipment/aur203Materials.js';
import {AUR203_EXPANSION_MATERIALS,AUR203_EXPANSION_MATERIAL_BY_LOOT} from '../js/equipment/aur203ExpansionMaterials.js';
test('all155 release26 item definitions and16 thematic materials remain exact while only84 approved non-equipment items are added',()=>{
 const bytes=readFileSync('docs/qa/aur203/first20-existing-items.json');
 assert.equal(createHash('sha256').update(bytes).digest('hex'),'9a7be442283d050d77009c11153723b7947f96ef117fcb5eebe34f49e7baafd8');
 const before=JSON.parse(bytes);
 assert.equal(before.sourceCommit,'e80d0efc6f12577d31364abfc8448d905f299227');
 assert.equal(Object.keys(before.definitions).length,155);assert.equal(Object.keys(before.monsterMaterials).length,16);
 for(const[id,definition]of Object.entries(before.definitions))assert.deepEqual(ITEM_DEFS[id],definition,id+' unchanged');
 assert.deepEqual(Object.keys(ITEM_DEFS).filter(id=>!Object.hasOwn(before.definitions,id)).sort(),Object.keys({...AUR203_MATERIALS,...AUR203_EXPANSION_MATERIALS}).sort());
 assert.equal(Object.keys(ITEM_DEFS).length,239);assert.equal(Object.keys(AUR203_MATERIALS).length,20);
 assert.deepEqual(MONSTER_MATERIALS,{...before.monsterMaterials,...AUR203_MATERIALS,...AUR203_EXPANSION_MATERIALS});
 assert.deepEqual(MONSTER_MATERIAL_BY_LOOT,{...before.materialByLoot,...AUR203_MATERIAL_BY_LOOT,...AUR203_EXPANSION_MATERIAL_BY_LOOT});
 for(const definition of Object.values(AUR203_MATERIALS)){assert.equal(definition.slot,null);assert.equal(definition.saleValue,0);assert.equal(definition.attack,undefined);assert.equal(definition.defense,undefined);}
});
