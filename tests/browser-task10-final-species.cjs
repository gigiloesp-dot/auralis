// Actual registered candidate gameplay test; not a claim of completed browser verification.
const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
runPaintedSpeciesSuite({ids:["forest-species-077","forest-species-078","forest-species-079","north-species-074","north-species-075","ancient-species-042","ancient-species-043","ancient-species-044"],scope:"final-species",characterName:"P72QA9"}).catch(error=>{console.error(error);process.exitCode=1;});
