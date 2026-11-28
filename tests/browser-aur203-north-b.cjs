// Real actor, ability, localization, persistence and texture-lifetime coverage.
const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
(async()=>{const {AUR203_NORTH_B_ART}=await import('../js/assets/aur203NorthBArt.js');await runPaintedSpeciesSuite({ids:Object.keys(AUR203_NORTH_B_ART),scope:'aur203-north-b',characterName:'A203NorthB'});})().catch(error=>{console.error(error);process.exitCode=1;});
