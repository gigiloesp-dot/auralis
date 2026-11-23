// Actual registered candidate gameplay test; not a claim of completed browser verification.
const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
runPaintedSpeciesSuite({ids:["desert-species-048","desert-species-049","desert-species-050","desert-species-051","desert-species-052","desert-species-053","desert-species-054","desert-species-055"],scope:"desert-expansion5b",characterName:"P72QA8"}).catch(error=>{console.error(error);process.exitCode=1;});
