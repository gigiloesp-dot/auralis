# Task10 legacy animation readiness audit

Audit date: 2026-11-23. This audit reads the Task10 working tree and actual atlas frame names. It does not change assets or runtime and does not establish browser visual quality.

**153 unique primary models does not mean 153 complete six-bank animations.** The current split is 130 new six-bank/48-pose models plus 23 legacy four-bank/32-pose models. Another 104 species still lack a unique primary model. Even when the registry reaches 257 distinct models, these 23 legacy species require actual directional hurt/death upgrades before honestly claiming the requested idle/movement/attack/hurt/death coverage or proceeding to AUR-203 runtime work.

## Verified coverage

Every legacy atlas below contains exactly 32 frames: idle ×8, run-a ×8, run-b ×8, attack ×8. Directions are e, se, s, sw, w, nw, n, ne. None contains hurt or death frames; none of these entries declares poseBanks or drawnDeath. Thus **0/23 have 48 frames**, and **23/23 use transformed hurt/death**. The state-coverage code “I8 / R16 / A8 / H0 / D0” below counts actual drawn frames only, with two movement banks.

| Species ID | Primary image | Atlas | Actual drawn state coverage |
|---|---|---|---|
| forest-species-000 | [forestWolf.png](../assets/actors/monsters/forestWolf.png) | [JSON](../assets/actors/monsters/forestWolf.json) | I8 / R16 / A8 / H0 / D0 |
| forest-species-001 | [wildBoar.png](../assets/actors/monsters/wildBoar.png) | [JSON](../assets/actors/monsters/wildBoar.json) | I8 / R16 / A8 / H0 / D0 |
| forest-species-002 | [thornSnake.png](../assets/actors/monsters/thornSnake.png) | [JSON](../assets/actors/monsters/thornSnake.json) | I8 / R16 / A8 / H0 / D0 |
| forest-species-003 | [forestOrc.png](../assets/actors/monsters/forestOrc.png) | [JSON](../assets/actors/monsters/forestOrc.json) | I8 / R16 / A8 / H0 / D0 |
| forest-species-005 | [forestBat.png](../assets/actors/monsters/forestBat.png) | [JSON](../assets/actors/monsters/forestBat.json) | I8 / R16 / A8 / H0 / D0 |
| forest-species-007 | [skeleton.png](../assets/actors/monsters/skeleton.png) | [JSON](../assets/actors/monsters/skeleton.json) | I8 / R16 / A8 / H0 / D0 |
| forest-species-009 | [forestRaider.png](../assets/actors/monsters/forestRaider.png) | [JSON](../assets/actors/monsters/forestRaider.json) | I8 / R16 / A8 / H0 / D0 |
| forest-species-010 | [bear.png](../assets/actors/monsters/bear.png) | [JSON](../assets/actors/monsters/bear.json) | I8 / R16 / A8 / H0 / D0 |
| forest-species-011 | [spider.png](../assets/actors/monsters/spider.png) | [JSON](../assets/actors/monsters/spider.json) | I8 / R16 / A8 / H0 / D0 |
| north-species-000 | [iceWolf.png](../assets/actors/monsters/iceWolf.png) | [JSON](../assets/actors/monsters/iceWolf.json) | I8 / R16 / A8 / H0 / D0 |
| north-species-001 | [frostGolem.png](../assets/actors/monsters/frostGolem.png) | [JSON](../assets/actors/monsters/frostGolem.json) | I8 / R16 / A8 / H0 / D0 |
| north-species-002 | [snowRaider.png](../assets/actors/monsters/snowRaider.png) | [JSON](../assets/actors/monsters/snowRaider.json) | I8 / R16 / A8 / H0 / D0 |
| north-species-004 | [iceElemental.png](../assets/actors/monsters/iceElemental.png) | [JSON](../assets/actors/monsters/iceElemental.json) | I8 / R16 / A8 / H0 / D0 |
| north-species-005 | [snowBear.png](../assets/actors/monsters/snowBear.png) | [JSON](../assets/actors/monsters/snowBear.json) | I8 / R16 / A8 / H0 / D0 |
| north-species-009 | [wraith.png](../assets/actors/monsters/wraith.png) | [JSON](../assets/actors/monsters/wraith.json) | I8 / R16 / A8 / H0 / D0 |
| north-species-016 | [iceBat.png](../assets/actors/monsters/iceBat.png) | [JSON](../assets/actors/monsters/iceBat.json) | I8 / R16 / A8 / H0 / D0 |
| ancient-species-000 | [fallenKnight.png](../assets/actors/monsters/fallenKnight.png) | [JSON](../assets/actors/monsters/fallenKnight.json) | I8 / R16 / A8 / H0 / D0 |
| ancient-species-001 | [desertSnake.png](../assets/actors/monsters/desertSnake.png) | [JSON](../assets/actors/monsters/desertSnake.json) | I8 / R16 / A8 / H0 / D0 |
| ancient-species-002 | [scarab.png](../assets/actors/monsters/scarab.png) | [JSON](../assets/actors/monsters/scarab.json) | I8 / R16 / A8 / H0 / D0 |
| ancient-species-004 | [ancientSentinel.png](../assets/actors/monsters/ancientSentinel.png) | [JSON](../assets/actors/monsters/ancientSentinel.json) | I8 / R16 / A8 / H0 / D0 |
| ancient-species-006 | [ancientGargoyle.png](../assets/actors/monsters/ancientGargoyle.png) | [JSON](../assets/actors/monsters/ancientGargoyle.json) | I8 / R16 / A8 / H0 / D0 |
| ancient-species-009 | [arcaneWisp.png](../assets/actors/monsters/arcaneWisp.png) | [JSON](../assets/actors/monsters/arcaneWisp.json) | I8 / R16 / A8 / H0 / D0 |
| ancient-species-032 | [voidElemental.png](../assets/actors/monsters/voidElemental.png) | [JSON](../assets/actors/monsters/voidElemental.json) | I8 / R16 / A8 / H0 / D0 |

