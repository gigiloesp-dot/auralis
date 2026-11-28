// Runs the shared real-engine actor/AI/save/texture-lease verification.
const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
(async()=>{const {NORTH_EXPANSION5A_ART}=await import('../js/assets/northExpansion5aArt.js');await runPaintedSpeciesSuite({ids:Object.keys(NORTH_EXPANSION5A_ART),scope:'north-expansion5a',characterName:'North5aQA'});})().catch(error=>{console.error(error);process.exitCode=1;});
