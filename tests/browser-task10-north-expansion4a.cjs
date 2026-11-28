// Actual registered candidate gameplay test; not a claim of completed browser verification.
const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
runPaintedSpeciesSuite({ids:["north-species-042","north-species-044","north-species-046","north-species-048","north-species-050","north-species-052","north-species-054","north-species-056"],scope:"north-expansion4a",characterName:"P72QA1"}).catch(error=>{console.error(error);process.exitCode=1;});
