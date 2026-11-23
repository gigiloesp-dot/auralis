import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pngAlpha} from './pngAlpha.mjs';
import {WARRIOR_REFERENCE_ITEMS,WARRIOR_EQUIPMENT_ART,warriorEquipmentArt} from '../js/assets/warriorEquipmentArt.js';
import {WARRIOR_NATIVE_SOCKETS,WARRIOR_DIRECTIONS,warriorSockets,WARRIOR_DEPTH} from '../js/characters/warriorCalibration.js';
import {WARRIOR_BOOT_PIVOTS} from '../js/characters/warriorBootPivots.js';
import {WARRIOR_SWORD_PIVOTS} from '../js/characters/warriorSwordPivots.js';
import {ACTOR_ART,actorPose} from '../js/assets/actorArt.js';
import {ITEM_DEFS,equipItem,unequipItem,equipmentStats} from '../js/equipment/items.js';
import {createCharacter} from '../js/characters/Character.js';
import {Save} from '../js/systems/save.js';
const sha=buffer=>createHash('sha256').update(buffer).digest('hex');

test('the reference set uses seven existing IDs, real requirements and warrior-only appearance mapping',()=>{
 assert.equal(WARRIOR_REFERENCE_ITEMS.length,7);assert.deepEqual(WARRIOR_REFERENCE_ITEMS.map(id=>ITEM_DEFS[id].level),[4,1,1,1,1,1,5]);
 const hero=createCharacter({classId:'warrior',level:5,equipment:{},inventory:WARRIOR_REFERENCE_ITEMS.map(id=>({id,rarity:'common'}))});
 while(hero.inventory.length)assert.equal(equipItem(hero,0).ok,true);assert.equal(Object.keys(hero.equipment).length,7);
 for(const [slot,item]of Object.entries(hero.equipment)){assert.equal(warriorEquipmentArt(hero,slot).id,item.id);for(const other of ['archer','mage','paladin','assassin','cannoneer'])assert.equal(warriorEquipmentArt({...hero,classId:other},slot),null);}
 const under=createCharacter({classId:'warrior',level:4,inventory:[{id:'shield_1',rarity:'common'}]});assert.deepEqual(equipItem(under,0),{ok:false,reason:'level'});
 assert.equal(warriorEquipmentArt({...hero,equipment:{weapon:{id:'weapon_warrior_2'}}},'weapon'),null,'do not claim the next tier has its own painted set');
});

test('all seven runtime PNGs are distinct transparent images with nonempty bounded atlas frames',()=>{
 const hashes=new Set();let totalBytes=0;
 for(const art of Object.values(WARRIOR_EQUIPMENT_ART)){
  const file=readFileSync(art.url),{width,height,alpha}=pngAlpha(art.url),atlas=JSON.parse(readFileSync(art.atlasURL));hashes.add(sha(file));totalBytes+=file.length;
  assert.equal(width,512);assert.equal(atlas.meta.size.w,width);assert.equal(atlas.meta.size.h,height);assert.equal(alpha[0],0);
  assert.ok(alpha.filter(a=>a===0).length>alpha.length*.25,'real transparent outside pixels, not a baked matte');
  for(const [name,{frame:f}]of Object.entries(atlas.frames)){assert.ok(f.x>=0&&f.y>=0&&f.x+f.w<=width&&f.y+f.h<=height,name);let visible=0;for(let y=f.y;y<f.y+f.h;y++)for(let x=f.x;x<f.x+f.w;x++)if(alpha[y*width+x]>128)visible++;assert.ok(visible>30,art.id+'/'+name+' must have actual painted pixels');}
 }
 assert.equal(hashes.size,7,'one copied texture cannot stand in for seven items');assert.ok(totalBytes<3*1024*1024,'only this compact set, not source sheets, is delivered to the renderer');
});

