import test from 'node:test';import assert from 'node:assert/strict';
import {npcQuestIndicator} from '../js/quests/npcQuestIndicator.js';
import {QUESTS,LEGACY_QUESTS,acceptQuest,recordKill,claimQuest,questProgress} from '../js/quests/quests.js';
import {createCharacter} from '../js/characters/Character.js';import {Save} from '../js/systems/save.js';
import {NpcQuestIndicator} from '../js/characters/NpcQuestIndicator.js';
const resolve=(quests,states,id='giver')=>npcQuestIndicator({},id,{quests,progress:(_,id)=>({state:states[id]||'locked'})});
test('ordinary available/progress/reward styles and priority retain all candidates',()=>{
 const quests=['a','b','c'].map(id=>({id,npcId:'giver'}));
 for(const [states,symbol,state,color,alpha] of [[{a:'available'},'!','available','#ffd34f',1],[{a:'active'},'?','active','#b5b5b5',.5],[{a:'completed'},'?','completed','#ffd34f',1]]){const x=resolve(quests,states);assert.deepEqual([x.symbol,x.state,x.color,x.alpha],[symbol,state,color,alpha]);}
 assert.equal(resolve(quests,{a:'active',b:'available'}).symbol,'!');const best=resolve(quests,{a:'active',b:'available',c:'completed'});assert.equal(best.state,'completed');assert.equal(best.questIds.length,3);
 assert.equal(resolve(quests,{a:'locked',b:'claimed'}),null);
});
test('daily markers use green styles and Task10 daily-first mixed priority without dropping ordinary candidates',()=>{
 const quests=[{id:'daily',npcId:'giver',daily:true},{id:'normal',npcId:'giver'}];
 for(const state of ['available','active','completed']){const x=resolve(quests,{daily:state});assert.equal(x.daily,true);assert.equal(x.alpha,state==='active'?.45:1);assert.equal(x.symbol,state==='available'?'!':'?');assert.equal(x.color,state==='completed'?'#a2ff70':'#65dc62');}
 for(const state of ['available','active','completed']){const chosen=resolve(quests,{daily:state,normal:state});assert.equal(chosen.daily,true);assert.deepEqual(new Set(chosen.questIds),new Set(['daily','normal']));}
 assert.equal(resolve(quests,{daily:'completed',normal:'available'}).daily,true);assert.equal(resolve(quests,{daily:'available',normal:'active'}).daily,true);assert.equal(resolve(quests,{daily:'active',normal:'available'}).daily,true);
});
test('delivery reward marker appears only at actual recipient, locked receiver stays hidden',()=>{
 const quests=[{id:'q',npcId:'giver',turnInNpcId:'receiver'}];assert.equal(resolve(quests,{q:'available'},'receiver'),null);
 assert.equal(resolve(quests,{q:'completed'},'receiver').state,'completed');assert.equal(resolve(quests,{q:'completed'}).state,'active');assert.equal(resolve(quests,{q:'claimed'},'receiver'),null);
});
test('real catalogue responds to acceptance, kills, claiming, level/story gates and save reload without mutation',()=>{
 const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
 const hero=createCharacter();assert.equal(npcQuestIndicator(hero,'mira').symbol,'!');acceptQuest(hero);assert.equal(npcQuestIndicator(hero,'mira').state,'available','another available quest must remain visible');for(let i=0;i<5;i++)recordKill(hero,'wolf');assert.equal(npcQuestIndicator(hero,'mira').state,'completed');assert.equal(claimQuest(hero).ok,true);assert.equal(hero.quests.forestWolves.state,'claimed');
 const before=structuredClone(hero);npcQuestIndicator(hero,'mira');assert.deepEqual(hero,before);Save.write(hero,1);const restored=Save.load(1);assert.deepEqual(npcQuestIndicator(restored,'mira'),npcQuestIndicator(hero,'mira'));
 const gated=QUESTS.find(q=>q.level>1&&!q.requires?.length&&q.npcId!=='mira');assert.ok(gated);if(gated){assert.equal(questProgress(createCharacter(),gated.id).state,'locked');const high=createCharacter({level:42});assert.equal(questProgress(high,gated.id).state,'available');assert.ok(npcQuestIndicator(high,gated.npcId));}
 const story=createCharacter({level:42});assert.equal(questProgress(story,'forestFangs').state,'locked');assert.ok(!npcQuestIndicator(story,'mira')?.questIds.includes('forestFangs'));story.quests.forestWolves={state:'claimed',progress:5};assert.equal(questProgress(story,'forestFangs').state,'available');assert.ok(npcQuestIndicator(story,'mira').questIds.includes('forestFangs'));
 assert.equal(LEGACY_QUESTS.filter(q=>q.daily||q.repeat==='daily').length,0,'release19 identities remain free of newly invented daily metadata');assert.equal(QUESTS.filter(q=>q.daily||q.repeat==='daily').length,8,'Task10 adds exactly the eight approved level tiers');
});
test('one streamed label changes only when style changes and releases on unload',()=>{
 const calls=[];const label={setOrigin(){return this;},setVisible(v){calls.push(['visible',v]);return this;},setText(v){calls.push(['text',v]);return this;},setColor(){return this;},setAlpha(){return this;},destroy(){calls.push(['destroy']);}};
 const hero=createCharacter(),scene={hero,add:{text:()=>label}},root={add:n=>assert.equal(n,label)},indicator=new NpcQuestIndicator(scene,root,{id:'mira'},{quests:QUESTS.filter(q=>q.id==='forestWolves')});const n=calls.length;indicator.update(hero);assert.equal(calls.length,n);acceptQuest(hero);indicator.update(hero);assert.equal(indicator.value.state,'active');indicator.destroy();assert.equal(calls.at(-1)[0],'destroy');
});
