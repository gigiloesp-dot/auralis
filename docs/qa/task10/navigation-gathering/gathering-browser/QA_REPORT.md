# Task 10 gathering browser QA

The existing gathering runtime was exercised through actual Canvas touchscreen events and the actual NPC accept/claim controls. No flowers were injected into inventory. Test-only fixtures prepared character level, position, inventory capacity, storage failures and clock offsets. This is automated Chromium mobile emulation, not physical Android acceptance.

## Evidence

- `verification.json`: 12 completed collect/claim flows: all four regional quests in RU at 640×360, EN at 740×320, and ES at 844×390. Each flow accepted at its actual NPC, tapped three distinct rendered plants, observed real collect progress 3/3, claimed at that NPC, and consumed the three quest materials. EN/ES NPC UI contained no Cyrillic. No page JavaScript errors were recorded.
- `navigation-verification.json`: a fresh EN browser accepted Mira's moonflower quest, touched the real first flower, gained exactly one material, and observed the live quest tracker/arrow change from `gather-forest-00` to ready `gather-forest-01`. Arrival became false. The player was 65 real world units from the first flower.
- `unit.txt`: 8/8 gathering unit tests. Includes all 32 authored nodes and real road/walkability/encounter-clearance checks, four distinct transparent frames/icons/locales, transaction rollback, stack capacity, exact cooldown, real item registration plus Character normalization in all three Save slots, shared texture cache late-load cleanup, and monotonic streaming scheduling under forward/backward wall-clock changes.
- 24 full-viewport screenshots: `{ru,en,es}-{forest,north,ancient,desert}-{plant,claimed}.png`.
- `en-navigation-before.png` / `en-navigation-after.png`: unobstructed flower and real live navigation update.

## Actual browser edge scenarios

The EN run additionally verified:

- A real rendered-plant tap at 86 world units gives no item/deadline; at exactly 85 it succeeds.
- Repeated touch after a successful pickup cannot award the same flower again.
- World/chunk unload and reload keep the picked-node deadline and quantity; a full page reload through Continue preserves the registered material and metadata.
- Real Save/Character normalization preserves the earned material and deadline independently in all three slots.
- At 60 inventory slots, pickup leaves inventory and plant unchanged.
- A real Storage.setItem QuotaExceededError restores inventory and gathering metadata atomically and leaves the stored save unchanged. A subsequent normal touch succeeds.
- The public pause hub plus guarded actual actor callback cannot gather. A touchscreen tap while dead cannot gather.
- The plant is absent at readyAt−1 and collectible through a real Canvas touch at the exact 600000ms deadline. Returning the wall clock does not alter its persisted absolute deadline.
- Each tested touch circle is at least 44 CSS px. Each regional frame is a distinct real PNG atlas frame.
- Exactly one atlas lease is held by gathering while visible. Moving away releases it and removes its cache entry; entering a real dungeon from its actual entrance clears all gathering actors/lease; renderer destruction frees its cache entry.
- A deferred loader callback after renderer destruction releases once and cannot recreate markers or retain an atlas.

The full 12-flow invocation passed before two final regression assertions were added to the driver: first-pick navigation retargeting and the performance-clock bound after clock restoration. Retargeting was then independently verified in the fresh browser above, and the monotonic bound is covered by the final 8/8 unit run. CI should run the final driver including both assertions.

## Scope and limits

No combat, NPC, quest reward, equipment, save-schema, world-coordinate or artwork changes were made by this QA work. The parent corrected renderer scheduling/retry to use performance.now; absolute plant regrowth remains Date.now-based. No Git commit, push, deployment or physical Android test was performed by this agent.

This is four regional plant types with eight nodes per region, not a completed world-wide flora catalog. The ten-minute regrowth, quantity one, and additive collection-quest reward values remain provisional design parameters. FPS/long-duration world memory tests belong to the parent integration run; this component specifically verifies bounded visible actors, one 512×512 atlas lease (1 MiB RGBA) and release behavior. No claim is made that all Task 10 systems or the 257-species artwork are complete.
