import test from 'node:test';
import assert from 'node:assert/strict';
import {createCharacter} from '../js/characters/Character.js';
import {Save} from '../js/systems/save.js';
import {usePotion} from '../js/systems/potions.js';
import {itemIcon} from '../js/ui/itemIcons.js';
import {ITEM_DEFS,itemDefinition,normalizeInventory} from '../js/equipment/items.js';
import {rollEncounterLoot} from '../js/monsters/encounterLoot.js';
import {GROUND_CONSUMABLES,groundDropDefinition,groundDropName,AUR203_CONSUMABLE_SPECIES_IDS,consumableEventRoll,rollAur203GroundConsumables} from '../js/loot/groundConsumables.js';
import {createGroundDrops,groundLootState,normalizeGroundLoot,materializeGroundDrops,lootCategory,pickupGroundDrop,pickupNearbyGroundDrops} from '../js/loot/groundLoot.js';
const hp={id:'hpPotion',rarity:'common',quantity:1},mp={id:'mpPotion',rarity:'common',quantity:1};
const hero=extra=>createCharacter({x:1000,y:1000,potions:{hp:0,mp:0},...extra});
const monster=(speciesId='forest-species-080',key='forest:aur203-pot-test')=>({key,id:'aur203-pot-test',x:1000,y:1000,kind:{speciesId,loot:'aur203ChestnutCrab',level:10}});
function drop(h,items=[hp],at=1000){const result=createGroundDrops(h,monster(),items,at);for(const id of result.ids)Object.assign(groundLootState(h).drops[id],{x:h.x,y:h.y});return result;}
function memoryStorage(){const values=new Map();globalThis.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)};return values;}

