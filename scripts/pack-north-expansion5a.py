"""Mechanical registration of generated complete poses; no alpha editing.

Opaque support is measured only to locate blank separating corridors and the
complete pose plus an eight-pixel source margin. Every cropped rectangle is
resampled as RGBA without thresholding, erasing, repainting or anatomy changes.
"""
import json
from pathlib import Path
import numpy as np
from PIL import Image

SOURCE = Path('art/source/task10-north-expansion5a')
TARGET = Path('assets/actors/task10-north-expansion5a')
BANKS = ['idle', 'run-a', 'run-b', 'attack', 'hurt', 'death']
DIRECTIONS = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']
DEFINITIONS = [
    ('058', 'snowdrift-shovel-paw-bear', 75, 86),
    ('059', 'censer-cage-ash-revenant', 75, 78),
    ('060', 'snowshoe-fan-tail-dhole', 72, 74),
    ('061', 'crescent-shoulder-glacier-golem', 75, 84),
    ('062', 'wheelhand-icicle-colossus', 75, 84),
    ('063', 'furnace-mantle-hookshot-brigand', 75, 78),
    ('064', 'icicle-ear-sailback-snowhound', 73, 76),
    ('065', 'snowflake-jelly-spindle-elemental', 72, 74),
]

def corridor(scores, nominal, radius=40):
    lo, hi = max(0, nominal-radius), min(len(scores), nominal+radius+1)
    candidates = np.where(scores[lo:hi] == 0)[0]+lo
    if not len(candidates):
        raise ValueError(f'No blank corridor around {nominal}; imagegen repair required')
    return int(min(candidates, key=lambda x: abs(x-nominal)))

entries = {}
for suffix, slug, native_height, world_height in DEFINITIONS:
    species = 'north-species-'+suffix
    original = SOURCE/(species+'-original.png')
    source = SOURCE/(species+'-reflow.png')
    if not source.exists():
        cutout = SOURCE/(species+'-cutout.png')
        source = cutout if cutout.exists() else original
    im = Image.open(source).convert('RGBA')
    alpha = np.asarray(im)[:, :, 3]
    solid = alpha > 128
    width, height = im.size
    rows = [0]+[corridor(solid.sum(axis=1), round(i*height/6)) for i in range(1, 6)]+[height]
    poses = []
    for r in range(6):
        region = solid[rows[r]:rows[r+1]]
        columns = [0]+[corridor(region.sum(axis=0), round(i*width/8)) for i in range(1, 8)]+[width]
        for c in range(8):
            y, x = np.where(region[:, columns[c]:columns[c+1]])
            assert len(x) > 200, (species, r, c)
            left, top = int(x.min()+columns[c]), int(y.min()+rows[r])
            right, bottom = int(x.max()+columns[c]+1), int(y.max()+rows[r]+1)
            rect = (max(columns[c], left-8), max(rows[r], top-8), min(columns[c+1], right+8), min(rows[r+1], bottom+8))
            poses.append(dict(row=r, column=c, rect=rect, paintedHeight=bottom-top))
    # One uniform scale per species preserves anatomical proportions across all
    # states, including naturally shorter collapsed death poses.
    factor = min(native_height/max(p['paintedHeight'] for p in poses[:8]),
                 96/max(p['rect'][2]-p['rect'][0] for p in poses),
                 96/max(p['rect'][3]-p['rect'][1] for p in poses))
    canvas = Image.new('RGBA', (1024, 1152))
    frames, footlines, idle_heights, source_rects = {}, {}, [], {}
    for pose in poses:
        r, c, rect = pose['row'], pose['column'], pose['rect']
        tile = im.crop(rect)
        size = (round(tile.width*factor), round(tile.height*factor))
        tile = tile.resize(size, Image.Resampling.LANCZOS)
        x, y = c*128+(128-size[0])//2, r*192+173-size[1]
        canvas.alpha_composite(tile, (x, y))
        name = BANKS[r]+'/'+DIRECTIONS[c]
        frames[name] = {'frame': {'x': c*128, 'y': r*192, 'w': 128, 'h': 192}}
        source_rects[name] = dict(x=rect[0], y=rect[1], w=rect[2]-rect[0], h=rect[3]-rect[1])
        support = np.asarray(canvas)[r*192:(r+1)*192, c*128:(c+1)*128, 3] > 128
        ys, xs = np.where(support)
        assert len(xs) > 200, (species, name)
        footlines[name] = int(ys.max())
        if not r:
            idle_heights.append(int(ys.max()-ys.min()+1))
    output = TARGET/(species+'.png')
    canvas.save(output, optimize=True)
    atlas = TARGET/(species+'.json')
    atlas.write_text(json.dumps({'frames': frames, 'meta': {'image': species+'.png', 'size': {'w': 1024, 'h': 1152}, 'source': str(source), 'sourceSize': {'w': width, 'h': height}, 'sourceRects': source_rects, 'uniformRegistrationScale': factor, 'alphaEditing': False}}, indent=2)+'\n')
    # Preserve a normalized reflow even for already-safe originals.
    canvas.save(SOURCE/(species+'-registered.png'), optimize=True)
    for name, color in [('beige', '#c9b78e'), ('dark', '#273632')]:
        qa = Image.new('RGBA', (1024, 768), color)
        for r in range(6):
            for c in range(8):
                qa.alpha_composite(canvas.crop((c*128, r*192+64, (c+1)*128, r*192+192)), (c*128, r*128))
        qa.convert('RGB').save(SOURCE/(species+'-'+name+'-qa.png'))
    idle = max(idle_heights)
    entries[species] = dict(key='task10-monster-'+slug, url=str(output), atlasURL=str(atlas), scale=world_height/idle, annotationHeight=world_height+12, frameHeight=192, frameWidth=128, poseBanks=BANKS, drawnDeath=True, footlines=footlines)
    print(species, '48 poses;', 'native idle height', idle, '; source', source.name)

Path('js/assets/northExpansion5aArt.js').write_text('// Eight original Task10 art-only models; runtime integration is separate.\nexport const NORTH_EXPANSION5A_ART=Object.freeze('+json.dumps(entries, indent=2)+');\nexport const northExpansion5aArt=id=>NORTH_EXPANSION5A_ART[id]||null;\n')
