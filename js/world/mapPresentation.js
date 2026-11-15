import {biomeZones} from './biomes.js';
import {climateAt} from './climate.js';
// The minimap covers a900-unit radius, but only350 units disclose enemies.
// This is a world-distance rule independent of screen size and streaming margin.
export const MINIMAP_MONSTER_RADIUS=350;
export const mapName=(point,language='ru')=>point.names?.[language]||point.names?.ru||point.name||point.id||'';
export function nearbyMapMonsters(hero,monsters=[]){return monsters.filter(m=>m.alive===true&&m.hp>0&&Number.isFinite(m.x)&&Number.isFinite(m.y)&&Math.hypot(m.x-hero.x,m.y-hero.y)<=MINIMAP_MONSTER_RADIUS);}
// No camp or static boss descriptors enter this presentation API. A future
// receiver remains arrival-only: rendering it never grants an interaction.
export function mapPlaces(content){
 const result=[],append=(kind,list)=>{for(const p of list||[]){const point=p.spawn&&kind==='town'?{...p,x:p.spawn.x,y:p.spawn.y}:p;if(Number.isFinite(point.x)&&Number.isFinite(point.y))result.push({...point,mapKind:kind});}};
 append('town',content.towns);append('landmark',content.landmarks);append('portal',content.portals);append('dungeon',content.dungeons);append('receiver',content.receivers);append('teleporter',(content.npcs||[]).filter(p=>p.role==='teleporter'||p.roles?.includes('teleporter')));if(content.exit)append('exit',[content.exit]);return result;
}
export const mapAreaLabels=content=>biomeZones(content);
export function currentMapArea(content,point,language='ru'){
 if(content.dungeon)return mapName(content,language);
 const climate=climateAt(content,point.x,point.y),areas=mapAreaLabels(content).filter(z=>!z.labelOnly&&z.rx>0&&z.ry>0&&((point.x-z.x)/z.rx)**2+((point.y-z.y)/z.ry)**2<=1).sort((a,b)=>Math.hypot(point.x-a.x,point.y-a.y)-Math.hypot(point.x-b.x,point.y-b.y));
 return mapName(areas[0]||climate||content,language);
}
export function visibleQuestMapTargets(targets,definition,content={}){return targets.filter(p=>{if(p.ready)return true;const q=definition(p.id),encounter=[...(content.camps||[]),...(content.bosses||[])].some(m=>Math.hypot(m.x-p.x,m.y-p.y)<1);return q&&!encounter&&!['kill','boss'].includes(q.type)&&!String(q.target||'').includes('-spot-')&&!String(q.target||'').includes('-camp-');});}
