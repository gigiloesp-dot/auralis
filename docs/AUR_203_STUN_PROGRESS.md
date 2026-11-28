# AUR-203 bounded monster stun preparation

The new `js/combat/monsterStun.js` is implemented and unit-tested but is **not hooked into gameplay**. Existing ordinary monster effects remain poison and slow. The new module alone does not stop movement, attacks or skills, and must not be described as an active stun feature before the integration below is completed.

The module stores transient per-hero state in a private `WeakMap`. It never adds a property to a hero, changes HP/MP/stats, touches cooldowns, creates timers, or retains renderer/save references. A new character object starts without stun or immunity. Callers supply `scene.playNow` / the existing monster simulation `now`; the module never reads wall time. Pausing that clock pauses elapsed stun time. Backward clock readings cannot extend status; reset the status explicitly when resetting a simulation clock on the same hero.

## Current API

| Function | Result and behavior |
| --- | --- |
| `applyMonsterStun(hero, duration, now)` | Boolean; accepts a living hero with finite positive HP, finite nonnegative clock, and finite positive duration. Clamps duration to 200–800 ms. Rejects an active stun or its 1,000 ms post-stun immunity without refreshing either. |
| `isMonsterStunned(hero, now)` | Boolean; active exactly before the expiry time. |
| `monsterStunRemaining(hero, now)` | Milliseconds remaining, or zero. |
| `tickMonsterStun(hero, now)` | Detached `{active, remaining, immuneRemaining}` snapshot; removes fully expired state. `immuneRemaining` reports only the post-stun protection period. |
| `cancelMonsterStun(hero)` | Boolean; explicit lifecycle reset removes stun and immunity. |

Invalid clock reads report inactive without deleting valid state. A missing/invalid/dead hero cannot receive stun. Any status query/tick observing death deletes its state; explicit death/respawn reset is still required because a death followed by resurrection between observations cannot be inferred from HP alone. The maximum duration is not refreshed by repeated attacks, and immunity is measured from the original stun expiry.

## Exact future integration contract

Only root will make these existing-file edits after the frozen first20 checks:

1. `js/monsters/movementProfiles.js`: import the new status functions. In `applyHeroAffliction(hero,status,now)`, dispatch `status.type === 'stun'` to `applyMonsterStun(hero,status.duration,now)` and return before the current poison/slow container is created. Do not store stun in `hero.monsterAfflictions`. In `tickHeroAfflictions(hero,now,damage)`, tick/clear stun, preserving poison and slow behavior. In `heroMovementMultiplier(hero,now)`, return exactly zero while stunned, otherwise retain the existing slow multiplier. At the `stomp` release inside `tickMonsterAbility`, provide a stun status only for an explicit `abilityConfig.stunOnStomp` opt-in; preserve the existing warning, release time, hit radius, visibility, safe-zone and cancel conditions. Do not apply stun to every stomp.

2. `js/world/WorldScene.js`, `WorldScene.update(now,delta)`: use `this.playNow`, which advances after hidden/orientation/panel/pause early returns. Gate both `swing.impact` and new `attackCycle.start` while stunned. An already-started swing whose impact occurs during stun must not hit or be queued for later; the cycle already consumes its impact in `AttackCycle.state`. Gate actual movement through the zero movement multiplier. Preserve potion input and normal simulation updates so stun expires naturally. Do not pause the full scene for stun.

3. `js/monsters/MonsterSystem.js`, `attack(now)`: guard against stun before target selection, combo/RNG changes, or `strike`. This protects direct calls as well as the scene loop. `useSkill(id,now)` must reject with `{ok:false,reason:'stun'}` before target selection, `commitSkill`, animation, mana, cooldown writes and effect scheduling. The reusable `prepareSkill` function in `js/combat/skillRuntime.js` should also reject stun after its dead check and before cooldown/mana checks. `commitSkill` remains the successful-cast resource boundary. Existing hostile ability/projectile callbacks already route their status through `applyHeroAffliction` after damage; dead heroes are rejected by the new module.

4. Lifecycle: call `cancelMonsterStun` on the old hero in `WorldScene` shutdown and death handling, and at `js/world/WorldRuntime.js` `respawn()` before it restores HP on the same object. If world transitions should clear temporary stun, explicitly cancel in `WorldRuntime.load()` rather than silently resetting simulation time. `js/ui/SavePanel.js` `applyImport()` replaces `scene.hero` with `createCharacter(Save.load(...))`; the new object inherently has no WeakMap state, and the old object can be cancelled during replacement. `js/systems/save.js` `Save.normalize`, `Save.write` and `Save.load` require no status-schema changes.

5. Optional HUD: `js/ui/temporaryEffects.js` exports `temporaryEffects(hero,buffs,now,language)` and `js/ui/EffectsHud.js` consumes it. Append a localized negative stun entry using remaining simulation milliseconds and a suitable existing icon; never create a buff, a timer, or a serializable hero property. `BattleHud.update()` may visually disable skill buttons during stun, but `MonsterSystem.useSkill` / `prepareSkill` remain authoritative. `js/ui/BattleHud.js` potion handlers and `js/systems/potions.js` stay usable during stun.

## Three proposed future species opt-ins

These are preparation data only; current64 proposal rows still use their two actual existing abilities and contain no active unsupported status:

| Species | Existing action | Proposed `stunOnStomp` duration | Minimum visible warning |
| --- | --- | --- | --- |
| `north-species-084`, Ice chime sextuped | `stomp` | 700 ms | 1,100 ms |
| `ancient-species-052`, Astrolabe Tortoise | `stomp` | 600 ms | 1,100 ms |
| `desert-species-078`, Dune Drum Guardian | `stomp` | 800 ms | 1,200 ms |

Only apply the status on a real successful warned stomp hit, once per cast. Reapplication and the 1,000 ms protection interval are enforced by the status module regardless of attacking species. These candidates do not modify any of the previous20 kinds, existing skill formulas, economy, gear or frozen placements.

## Validation

`node --test tests/monsterStun.test.mjs` passes six focused tests covering exact expiry, paused clocks, repeated-hit immunity, bounds/invalid inputs, death/reset, regressing clocks, hero independence, detached snapshots, unchanged serialization, actual `Save.normalize` / `Save.write` / `Save.load` and fresh `createCharacter` restoration.

Before claiming gameplay completion, integration needs real tests for zero displacement, blocked basic attack impact/start, blocked active skills with unchanged MP/cooldowns, usable potions, expiry recovery, cancellation, pause preservation and save/load. Those are intentionally not claimed by the current pure-module tests.
