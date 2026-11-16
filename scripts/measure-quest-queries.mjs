// Reproducible CPU sample of the real quest/indicator/update entry points.
// This is not a browser/physical AndroidFPS benchmark.
import fs from 'node:fs';import crypto from 'node:crypto';import {performance} from 'node:perf_hooks';
import {createCharacter} from '../js/characters/Character.js';
import {QUESTS,LEGACY_RUNTIME_QUESTS,questProgress,updateQuestProgress,activeQuestCount} from '../js/quests/quests.js';
import {npcQuestIndicator} from '../js/quests/npcQuestIndicator.js';import {NPCS} from '../js/npc/npcData.js';
const measure=(name,definitions)=>{
 const hero=createCharacter({level:56,quests:Object.fromEntries(definitions.map(q=>[q.id,{state:'active',progress:0}]))}),scene={hero};
 const work=()=>{for(let i=0;i<2;i++)for(const q of QUESTS)questProgress(hero,q.id);for(const n of NPCS.slice(0,5))npcQuestIndicator(hero,n.id);updateQuestProgress(scene);};
 for(let i=0;i<50;i++)work();global.gc?.();const heapBefore=process.memoryUsage().heapUsed,times=[];
 for(let i=0;i<500;i++){const start=performance.now();work();times.push(performance.now()-start);}global.gc?.();times.sort((a,b)=>a-b);
 return{name,accepted:definitions.length,active:activeQuestCount(hero),samples:times.length,medianMs:times[250],p95Ms:times[475],maxMs:times.at(-1),meanMs:times.reduce((a,b)=>a+b,0)/times.length,gcHeapDelta:global.gc?process.memoryUsage().heapUsed-heapBefore:null};
};
const result={node:process.versions.node,quests:QUESTS.length,scope:'Node CPU: two145-quest views,five nearbyNPC indicators and updateQuestProgress per sample. Not full browser or AndroidFPS.',results:[measure('typical6',LEGACY_RUNTIME_QUESTS.filter(q=>q.type==='kill').slice(0,6)),measure('legacyOverflow104',LEGACY_RUNTIME_QUESTS)],sourceSha256:Object.fromEntries(['js/quests/quests.js','js/quests/dailyQuests.js','js/quests/npcQuestIndicator.js'].map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')]))};
fs.mkdirSync('work/task10',{recursive:true});fs.writeFileSync('work/task10/quest-query-performance.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
