const distance=(a,b)=>a&&b?Math.hypot(a.x-b.x,a.y-b.y):Infinity;
// The existing panels still own their services and proximity checks. This
// controller arbitrates only their world prompts, so one finger sees one action.
export class InteractionController{
 constructor(scene){this.scene=scene;this.current=null;}
 buttons(){const s=this.scene;return [s.npcPanel?.button,s.storagePanel?.button,s.dungeonPanel?.button,s.world?.button].filter(Boolean);}
 hide(){for(const button of this.buttons()){button.hidden=true;button.classList?.remove('active-interaction');}this.current=null;}
 blocked(){const s=this.scene;return !s.hero||s.hero.hp<=0||s.panelsOpen?.()||globalThis.document?.hidden||globalThis.document?.body?.classList?.contains('menu-open')||(globalThis.window&&window.innerHeight>window.innerWidth);}
 update(){
  const s=this.scene;if(this.blocked()){this.hide();return null;}
  const candidates=[],npc=s.npcPanel?.nearest(),dungeon=s.hero.dungeonSession?s.regionContent?.exit:s.dungeonPanel?.nearest();
  if(npc&&!s.npcPanel.button.hidden)candidates.push({type:'npc',target:npc,button:s.npcPanel.button,distance:distance(s.hero,npc)});
  if(dungeon&&!s.dungeonPanel.button.hidden)candidates.push({type:'dungeon',target:dungeon,button:s.dungeonPanel.button,distance:distance(s.hero,dungeon)});
  if(s.world?.portal&&!s.world.button.hidden)candidates.push({type:'portal',target:s.world.portal,button:s.world.button,distance:distance(s.hero,s.world.portal)});
  const chosen=candidates.sort((a,b)=>a.distance-b.distance)[0]||null;
  for(const button of this.buttons()){button.hidden=button!==chosen?.button;button.classList?.toggle('active-interaction',button===chosen?.button);}
  this.current=chosen;return chosen;
 }
 destroy(){this.hide();this.scene=null;}
}
