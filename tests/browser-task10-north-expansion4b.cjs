// Actual registered candidate gameplay test; not a claim of completed browser verification.
const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
runPaintedSpeciesSuite({ids:["north-species-043","north-species-045","north-species-047","north-species-049","north-species-051","north-species-053","north-species-055","north-species-057"],scope:"north-expansion4b",characterName:"P72QA2"}).catch(error=>{console.error(error);process.exitCode=1;});
