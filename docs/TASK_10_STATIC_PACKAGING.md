# Task 10 static publication packaging

The exporter applies deterministic lossless PNG compression only to its extracted publication directory. Committed PNGs, source artwork, runtime code, game URLs, atlas coordinates, and the live 24-species deployment remain unchanged by this checkpoint.

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

The archive is **unmeasured** at this checkpoint. Raw runtime size does not establish that the compressed archive fits the hosting limit. No publication or browser session occurred in this packaging work; the live 24-species deployment remains unchanged.

## Verification

The full committed-asset run passed 13/13 tests, checking all 249 PNGs for exact decoded pixels and ancillary chunks. That run used the initial five-pass filter scorer. The subsequent single-pass scorer passed 12/12 focused tests and matched the initial implementation's entire encoded PNG bytes for all ten RGB/RGBA/filter fixtures, three small committed PNGs, and one full-size boss atlas. A full suite run against the optimized implementation remains the next checkpoint.

Proof captures:

- [Full 249-PNG roundtrip](qa/task10/lossless-publication/full-249-roundtrip.log)
- [Optimized scorer focused tests](qa/task10/lossless-publication/optimized-fixtures.log)
- [Encoded-byte identity and timings](qa/task10/lossless-publication/byte-identity.log)
