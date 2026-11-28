// Real actor, ability, localization, persistence and texture-lifetime coverage.
const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
(async()=>{const {AUR203_DESERT_E_ART}=await import('../js/assets/aur203DesertEArt.js');await runPaintedSpeciesSuite({ids:Object.keys(AUR203_DESERT_E_ART),scope:'aur203-desert-e',characterName:'A203DesertE'});})().catch(error=>{console.error(error);process.exitCode=1;});
