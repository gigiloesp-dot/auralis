import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync}from'node:fs';import{createHash}from'node:crypto';
import{NORTH_EXPANSION_ART}from'../js/assets/northExpansionArt.js';import{monsterArt}from'../js/assets/monsterArt.js';import{uniqueSpeciesArt}from'../js/assets/speciesAssets.js';import{getRegionContent}from'../js/world/regionContent.js';import{monsterKind}from'../js/monsters/monsters.js';import{movementProfile}from'../js/monsters/movementProfiles.js';import{pngAlpha}from'./pngAlpha.mjs';
import{tickMonsterAbility}from'../js/monsters/movementProfiles.js';
test('eight north original species use distinct real48-pose transparent paintings with bounded frame gutters and measured feet',()=>{const models=new Set();for(const[id,entry]of Object.entries(NORTH_EXPANSION_ART)){const bytes=readFileSync(entry.url),image=pngAlpha(entry.url),atlas=JSON.parse(readFileSync(entry.atlasURL));models.add(createHash('sha256').update(bytes).digest('hex'));assert.equal(image.width,1024);assert.equal(image.height,1152);assert.equal(Object.keys(atlas.frames).length,48);assert.ok(image.alpha.filter(a=>a===0).length>image.alpha.length*.6);for(const direction of ['n','ne','e','se','s','sw','w','nw']){const poses=new Set();for(const bank of entry.poseBanks){const name=bank+'/'+direction,f=atlas.frames[name].frame,alpha=[];let count=0,bottom=0;for(let y=0;y<f.h;y++)for(let x=0;x<f.w;x++){const a=image.alpha[(f.y+y)*image.width+f.x+x];alpha.push(a);if(a>128){count++;bottom=Math.max(bottom,y);}if(x<12||x>=116||y<70||y>=174)assert.equal(a,0,id+'/'+name+' gutter');}assert.ok(count>200,id+'/'+name+' painted body');assert.equal(bottom,entry.footlines[name]);poses.add(createHash('sha256').update(Buffer.from(alpha)).digest('hex'));}assert.equal(poses.size,6,id+'/'+direction+' actual distinct state poses');}assert.equal(uniqueSpeciesArt(id),entry);}assert.equal(models.size,8);});
test('eight north models preserve every original stat and drop while alternating distinct real existing abilities',()=>{const expected={"north-species-007":["pounce","charge"],"north-species-008":["shot","fan"],"north-species-010":["stomp","cleave"],"north-species-012":["stomp","charge"],"north-species-014":["blink","fan"],"north-species-018":["haunt","blink"],"north-species-021":["dive","frost"],"north-species-026":["blink","frost"]};for(const[id,entry]of Object.entries(NORTH_EXPANSION_ART)){const c=getRegionContent(id.split('-species-')[0]),camp=c.camps.find(c=>c.speciesId===id),spawn=camp.spawns[0],kind=monsterKind(spawn),base=monsterKind({...spawn,speciesId:undefined,plannedSpeciesId:undefined}),p=movementProfile(kind),previous=movementProfile(base);for(const key of ['hp','attack','defense','magicDefense','speed','xp','gold','respawnMs','loot','assetSize','magic','projectile'])assert.equal(kind[key],base[key],id+'/'+key);for(const key of ['collisionRadius','movement','locomotion','cooldown','windup','range','radius','multiplier','elevation','preferredDistance','status'])assert.equal(p[key],previous[key],id+'/'+key);assert.equal(monsterArt(spawn.type,kind,spawn),entry);assert.deepEqual(p.abilityPattern,expected[id]);const {abilityPattern,...profileWithoutPattern}=p;assert.deepEqual(profileWithoutPattern,previous,id+' complete unchanged base profile');const shots=[],hits=[],moves=[],m={kind,x:100,y:100,homeX:100,homeY:100,hp:kind.hp,alive:true,attack:kind.attack,lastAbilityAt:0},hero={x:180,y:100,hp:50000},context={monster:m,hero,now:10000,engaged:true,safe:false,canSee:()=>true,canOccupy:()=>true,shoot:s=>shots.push(s),damage:(...s)=>hits.push(s),move:(x,y)=>{m.x=x;m.y=y;moves.push({x,y});},warn:()=>({destroy(){}}),effect(){}};for(const ability of expected[id]){hero.x=m.x+80;hero.y=m.y;assert.equal(tickMonsterAbility(context).ability,ability);context.now+=p.windup;assert.equal(tickMonsterAbility(context).fired,ability);context.now+=p.cooldown;}assert.equal(m.abilityStep,2);assert.ok(shots.length+hits.length+moves.length>0,id+'/actual ability effects');
if(expected[id].includes('roots'))assert.ok(hits.some(h=>h[2]?.type==='slow'&&h[2]?.multiplier===.35),id+'/roots slow callback');
if(expected[id].includes('venom'))assert.ok(shots.some(s=>s.status?.type==='poison'),id+'/venom projectile callback');
if(expected[id].includes('blink')){assert.equal(p.movement,'flight');assert.ok(Math.hypot(m.x-m.homeX,m.y-m.homeY)<=260);assert.notDeepEqual({x:m.x,y:m.y},{x:100,y:100});}
if(expected[id].includes('frost'))assert.ok(hits.some(h=>h[2]?.type==='slow'&&h[2]?.multiplier===.55),id+'/frost slow callback');
if(expected[id].includes('fan'))assert.ok(shots.length>=3,id+'/fan projectiles');
for(const language of ['ru','en','es'])assert.ok(kind.names[language]);}});

