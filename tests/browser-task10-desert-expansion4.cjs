// Actual registered candidate gameplay test; not a claim of completed browser verification.
const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
runPaintedSpeciesSuite({ids:["desert-species-032","desert-species-033","desert-species-034","desert-species-035","desert-species-036","desert-species-037","desert-species-038","desert-species-039"],scope:"desert-expansion4",characterName:"P72QA4"}).catch(error=>{console.error(error);process.exitCode=1;});
