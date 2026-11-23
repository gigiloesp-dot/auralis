# Task10 desert expansion3 original creature art

Eight original painted desert-fantasy creatures,48drawn poses per model. IDs reserved in work/task10/next48-reservations.json desert3. Original generation PNGs and imagegen transparency edits are retained alongside beige contact sheets for review.

The ordinary camp base types are read from TASK10_LAYOUT:020/024/028 desertSnake (serpent),025/029 arcaneWisp (hover),026/031 ancientSentinel (heavy),030 scarab (crawler). New anatomy and silhouettes are original; existing base stats are not changed. Manifest proposes exactly two existing bounded ability IDs per species; integration belongs to the parent task.

Packing is mechanical Canvas source-cell registration only: no synthesized artwork, mirrored poses, anatomy crops, background masking, or recolor variants. Each1024x1152RGBA runtime PNG uses8directions n/ne/e/se/s/sw/w/nw and6banks idle/run-a/run-b/attack/hurt/death in128x192cells. Exact per-pose alpha footlines are measured and exported. Guards:12px sides,70px top,18px bottom; over60% transparent. Source PNGs remain preserved.

Reproduce from repository root:

```
node art/source/task10-desert-expansion3/pack.cjs
node art/source/task10-desert-expansion3/validate.mjs
```

Visual QA must inspect every pose; a gutter pass alone cannot detect neighboring-pose fragments. This art module is not considered live until parent integration and browser acceptance. No runtime/catalog/tests/package/CI/hosting files are changed by this art pack.
