// Actual registered candidate gameplay test; not a claim of completed browser verification.
const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
runPaintedSpeciesSuite({ids:["forest-species-061","forest-species-062","forest-species-063","forest-species-064","forest-species-065","forest-species-066","forest-species-067","forest-species-068"],scope:"forest-expansion5a",characterName:"P72QA5"}).catch(error=>{console.error(error);process.exitCode=1;});
