// Real actor, ability, localization, persistence and texture-lifetime coverage.
const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
(async()=>{const {AUR203_ANCIENT_E_ART}=await import('../js/assets/aur203AncientEArt.js');await runPaintedSpeciesSuite({ids:Object.keys(AUR203_ANCIENT_E_ART),scope:'aur203-ancient-e',characterName:'A203AncientE'});})().catch(error=>{console.error(error);process.exitCode=1;});
