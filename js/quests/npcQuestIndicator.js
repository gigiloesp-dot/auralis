import {QUESTS,questProgress} from './quests.js';
const indexes=new WeakMap();
function index(quests){
 if(indexes.has(quests))return indexes.get(quests);
 const map=new Map();for(const q of quests)for(const id of new Set([q.npcId,q.turnInNpcId].filter(Boolean))){if(!map.has(id))map.set(id,[]);map.get(id).push(q);}indexes.set(quests,map);return map;
}
// No quest/save mutation. Completion > availability > progress; ordinary wins
// ties against daily. All candidates stay accessible in the existing NPC panel.
export function npcQuestIndicator(hero,npcId,{quests=QUESTS,progress=questProgress}={}){
 const candidates=[];
 for(const q of index(quests).get(npcId)||[]){
  let state=progress(hero,q.id)?.state;if(!['available','active','completed'].includes(state))continue;
  if(state==='available'&&q.npcId!==npcId)continue;
  if(state==='completed'&&(q.turnInNpcId||q.npcId)!==npcId)state='active';
  const daily=q.daily===true||q.repeat==='daily',rank={completed:3,available:2,active:1}[state];candidates.push({id:q.id,state,daily,rank});
 }
 candidates.sort((a,b)=>b.rank-a.rank||Number(a.daily)-Number(b.daily)||a.id.localeCompare(b.id));
 const best=candidates[0];if(!best)return null;
 return {symbol:best.state==='available'?'!':'?',state:best.state,daily:best.daily,color:best.daily?(best.state==='completed'?'#a2ff70':'#65dc62'):(best.state==='active'?'#b5b5b5':'#ffd34f'),alpha:best.state==='active'?(best.daily?.45:.5):1,questIds:candidates.map(c=>c.id)};
}
