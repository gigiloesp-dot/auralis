const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
runPaintedSpeciesSuite({ids:["north-species-013","north-species-023","north-species-025","north-species-031","north-species-033","north-species-035","north-species-038","north-species-040"],scope:'north-expansion3a',characterName:'N3aQA'}).catch(error=>{console.error(error);process.exitCode=1;});
