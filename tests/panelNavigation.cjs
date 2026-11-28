// Exercise the public pause hub; toolbar controls stay hidden in the game HUD.
const panelSelectors={inventory:'#inventory-panel',skills:'#skills-panel',character:'#character-panel',backups:'.save-panel'};
async function openPausePanel(page,action){
 if(!(await page.locator('#menu[data-page="pause"]').isVisible()))await page.locator('#pause-btn').click();
 await page.locator('[data-pause-action="'+action+'"]').click();
 await page.locator(panelSelectors[action]).waitFor({state:'visible'});
}
async function resumeGame(page){
 const hub=page.locator('#menu[data-page="pause"]');
 if(await hub.isVisible())await hub.getByRole('button',{name:/^(Resume|Продолжить|Continuar)$/,exact:true}).click();
 await page.waitForFunction(()=>Auralis.game.scene.isActive('world')&&!Auralis.game.scene.isPaused('world'));
}
async function closeToGame(page){
 await page.keyboard.press('Escape');
 await resumeGame(page);
}
async function openMap(page){
 await page.locator('#minimap').click();
 await page.locator('.world-map').waitFor({state:'visible'});
}
module.exports={openPausePanel,resumeGame,closeToGame,openMap};
