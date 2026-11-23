# AUR-203 implementation audit

Audit date: 2026-11-23. Repository HEAD: `90f7dcda5d8fc4e6a22a9ac145a429aecc7e794d`; inspected the actual Task10 working tree, including uncommitted third-expansion integrations. This is an audit and implementation design, not an AUR-203 runtime implementation.

## Scope and sequencing

[Issue #3](https://github.com/gigiloesp-dot/auralis/issues/3) was read with `gh issue view 3`. Its AUR-203 and AUR-204 entries confirm a single future package: 84 additive spots and original species, combat/behavior/thematic loot at creation, and review of behavior/loot for the original 257 species. AUR-204 is merged into AUR-203 and must not become a separate task. AUR-202 permits outdoor species reuse in 17 dungeons; dungeon enemies do not count toward outdoor totals.

The current owner instruction authorizes AUR-203 continuation after Task10; no additional permission question is needed. The dependency remains: finish and verify Task10 first, without disrupting its current art work. No external write, publication, or approval is needed for this audit.

## Measured current state

| Region | Size | Current spots | Residents | Registered unique primary art | Add | Final spots | Residents at 11 each |
|---|---|---:|---:|---:|---:|---:|---:|
| Forest | 18000 × 18000 | 80 | 880 | 45 | 17 | 97 | 1067 |
| North | 21000 × 21000 | 76 | 836 | 42 | 18 | 94 | 1034 |
| Ancient | 15000 × 15000 | 45 | 495 | 34 | 17 | 62 | 682 |
| Desert | 20000 × 20000 | 56 | 616 | 32 | 32 | 88 | 968 |
| Total | | 257 | 2827 | 153 | 84 | 341 | 3751 |

`getRegionContent`, `uniqueSpeciesEntries`, `INTEGRATED_SPECIES_ART`, and `NEW_SPECIES` were queried directly. Current 153 primary models comprise 130 integrated six-bank/48-pose sheets and 23 preserved legacy primary models. The manifest explicitly says `complete:false`, with 104 unfinished species; legacy 32-pose sheets use transformed hurt/death rather than newly drawn clips. Fourth-expansion source drafts and some packed files exist in the working tree, but are not evidence of registered, verified runtime completion. Do not count drafts, recolors, fallback reuse, or file existence as additional completed species.

At 10–12 residents per new spot, additions are 840–1008, yielding 3667–3835 total outdoor ordinary residents if old counts stay fixed; 11 each yields exactly 924 additions and 3751 total. Bosses and dungeons are additional descriptors/entities and must be reported separately.

## Geography and compatibility contracts

`js/world/task10Layout.js` contains the current authored/generated descriptors. `js/world/regionContent.js` adds species IDs and truthful completion flags, and supplies runtime NPCs/desert bosses. `js/world/chunkGeometry.js` defines roads, rivers, world walkability and chunk geometry. `js/world/worldData.js` defines dimensions/level bands. `js/dungeons/dungeonData.js` supplies entrance exclusions.

**Do not implement AUR-203 by changing `COUNTS` and regenerating `scripts/generate-task10-layout.mjs`.** That generator builds a replacement layout from release21, uses global nearest/farthest distances to assign levels, reallocates quest objectives, enforces base-prototype coverage, and rewrites aliases and release21 quest artifacts. Even if early random centers repeat, changed counts can change old levels, types, spawns, and bindings. Its deterministic check is valuable for the existing baseline, not an additive extension mechanism.

`docs/qa/aur203/task10-baseline.json` captures all 257 old spots and 2827 spawn descriptors exactly from `TASK10_LAYOUT`, plus runtime region anchors, 149 current quests, 104 legacy runtime quests, and immutable release21 aliases/quest bindings. It is a comparison fixture, not a runtime source; keep it unchanged during the extension. Art completion can change separately without changing these geographic contracts.

`js/world/campAliases.js` maps 470 retired camps and 4359 retired monster IDs to the current world. `js/systems/worldLayoutMigration.js` uses layout version 2, preserves latest many-to-one death deadlines, drops retired living actor state, and remaps discovered locations. `js/systems/save.js` preserves raw pre-migration backups and blocks replacement if required backup creation fails. Monster state keys use `region:spawnId`; quest kills carry camp and species IDs. Existing bindings and keys must survive exactly.

## Safe additive implementation design

1. Freeze the Task10 completion baseline. Add a separate offline generator, for example `scripts/generate-aur203-layout.mjs`, reading existing layout as immutable occupied geography. Emit only a new `js/world/aur203Layout.js`; never rewrite `task10Layout.js`, `campAliases.js`, or `release21QuestData.js`. Use per-region/per-new-spot seeds, bounded attempts and explicit failure when capacity is exhausted.
2. Reserve append-only IDs: forest spots/species 080–096, north 076–093, ancient 045–061, desert 056–087. Keep the exceptional `forest-starter-wolves` and its existing spawn IDs untouched. New spawn IDs should derive from their new camp ID and stable resident index; assert global and regional uniqueness. Assign new levels independently against fixed region bands and route progression, never recompute old levels.
3. Compose old and new camps at `getRegionContent` in `js/world/regionContent.js`, retaining all old descriptor fields and order. Preserve roads, towns, NPCs, arrival points, safe zones, entrance locations, bosses, quest metadata and rewards. Prefer the current world-layout version for a strictly additive change: missing new state initializes normally. If a version bump becomes necessary, add explicit version-to-version migration and backup handling; the present migration reruns release21 logic whenever the version differs, and `save.js` hardcodes version 2 in backup detection.
4. Add a separate species-art module/registry extension and extend `js/assets/speciesAssets.js`: its current iteration only recognizes IDs present in `TASK10_LAYOUT`, so merely registering new art will not certify appended species. Preserve existing resolver semantics and one unique primary sheet/key/URL/atlas per species. Follow `js/characters/PaintedActor.js` for eight directions and six banks (idle, run-a, run-b, attack, hurt, death), foot placement, transparency, and frame bounds. If a special state intentionally maps to an attack bank, verify that mapping visibly.
5. Extend `js/monsters/speciesRuntime.js`, `monsters.js`, `movementProfiles.js`, `monsterBehavior.js` and `MonsterSystem.js` through a documented species schema: role, aggression/retaliation policy, idle/patrol behavior, pursuit/retreat/defense behavior, active ability pattern with telegraph, passive traits, region/level-scaled stats, locomotion and collision footprint, and thematic loot profile. Shared bounded behaviors are appropriate; 84 independent AI engines are unnecessary. Review all 257 older species in the same package and record which require tuning. A different two-ability array alone does not demonstrate distinct combat feel or passive behavior.
6. Add thematic material definitions in the equipment/material catalog and localized strings, with species-specific material dispatch in `js/monsters/loot.js`/`encounterLoot.js`. Current ordinary material dispatch only handles the `wolf` loot family; traits mostly inherit base drops and stats. Preserve equipment rarity rates, class restrictions and world-boss-only legendary equipment. Audit the existing level clamp of 42 in ordinary equipment selection before assigning desert level 43–56 loot; do not silently alter the established economy.

## Placement capacity and performance concerns

The current generator uses 1400 minimum center spacing; road half-width + 285 center clearance; town footprint + 500; portals/dungeons 650; bosses 1050; landmarks 400; future settlements 650; and river clearance 250. Residents use locomotion collision radius and walkability. Existing tests additionally enforce safe zones, road clearance, resident separation, and pursuit envelopes (`max spawn offset + 360` ordinary leash) without neighbor overlap.

A read-only deterministic probe retained all old centers and applied these current center exclusions to current runtime roads, bosses, towns, dungeon entrances and reserved landmarks. It found all requested centers within 100000 samples per region: forest 17 in 17266 attempts, north 18 in 226, ancient 17 in 6795, desert 32 in 391. This is preliminary center capacity evidence only: it did not place residents, validate their actual species footprints, prove local navigation, or test enlarged patrol territories. Forest/ancient are tighter; reject unsafe candidates instead of reducing buffers or relocating old spots. AUR-196's requested territory enlargement must be reconciled with the eventual implementation: current ordinary leash is 360 and current local patrol offsets are 26–81 from each resident's home. Patrol, camp radius, detection, and pursuit leash are different parameters.

`MonsterStream.js` builds 512-cell descriptor indexing once and queries local cells using projected camera bounds, saved living positions and maximum leash; it retains hot combat and uses load/unload hysteresis. `MonsterSystem.js` updates streamed actors; no all-world simulation should be introduced for pack/passive AI. `ActorTextureCache.js` uses scene-scoped reference leases, shared pending loads, and eviction on release. Keep species art lazy: 84 new sheets must not be globally preloaded. Descriptor growth is about 32.7%; this does not establish frame-time or decoded-texture safety. Wider behavior ranges and larger silhouettes require checking stream bounds and projectile/telegraph residency, not simply raising global load radii.

## Validation and completion criteria

Read-only focused validation passed **33/33 tests**: `task10Spots`, `monsterStream`, `questPersistence`, `monsterRespawn`, and `bossLoot`. This includes deterministic baseline regeneration, road/safe-zone placement, nonoverlapping pursuit territories, all 104 original quest contracts, three-slot migration/death timers/raw backups, and quota-failure preservation. It does not certify AUR-203 or fourth-expansion draft art. No browser was run for this audit.

Required implementation checks:

- Deep-compare every old camp/spawn/coordinate/type/level/species ID and every existing quest binding/reward against the immutable baseline; preserve anchors/roads/NPCs/entrances and release21 alias maps. Verify exactly 97/94/62/88 camps, 84 new species, 10–12 residents each, and actual ordinary/boss/dungeon totals separately. Keep the original 257-layout deterministic check and add a separate additive-generator check.
- Exhaustively validate every new resident and patrol/pursuit envelope against actual movement profiles, expanded territory rules, road/bridge corridors, towns, arrival points, entrances, water/relief, other residents and old/new camps. Check reachability from valid region routes, especially starter routes, without moving old geography.
- Verify eight directions and actual state frames, unique asset keys/URLs/content, bounds, footlines, silhouette/anatomy originality and visible movement character. Run each new species through in-game combat; static hashes cannot establish visual quality or facing correctness.
- Test roles/passives with observable outcomes: retaliation versus spontaneous aggression, retreat/reengagement, pack membership, defense/status effects, cooldowns, dodgeable telegraphs, interruption/death, leash return and 30-second respawn. Include neighboring camps and safe-zone boundaries. Review old 257 behavior/loot coverage, with justified tuning and no required redraw.
- Deterministically test thematic material dispatch, rarity/equipment restrictions, region/level stats and drop economy. Verify unique ground-loot IDs and persistence/expiry through region changes/reloads without inventory loss or duplicate rewards.
- Load old version-2 saves in all three slots with living positions, HP, death timers, boss/dungeon timers, active/completed/claimed quests, tracked targets, discoveries, inventory and ground loot. Repeat save/load and any upgrade from older layouts; preserve raw backups and quota behavior.
- Run `npm test` and `npm run check`, relevant quest/navigation/dungeon/stream/cache tests, then browser combat/drop and travel/soak scenarios in Android landscape and RU/EN/ES. Record resident/active/atlas/lease/pending counts, creation/removal churn, decoded texture memory and frame-time at camp edges, rapid region changes, hot combat, reload and background/resume. Compare against the completed Task10 baseline with explicit budgets.

Completion means 341 genuinely distinct outdoor primary species with integrated behavior and thematic loot, 341 safe persistent spots, preserved old-world contracts, and recorded platform validation. This audit intentionally makes no runtime/config changes and does not mark Task10 or AUR-203 complete.
