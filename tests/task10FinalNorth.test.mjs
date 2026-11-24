import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync}from'node:fs';import{createHash}from'node:crypto';
import{NORTH_EXPANSION5A_ART}from'../js/assets/northExpansion5aArt.js';import{NORTH_EXPANSION5B_ART}from'../js/assets/northExpansion5bArt.js';const FINAL_NORTH_ART={...NORTH_EXPANSION5A_ART,...NORTH_EXPANSION5B_ART};import{monsterArt}from'../js/assets/monsterArt.js';import{uniqueSpeciesArt}from'../js/assets/speciesAssets.js';import{getRegionContent}from'../js/world/regionContent.js';import{monsterKind}from'../js/monsters/monsters.js';import{movementProfile}from'../js/monsters/movementProfiles.js';import{pngAlpha}from'./pngAlpha.mjs';
import{tickMonsterAbility}from'../js/monsters/movementProfiles.js';
test('sixteen final north original species use distinct real48-pose transparent paintings with bounded frame gutters and measured feet',()=>{const models=new Set();for(const[id,entry]of Object.entries(FINAL_NORTH_ART)){const bytes=readFileSync(entry.url),image=pngAlpha(entry.url),atlas=JSON.parse(readFileSync(entry.atlasURL));models.add(createHash('sha256').update(bytes).digest('hex'));assert.equal(image.width,1024);assert.equal(image.height,1152);assert.equal(Object.keys(atlas.frames).length,48);assert.ok(image.alpha.filter(a=>a===0).length>image.alpha.length*.6);for(const direction of ['n','ne','e','se','s','sw','w','nw']){const poses=new Set();for(const bank of entry.poseBanks){const name=bank+'/'+direction,f=atlas.frames[name].frame,alpha=[];let count=0,bottom=0;for(let y=0;y<f.h;y++)for(let x=0;x<f.w;x++){const a=image.alpha[(f.y+y)*image.width+f.x+x];alpha.push(a);if(a>128){count++;bottom=Math.max(bottom,y);}if(x<12||x>=116||y<70||y>=174)assert.equal(a,0,id+'/'+name+' gutter');}assert.ok(count>200,id+'/'+name+' painted body');assert.equal(bottom,entry.footlines[name]);poses.add(createHash('sha256').update(Buffer.from(alpha)).digest('hex'));}assert.equal(poses.size,6,id+'/'+direction+' actual distinct state poses');}assert.equal(uniqueSpeciesArt(id),entry);}assert.equal(models.size,16);});
test('sixteen final north models preserve every original stat and drop while alternating distinct real existing abilities',()=>{const expected={"north-species-058": ["stomp", "frost"], "north-species-059": ["haunt", "fan"], "north-species-060": ["pounce", "frost"], "north-species-061": ["stomp", "frost"], "north-species-062": ["stomp", "charge"], "north-species-063": ["shot", "fan"], "north-species-064": ["pounce", "charge"], "north-species-065": ["blink", "frost"], "north-species-066": ["stomp", "cleave"], "north-species-067": ["dive", "fan"], "north-species-068": ["stomp", "cleave"], "north-species-069": ["dive", "fan"], "north-species-070": ["pounce", "charge"], "north-species-071": ["dive", "frost"], "north-species-072": ["dive", "frost"], "north-species-073": ["pounce", "charge"]};for(const[id,entry]of Object.entries(FINAL_NORTH_ART)){const c=getRegionContent(id.split('-species-')[0]),camp=c.camps.find(c=>c.speciesId===id),spawn=camp.spawns[0],kind=monsterKind(spawn),base=monsterKind({...spawn,speciesId:undefined,plannedSpeciesId:undefined}),p=movementProfile(kind),previous=movementProfile(base);for(const key of ['hp','attack','defense','magicDefense','speed','xp','gold','respawnMs','loot','assetSize','magic','projectile'])assert.equal(kind[key],base[key],id+'/'+key);for(const key of ['collisionRadius','movement','locomotion','cooldown','windup','range','radius','multiplier','elevation','preferredDistance','status'])assert.equal(p[key],previous[key],id+'/'+key);assert.equal(monsterArt(spawn.type,kind,spawn),entry);assert.deepEqual(p.abilityPattern,expected[id]);const {name,names,speciesId,abilityConfig,...actualBase}=kind;const {name:oldName,names:oldNames,speciesId:oldSpecies,abilityConfig:oldConfig,...expectedBase}=base;assert.deepEqual(actualBase,expectedBase,id+' entire base kind');const {abilityPattern,...profileWithoutPattern}=p;assert.deepEqual(profileWithoutPattern,previous,id+' complete unchanged base profile');const shots=[],hits=[],moves=[],m={kind,x:100,y:100,homeX:100,homeY:100,hp:kind.hp,alive:true,attack:kind.attack,lastAbilityAt:0},hero={x:180,y:100,hp:50000},context={monster:m,hero,now:10000,engaged:true,safe:false,canSee:()=>true,canOccupy:()=>true,shoot:s=>shots.push(s),damage:(...s)=>hits.push(s),move:(x,y)=>{m.x=x;m.y=y;moves.push({x,y});},warn:()=>({destroy(){}}),effect(){}};for(const ability of expected[id]){hero.x=m.x+80;hero.y=m.y;const beforeEffects=shots.length+hits.length+moves.length;assert.equal(tickMonsterAbility(context).ability,ability);context.now+=p.windup;assert.equal(tickMonsterAbility(context).fired,ability);assert.ok(shots.length+hits.length+moves.length>beforeEffects,id+'/'+ability+' observable release');context.now+=p.cooldown;}assert.equal(m.abilityStep,2);const effectCount=shots.length+hits.length+moves.length;context.canSee=()=>false;hero.x=m.x+80;assert.equal(tickMonsterAbility(context).busy,false);assert.equal(m.specialState,null);assert.equal(shots.length+hits.length+moves.length,effectCount,id+'/wall blocks ability start');context.canSee=()=>true;assert.ok(tickMonsterAbility(context).busy);context.now+=p.windup;context.canSee=()=>false;assert.equal(tickMonsterAbility(context).busy,false);assert.equal(shots.length+hits.length+moves.length,effectCount,id+'/wall blocks ability release');assert.equal(m.abilityStep,2);assert.ok(shots.length+hits.length+moves.length>0,id+'/actual ability effects');
if(expected[id].includes('roots'))assert.ok(hits.some(h=>h[2]?.type==='slow'&&h[2]?.multiplier===.35),id+'/roots slow callback');
if(expected[id].includes('venom'))assert.ok(shots.some(s=>s.status?.type==='poison'),id+'/venom projectile callback');
if(expected[id].includes('blink')){assert.equal(p.movement,'flight');assert.ok(Math.hypot(m.x-m.homeX,m.y-m.homeY)<=260);assert.notDeepEqual({x:m.x,y:m.y},{x:100,y:100});}
if(expected[id].includes('frost'))assert.ok(hits.some(h=>h[2]?.type==='slow'&&h[2]?.multiplier===.55),id+'/frost slow callback');
if(expected[id].includes('fan'))assert.ok(shots.length>=3,id+'/fan projectiles');
for(const language of ['ru','en','es'])assert.ok(kind.names[language]);}});

