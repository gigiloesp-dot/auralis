#!/usr/bin/env python3
"""Pack complete generated source cells; never paint or normalize source pixels."""
from pathlib import Path
import hashlib,json
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'art/source/aur203-next64-material-icons'
def digest(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def main():
    manifest=json.loads((BASE/'manifest.json').read_text())
    all_entries=[]
    for batch in manifest['batches']:
        folder=BASE/batch['folder']; path=folder/'original-sheet.png'
        source=Image.open(path).convert('RGBA'); cols,rows=batch['grid']
        assert len(batch['entries'])==cols*rows
        boards={label:Image.new('RGB',(cols*128,rows*128),color) for label,color in [('beige',(202,181,130)),('dark',(35,48,43))]}
        entries=[]
        for n,item in enumerate(batch['entries']):
            row,col=divmod(n,cols)
            rect=[col*source.width//cols,row*source.height//rows,(col+1)*source.width//cols,(row+1)*source.height//rows]
            cell=source.crop(tuple(rect));cell.thumbnail((112,112),Image.Resampling.LANCZOS)
            icon=Image.new('RGBA',(128,128),(0,0,0,0));icon.paste(cell,((128-cell.width)//2,(128-cell.height)//2))
            target=ROOT/item['iconURL'];target.parent.mkdir(parents=True,exist_ok=True);icon.save(target,optimize=True)
            for board in boards.values():board.paste(icon,(col*128,row*128),icon)
            alpha=icon.getchannel('A');bounds=alpha.getbbox()
            assert bounds and bounds[0]>=8 and bounds[1]>=8 and bounds[2]<=120 and bounds[3]<=120, (item['id'],bounds)
            assert alpha.getextrema()==(0,255),(item['id'],alpha.getextrema())
            entries.append({**item,'sourceRect':rect,'width':128,'height':128,'sha256':digest(target),'rgbaSHA256':hashlib.sha256(icon.tobytes()).hexdigest(),'alphaBounds':bounds,'transparentPixels':alpha.histogram()[0]})
        for label,board in boards.items():board.save(folder/('packed-icons-'+label+'-qa.png'))
        provenance={'source':str(path.relative_to(ROOT)),'sourceSize':list(source.size),'sourceSHA256':digest(path),'method':'Complete source grid cells, proportionally reduced to 112px and centered on 128px RGBA canvases. No semantic editing, alpha normalization, repainting, trimming or recoloring.','entries':entries}
        (folder/'provenance.json').write_text(json.dumps(provenance,ensure_ascii=False,indent=2)+'\n')
        all_entries.extend(entries)
    assert len(all_entries)==64,len(all_entries)
    assert len({entry['sha256'] for entry in all_entries})==64
    assert len({entry['rgbaSHA256'] for entry in all_entries})==64
    (BASE/'provenance.json').write_text(json.dumps({'count':64,'batches':manifest['batches'],'entries':all_entries},ensure_ascii=False,indent=2)+'\n')
    print('Packed and checked 64 distinct 128px RGBA icons.')
if __name__=='__main__':main()
