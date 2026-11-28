# Forest expansion 3a — eight original painted models

Art-only package for reserved IDs 021, 027, 029, 032, 035, 037, 039, 041. Archetypes and coordinates were read from TASK10_LAYOUT; climateAt confirms seven woodland camps and the abandoned-city wolf037. No stats, drops, camps, runtime registration, catalog, shared tests, package, CI, Git or hosting files were edited.

Eight independently generated original imagegen sheets preserve original anatomy and distinct silhouettes. Six sheets received imagegen transparency/reflow repairs. Orc035 received four preserved reflows (`reflow-v1` through `reflow-v4`). Initial v2 was clean but too small. V3 enlarged source detail but introduced minor row-boundary marks; final v4 retains crisp larger complete figures and removes those marks. All originals remain in this folder and the original generated_images paths remain intact. No programmatic anatomy cropping, recoloring, background masking or pose synthesis was used.

The mechanical Canvas packer scales complete equal source cells to a 96px box and positions them inside 128×192 cells. Sources and all reflows remain preserved. Atlas outputs are RGBA1024×1152 with eight directions n/ne/e/se/s/sw/w/nw and six rows idle/run-a/run-b/attack/hurt/death, 48 separate drawings each. Individual measured alpha>128 footlines, target-height scales and annotation heights are exported by `js/assets/forestExpansion3aArt.js` as FOREST_EXPANSION3A_ART. These are six single-frame banks including two movement drawings, not complete animation clips.

Rebuild: `node scripts/pack-forest-expansion3a.cjs`.
Validate: `node scripts/validate-forest-expansion3a.mjs`.

`validation.json` records dimensions, 48 named frames, >200 opaque pixels per pose, six distinct state silhouettes per direction, >60% zero-alpha pixels, exact measured footlines and fully transparent gutters x<12/x>=116/y<70/y>=174. Every model costs 4,718,592 decoded RGBA bytes; use existing lazy texture leases on integration. `visual-qa.json` records manual inspection of all384 final poses on beige composites, including corrections the numeric gutter test missed.

`manifest.json` supplies RU/EN/ES names, actual baseType and climate biome, distinctive silhouettes and two proposed existing ability IDs. Proposals do not alter gameplay or demonstrate live abilities. Parent integration must separately register identity/ability handlers, preserve baseline values and verify live visuals, locale names, hurt/death, save/reload, leases and Android behavior. No Chrome gameplay QA was performed and this package makes no release or live claim.

Limitations: some north-facing heads glance sideways; slight painted proportion changes occur across directions. Orc035 final v4 idle silhouettes measure 68–70 native pixels after packing; scale1.1 targets77 world pixels, avoiding the prior2.0488× enlargement. All48 final orc poses were reinspected and are complete and free of detached neighbor fragments.
