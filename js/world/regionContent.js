// Persistent descriptors only: these counts do not imply that the runtime has
// switched from its legacy preview to full-region streaming yet.
import {REGIONS} from './worldData.js';
import {getRegionTowns} from './towns.js';
import {getRegionNpcs} from '../npc/npcData.js';
const CONFIG={forest:{camps:94,monsters:425,types:['forestWolf','wildBoar','forestRaider','bear','spider','skeleton']},north:{camps:85,monsters:380,types:['iceWolf','frostGolem','skeleton','forestRaider']},ancient:{camps:75,monsters:340,types:['ancientSentinel','arcaneWisp','skeleton','spider']}};
const PORTALS={forest:[{id:'forest-north',x:11200,y:10800,toRegion:'north',toX:1500,toY:1900}],north:[{id:'north-forest',x:1500,y:1600,toRegion:'forest',toX:11200,toY:10950},{id:'north-ancient',x:12500,y:12600,toRegion:'ancient',toX:1600,toY:1900}],ancient:[{id:'ancient-north',x:1600,y:1600,toRegion:'north',toX:12500,toY:12750}]};
const seedFor=id=>{let n=0;for(const char of id)n=(Math.imul(n,31)+char.charCodeAt(0))>>>0;return ()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};};
const segmentDistance=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,d=dx*dx+dy*dy,t=d?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/d)):0;return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);};
const cache=new Map();
export function getRegionContent(id='forest'){
 if(!Object.hasOwn(REGIONS,id))throw new RangeError('Unknown region: '+id);
 if(cache.has(id))return cache.get(id);
 const region=REGIONS[id],config=CONFIG[id],towns=getRegionTowns(id),npcs=getRegionNpcs(id),portals=PORTALS[id].map(p=>({...p,region:id}));
 const roads=[];const anchors=[...towns.map(t=>t.spawn),...portals];
 for(let i=1;i<anchors.length;i++)roads.push({id:id+'-road-'+i,from:anchors[i-1],to:anchors[i],width:90});
 const random=seedFor(id),occupied=[];
 const position=()=>{for(let tries=0;tries<20000;tries++){
  const p={x:Math.round(450+random()*(region.width-900)),y:Math.round(450+random()*(region.height-900))};
  if(towns.some(t=>Math.hypot(p.x-t.x,p.y-t.y)<420)||portals.some(t=>Math.hypot(p.x-t.x,p.y-t.y)<260)||occupied.some(t=>Math.hypot(p.x-t.x,p.y-t.y)<310))continue;
  if(roads.some(r=>segmentDistance(p,r.from,r.to)<180)||Math.abs(p.x-(region.width*.58+Math.sin(p.y/850)*48))<170)continue;
  occupied.push(p);return p;
 }throw new Error('Unable to place region encounter '+id);};
 const camps=[];let remaining=config.monsters;
 if(id==='forest'){
  const points=[[1370,1240],[1450,1320],[1530,1220],[1320,1430],[1600,1450],[1770,1250],[1770,1600],[1430,1660]];
  camps.push({id:'forest-starter-wolves',region:id,type:'forestWolf',level:1,x:1500,y:1400,spawns:points.map(([x,y],i)=>({id:'forest-starter-wolf-'+i,type:'forestWolf',level:1,x,y}))});occupied.push({x:1500,y:1400});remaining-=8;
 }
 while(camps.length<config.camps){
  const index=camps.length,slots=config.camps-index,count=remaining>slots*4?5:4,p=position();
  const fraction=Math.min(1,Math.hypot(p.x-region.spawn.x,p.y-region.spawn.y)/Math.hypot(region.width,region.height));
  const level=Math.min(region.maxLevel,region.minLevel+Math.floor(fraction*(region.maxLevel-region.minLevel+1)));
  const type=config.types[Math.min(config.types.length-1,Math.floor(fraction*config.types.length))],campId=id+'-camp-'+index;
  const spawns=Array.from({length:count},(_,i)=>{const angle=i/count*Math.PI*2+.2;return {id:campId+'-mob-'+i,type,level,x:Math.round(p.x+Math.cos(angle)*42),y:Math.round(p.y+Math.sin(angle)*42)};});
  camps.push({id:campId,region:id,type,level,...p,spawns});remaining-=count;
 }
 if(remaining!==0)throw new Error('Incorrect monster budget');
 const bosses=Array.from({length:6},(_,i)=>{const p=position(),bossType=i<4?'mini':'world',level=Math.min(region.maxLevel,region.minLevel+4+i*3),name=id==='forest'?'Страж долины':id==='north'?'Владыка мороза':'Хранитель руин';return {id:id+'-'+bossType+'-'+i,region:id,type:id==='forest'?'forestGuardian':id==='north'?'frostGolem':'ancientSentinel',bossType,level,...p,patterns:i%2?['charge','slam']:['slam','volley'],names:{ru:name+' '+(i+1),en:'Guardian '+(i+1),es:'Guardián '+(i+1)}};});
 const content={...region,towns,npcs,camps,bosses,portals,roads,landmarks:[]};cache.set(id,content);return content;
}
