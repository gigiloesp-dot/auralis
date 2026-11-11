const CELL=512;
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export class MonsterStream{
 constructor(content,hero,create,remove){
  this.hero=hero;this.create=create;this.remove=remove;this.cells=new Map();this.loaded=new Map();this.content=content;
  this.descriptors=[...content.camps.flatMap(c=>c.spawns.map(s=>({...s,campId:c.id}))),...(content.bosses||[])];
  for(const d of this.descriptors){const key=Math.floor(d.x/CELL)+','+Math.floor(d.y/CELL);if(!this.cells.has(key))this.cells.set(key,[]);this.cells.get(key).push(d);}
 }
 update(){
  for(const [id,m] of this.loaded)if(distance(m,this.hero)>700&&distance({x:m.homeX,y:m.homeY},this.hero)>700){this.remove(m);this.loaded.delete(id);}
  const cx=Math.floor(this.hero.x/CELL),cy=Math.floor(this.hero.y/CELL);
  for(let x=cx-1;x<=cx+1;x++)for(let y=cy-1;y<=cy+1;y++)for(const d of this.cells.get(x+','+y)||[]){
   if(!this.loaded.has(d.id)&&distance(d,this.hero)<=500)this.loaded.set(d.id,this.create(d));
  }
 }
 get diagnostics(){return {totalDescriptors:this.descriptors.length,loadedMonsters:this.loaded.size,spatialCells:this.cells.size};}
 destroy(){for(const m of this.loaded.values())this.remove(m);this.loaded.clear();}
}
