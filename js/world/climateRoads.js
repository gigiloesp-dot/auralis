import {climateAt} from './climate.js';
import {DUNGEONS} from '../dungeons/dungeonData.js';
const segmentDistance=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-a.x-dx*t,p.y-a.y-dy*t);};
// Streets stop short of existing encounters/entrances, whose coordinates are a
// save/quest contract. No world-sized collection of buildings is instantiated.
export function cityPaths(content){
 if(content.id!=='forest'||!content.climateRevision)return [];
 const sites=[...(content.camps||[]).map(c=>({...c,clearance:Math.max(250,c.radius+65)})),...(content.bosses||[]).map(p=>({...p,clearance:260})),...(content.towns||[]).map(p=>({...p,clearance:500})),...(content.portals||[]).map(p=>({...p,clearance:270})),...DUNGEONS.filter(d=>d.region==='forest').map(p=>({...p,clearance:270}))],paths=[];
 const append=(id,points)=>{for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};if(climateAt(content,mid.x,mid.y).type!=='abandonedCity'||sites.some(s=>segmentDistance(s,a,b)<s.clearance))continue;paths.push({id:id+'-'+i,width:50,secondary:true,curved:true,climateStreet:true,points:[a,mid,b]});}};
 for(let i=0;i<4;i++){const x=content.width*(.75+i*.065);append('forest-city-avenue-'+i,Array.from({length:22},(_,j)=>({x:x+Math.sin(j*.6+i)*65,y:500+j*800})));}
 for(let i=0;i<6;i++){const y=1700+i*2900;append('forest-city-crossing-'+i,Array.from({length:9},(_,j)=>({x:content.width*.70+j*600,y:y+Math.sin(j*.7+i)*70})));}
 return paths;
}