import {monsterIntent,markMonsterThreat} from '../js/monsters/monsterBehavior.js';
test('eight north ordinary residents retain bounded idle/patrol/chase/return FSM',()=>{
 for(const id of Object.keys(NORTH_EXPANSION_ART)){
  const c=getRegionContent('north'),camp=c.camps.find(c=>c.speciesId===id),kind=monsterKind(camp.spawns[0]);
  const m={id,kind,x:100,y:100,homeX:100,homeY:100,campX:100,campY:100,campRadius:210,alive:true,behaviorState:'idle',nextPatrolAt:1000};
  const hero={x:180,y:100,hp:50000};
  assert.equal(monsterIntent(m,hero,100).engaged,false);assert.equal(m.behaviorState,'idle');
  assert.equal(monsterIntent(m,hero,1000).patrol,true);assert.equal(m.behaviorState,'patrol');
  assert.ok(Math.hypot(m.patrolTarget.x-m.homeX,m.patrolTarget.y-m.homeY)<=81);
  markMonsterThreat(m,hero,1100);assert.equal(m.behaviorState,'chase');
  assert.equal(monsterIntent(m,hero,1100,{visible:true}).engaged,true);
  m.x=456;assert.equal(monsterIntent(m,hero,1200,{visible:true}).returning,true);assert.equal(m.behaviorState,'return');
  m.x=m.homeX;m.y=m.homeY;hero.x=1000;
  assert.equal(monsterIntent(m,hero,1300,{safe:true}).engaged,false);assert.equal(m.behaviorState,'idle');assert.equal(m.returning,false);
  assert.equal(kind.respawnMs,30000,id+'/ordinary respawn');
 }
});

import{INTEGRATED_SPECIES_ART}from'../js/assets/speciesArtRegistry.js';import{NEW_SPECIES}from'../js/monsters/speciesRuntime.js';
test('north integration preserves all previous65 registered models and previous runtime traits byte-for-byte',()=>{
 const own=new Set(Object.keys(NORTH_EXPANSION_ART)),baseline=new Set(["desert-species-000","desert-species-001","desert-species-002","desert-species-003","desert-species-004","desert-species-005","forest-species-004","forest-species-006","north-species-003","ancient-species-003","forest-species-008","north-species-011","ancient-species-007","desert-species-023","forest-species-015","north-species-017","ancient-species-013","desert-species-007","desert-species-006","desert-species-008","desert-species-009","desert-species-010","desert-species-011","desert-species-012","desert-species-013","desert-species-014","forest-species-012","forest-species-013","forest-species-014","forest-species-016","forest-species-019","forest-species-023","forest-species-025","forest-species-026","ancient-species-005","ancient-species-008","ancient-species-010","ancient-species-011","ancient-species-019","ancient-species-021","ancient-species-029","ancient-species-041"]);
 for(const id of baseline)assert.ok(Object.hasOwn(INTEGRATED_SPECIES_ART,id)&&Object.hasOwn(NEW_SPECIES,id),id+' prior identity retained');
 const previousArt=Object.fromEntries(Object.entries(INTEGRATED_SPECIES_ART).filter(([id])=>baseline.has(id)));
 const previousTraits=Object.fromEntries(Object.entries(NEW_SPECIES).filter(([id])=>baseline.has(id)));
 assert.equal(Object.keys(previousArt).length,42); //42 imported original models plus23 legacy distinct models =65.
 assert.equal(createHash('sha256').update(JSON.stringify(previousArt)).digest('hex'),'7df43a8335b4e1f6e2598d013f01f4625e94d3ef143c663073a09f90dbc45026');
 assert.equal(createHash('sha256').update(JSON.stringify(previousTraits)).digest('hex'),'04fe07d6fec38bbd87d398d6547953ae29820cad3f14588fb2721fd16a016d23');
 assert.equal(Object.keys(INTEGRATED_SPECIES_ART).filter(id=>baseline.has(id)||own.has(id)).length,50);
 for(const id of own)assert.deepEqual(Object.keys(NEW_SPECIES[id]).sort(),['abilityConfig','names']);
});
