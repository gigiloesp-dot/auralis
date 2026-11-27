# AUR-203 bounded stun gameplay integration

This follow-up connects the transient WeakMap status in `js/combat/monsterStun.js` to the real monster ability, movement, scene attack, skill and timed-effects APIs. It does not activate any species, modify stats or introduce new equipment/save fields.

## Behavior

- Only a positive finite `abilityConfig.stunOnStomp` opt-in adds stun to an actual successful warned stomp hit. Existing release timing, snapshot radius, LOS, safe-zone, engagement and living-target checks remain authoritative. Old monsters and the first20 AUR-203 additions have no opt-in.
- `applyHeroAffliction` routes stun to the WeakMap before creating the legacy poison/slow container. `tickHeroAfflictions` also ticks transient state even when no serializable afflictions exist. Movement multiplier is zero during stun and restores an ongoing slow after expiry.
- The actual `WorldScene.update` consumes blocked attack presses, does not start a new cycle while stunned, and consumes an interrupted pending basic impact. A blocked tap never queues a delayed strike; an explicitly held attack can start a fresh cycle after recovery. Existing pointer release/reset handling is unchanged.
- `prepareSkill` rejects stun before cooldown/MP tests or commit. Root added the additional direct MonsterSystem attack/skill guards before target/state/resource handling; their behavior is covered by the integration test. Root owns warning appearance and species activation.
- Already flying projectiles remain active. Potions remain usable under their existing shared cooldown and resource rules.
- World transitions and respawn explicitly cancel status/immunity. Scene death and shutdown cancel the old hero status. Save/character recreation stores no transient status, so no schema migration is needed.
- Existing timed EffectsHud receives only the localized active stun icon and remaining simulation seconds. Immunity creates no icon, passive entry, new panel or persistent field. The reused icon is the existing warrior area skill symbol, not a newly drawn unique stun asset.

The module clamps positive durations to200–800ms and gives1000ms post-stun immunity. The proposed north084700ms/1100ms warning, ancient052600ms/1100ms warning and desert078800ms/1200ms warning remain technical candidates, **not owner-approved balance**. No species values were changed by this integration.

## Checks actually run

`node --test tests/monsterStun.test.mjs tests/monsterStunIntegration.test.mjs tests/movementProfiles.test.mjs tests/skills.test.mjs tests/skillRuntime.test.mjs tests/attackTiming.test.mjs tests/potions.test.mjs tests/combatSystem.test.mjs tests/temporaryEffects.test.mjs`

All46/46 focused checks passed, including direct API tests: all six MonsterSystem attack and skill calls reject before target lookup, combo/facing changes or hero/resource writes; an already flying real mage projectile still hits while the caster is stunned. Integration tests use the actual scene update, AttackCycle, WorldRuntime respawn, MonsterSystem, potion and skill APIs with minimal rendering harnesses. Pure tests additionally exercise actual Save normalize/write/load and createCharacter reconstruction.

`tests/browser-aur203-stun.cjs` is prepared and passes `node --check`; it has not been executed by this agent. It tests six UI-created classes in real Phaser with declared cloned-kind stomp, HP/MP, skill, position and paused-clock fixtures, rather than claiming authored species or earned-campaign acceptance. It covers warning/dodge/hit, direct gates, potions, RU/EN/ES timed HUD, scene blocked tap/pending impact, save isolation, expiry/immunity and region reset at740×320/844×390.

No browser or physical Android test was run by this integration agent. Root retains the single browser and final publication/CI responsibility. Protected-source ledger updates are deliberately left to root; existing checks must not be weakened.

## Source receipt

SHA-256 before/after this agent's owned runtime edits (no Git commit was made):

| File | Before | After |
| --- | --- | --- |
| `js/monsters/movementProfiles.js` | `a778d5daa4c4328192ff7657cbd454eea792146acbcb0318b7e93d829cf13016` | `f80395479431f5f55c1f73fff15409938101d218d11413b7a245f028dfd70de3` |
| `js/world/WorldScene.js` | `1c5305a0d3934656704a661f72225890f46d5cdf100b172a9e052bc28bd8f870` | `f798ddff5e2814cfd1193486afd065bf17e9dfeabf8bdd27e96ef410569eff61` |
| `js/world/WorldRuntime.js` | `d9124ba621b4bb7285b4cac9930e42ffe1ee695c34174aca9a6d8a49767c1865` | `a5713d90616bad82edba8117390275bf3d367af3825ff6a0599fea930de08167` |
| `js/combat/skillRuntime.js` | `a74f2de1f23b76799cf6885ee43fe4aaac863b3309ca14dbdfd14cdb7971464b` | `3f8c688527ba5718a591b16f8fdce6c12ba43976be465ca2c7bffac766d28a3b` |
| `js/ui/temporaryEffects.js` | `689115813843184f1c90c5818b5d79951d64e4f43e4db4921cafd60206d72ecf` | `10eedc4c3a639c725b5c429ddec84397e946111c8c9afe7ccbb71290bd9a632c` |
