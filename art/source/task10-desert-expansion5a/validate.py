from PIL import Image
from pathlib import Path
import hashlib,json
src=Path(__file__).resolve().parent;root=src.parents[2];out=root/'assets/actors/task10-desert-expansion5a'
report=[]
for d in json.loads((src/'manifest.json').read_text()):
 id=d['id'];im=Image.open(out/(id+'.png'));assert im.mode=='RGBA' and im.size==(1024,1152)
 alpha=im.getchannel('A');zero=alpha.histogram()[0]/(1024*1152);assert zero>.6
 frames=json.loads((out/(id+'.json')).read_text())['frames'];assert len(frames)==48
 hashes=set()
 for name,entry in frames.items():
  f=entry['frame'];tile=im.crop((f['x'],f['y'],f['x']+128,f['y']+192));b=tile.getbbox();assert b and b[0]>=12 and b[1]>=70 and b[2]<=116 and b[3]<=174,(id,name,b)
  digest=hashlib.sha256(tile.tobytes()).hexdigest();assert digest not in hashes,(id,name,'duplicated pose');hashes.add(digest)
 assert d['renderedIdleHeight']==76
 report.append({'id':id,'frames':48,'uniqueFrames':48,'fullyTransparentFraction':zero,'nativeIdleHeight':d['nativeIdleHeight'],'scale':d['scale'],'renderedIdleHeight':d['renderedIdleHeight'],'guttersPass':True,'RGBA':True})
(src/'validation.json').write_text(json.dumps({'runtimeVerified':False,'models':report,'totalFrames':len(report)*48},indent=2)+'\n')
print(json.dumps(report,indent=2))