test('all32 native socket sets register to actual opaque body pixels within five native pixels',()=>{
 const {width,alpha}=pngAlpha('assets/actors/heroes/base/warrior.png'),banks=['idle','run-a','run-b','attack'];assert.equal(Object.keys(WARRIOR_NATIVE_SOCKETS).length,32);
 for(const [frame,points]of Object.entries(WARRIOR_NATIVE_SOCKETS)){
  const [bank,direction]=frame.split('/'),ox=WARRIOR_DIRECTIONS.indexOf(direction)*192,oy=banks.indexOf(bank)*256;
  for(const [name,p]of Object.entries(points)){let visible=false;for(let dy=-5;dy<=5;dy++)for(let dx=-5;dx<=5;dx++){const x=p.x+dx,y=p.y+dy;if(dx*dx+dy*dy<=25&&x>=0&&x<192&&y>=0&&y<256&&alpha[(oy+y)*width+ox+x]>128)visible=true;}assert.ok(visible,frame+'/'+name+' must not float outside the body');}
  const projected=warriorSockets(ACTOR_ART.warrior,frame);for(const [name,p]of Object.entries(points)){assert.equal(projected[name].x,(p.x-96)*ACTOR_ART.warrior.scale);assert.equal(projected[name].y,(p.y-ACTOR_ART.warrior.baselines[bank])*ACTOR_ART.warrior.scale);}
 }
});

test('grips, articulated boot pivots, eight depth profiles and all six existing states have valid coverage',()=>{
 assert.equal(Object.keys(WARRIOR_SWORD_PIVOTS).length,32);assert.equal(Object.keys(WARRIOR_BOOT_PIVOTS).length,32);
 for(const p of Object.values(WARRIOR_SWORD_PIVOTS)){assert.ok([...p.grip,...p.tip,p.angle].every(Number.isFinite));assert.ok(Math.hypot(p.tip[0]-p.grip[0],p.tip[1]-p.grip[1])>20);}
 for(const p of Object.values(WARRIOR_BOOT_PIVOTS))assert.ok([...p.bootPivot,p.bootAngle,p.bootLength].every(Number.isFinite)&&p.bootLength>2);
 for(const state of ['idle','run','attack','special','hurt','death'])for(let i=0;i<8;i++){const p=actorPose(state,i*Math.PI/4,.12,.6);assert.ok(WARRIOR_NATIVE_SOCKETS[p.frame]);assert.ok(WARRIOR_DEPTH[p.direction]);}
 assert.notEqual(WARRIOR_DEPTH.e.rightNear,WARRIOR_DEPTH.w.rightNear);assert.notEqual(WARRIOR_DEPTH.se.leftNear,WARRIOR_DEPTH.sw.leftNear);
});

test('normal equip, unequip and saved reload preserve the real catalogue stats without injecting any items',()=>{
 const map=new Map();globalThis.localStorage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};
 const hero=createCharacter({classId:'warrior',level:5,equipment:{},inventory:WARRIOR_REFERENCE_ITEMS.map(id=>({id,rarity:'rare'}))});while(hero.inventory.length)assert.equal(equipItem(hero,0).ok,true);
 const before=equipmentStats(hero);assert.equal(Save.write(hero,1),true);const loaded=Save.load(1);assert.deepEqual(loaded.equipment,hero.equipment);assert.deepEqual(equipmentStats(loaded),before);
 for(const slot of Object.keys(loaded.equipment))assert.equal(unequipItem(loaded,slot),true);assert.equal(loaded.inventory.length,7);assert.deepEqual(loaded.equipment,{});
 const bare=createCharacter({equipment:{},inventory:[]});assert.equal(Save.write(bare,2),true);assert.deepEqual(Save.load(2).inventory,[],'no appearance module injects equipment into ordinary saves');
});

