# Forest expansion 4a original art package

Eight independent original painted models, each with48 drawings in eight directions (n/ne/e/se/s/sw/w/nw) and six banks (idle/run-a/run-b/attack/hurt/death). These are six single-frame pose banks, not complete animation clips. All original and imagegen repaired source sheets remain preserved. Runtime registration and gameplay verification are separate.

Rebuild: `node scripts/pack-forest-expansion4a.cjs` (Python/Pillow; no browser). Validate: `node scripts/validate-forest-expansion4a.mjs`.

All384 final poses were manually inspected on beige composites; visual-qa.json and validation.json record passing evidence. The mechanical packer registers complete source rectangles in blank corridors, resizes without masking or altering anatomy, and places them in1024×1152 RGBA atlases with128×192 cells. No alpha thresholding, background erasure, recoloring, synthesized poses or cropped anatomy is used. Alpha>128 is measured only for native height and actual per-pose footlines. Several sheets require source rectangle boundaries adjusted into visible blank corridors because generated rows/columns drift slightly; these registrations preserve entire limbs, wings, tails and weapons.

The exported art map includes native sizes, scale, annotation heights and48 measured footlines. Humanoid native idle heights target72pixels. One atlas costs4,718,592 decoded RGBA bytes. Keep existing lazy texture lease behavior during integration.

Manifest names, biome and proposed existing ability IDs describe art identity. No stats, drops, camp coordinates or gameplay handlers are changed here. Visual review evidence and numeric validation are recorded separately. The final imagegen sheets retain faint antialias alpha around some contours; all required atlas gutters are exactly zero alpha. Some north-facing heads glance sideways and proportions vary slightly across painted views.
