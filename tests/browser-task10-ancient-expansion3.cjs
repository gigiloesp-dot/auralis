const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
runPaintedSpeciesSuite({ids:["ancient-species-015","ancient-species-016","ancient-species-018","ancient-species-022","ancient-species-024","ancient-species-025","ancient-species-026","ancient-species-030"],scope:'ancient-expansion3',characterName:'A3QA'}).catch(error=>{console.error(error);process.exitCode=1;});
