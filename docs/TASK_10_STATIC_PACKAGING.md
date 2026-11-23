# Task 10 static publication packaging

The exporter applies deterministic lossless PNG compression only to its extracted publication directory. Committed PNGs, source artwork, runtime code, game URLs, atlas coordinates, and the live release24 (73 models) deployment remain unchanged by this checkpoint.

`scripts/lossless-png.mjs` uses Node built-ins to verify PNG chunk CRCs, decode noninterlaced 8-bit RGB/RGBA row filters 0–4, select adaptive filters deterministically, and deflate at level 9. It preserves every ancillary chunk byte, replaces IDAT chunks only, and decodes the encoded result to verify every original pixel channel before returning smaller output. This preserves alpha and RGB beneath fully transparent pixels exactly. Unsupported or non-smaller inputs retain their original bytes.

The public verifier retains the exact build source SHA check. It derives expected PNG bytes from `git show` using the identical transform and compares SHA-256 of the delivered bytes; other checked runtime files retain exact committed-byte SHA-256 comparisons.

## Measured checkpoint

Asset commit: `b19c070ad314eaec8c7cb10db2889ad031a2a2ae`.

| Measurement | Bytes |
| --- | ---: |
| Original 249 PNGs | 288,640,541 |
| Transformed 249 PNGs | 265,073,645 |
| PNG savings | 23,566,896 |
| Original committed runtime | 300,335,435 |
| Transformed raw runtime, before build.json | 276,768,539 |
| Publication archive limit | 268,435,456 |

The archive is **unmeasured** at this checkpoint. Raw runtime size does not establish that the compressed archive fits the hosting limit. No publication or browser session occurred in this packaging work; the live release24 (73 models) deployment remains unchanged.

## Verification

The full committed-asset run passed 13/13 tests, checking all 249 PNGs for exact decoded pixels and ancillary chunks. That run used the initial five-pass filter scorer. The subsequent single-pass scorer passed 12/12 focused tests and matched the initial implementation's entire encoded PNG bytes for all ten RGB/RGBA/filter fixtures, three small committed PNGs, and one full-size boss atlas. A full suite run against the optimized implementation remains the next checkpoint.

Proof captures:

- [Full 249-PNG roundtrip](qa/task10/lossless-publication/full-249-roundtrip.log)
- [Optimized scorer focused tests](qa/task10/lossless-publication/optimized-fixtures.log)
- [Encoded-byte identity and timings](qa/task10/lossless-publication/byte-identity.log)

## Lossless actor delivery derivatives

The follow-up delivery manifest is pinned to committed source `89966076fe6488e9e1ca009f07ee3db32ad3fd1f`. It maps 144 PNGs under `assets/actors/task10-*` to sibling lossless WebP files. All original PNGs and descriptor URLs remain in Git. The two asset loaders resolve only explicitly mapped image URLs; unmapped files retain PNG delivery, including later additions absent from the pinned manifest. Atlas JSON URLs, keys, coordinates, and cache lease behavior remain unchanged.

The offline Pillow converter uses `lossless=True`, `exact=True`, and `method=6`. It independently decodes every resulting WebP and compares all RGBA bytes against the original PNG, including RGB beneath alpha zero. Each manifest entry records the original PNG hash, encoded WebP hash, decoded RGBA hash, dimensions, and sizes. The generated map activates only after all derivatives verify. Pillow is not required in CI or at runtime. The 144 current source PNGs contain no ICC, gamma, sRGB, or chromaticity metadata; the converter also forwards any ICC profile supplied by future sources.

The mapped sources total 94,201,755 bytes; derivatives total 63,365,174 bytes, saving 30,836,581 bytes against the original PNGs. Generation took 40.3 seconds with two workers. This is not an archive measurement. The committed-source raw runtime estimate after these substitutions is 269,498,854 bytes before manifest/map additions and the retained PNG optimizer; exact publication size must be measured after export.

The exporter reads the manifest from its exact requested source commit, validates both original and derivative hashes, checks the matching resolver map, and removes only mapped source PNGs from the derived publication directory. The public verifier derives those same exclusions from the exact Git commit and retains strict delivered-byte hashes for every remaining checked file, including WebP binaries, manifest, resolver, and other runtime files.

The two new Node tests and eight existing cache/asset tests passed (10/10). These independently recompute every source RGBA hash without Pillow and verify exact mapped URL selection, original URL fallback, atlas geometry, and shared lease release. The Chrome helper `node tests/browser-lossless-actor-textures.cjs` is prepared for a separate browser run: it compares normal browser-decoded Canvas pixels for all mapped PNG/WebP pairs and exercises both loaders and shared leases. That browser check has not been run by the packaging agent.

Additional proof: [WebP generation and Node verification](qa/task10/lossless-publication/webp-delivery.log).

## Independent Chrome verification

All144 pairs pass exact RGBA comparison through createImageBitmap with premultiplyAlpha:none and colorSpaceConversion:none followed by identical Canvas conversion. Native Image.decode has format-specific premultiply/unpremultiply quantization: an initial strict native comparison failed (retained log). The diagnostic found zero alpha/opaque differences and up to1.3255/255 weighted translucent difference in the first atlas. The final test retains exact canonical RGBA for every pixel, exact native alpha/opaque RGB, and a two-stage2/255 native translucent quantization bound for every pair; all144 pass, zero page errors. This is lossless source data, not a claim of identical native premultiplication arithmetic. Both Node and independent Pillow decodes preserve every original RGBA byte, including hiddenRGB.

The browser loader lease checks explicitly use a spy scene; real Phaser load/unload/abilities remain covered by the existing gameplay suites. Full unit/CI after this new delivery integration remain pending. No physical Android test claimed.
