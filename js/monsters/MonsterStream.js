import {project,unproject} from '../world/projection.js';
const CELL=512;
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
// Monster residency follows the projected camera footprint. The environment
// keeps its existing, independent chunk policy. Hysteresis avoids edge churn.
export const MONSTER_STREAM_POLICY=Object.freeze({loadRadius:350,unloadRadius:500,loadPadding:96,unloadPadding:192});
const extents=m=>(m.bossType||m.kind?.boss)?{half:160,tall:320}:{half:72,tall:160};
export class MonsterStream{
 constructor(content,hero,create,remove,options={}){
  this.hero=hero;this.create=create;this.remove=remove;this.options=options;this.cells=new Map();this.loaded=new Map();this.content=content;
  this.project=options.project||((x,y)=>project(x,y,content.height||0));
  this.descriptors=[...content.camps.flatMap(c=>c.spawns.map(s=>({...s,campId:c.id,campX:c.x,campY:c.y,campRadius:c.radius}))),...(content.bosses||[])];
  this.created=0;this.removed=0;
  for(const d of this.descriptors){const key=Math.floor(d.x/CELL)+','+Math.floor(d.y/CELL);if(!this.cells.has(key))this.cells.set(key,[]);this.cells.get(key).push(d);}
 }
 view(){const v=this.options.viewport?.();return v&&[v.x,v.y,v.width,v.height].every(Number.isFinite)&&v.width>0&&v.height>0?v:null;}
 inView(m,padding=0,view=this.currentView||this.view()){
  if(!view)return false;
  const p=this.project(m.x,m.y),{half,tall}=extents(m);
  return p.x>=view.x-half-padding&&p.x<=view.x+view.width+half+padding&&p.y>=view.y-padding&&p.y<=view.y+view.height+tall+padding;
 }
 hot(m){return m.alive!==false&&!!this.options.hot?.(m);}
 shouldActivate(m){if(!this.currentView&&!this.view())return this.hot(m)||distance(m,this.hero)<=700;return this.hot(m)||distance(m,this.hero)<=MONSTER_STREAM_POLICY.loadRadius||this.inView(m,16);}
 cellRange(view){
  if(!view){const cx=Math.floor(this.hero.x/CELL),cy=Math.floor(this.hero.y/CELL);return {minX:cx-1,maxX:cx+1,minY:cy-1,maxY:cy+1};}
  const pad=MONSTER_STREAM_POLICY.loadPadding,origin=this.project(this.hero.x,this.hero.y),corners=[];
  for(const x of [view.x-pad-160,view.x+view.width+pad+160])for(const y of [view.y-pad,view.y+view.height+pad+320]){const d=unproject(x-origin.x,y-origin.y);corners.push({x:this.hero.x+d.x,y:this.hero.y+d.y});}
  return {minX:Math.floor(Math.min(this.hero.x-350,...corners.map(p=>p.x))/CELL),maxX:Math.floor(Math.max(this.hero.x+350,...corners.map(p=>p.x))/CELL),minY:Math.floor(Math.min(this.hero.y-350,...corners.map(p=>p.y))/CELL),maxY:Math.floor(Math.max(this.hero.y+350,...corners.map(p=>p.y))/CELL)};
 }
 update(){
  const view=this.currentView=this.view(),policy=MONSTER_STREAM_POLICY;
  for(const [id,m]of this.loaded){
   const home={x:m.homeX,y:m.homeY,bossType:m.bossType,kind:m.kind},keep=view?(distance(m,this.hero)<=policy.unloadRadius||distance(home,this.hero)<=policy.unloadRadius||this.inView(m,policy.unloadPadding,view)||this.inView(home,policy.unloadPadding,view)):distance(m,this.hero)<=700||distance(home,this.hero)<=700;
   if(!keep&&!this.hot(m)){this.remove(m);this.loaded.delete(id);this.removed++;}
  }
  const bounds=this.cellRange(view);
  for(let x=bounds.minX;x<=bounds.maxX;x++)for(let y=bounds.minY;y<=bounds.maxY;y++)for(const d of this.cells.get(x+','+y)||[]){
   const wanted=view?(distance(d,this.hero)<=policy.loadRadius||this.inView(d,policy.loadPadding,view)):distance(d,this.hero)<=500;
   if(!this.loaded.has(d.id)&&wanted){this.loaded.set(d.id,this.create(d));this.created++;}
  }
 }
 get diagnostics(){return {totalDescriptors:this.descriptors.length,loadedMonsters:this.loaded.size,spatialCells:this.cells.size,monsterCreates:this.created,monsterRemoves:this.removed,monsterStreamMode:this.currentView?'viewport':'radial-fallback'};}
 destroy(){for(const m of this.loaded.values())this.remove(m);this.loaded.clear();}
}
