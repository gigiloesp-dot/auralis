import {text} from '../i18n/messages.js';
import {regionRoads,riverX} from '../world/chunkGeometry.js';
export class Minimap{
 constructor(scene){this.scene=scene;this.canvas=document.createElement('canvas');this.canvas.id='minimap';this.canvas.width=120;this.canvas.height=90;this.canvas.setAttribute('aria-label',text('minimap',scene.language));this.canvas.onclick=()=>scene.mapPanel.show();this.canvas.style.pointerEvents='auto';document.body.append(this.canvas);this.context=this.canvas.getContext('2d');}
 update(){
  const c=this.context,s=this.scene,h=s.hero,content=s.regionContent;if(!c)return;
  c.fillStyle=content.id==='north'?'#344b59':content.id==='ancient'?'#393a2a':'#10291e';c.fillRect(0,0,120,90);
  const xy=p=>({x:60+(p.x-h.x)/15,y:45+(p.y-h.y)/15});
  if(content.dungeon){c.fillStyle='#74705a';for(const rect of content.walkableRects||[]){const p=xy(rect);c.fillRect(p.x,p.y,rect.width/15,rect.height/15);}}
  else{
   if(content.river!==false){c.strokeStyle='#4b8cad';c.lineWidth=(content.river?.halfWidth||24)*2/15;c.beginPath();for(let y=h.y-750;y<h.y+750;y+=40){const p=xy({x:riverX(content,y),y});if(y===h.y-750)c.moveTo(p.x,p.y);else c.lineTo(p.x,p.y);}c.stroke();}
   c.strokeStyle='#a89569';for(const road of regionRoads(content)){const a=xy(road.from),b=xy(road.to);c.lineWidth=Math.max(1,road.width/15);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}
  }
  const point=(p,r,color)=>{const at=xy(p);if(at.x<0||at.x>120||at.y<0||at.y>90)return;c.fillStyle=color;c.beginPath();c.arc(at.x,at.y,r,0,Math.PI*2);c.fill();};
  for(const p of content.camps||[])point(p,2,'#945e48');
  for(const p of content.landmarks||[])point(p,3,'#c6c5a1');
  for(const p of content.bosses||[])point(p,3.5,'#df4e7b');
  for(const p of content.towns||[])point(p.spawn,4,'#91d6a2');
  for(const p of content.portals||[])point(p,4,'#72ccdd');
  for(const p of content.dungeons||[])point(p,4,'#d3a9ff');
  for(const m of s.monsters.monsters)if(m.alive)point(m,m.kind.boss?3:2,'#e17d65');
  point(h,3,'#fff3ad');
 }
 destroy(){this.canvas.remove();}
}
