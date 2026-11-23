from PIL import Image
from pathlib import Path
import hashlib,json
src=Path(__file__).resolve().parent;root=src.parents[2];out=root/'assets/actors/task10-desert-expansion5b'
module=(root/'js/assets/desertExpansion5bArt.js').read_text();entries=json.loads(module.split('Object.freeze(',1)[1].split(');',1)[0])
report=[]
for d in json.loads((src/'manifest.json').read_text()):
 id=d['id'];im=Image.open(out/(id+'.png'));assert im.mode=='RGBA' and im.size==(1024,1152)
 alpha=im.getchannel('A');zero=alpha.histogram()[0]/(1024*1152);assert zero>.6
 frames=json.loads((out/(id+'.json')).read_text())['frames'];assert len(frames)==48
 expected={b+'/'+v for b in ['idle','run-a','run-b','attack','hurt','death'] for v in ['n','ne','e','se','s','sw','w','nw']};assert set(frames)==expected
 assert set(entries[id]['footlines'])==expected
 hashes=set();heights={}
 for name,entry in frames.items():
  f=entry['frame'];tile=im.crop((f['x'],f['y'],f['x']+128,f['y']+192));b=tile.getbbox();assert b and b[0]>=12 and b[1]>=70 and b[2]<=116 and b[3]<=174,(id,name,b)
  solid=tile.getchannel('A').point(lambda a:255 if a>128 else 0).getbbox();assert solid
  assert entries[id]['footlines'][name]==solid[3]-1,(id,name,'footline mismatch')
  heights[name]=solid[3]-solid[1]
  digest=hashlib.sha256(tile.tobytes()).hexdigest();assert digest not in hashes,(id,name,'duplicated pose');hashes.add(digest)
 assert d['nativeIdleHeight']==max(v for k,v in heights.items() if k.startswith('idle/'))
 assert abs(d['renderedIdleHeight']-76)<1e-9
 assert abs(d['nativeIdleHeight']*entries[id]['scale']-76)<1e-9
 report.append({'id':id,'frames':48,'uniqueFrames':48,'fullyTransparentFraction':zero,'nativeIdleHeight':d['nativeIdleHeight'],'scale':d['scale'],'renderedIdleHeight':d['renderedIdleHeight'],'guttersPass':True,'RGBA':True})
(src/'validation.json').write_text(json.dumps({'runtimeVerified':False,'models':report,'totalFrames':len(report)*48},indent=2)+'\n')
print(json.dumps(report,indent=2))
