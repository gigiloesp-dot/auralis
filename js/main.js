import { Save } from './systems/save.js';
import { GAME_CONFIG } from './config/gameConfig.js';
import { WorldScene } from './world/WorldScene.js';
const fail=(message)=>{const e=document.getElementById('error');e.hidden=false;e.textContent='Ошибка запуска Auralis: '+message;};
window.addEventListener('error',e=>fail(e.message));
window.addEventListener('unhandledrejection',e=>fail(String(e.reason)));
if(!window.Phaser){fail('не удалось загрузить игровой движок Phaser');}
else {
  const game=new Phaser.Game({type:Phaser.AUTO,parent:'game',backgroundColor:'#25452c',scale:{mode:Phaser.Scale.RESIZE,width:window.innerWidth,height:window.innerHeight,autoCenter:Phaser.Scale.CENTER_BOTH},render:{pixelArt:false,antialias:GAME_CONFIG.performance.renderAntialias},scene:[WorldScene]});
  window.Auralis={game,Save,GAME_CONFIG};
}
