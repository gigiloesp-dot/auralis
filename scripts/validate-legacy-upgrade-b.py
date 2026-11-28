"""Art-only exact preservation and appended pose validation."""
import json,hashlib
from pathlib import Path
from PIL import Image
import numpy as np
ROOT=Path(__file__).resolve().parent.parent
SRC=ROOT/'art/source/task10-legacy-upgrade-b'
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def validate():
    js=(ROOT/'js/assets/legacyUpgradeBArt.js').read_text();entries=json.loads(js.split('Object.freeze(',1)[1].split(');',1)[0])
    defs=json.loads((SRC/'definitions.json').read_text());assert len(entries)==len(defs)==8
    result={'status':'PASS','models':[],'oldFramesPreserved':256,'newPosesValidated':128}
    for d in defs:
        ident=d['id'];old=d['originalEntry'];e=entries[ident]
        assert sha(ROOT/old['url'])==d['originalPngSha256']
        assert sha(ROOT/old['atlasURL'])==d['originalAtlasSha256']
        assert e['scale']==old['scale'] and e['annotationHeight']==old['annotationHeight']
        assert e.get('baselines')==old.get('baselines')
        assert e['key']!=old['key'] and e['drawnDeath'] and e['frameHeight']==256 and e['frameWidth']==192
        assert e['poseBanks']==['idle','run-a','run-b','attack','hurt','death']
        im=Image.open(ROOT/e['url']);assert im.mode=='RGBA' and im.size==(1536,1536)
        original=Image.open(ROOT/old['url']).convert('RGBA')
        assert im.crop((0,0,1536,1024)).tobytes()==original.tobytes(),ident+' old RGBA changed'
        atlas=json.loads((ROOT/e['atlasURL']).read_text());old_atlas=json.loads((ROOT/old['atlasURL']).read_text());assert len(atlas['frames'])==48
        for name,value in old_atlas['frames'].items():
            assert atlas['frames'][name]==value,(ident,name,'old atlas metadata changed')
            assert name not in e['footlines'],(ident,name,'old origin override')
        model={'id':ident,'pngSha256':sha(ROOT/e['url']),'old32RGBAExact':True,'old32AtlasFramesExact':True,'oldOriginsExact':True,'scale':e['scale'],'poses':[]}
        for bank in ['hurt','death']:
            hashes=set()
            for direction in ['e','se','s','sw','w','nw','n','ne']:
                name=f'{bank}/{direction}';f=atlas['frames'][name]['frame'];assert (f['w'],f['h'])==(192,256)
                cell=im.crop((f['x'],f['y'],f['x']+192,f['y']+256));a=cell.getchannel('A')
                for rect in [(0,0,8,256),(184,0,192,256),(0,0,192,24),(0,232,192,256)]:assert a.crop(rect).getbbox() is None,(ident,name,'new gutter')
                yy,xx=np.where(np.array(a)>128);assert len(xx)>150,(ident,name,'empty')
                assert int(yy.max())==e['footlines'][name]
                assert abs(int(yy.max())-old['baselines']['idle'])<=24,(ident,name,'new origin far from original')
                hashes.add(hashlib.sha256(a.tobytes()).hexdigest())
                model['poses'].append({'pose':name,'opaquePixels':len(xx),'footline':int(yy.max()),'paintedWidth':int(np.ptp(xx)+1),'paintedHeight':int(np.ptp(yy)+1)})
            assert len(hashes)==8,(ident,bank,'duplicate alpha poses')
        result['models'].append(model)
    (SRC/'validation.json').write_text(json.dumps(result,indent=2)+'\n');print('PASS: 8 models, 256 original RGBA-exact frames, 128 new hurt/death poses; old origins/scales preserved.')
if __name__=='__main__':validate()
