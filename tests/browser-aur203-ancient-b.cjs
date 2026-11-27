// Real actor, ability, localization, persistence and texture-lifetime coverage.
const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
(async()=>{const {AUR203_ANCIENT_B_ART}=await import('../js/assets/aur203AncientBArt.js');await runPaintedSpeciesSuite({ids:Object.keys(AUR203_ANCIENT_B_ART),scope:'aur203-ancient-b',characterName:'A203AncientB'});})().catch(error=>{console.error(error);process.exitCode=1;});
