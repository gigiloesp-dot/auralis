import {terrainHazard} from './climate.js';
// Simulation-time exposure, never wall-clock/offline damage. Paused scenes do
// not tick; saved characters never inherit a fractional damage accumulator.
export class TerrainEffects{
 constructor(scene){this.scene=scene;this.exposure=0;this.current=null;}
 update(dt,roads){const s=this.scene,h=s.hero,hazard=h.hp>0?terrainHazard(s.regionContent,h.x,h.y,roads):null;
  if(!hazard){this.exposure=0;this.current=null;return;}
  if(this.current!==hazard.id){this.current=hazard.id;this.exposure=0;s.notify?.(hazard.names[s.language]||hazard.names.ru);}
  this.exposure+=Math.min(.1,Math.max(0,dt));if(s.monsters)s.monsters.lastCombat=s.playNow;
  if(this.exposure>=1){const ticks=Math.floor(this.exposure);this.exposure-=ticks;h.hp=Math.max(0,h.hp-Math.max(1,Math.ceil(h.maxHp*hazard.fractionPerSecond))*ticks);s.refreshHud?.();s.save?.();}
 }
 reset(){this.exposure=0;this.current=null;}
}
