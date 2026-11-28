// Real actor, ability, localization, persistence and texture-lifetime coverage.
const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
(async()=>{const {AUR203_NORTH_E_ART}=await import('../js/assets/aur203NorthEArt.js');await runPaintedSpeciesSuite({ids:Object.keys(AUR203_NORTH_E_ART),scope:'aur203-north-e',characterName:'A203NorthE'});})().catch(error=>{console.error(error);process.exitCode=1;});
