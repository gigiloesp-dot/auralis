import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {AUR203_MATERIALS,AUR203_MATERIAL_BY_LOOT} from '../js/equipment/aur203Materials.js';
import {MONSTER_MATERIALS} from '../js/equipment/monsterMaterials.js';
import {localizedItemName} from '../js/i18n/entityNames.js';
import {itemIcon,itemIconKind,RARITY_COLORS} from '../js/ui/itemIcons.js';
import {insertStack,compactStacks} from '../js/equipment/stacking.js';
import {pngAlpha} from './pngAlpha.mjs';

const entries=Object.entries(AUR203_MATERIALS),sha=data=>createHash('sha256').update(data).digest('hex');
const expectedTypes=['aur203ChestnutCrab','aur203ReedHeron','aur203LanternSnail','aur203AcornHopper','aur203Sundew','aur203MossToad','aur203AmberDragonfly','aur203FernNewt','aur203RimeWalrus','aur203PowderMuskox','aur203ObsidianCentipede','aur203CrystalJelly','aur203PorcelainBellWalker','aur203MossAxolotl','aur203PrismCuttlefish','aur203ScrollTripod','aur203SandstoneTrilobite','aur203GlassJerboa','aur203PitcherCactus','aur203DuneSailray'];

test('twenty immutable additive materials have three distinct localized names and no equipment, price or probability changes',()=>{
 assert.equal(entries.length,20);assert.ok(Object.isFrozen(AUR203_MATERIALS));
 for(const [index,[id,definition]]of entries.entries()){
  assert.match(id,/^[a-z][A-Za-z]+$/);assert.ok(!Object.hasOwn(Object.fromEntries(Object.entries(MONSTER_MATERIALS).filter(([,def])=>!def.aur203Material)),id));
  assert.ok(Object.isFrozen(definition));assert.ok(Object.isFrozen(definition.names));
  assert.equal(definition.slot,null);assert.equal(definition.monsterMaterial,true);assert.equal(definition.aur203Material,true);assert.equal(definition.saleValue,0);
  assert.equal(definition.level,index<8?1:index<12?22:index<16?35:42);
  for(const key of ['attack','defense','allowedClasses','tier','rarity','dropChance','craftingValue'])assert.equal(definition[key],undefined,id+'/'+key);
  assert.equal(definition.name,definition.names.ru);
  for(const language of ['ru','en','es']){const name=localizedItemName({id},definition,language);assert.equal(name,definition.names[language]);assert.ok(name.length>=8&&name.length<90);if(language!=='ru')assert.doesNotMatch(name,/[А-Яа-яЁё]/);}
 }
 for(const language of ['ru','en','es'])assert.equal(new Set(entries.map(([,def])=>def.names[language])).size,20);
});

test('the exact twenty new monster loot labels map bijectively to their own anatomical materials',()=>{
 assert.ok(Object.isFrozen(AUR203_MATERIAL_BY_LOOT));assert.deepEqual(Object.keys(AUR203_MATERIAL_BY_LOOT),expectedTypes);
 assert.deepEqual(Object.values(AUR203_MATERIAL_BY_LOOT),entries.map(([id])=>id));assert.equal(new Set(Object.values(AUR203_MATERIAL_BY_LOOT)).size,20);
 assert.equal(AUR203_MATERIAL_BY_LOOT.aur203ReedHeron,'reedHeronFeather');assert.equal(AUR203_MATERIAL_BY_LOOT.aur203RimeWalrus,'rimeWalrusTusk');assert.equal(AUR203_MATERIAL_BY_LOOT.aur203PrismCuttlefish,'prismCuttleInk');
});

test('all twenty original PNG material icons have real alpha, readable nonempty silhouettes, safe margins and distinct bytes',()=>{
 const hashes=new Set();
 for(const [id,definition]of entries){
  assert.match(definition.iconURL,/^assets\/icons\/monster-materials\/aur203-[a-z0-9-]+\.png$/);
  const bytes=readFileSync(definition.iconURL),image=pngAlpha(definition.iconURL);assert.equal(image.width,128);assert.equal(image.height,128);
  let opaque=0,transparent=0;
  for(let y=0;y<128;y++)for(let x=0;x<128;x++){const alpha=image.alpha[y*128+x];if(alpha>=128)opaque++;if(alpha===0)transparent++;if(x<7||y<7||x>=121||y>=121)assert.equal(alpha,0,id+' margin');}
  assert.ok(opaque>=500&&opaque<10000,id+' opaque pixels '+opaque);assert.ok(transparent>7000,id+' transparent pixels '+transparent);hashes.add(sha(bytes));
 }
 assert.equal(hashes.size,20,'Not one universal icon under twenty names');
});

test('source and every packed icon retain complete-cell provenance and matching source/output hashes',()=>{
 const proof=JSON.parse(readFileSync('art/source/aur203-first20-material-icons/provenance.json'));
 assert.deepEqual(proof.sourceSize,[1402,1122]);assert.equal(proof.entries.length,20);assert.equal(sha(readFileSync(proof.source)),proof.sourceSHA256);assert.match(proof.method,/Complete 5x4 source cells/);
 for(let index=0;index<20;index++){const row=Math.floor(index/5),col=index%5,entry=proof.entries[index];assert.deepEqual(entry.sourceRect,[Math.floor(col*1402/5),Math.floor(row*1122/4),Math.floor((col+1)*1402/5),Math.floor((row+1)*1122/4)]);assert.equal(entry.url,entries[index][1].iconURL);assert.equal(entry.width,128);assert.equal(entry.height,128);assert.equal(sha(readFileSync(entry.url)),entry.sha256);}
});

test('existing safe material icon rendering keeps distinct images and every rarity frame for all new definitions',()=>{
 const icons=new Set();for(const [id,def]of entries){assert.equal(itemIconKind({id},def),id);for(const rarity of Object.keys(RARITY_COLORS)){const svg=itemIcon({id,rarity},def);assert.ok(svg.includes('<image href="'+def.iconURL+'"'));assert.ok(svg.includes('stroke="'+RARITY_COLORS[rarity]+'"'));assert.ok(!svg.includes('wolfFang'));if(rarity==='common')icons.add(svg);}}
 assert.equal(icons.size,20);
});

test('the prepared nongear definitions use the existing100-stack and full-bag semantics without adding runtime registration',()=>{
 for(const [id,definition]of entries){
  const item={id,rarity:'common',quantity:1},bag=Array.from({length:60},(_,n)=>({id:'reserved-'+n,rarity:'common',quantity:100}));
  assert.deepEqual(insertStack(bag,item,definition),{added:0,remainder:1});assert.equal(bag.length,60);
  bag[0]={...item,quantity:99};assert.deepEqual(insertStack(bag,item,definition),{added:1,remainder:0});assert.equal(bag[0].quantity,100);assert.equal(bag.length,60);
  const compacted=compactStacks([{...item,quantity:60},{...item,quantity:60}],entry=>AUR203_MATERIALS[entry.id]);assert.deepEqual(compacted,[{...item,quantity:100},{...item,quantity:20}]);
 }
});
