# Quest navigation QA follow-up

Branch: `codex/auralis-master-development`. This report covers the navigation browser-driver repair only; no runtime files, save format, publication or Git refs were changed by this QA task.

## Results and scope

- `node --test tests/task10QuestNavigation.test.mjs`: **7/7 passed** against the current 149 quest definitions. Output: `work/task10/navigation-unit.log`.
- `AURALIS_NAVIGATION_FOLLOWUP_ONLY=1 node tests/browser-task10-navigation.cjs`: **passed**. Output: `work/task10/navigation-followup.log`; structured proof: `work/task10/navigation/followup-verification.json`.
- The earlier full browser run reached all **108 class × language × viewport matrix cases** (6 classes × RU/EN/ES × 6 sizes), then failed in the separate NPC follow-up. Its original `work/task10/quest-navigation-browser.log` and six class PNGs are preserved. That run did not finish and did not write its final JSON. The follow-up run does not claim to have repeated those 108 cases; its JSON deliberately has `cases: 0` and `followupOnly: true`.
- Default driver behavior still runs all 108 cases **and** every follow-up. It now persists matrix JSON immediately after the matrix, before follow-ups, so a later failure cannot discard the numeric evidence.
- No physical Android acceptance was performed.

## Driver cause and correction

The previous `selectOption` failure was not a save-slot selector issue. The prepared hero position `(1170,1130)` was outside Mira's interaction radius and near Elia. The real NPC helper opened the nearest NPC and could not select unavailable Mira. The fixture now reads Mira's actual region and coordinates from `NPCS`; interaction still uses the real NPC UI.

The claim test now explicitly toggles tracking through the real NPC quest card before claiming. An implicitly selected first quest is correctly shown as pressed without writing metadata; toggling it off and on makes this an explicit durable selection. The claim must then automatically select the next active quest.

## Follow-ups that passed

- A newly created character retained exactly `quests: {}` through ordinary world frames; one HUD and one arrow node existed. Proof: `navigation/virgin-verification.json`.
- Actual NPC tracking, actual reward claim, `claimed` state and automatic selection of the next contract.
- Three independent save slots restored through the actual main-menu Continue screen and each slot's primary button. The test checks both slot number and `NavSlot1/2/3` name, plus durable quest selection and one arrow. No direct load shortcut substitutes for this UI.
- Explicit untracking hides HUD and arrow; tracking can be restored.
- Four ring-only cross-region routes use an actual portal/teleporter waypoint in the current region. Opposite regions require three route regions. Opening the large map hides the arrow and exposes no monster/camp/boss markers.
- Dungeon navigation points to the real dungeon exit coordinates.
- Desert hill projection: surface height 56 and finite navigation angle; `navigation/desert-relief.png` captured.
- Death hides the arrow.
- Twelve RU/EN/ES interface rebuilds keep exactly one HUD, one arrow and one postupdate listener.
- No JavaScript page errors were captured.

## Remaining verification

A single complete default run on the final integrated revision/CI is still required before claiming the entire navigation browser suite passed on that revision. The previous 108-case matrix and this successful follow-up run are separate pieces of evidence. Published build and physical Android review remain the parent task's responsibility.
