"""Validate final atlas pixels and frozen visual-review records without a browser."""
from PIL import Image
from pathlib import Path
import json,sys,re,hashlib
import numpy as np
root=Path('art/source/task10-final-species')
text=Path('js/assets/finalSpeciesArt.js').read_text();entries=json.loads(text.split('Object.freeze(',1)[1].split(');',1)[0])
manifest=json.loads((root/'manifest.json').read_text());reviews={d['id']:d for d in manifest}
assert len(entries)==8
result=dict(status='PASS',runtimeRegistered=False,models=[])
for id,e in entries.items():
 im=Image.open(e['url']);assert im.size==(1024,1152) and im.mode=='RGBA'
 a=np.array(im)[:,:,3];fraction=float(np.count_nonzero(a==0)/a.size);assert fraction>.6,(id,'transparency',fraction)
 atlas=json.loads(Path(e['atlasURL']).read_text());assert len(atlas['frames'])==48
 hashes={d:set() for d in ['n','ne','e','se','s','sw','w','nw']};minimum=999999;idle=[]
 for name,entry in atlas['frames'].items():
  f=entry['frame'];x,y=f['x'],f['y'];assert f['w']==128 and f['h']==192
  cell=a[y:y+192,x:x+128]
  assert not np.any(cell[:70,:]) and not np.any(cell[174:,:]) and not np.any(cell[:,:12]) and not np.any(cell[:,116:]),(id,name,'gutter')
  yy,xx=np.where(cell>128);assert len(yy)>200,(id,name,'empty')
  minimum=min(minimum,len(yy));assert int(yy.max())==e['footlines'][name],(id,name,'footline')
  if name.startswith('idle/'):idle.append(int(yy.max()-yy.min()+1))
  hashes[name.split('/')[1]].add(hashlib.sha256(cell.tobytes()).hexdigest())
  r=entry['sourceRect'];b=r['anatomyBounds'];assert r['x']<=b['x'] and r['y']<=b['y'] and r['x']+r['w']>=b['x']+b['w'] and r['y']+r['h']>=b['y']+b['h'],(id,name,'anatomy crop')
 assert all(len(h)==6 for h in hashes.values()),(id,'duplicate states')
 if reviews[id]['locomotion']=='biped':assert 60<=max(idle)<=75,(id,'human native height')
 qa=reviews[id]['visualQA'];assert qa['status']=='PASS' and qa['posesInspected']==48 and qa['backgrounds']==['beige','dark'],(id,'visual review not frozen')
 digest=hashlib.sha256(Path(e['url']).read_bytes()).hexdigest();assert digest==qa['finalAtlasSHA256'],(id,'atlas changed since visual review')
 result['models'].append(dict(id=id,image=e['url'],atlas=e['atlasURL'],width=1024,height=1152,poses=48,transparentFraction=fraction,minimumOpaquePixelsPerFrame=minimum,nativeIdleHeight=max(idle),sha256=digest,scale=e['scale'],annotationHeight=e['annotationHeight'],visualQA='PASS'))
(root/'validation.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
