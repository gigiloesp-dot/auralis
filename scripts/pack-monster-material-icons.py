#!/usr/bin/env python3
"""Mechanical whole-cell registration only: no semantic editing or alpha cleanup."""
from pathlib import Path
import hashlib,json
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'art/source/aur203-material-icons/original-sheet.png'
NAMES=['boar-tusk','raider-pouch','bear-hide','spider-silk','bone-fragment','ice-fang','frost-crystal','sentinel-runestone','arcane-shard','bat-wing','snake-scales','orc-token','elemental-essence','ghost-veil','scarab-shell','gargoyle-fragment']
def main():
 image=Image.open(SOURCE).convert('RGBA');entries=[]
 target=ROOT/'assets/icons/monster-materials';target.mkdir(parents=True,exist_ok=True)
 for n,name in enumerate(NAMES):
  row,col=divmod(n,4);rect=[col*image.width//4,row*image.height//4,(col+1)*image.width//4,(row+1)*image.height//4]
  cell=image.crop(tuple(rect));cell.thumbnail((112,112),Image.Resampling.LANCZOS)
  output=Image.new('RGBA',(128,128),(0,0,0,0));output.paste(cell,((128-cell.width)//2,(128-cell.height)//2))
  path=target/(name+'.png');output.save(path,optimize=True)
  entries.append(dict(id=name,sourceRect=rect,url=str(path.relative_to(ROOT)),width=128,height=128,sha256=hashlib.sha256(path.read_bytes()).hexdigest()))
 proof=dict(source=str(SOURCE.relative_to(ROOT)),sourceSize=list(image.size),sourceSHA256=hashlib.sha256(SOURCE.read_bytes()).hexdigest(),method='Whole 4x4 grid cells scaled proportionally to112px and centered on128px transparent canvas. Original source and all alpha pixels retained before scaling. No repainting/erasing/recoloring.',entries=entries)
 (SOURCE.parent/'provenance.json').write_text(json.dumps(proof,indent=2)+'\n')
if __name__=='__main__':main()
