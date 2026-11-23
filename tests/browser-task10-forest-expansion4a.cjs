const {runPaintedSpeciesSuite}=require('./paintedSpeciesHarness.cjs');
runPaintedSpeciesSuite({ids:["forest-species-043", "forest-species-045", "forest-species-047", "forest-species-049", "forest-species-051", "forest-species-053", "forest-species-056", "forest-species-059"],scope:'forest-expansion4a',characterName:'F4aQA'}).catch(error=>{console.error(error);process.exitCode=1;});
