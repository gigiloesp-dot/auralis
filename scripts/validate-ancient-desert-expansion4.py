"""Standalone art contract check; never launches a browser or changes runtime."""
import json,hashlib,re
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parent.parent

def validate(region):
    src=ROOT/f'art/source/task10-{region}-expansion4'
    js=(ROOT/f'js/assets/{region}Expansion4Art.js').read_text()
    entries=json.loads(js.split('Object.freeze(',1)[1].split(');',1)[0])
    defs=json.loads((src/'definitions.json').read_text());assert len(entries)==len(defs)==8
    report={'status':'PASS','runtimeRegistered':False,'totalPoses':384,'models':[]}
    for d in defs:
        ident=d['id'];e=entries[ident];im=Image.open(ROOT/e['url']);assert im.mode=='RGBA' and im.size==(1024,1152)
        atlas=json.loads((ROOT/e['atlasURL']).read_text());assert len(atlas['frames'])==48
        assert all(d['names'].get(lang) for lang in ['ru','en','es'])
        a=im.getchannel('A');h=a.histogram();assert h[0]>1024*1152*.6
        min_pixels=99999;heights=[]
        for direction in ['n','ne','e','se','s','sw','w','nw']:
            hashes=set()
            for bank in e['poseBanks']:
                name=f'{bank}/{direction}';f=atlas['frames'][name]['frame'];assert (f['w'],f['h'])==(128,192)
                cell=im.crop((f['x'],f['y'],f['x']+128,f['y']+192));ca=cell.getchannel('A')
                for rect in [(0,0,12,192),(116,0,128,192),(0,0,128,70),(0,174,128,192)]:assert ca.crop(rect).getbbox() is None,(ident,name,'gutter')
                points=[(i%128,i//128)for i,v in enumerate(ca.get_flattened_data())if v>128]
                assert len(points)>200,(ident,name,'empty');min_pixels=min(min_pixels,len(points))
                bottom=max(p[1] for p in points);assert bottom==e['footlines'][name],(ident,name,'footline')
                if bank=='idle':heights.append(bottom-min(p[1]for p in points)+1)
                hashes.add(hashlib.sha256(ca.tobytes()).hexdigest())
            assert len(hashes)==6,(ident,direction,'duplicate states')
        if d['baseType']=='fallenKnight':assert 60<=max(heights)<=75,(ident,'native humanoid scale',heights)
        report['models'].append({'id':ident,'poses':48,'minimumOpaquePixelsPerFrame':min_pixels,'transparentFraction':h[0]/(1024*1152),'nativeIdleHeights':heights,'sha256':hashlib.sha256((ROOT/e['url']).read_bytes()).hexdigest()})
    (src/'validation.json').write_text(json.dumps(report,indent=2)+'\n')
    print(region,report['status'],'384 poses')
if __name__=='__main__':
    import sys
    for region in sys.argv[1:] or ['ancient','desert']:validate(region)
