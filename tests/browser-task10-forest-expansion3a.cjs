const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
runPaintedSpeciesSuite({ids:["forest-species-021","forest-species-027","forest-species-029","forest-species-032","forest-species-035","forest-species-037","forest-species-039","forest-species-041"],scope:'forest-expansion3a',characterName:'F3aQA'}).catch(error=>{console.error(error);process.exitCode=1;});