## Exact fallback and accounting evidence

- [actorArt.js:15](../js/assets/actorArt.js#L15) selects direction and maps run to run-a/run-b, timed attack/special to attack, and all other states (including hurt/death) to idle. [actorArt.js:10](../js/assets/actorArt.js#L10) registers the legacy forestWolf with only four bank baselines.
- [monsterArt.js:229](../js/assets/monsterArt.js#L229) builds the other legacy entries with four bank baselines. [monsterArt.js:230](../js/assets/monsterArt.js#L230) resolves species-specific integrated art before the legacy fallback, so additive upgrades can preserve the old resources.
- [PaintedActor.js:20](../js/characters/PaintedActor.js#L20) switches to real hurt/death frames only when the entry explicitly supplies that pose bank. These legacy entries do not, so they keep idle/direction.
- [PaintedActor.js:24](../js/characters/PaintedActor.js#L24) rotates/fades a legacy death unless drawnDeath is set. Lines 25–26 shake/tint hurt. These effects animate an existing idle pose; they do not constitute new drawn state frames.
- [actorArt.test.mjs:10](../tests/actorArt.test.mjs#L10) and [monsterArt.test.mjs:6](../tests/monsterArt.test.mjs#L6) explicitly check the four-bank/32-frame legacy layouts. [actorArt.test.mjs:11](../tests/actorArt.test.mjs#L11) explicitly expects hurt/death to select idle.
- [task10Species.test.mjs:5](../tests/task10Species.test.mjs#L5) checks drawn death for a new species while confirming legacy idle/death rotation. A passing test confirms the fallback implementation, not completion of legacy drawn states.
- [generate-species-catalog.mjs:8](../scripts/generate-species-catalog.mjs#L8) labels legacy rows as 32 painted poses with procedural hurt/death. The report keeps complete:false. Primary-model counts and full-animation counts must remain separate.

## Remaining work without redrawing original identities

Preserve all 23 identities, spot/species IDs, existing source images and original four banks. Reuse of those existing painted banks is appropriate. Add separately preserved upgraded sheets/atlases or another compatible asset arrangement with eight drawn hurt and eight drawn death poses per identity: **23 × 2 × 8 = 368 missing directional poses**. Register the completed upgrade through the species-specific resolver and explicit poseBanks/footlines/frame geometry/drawnDeath metadata. Do not set those flags against missing or copied idle frames.

Task10 completion still requires the 104 unfinished unique primary models, these 23 hurt/death upgrades, and actual eight-direction state/locomotion validation for all 257 primary models. Validate transparency, frame bounds, feet, real state differences, hit/attack timing, death playback and respawn; preserve resource streaming and texture release. Static frame counts and hashes cannot establish facing accuracy, visual quality, or the appearance of motion. AUR-203 adds 84 species after this Task10 completion dependency; it does not absorb or erase these legacy gaps.
