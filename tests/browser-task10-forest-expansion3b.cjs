const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
runPaintedSpeciesSuite({ids:["forest-species-022","forest-species-028","forest-species-030","forest-species-033","forest-species-036","forest-species-038","forest-species-040","forest-species-042"],scope:'forest-expansion3b',characterName:'F3bQA'}).catch(error=>{console.error(error);process.exitCode=1;});
