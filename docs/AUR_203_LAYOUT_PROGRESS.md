# AUR-203 additive placement preparation

Date: 2026-11-24. This is **offline staging**, not a live341-spot implementation. The existing game still runs257spots/2827ordinary residents. No existing runtime module imports either new placement module, and no existing files, coordinates, species IDs, quest bindings, monster data, loot tables, saves, or geography were edited by this preparation.

## Frozen spatial candidates

| Region | Existing | Staged additions | Staged residents | Eventual total spots | Eventual total residents | Added level range | Center attempts |
|---|---:|---:|---:|---:|---:|---:|---:|
| Forest |80|17|187|97|1067|3–23|78346|
| North |76|18|198|94|1034|22–38|224|
| Ancient |45|17|187|62|682|35–41|3784|
| Desert |56|32|352|88|968|42–55|412|
| Total |257|84|924|341|3751| |82766|

All existing regions retain their full level bands; the table reports only levels of the staged additions. New level selection uses distance from the region spawn divided by fixed farthest-corner distance and existing min/max bands; it does not recompute old camp levels. This is a deterministic implementation proposal, not a new owner-approved balance formula. Existing low/high-level camps remain unchanged.

`js/world/aur203Layout.js` is a pure offline builder with explicit current-region and complete dungeon-list inputs. `js/world/aur203Placements.js` freezes its84candidate spot records and924resident coordinates. Their IDs append forest080–096, north076–093, ancient045–061, desert056–087. All residents derive stable IDs from their own spot and resident index. The frozen file SHA-256 is `652108eb4845b44f47163c726dc59f084f1d0d83cde84afd11730d24ee98f945`; a guard prevents accidental re-generation drift while original art is authored against these reservations.

Candidate records deliberately omit combat `type`, art, loot, and readiness flags: no reused base monster is represented as a finished new species. `plannedSpeciesId` is a reservation. Final integration must resolve every activated record to its actual original art, AI/archetype/passives, abilities, stats, movement profile and thematic loot. Until then these records do not enter `getRegionContent`, streaming, saves, maps, quests, or the species catalogue.

Biome distribution: forest11woodland/6abandoned-city; north13snow/5volcanic; ancient5elder-forest/4elder-ruins/2elder-marsh/3elder-wastes/2elder-mystic/1elder-dry; desert32sand. First forest artwork reservations:080(9227,4880)Lv10woodland,081(6184,8975)Lv10woodland,082(998,9864)Lv10woodland,083(4342,1113)Lv4woodland.

## Geometry verification

The builder retains all old camps as occupied geography and requires at least1400world-unit center separation, with an additional bound proving disjoint old/new pursuit envelopes (maximum resident offset+existing360leash, plus30margin). Minimum measured new-to-old/new distances are forest1401.835, north1403.220, ancient1403.510, desert1400.166. No buffers are reduced to fit capacity. Candidate exhaustion throws explicitly.

Every addition has11irregular residents, radius210, and conservative24collision clearance, which covers every currently implemented ordinary movement profile. Residents are at least57units apart. All924positions are checked with the existing `worldWalkable` implementation against current procedural obstacles, buildings, walls, roads, river/bridges, safe towns, all40NPCs, all12arrival receivers, portals, and all17dungeon entrances. Centers also retain town footprint+500, portal/receiver/dungeon650, boss1050, landmark400, future-settlement650 and road half-width+285 exclusions.

Every resident additionally has at least two56-unit local patrol options inside its camp: endpoints and midpoint are walkable and actual circular-obstacle segment tests use the existing combat `lineClear` geometry. Actual runtime steering must still check every move, dynamic occupancy and final species locomotion. This is a capacity/local-movement proof, **not** an exhaustive pathfinding proof from every road to every spot or a browser movement test. Future larger footprints, enlarged patrol radii/leashes, shifted geography or new NPCs must revalidate these reservations rather than silently reuse the24radius proof.

Generation with all four regions took about8.7seconds in the initial local probe. It is offline only: adding this builder introduces zero additional frame-loop work, AI updates or loaded textures. Runtime performance after activation remains unmeasured. The existing chunk decorator reserves space around camps; composition must also verify old resident walkability and expected local decoration changes, without changing existing camp IDs or coordinates.

## Tests and next steps

`node --test tests/aur203Layout.test.mjs` passed **6/6**, approximately31seconds locally: exact staged counts/IDs, all924actual positions, old/new pursuit separation, real patrol alternatives, deterministic frozen regeneration and no input mutation, explicit failure for impossible inputs. Source evidence: `work/task10/aur203-layout-tests.log`. A subsequent targeted guard check pins the frozen coordinate file hash. No browser, publication, physical Android acceptance, unique-art verification, combat/loot behavior or save migration test is claimed for this spatial preparation.

Next: finish Task10 acceptance first; create and verify the84original species and their immediate AI/loot contracts region by region; compose only verified complete records as an unchanged old prefix plus additions; preserve baseline fixture `docs/qa/aur203/task10-baseline.json` and all existing migration aliases. Test old saves/quests, actual movement, loot/respawn, streaming and texture leases before claiming341integrated spots. No world-layout version bump is introduced here.
