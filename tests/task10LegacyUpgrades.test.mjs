import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {LEGACY_UPGRADE_A_ART} from '../js/assets/legacyUpgradeAArt.js';
import {LEGACY_UPGRADE_B_ART} from '../js/assets/legacyUpgradeBArt.js';
import {LEGACY_UPGRADE_C_ART} from '../js/assets/legacyUpgradeCArt.js';
import {uniqueSpeciesArt,uniqueSpeciesEntries} from '../js/assets/speciesAssets.js';
import {monsterArt} from '../js/assets/monsterArt.js';
import {monsterKind,MONSTER_TYPES} from '../js/monsters/monsters.js';
import {movementProfile,tickMonsterAbility} from '../js/monsters/movementProfiles.js';
import {speciesTraits} from '../js/monsters/speciesRuntime.js';
import {getRegionContent} from '../js/world/regionContent.js';
import {preservedSpeciesArt} from './preservedSpeciesArt.mjs';
import {PaintedActor} from '../js/characters/PaintedActor.js';
const fixtureBytes=readFileSync('docs/qa/task10/legacy-upgrades/original23.json');
const fixture=JSON.parse(fixtureBytes),banks=['idle','run-a','run-b','attack','hurt','death'],dirs=['n','ne','e','se','s','sw','w','nw'];
const upgrades={...LEGACY_UPGRADE_A_ART,...LEGACY_UPGRADE_B_ART,...LEGACY_UPGRADE_C_ART};

test('23 legacy extensions preserve736 original RGBA poses and atlas objects and add368 independently drawn hurt/death poses',()=>{
 assert.equal(createHash('sha256').update(fixtureBytes).digest('hex'),'dcfb939933bcdf0cdaefbbc5d3f6ddf23a0c03b00ee539b126181f70df44359d');
 assert.deepEqual([Object.keys(LEGACY_UPGRADE_A_ART).length,Object.keys(LEGACY_UPGRADE_B_ART).length,Object.keys(LEGACY_UPGRADE_C_ART).length],[8,8,7]);
 assert.deepEqual(Object.keys(upgrades).sort(),fixture.entries.map(r=>r.id).sort());
 for(const row of fixture.entries)assert.deepEqual(preservedSpeciesArt(row.id,upgrades[row.id]),row.descriptor);
});

test('all257 primary models have unique keys and URLs and complete48-frame six-bank directional atlases',()=>{
 const entries=uniqueSpeciesEntries();assert.equal(entries.length,257);
 for(const key of ['key','url','atlasURL'])assert.equal(new Set(entries.map(([,a])=>a[key])).size,257,key);
 for(const[id,entry]of entries){
  const atlas=JSON.parse(readFileSync(entry.atlasURL)),png=readFileSync(entry.url),width=png.readUInt32BE(16),height=png.readUInt32BE(20),fw=entry.frameWidth||192,fh=entry.frameHeight||256;
  assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert.equal(width,fw*8);assert.equal(height,fh*6);
  const rectangles=new Set();for(const frame of Object.values(atlas.frames)){const f=frame.frame;assert.equal(f.w,fw);assert.equal(f.h,fh);assert.ok(f.x>=0&&f.y>=0&&f.x+f.w<=width&&f.y+f.h<=height);assert.equal(f.x%fw,0);assert.equal(f.y%fh,0);rectangles.add(f.x+','+f.y);assert.equal(frame.rotated??false,false);assert.equal(frame.trimmed??false,false);}assert.equal(rectangles.size,48,id+'/48 nonoverlapping cells');
  assert.deepEqual(Object.keys(atlas.frames).sort(),banks.flatMap(b=>dirs.map(d=>b+'/'+d)).sort(),id+'/complete48');
  assert.deepEqual(entry.poseBanks,banks,id+'/six painted banks');assert.equal(entry.drawnDeath,true);
 }
});

