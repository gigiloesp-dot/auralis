import test from 'node:test';
import assert from 'node:assert/strict';
import {TASK10_QUESTS,TASK10_DAILY_QUESTS,TASK10_DAILY_TIERS} from '../js/quests/task10QuestData.js';
import {TASK10_NPCS} from '../js/npc/task10NpcData.js';
import {NPCS} from '../js/npc/npcData.js';
import {QUESTS,LEGACY_QUESTS,LEGACY_RUNTIME_QUESTS} from '../js/quests/quests.js';
import {getRegionContent} from '../js/world/regionContent.js';
import {DUNGEONS} from '../js/dungeons/dungeonData.js';
import {itemDefinition} from '../js/equipment/items.js';
import {worldWalkable} from '../js/world/chunkGeometry.js';
import {climateAt} from '../js/world/climate.js';

const all=[...TASK10_QUESTS,...TASK10_DAILY_QUESTS],npcs=[...NPCS,...TASK10_NPCS],types=['kill','explore','talk','collect','deliver','boss','dungeon'];
const npc=id=>npcs.find(n=>n.id===id);
test('Task10 additive catalog preserves104 live legacy quests and uses41 separate stable localized identities',()=>{
 assert.equal(LEGACY_QUESTS.length,104);assert.equal(LEGACY_RUNTIME_QUESTS.length,104);assert.deepEqual(LEGACY_RUNTIME_QUESTS.map(q=>q.id),LEGACY_QUESTS.map(q=>q.id));assert.equal(QUESTS.length,145);
 assert.equal(TASK10_QUESTS.length,33);assert.equal(TASK10_DAILY_QUESTS.length,8);assert.equal(new Set(all.map(q=>q.id)).size,41);
 assert.ok(Object.isFrozen(TASK10_QUESTS)&&Object.isFrozen(TASK10_DAILY_QUESTS));
 for(const q of all){assert.ok(!LEGACY_QUESTS.some(old=>old.id===q.id));assert.ok(Object.isFrozen(q));assert.ok(npc(q.npcId),q.id);assert.ok(types.includes(q.type));assert.ok(q.level>=1&&q.level<=56);assert.ok(Number.isSafeInteger(q.xp)&&q.xp>0);assert.ok(Number.isSafeInteger(q.gold)&&q.gold>0);assert.ok(q.required>=1);for(const lang of ['ru','en','es']){assert.ok(q.title[lang].length>7,q.id+'/'+lang);assert.ok(q.description[lang].length>40,q.id+'/'+lang);assert.ok(!/TODO:|placeholder|заглушка/i.test(q.description[lang]));}assert.equal(q.classId,undefined);assert.equal(q.allowedClasses,undefined);}
 assert.deepEqual([...new Set(TASK10_QUESTS.map(q=>q.type))].sort(),[...types].sort());
 assert.deepEqual([...new Set(TASK10_QUESTS.map(q=>q.region))].sort(),['ancient','desert','forest','north']);
});
test('every hunt references the actual stable species,camp,type,level and spawn population rather than removed prototypes',()=>{
 for(const q of all.filter(q=>q.type==='kill')){const c=getRegionContent(q.region),p=c.camps.find(p=>p.id===q.targetCampId);assert.ok(p,q.id);assert.equal(q.target,p.type);assert.equal(q.targetSpeciesId,p.speciesId);assert.equal(q.location.x,p.x);assert.equal(q.location.y,p.y);assert.ok(p.spawns.every(s=>s.speciesId===q.targetSpeciesId));assert.ok(q.required<=p.spawns.length);assert.ok(q.daily?p.level>=q.level&&p.level<=q.maxLevel:p.level===q.level);}
 const species=new Set(TASK10_QUESTS.filter(q=>q.type==='kill').map(q=>q.targetSpeciesId));assert.ok(species.has('desert-species-000')&&species.has('desert-species-001'));
 const city=TASK10_QUESTS.find(q=>q.id==='task10-city-webs'),volcano=TASK10_QUESTS.find(q=>q.id==='task10-ash-raiders'),marsh=TASK10_QUESTS.find(q=>q.id==='task10-marsh-armor'),twilight=TASK10_QUESTS.find(q=>q.id==='task10-twilight-shells');
 for(const [q,type]of [[city,'abandonedCity'],[volcano,'volcanic'],[marsh,'marsh'],[twilight,'mystic']])assert.equal(climateAt(getRegionContent(q.region),q.location.x,q.location.y).type,type,q.id);
});
test('dungeon,boss,talk and delivery references resolve to real entrances or residents with physically reachable objectives',()=>{
 for(const q of all){const c=getRegionContent(q.location.region);assert.ok(q.location.x>=0&&q.location.x<c.width&&q.location.y>=0&&q.location.y<c.height);
  let reachable=false;for(let r=0;r<=120&&!reachable;r+=20)for(let i=0;i<16&&!reachable;i++)reachable=worldWalkable(c,q.location.x+Math.cos(i*Math.PI/8)*r,q.location.y+Math.sin(i*Math.PI/8)*r,18);assert.ok(reachable,q.id+' at least one walkable approach inside130-unit objective radius');
  if(q.type==='dungeon'){const d=DUNGEONS.find(d=>d.id===q.target);assert.ok(d&&d.region==='desert');assert.equal(q.level,d.level);assert.equal(q.location.x,d.x);assert.equal(q.location.y,d.y);}
  if(q.type==='boss'){const b=c.bosses.find(b=>b.id===q.target);assert.ok(b,q.id);assert.equal(q.level,b.level);assert.equal(q.location.x,b.x);assert.equal(q.location.y,b.y);}
  if(['talk','deliver'].includes(q.type)){const target=npc(q.target);assert.ok(target,q.id);assert.equal(q.turnInNpcId,target.id);assert.equal(q.location.region,target.region);assert.equal(q.location.x,target.x);assert.equal(q.location.y,target.y);}
  if(['collect','deliver'].includes(q.type)){assert.ok(itemDefinition({id:q.itemId}));assert.ok(['wolfFang','wolfPelt'].includes(q.itemId),'only real collectible material drops');assert.equal(q.location.region,'forest');}
 }
 assert.equal(TASK10_QUESTS.filter(q=>q.type==='dungeon').length,5);assert.equal(TASK10_QUESTS.filter(q=>q.type==='boss').length,4);
 const giant=TASK10_QUESTS.find(q=>q.id==='task10-giant-oath');assert.equal(giant.itemId,undefined,'the boss trophy is retained by the player');
});
test('story dependencies are acyclic,reachable in level order,and preserve a five-dungeon desert sequence',()=>{
 const lookup=new Map(TASK10_QUESTS.map(q=>[q.id,q]));
 const walk=(q,path=[])=>{assert.ok(!path.includes(q.id),q.id+' cyclic dependency');for(const id of q.requires||[]){const prerequisite=lookup.get(id);assert.ok(prerequisite,id);assert.ok(prerequisite.level<=q.level,q.id+' lower-level prerequisite');walk(prerequisite,[...path,q.id]);}};
 for(const q of TASK10_QUESTS)walk(q);
 for(let i=14;i<=17;i++)assert.deepEqual(lookup.get('task10-clear-dungeon'+i).requires,['task10-clear-dungeon'+(i-1)]);
 assert.ok(TASK10_QUESTS.filter(q=>q.category==='story').length>=8);
});
test('daily tiers cover1–56 exactly and match ordinary objectives with exactly60percent moreXP,increasedgold,10HP/5MP',()=>{
 assert.equal(TASK10_DAILY_TIERS.length,8);
 for(let level=1;level<=56;level++){const tiers=TASK10_DAILY_TIERS.filter(t=>level>=t.minLevel&&level<=t.maxLevel);assert.equal(tiers.length,1);const tier=tiers[0],q=TASK10_DAILY_QUESTS.find(q=>q.dailyTierId===tier.id);assert.ok(q&&q.level===tier.minLevel&&q.maxLevel===tier.maxLevel);}
 let previousGold=0;for(const q of TASK10_DAILY_QUESTS){const ordinary=TASK10_QUESTS.find(p=>p.id===q.comparableQuestId);assert.ok(ordinary);for(const key of ['npcId','region','type','target','targetCampId','targetSpeciesId','required','location'])assert.deepEqual(q[key],ordinary[key],q.id+'/'+key);assert.equal(q.xp*5,ordinary.xp*8);assert.ok(q.gold>ordinary.gold&&q.gold>previousGold);previousGold=q.gold;assert.deepEqual(q.potionRewards,{hp:10,mp:5});assert.ok(npc(q.npcId).roles.includes('dailyGiver'));assert.equal(q.daily,true);assert.equal(q.requires,undefined);assert.ok(!/\d{4}-\d\d-\d\d/.test(q.id),'stable logical identity independent of UTC dates');}
});
