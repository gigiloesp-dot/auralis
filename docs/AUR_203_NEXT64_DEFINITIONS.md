# AUR-203 remaining64 definition preparation

The64 next definitions and canonical art are ready in the pure `js/monsters/aur203ExpansionSpecies.js` module, without changing the previous20 rows or activating new camps. They reserve stable type/loot IDs `aur203Forest088`, `aur203North080`, `aur203Ancient049`, `aur203Desert060` and corresponding `...Material` IDs. Real trilingual names, anatomy and material concepts come directly from each artist's species cards.

The source of the technical proposals is `work/task10/aur203-next64/prepare-proposals.mjs`; its generated `proposals.json` and eighteen per-pack files cover Forest088–096, North080–093, Ancient049–061 and Desert060–087. Each kind uses an existing ordinary base archetype, one of13 actual movement profiles, two distinct implemented abilities, an anatomy-appropriate speed and a footprint no larger than24 pixels. The proposals add neither gear nor economy/formula changes. North091 is a ground stilt walker using `skirmisher` with `blink` and `frost`, following the artist's explicit correction.

## Checks and current activation boundary

`validate-proposals.mjs proposals.json --all --current-geography` checks64 identities, all704 current reserved resident footprints,128 actual timed ability releases with visible windup, and3,584 level1–56 cases through an isolated copy of the unchanged real `monsterKind` function. `--current-geography` checks actual current placements after root-authorized unpublished geometry corrections while preserving each exact species ID, camp ID, native level, biome and eleven residents; the original preparation snapshot remains available in `reserved-manifest.json`.

`audit-readiness.mjs` verifies actual canonical modules/exports, PNGs,48 named atlas frames in six animation banks,48 distinct recomputed RGBA hashes, author identities/names/biomes/levels, and known provenance/validation schemas. Forest/North/Ancient provenance embeds species rows. Desert provenance instead references its actual artist card file and generation suffix; the exact native level comes from the reserved placement because that known card schema omits level. The audit compares recorded frame hashes where provided and a recorded canonical PNG hash where provided. Targeted transparency repairs must receive the artist's final QA/hash confirmation before acceptance.

The generated reports describe actual readiness; file existence alone does not declare a repaired model ready. Missing or incomplete art cannot create a wolf fallback or a placeholder identity. Material definitions/icons are separately produced in `js/equipment/aur203ExpansionMaterials.js`; root must verify their actual stable-ID bijection and canonical icon files before activation.

## Future pure module and root integration

The strict final audit passes64/64 art entries with no missing files or schema/hash errors. Targeted069/076 transparency repairs are accepted through the artist's final `art/source/aur203-desert-b/art-readiness-manifest.json`: final QA flags, real beige/dark QA files, identities/native levels/biomes, canonical pointers and PNG/atlas/source SHA256 hashes all match. All64 canonical sheets independently contain48 unique RGBA frames and match recorded frame hash arrays where provided.

`prepare-canonical-module.mjs` has written the new pure `js/monsters/aur203ExpansionSpecies.js`. It imports all eighteen actual art modules and exports a deeply frozen64-entry `AUR203_EXPANSION_SPECIES_ROWS` array and64-entry `AUR203_EXPANSION_SPECIES_ART` map. The rows use the same definition fields as the existing20. Importing this file does not register types, add camps, change loot, or install behavior hooks. Current geometry must be rechecked after the separate authorized unpublished geometry corrections finish.

Root will append those rows and art to the existing assembly only after first20 QA and current geometry checks. The existing20 authored definitions, their stats, names, loot and art remain exactly preserved. Root then verifies every material mapping, browser rendering, actual collision/terrain behavior, camp totals and residents before claiming the341 camps/3,751 residents target.

The optional future stun proposals are limited to North084 (700ms,1100ms warning), Ancient052 (600ms,1100ms warning) and Desert078 (800ms,1200ms warning). The current64 rows contain no `stunOnStomp` field. Root must first complete the real status, movement and attack/skill input gates documented in `docs/AUR_203_STUN_PROGRESS.md`, then explicitly enable these opt-ins. Slow is never labeled stun.
