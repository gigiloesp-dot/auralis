import test from 'node:test';
import assert from 'node:assert/strict';
import {questMapTargets} from '../js/quests/questTargets.js';
import {createCharacter} from '../js/characters/Character.js';
import {getRegionContent} from '../js/world/regionContent.js';
import {acceptQuest,recordKill,claimQuest} from '../js/quests/quests.js';
import {NPCS} from '../js/npc/npcData.js';
test('quest map switches from an actual hunting camp to the actual reward NPC',()=>{
 const hero=createCharacter(),content=getRegionContent('forest');assert.deepEqual(questMapTargets(hero,content),[]);assert.ok(acceptQuest(hero));
 let target=questMapTargets(hero,content,'en')[0];assert.equal(target.ready,false);assert.deepEqual([target.x,target.y],[1500,1400]);assert.equal(target.name,'A safer road');
 for(let i=0;i<5;i++)recordKill(hero,'forestWolf');target=questMapTargets(hero,content)[0];const mira=NPCS.find(n=>n.id==='mira');assert.deepEqual([target.x,target.y],[mira.x,mira.y]);assert.equal(target.ready,true);assert.ok(claimQuest(hero).ok);assert.deepEqual(questMapTargets(hero,content),[]);
});
test('cross-region resource objectives are shown on their actual target region only',()=>{
 const hero=createCharacter({level:42,quests:{north_supplies_0:{state:'active',progress:0}}});assert.equal(questMapTargets(hero,getRegionContent('north')).length,0);const targets=questMapTargets(hero,getRegionContent('forest'),'es');assert.equal(targets.length,1);assert.deepEqual([targets[0].x,targets[0].y],[1500,1400]);
});
