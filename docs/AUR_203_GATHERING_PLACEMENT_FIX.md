# AUR-203: gathering clearance repair

The first20 integration unit run exposed a real quest-access regression:
`tests/task10Gathering.test.mjs` requires immutable gathering sites to remain at
least `camp.radius + 460` from every encounter. The original257 camps passed;
unpublished candidates forest-spot-086 and north-spot-092 did not.

## Protected geography and narrowly authorized repack

Original257 camps,32 gathering nodes, roads, NPCs, portals, towns and maps remain
unchanged. Original proposal generation remains reproducible. A post-pass applies
gathering clearance before activating these unpublished additions.

Exhaustive integer searches with all other candidates fixed found no safe
same-woodland forest086 center within6000 units. Even within2000 units,
7,271,379 candidate centers clearing gathering sites and retaining woodland all
failed the original center exclusions, before resident formation checks.
The integration coordinator therefore authorized repacking only the17
unpublished forest additions, reserving native levels3/4 first. This preserves
every ID, authored level and biome, and keeps the other regions fixed except the
actual north092 conflict. Published release26 contains none of these additions.

The post-pass uses a bounded32-unit lattice ordered by Euclidean displacement,
with deterministic dx/dy tie-breaking. Existing valid centers are retained.
A rigid translation is preferred; if any of the eleven resident collision/patrol
footprints fails, the existing deterministic irregular resident sampler supplies
new safe homes with the exact same IDs and nonposition metadata. All original
1400 center-spacing, pursuit-envelope, roads, river, settlement, NPC, receiver,
dungeon, boss, landmark, bounds, collision and patrol exclusions still apply.
This is offline generation; it adds no per-frame runtime search.

## Exact changes

| Candidate | Native level | Before | After | Move distance |
| --- | ---: | --- | --- | ---: |
| forest-spot-080 | 10 | 9227,4880 | 9099,8272 | 3394.41 |
| forest-spot-083 | 4 | 4342,1113 | 7958,2713 | 3954.17 |
| forest-spot-086 | 3 | 2869,2306 | 4277,1314 | 1722.36 |
| forest-spot-090 | 8 | 8132,2734 | 8964,4270 | 1746.86 |
| north-spot-092 | 23 | 2067,3346 | 2003,3378 | 71.55 |

All five required new irregular homes; all other79 new candidates remain exact.
Level3 is3251.66 units from the existing forest spawn; level4 is7104.33 units
away. These are the first reserved levels in the deterministic feasible repack,
not a recalculation of authored levels or a change to old80 forest encounters.

The machine-readable receipt
`docs/qa/aur203/gathering-clearance-repair.json` includes the complete before-file,
all55 before/after resident coordinates, native metadata, protected source hashes,
and these SHA256 values:

- Before unpublished frozen placements: `652108eb4845b44f47163c726dc59f084f1d0d83cde84afd11730d24ee98f945`.
- After repair: `ed60202e7ec64014796cef6cdbe7094eadf0eafae4ef00a8ef817c035a0069cb`.

The original Task10 baseline fixture is unchanged. Validation: `node --test tests/aur203Layout.test.mjs tests/task10Gathering.test.mjs`
passed15/15 in15.76seconds, including all924 actual collision/patrol footprints,
1400 center spacing, disjoint pursuit envelopes, immutable gathering access,
protected-source checks and exact offline reproduction (6.15seconds). The
gathering test was not modified. Log: `work/task10/aur203-gathering-repair-tests.log`.

Browser integration and publication are owned by the main integration task;
this repair alone does not claim a published release.

Additional regression: `node --test tests/aur203WorldIntegration.test.mjs
tests/aur203Baseline.test.mjs tests/aur203SpeciesDefinitions.test.mjs` passed18/18
in1.46seconds, including all220 active new receiver detection/pursuit cases and
exact old257 prefix preservation. Log:
`work/task10/aur203-gathering-repair-integration.log`.
After strengthening the receipt test to compare every stored before/after home
and center, the layout suite passed7/7 again in15.20seconds. Log:
`work/task10/aur203-gathering-repair-layout-final.log`.
