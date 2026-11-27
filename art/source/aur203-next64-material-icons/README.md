# AUR-203 remaining 64 original material icons

Prepared additive material definitions: `js/equipment/aur203ExpansionMaterials.js`.

64 original transparent PNG material icons, each 128 × 128, correspond one-to-one to forest088–096 (9), north080–093 (14), ancient049–061 (13), and desert060–087 (28). RU/EN/ES labels, exact placement-derived levels, stable material IDs, and source-cell mappings are retained in `manifest.json` and `provenance.json`.

Four complete image_gen source sheets and their exact prompts are retained in the batch subdirectories. `generation.json` records original generated paths and SHA256. No source was discarded; there were no rejected generations or semantic repairs.

`python scripts/pack-aur203-next64-material-icons.py` mechanically crops complete equal source cells, proportionally reduces them to fit 112px, and centers them in transparent 128px canvases. It performs no painting, erasing, alpha normalization, trimming, recoloring, or thresholding. The packer validates visible alpha bounds, transparent gutters, full alpha range and unique output hashes.

Every packed icon was visually inspected at native 128px on both beige and dark QA boards. All 64 show complete distinct materials with readable silhouettes and appropriate species anatomy. Bird materials are feathers or beak fragments, plant materials are petals/husks, and armored materials follow their actual surface anatomy.

This package defines materials only. Runtime registration belongs to the root integration stage. No new equipment, prices, recipes, drop probabilities, gold rules or consumables are introduced. The existing first20 module and icons remain unchanged.
