import {dungeonExitPortalState} from './dungeonSession.js';
const NAMES={ru:'Портал к выходу',en:'Exit portal',es:'Portal de salida'};

// A voluntary world-space interaction. Completion and rewards belong to the
// dungeon ledger; using this visual never calls the reward handler again.
export class DungeonExitPortal{
 constructor(scene){this.scene=scene;this.root=null;this.state=null;this.destroyed=false;}
 update(content=this.scene.regionContent,now=this.scene.playNow||0){
  if(this.destroyed)return;
  const state=dungeonExitPortalState(this.scene.hero,content);
  if(!state){this.clear();return;}
  if(this.state?.id!==state.id){this.clear();this.create(state);}
  this.state=state;
  const visible=this.scene.hero.hp>0&&!this.scene.panelsOpen?.();
  this.root.setVisible(visible);this.zone.input.enabled=visible;
  this.glow.alpha=.72+Math.sin(now*.003)*.16;
  this.core.setScale(1+Math.sin(now*.003)*.035,1+Math.cos(now*.003)*.025);
 }
 create(state){
  const s=this.scene,p=s.project(state.x,state.y);
  this.root=s.add.container(p.x,p.y).setDepth(state.x+state.y+3);
  const glow=this.glow=s.add.graphics(),core=this.core=s.add.graphics();
  glow.fillStyle(0x79e5d4,.10).fillEllipse(0,-35,112,142).fillStyle(0x8ef9e5,.16).fillEllipse(0,-35,88,120);
  glow.fillStyle(0x96e6d4,.20).fillEllipse(0,16,104,35);
  core.fillStyle(0x235d6c,.7).fillEllipse(0,-35,63,94).lineStyle(7,0xd8c79a,.9).strokeEllipse(0,-35,69,100);
  core.lineStyle(3,0x8bffe4,.95).strokeEllipse(0,-35,59,88).lineStyle(1.5,0xd7fff4,.8).strokeEllipse(0,-35,45,74);
  core.fillStyle(0xaaffec,.8);for(let i=0;i<8;i++){const a=i*Math.PI/4;core.fillCircle(Math.cos(a)*40,-35+Math.sin(a)*54,2);}
  const label=this.label=s.add.text(0,-105,NAMES[s.language]||NAMES.ru,{fontFamily:'Arial',fontSize:'12px',color:'#c8fff1',stroke:'#102c30',strokeThickness:3}).setOrigin(.5);
  const zone=this.zone=s.add.zone(0,-35,100,135).setInteractive({useHandCursor:true});
  zone.on('pointerdown',(pointer,x,y,event)=>{event?.stopPropagation?.();this.tryUse();});
  this.root.add([glow,core,label,zone]);this.state=state;
 }
 tryUse(){
  const hero=this.scene.hero,state=dungeonExitPortalState(hero,this.scene.regionContent);
  if(this.destroyed||!state||hero.hp<=0||this.scene.panelsOpen?.()||Math.hypot(hero.x-state.x,hero.y-state.y)>state.radius)return {ok:false,reason:'distance'};
  this.scene.controls?.reset();return this.scene.leaveDungeon?.()||{ok:false,reason:'unavailable'};
 }
 clear(){this.root?.destroy();this.root=null;this.state=null;this.zone=null;this.glow=null;this.core=null;this.label=null;}
 destroy(){if(this.destroyed)return;this.clear();this.destroyed=true;}
}
