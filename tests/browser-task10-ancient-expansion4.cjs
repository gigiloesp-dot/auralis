// Actual registered candidate gameplay test; not a claim of completed browser verification.
const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
runPaintedSpeciesSuite({ids:["ancient-species-031","ancient-species-033","ancient-species-034","ancient-species-035","ancient-species-037","ancient-species-038","ancient-species-039","ancient-species-040"],scope:"ancient-expansion4",characterName:"P72QA3"}).catch(error=>{console.error(error);process.exitCode=1;});
