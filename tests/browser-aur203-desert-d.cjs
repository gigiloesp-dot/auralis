// Real actor, ability, localization, persistence and texture-lifetime coverage.
const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
(async()=>{const {AUR203_DESERT_D_ART}=await import('../js/assets/aur203DesertDArt.js');await runPaintedSpeciesSuite({ids:Object.keys(AUR203_DESERT_D_ART),scope:'aur203-desert-d',characterName:'A203DesertD'});})().catch(error=>{console.error(error);process.exitCode=1;});
