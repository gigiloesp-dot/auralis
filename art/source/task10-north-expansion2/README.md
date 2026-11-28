# Task10 NORTH second original creature expansion

Eight new original imagegen-painted ordinary fantasy creatures, selected from prototypeOnly NORTH rows after excluding every integrated art ID and all source manifests. Four actual snow camps and four actual volcanic camps. This art-only pack is outside live runtime registration and outside the published checkpoint. It does not establish live species completion.

|Stable ID|RU / EN / ES names|Actual baseType / biome / locomotion|
|---|---|---|
|north-species-015|Парусоспинный песец / Sailspine snow fox / Zorro níveo de velas dorsales|iceWolf / snow / quadruped|
|north-species-022|Ледниковый курганник / Glacier cairn giant / Gigante de túmulo glaciar|frostGolem / snow / heavy|
|north-species-027|Бивнебородый белый медведь / Tuskbearded polar mauler / Oso polar de barba de colmillos|snowBear / snow / quadruped|
|north-species-030|Снеголикий совокрыл / Snowmask owl bat / Murciélago lechuza de máscara nívea|iceBat / snow / winged|
|north-species-006|Обсидиановый пращник / Obsidian sling kobold / Kóbold de honda obsidiana|snowRaider / volcanic / biped|
|north-species-019|Углекрылая манта / Ember manta bat / Murciélago manta de brasas|iceBat / volcanic / winged|
|north-species-028|Цепефонарный пепельник / Chainlantern ash wraith / Espectro de ceniza del farol encadenado|wraith / volcanic / hover|
|north-species-037|Двупастный пепельный гончий / Twinjaw cinder hound / Sabueso de ceniza de dos fauces|iceWolf / volcanic / quadruped|

`manifest.json` includes anatomy descriptions, stable IDs, RU/EN/ES names, actual baseType/biome/locomotion and two proposed existing ability IDs per species. It contains no changed numeric stats or drops. These remain integration proposals only.

Each final runtime sheet is transparent RGBA 1024×1152, 128×192 cells, eight columns n/ne/e/se/s/sw/w/nw and six rows idle/run-a/run-b/attack/hurt/death. All48 poses are independent painted action/direction drawings, with two movement phases and full drawn collapsed death poses. These are not six complete multiframe animation clips. Per-pose footlines, display scale and annotation height are in `js/assets/northExpansion2Art.js`, export `NORTH_EXPANSION2_ART`.

All8 original generated sheets remain as `*-original.png`, copied from generation outputs left intact under `/workspace/generated_images`. Imagegen edited6 sheets into preserved `*-reflow.png` sources to repair neighboring fragments and spacing; the bear also required removal of its opaque pale background. All384 final beige-composited poses were visually inspected: no visible neighboring severed fragments, no clipped anatomy, no opaque background panels. The golem and kobold originals were already clean. The final originals/reflows retain all artwork, and no source has been overwritten or deleted. These8 silhouettes differ by anatomy and locomotion, not by recoloring existing art.

Mechanical Canvas packing scales whole equal source cells into a96px area inside required gutters. No programmatic recoloring, background segmentation, anatomy invention or semantic image cleanup. Generated tiny material details and directional proportions naturally vary. Some source sheets retain very low-alpha generation traces; final beige composites document actual packed visual appearance.

Rebuild: `node scripts/pack-north-expansion2.cjs`.
Validate: `node scripts/validate-north-expansion2.mjs`.

`validation.json` records PASS for8models/384nonemptyposes, dimensions and SHA256 per runtimePNG. Checks require6 distinct alpha silhouettes per direction, all48exactmeasuredfootlines, more than60%fullytransparenttexels, and ZERO alpha in every cell's x<12 / x>=116 / y<70 / y>=174 gutters.

Every decoded atlas is4,718,592bytes; integrate lazily through texture leases/cache rather than global preload. Parent must register stable IDs, proposed names and real ability patterns while preserving all current numeric stats, drops, geometry and timing, then verify real streamed AI,48pose rendering,3locales,30-secondrespawn,save/reload and leasecleanup before claiming live species. Physical Android acceptance is separate.

Only new expansion2 source/runtime-art/metadata paths and own new pack/validator scripts were created. No existing files, shared runtime, registries, catalogs, ledger, tests, packages, Git refs, hosting or Chrome were changed or launched by this batch.
