// Runs the shared real-engine actor/AI/save/texture-lease verification.
const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
(async()=>{const {LEGACY_UPGRADE_C_ART}=await import('../js/assets/legacyUpgradeCArt.js');await runPaintedSpeciesSuite({ids:Object.keys(LEGACY_UPGRADE_C_ART),scope:'legacy-upgrade-c',characterName:'LegacyCQA'});})().catch(error=>{console.error(error);process.exitCode=1;});
