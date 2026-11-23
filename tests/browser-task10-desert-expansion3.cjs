const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
runPaintedSpeciesSuite({ids:["desert-species-020","desert-species-024","desert-species-025","desert-species-026","desert-species-028","desert-species-029","desert-species-030","desert-species-031"],scope:'desert-expansion3',characterName:'D3QA'}).catch(error=>{console.error(error);process.exitCode=1;});
