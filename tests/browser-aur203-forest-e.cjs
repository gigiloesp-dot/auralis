// Real actor, ability, localization, persistence and texture-lifetime coverage.
const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
(async()=>{const {AUR203_FOREST_E_ART}=await import('../js/assets/aur203ForestEArt.js');await runPaintedSpeciesSuite({ids:Object.keys(AUR203_FOREST_E_ART),scope:'aur203-forest-e',characterName:'A203ForestE'});})().catch(error=>{console.error(error);process.exitCode=1;});
