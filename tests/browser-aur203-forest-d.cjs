// Real actor, ability, localization, persistence and texture-lifetime coverage.
const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
(async()=>{const {AUR203_FOREST_D_ART}=await import('../js/assets/aur203ForestDArt.js');await runPaintedSpeciesSuite({ids:Object.keys(AUR203_FOREST_D_ART),scope:'aur203-forest-d',characterName:'A203ForestD'});})().catch(error=>{console.error(error);process.exitCode=1;});
