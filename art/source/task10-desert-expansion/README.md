# Eight original desert species candidates

These eight previously `prototypeOnly` IDs have original imagegen paintings and packed atlases. Parent-authorized registration now appends their art and name/ability patterns to speciesArtRegistry.js and speciesRuntime.js. Unit verification passes; browser acceptance remains pending. No catalog, ledger, stats, drops, camp positions, quests, CI, Git, or hosting was edited.

| ID | Original silhouette | Existing base / locomotion |
|---|---|---|
| desert-species-006 | Glass-frilled sidewinder: glass scallop hood, long limbless coil | desertSnake / serpent |
| desert-species-008 | Kilnback walker: furnace-arched stone quadruped | ancientSentinel / heavy |
| desert-species-009 | Sickle-jawed dune beetle: triangular shell, huge sickle jaws | scarab / crawler |
| desert-species-010 | Mirage ribbon spirit: crescent mask, looping blue ribbons, no legs | arcaneWisp / hover |
| desert-species-011 | Thorn-crowned sand eel: shovel snout, antler thorns, segmented sail | desertSnake / serpent |
| desert-species-012 | Sieve-mouthed sand crab: flat shell, asymmetric spoon claw | scarab / crawler |
| desert-species-013 | Cactus bell colossus: ribbed bell torso, root feet, flower crown | ancientSentinel / heavy |
| desert-species-014 | Sun-dial ray: sundial body, gnomon crest, fan wings, forked tail | arcaneWisp / hover |

All eight actual camps are sand biome. `manifest.json` includes stable IDs, RU/EN/ES names, actual catalog baseType and biome, and two proposed existing ability IDs per model. The two existing ability patterns are now registered and pass real FSM unit verification while preserving complete base geometry/timing. Browser verification remains pending.

Each runtime atlas is 1024×1152 transparent RGBA, 128×192 per cell. Columns: n, ne, e, se, s, sw, w, nw. Rows: idle, run-a, run-b, attack, hurt, death. These are 48 painted poses per creature, including two movement drawings, rather than six full animation clips. Footlines are measured individually for every pose. Each atlas decodes to 4,718,592 bytes; load lazily through the existing ActorTextureCache lifecycle.

All original 1448×1086 generated paintings are preserved as `*-original.png`. Imagegen reflows repaired source-edge touches for 006/009/011/012/014; the eel reflow also removed a detached neighboring tail fragment. The first ray reflow retained a pale low-alpha background, so a further imagegen cutout removed it; both intermediate and final sources are preserved. No anatomy, recolors, semantic cutouts, or poses were synthesized programmatically. Canvas packing only scales whole equal source cells into a 96px box. Source generation paths/prompts are retained in `provenance.json`.

All 384 final beige-composited poses were visually inspected: complete contained extremities, no severed neighboring fragments, readable directions and distinct movement/attack/hurt/death poses. `*-composited-qa.png` files are viewing aids only. Generator directional proportions and pose sizes vary somewhat; final in-game visual acceptance remains with parent integration.

From repository root:

```sh
node art/source/task10-desert-expansion/pack.cjs
node art/source/task10-desert-expansion/validate.mjs
```

`validation.json` reports PASS: 8 models, 384 nonempty painted poses, six distinct alpha silhouettes per direction, measured feet, SHA256 hashes, over 60% fully transparent runtime texels, and exactly zero alpha in x<12/x>=116/y<70/y>=174 runtime gutters. Transparent gutters alone do not prove live integration. Parent must run the prepared eight-ID browser driver to verify movement and respawn/save/reload and released texture leases before counting these as in-game species. `node --test tests/task10DesertExpansion.test.mjs` passes PNG, actual two-release FSM callbacks, numeric stat/drop invariants, and complete base profile equality except added abilityPattern. Chrome has not been launched for this expansion yet.
