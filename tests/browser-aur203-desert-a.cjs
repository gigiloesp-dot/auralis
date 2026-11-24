// Real actor, ability, localization, persistence and texture-lifetime coverage.
const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
(async()=>{const {AUR203_DESERT_A_ART}=await import('../js/assets/aur203DesertAArt.js');await runPaintedSpeciesSuite({ids:Object.keys(AUR203_DESERT_A_ART),scope:'aur203-desert-a',characterName:'A203DesertA'});})().catch(error=>{console.error(error);process.exitCode=1;});
