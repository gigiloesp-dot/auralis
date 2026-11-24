// Real actor, ability, localization, persistence and texture-lifetime coverage.
const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
(async()=>{const {AUR203_NORTH_A_ART}=await import('../js/assets/aur203NorthAArt.js');await runPaintedSpeciesSuite({ids:Object.keys(AUR203_NORTH_A_ART),scope:'aur203-north-a',characterName:'A203NorthA'});})().catch(error=>{console.error(error);process.exitCode=1;});
