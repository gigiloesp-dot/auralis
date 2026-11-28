// Real actor, ability, localization, persistence and texture-lifetime coverage.
const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
(async()=>{const {AUR203_DESERT_G_ART}=await import('../js/assets/aur203DesertGArt.js');await runPaintedSpeciesSuite({ids:Object.keys(AUR203_DESERT_G_ART),scope:'aur203-desert-g',characterName:'A203DesertG'});})().catch(error=>{console.error(error);process.exitCode=1;});
