// Real actor, ability, localization, persistence and texture-lifetime coverage.
const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
(async()=>{const {AUR203_FOREST_C_ART}=await import('../js/assets/aur203ForestCArt.js');await runPaintedSpeciesSuite({ids:Object.keys(AUR203_FOREST_C_ART),scope:'aur203-forest-c',characterName:'A203ForestC'});})().catch(error=>{console.error(error);process.exitCode=1;});
