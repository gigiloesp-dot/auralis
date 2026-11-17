import {CAMP_ALIASES,MONSTER_ALIASES} from '../world/campAliases.js';
export const WORLD_LAYOUT_VERSION=2;
const plainAliases=new Map(Object.entries(CAMP_ALIASES).map(([key,id])=>[key.slice(key.indexOf(':')+1),id]));
export function migrateWorldLayout(data,worldState,locations=[]){
 if(data.worldLayoutVersion===WORLD_LAYOUT_VERSION)return {worldLayoutVersion:WORLD_LAYOUT_VERSION,worldState,discoveredLocations:locations};
 const monsters={...worldState.monsters};
 for(const [oldId,state]of Object.entries(worldState.monsters)){
  const nextId=MONSTER_ALIASES[oldId];if(!nextId||nextId===oldId)continue;
  delete monsters[oldId];
  // Retired living species do not teleport into a new species' body. Death
  // deadlines survive many-to-one aliases conservatively, with no early spawn.
  if(!(state.deadUntil>0))continue;
  const current=monsters[nextId]||{},killedAt=Math.max(current.killedAt||0,state.killedAt||0),deadUntil=Math.max(current.deadUntil||0,state.deadUntil,killedAt? killedAt+30000:0);
  monsters[nextId]={hp:0,killedAt,deadUntil};
 }
 return {worldLayoutVersion:WORLD_LAYOUT_VERSION,worldState:{...worldState,monsters},discoveredLocations:[...new Set(locations.map(id=>CAMP_ALIASES[id]?id.slice(0,id.indexOf(':')+1)+CAMP_ALIASES[id]:plainAliases.get(id)||id))]};
}
