# Task10 ancient expansion4 original art

Eight original models and 384 drawn poses, frozen for parent runtime integration. The manifest follows actual camp base types, biomes and locomotion. Existing stats and drops remain preserved by integration.

Each runtime atlas is 1024×1152 RGBA: eight directions n/ne/e/se/s/sw/w/nw and six banks idle/run-a/run-b/attack/hurt/death in 128×192 cells. All sides have 12px, top 70px and bottom 18px alpha-zero gutters; more than 60% of every atlas is alpha zero. Footlines measure actual painted feet/body bottoms.

Originals, rejected wrong archetypes, imagegen semantic/transparency repairs and intermediate rejected edits remain preserved. Packing only uniformly resamples complete source cells or complete pose sourceRects. SourceRects follow clear corridors between poses. Every sourceRect edge has alpha at most 8, proving no painted anatomy meets a cut; faint generated antialias haze is retained. No alpha channel is thresholded, masked or erased. The crystal scarab source direction columns are mechanically remapped. No poses are mirrored or reused.

Every final pose was visually reviewed on native beige and dark contact sheets. See visual-review.json and registration.json, including complete per-pose sourceRects, boundary alpha and measured footlines.

Rebuild and validate from the repository root:

```sh
python scripts/pack-ancient-desert-expansion4.py ancient
python scripts/validate-ancient-desert-expansion4.py ancient
```

The module exports ANCIENT_EXPANSION4_ART and ancientExpansion4Art. Live registration, game tests and browser acceptance belong to parent integration.
