# Task10 north expansion3b original art

Eight original imagegen-painted creatures reserved by `work/task10/next48-reservations.json` key `north3b`. Actual `getRegionContent` camps and `climateAt` were checked: seven snow camps; only north-species-039 is volcanic. No runtime registration is implied by this art pack.

|ID / English name / base type / actual climate / locomotion|
|---|
|north-species-020 / Antler musk wolf / iceWolf / snow / quadruped|
|north-species-024 / Ribbon-tailed snow jackal / iceWolf / snow / quadruped|
|north-species-029 / Icewheel sentinel / frostGolem / snow / heavy|
|north-species-032 / Rime-root colossus / frostGolem / snow / heavy|
|north-species-034 / Shieldback glacier bear / snowBear / snow / quadruped|
|north-species-036 / Sabre-cheek snow dhole / iceWolf / snow / quadruped|
|north-species-039 / Furnace-rib ash wolf / iceWolf / volcanic / quadruped|
|north-species-041 / Bell-ear frost bat / iceBat / snow / winged|

`manifest.json` contains localized RU/EN/ES names and two proposed existing ability IDs, with no stats or drops. Anatomies differ: antlered musk wolf, twin ribbon-tail jackal, icewheel golem, root-club golem, shell-armored bear, sabretooth dhole, furnace-rib wolf and bell-eared bat.

All original generated sheets remain `*-original.png`; generated outputs under `/workspace/generated_images` remain preserved. Spacing repairs are preserved separately as `*-reflow.png`, never replacing originals. No scripted image cleanup, background segmentation, recoloring, anatomy or pose synthesis. Packing uses Canvas to uniformly register each complete equal source cell inside the atlas gutters.

Atlas specification: RGBA1024x1152, eight128px columns n/ne/e/se/s/sw/w/nw and six192px rows idle/run-a/run-b/attack/hurt/death. Metadata contains measured per-pose footlines, display scale, annotation height, frame dimensions and drawnDeath. A pose bank is one painted phase per direction, not a complete multiframe film clip. Beige composited QA sheets preserve final inspection views.

Rebuild: `node scripts/pack-north-expansion3b.cjs`.
Validate: `node scripts/validate-north-expansion3b.mjs`.

Validation requires48 nonempty poses per model, six distinct state alpha silhouettes per direction, exact measured footlines, over60% zero-alpha texels and zero alpha in all12px side,70px top and18px bottom gutters. `validation.json` records dimensions, minimum painted pixel counts and SHA256 for each output. Gutter validation alone cannot detect neighboring fragments; final composited poses require visual review.

Each decoded atlas is4,718,592bytes. Parent integration must register species/names/abilities, preserve stats and drops, use lazy texture leases and verify runtime AI, rendering, localization and resource release in browser before counting these as live. This worker did not edit shared runtime/catalog/tests/package/CI/Git/hosting or perform game browser QA.

Final visual review: all384 final packed poses inspected across8 beige QA sheets. Five first-pass sheets had tiny neighboring anatomy fragments that mechanical gutters missed; imagegen reflow repaired020/024/034/036/039. Originals and final repair sources are retained. The unchanged029/032/041 sheets were clean. Final384 pose visual review PASS is recorded in `visual-review.json`.
