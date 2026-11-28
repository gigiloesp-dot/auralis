// Actual registered candidate gameplay test; not a claim of completed browser verification.
const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
runPaintedSpeciesSuite({ids:["forest-species-069","forest-species-070","forest-species-071","forest-species-072","forest-species-073","forest-species-074","forest-species-075","forest-species-076"],scope:"forest-expansion5b",characterName:"P72QA6"}).catch(error=>{console.error(error);process.exitCode=1;});
