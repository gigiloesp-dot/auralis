// Spatial climate, in persistent world coordinates. No world-sized raster/cache.
const names=(ru,en,es)=>Object.freeze({ru,en,es});
export const CLIMATES=Object.freeze({
 woodland:{id:'woodland',type:'grove',color:0x527b43,names:names('Лесные просторы','Woodlands','Bosques')},
 abandonedCity:{id:'abandoned-city',type:'abandonedCity',color:0x77785e,names:names('Заросший город','Overgrown city','Ciudad invadida')},
 snow:{id:'snow',type:'snowfield',color:0xe2eaf0,names:names('Снежные просторы','Snowfields','Campos nevados')},
 volcanic:{id:'volcanic',type:'volcanic',color:0x423d3b,names:names('Пепельная гряда','Ashen range','Cordillera de ceniza')},
 elderForest:{id:'elder-forest',type:'grove',color:0x3f6551,names:names('Лес предков','Ancestral forest','Bosque ancestral')},
 elderRuins:{id:'elder-ruins',type:'ruinfield',color:0x85816c,names:names('Разрушенные владения','Shattered dominion','Dominio derruido')},
 elderMarsh:{id:'elder-marsh',type:'marsh',color:0x506c64,names:names('Туманные топи','Misty marshes','Pantanos brumosos')},
 elderWastes:{id:'elder-wastes',type:'wastes',color:0x92918a,names:names('Каменное безмолвие','Stone silence','Silencio de piedra')},
 elderMystic:{id:'elder-mystic',type:'mystic',color:0x706885,names:names('Сумеречные пределы','Twilight reaches','Confines del crepúsculo')},
 elderDry:{id:'elder-dry',type:'dryground',color:0xb29b6e,names:names('Сухой предел','Arid frontier','Frontera árida')},
 sand:{id:'sand',type:'dunes',color:0xe4c365,names:names('Песчаное море','Sea of sand','Mar de arena')}
});
export const climateBoundary=(content,y)=>content.width*.7+Math.sin(y/1900)*content.width*.014+Math.sin(y/730)*content.width*.005;
const mix=(a,b,t)=>{let color=0;for(const shift of [16,8,0])color|=Math.round(((a>>shift)&255)*(1-t)+((b>>shift)&255)*t)<<shift;return color;};
export function climateAt(content,x,y){
 if(content.dungeon)return null;
 if(content.id==='forest'||content.id==='north'){
  const a=content.id==='forest'?CLIMATES.woodland:CLIMATES.snow,b=content.id==='forest'?CLIMATES.abandonedCity:CLIMATES.volcanic;
  const d=x-climateBoundary(content,y),t=Math.max(0,Math.min(1,.5+d/700));return {...(d>0?b:a),color:mix(a.color,b.color,t),transition:t>0&&t<1};
 }
 if(content.id==='ancient'){
  const u=x+Math.sin(y/1100)*430,v=y+Math.sin(x/1600)*400,band=v<5700?0:v<10800?1:2;
  const pairs=[[CLIMATES.elderForest,CLIMATES.elderRuins],[CLIMATES.elderMarsh,CLIMATES.elderWastes],[CLIMATES.elderMystic,CLIMATES.elderDry]],pair=pairs[band],t=Math.max(0,Math.min(1,(u-6500)/1800));
  let color=mix(pair[0].color,pair[1].color,t);for(const boundary of [5700,10800])if(Math.abs(v-boundary)<600){const index=boundary===5700?0:1,p=(v-boundary+600)/1200;color=mix(mix(pairs[index][0].color,pairs[index][1].color,t),mix(pairs[index+1][0].color,pairs[index+1][1].color,t),p);}
  return {...pair[u>7400?1:0],color};
 }
 return content.id==='desert'?CLIMATES.sand:null;
}
const distanceToSegment=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-a.x-dx*t,p.y-a.y-dy*t);};
export function protectedTerrain(content,x,y,roads=content.roads||[]){
 const p={x,y};if((content.towns||[]).some(t=>Math.hypot(x-t.x,y-t.y)<(t.footprintRadius||335)+90))return true;
 if([...(content.npcs||[]),...(content.portals||[]),...(content.dungeons||[]),...(content.bosses||[])].some(q=>Math.hypot(x-q.x,y-q.y)<240))return true;
 return roads.some(r=>{const ps=r.points||[r.from,r.to];return ps.slice(1).some((b,i)=>distanceToSegment(p,ps[i],b)<(r.width||70)/2+55);});
}
export function lavaPool(content,cx,cy){
 if(content.id!=='north'||!content.climateRevision)return null;
 const x=cx*420+210+Math.sin(cx*17+cy*31)*90,y=cy*420+210+Math.cos(cx*11+cy*13)*90;
 if((cx*3+cy*7)%4===0||x<climateBoundary(content,y)+400||x>content.width-100||y<100||y>content.height-100)return null;
 return {x,y,rx:54,ry:38};
}
export function terrainHazard(content,x,y,roads=content.roads||[]){
 if(content.dungeon||content.id!=='north'||!content.climateRevision)return null;
 const cx=Math.floor(x/420),cy=Math.floor(y/420),pool=lavaPool(content,cx,cy);
 if(!pool||((x-pool.x)/pool.rx)**2+((y-pool.y)/pool.ry)**2>1||protectedTerrain(content,pool.x,pool.y,roads))return null;
 return {id:'lava',fractionPerSecond:.02,names:names('Лава: −2% ОЗ/с','Lava: −2% HP/s','Lava: −2% PV/s')};
}
export function paintClimate(g,c,chunk){
 if(!c.climateRevision||c.dungeon)return;
 for(let y=0;y<chunk.height;y+=32)for(let x=0;x<chunk.width;x+=32){const a=climateAt(c,chunk.x+x+16,chunk.y+y+16);if(a)g.fillStyle(a.color).fillRect(x,y,Math.min(32,chunk.width-x),Math.min(32,chunk.height-y));}
}
export function climateLabels(content){
 if(!content.climateRevision||content.dungeon)return [];
 const point=(climate,x,y)=>({...climate,x,y,rx:0,ry:0,labelOnly:true});
 if(content.id==='forest')return [point(CLIMATES.abandonedCity,content.width*.86,content.height*.55)];
 if(content.id==='north')return [point(CLIMATES.volcanic,content.width*.86,content.height*.55)];
 if(content.id==='ancient')return [[CLIMATES.elderForest,3200,2700],[CLIMATES.elderRuins,11200,2700],[CLIMATES.elderMarsh,3200,8200],[CLIMATES.elderWastes,11200,8200],[CLIMATES.elderMystic,3600,13000],[CLIMATES.elderDry,12000,13000]].map(([c,x,y])=>point(c,x,y));
 return [];
}
