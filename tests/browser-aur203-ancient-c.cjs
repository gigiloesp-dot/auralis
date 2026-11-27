// Real actor, ability, localization, persistence and texture-lifetime coverage.
const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
(async()=>{const {AUR203_ANCIENT_C_ART}=await import('../js/assets/aur203AncientCArt.js');await runPaintedSpeciesSuite({ids:Object.keys(AUR203_ANCIENT_C_ART),scope:'aur203-ancient-c',characterName:'A203AncientC'});})().catch(error=>{console.error(error);process.exitCode=1;});
