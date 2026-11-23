const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
runPaintedSpeciesSuite({ids:["forest-species-044", "forest-species-046", "forest-species-048", "forest-species-050", "forest-species-052", "forest-species-054", "forest-species-057", "forest-species-060"],scope:'forest-expansion4b',characterName:'F4bQA'}).catch(error=>{console.error(error);process.exitCode=1;});
