// Runs the shared real-engine actor/AI/save/texture-lease verification.
const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
(async()=>{const {NORTH_EXPANSION5B_ART}=await import('../js/assets/northExpansion5bArt.js');await runPaintedSpeciesSuite({ids:Object.keys(NORTH_EXPANSION5B_ART),scope:'north-expansion5b',characterName:'North5bQA'});})().catch(error=>{console.error(error);process.exitCode=1;});
