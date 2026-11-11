// Deliberately simple silhouettes, with separate anatomy per creature family.
export function drawMonster(scene,body,type,boss=false){
 const a=scene.add;
 const add=list=>body.add(list);
 if(type==='wildBoar')add([a.ellipse(0,-19,50,35,0x5a4032),a.ellipse(24,-17,23,25,0x785540),a.rectangle(33,-13,10,14,0xa57a5c),a.triangle(27,-8,-4,5,0,-8,4,5,0xf4e6c8),a.circle(25,-24,2,0xffc768)]);
 else if(type==='forestRaider'||type==='skeleton'){
  const bone=type==='skeleton';add([a.ellipse(0,-23,bone?14:25,36,bone?0xd6cfb0:0x833f35),a.circle(0,-47,11,bone?0xe1dcc5:0xc5a17c),a.rectangle(19,-26,5,35,0xbac0bf),a.rectangle(-8,-2,5,21,bone?0xd6cfb0:0x3c3433),a.rectangle(8,-2,5,21,bone?0xd6cfb0:0x3c3433)]);
 }else if(type==='bear')add([a.ellipse(0,-26,65,46,0x65482f),a.circle(20,-46,20,0x79573b),a.circle(10,-63,8,0x65482f),a.circle(30,-63,8,0x65482f),a.ellipse(34,-40,18,11,0x352c27)]);
 else if(type==='spider'){
  for(let i=0;i<4;i++)for(const sign of [-1,1])add([a.rectangle(sign*(15+i*2),-13+i*3,36,4,0x49404d).setRotation?.(sign*(i-1.5)*.35)||a.circle(sign*25,-12,3,0x49404d)]);
  add([a.ellipse(0,-17,33,24,0x42384b),a.circle(0,-25,12,0x655077),a.circle(-5,-29,3,0xeca47e),a.circle(5,-29,3,0xeca47e)]);
 }else if(type==='frostGolem'||type==='ancientSentinel'||type==='forestGuardian'){
  const frost=type==='frostGolem',stone=type==='ancientSentinel',color=frost?0x87b8d0:stone?0x9a9073:0x536d44;
  add([a.rectangle(0,-35,52,63,color),a.circle(0,-77,23,color),a.rectangle(-36,-36,15,51,color),a.rectangle(36,-36,15,51,color),a.rectangle(-14,4,17,28,color),a.rectangle(14,4,17,28,color),a.circle(-9,-80,4,frost?0xe5ffff:0xffd16e),a.circle(9,-80,4,frost?0xe5ffff:0xffd16e)]);
  if(!stone)add([a.triangle(-20,-106,-10,25,0,-17,10,25,color),a.triangle(20,-106,-10,25,0,-17,10,25,color)]);
 }else if(type==='arcaneWisp')add([a.circle(0,-31,23,0x7a60b5,.3),a.circle(0,-31,12,0xb19bef),a.triangle(0,-8,-10,-6,0,18,10,-6,0x6d8bb2),a.circle(0,-31,5,0xf1ebff)]);
 else{
  const ice=type==='iceWolf';add([a.ellipse(0,-13,38,23,ice?0x86a8b7:0x68584b),a.ellipse(17,-20,20,18,ice?0xa2c6d5:0x796758),a.triangle(12,-31,-5,8,0,-9,5,8,0x5c5046),a.triangle(23,-31,-5,8,0,-9,5,8,0x5c5046),a.circle(21,-23,2,ice?0x9cffff:0xf5ce6a)]);
 }
 if(boss)body.setScale?.(1.45);
}
