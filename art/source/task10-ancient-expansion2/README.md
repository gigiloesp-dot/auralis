# Eight more original ancient-region creature paintings

This independent art-only pack does not establish runtime integration or completed Task10 species. IDs were prototypeOnly and absent from the integrated resolver and all existing source manifests at reservation time: ancient-species-012,014,017,020,023,027,028,036.

`manifest.json` records proposed RU/EN/ES identities, actual camp base types and biomes, movement/locomotion, silhouette descriptions and two existing ability IDs per creature. The eight designs span six actual biomes: elder-ruins,elder-wastes,elder-marsh,elder-dry,elder-mystic,elder-forest. Proposed numeric ability bounds are review context only; they are not applied to runtime and must not override actual archetype timing or geometry. Stats and drops must remain archetypal during parent integration.

|ID suffix|Original silhouette|Actual base type / biome|
|---|---|---|
|012|Diamond-shaped fossil rib cage and sapphire eye above compact brass bells|arcaneWisp / elder-ruins|
|014|Oxblood-slate heavy biped with paired blunt crescent forearms|ancientSentinel / elder-wastes|
|017|Low duckweed-covered shield beetle with six legs and sickle mandibles|scarab / elder-marsh|
|020|Long knuckle-walking front arms,short rear legs,mosaic aqueduct bridge back|ancientSentinel / elder-dry|
|023|Low indigo snake coil with ivory crescent cheek blades|desertSnake / elder-mystic|
|027|Slender copper biped with funnel diving helm and paired sickle hands|fallenKnight / elder-marsh|
|028|Legless forest snake beneath large acorn-cup bark shield collar|desertSnake / elder-forest|
|036|Sandstone owl-drake with narrow bat wings and forked antlers|ancientGargoyle / elder-dry|

Each creature is independently painted with imagegen; no existing monster image is recolored. All originals and edit passes are preserved.012 and020 use imagegen cutouts to remove generated paper backgrounds.027 required two imagegen background-removal passes: its first cutout retained continuous semitransparent paper haze; the selected `-clean.png` removes it. No procedural anatomy,semantic masks,limb cropping or synthesized poses were used. Some low-alpha generator traces remain in source files; beige composites show actual packed appearance.

Runtime sources are selected by the standalone packer in this order: alternate-original,clean,reflow,cutout,original. All eight sheets are1024×1152RGBA with128×192cells. Columns:n,ne,e,se,s,sw,w,nw. Rows:idle,run-a,run-b,attack,hurt,death. Each model has48 independently drawn poses,including two locomotion drawings,not six complete multiframe clips. Mechanical Canvas packing scales whole equal source cells into a96pxbox and measures exact feet perpose; no anatomy is cut to fit. Annotation target is12worldpixels above idle body. Each decoded texture is4,718,592bytes; parent should lease it lazily through ActorTextureCache.

Rebuild: `node scripts/pack-ancient-expansion2.cjs`

Validate: `node scripts/validate-ancient-expansion2.mjs`

`validation.json` reports PASS for8models/384painted poses:1024×1152RGBA,48nonempty frames/model,6distinct alpha silhouettes per direction,more than60%fully transparent texels,zero alpha in x<12/x>=116/y<70/y>=174 gutters,exact footlines,SHA256,scale and annotation height. Validator also checks8unique manifest IDs,atleast4biomes,3localized names and2distinct existing ability IDs per model. All384final beige-composited poses were visually reviewed for direction,state,complete extremities and neighboring paint fragments. The final027clean sheet was rechecked after the second imagegen edit. Generated proportions/direction variation remains visible,especially the rotationally similar hoverer and low snake coils.

New files only: source folder,runtime PNG/JSON pairs,js/assets/ancientExpansion2Art.js exporting ANCIENT_EXPANSION2_ART,and own pack/validator scripts. No existing/runtime/registry/catalog/ledger/package/CI/test/Git/hosting files or Chrome sessions were changed by this worker. Parent must register/localize identities and ability patterns,preserve numeric archetype stats/geometry/timing/drops,and verify real callbacks,ordinary30srespawn,save/reload,texture leases and browser/Android behavior before claiming in-game completion.
