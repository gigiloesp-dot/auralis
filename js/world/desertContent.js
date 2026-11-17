import {REGIONS} from './worldData.js';import {getRegionTowns} from './towns.js';import {expandSettlements} from './settlementExpansion.js';import {EXPANSION_DENSITY,addTemporaryCamps,addExpansionRoad} from './worldExpansion.js';
export function createDesertContent(){
 const c={...REGIONS.desert,river:false,towns:getRegionTowns('desert'),npcs:[],camps:[],bosses:[],portals:[{id:'desert-ancient',region:'desert',x:1600,y:1640,toRegion:'ancient',toX:1600,toY:1800},{id:'desert-forest',region:'desert',x:1600,y:1960,toRegion:'forest',toX:1030,toY:1140}],roads:[],landmarks:[],futureSettlements:[]};
 const anchors=[{x:1600,y:1800},{x:5800,y:4800},{x:11700,y:7600},{x:16900,y:12500},{x:17300,y:17500},{x:7200,y:16800}];for(let i=1;i<anchors.length;i++)addExpansionRoad(c,'desert-caravan-'+i,anchors[i-1],anchors[i],86);addExpansionRoad(c,'desert-caravan-return',anchors.at(-1),anchors[0],72);
 c.landmarks=[{id:'desert-silent-tower',x:7000,y:3500,names:{ru:'Безмолвная башня',en:'Silent tower',es:'Torre silenciosa'}},{id:'desert-lost-quarter',x:13200,y:10500,names:{ru:'Затерянный квартал',en:'Lost quarter',es:'Barrio perdido'}},{id:'desert-salt-gate',x:16800,y:16900,names:{ru:'Соляные врата',en:'Salt gate',es:'Puerta de sal'}}];
 c.futureSettlements=[{id:'desert-east-caravan-site',x:11700,y:7600,reserved:true},{id:'desert-south-caravan-site',x:7200,y:16800,reserved:true}];
 addTemporaryCamps(c,{count:EXPANSION_DENSITY.desert,types:['desertSnake','scarab','ancientSentinel','arcaneWisp'],prefix:'desert'});expandSettlements(c);return c;
}
