# AUR-203 consumable drop foundations

Implemented and frozen for root integration on 2026-11-27. This package supplies the drop helper, persistent ground-item support, transactional potion pickup, localized loot UI, and focused tests. The actual `MonsterSystem.hit` death hook and browser verification remain owned by root; this package does not edit that file.

The prior `AUR_203_CONSUMABLE_DROP_AUDIT.md` describes an earlier proposal. Its suggested4%/2% exclusive roll and full-bag exemption are superseded by the implementation below.

## Root integration

Import `rollAur203GroundConsumables` from `../loot/groundConsumables.js` into `js/monsters/MonsterSystem.js`. At the real death event, append its result **after** the existing encounter loot roll:

```js
const drops=rollEncounterLoot(this.hero,m.kind);
drops.push(...rollAur203GroundConsumables(m,deathAt));
```

The helper accepts `(monster,killedAt,kind=monster.kind)`. It requires the persistent `monster.key` and actual death timestamp. It returns a fresh array and does not mutate the monster, hero, existing drops or RNG. The actual kind must carry its exact `speciesId`; no broad archetype or prefix gate is used.

Eligible IDs are exactly forest080–096 (17), north076–093 (18), ancient045–061 (17), desert056–087 (32), totaling84. The helper rejects bosses and any descriptor with `bossType`. The old257 IDs remain ineligible. Unintegrated future species cannot acquire drops until root registers and spawns them.

## Implemented behavior

- Two independent checks:2%HP and1%MP, common rarity and quantity1 each. Both can succeed. These are root-selected technical starting values, **not owner-balanced or playtested values**. No luck, class, level or bag-capacity multiplier is applied.
- A versioned namespace, monster key, death timestamp and separate `hpPotion`/`mpPotion` salts feed FNV-1a over JavaScript UTF-16 code units followed by a fixed32-bit avalanche. The same death event always yields the same result. The helper never calls global `Math.random` or equipment/material RNG, so existing current and subsequent RNG calls/results remain unchanged.
- `hpPotion`/`mpPotion` descriptors exist only in `groundConsumables.js`. They are not registered in `ITEM_DEFS`, generated equipment, material maps, inventory normalization, shops, crafting or storage. Existing red/blue bottle SVGs and rarity frames are reused.
- `groundDropDefinition` delegates old IDs to the unchanged `itemDefinition` lookup and recognizes only the two additional exact potion IDs. Create, pending-placement persistence, save normalization and reload use this resolver. Unknown IDs stay rejected.
- Potions remain anonymous wooden chest markers until tapped. The existing loot panel then shows RU/EN/ES potion name, quantity, frame and icon, and the existing Take/Take all actions. No layout or input-controller changes were made.
- Pickup still requires a living hero, same region, actual world distance≤180, and existing visibility/panel gates. The radius cannot be increased by the caller.
- A full60-slot inventory blocks potion pickup even though the destination is the resource pouch. The complete ground drop remains available. Potion pickup never creates a bag item or consumes a free inventory slot.
- Per-resource pouch capacity is99. At or above99, pickup rejects with localized `potionCapacity`; legacy counts above99, including large finite imported values, are retained. Depleted zero counters remain zero until a real transfer succeeds.
- Single pickup fails closed if the complete quantity cannot fit. Bulk pickup with `allowPartial:true` fills available room and keeps the remainder on ground. Ordinary generated potion rewards have quantity1; this policy also handles normalized multi-quantity records.
- Potion counter mutation and ground removal/remainder share one synchronous save. Only literal `true` commits the potion transaction. False, throw, undefined or a Promise fail closed, restoring the original potion object/absence and original drop record; inventory identity stays unchanged. The existing WeakSet protects against reentrant pickup. Existing ordinary item API/save-return semantics are unchanged.
- A successful `WorldScene.save`→`Save.write` persists potion counts, drops/remnants, pending jobs, death-event timestamps and monster death state in the same character JSON. Event timestamps prevent recreating a collected reward for the same death; later respawn deaths are legitimate new events. Pending jobs retain the already-rolled items and do not reroll.

No daily10HP/5MP rewards, merchant price10, consumption45%/shared3s cooldown, equipment catalogue, old gear/material probabilities, boss tables, gold grants or source ledgers were changed.

## Validation

Executed on 2026-11-27:

```sh
node --test tests/groundConsumables.test.mjs tests/groundLoot.test.mjs tests/potions.test.mjs tests/save.test.mjs tests/bossLoot.test.mjs tests/lootCatalog.test.mjs
```

Result: **54 passed,0 failed**. Full output retained in `/tmp/aur203-ground-consumables-validation.log` during the session. Syntax checks passed for all four runtime files.

The new11 tests exercise actual public functions, actual `Save.write`/`Save.load` and character normalization: exact84/old257/boss eligibility; fixed deterministic hash vectors; both independent potion successes without global RNG; unchanged ordinary/boss and subsequent RNG trace; no catalogue or bag registration; existing bottle colors/frames; full bag; cap99 and legacy counts; partial remainder; false/throw/undefined/Promise rollback; real localStorage quota failure; reentrancy; pending placement; duplicate death/pickup; all three save slots; depleted potion use/reload; unknown IDs; and radius180/life/region checks. The43 existing focused tests also pass unchanged. Root still needs the actual kill-hook/browser touch and save-failure pass.

The existing kill/drop creation path does not roll an in-memory kill back when its initial save fails. A later successful pickup save includes death/event state; closing the tab before any successful save restores the previous durable state. This package preserves that existing behavior and does not claim unsaved kills survive a failed storage write. Async save callbacks are unsupported and must not be supplied to potion pickup.

## Source hashes at handoff

SHA256 before/after for existing owned runtime files:

| File | Before | After |
| --- | --- | --- |
| `js/loot/groundLoot.js` | `f42d63ee1b427ec4fd87a133c0e5773877129bc9aee6428d21c87074b9591119` | `88e6ca3475ffc35cb1bc7ff257b32b7e2e143802a111f626290cb1ca0e2fc0fa` |
| `js/loot/GroundLootSystem.js` | `e2c850c51be0c9b5348e32dbf543f466f38b03460d147ce0f4877892817a5800` | `1c7372fd5cd7961dbac03551156849fe7ff5b9c147d3af999914c62a3bc36a5a` |
| `js/ui/LootPanel.js` | `5d1f0949817bb6de430765c90f1017d67911bd919037a987a05b3dff89237a31` | `da26deba2a53d855fd6a94091efa1ba79f7caf10035aedc61b88fb9c93f9900a` |

New files have no before version:

| File | SHA256 |
| --- | --- |
| `js/loot/groundConsumables.js` | `44f7d309cb3633afee51f4407625eef301eb3686a29dae8a61571a50693f4433` |
| `tests/groundConsumables.test.mjs` | `34953469799f5aeb953a48cc112f768065d25d6354448862ae6acb5b54841386` |

No finished64-material art, Git state, browser session, geometry, source ledger, monster runtime or core input files were changed by this implementation task.
