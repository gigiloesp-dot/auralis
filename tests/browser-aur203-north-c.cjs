// Real actor, ability, localization, persistence and texture-lifetime coverage.
const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
(async()=>{const {AUR203_NORTH_C_ART}=await import('../js/assets/aur203NorthCArt.js');await runPaintedSpeciesSuite({ids:Object.keys(AUR203_NORTH_C_ART),scope:'aur203-north-c',characterName:'A203NorthC'});})().catch(error=>{console.error(error);process.exitCode=1;});
