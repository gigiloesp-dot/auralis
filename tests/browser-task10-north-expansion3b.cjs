const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
runPaintedSpeciesSuite({ids:["north-species-020","north-species-024","north-species-029","north-species-032","north-species-034","north-species-036","north-species-039","north-species-041"],scope:'north-expansion3b',characterName:'N3bQA'}).catch(error=>{console.error(error);process.exitCode=1;});
