// Real actor, ability, localization, persistence and texture-lifetime coverage.
const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
(async()=>{const {AUR203_FOREST_B_ART}=await import('../js/assets/aur203ForestBArt.js');await runPaintedSpeciesSuite({ids:Object.keys(AUR203_FOREST_B_ART),scope:'aur203-forest-b',characterName:'A203ForestB'});})().catch(error=>{console.error(error);process.exitCode=1;});
