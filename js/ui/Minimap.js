import {text} from '../i18n/messages.js';
export class Minimap{
 constructor(scene){this.scene=scene;this.canvas=document.createElement('canvas');this.canvas.id='minimap';this.canvas.width=120;this.canvas.height=90;this.canvas.setAttribute('aria-label',text('minimap',scene.language));this.canvas.onclick=()=>scene.mapPanel.show();this.canvas.style.pointerEvents='auto';document.body.append(this.canvas);this.context=this.canvas.getContext('2d');}
 update(){const c=this.context,s=this.scene,h=s.hero,content=s.regionContent;if(!c)return;c.fillStyle='#10291ef0';c.fillRect(0,0,120,90);const point=(p,r,color)=>{const x=60+(p.x-h.x)/15,y=45+(p.y-h.y)/15;if(x<0||x>120||y<0||y>90)return;c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();};for(const p of content.towns||[])point(p.spawn,4,'#91d6a2');for(const p of content.portals||[])point(p,4,'#72ccdd');for(const p of content.dungeons||[])point(p,4,'#d3a9ff');for(const m of s.monsters.monsters)if(m.alive)point(m,m.kind.boss?3:2,'#e17d65');point(h,3,'#fff3ad');}
 destroy(){this.canvas.remove();}
}
