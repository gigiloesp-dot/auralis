// Real actor, ability, localization, persistence and texture-lifetime coverage.
const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
(async()=>{const {AUR203_DESERT_F_ART}=await import('../js/assets/aur203DesertFArt.js');await runPaintedSpeciesSuite({ids:Object.keys(AUR203_DESERT_F_ART),scope:'aur203-desert-f',characterName:'A203DesertF'});})().catch(error=>{console.error(error);process.exitCode=1;});
