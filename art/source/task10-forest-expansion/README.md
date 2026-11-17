# Eight original forest creature models — art-only handoff

Eight genuine imagegen-painted models for pending forest species 012, 013, 014, 016, 019, 023, 025 and 026. These preserve their actual catalog archetypes: wolf, thorn snake, raider, bear, wild boar, bat, grove orc and skeleton. They are original character paintings, not recolors or transformations of existing game assets. No live registry, catalog, stats, positions, drops, tests, package files, Git refs or hosting were changed. This pack does not establish in-game completion.

`manifest.json` contains stable IDs, Russian/English/Spanish names, actual base types, biome, distinct silhouette descriptions and two proposed existing ability patterns. Ability patterns are integration proposals; no gameplay code was changed. Preserve current camp stats and loot when integrating.

## Assets and source history

- `assets/actors/task10-forest-expansion/<id>.png` and matching JSON: eight transparent RGBA 1024×1152 atlases.
- `js/assets/forestExpansionArt.js`: exports `FOREST_EXPANSION_ART`, with texture URLs, scales, annotation heights and 48 measured feet for each model. It is deliberately not imported by the live resolver.
- `*-original.png`: all eight original generated paintings, preserved unmodified.
- `*-reflow.png`: six imagegen-edited source sheets correcting row-boundary anatomy bleed in 012/013/016/019/025/026. Packing always selects the final reflow when present.
- `forest-species-016-reflow-v1.png`: preserved rejected intermediate; pale opaque background was removed through another imagegen edit to produce the final reflow.
- `*-composited-qa.png`: all 384 final poses displayed on beige for visual inspection; viewing aids only.

All source sheets contain eight equal columns and six equal rows. Source dimensions vary between 1536×1024 originals and 1448×1086 edited sources. Columns: n/ne/e/se/s/sw/w/nw. Rows: idle/run-a/run-b/attack/hurt/death. All poses are individually painted; movement A/B have opposite gaits or wing strokes, hurt recoils and death collapses. They are six single-frame banks, not six complete multiframe clips.

Mechanical Canvas packing scales each entire source cell uniformly into a 96px box centered within each 128×192 runtime cell. It does not crop anatomy, synthesize poses, recolor, remove semantically selected pixels or repair artwork. All source bleed was repaired using imagegen. Source low-alpha backdrop traces remain almost invisible in composites; actual runtime gutters are exactly zero alpha.

## Verification and rebuild

Run `node scripts/pack-forest-expansion.cjs`, then `node scripts/validate-forest-expansion.mjs`.

`validation.json` records PASS for eight models / 384 painted poses: correct 1024×1152 output, all 48 named frames, over 60% zero-alpha pixels, nonempty poses, six distinct state alpha silhouettes per direction, exact individual measured footlines, zero alpha at x<12, x>=116, y<70 and y>=174 inside every cell, and SHA256 per atlas. Each decoded atlas uses 4,718,592 bytes; bind lazily through existing texture leasing rather than global preload.

`visual-qa.json` records visual review of every final pose after packing. Initial numerical success missed source row bleed; final source reflows were inspected to ensure complete extremities and absence of neighboring fragments. Final raider and bat original sources were already clean. Directions and proportions have small generated variations. The north-facing viper holds its head somewhat over its shoulder. Preserve these known art limits when assessing directional fidelity.

Parent integration must bind these IDs to actual camp inhabitants, localize names, connect the approved existing ability handlers, maintain stats/drops/respawn timing, and verify live rendering, save/reload, lease cleanup and physical Android behavior. Art validation does not count as those checks.