test('ground descriptors reuse potion identities without catalogue/inventory registration',()=>{
 for(const id of ['hpPotion','mpPotion']){assert.equal(itemDefinition({id}),null);assert.equal(Object.hasOwn(ITEM_DEFS,id),false);assert.equal(groundDropDefinition({id}),GROUND_CONSUMABLES[id]);assert.deepEqual(normalizeInventory([{id,quantity:1}]),[]);assert.equal(lootCategory({id}),'chest');for(const lang of ['ru','en','es'])assert.equal(groundDropName({id},lang),GROUND_CONSUMABLES[id].names[lang]);}
 const hpArt=itemIcon(hp,groundDropDefinition(hp)),mpArt=itemIcon(mp,groundDropDefinition(mp));assert.match(hpArt,/data-item-kind="hpPotion"/);assert.match(mpArt,/data-item-kind="mpPotion"/);assert.match(hpArt,/#d75249/);assert.match(mpArt,/#4c9cdd/);for(const art of [hpArt,mpArt])assert.match(art,/<rect x="1" y="1" width="46" height="46"/);
 assert.equal(groundDropDefinition({id:'inventedPotion'}),null);assert.equal(groundDropDefinition({id:'rustySword'}),itemDefinition({id:'rustySword'}));
});

test('exact84 whitelist gates species and bosses before any extra reward',()=>{
 assert.equal(AUR203_CONSUMABLE_SPECIES_IDS.length,84);assert.equal(new Set(AUR203_CONSUMABLE_SPECIES_IDS).size,84);
 let old=0;for(const [region,end]of [['forest',79],['north',75],['ancient',44],['desert',55]])for(let n=0;n<=end;n++){old++;assert.deepEqual(rollAur203GroundConsumables(monster(region+'-species-'+String(n).padStart(3,'0')),1234),[]);}assert.equal(old,257);
 for(const speciesId of ['forest-species-079','forest-species-097','north-species-075','north-species-094','ancient-species-044','ancient-species-062','desert-species-055','desert-species-088',null])for(let at=0;at<100;at++)assert.deepEqual(rollAur203GroundConsumables(monster(speciesId),at),[]);
 for(const speciesId of AUR203_CONSUMABLE_SPECIES_IDS){let found=false;for(let at=0;at<1000;at++)if(rollAur203GroundConsumables(monster(speciesId),at).length){found=true;break;}assert.ok(found,speciesId);const m=monster(speciesId);m.kind.boss=true;assert.deepEqual(rollAur203GroundConsumables(m,1),[]);delete m.kind.boss;m.kind.bossType='world';assert.deepEqual(rollAur203GroundConsumables(m,1),[]);}
 for(const at of [NaN,Infinity,-1,8640000000000001])assert.deepEqual(rollAur203GroundConsumables(monster(),at),[]);assert.deepEqual(rollAur203GroundConsumables({...monster(),key:''},1),[]);
});

test('independent deterministic event checks can yield both potions without global RNG',()=>{
 assert.equal(consumableEventRoll('forest:aur203-pot-test',1000,'hpPotion'),0.3647966207936406);assert.equal(consumableEventRoll('forest:aur203-pot-test',1000,'mpPotion'),0.40010622376576066);
 const original=Math.random;Math.random=()=>{throw Error('global RNG was used');};
 try{let both;for(let at=0;at<100000;at++){const a=rollAur203GroundConsumables(monster(),at);assert.deepEqual(a,rollAur203GroundConsumables(monster(),at));if(a.length===2){both=at;break;}}assert.notEqual(both,undefined);assert.deepEqual(rollAur203GroundConsumables(monster(),both),[hp,mp]);assert.notEqual(consumableEventRoll(monster().key,both,'hpPotion'),consumableEventRoll(monster().key,both,'mpPotion'));assert.notEqual(consumableEventRoll(monster().key,both,'hpPotion'),consumableEventRoll(monster().key,both+1,'hpPotion'));}finally{Math.random=original;}
});

test('augmentation preserves existing ordinary and boss RNG calls and output including subsequent rolls',()=>{
 for(const kind of [{loot:'wolf',level:1},{loot:'aur203ChestnutCrab',speciesId:'forest-species-080',level:10},{loot:'wolf',level:42,boss:true,bossType:'world'},{loot:'wolf',level:42,boss:true,bossType:'dungeon'}]){
  const run=augment=>{let index=0;const trace=[],rng=()=>{const n=[0,.1,.3,.001,.8,.2,.7,.01][index++%8];trace.push(n);return n;},h=hero(),first=rollEncounterLoot(h,kind,rng);if(augment)rollAur203GroundConsumables({...monster(),kind},333);return {first,second:rollEncounterLoot(h,kind,rng),trace};};assert.deepEqual(run(true),run(false));
 }
});

test('full bag and cap99 leave potion drops; depleted zero remains zero until actual pickup',()=>{
 const h=hero({inventory:Array.from({length:60},()=>({id:'rustySword',rarity:'common'}))}),[id]=drop(h).ids,inventory=h.inventory,potions=h.potions;
 assert.equal(pickupGroundDrop(h,id).reason,'full');assert.equal(h.inventory,inventory);assert.equal(h.potions,potions);assert.equal(h.potions.hp,0);h.inventory.pop();assert.equal(pickupGroundDrop(h,id).ok,true);assert.equal(h.potions.hp,1);assert.equal(h.inventory,inventory);
 for(const count of [99,120,1e20]){const p=hero({potions:{hp:count,mp:0}}),[d]=drop(p).ids;assert.equal(pickupGroundDrop(p,d).reason,'potionCapacity');assert.equal(p.potions.hp,count);assert.ok(groundLootState(p).drops[d]);}
});

test('single overcapacity pickup fails closed; bulk fills room and durably retains remainder',()=>{
 memoryStorage();const h=hero({potions:{hp:98,mp:0}}),[id]=drop(h,[{...hp,quantity:3}]).ids;
 assert.equal(pickupGroundDrop(h,id).reason,'potionCapacity');assert.equal(h.potions.hp,98);assert.equal(groundLootState(h).drops[id].item.quantity,3);
 const result=pickupNearbyGroundDrops(h,{save:()=>Save.write(h,1)});assert.equal(result.picked[0].item.quantity,1);assert.equal(result.picked[0].remaining,2);const loaded=createCharacter(Save.load(1));assert.equal(loaded.potions.hp,99);assert.equal(groundLootState(loaded).drops[id].item.quantity,2);assert.equal(pickupGroundDrop(loaded,id).reason,'potionCapacity');
});

test('false throw undefined and Promise saves roll counters/drop back with original identities',()=>{
 for(const save of [()=>false,()=>{throw Error('quota');},()=>undefined,()=>Promise.resolve(true)]){
  const h=hero(),[id]=drop(h).ids,inventory=h.inventory,potions=h.potions,record=groundLootState(h).drops[id];assert.equal(pickupGroundDrop(h,id,{save}).reason,'save');assert.equal(h.inventory,inventory);assert.equal(h.potions,potions);assert.equal(groundLootState(h).drops[id],record);assert.equal(h.potions.hp,0);
 }
 const h=hero(),[id]=drop(h).ids;delete h.potions;assert.equal(pickupGroundDrop(h,id,{save:()=>false}).reason,'save');assert.equal(Object.hasOwn(h,'potions'),false);
});

test('actual storage quota failure and reentrancy cannot consume or duplicate potions',()=>{
 const values=memoryStorage(),h=hero(),[id]=drop(h).ids;assert.equal(Save.write(h,1),true);const raw=values.get(Save.key(1));globalThis.localStorage.setItem=()=>{throw Error('quota');};assert.equal(pickupGroundDrop(h,id,{save:()=>Save.write(h,1)}).reason,'save');assert.equal(h.potions.hp,0);assert.equal(values.get(Save.key(1)),raw);assert.ok(groundLootState(h).drops[id]);
 let inner;assert.equal(pickupGroundDrop(h,id,{save:()=>{inner=pickupGroundDrop(h,id);return true;}}).ok,true);assert.equal(inner.reason,'busy');assert.equal(h.potions.hp,1);assert.equal(pickupGroundDrop(h,id).reason,'missing');
});

test('potion persistence pending placement duplicate deaths and three slots preserve actual counters',()=>{
 memoryStorage();for(const slot of [1,2,3]){
  const h=hero({potions:{hp:0,mp:slot-1}}),m=monster();h.worldState.monsters[m.key]={killedAt:1000,deadUntil:31000,hp:0};const blocked=createGroundDrops(h,m,[hp,mp],1000,{walkable:()=>false});assert.equal(blocked.reason,'placement');assert.equal(Save.write(h,slot),true);
  const restored=createCharacter(Save.load(slot)),state=groundLootState(restored),[pendingId,job]=Object.entries(state.pending)[0];assert.equal(restored.potions.hp,0);assert.equal(createGroundDrops(restored,m,[hp],1000).reason,'duplicate');const placed=materializeGroundDrops(restored,job);assert.equal(placed.ok,true);delete state.pending[pendingId];for(const id of placed.ids)Object.assign(state.drops[id],{x:restored.x,y:restored.y});assert.equal(pickupNearbyGroundDrops(restored,{save:()=>Save.write(restored,slot)}).picked.length,2);
  const loaded=createCharacter(Save.load(slot));assert.deepEqual(loaded.potions,{hp:1,mp:slot});assert.equal(Object.keys(groundLootState(loaded).drops).length,0);assert.equal(createGroundDrops(loaded,m,[hp],1000).reason,'duplicate');assert.equal(createGroundDrops(loaded,m,[hp],32000).ok,true);
  loaded.hp=1;assert.equal(usePotion(loaded,'hp',0,{}),true);assert.equal(loaded.potions.hp,0);assert.equal(Save.write(loaded,slot),true);assert.equal(createCharacter(Save.load(slot)).potions.hp,0);
 }
});

test('unknown records stay rejected and pickup still requires living same-region hero within180',()=>{
 const h=hero(),[id]=drop(h).ids,state=groundLootState(h);state.drops.fake={...state.drops[id],id:'fake',item:{id:'inventedPotion'}};assert.equal(normalizeGroundLoot(state).drops.fake,undefined);
 const source=state.drops[id];h.x=source.x+180.001;assert.equal(pickupGroundDrop(h,id,{radius:999}).reason,'distance');h.x=source.x+180;h.region='north';assert.equal(pickupGroundDrop(h,id).reason,'distance');h.region='forest';h.hp=0;assert.equal(pickupGroundDrop(h,id).reason,'distance');h.hp=1;assert.equal(pickupGroundDrop(h,id).ok,true);
});

 test('partial potion pickup quota failure restores the full source record and potion identity',()=>{
 const h=hero({potions:{hp:98,mp:7}}),[id]=drop(h,[{...hp,quantity:4}]).ids,record=groundLootState(h).drops[id],potions=h.potions,inventory=h.inventory;
 assert.equal(pickupGroundDrop(h,id,{allowPartial:true,save:()=>false}).reason,'save');assert.equal(groundLootState(h).drops[id],record);assert.equal(record.item.quantity,4);assert.equal(h.potions,potions);assert.deepEqual(h.potions,{hp:98,mp:7});assert.equal(h.inventory,inventory);
 });
