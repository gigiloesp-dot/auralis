// Runs the shared real-engine actor/AI/save/texture-lease verification.
const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
(async()=>{const {LEGACY_UPGRADE_A_ART}=await import('../js/assets/legacyUpgradeAArt.js');await runPaintedSpeciesSuite({ids:Object.keys(LEGACY_UPGRADE_A_ART),scope:'legacy-upgrade-a',characterName:'LegacyAQA'});})().catch(error=>{console.error(error);process.exitCode=1;});
