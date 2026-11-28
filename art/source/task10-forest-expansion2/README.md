# Forest expansion 2 — eight original painted models, art-only

Eight new original imagegen character sheets for forest species 017/018/020/024/031/034/055/058. Exactly four woodland and four abandoned-city camps, selected from prototypeOnly rows and excluded from the live registry and every prior source manifest. No existing runtime, catalog, registry, stats, drops, positions, package, tests, Git or hosting files were changed. Chrome was not launched.

`manifest.json` supplies RU/EN/ES names, actual base types and biomes, silhouette descriptions and two proposed existing ability IDs. These are proposals for parent integration, not evidence of live behavior.

Eight original source paintings remain as `*-original.png`. Six imagegen reflows repaired cell-boundary foot/tail fragments without programmatic cropping or anatomy edits. `forest-species-031-reflow-v1.png` preserves an intermediate with unwanted pale background; another imagegen edit created the final transparent reflow. Bat024 and spider034 use their already clean originals. The packer always selects final reflows when available.

Outputs: `assets/actors/task10-forest-expansion2/<id>.png` and JSON; `js/assets/forestExpansion2Art.js` exports `FOREST_EXPANSION2_ART`. Every atlas is RGBA1024×1152, 128×192cells, 48 separately painted poses: eight columns n/ne/e/se/s/sw/w/nw and six rows idle/run-a/run-b/attack/hurt/death. These are single-frame banks with two movement drawings, not six complete animation clips. Individual measured footlines, scales and annotation heights are included. Source dimensions vary; packing uniformly scales each complete equal source cell into a96px box with transparent runtime gutters. It never synthesizes poses, crops anatomy, recolors or semantically removes pixels.

Rebuild: `node scripts/pack-forest-expansion2.cjs`.
Validate: `node scripts/validate-forest-expansion2.mjs`.

`validation.json` records PASS for8models/384poses: dimensions,48named frames each, nonempty painted bodies, six distinct state alpha silhouettes per direction,60%+zero-alpha pixels, exact footlines, zero-alpha gutters x<12/x>=116/y<70/y>=174, and output SHA256. Decoded atlas cost4,718,592bytes each; integrate through lazy texture leases.

All384final beige-composited poses were visually inspected; `visual-qa.json` records checks and corrections. No neighbor fragments remain. Low-alpha generator background traces remain in sources but runtime gutters are exactly transparent. Generated direction proportions vary slightly; some north-facing heads look over shoulders, and spider legs naturally overlap in oblique views. Small source figures preserve the required spacing and are enlarged using entry scale to appropriate gameplay heights.

Parent must separately register identities, connect approved actual ability handlers, preserve baseline stats/drops/timing, and verify live visuals, all locales, hurt/death, save/reload, texture leasing and Android behavior. This art-only package makes no game-completion or release claim.
