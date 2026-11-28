// Real actor, ability, localization, persistence and texture-lifetime coverage.
const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
(async()=>{const {AUR203_ANCIENT_D_ART}=await import('../js/assets/aur203AncientDArt.js');await runPaintedSpeciesSuite({ids:Object.keys(AUR203_ANCIENT_D_ART),scope:'aur203-ancient-d',characterName:'A203AncientD'});})().catch(error=>{console.error(error);process.exitCode=1;});
