import test from 'node:test';import assert from 'node:assert/strict';
import {NPCS,LEGACY_NPCS,getRegionNpcs} from '../js/npc/npcData.js';
import {TASK10_NPCS,TASK10_DESERT_OASIS_SAFE_RADIUS} from '../js/npc/task10NpcData.js';
import {getRegionContent,getRelease21RegionContent} from '../js/world/regionContent.js';
import {TASK10_LAYOUT} from '../js/world/task10Layout.js';
import {describeChunk,worldWalkable,regionRoads,distanceToSegment} from '../js/world/chunkGeometry.js';
import {NPC_TRAVEL_LINKS,NPC_TRAVEL_RECEIVERS} from '../js/world/npcTravelData.js';
import {npcTravelOptions,npcTravelDestination,commitNpcTravel} from '../js/world/npcTravel.js';
import {merchantStock,merchantSellsPotions,buyEquipment} from '../js/systems/trading.js';
import {CLASSES} from '../js/characters/classes.js';import {createCharacter} from '../js/characters/Character.js';
import {itemDefinition} from '../js/equipment/items.js';import {PaintedNpc} from '../js/characters/PaintedNpc.js';
import {NPC_ART} from '../js/assets/npcArt.js';import {DUNGEONS} from '../js/dungeons/dungeonData.js';
import {Save} from '../js/systems/save.js';
const regions=['forest','north','ancient','desert'],distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
test('all40 NPCs are registered in the active streamed world while21 legacy identities,roads,camps and settlement footprints remain unchanged',()=>{
 assert.equal(NPCS.length,40);assert.equal(LEGACY_NPCS.length,21);assert.equal(new Set(NPCS.map(n=>n.id)).size,40);
 for(const [i,id]of regions.entries()){const c=getRegionContent(id),b=TASK10_LAYOUT[id];assert.equal(c.npcs.length,[15,10,8,7][i]);assert.deepEqual(getRegionNpcs(id),c.npcs);assert.deepEqual(c.roads,b.roads);assert.equal(c.camps.length,[80,76,45,56][i]);assert.equal(c.camps.reduce((sum,c)=>sum+c.spawns.length,0),[880,836,495,616][i]);assert.deepEqual(c.portals,b.portals);assert.deepEqual(c.settlementHouses,b.settlementHouses);
  for(const n of LEGACY_NPCS.filter(n=>n.region===id))assert.deepEqual(n,getRelease21RegionContent(id).npcs.find(p=>p.id===n.id));
  for(const t of c.towns){const old=b.towns.find(p=>p.id===t.id);assert.deepEqual({...t,safeRadius:old.safeRadius},old);assert.equal(t.safeRadius,t.id==='caravanOasis'?TASK10_DESERT_OASIS_SAFE_RADIUS:old.safeRadius);}
  const old={...c,npcs:b.npcs,towns:b.towns},chunks=new Set([...c.npcs,...c.receivers].flatMap(p=>{const x=Math.floor(p.x/512),y=Math.floor(p.y/512),keys=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)keys.push(`${x+dx},${y+dy}`);return keys;}));for(const key of chunks){const [x,y]=key.split(',').map(Number),a=describeChunk(c,x,y),b=describeChunk(old,x,y);assert.deepEqual(a.decorations,b.decorations,id+'/'+key+' preserve painted surroundings');assert.deepEqual(a.obstacles,b.obstacles,id+'/'+key+' preserve collision');}
 }
});
test('twelve stable arrival-only stones sit on real walkable roads with two remote points per region and no reverse interactions',()=>{
 assert.equal(NPC_TRAVEL_RECEIVERS.length,12);assert.equal(new Set(NPC_TRAVEL_RECEIVERS.map(r=>r.id)).size,12);
 for(const id of regions){const c={...getRegionContent(id),dungeons:DUNGEONS.filter(d=>d.region===id)},receivers=c.receivers;assert.equal(receivers.length,3);assert.equal(receivers.filter(r=>r.home).length,1);for(const r of receivers){assert.equal(r.arrivalOnly,true);assert.equal(r.roles,undefined);assert.equal(r.toRegion,undefined);assert.equal(worldWalkable(c,r.x,r.y,18),true,r.id);assert.ok(regionRoads(c).some(road=>distanceToSegment(r,road.from,road.to)<1),r.id+' actual existing route');for(const lang of ['ru','en','es'])assert.ok(r.names[lang]);if(!r.home){assert.ok(distance(r,receivers.find(r=>r.home))>2000);assert.ok(c.camps.every(p=>distance(r,p)>950));assert.ok(c.bosses.every(p=>distance(r,p)>1100));assert.ok(c.dungeons.every(p=>distance(r,p)>350));}}
 }
});
test('NPC travel allows exactly the approved ring and two local arrivals for every class,and rejects remote,dead,dungeon,forged and diagonal requests',()=>{
 const teleporters=NPCS.filter(n=>n.roles.includes('teleporter'));assert.equal(teleporters.length,4);
 for(const classId of Object.keys(CLASSES))for(const n of teleporters){const hero=createCharacter({classId,level:56,region:n.region,x:n.x,y:n.y}),options=npcTravelOptions(hero,n);assert.equal(options.length,4);assert.deepEqual(options.filter(r=>r.region!==n.region).map(r=>r.region).sort(),[...NPC_TRAVEL_LINKS[n.region]].sort());for(const r of options){const result=npcTravelDestination(hero,n.id,r.id);assert.equal(result.ok,true);assert.deepEqual(result.destination,{region:r.region,x:r.x,y:r.y});}for(const r of NPC_TRAVEL_RECEIVERS.filter(r=>r.region!==n.region&&!NPC_TRAVEL_LINKS[n.region].includes(r.region)))assert.equal(npcTravelDestination(hero,n.id,r.id).ok,false);for(const bad of [{...hero,hp:0},{...hero,x:n.x+151},{...hero,x:NaN},{...hero,dungeonSession:{id:'dungeon1'}},{...hero,region:'arena'}])assert.equal(npcTravelDestination(bad,n.id,options[0].id).ok,false);assert.equal(npcTravelDestination(hero,'mira',options[0].id).ok,false);assert.equal(npcTravelDestination(hero,n.id,'toString').ok,false);}
});
test('a travel checkpoint is atomic,never grants rewards,and all three slots reload the exact selected arrival without duplication',()=>{
 const map=new Map(),previous=globalThis.localStorage;globalThis.localStorage={getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,value),removeItem:key=>map.delete(key)};
 try{for(const slot of [1,2,3]){const n=NPCS.find(n=>n.id==='forest-teleporter'),h=createCharacter({name:'Travel'+slot,classId:Object.keys(CLASSES)[slot-1],level:25,region:n.region,x:n.x,y:n.y,gold:123,inventory:[{id:'wolfFang',quantity:2,rarity:'common'}]}),before=structuredClone(h),r=npcTravelOptions(h,n).find(r=>r.region==='north');assert.equal(commitNpcTravel(h,n.id,r.id,()=>false).reason,'storage');assert.deepEqual(h,before);assert.equal(commitNpcTravel(h,n.id,r.id,()=>{throw Error('Quota');}).reason,'storage');assert.deepEqual(h,before);assert.equal(commitNpcTravel(h,n.id,r.id,()=>Save.write(h,slot)).ok,true);const loaded=Save.load(slot);assert.deepEqual({region:loaded.region,x:loaded.x,y:loaded.y},{region:r.region,x:r.x,y:r.y});assert.deepEqual(h,{...before,region:r.region,x:r.x,y:r.y});assert.equal(commitNpcTravel(h,n.id,r.id,()=>{throw Error('Must not persist again');}).ok,false);assert.equal(loaded.gold,before.gold);assert.deepEqual(loaded.inventory,before.inventory);}}
 finally{globalThis.localStorage=previous;}
});
test('new specialists sell only their real category for all six classes,legacy merchant stock is unchanged,and no43–56gear is invented',()=>{
 for(const classId of Object.keys(CLASSES)){const hero=createCharacter({classId,level:56,gold:100000000});for(const npc of TASK10_NPCS.filter(n=>n.shopCategories)){const stock=merchantStock(hero,npc);assert.equal(merchantSellsPotions(npc),npc.shopCategories.includes('consumables'));if(npc.shopCategories.includes('consumables'))assert.deepEqual(stock,[]);else{assert.ok(stock.length>0);for(const offer of stock){const d=itemDefinition(offer);assert.ok(d.level<=42);assert.equal(d.slot==='weapon',npc.shopCategories.includes('weapon'));assert.ok(!d.allowedClasses||d.allowedClasses.includes(classId));}const wrong=TASK10_NPCS.find(n=>n.region===npc.region&&n.shopCategories?.[0]===(npc.shopCategories[0]==='weapon'?'armor':'weapon'));assert.equal(buyEquipment(hero,wrong,stock[0].offerId).ok,false);}}
  for(const npc of LEGACY_NPCS.filter(n=>n.roles.some(r=>['merchant','specialMerchant'].includes(r))))assert.deepEqual(merchantStock(hero,npc),merchantStock(hero,{...npc,shopCategories:['weapon','armor','consumables']}));
 }
});
test('nineteen live NPC renderers lease actual existing paintings and directional frames and release every lease without creating a fallback model',async()=>{
 let acquired=0,released=0;for(const npc of TASK10_NPCS){let frame,partsDestroyed=0;const sprite={setOrigin(){return this;},setScale(){return this;},setFrame(value){frame=value;return this;},destroy(){}};const scene={actorTextures:{acquire(entry){acquired++;assert.deepEqual(entry,NPC_ART[npc.appearanceId]);return {ready:Promise.resolve(true),release(){released++;}};}},add:{image(x,y,key,value){frame=value;assert.equal(key,NPC_ART[npc.appearanceId].key);return sprite;}}},root={scene,addAt(s){assert.equal(s,sprite);}},actor=PaintedNpc.create(scene,root,npc,[{destroy(){partsDestroyed++;}}]);assert.ok(actor);assert.equal(await actor.ready,true);assert.equal(frame,npc.appearanceId+'/s');actor.update({x:npc.x+50,y:npc.y+50},.016);assert.ok(frame.startsWith(npc.appearanceId+'/'));assert.equal(partsDestroyed,1);actor.destroy();actor.destroy();}assert.equal(acquired,19);assert.equal(released,19);
});
