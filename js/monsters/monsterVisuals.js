// Fallback anatomy remains usable while painted atlases stream. Limbs are kept
// as real parts so locomotion animates wings, feet, tails and spectral bodies.
const familyFor=type=>({forestWolf:'wolf',iceWolf:'wolf',wildBoar:'boar',bear:'bear',snowBear:'bear',forestRaider:'raider',snowRaider:'raider',skeleton:'skeleton',fallenKnight:'skeleton',forestOrc:'orc',spider:'spider',forestBat:'bat',iceBat:'bat',thornSnake:'snake',desertSnake:'snake',frostGolem:'golem',ancientSentinel:'sentinel',forestGuardian:'treant',arcaneWisp:'elemental',iceElemental:'elemental',voidElemental:'elemental',wraith:'ghost',scarab:'scarab',ancientGargoyle:'gargoyle'}[type]||'wolf');
export function drawMonster(scene,body,type,boss=false){
 const a=scene.add,family=familyFor(type),motion=body.motionParts={legs:[],wings:[],tail:[],body:[]};
 const add=list=>{body.add(list);return list;},ellipse=(x,y,w,h,color,alpha=1)=>a.ellipse(x,y,w,h,color,alpha),circle=(x,y,r,c,alpha=1)=>a.circle(x,y,r,c,alpha);
 const foot=(x,y,w,h,c)=>{const part=ellipse(x,y,w,h,c);part.restX=x;part.restY=y;motion.legs.push(part);add([part]);return part;};
 const eyes=(x,y,c=0xffd774)=>add([circle(x-4,y,2,c),circle(x+4,y,2,c)]);
 if(family==='wolf'||family==='boar'||family==='bear'){
  const wolf=family==='wolf',bear=family==='bear',ice=type==='iceWolf'||type==='snowBear',color=ice?0x9db7c4:bear?0x79573b:family==='boar'?0x73503a:0x7b6a59,dark=ice?0x607b8e:0x453931;
  for(const x of bear?[-22,-6,13,25]:[-15,-5,9,20])foot(x,-4,bear?13:7,bear?23:18,dark);
  const tail=ellipse(-24,-22,wolf?31:12,wolf?9:6,dark);tail.restY=-22;motion.tail.push(tail);add([tail,ellipse(0,bear?-29:-22,bear?64:family==='boar'?55:47,bear?45:30,color),ellipse(wolf?23:27,bear?-44:-29,bear?32:25,bear?33:23,color)]);
  if(wolf)add([a.triangle(17,-42,-6,8,0,-8,6,8,dark),a.triangle(28,-42,-6,8,0,-8,6,8,dark),ellipse(35,-27,18,10,color),circle(42,-27,3,dark)]);
  else if(bear)add([circle(18,-60,7,dark),circle(36,-60,7,dark),ellipse(38,-40,19,12,dark)]);
  else add([ellipse(39,-25,14,18,0xa57a5c),a.triangle(32,-15,-3,5,0,-10,4,5,0xf4e6c8),a.triangle(43,-15,-3,5,0,-10,4,5,0xf4e6c8),ellipse(-6,-36,27,10,dark)]);
  add([circle(30,bear?-49:-32,2,0xffd774)]);
 }else if(['raider','skeleton','orc'].includes(family)){
  const bone=family==='skeleton',orc=family==='orc',armored=type==='fallenKnight',skin=bone?0xded7bd:orc?0x79975b:0xd6a67d,cloth=armored?0x626878:orc?0x754b38:type==='snowRaider'?0x6a7f92:0x894a3e;
  foot(-8,-7,8,24,armored?0x58616c:0x403a36);foot(8,-7,8,24,armored?0x58616c:0x403a36);
  add([ellipse(0,-30,orc?35:bone?20:29,34,cloth),ellipse(0,-56,orc?28:23,25,skin),ellipse(-19,-29,9,28,skin),ellipse(19,-31,9,28,skin)]);
  if(family==='raider')add([a.triangle(30,-30,-11,-20,7,0,-11,20,0xa37a48),a.rectangle(22,-30,2,42,0xe5d1a6)]);
  else add([a.rectangle(27,-40,5,35,0xb7c6cb),a.triangle(27,-61,-3,6,0,-8,3,6,0xe5ecef),a.rectangle(27,-22,15,4,0x9e7d45)]);
  if(orc)add([a.triangle(-9,-47,-4,4,0,-5,3,4,0xf1e4b8),a.triangle(9,-47,-3,4,0,-5,4,4,0xf1e4b8)]);
  if(armored)add([ellipse(-22,-30,20,27,0x687a90),ellipse(0,-64,27,14,0x6b7486)]);
  eyes(0,-58,bone?0xebad68:0x302c25);
 }else if(family==='spider'||family==='scarab'){
  const beetle=family==='scarab',color=beetle?0x447f80:0x5c4267;
  for(let i=0;i<4;i++)for(const sign of [-1,1]){const leg=a.rectangle(sign*(20+i),-10-i*4,37,4,beetle?0x775d39:0x453a4d);leg.setRotation?.(sign*(i-1.5)*.4);leg.restRotation=sign*(i-1.5)*.4;motion.legs.push(leg);add([leg]);}
  add([ellipse(0,-19,beetle?41:35,beetle?35:27,color),ellipse(0,-36,beetle?22:24,18,beetle?0xa5874c:0x79608b)]);eyes(0,-39,beetle?0xa8e4dd:0xf4a888);
  if(beetle)add([a.rectangle(0,-20,2,30,0xc8ac67),a.triangle(0,-48,-6,9,0,-12,6,9,0xbb9f5d)]);
 }else if(family==='snake'){
  const ash=type==='desertSnake',colors=ash?[0xa76e48,0x77503c,0xd1aa76]:[0x577d44,0x3a5935,0xc2c981];
  for(let i=0;i<6;i++){const segment=ellipse(-25+i*9,-9-i*2,17-i,12,colors[i%2]);segment.restY=-9-i*2;motion.tail.push(segment);add([segment]);}
  add([ellipse(24,-26,18,23,colors[0]),ellipse(29,-38,22,17,colors[0]),a.triangle(21,-32,-5,8,-7,-12,9,-4,colors[2]),a.triangle(35,-31,-6,7,5,-11,8,0,colors[2])]);eyes(30,-40,0xf4d27e);
 }else if(family==='bat'||family==='gargoyle'){
  const stone=family==='gargoyle',frost=type==='iceBat',color=stone?0x7c858f:frost?0x719abb:0x856287,membrane=stone?0x55636f:frost?0xa3c4d4:0x4d3c5d;
  for(const sign of [-1,1]){const wing=a.triangle(sign*22,-32,sign*-8,10,sign*30,-29,sign*35,18,membrane);wing.restRotation=0;motion.wings.push(wing);add([wing]);}
  if(stone){foot(-9,-7,12,25,0x505b68);foot(9,-7,12,25,0x505b68);}
  add([ellipse(0,-27,stone?31:20,stone?40:29,color),ellipse(0,-50,stone?26:21,23,color),a.triangle(-10,-63,-5,8,0,-10,5,8,color),a.triangle(10,-63,-5,8,0,-10,5,8,color)]);eyes(0,-53,stone?0x9de4db:0xf0ca88);
 }else if(['golem','sentinel','treant'].includes(family)){
  const frost=family==='golem',stone=family==='sentinel',color=frost?0x87b8d0:stone?0x9a9073:0x536d44;
  foot(-16,-1,20,32,color);foot(16,-1,20,32,color);
  add([ellipse(0,-39,57,68,color),ellipse(0,-79,43,39,color),a.rectangle(-37,-35,18,55,color),a.rectangle(37,-35,18,55,color)]);eyes(0,-82,frost?0xe5ffff:0xffd16e);
  add([ellipse(0,-42,22,29,frost?0xb8e6ec:stone?0x6a777b:0x344d32),circle(0,-42,6,frost?0xe2ffff:0xe0c588)]);
  if(!stone)add([a.triangle(-20,-106,-10,25,0,-17,10,25,color),a.triangle(20,-106,-10,25,0,-17,10,25,color)]);
 }else if(family==='ghost'){
  add([ellipse(0,-39,33,47,0x7295b4,.45),ellipse(0,-60,27,27,0xa3c4d1,.7),a.triangle(0,-10,-16,-17,-4,14,16,-17,0x6686a6,.7),a.triangle(-20,-32,-9,4,-1,-22,10,9,0xa3c4d1,.5),a.triangle(20,-32,-10,9,1,-22,9,4,0xa3c4d1,.5)]);eyes(0,-61,0xe5faff);
 }else if(family==='elemental'){
  const ice=type==='iceElemental',voided=type==='voidElemental',color=ice?0x85cee6:voided?0x946ad6:0xb19bef;
  add([circle(0,-31,28,color,.16),circle(0,-31,17,color,.45),a.triangle(0,-29,-14,0,0,-25,14,0,color),a.triangle(0,-22,-14,0,0,22,14,0,color),circle(0,-30,6,0xf1ebff)]);
  for(let i=0;i<3;i++){const shard=a.triangle((i-1)*24,-34+i*11,-4,4,0,-8,4,4,color);shard.restY=-34+i*11;motion.tail.push(shard);add([shard]);}
 }
 if(boss){
  const top=['golem','sentinel','treant'].includes(family)?-119:['raider','skeleton','orc','ghost','gargoyle','bat'].includes(family)?-84:family==='elemental'?-73:-68;
  add([a.rectangle(0,top+9,34,5,0xe8bb60),a.triangle(-12,top,-6,8,0,-8,6,8,0xe8bb60),a.triangle(0,top-4,-7,10,0,-10,7,10,0xffdc86),a.triangle(12,top,-6,8,0,-8,6,8,0xe8bb60),circle(0,top+8,4,0x8071be)]);
  if(family==='sentinel')add([a.rectangle(-33,-55,6,18,0xb6a8e5),a.rectangle(33,-55,6,18,0xb6a8e5)]);
  if(family==='golem')add([a.triangle(-39,-65,-9,8,0,-14,9,8,0xc0eaff),a.triangle(39,-65,-9,8,0,-14,9,8,0xc0eaff)]);
  body.setScale?.(1.45);
 }
}
export function animateMonsterParts(monster,now,walking,profile){
 const parts=monster.body.motionParts;if(!parts)return;const gait=now*(profile.locomotion==='heavy'?.006:profile.locomotion==='crawler'?.022:.015)+monster.phase;
 for(const [i,leg]of parts.legs.entries()){if(leg.restRotation!==undefined)leg.rotation=leg.restRotation+(walking?Math.sin(gait+i*1.7)*.24:0);else{leg.y=leg.restY+(walking?Math.max(0,Math.sin(gait+i*Math.PI))*-6:0);leg.x=leg.restX+(walking?Math.cos(gait+i*Math.PI)*3:0);}}
 for(const [i,wing]of parts.wings.entries())wing.rotation=(i?1:-1)*Math.sin(now*.021)*.3;
 for(const [i,tail]of parts.tail.entries())tail.y=tail.restY+Math.sin(gait*.7+i*.9)*(profile.locomotion==='serpent'?5:2);
}
