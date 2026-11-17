# Task 2 journal controls regression

Changed only `tests/browser-task2-ui.cjs`.

The obsolete assertion that the entire journal contains only one button was replaced with stricter action-specific checks:

- Exactly one header close button.
- Exactly one button per active quest card, matching that card's `data-track-quest` ID.
- No buttons other than that close control and the correctly bound tracking controls; NPC accept/claim services remain unavailable in the journal.
- Actual tracking off/on clicks must preserve all quest records except the explicitly permitted `__trackingV1` metadata, gold, XP, level, inventory, equipment, potions, attributes, attribute/skill points and learned skills.
- Explicit disabled/selected tracking metadata and aria-pressed states are checked.
- The same progression snapshot remains unchanged after returning to the game.

The driver also logs START/CLOSED per class/locale for slow-browser diagnostics. No existing assertions, game clocks, buff expiry rules or timeouts were relaxed.

## Executed validation

`node --check tests/browser-task2-ui.cjs`: PASS.

A full 18-case RU/EN/ES × six-class run was launched. RU warrior passed all original checks and the new strict journal interaction/progression checks. The next RU archer case failed the existing 15000ms wall-clock wait for the real timed buff to expire; its displayed simulation-time countdown progressed 3→2→1 while several concurrent software-rendered Chrome suites limited frame rate. See `first-run-partial.log`. This run is not claimed as an 18/18 pass.

A DEBUG=pw:api rerun was started to diagnose progress and stopped at the parent's request to release Chrome resources while other suites finish. See `diagnostic-run-interrupted.log`. CI should run the complete final matrix again. No physical Android test was performed.

## Read-only audit of other test assumptions

Saved exact search matches in `readonly-search.txt` and `quest-controls-search.txt`.

- No other obsolete global journal button-count assertion was found.
- `browser-task10-dailies.cjs` had broad `card.locator('button')` tap/count assertions and a broad overflow claim selector. Added tracking makes active/completed cards contain another button. These matches were reported to the parent; this agent did not edit that file.
- `browser-quests.cjs` lines 13/30 select `card.querySelector('button')` for accept/claim. Current service-first DOM order keeps this working, but the selector is order-dependent and was reported.
- Named accept/claim role selectors in first-dungeon, journey, smoke and task8 remain unambiguous. Shop buy/sell selectors use explicit names and are unaffected. Task5 journal assertions test claimed-card removal rather than action counts and remain applicable.

No runtime, registries, requirement ledger, Git commits, pushes or publication were changed by this task.