test('release17 assets and gameplay remain byte-identical with only the exact task7 home sizing delta',()=>{
 const task10Ledger=readFileSync('docs/qa/task10/approved-deltas.json');assert.equal(sha(task10Ledger),'854775622470e154cc41b36f05937dc4908740f9ade920fdcf41de8687863966');const task10=JSON.parse(task10Ledger).files;
 const ledger=readFileSync('docs/qa/task9/approved-deltas.json');assert.equal(sha(ledger),'fd8478d06c88ff5a2701e7db607d2bb6c5f19321bd26a8e686dc967cb278cbc5');const deltas=JSON.parse(ledger);
 const manifest=JSON.parse(readFileSync('docs/art/WARRIOR_REFERENCE_PRESERVED.json'));assert.ok(Object.keys(manifest.hashes).length>200);for(const [path,hash]of Object.entries(manifest.hashes)){
  if(path==='index.html'){
   // AUR-192 adds exactly one centralized map stylesheet; every prior byte
   // (including controls, scripts and all existing styles) remains protected.
   const html=readFileSync(path,'utf8'),added='<link rel="stylesheet" href="./css/region-map.css">',tracking='<link rel="stylesheet" href="./css/quest-tracker.css">';
   assert.equal(html.split(added).length,2,'exactly one AUR-192 stylesheet');
   assert.equal(html.split(tracking).length,2,'exactly one centralized quest-tracking stylesheet');assert.ok(html.includes('<link rel="stylesheet" href="./css/ui-scale.css">'+added+tracking+'</head>'));
   assert.equal(sha(html.replace(added,'').replace(tracking,'')),hash,path+' all original markup preserved');
  }else if(task10[path]){assert.equal(task10[path].before,deltas[path]?.current||hash,path+' release21 contract');if(deltas[path])assert.equal(deltas[path].original,hash,path+' historical contract');assert.equal(sha(readFileSync(path)),task10[path].after,path+' exact approved task10 delta');}
  else if(deltas[path]){assert.equal(deltas[path].original,hash,path+' original contract');assert.equal(sha(readFileSync(path)),deltas[path].current,path+' explicit approved task9 delta');}
  else if(path==='css/npc.css'){
   // Exactly the Task10 travel grid; all previous NPC styles retain their hash.
   const source=readFileSync(path,'utf8'),added='.npc-travel-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.npc-panel .npc-travel-list button{min-height:44px!important;text-align:left;white-space:normal;overflow-wrap:anywhere}.npc-dialogue{color:#eddbb5}\n';
   assert.equal(source.split(added).length,2);assert.equal(sha(source.replace(added,'')),hash,path+' original NPC styling');
  }else if(path==='css/ui-scale.css'){
   // Task 7 explicitly changes only the final home background sizing rule.
   // Preserve the old hash assertion, and require the exact one-line delta.
   const baseline=readFileSync('docs/qa/task7/ui-scale-release18.css','utf8');assert.equal(sha(baseline),hash,path+' original');
   const old='#menu[data-page=home]{background-image:var(--ui-menu-art),linear-gradient(90deg,#170f0a,#342316 45%,#170f0a);background-size:contain,cover}';
   const at=baseline.lastIndexOf(old);assert.ok(at>=0);
   const added=readFileSync('docs/qa/task8/menu-overrides.css','utf8');assert.equal(sha(added),'45e433a2d71ebaec28f0fe0113a0c720e9858c19e46d8677057cc9a0081f7ee7');
   assert.equal(readFileSync(path,'utf8'),baseline.slice(0,at)+old.replace('background-size:contain,cover','background-size:cover,cover')+baseline.slice(at+old.length)+added,path+' only authorized task7/task8 menu changes');
  }else if(path==='js/world/ChunkWorld.js'){
   assert.equal(sha(readFileSync('docs/qa/task8/ChunkWorld-release19.js')),hash,path+' original');
   assert.equal(sha(readFileSync(path)),'7e34d6b20b9455b5fabae62a28f49ebf933bd48102ee275fdb605db13e19deb6',path+' authorized NPC indicator integration');
  }else assert.equal(sha(readFileSync(path)),hash,path);
 }
});
