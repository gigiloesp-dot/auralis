import {text} from '../i18n/messages.js';
import {regionRoads,riverX} from '../world/chunkGeometry.js';
import {climateAt} from '../world/climate.js';
import {mapPlaces,mapName,currentMapArea,nearbyMapMonsters} from '../world/mapPresentation.js';
const colors={town:'#91d6a2',landmark:'#c6c5a1',portal:'#72ccdd',dungeon:'#d3a9ff',receiver:'#8ad5c2',teleporter:'#72ccdd',exit:'#d3a9ff'};
export class Minimap{
 constructor(scene){this.scene=scene;this.canvas=document.createElement('canvas');this.canvas.id='minimap';this.canvas.width=120;this.canvas.height=120;this.canvas.setAttribute('aria-label',text('minimap',scene.language));this.canvas.onclick=()=>scene.mapPanel.show();this.canvas.style.pointerEvents='auto';document.body.append(this.canvas);this.context=this.canvas.getContext('2d');}
 update(){
  const c=this.context,s=this.scene,h=s.hero,content=s.regionContent;if(!c)return;
  c.clearRect(0,0,120,120);c.save();c.beginPath();c.arc(60,60,59,0,Math.PI*2);c.clip();
  const ground=climateAt(content,h.x,h.y)?.color||content.palette?.ground||0x10291e;c.fillStyle='#'+ground.toString(16).padStart(6,'0');c.fillRect(0,0,120,120);
  const xy=p=>({x:60+(p.x-h.x)/15,y:60+(p.y-h.y)/15});
  if(content.dungeon){c.fillStyle='#74705a';for(const rect of content.walkableRects||[]){const p=xy(rect);c.fillRect(p.x,p.y,rect.width/15,rect.height/15);}}
  else if(content.river!==false){c.strokeStyle='#4b8cad';c.lineWidth=(content.river?.halfWidth||24)*2/15;c.beginPath();for(let y=h.y-900;y<=h.y+900;y+=40){const p=xy({x:riverX(content,y),y});if(y===h.y-900)c.moveTo(p.x,p.y);else c.lineTo(p.x,p.y);}c.stroke();}
  c.strokeStyle='#a89569';for(const road of regionRoads(content)){const a=xy(road.from),b=xy(road.to);if(Math.max(a.x,b.x)<0||Math.min(a.x,b.x)>120||Math.max(a.y,b.y)<0||Math.min(a.y,b.y)>120)continue;c.lineWidth=Math.max(1,road.width/15);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}
  const point=(p,r,color)=>{const at=xy(p);if(Math.hypot(at.x-60,at.y-60)>61+r)return;c.fillStyle=color;c.beginPath();c.arc(at.x,at.y,r,0,Math.PI*2);c.fill();};
  const places=mapPlaces(content);for(const p of places)point(p,p.mapKind==='landmark'?3:4,colors[p.mapKind]);
  const enemies=nearbyMapMonsters(h,s.monsters?.monsters);for(const m of enemies)point(m,m.kind?.boss?3:2,'#e17d65');
  // Expose the exact drawn identifiers for accessibility and automated QA;
  // neither camps nor unloaded descriptors are discoverable on either map.
  this.canvas.dataset.monsterIds=JSON.stringify(enemies.map(m=>m.id));this.canvas.dataset.placeIds=JSON.stringify(places.map(p=>p.id));
  // Label the nearest visible settlement separately from the current area.
  const town=places.filter(p=>p.mapKind==='town'&&Math.hypot(p.x-h.x,p.y-h.y)<700).sort((a,b)=>Math.hypot(a.x-h.x,a.y-h.y)-Math.hypot(b.x-h.x,b.y-h.y))[0];
  if(town){const at=xy(town),name=mapName(town,s.language),label=name.length>18?name.slice(0,17)+'…':name,y=at.y<=65?42:80;c.save();c.font='9px system-ui';c.textAlign='center';c.lineWidth=2.5;c.strokeStyle='#21180fe8';c.fillStyle='#fff0c9';c.strokeText(label,60,y,100);c.fillText(label,60,y,100);c.restore();this.canvas.dataset.town=name;}else delete this.canvas.dataset.town;
  const area=currentMapArea(content,h,s.language);this.canvas.dataset.area=area;this.canvas.setAttribute('aria-label',text('minimap',s.language)+' · '+area);
  c.save();c.font='9px system-ui';c.textAlign='center';c.textBaseline='bottom';c.lineWidth=2.5;c.strokeStyle='#21180fe8';c.fillStyle='#fff0c9';const short=area.length>25?area.slice(0,24)+'…':area;c.strokeText(short,60,97,86);c.fillText(short,60,97,86);c.restore();
  // Player arrow points in the last movement direction; the minimap stays north-up.
  const angle=Number.isFinite(s.facing)?s.facing:-Math.PI/2;c.save();c.translate(60,60);c.rotate(angle);c.shadowColor='#062b35';c.shadowBlur=3;c.fillStyle='#34edeb';c.strokeStyle='#072e3c';c.lineWidth=1.7;c.beginPath();c.moveTo(9,0);c.lineTo(-6,-5.5);c.lineTo(-3,0);c.lineTo(-6,5.5);c.closePath();c.fill();c.stroke();c.restore();c.restore();
 }
 destroy(){this.canvas.remove();}
}
