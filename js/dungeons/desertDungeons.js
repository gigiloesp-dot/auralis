import {distanceToSegment} from '../world/chunkGeometry.js';
import {DESERT_DUNGEON_BLUEPRINTS,createDesertDungeonLayout} from './desertDungeonLayouts.js';
export const DESERT_DUNGEONS=Object.freeze(DESERT_DUNGEON_BLUEPRINTS.map((b,i)=>Object.freeze({id:b.id,number:13+i,region:'desert',level:b.level,...b.worldEntrance,names:b.names,size:'large',bossCount:1,theme:b.theme})));
const encounters={
 dungeon13:{types:['scarab','ancientSentinel'],boss:'scarab',names:{ru:'Царица запечатанного водоёма',en:'Queen of the sealed reservoir',es:'Reina del depósito sellado'},patterns:['slam','volley'],theme:'bronzeShock'},
 dungeon14:{types:['ancientSentinel','desertSnake'],boss:'desertSnake',names:{ru:'Оракул алого жала',en:'Oracle of the scarlet sting',es:'Oráculo del aguijón escarlata'},patterns:['volley','charge','slam'],theme:'ashVenom'},
 dungeon15:{types:['scarab','arcaneWisp'],boss:'forestGuardian',names:{ru:'Корневая корона гробницы',en:'Root crown of the tomb',es:'Corona de raíces de la tumba'},patterns:['slam','volley','charge'],theme:'roots'},
 dungeon16:{types:['ancientSentinel','fallenKnight'],boss:'ancientSentinel',names:{ru:'Базальтовый шакал акведука',en:'Basalt jackal of the aqueduct',es:'Chacal de basalto del acueducto'},patterns:['charge','slam'],theme:'tusk'},
 dungeon17:{types:['arcaneWisp','voidElemental'],boss:'voidElemental',names:{ru:'Джинн погасшего солнца',en:'Djinn of the extinguished sun',es:'Genio del sol apagado'},patterns:['volley','slam','charge'],theme:'oracleBlink'}
};
export function createDesertDungeonContent(definition,difficulty,mode,minionRespawnMs){
 const layout=createDesertDungeonLayout(definition.id),setup=encounters[definition.id];
 const camps=layout.encounters.filter(e=>e.kind==='minions').map((e,i)=>{const type=setup.types[i%setup.types.length],speciesId=i%2===0?(definition.id==='dungeon14'?'desert-species-000':definition.id==='dungeon15'?'desert-species-001':null):null;return {id:e.id,type,region:definition.id,level:definition.level,x:e.x,y:e.y,spawns:e.points.map(p=>({...p,type,...(speciesId?{speciesId}:{}),level:definition.level,hpMultiplier:mode.multiplier,damageMultiplier:mode.multiplier,respawnMs:minionRespawnMs}))};});
 const boss=layout.encounters.find(e=>e.kind==='boss').points[0],bosses=[{...boss,type:setup.boss,region:definition.id,level:definition.level,bossType:'dungeon',bossTheme:setup.theme,patterns:[...setup.patterns],names:{...setup.names},hpMultiplier:mode.multiplier,damageMultiplier:mode.multiplier,respawnMs:3600000,dungeonId:definition.id,difficulty}];
 // Painted ruined columns flank the chamber corners, leaving all authored
 // enemy anchors and the complete corridor graph unobstructed.
 const dungeonDecorations=layout.rooms.flatMap((r,i)=>{const candidates=[[35,35],[r.width-35,35],[35,r.height-35],[r.width-35,r.height-35]].map(([dx,dy])=>({x:r.x+dx,y:r.y+dy})),clear=candidates.filter(p=>layout.roads.every(road=>road.points.slice(1).every((b,j)=>distanceToSegment(p,road.points[j],b)>road.width/2+40)));if(clear.length<2)throw Error('No safe columns in '+definition.id+'/'+r.id);return clear.slice(0,2).map((p,side)=>({id:definition.id+'-column-'+i+'-'+side,...p,kind:side?'ruin1':'ruin2',scale:.45,r:18}));});
 return {...layout,id:`dungeon:${definition.id}:${difficulty}`,region:'desert',name:definition.names.ru,dungeon:true,desertDungeon:true,dungeonId:definition.id,difficulty,definition,camps,bosses,dungeonDecorations};
}
