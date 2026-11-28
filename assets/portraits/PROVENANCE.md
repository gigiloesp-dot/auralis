# Auralis class portrait sheet

`class-portraits.png` is a real generated painting, 1536×1024 RGB PNG. Six 512×512 square cells form three columns and two rows:

| Position | Class |
|---|---|
| Top left | Human warrior |
| Top middle | Elf archer |
| Top right | Elf mage |
| Bottom left | Human paladin |
| Bottom middle | Hooded female elf assassin |
| Bottom right | Dwarf cannoneer |

Generated on 2026-11-12 using the built-in OpenAI image-generation tool during the user's authorized Auralis development session. The original output is preserved in the execution workspace at `/workspace/generated_images/exec-52305d4e-2eed-4e90-a741-078de61e0d63.png`. The committed asset is a byte-for-byte copy, with no cropping, compositing, upscaling or other pixel edits. No external photographs, third-party game art, artist references or supplied likenesses were used.

SHA-256: `364b8e2449000f5fea0ef5759948959fa850c05429481ac844e92b0863e2b45d`.

Usage and redistribution of generated output follow the applicable OpenAI terms. This file does not assert third-party licensing or exclusive copyright. The repository's source-code license is not a claim that third-party rights exist in this generated image.

## Generation recipe

One landscape3:2 sheet, exactly3columns×2rows, each portrait filling its square, no gutters, frames, lines, labels or watermarks. Consistent hand-painted2D fantasy style, broad readable brush shapes, amber light from upper left, dark charcoal/sage background and subtle gold halo. Head and upper chest, large clear face centered in each square, shoulders in lower third. Class order and distinguishing features are listed above: warrior's sword/blue clothing, archer's bow/green cloak, mage's blue crystal staff/purple robe, paladin's sword/shield/ivory gold armor, assassin's hood/dagger hilts, dwarf's beard/goggles/brass cannon.

CSS consumes the unmodified sheet with `background-size:300% 200%` and six percentage positions exposed by `js/assets/portraits.js`. At40pxHUD scale each face remains distinct; larger class cards can use the same source. This asset is UI portrait art only. It does not complete the animated character, equipment, creature, environment or effects art required by MASTER_SPEC.

The initial fal request was rejected before submission because that provider's account had no remaining credits. This successful sheet came from the independent built-in image-generation provider; no fal account was switched or retried.
