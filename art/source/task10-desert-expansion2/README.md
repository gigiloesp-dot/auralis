# Eight more original desert candidates

Art-only expansion2 handoff. These IDs were `prototypeOnly`, absent from the registered 73 candidates and every existing source manifest when reserved. No existing runtime, registry, catalog, ledger, Git, hosting, CI, stats, drops, camp positions, or gameplay tests were edited. No gameplay browser acceptance was run. Do not count these as finished in-game species.

| Stable ID | Original design | Actual existing base / locomotion |
|---|---|---|
| desert-species-015 | Sawcrest burrow worm: limbless saw-toothed tube with circular maw | desertSnake / serpent |
| desert-species-016 | Pitcher-shell hermit: ceramic water pitcher, red crab legs and stalk eyes | scarab / crawler |
| desert-species-017 | Obelisk strider: narrow black monolith, pillar feet and rope fists | ancientSentinel / heavy |
| desert-species-018 | Oasis jelly lantern: palm-leaf umbrella, water bell and curled tendrils | arcaneWisp / hover |
| desert-species-019 | Anklet-ring sand wyrm: hammerhead, gold neck rings and forked tail | desertSnake / serpent |
| desert-species-021 | Dust loom spider spirit: floating hooked bronze wheel with gauze tassels | arcaneWisp / hover |
| desert-species-022 | Salt-horned ramolith: crystalline fleece, huge spiral horns, heavy hooves | ancientSentinel / heavy |
| desert-species-027 | Fan-tailed scorpion: arched jade body, ivory legs and five-point fan tail | scarab / crawler |

Every selected actual camp is sand biome. Manifest includes RU/EN/ES names, actual baseType/biome, and two proposed existing ability IDs. Proposed patterns are art handoff data; integration must preserve base geometry, timing, stats, loot and respawn.

Each runtime PNG is 1024×1152 transparent RGBA, with 128×192 cells and 48 independently painted poses. Columns: n/ne/e/se/s/sw/w/nw. Six banks: idle/run-a/run-b/attack/hurt/death. Two movement drawings are provided, not six complete multiframe clips. Per-pose footlines and scale are recorded in DESERT_EXPANSION2_ART. Each decoded atlas uses 4,718,592 bytes; integrate through lazy ActorTextureCache leases.

All generated 1448×1086 originals are preserved. Five sheets (017/019/021/022/027) received imagegen cutout edits to remove pale backgrounds/haze; every intermediate remains on disk. Mechanical packing scales complete equal source cells into a 96px box, preserving anatomy. No generated recolors, procedural anatomy, or semantic programmatic cleanup was used. Generator sources can retain faint low-alpha edge/background traces; beige QA composites show final appearance. No >128-alpha pixel touches any equal source-cell boundary in any selected source.

All 384 final beige-composited poses were visually inspected: complete contained extremities, distinct directions, two movement poses, attack/recoil/death poses, and no severed neighboring fragments. Directional proportions and pose sizes vary slightly. QA composites are viewing aids, not runtime files. `provenance.json` retains original prompts and generation source paths.

From repository root:

```sh
node art/source/task10-desert-expansion2/pack.cjs
node art/source/task10-desert-expansion2/validate.mjs
```

Validation PASS: 8 models/384 nonempty poses; six distinct alpha silhouettes per direction; measured footlines; SHA256 per atlas; over 60% fully transparent runtime texels; exact zero alpha in x<12/x>=116/y<70/y>=174 gutters. Registry status and browser acceptance remain false. Parent integration still needs actual ability callbacks, correct locomotion, three localized labels, hurt/death rendering, 30-second respawn/save/reload and released texture leases before claiming completion.
