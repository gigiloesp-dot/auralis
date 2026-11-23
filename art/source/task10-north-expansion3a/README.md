# North expansion 3a: eight original painted models

384 original painted poses for reserved north species 013, 023, 025, 031, 033, 035, 038, 040. Art-only delivery; runtime integration and in-game browser review remain the integrating agent’s responsibility.

Each final atlas is 1024×1152 RGBA; 128×192 cells, eight columns n/ne/e/se/s/sw/w/nw, six rows idle/run-a/run-b/attack/hurt/death. Exact measured opaque footlines are exported. All required zero-alpha gutters and transparency checks pass.

ImageGen made all drawings and all transparency/layout edits. Every original, rejected cutout, and rejected reflow is retained. Mechanical Canvas registration scales and places existing complete poses; it never synthesizes anatomy or masks/deletes fragments. Models 025 and 031 use explicitly documented source rectangles in source-registration.json and atlas metadata to register complete drawings against their actual blank source corridors. This preserves full feet and tails that crossed naive equal-cell boundaries. Other models use equal source cells.

All 384 final poses were visually reviewed on the beige QA contact sheets. Earlier equal-grid attempts for 023/025/031 passed gutter tests but showed neighbor-foot fragments; rejected reflows preserve that history. Final complete-pose registration resolves these without removing painted creature pixels.

Climate was checked with getRegionContent(north) and climateAt: 013/023/038/040 volcanic; 025/031/033/035 snow. Manifest contains localized names, original base types, locomotion, and two existing proposed ability IDs; no stat or drop changes.

Reproduce: node scripts/pack-north-expansion3a.cjs && node scripts/validate-north-expansion3a.mjs
