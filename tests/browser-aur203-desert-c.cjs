// Real actor, ability, localization, persistence and texture-lifetime coverage.
const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
(async()=>{const {AUR203_DESERT_C_ART}=await import('../js/assets/aur203DesertCArt.js');await runPaintedSpeciesSuite({ids:Object.keys(AUR203_DESERT_C_ART),scope:'aur203-desert-c',characterName:'A203DesertC'});})().catch(error=>{console.error(error);process.exitCode=1;});