test('legacy overlays preserve all original residents, base kinds, names, drops and single-ability movement profiles',()=>{
 for(const row of fixture.entries){
  const entry=upgrades[row.id],live=getRegionContent(row.id.split('-species-')[0]),camp=live.camps.find(c=>c.speciesId===row.id);
  const {speciesId,temporaryBestiary,...unchanged}=camp;
  const original=structuredClone(row.camp);delete original.temporaryBestiary;
  unchanged.spawns=unchanged.spawns.map(({speciesId,...s})=>s);
  assert.deepEqual(unchanged,original,row.id+'/original camp including all residents');
  assert.deepEqual(MONSTER_TYPES[camp.type],row.baseMonster,row.id+'/frozen archetype');
  assert.equal(speciesTraits(row.id),row.traits);
  for(const spawn of camp.spawns){
   const kind=monsterKind(spawn),base=monsterKind({...spawn,speciesId:undefined,plannedSpeciesId:undefined});
   const{speciesId:identity,...actualBase}=kind;assert.equal(identity,row.id);assert.deepEqual(actualBase,base,row.id+'/'+spawn.id+' entire base kind');
   assert.deepEqual(movementProfile(kind),movementProfile(base));
   assert.equal(monsterArt(spawn.type,kind,spawn),entry);assert.equal(uniqueSpeciesArt(row.id),entry);assert.equal(kind.respawnMs,30000);
  }
 }
});

test('every legacy actor uses exact preserved origins for32 old poses and measured origins for16 new poses',async()=>{
 for(const row of fixture.entries){
  const entry=upgrades[row.id],sprite={setOrigin(x,y){this.originX=x;this.originY=y;return this;},setScale(){return this;},setFrame(f){this.frame=f;return this;},setTint(){return this;},clearTint(){return this;},destroy(){}};
  let released=0;const scene={actorTextures:{acquire(){return{ready:Promise.resolve(true),release(){released++;}};}},add:{image(){return sprite;}}},root={scene,add(){}};
  const actor=new PaintedActor(scene,root,entry);assert.equal(await actor.ready,true);
  const seen=new Set();
  for(const[state,time,bank]of[['idle',0,'idle'],['run',0,'run-a'],['run',.12,'run-b'],['attack',0,'attack'],['hurt',0,'hurt'],['death',0,'death']])for(let i=0;i<8;i++){
   actor.elapsed=time;actor.update(state,i*Math.PI/4,0,{progress:.6});seen.add(actor.currentFrame);
   assert.ok(actor.currentFrame.startsWith(bank+'/'));
   const evidence=row.effectiveFrames[actor.currentFrame];
   assert.equal(sprite.originX,evidence?.originX??.5);assert.equal(sprite.originY,evidence?.originY??entry.footlines[actor.currentFrame]/256,row.id+'/'+actor.currentFrame+' actual origin');
   if(state==='death')assert.equal(sprite.rotation,0);
  }
  assert.equal(seen.size,48);actor.destroy();assert.equal(released,1);
 }
});

test('legacy base abilities still telegraph, release twice, affect combat and respect walls',()=>{
 for(const row of fixture.entries){
  const spawn=getRegionContent(row.id.split('-species-')[0]).camps.find(c=>c.speciesId===row.id).spawns[0],kind=monsterKind(spawn),p=movementProfile(kind),m={kind,x:100,y:100,homeX:100,homeY:100,hp:kind.hp,alive:true,attack:kind.attack},hero={x:180,y:100,hp:50000},events=[];
  const context={monster:m,hero,now:10000,engaged:true,safe:false,canSee:()=>true,canOccupy:()=>true,warn:()=>({destroy(){}}),effect:e=>events.push(e),shoot:e=>events.push(e),damage:(...e)=>events.push(e),move:(x,y)=>{m.x=x;m.y=y;events.push({x,y});}};
  for(let i=0;i<2;i++){hero.x=m.x+80;hero.y=m.y;const before=events.length;assert.equal(tickMonsterAbility(context).ability,p.ability);context.now+=p.windup;assert.equal(tickMonsterAbility(context).fired,p.ability);assert.ok(events.length>before,row.id+'/real callback');context.now+=p.cooldown;}
  context.canSee=()=>false;assert.equal(tickMonsterAbility(context).busy,false);assert.equal(m.specialState,null);
 }
});
