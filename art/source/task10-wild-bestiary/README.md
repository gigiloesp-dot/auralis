# Four original Task10 wild creature paintings

These are original imagegen-produced transparent paintings, not recolors of existing monster images. This art-only pack is not itself evidence of live integration or complete Task10 bestiary.

|Stable species ID|Proposed RU / EN / ES name|Existing camp / AI|Distinct silhouette|
|---|---|---|---|
|forest-species-015|Мшистый секач / Moss-armored tusker / Jabalí de armadura musgosa|woodland, level9, wildBoar charge|Heavy chestnut quadruped, paired ivory tusks, bark armor, fern-and-moss mane|
|north-species-017|Луннокрылая морозная моль / Hoarfrost-winged moth / Polilla de alas escarchadas|snow, level28, iceBat flight/dive|Flying furry insect, scalloped moon-eyed wings, feather antennae; separate up/down wing poses|
|ancient-species-013|Тростниковый утопленный рыцарь / Reed-plated drowned knight / Caballero ahogado de juncos|elder-marsh, level36, fallenKnight cleave|Slender reed-armored swamp husk, tarnished diving-bell helmet, hooked glaive|
|desert-species-007|Дух песочных часов / Hourglass sand elemental / Elemental del reloj de arena|sand, level50, arcaneWisp hover/blink|Floating sandstone hourglass, crescent claw arms, tapered swirling sand base; no humanoid legs|

Each original source is1448×1086,8columns×6rows. All originals are preserved as `*-original.png`. Imagegen editing created `*-reflow.png` with more cell separation and completed extremities. These retained sources include low-alpha background traces produced by the generator; beige composites show the actual packed appearance. No programmatic anatomy synthesis, recoloring, or semantic image cleanup is used.

Each runtime PNG is1024×1152 RGBA,128×192 perframe,48separate painted poses. Columns:n,ne,e,se,s,sw,w,nw. Six banks:idle,run-a,run-b,attack,hurt,death. Two movement drawings are present; this is not six full multiframe animation clips. Generated directional proportions vary slightly; live browser integration and physical Android acceptance remain separate.

Mechanical packing scales equal source cells into a96px box, preserving transparent runtime gutters; it does not change anatomy. Display body target heights76/72/83/75worldpixels, individual measured feet and annotation12pxabove idlebody. Each decoded atlas is4,718,592bytes; register lazily via ActorTextureCache and never preload all packs globally.

Rebuild: `node scripts/pack-wild-bestiary.cjs`.
Validate: `node scripts/validate-wild-bestiary.mjs`.

`validation.json`:4models/192nonempty painted poses;8directions;6distinct alpha silhouettes per direction;60%+fully transparent texels;zeroalpha in12pxhorizontal/70pxtop/18pxbottom gutters;all48footlines measured exactly;SHA256 perruntimePNG. All192 beige-composited poses were visually reviewed: distinct directions, movement/attack/recoil/death poses, no neighboring severed limbs or weapon fragments. `*-composited-qa.png` are viewing aids, not runtime textures.

No stats, drops, camp positions, quests, existing files, item data, registries, Git refs or hosting were changed by this art-only task. Parent integration should bind each ID to its real camp, localize names, preserve current stats/drops, then verify real ability callbacks,30srespawn,save/reload and texture lease cleanup. Only after those checks should these count as in-game ready species.
