// Runs the shared real-engine actor/AI/save/texture-lease verification.
const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
(async()=>{const {LEGACY_UPGRADE_B_ART}=await import('../js/assets/legacyUpgradeBArt.js');await runPaintedSpeciesSuite({ids:Object.keys(LEGACY_UPGRADE_B_ART),scope:'legacy-upgrade-b',characterName:'LegacyBQA'});})().catch(error=>{console.error(error);process.exitCode=1;});
