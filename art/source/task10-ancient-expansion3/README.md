# Ancient expansion 3: eight original creature paintings

Art-only handoff for reserved ordinary species 015,016,018,022,024,025,026,030. These assets do not establish runtime integration or browser completion.

All eight designs were independently created with imagegen. They are original anatomy and silhouettes, rather than recolors: a chisel-snouted stone snake; a bell-tower heavy biped; a millstone-backed basalt biped; a rib-winged jackal gargoyle; a fan-tailed frog gargoyle; a reed-crowned slender snake; an amphora-shell six-legged scarab; and a broad paddle-tailed mire snake.

Actual `getRegionContent` camps and `climateAt` supply the base types and biomes. The reserved IDs span three of the region's six climates: elder-ruins (015,016,024,026), elder-wastes (018,022), elder-marsh (025,030). Serpents remain legless ground creatures; sentinels retain heavy ground locomotion; gargoyles retain wings and flight; the scarab retains crawling arthropod anatomy. Manifest includes RU/EN/ES names, two existing ability IDs per species and preservation flags. No numerical stats, drops or ability geometry are supplied or changed.

Each runtime sheet is 1024x1152 RGBA, 128x192 cells, columns n/ne/e/se/s/sw/w/nw, rows idle/run-a/run-b/attack/hurt/death. Forty-eight distinct painted poses per model include two locomotion drawings and a collapsed death drawing; these are pose banks rather than complete multiframe animation clips. Standalone Canvas packing scales whole equal source cells, preserves all anatomy and measures exact alpha>128 footlines for every pose. It does not synthesize anatomy, remove backgrounds or crop individual bodies. Each decoded texture occupies 4,718,592 bytes and should be leased lazily during parent integration.

Every original is preserved. Original 022 and 025 contained source-grid tail crossings that numeric gutter tests alone missed. Imagegen reflow edits shrink and recenter the complete poses into their cells; both edits and rejected original beige QA composites remain preserved. The other six use their original generated transparent files. No procedural removal or semantic masking was used.

All 384 final poses were visually inspected on eight beige-composited contact sheets for complete extremities, row and direction order, state variation, background transparency and neighboring fragments. Both reflow sheets were re-inspected after packing; final contact sheets have no neighboring paint fragments. Generated directional/body proportion variation remains visible, especially serpentine coils and compact gargoyle wing articulation.

Rebuild: `node scripts/pack-ancient-expansion3.cjs`

Validate: `node scripts/validate-ancient-expansion3.mjs`

The validator checks eight unique models, actual camp/base type/climate/locomotion mapping, localized identities, two distinct existing ability IDs, absence of numeric stat overrides, 48 nonempty frames each, six distinct state alpha silhouettes per direction, >60% fully transparent pixels, zero-alpha 12px side/70px top/18px bottom gutters, measured feet, SHA256, scales and annotation heights. `validation.json` records PASS for 384 poses. Visual review is complementary because gutter checks alone cannot detect source-row fragments already moved inside a destination cell.

Created only this source folder, matching runtime PNG/JSON pairs, `js/assets/ancientExpansion3Art.js`, and the own pack/validator scripts. No shared resolver, runtime, catalog, package, CI, tests, Git, hosting or Chrome game session was changed. Parent must integrate names and abilities while retaining numeric archetype stats/drops/timing/geometry, and verify runtime callbacks, ordinary respawn, persistence, texture leases and browser behavior before marking live.
