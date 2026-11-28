import {npcQuestIndicator} from '../quests/npcQuestIndicator.js';
// A single text object belongs to the streamed NPC container. No textures,
// global depth overlay, listeners or persistent/save fields are introduced.
export class NpcQuestIndicator{
 constructor(scene,root,npc,options){this.npc=npc;this.options=options;this.label=scene.add.text(0,-116,'',{fontFamily:'Georgia,serif',fontSize:'28px',fontStyle:'bold',color:'#ffd34f',stroke:'#21160d',strokeThickness:4}).setOrigin(.5,1);root.add(this.label);this.signature='';this.update(scene.hero);}
 update(hero){const value=hero?npcQuestIndicator(hero,this.npc.id,this.options):null,signature=value?[value.symbol,value.color,value.alpha].join(':'):'';this.value=value;if(signature===this.signature&&this.initialized)return;this.signature=signature;this.initialized=true;this.label.setVisible(!!value);if(value)this.label.setText(value.symbol).setColor(value.color).setAlpha(value.alpha);}
 destroy(){this.label.destroy();}
}
