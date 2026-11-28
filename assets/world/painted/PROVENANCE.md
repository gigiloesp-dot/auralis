# Painted environment props

`environment-props.png` is a real unmodified generated RGBA PNG,1536×1024, six512×512square cells. It contains one oak, pine, cypress, rock cluster, ruined stone arch and village house in reading order. This is a six-prop static atlas, not an animated character sheet.

Generated on2026-11-12 by the built-in OpenAI image-generation tool during the user's authorized Auralis development session. Original output remains at `/workspace/generated_images/exec-7780aaa3-34ea-424d-8c1a-ef43d89590dc.png`. The repository PNG is a byte-for-byte copy. No cropping, compositing, background removal, resizing, pixel repainting or image conversion was performed by scripts. The atlas JSON describes six rectangles in that same original image.

Art direction: coherent painterly2.5D fantasy, upright objects viewed from a30degree isometric angle, warm upper-left light, muted natural colors, transparent empty space. One object per square, no text, logos, grids, frames or connecting scenery. Rock is lower and shorter than trees/house. Arch includes chipped limestone and ivy; house has warm shingles, half-timbered walls and a stone foundation. No external photographs, third-party game images or named artist references were supplied.

Usage and redistribution of generated output follow applicable OpenAI terms; no exclusive copyright or third-party asset license is asserted here.

## Actual alignment and transparency

The model produced clean separate objects with lower contact points than the requestedy440. The renderer therefore uses visually assessed ground-contact/shadow-center origin metadata rather than assuming identical baselines. `js/assets/environmentArt.js` supplies origins and scale; JSON frames remain exactly512square and are untrimmed. Ground-contact origins are localy480/480/482/464/456/460; these represent the footprint center, not the furthest shadow pixel. Solid alpha>=128bounds end at localy493/488/491/479/472/479 respectively. All four outer PNG corner pixels have alpha0; overall alpha ranges0–254. All solid silhouettes fit within their own frame.

A subsequent alignment edit weakened transparency and was rejected. It is not included or used. The selected original preserves its stronger isolation and art quality. Check the original atlas over a contrasting background before changing origins; its RGB color in alpha0pixels does not represent an opaque background.

This small production asset set does not finish the full environment, animated hero/monster, equipment, effects or UI art requirements of MASTER_SPEC. The northern cliff/ice props and alternate ruin silhouettes can coexist as procedural fallbacks.

SHA-256: `e83b38c5c8b03e7c96d768bc5ef4d22d8139f27542539b3c645d58b629af3447`.
