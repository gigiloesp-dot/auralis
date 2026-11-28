// Real actor, ability, localization, persistence and texture-lifetime coverage.
const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
(async()=>{const {AUR203_NORTH_D_ART}=await import('../js/assets/aur203NorthDArt.js');await runPaintedSpeciesSuite({ids:Object.keys(AUR203_NORTH_D_ART),scope:'aur203-north-d',characterName:'A203NorthD'});})().catch(error=>{console.error(error);process.exitCode=1;});
