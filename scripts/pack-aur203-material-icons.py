#!/usr/bin/env python3
"""Register complete source cells only; no semantic painting or alpha cleanup."""
from pathlib import Path
import hashlib
import json
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'art/source/aur203-first20-material-icons/original-sheet.png'
NAMES=['chestnut-crab-chitin','reed-heron-feather','lantern-snail-mucus','acorn-hopper-antenna','sundew-resin','moss-toad-membrane','amber-dragonfly-wing','fern-newt-scale','rime-walrus-tusk','powder-muskox-wool','obsidian-centipede-plate','crystal-jelly-pearl','porcelain-bell-shard','moss-axolotl-frill','prism-cuttle-ink','scroll-tripod-parchment','sandstone-trilobite-shell','glass-jerboa-whisker','pitcher-cactus-needle','dune-sailray-fin']

def main():
    source=Image.open(SOURCE).convert('RGBA')
    target=ROOT/'assets/icons/monster-materials'
    target.mkdir(parents=True,exist_ok=True)
    entries=[]
    boards={label:Image.new('RGB',(640,512),color) for label,color in [('beige',(202,181,130)),('dark',(35,48,43))]}
    for n,name in enumerate(NAMES):
        row,col=divmod(n,5)
        rect=[col*source.width//5,row*source.height//4,(col+1)*source.width//5,(row+1)*source.height//4]
        cell=source.crop(tuple(rect));cell.thumbnail((112,112),Image.Resampling.LANCZOS)
        icon=Image.new('RGBA',(128,128),(0,0,0,0));icon.paste(cell,((128-cell.width)//2,(128-cell.height)//2))
        path=target/('aur203-'+name+'.png');icon.save(path,optimize=True)
        for board in boards.values():board.paste(icon,(col*128,row*128),icon)
        entries.append({'name':name,'sourceRect':rect,'url':str(path.relative_to(ROOT)),'width':128,'height':128,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
    for label,board in boards.items():board.save(SOURCE.parent/('packed-icons-'+label+'-qa.png'))
    proof={'source':str(SOURCE.relative_to(ROOT)),'sourceSize':list(source.size),'sourceSHA256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'method':'Complete 5x4 source cells, proportionally reduced to112px and centered on128px RGBA canvases. No semantic editing, alpha normalization, repainting, trimming or recoloring.','entries':entries}
    (SOURCE.parent/'provenance.json').write_text(json.dumps(proof,indent=2)+'\n')

if __name__=='__main__':main()
