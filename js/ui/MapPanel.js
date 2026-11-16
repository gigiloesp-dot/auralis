import {questMapTargets} from '../quests/questTargets.js';
import {questDefinition} from '../quests/quests.js';
import {regionRoads,riverX} from '../world/chunkGeometry.js';
import {mapPlaces,mapName,mapAreaLabels,visibleQuestMapTargets} from '../world/mapPresentation.js';
import {RegionMapArt,mapPoint} from './RegionMapArt.js';
const labels={ru:{title:'Карта региона',open:'Карта',close:'Закрыть',town:'Поселение',portal:'Переход',arrival:'Прибытие',hidden:'Место охоты не отмечается на карте'},en:{title:'Region map',open:'Map',close:'Close',town:'Settlement',portal:'Passage',arrival:'Arrival',hidden:'Hunting locations are not marked on the map'},es:{title:'Mapa de la región',open:'Mapa',close:'Cerrar',town:'Poblado',portal:'Paso',arrival:'Llegada',hidden:'Las zonas de caza no se marcan en el mapa'}};
const ns='http://www.w3.org/2000/svg';
const create=(tag,attrs={},parent)=>{const n=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,String(v));parent?.append(n);return n;};
export class MapPanel{
 constructor(scene){this.scene=scene;this.opened=false;this.button=document.createElement('button');this.button.className='map-open';this.button.type='button';this.button.textContent=(labels[scene.language]||labels.ru).open;this.button.onclick=()=>this.opened?this.close():this.show();document.querySelector('.rpg-toolbar').append(this.button);this.root=document.createElement('section');this.root.className='world-map';this.root.hidden=true;this.root.setAttribute('role','dialog');this.root.setAttribute('aria-modal','true');document.body.append(this.root);this.escape=e=>{if(e.key==='Escape')this.close();};document.addEventListener('keydown',this.escape);
  this.onUpdate=now=>{if(!this.opened||now-(this.lastUpdate||-Infinity)<100)return;this.lastUpdate=now;if(this.stateKey()!==this.renderedKey)this.render();else this.updatePlayer();};scene.events.on('update',this.onUpdate);
 }
 stateKey(){const s=this.scene,v=visualViewport;return s.regionContent.id+'|'+s.language+'|'+Math.round(v?.width||innerWidth)+'x'+Math.round(v?.height||innerHeight)+'|'+JSON.stringify(s.hero.quests||{});}
 show(){this.scene.closePanels(this);this.opened=true;this.root.hidden=false;this.render();}
 render(){
  this.art?.destroy();const s=this.scene,c=s.regionContent,t=labels[s.language]||labels.ru;this.renderedKey=this.stateKey();this.root.replaceChildren();this.root.setAttribute('aria-label',t.title+' · '+mapName(c,s.language));
  const canvas=document.createElement('canvas');canvas.className='region-map-art';canvas.setAttribute('aria-hidden','true');this.root.append(canvas);this.art=new RegionMapArt(canvas);const W=this.root.clientWidth,H=this.root.clientHeight,sx=W/c.width,sy=H/c.height;this.width=W;this.height=H;this.scales={sx,sy};this.art.load(c,W,H);
  const header=document.createElement('header'),title=document.createElement('h2'),close=document.createElement('button');title.textContent=mapName(c,s.language)+(c.minLevel?` · ${c.minLevel}–${c.maxLevel}`:'');close.type='button';close.textContent='×';close.setAttribute('aria-label',t.close);close.title=t.close;close.onclick=()=>this.close();header.append(title,close);this.root.append(header);
  const svg=create('svg',{viewBox:`0 0 ${W} ${H}`,'aria-label':t.title},this.root),geography=create('g',{transform:`scale(${sx} ${sy})`},svg);this.svg=svg;
  if(c.dungeon){create('rect',{width:c.width,height:c.height,fill:'#211d21'},geography);for(const floor of c.walkableRects||[])create('rect',{...floor,fill:'#74705a','data-map-kind':'floor'},geography);}
  // The raster and every vector share this exact affine world projection.
  if(!c.dungeon&&c.river!==false){const points=[];for(let y=0;y<=c.height;y+=100)points.push(riverX(c,y)+','+y);create('polyline',{points:points.join(' '),fill:'none',stroke:'#8ed7de','stroke-width':Math.max((c.river?.halfWidth||24)*2,1/sx),opacity:.48,'data-map-kind':'river'},geography);}
  for(const r of regionRoads(c))create('polyline',{points:[r.from,r.to].map(p=>p.x+','+p.y).join(' '),fill:'none',stroke:r.secondary?'#e9ca88':'#ffe0a2','stroke-width':Math.max(r.width,.65/sx),opacity:.5,'data-map-kind':'road','data-map-id':r.id},geography);
  const marker=(p,kind)=>{
   const color=kind==='town'?'#eacf91':kind==='objective'?'#ffe766':kind==='dungeon'||kind==='exit'?'#d7b6ff':kind==='receiver'?'#9de4b5':'#75e9fa';
   const anchor=create('circle',{cx:p.x,cy:p.y,r:(kind==='objective'?6:4)/sx,fill:color,stroke:'#192b2c','stroke-width':1.3/sx,'data-map-kind':kind,'data-map-id':p.id,'data-world-x':p.x,'data-world-y':p.y},geography);if(p.arrivalOnly)anchor.dataset.mapArrival=p.id;const tooltip=create('title',{},anchor);tooltip.textContent=mapName(p,s.language);
   const at=mapPoint(c,p,W,H),icon=create('g',{transform:`translate(${at.x} ${at.y})`,'pointer-events':'none'},svg);
   if(kind==='town'){create('path',{d:'M-7 1L0-6L7 1V8H-7ZM-2 8V3H2V8',fill:'#cba873',stroke:'#30291b','stroke-width':1.2},icon);create('path',{d:'M-9 1L0-8L9 1',fill:'none',stroke:'#fff0c0','stroke-width':2},icon);}
   else if(['portal','teleporter'].includes(kind)){create('path',{d:'M0-9L6 0L0 9L-6 0Z',fill:'#5be6ff',stroke:'#d5fbff','stroke-width':1.5},icon);create('path',{d:'M-9 7Q0 12 9 7',fill:'none',stroke:'#61d6ed','stroke-width':2},icon);}
   else if(kind==='receiver'){create('path',{d:'M-7-5L0 3L7-5M-7 5H7',fill:'none',stroke:'#a4f0bf','stroke-width':2.5},icon);}
   else if(['dungeon','exit'].includes(kind))create('path',{d:'M-7 7V-2Q0-13 7-2V7H2V-1Q0-5-2-1V7Z',fill:'#d3b3eb',stroke:'#281e31','stroke-width':1.3},icon);
   return anchor;
  };
  const areas=mapAreaLabels(c),lettering=[];for(const p of mapPlaces(c)){marker(p,p.mapKind);const duplicateArea=areas.some(a=>mapName(a,s.language)===mapName(p,s.language)&&Math.hypot(a.x-p.x,a.y-p.y)<80);if(['town','portal','receiver','teleporter'].includes(p.mapKind)&&!duplicateArea)lettering.push({...p,kind:'place-label'});}
  for(const a of areas)lettering.push({...a,kind:'area'});
  const objectives=questMapTargets(s.hero,c,s.language),visible=visibleQuestMapTargets(objectives,questDefinition,c),visibleIds=new Set(visible.map(p=>p.id));for(const p of visible)marker(p,'objective');
  if(objectives.length){const journal=document.createElement('p');journal.className='map-quest-objectives';for(const p of objectives){const row=document.createElement('span'),shown=visibleIds.has(p.id);row.dataset.questId=p.id;row.dataset.targetHidden=String(!shown);row.textContent=(journal.childNodes.length?' | ':'')+p.name+' '+p.progress+'/'+p.required+' · '+(shown?'X '+Math.round(p.x)+' / Y '+Math.round(p.y):t.hidden);journal.append(row);}this.root.append(journal);}
  this.playerLayer=create('g',{transform:`scale(${sx} ${sy})`},svg);this.player=create('g',{'data-map-kind':'player'},this.playerLayer);create('circle',{r:11,fill:'#152929bb',stroke:'#f5eac9','stroke-width':1.3},this.player);create('path',{d:'M11 0L-7-6L-4 0L-7 6Z',fill:'#34edeb',stroke:'#072e3c','stroke-width':1.5},this.player);
  const legend=document.createElement('p');legend.className='map-key';legend.textContent=`⌂ ${t.town}   ◇ ${t.portal}   ↧ ${t.arrival}`;this.root.append(legend);this.coordinates=document.createElement('span');this.coordinates.className='map-coordinates';this.root.append(this.coordinates);this.layoutLabels(lettering);svg.append(this.playerLayer);this.updatePlayer();
 }
 layoutLabels(points){
  const svg=this.svg,c=this.scene.regionContent,W=this.width,H=this.height,hero=mapPoint(c,this.scene.hero,W,H),occupied=[{x:hero.x-15,y:hero.y-15,width:30,height:30},{x:(W-Math.min(W-110,300))/2,y:0,width:Math.min(W-110,300),height:32},{x:W-59,y:0,width:59,height:55},{x:0,y:H-55,width:W*.68,height:55},{x:W-140,y:H-24,width:140,height:24}];
  const fits=r=>r.x>=3&&r.y>=3&&r.x+r.width<=W-3&&r.y+r.height<=H-3&&!occupied.some(b=>r.x<b.x+b.width&&r.x+r.width>b.x&&r.y<b.y+b.height&&r.y+r.height>b.y);
  for(const p of points){const at=mapPoint(c,p,W,H),font=p.kind==='area'?11:10.5,full=mapName(p,this.scene.language),text=full.length>29?full.slice(0,28)+'…':full,label=create('text',{'font-size':font,'text-anchor':'middle','data-map-kind':p.kind,'data-map-id':p.id,'data-world-x':p.x,'data-world-y':p.y},svg);label.textContent=text;label.setAttribute('aria-label',full);const w=label.getComputedTextLength()+8,h=font+6;let chosen;
   search:for(const dy of [21,-13,36,-29,52,-45,68,-61])for(const dx of [0,-40,40,-80,80,-120,120]){const r={x:Math.max(3,Math.min(W-w-3,at.x+dx-w/2)),y:Math.max(3,Math.min(H-h-3,at.y+dy-h)),width:w,height:h};if(fits(r)){chosen=r;break search;}}
   if(!chosen){const candidates=[];for(let y=4;y+h<H-3;y+=h+3)for(let x=4;x+w<W-3;x+=16){const r={x,y,width:w,height:h};if(fits(r))candidates.push(r);}candidates.sort((a,b)=>Math.hypot(a.x+w/2-at.x,a.y+h/2-at.y)-Math.hypot(b.x+w/2-at.x,b.y+h/2-at.y));chosen=candidates[0];}
   if(!chosen){label.remove();continue;}occupied.push(chosen);label.setAttribute('x',chosen.x+w/2);label.setAttribute('y',chosen.y+font+1);if(Math.hypot(chosen.x+w/2-at.x,chosen.y+font-at.y)>22){const line=create('line',{x1:at.x,y1:at.y,x2:chosen.x+w/2,y2:chosen.y+font,stroke:'#fff2ba','stroke-width':.7,opacity:.5},null);svg.insertBefore(line,label);}
  }
 }
 updatePlayer(){const s=this.scene,h=s.hero;if(!this.player)return;const angle=Number.isFinite(s.facing)?s.facing:-Math.PI/2;this.player.setAttribute('transform',`translate(${h.x} ${h.y}) scale(${1/this.scales.sx} ${1/this.scales.sy}) rotate(${angle*180/Math.PI})`);this.player.dataset.worldX=h.x;this.player.dataset.worldY=h.y;this.coordinates.textContent=`X ${Math.round(h.x)} / Y ${Math.round(h.y)}`;}
 close(){this.opened=false;this.root.hidden=true;this.art?.release();}
 destroy(){this.art?.destroy();this.scene.events.off('update',this.onUpdate);this.root.remove();this.button.remove();document.removeEventListener('keydown',this.escape);}
}
