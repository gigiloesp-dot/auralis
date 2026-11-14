// Separate sparring grounds: not part of the 254 camps / 1145 ordinary enemies.
// A level-specific opponent can reward the player once per day; gaining a new
// level unlocks a new trial without resetting the previous trial's saved timer.
export const ARENA_ID='arena';
export function generateArenaContent(hero){
 const level=Math.max(1,Math.min(42,Math.floor(Number(hero?.level)||1)));
 const type=level<8?'forestRaider':level<22?'bear':level<35?'frostGolem':'ancientSentinel';
 const boss={id:'trial-'+level,type,x:850,y:600,level,bossType:'arena',patterns:['slam','charge','volley'],respawnMs:86400000,xp:Math.max(30,level*35),gold:level*15,names:{ru:'Мастер арены · испытание '+level,en:'Arena master · trial '+level,es:'Maestro de arena · prueba '+level}};
 return {id:ARENA_ID,region:'forest',name:'Круг испытаний',names:{ru:'Круг испытаний',en:'Circle of trials',es:'Círculo de pruebas'},width:1200,height:1200,dungeon:true,arena:true,river:false,entry:{x:250,y:600},spawn:{x:250,y:600},exit:{x:250,y:600,radius:90},rooms:[{id:'arena-floor',x:120,y:120,width:960,height:960}],walkableRects:[{x:120,y:120,width:960,height:960}],towns:[],npcs:[],camps:[],bosses:[boss],portals:[],roads:[],obstacles:[],landmarks:[],palette:{ground:0x252c34,detail:0x6b7782,road:0xa89c7c,water:0x354b63}};
}
