import {ACTOR_ART} from './actorArt.js';
import {BOSS_ART} from './bossArt.js';
// Each species has a distinct produced model and measured per-pose foot registration.
const produced={
 "wildBoar": [
  0.42,
  130,
  [
   216,
   204,
   202,
   198
  ]
 ],
 "bear": [
  0.65,
  107,
  [
   202,
   195,
   192,
   184
  ]
 ],
 "spider": [
  0.43,
  109,
  [
   196,
   195,
   195,
   196
  ]
 ],
 "forestBat": [
  0.55,
  66,
  [
   177,
   171,
   160,
   148
  ]
 ],
 "skeleton": [
  0.43,
  162,
  [
   228,
   208,
   205,
   203
  ]
 ],
 "frostGolem": [
  0.48,
  197,
  [
   228,
   224,
   219,
   202
  ]
 ],
 "arcaneWisp": [
  0.37,
  179,
  [
   223,
   212,
   210,
   214
  ]
 ],
 "forestRaider": [
  0.43,
  188,
  [
   239,
   226,
   218,
   211
  ]
 ],
 "thornSnake": [
  0.38,
  146,
  [
   221,
   213,
   206,
   194
  ]
 ],
 "forestOrc": [
  0.48,
  159,
  [
   216,
   214,
   214,
   203
  ]
 ],
 "desertSnake": [
  0.36,
  165,
  [
   240,
   224,
   213,
   216
  ]
 ],
 "scarab": [
  0.43,
  120,
  [
   207,
   199,
   188,
   181
  ]
 ],
 "fallenKnight": [
  0.5,
  158,
  [
   219,
   207,
   199,
   198
  ]
 ],
 "ancientGargoyle": [
  0.52,
  127,
  [
   202,
   191,
   177,
   184
  ]
 ],
 "voidElemental": [
  0.4,
  197,
  [
   223,
   214,
   223,
   221
  ]
 ],
 "iceWolf": [
  0.68,
  90.5,
  [
   194,
   186,
   173,
   181
  ]
 ],
 "snowBear": [
  0.6,
  150,
  [
   221,
   216,
   208,
   199
  ]
 ],
 "iceBat": [
  0.45,
  100,
  [
   199,
   206,
   176,
   173
  ]
 ],
 "snowRaider": [
  0.55,
  138.5,
  [
   209,
   195,
   186,
   184
  ]
 ],
 "iceElemental": [
  0.48,
  147,
  [
   208,
   199,
   200,
   187
  ]
 ],
 "wraith": [
  0.48,
  154,
  [
   218,
   204,
   198,
   204
  ]
 ],
 "ancientSentinel": [
  0.68,
  130.5,
  [
   207.5,
   201,
   193,
   180
  ]
 ]
};
export const MONSTER_ART=Object.freeze(Object.fromEntries(Object.entries(produced).map(([id,[scale,height,feet]])=>[id,{key:'actor-monster-'+id,url:'assets/actors/monsters/'+id+'.png',atlasURL:'assets/actors/monsters/'+id+'.json',scale,annotationHeight:height*scale+8,baselines:Object.fromEntries(['idle','run-a','run-b','attack'].map((bank,i)=>[bank,feet[i]]))}])));
export function monsterArt(type,kind,descriptor={}){return kind?.boss?BOSS_ART[descriptor.id]||null:type==='forestWolf'?ACTOR_ART.forestWolf:MONSTER_ART[type]||null;}
