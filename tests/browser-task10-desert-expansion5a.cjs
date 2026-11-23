// Actual registered candidate gameplay test; not a claim of completed browser verification.
const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
runPaintedSpeciesSuite({ids:["desert-species-040","desert-species-041","desert-species-042","desert-species-043","desert-species-044","desert-species-045","desert-species-046","desert-species-047"],scope:"desert-expansion5a",characterName:"P72QA7"}).catch(error=>{console.error(error);process.exitCode=1;});
