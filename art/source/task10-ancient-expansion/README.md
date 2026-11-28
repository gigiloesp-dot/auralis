# Eight original ancient-region creature paintings

Art-only expansion; these files do not establish live integration or completed Task10 species. `manifest.json` maps eight existing prototype IDs to actual camp base types/biomes, localized proposed names, silhouette descriptions and bounded proposals using two existing abilities. Current stats, drops and camps remain unchanged.

IDs: ancient-species-005,008,010,011,019,021,029,041. Models: bone-maned ash viper; pillarback sentinel; cracked amphora wisp; clockwork ruin scarab; bark-spined fallen knight; bone-frilled gargoyle; sickleflame marsh wisp; fungal-crown scarab. Each has a different painted silhouette, consistent with its actual serpent/heavy/hover/crawler/biped/winged locomotion and biome. No recolored existing game models, procedural anatomy, or synthesized poses.

Every source is generated using imagegen; all original images and subsequent edits are preserved. Runtime source selection is alternate-original, clean, reflow, cutout, original, in that order. The final fungal scarab uses `041-alternate-original.png`: the earlier generation and edit attempts had stray paint fragments, so an entirely new original was generated. Those rejected attempts remain for provenance and are not runtime textures. Gargoyle and marsh wisp use imagegen reflows to separate poses; the original fungal source required imagegen background removal. No programmatic semantic image edits or anatomy crops were used.

Runtime atlases are 1024×1152 transparent RGBA with 128×192 cells. Columns: n,ne,e,se,s,sw,w,nw. Rows: idle,run-a,run-b,attack,hurt,death. These are 48 individual paintings, with two locomotion drawings; they are not six complete multiframe clips. Mechanical Canvas packing fits whole equal source cells into a96px box and records exact per-pose measured footlines. Annotation is12 world pixels above measured idle body. Each decoded atlas uses4,718,592 bytes; parent should acquire these lazily through ActorTextureCache.

Rebuild: `node scripts/pack-ancient-expansion.cjs`

Validate: `node scripts/validate-ancient-expansion.mjs`

`validation.json` reports eight models and384 nonempty painted poses, dimensions, exact per-pose footlines, six distinct alpha silhouettes per direction, more than60% fully transparent texels, zero alpha in x<12/x>=116/y<70/y>=174 gutters, SHA256 and measured scales. All384 final poses were visually inspected in preserved beige `*-composited-qa.png` sheets. Complete extremities stay within their cells, with no neighboring severed parts in final runtime sources. Slight imagegen directional/proportion variation remains visible, especially the rotationally similar amphora wisp.

Files include the standalone `ANCIENT_EXPANSION_ART` export in js/assets/ancientExpansionArt.js, packer, validator and runtime PNG/JSON pairs. No shared runtime registry, catalog, stats, drops, tests, package files, Git refs or hosting were changed by this worker. Parent integration must localize names, bind these IDs, review the bounded two-ability proposals, preserve stats/drops, and separately verify ability callbacks,30srespawn,save/reload,texture leases and browser/Android behavior. Only after those checks should any species be claimed as in-game ready.
