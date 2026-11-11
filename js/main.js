import { Menu } from './ui/Menu.js';
import { Save } from './systems/save.js';
import { GAME_CONFIG } from './config/gameConfig.js';
import { WorldScene } from './world/WorldScene.js';
const fail=(message)=>{const e=document.getElementById('error');e.hidden=false;e.textContent='Ошибка запуска Auralis: '+message;};
window.addEventListener('error',e=>fail(e.message));
window.addEventListener('unhandledrejection',e=>fail(String(e.reason)));
const rotateHint=document.getElementById('rotate-hint');
const syncOrientation=()=>{const portrait=window.innerHeight>window.innerWidth;rotateHint.hidden=!portrait;document.getElementById('actions').style.pointerEvents=portrait?'none':'';document.getElementById('joy').style.pointerEvents=portrait?'none':'';};
window.addEventListener('resize',syncOrientation);window.addEventListener('orientationchange',syncOrientation);syncOrientation();
if(!window.Phaser){fail('не удалось загрузить игровой движок Phaser');}
else {
  const game=new Phaser.Game({type:Phaser.AUTO,parent:'game',backgroundColor:'#25452c',scale:{mode:Phaser.Scale.RESIZE,width:window.innerWidth,height:window.innerHeight,autoCenter:Phaser.Scale.CENTER_BOTH},render:{pixelArt:false,antialias:GAME_CONFIG.performance.renderAntialias},scene:[]});
  const fit=()=>{const width=document.documentElement.clientWidth||window.innerWidth,height=document.documentElement.clientHeight||window.innerHeight;game.scale.resize(width,height);game.scene.getScene('world')?.resizeViewport?.(width,height);};
  game.events.once(Phaser.Core.Events.READY,()=>{fit();});
  window.addEventListener('resize',()=>requestAnimationFrame(fit));
  window.addEventListener('orientationchange',()=>{requestAnimationFrame(fit);setTimeout(fit,250);setTimeout(fit,700);});
  game.scene.add('world',WorldScene,false);
  const menu=new Menu(()=>{
    if(game.scene.isActive('world')||game.scene.isPaused('world'))game.scene.stop('world');
    game.scene.start('world');
  },(exit)=>{
    if(exit){if(game.scene.isActive('world')||game.scene.isPaused('world')){game.scene.getScene('world').save();game.scene.stop('world');}}
    else if(game.scene.isPaused('world'))game.scene.resume('world');
  });
  document.getElementById('pause-btn').addEventListener('click',()=>{
    if(game.scene.isActive('world')){game.scene.getScene('world').save();game.scene.getScene('world').controls?.reset();for(const name of ['inventoryPanel','characterPanel','skillsPanel','npcPanel','storagePanel','savePanel'])game.scene.getScene('world')[name]?.close();game.scene.pause('world');menu.show('pause');}
  });
  window.Auralis={game,Save,GAME_CONFIG,menu};
}
