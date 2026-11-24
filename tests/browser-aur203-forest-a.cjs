// Real actor, ability, localization, persistence and texture-lifetime coverage.
const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
(async()=>{const {AUR203_FOREST_A_ART}=await import('../js/assets/aur203ForestAArt.js');await runPaintedSpeciesSuite({ids:Object.keys(AUR203_FOREST_A_ART),scope:'aur203-forest-a',characterName:'A203ForestA'});})().catch(error=>{console.error(error);process.exitCode=1;});
