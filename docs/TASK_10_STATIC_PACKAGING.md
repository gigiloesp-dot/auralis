# Task 10 static publication packaging

## Pinned external delivery for original atlases — 24 November 2026

The committed full344-WebP runtime at `4a0eb5a77cbc75f9952922d4166af466971018e8` occupies308,337,986 bytes after static export. The256 MiB hosting archive ceiling requires a smaller hosted payload. All257 new primary ordinary models and other task10 atlases remain local. An explicit optional configuration, `assets/actors/external-delivery.json`, moves delivery of **only73 original atlases** (23 monster,6 NPC sheets,44 boss) to immutable public GitHub URLs pinned to that exact commit. These73 verified WebPs total **112,635,124 bytes**. All original PNGs, WebPs and atlas JSON remain in the Git repository; only derived publication copies are omitted.

`js/assets/externalActorDelivery.js` is an explicit immutable URL map. The existing resolver first selects a verified lossless WebP, then applies that map only to listed old atlases. Task10 models, hero bodies, equipment, atlas coordinates, keys and shared texture leases remain unchanged. Future converter runs preserve this composition; changed old derivatives must deliberately update the pin/config and pass provenance checks before export.

The exporter checks the optional config from the exact exported commit, its resolver pin/map, the original73-atlas allowlist, association with the lossless manifest, SHA-256, size, and equality with the pinned Git binary. It validates every mapping before removing any mapped source PNG or external WebP copy. `build.json.externalActorDelivery` records the remote source commit, file count and omitted bytes. With no config, the earlier local-only format remains supported.

The public verifier still checks every runtime file. For an externally mapped WebP it fetches the exact remote URL **in the browser with CORS**, then compares the delivered SHA-256 against the same committed binary; it does not skip those assets. The independent pixel browser helper decodes the actual resolved remote WebP for these73 pairs and retains exact canonical RGBA, native decode bounds and loader lease checks. No new browser run is claimed in this implementation checkpoint.

Anonymous HEAD probe of the pinned forest-residents WebP returned200, `image/webp`, `Access-Control-Allow-Origin: *`, and `Cross-Origin-Resource-Policy: cross-origin`. This is a network availability check, not a substitute for the full browser/public acceptance. The public repository and GitHub Raw become an explicit network dependency for these old atlases; offline availability and outages are not guaranteed. No unverified retry/fallback mechanism was added.

Focused checks:9/9 texture/export tests passed, including the full344-entry source/RGBA provenance run and73 pinned originals. External-export tests passed15/15, covering isolated deletion, exact repository preservation, wrong host/protocol/hash, task10/player substitution, duplicate mappings, resolver drift and a pin missing the derivative. Logs: `work/task10/external-delivery-focused.log` and `work/task10/external-export-mutations.log`. The final combined focused run passed20/20 in26.6s (`work/task10/external-delivery-all-focused.log`). Final archive measurement, full CI, actual-browser CORS/pixels and publication remain root-integration steps.

## Current verified checkpoint — 24 November 2026

The published master-test is **release25**, game source `4136c4ba9e0bd32fe4ccbaa321733f445aa4128c`, with169 primary models. The hosting archive was261,997,025 bytes and was accepted; its SHA-256 is `40f9e973fbe71a7626faba52ae84179b97c1020738b4e5ebb55799fdf2632abc`. Public verification checked748 exact runtime hashes and gameplay scenarios; receipts are in [release25](qa/release25/). Original PNGs remain in Git. The active delivery manifest still contains144 entries pinned to `89966076fe6488e9e1ca009f07ee3db32ad3fd1f`. Later source integration does not silently activate new WebPs.

The next packaging implementation is ready for testing against the final committed257-model source:

- Export streams `git archive` directly into `tar` without creating a second full-size temporary archive. Extracted files are isolated copies; PNG recompression uses an atomic replacement, never a mutable-source hardlink.
- Optional `--include-legacy-roles monsters npcs bosses` selects only explicit original descriptor atlases:23 monster PNGs,6 NPC sheets,44 boss PNGs. Player bodies, class sprites, equipment and portraits are excluded. Existing task10 paths remain selected by default. `--list-sources` audits selection without generation.
- Converter preserves exact RGBA, including hidden RGB, and independently checks decoded WebP bytes. RGB ICC profiles are retained and independently compared. Unsupported PNG color/animation metadata or encodings fail closed; no silent profile removal or channel reduction. A non-smaller WebP remains unmapped.
- Export validates each source against both the exact export commit and the manifest-pinned original commit before removing mapped PNG copies from the derived directory. Binary hashes and resolver equality remain mandatory.

Focused non-browser validation: **8/8 PASS**, recorded in `work/task10/packaging-followup-validation.log`. It covers real144-entry provenance/RGBA, original descriptor allowlists, ICC extended RIFF headers, both loader leases, isolated streamed export, uncommitted-source preservation, altered pinned sources, corrupt derivatives, and rejection of player substitutions. A separate offline Pillow fixture preserved a588-byte RGB ICC profile and every RGBA byte, including alpha-zero RGB. An audit of305 selected PNGs at source `1466628e16f1529fa2457dc86f1b6a6d0435253e` found no unsupported color metadata; all305 had no ICC profile. This is not a new manifest generation, full-browser result, full-suite result, archive-size measurement for257 models, or publication. Root integration must commit the final source before generation.

Reproducible next command, after recording the exact committed source SHA:

```sh
python scripts/build-lossless-actor-textures.py --commit <exact-source-SHA> --jobs 2 --include-legacy-roles monsters npcs bosses
```

Run the independent browser pixel comparison and full checks before publishing any new derivatives. No physical Android acceptance is claimed.

## Historical packaging measurements

The sections below record earlier checkpoints; statements that release24 was live or CI was pending apply to those historical checkpoints. They do not supersede the current release25 receipts above.

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

## CI source history fix

Full local516/516 and458syntaxchecks passed. CI641fac4 passedall34browsers but unit515/516: checkoutdepth1 omitted pinned8996607 tree, so provenancevalidation could notrun. The validatecheckout now fetchesfullhistory; testandpixelassertions unchanged. No runtime/assets changed. New35job CI stillpending. Rawpreparedexport267571696bytes; gziparchiveunmeasured/notpublished.
