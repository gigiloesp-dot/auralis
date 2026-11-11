import {text} from '../i18n/messages.js';
export class Minimap{
 constructor(scene,size){this.scene=scene;this.size=size;this.canvas=document.createElement('canvas');this.canvas.id='minimap';this.canvas.width=120;this.canvas.height=90;this.canvas.setAttribute('aria-label',text('minimap',scene.language));document.body.append(this.canvas);this.context=this.canvas.getContext('2d');}
 update(){const c=this.context;if(!c)return;c.fillStyle='#10291ee8';c.fillRect(0,0,120,90);const point=(x,y,r,color)=>{c.fillStyle=color;c.beginPath();c.arc(x/this.size*120,y/this.size*90,r,0,Math.PI*2);c.fill();};c.strokeStyle='#b4a67977';c.lineWidth=3;c.beginPath();c.moveTo(0,1150/this.size*90);c.lineTo(120,1150/this.size*90);c.stroke();point(1030,1140,5,'#91d6a2');point(935,1080,2,'#ffcf72');for(const m of this.scene.monsters.monsters)if(m.alive)point(m.x,m.y,2,'#e17d65');point(this.scene.hero.x,this.scene.hero.y,3,'#fff3ad');}
 destroy(){this.canvas.remove();}
}
