// Real actor, ability, localization, persistence and texture-lifetime coverage.
const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
(async()=>{const {AUR203_ANCIENT_A_ART}=await import('../js/assets/aur203AncientAArt.js');await runPaintedSpeciesSuite({ids:Object.keys(AUR203_ANCIENT_A_ART),scope:'aur203-ancient-a',characterName:'A203AncientA'});})().catch(error=>{console.error(error);process.exitCode=1;});