import {monsterIntent,markMonsterThreat} from '../js/monsters/monsterBehavior.js';
test('sixteen final north ordinary residents retain bounded idle/patrol/chase/return FSM',()=>{
 for(const id of Object.keys(FINAL_NORTH_ART)){
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


import{TASK10_LAYOUT}from'../js/world/task10Layout.js';
test('final north integration retains all eleven authored residents and every noncamp region field',()=>{
 const live=getRegionContent('north'),authored=TASK10_LAYOUT.north;
 for(const key of Object.keys(authored).filter(k=>!['camps','npcs','palette'].includes(k)))assert.deepEqual(live[key],authored[key],'north/'+key);
 assert.equal(createHash('sha256').update(readFileSync('js/world/task10Layout.js')).digest('hex'),'b77972f432c1bc1adaabf5c4dd7437f7a1c5f3218b63b4dcb60d068f67ca786b','frozen world layout');
 for(const npc of authored.npcs)assert.deepEqual(live.npcs.find(n=>n.id===npc.id),npc);
 assert.deepEqual(live.npcs.filter(n=>!authored.npcs.some(a=>a.id===n.id)).map(n=>n.id),['north-teleporter','north-daily','north-weaponsmith','north-armorsmith']);
 for(const id of Object.keys(FINAL_NORTH_ART)){
  const original=authored.camps.find(c=>c.plannedSpeciesId===id),camp=live.camps.find(c=>c.speciesId===id);
  assert.equal(camp.spawns.length,11,id);
  for(const key of Object.keys(original).filter(k=>!['spawns','temporaryBestiary'].includes(k)))assert.deepEqual(camp[key],original[key],id+'/'+key);
  camp.spawns.forEach((spawn,i)=>{const{speciesId,...unchanged}=spawn;assert.equal(speciesId,id);assert.deepEqual(unchanged,original.spawns[i],id+'/resident '+i);});
 }
});
