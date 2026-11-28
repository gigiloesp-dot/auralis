# Four original Task10 ordinary creature paintings

These are original imagegen-produced transparent paintings, not recolored versions of existing models. Runtime integration is separate; this folder alone does not establish a completed in-game species.

|Species|Proposed RU / EN / ES name|Existing region / locomotion|Painting|
|---|---|---|---|
|forest-species-008|Корнекоронная гадюка / Root-crowned viper / Víbora coronada de raíces|forest, woodland, level18, serpent|Root antlers, fern crest, looping legless body|
|north-species-011|Дух пепельной урны / Cinder urn spirit / Espíritu de urna de cenizas|north, volcanic, level35, hover|Floating broken basalt urn, two flame arms, smoke base|
|ancient-species-007|Древний корневой страж / Elder root sentinel / Guardián de raíces ancestrales|ancient, elder-forest, level36, heavy|Hollow trunk, heavy root arms/legs, mushrooms and embedded stone runes|
|desert-species-023|Серповидный песчаный богомол / Sickle dune mantis / Mantis de dunas falciforme|desert, sand, level56, crawler|Six-limbed insect, two crescent scythes, triangular head, wingcases|

Each original sheet is1448×1086,8columns×6rows. Three source sheets had neighboring mouth/branch/claw contact. Their preserved originals were edited using imagegen to create `-reflow.png`, with completed bodies and larger cell margins. The unchanged urn source required no reflow. Mechanical packing only scales/crops equal cells; it does not synthesize anatomy or animation.

Runtime atlas: each1024×1152 PNG RGBA,128×192 perframe,48painted poses. Banks: idle,run-a,run-b,attack,hurt,death. Columns:n,ne,e,se,s,sw,w,nw. These are six pose banks with two locomotion drawings, not six full multiframe clips. Some small proportions vary across generated directions; physical Android appearance remains to be checked. Live resolver/abilities are integrated and tested separately.

Body target height69/77/88/76worldpixels respectively, measured source footlines perpose, annotation12pxabove body. These values are new model display calibration only, not collision or combat changes. Each decoded texture4,718,592bytes; do not preload all four globally.

Rebuild: `node scripts/pack-further-bestiary.cjs`.
Validate: `node scripts/validate-further-bestiary.mjs`.
`validation.json` proves48nonempty distinct state frames/model,8directions,RGBA dimensions,60%+fully transparentpixels,zero alpha in12pxhorizontal/70pxtop/18pxbottom gutters,exact measured feet. `-composited-qa.png` are beige-backed viewing aids, not runtime textures; all192poses visually reviewed for neighboring limb fragments.

Integration edits only speciesArtRegistry.js and speciesRuntime.js: stable IDs map to these assets, with localized names and bounded alternating abilities. Existing stats,drops,camps,quests,Git refs and deployment remain unchanged. tests/task10FurtherSpecies.test.mjs verifies source art and every baseline stat; tests/browser-task10-further-species.cjs checks actualcamp/poses/ability releases/locales/death30s/save/reload/texturecleanup. FullTask10 remains incomplete; these four do not certify the remaining species.
