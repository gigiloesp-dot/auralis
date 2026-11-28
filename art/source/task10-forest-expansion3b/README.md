# Forest expansion 3b — eight original painted models

Art-only handoff for reserved IDs 022/028/030/033/036/038/040/042. Actual camp types and climate were read through getRegionContent and climateAt: raider/wolf/bat/skeleton/wolf are woodland; snake/boar/bear are abandoned-city. Manifest supplies RU/EN/ES names and two proposed existing ability IDs for each; no stat proposals or runtime registration.

Eight new imagegen originals are preserved. The 022 original had an opaque noisy background; its imagegen cutout is retained. Imagegen reflows shrink and reposition complete paintings for 022/030/033/038/040/042. All originals, cutout and reflows remain. Original-only 028 and036 were clean. No anatomy, pixels or poses were synthesized through code, recolored or semantically erased.

Rebuild with `node scripts/pack-forest-expansion3b.cjs`; validate with `node scripts/validate-forest-expansion3b.mjs`. Mechanical Canvas registration scales full source cells into transparent target cells. The 022 reflow has uneven source row spacing, so explicit whitespace row bounds [0,220,385,540,715,900,1086] register entire intact figures at uniform scale; no body parts are cropped. Other sheets use equal source cells.

Each output is RGBA 1024x1152 with 128x192 cells, eight columns n/ne/e/se/s/sw/w/nw, six rows idle/run-a/run-b/attack/hurt/death. There are 48 separate paintings, not six complete animation clips. Per-pose measured footlines, scale, annotationHeight and drawnDeath are supplied by js/assets/forestExpansion3bArt.js export FOREST_EXPANSION3B_ART. Atlas entries are deliberately small in-cell and enlarged by runtime scale to the required gameplay height.

validation.json records PASS for all384poses: exact dimensions, named frames, nonempty bodies, six distinct state silhouettes per direction, 60%+zero alpha, exact measured footlines, 12px side/70px top/18px bottom zero-alpha gutters and SHA256. Decoded atlas cost is 4,718,592bytes each; parent integration should retain lazy texture leases.

All384final beige-composited poses were visually inspected; visual-qa.json records results. Initial numeric PASS concealed floating boots/paw/wing fragments, which were corrected in preserved imagegen reflows and full-body source registration. Final QA contains no detached neighbor fragments. Minor direction-angle/proportion variation remains intrinsic to the generated paintings. Low-alpha traces in originals are preserved and appear unobtrusive in final compositions.

No shared runtime/catalog/tests/package/CI/Git/hosting files were changed. Headless Canvas was used only for mechanical packing; no game/browser gameplay QA was performed. Parent must integrate identities/approved handlers and verify locales, live visuals, hurt/death, save/reload, texture leasing and Android behavior before making an in-game completion claim.
