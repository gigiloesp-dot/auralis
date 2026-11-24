"""Strict legacy atlas preservation plus append-only animation validation."""
from pathlib import Path
from PIL import Image
import numpy as np,json,hashlib
root=Path('art/source/task10-legacy-upgrade-a');manifest=json.loads((root/'manifest.json').read_text());text=Path('js/assets/legacyUpgradeAArt.js').read_text();entries=json.loads(text.split('Object.freeze(',1)[1].split(');',1)[0]);assert len(entries)==8
report={'status':'PASS','runtimeRegistered':False,'models':[]}
for m in manifest['models']:
 id=m['id'];name=m['assetName'];e=entries[id];im=Image.open(e['url']);assert im.mode=='RGBA'and im.size==(1536,1536);orig=Image.open(m['originalURL']);assert im.crop((0,0,1536,1024)).tobytes()==orig.tobytes(),name+' original32RGBA changed';assert orig.tobytes()==Image.open(root/(name+'-preserved-original.png')).tobytes()
 atlas=json.loads(Path(e['atlasURL']).read_text());old=json.loads(Path(m['originalAtlasURL']).read_text());assert len(atlas['frames'])==48;assert len(old['frames'])==32
 for k,v in old['frames'].items():assert atlas['frames'][k]==v,name+'/'+k+' original atlas changed'
 assert e['scale']==m['originalArt']['scale'];assert e.get('annotationHeight')==m['originalArt'].get('annotationHeight')
 for k,v in m['originalArt'].get('baselines',{}).items():assert e['baselines'][k]==v
 assert e['frameWidth']==192 and e['frameHeight']==256 and e['drawnDeath']is True;assert e['poseBanks']==['idle','run-a','run-b','attack','hurt','death'];a=np.array(im);hashes=set();newfeet=[];minpixels=10**9
 for k,v in atlas['frames'].items():
  f=v['frame'];x,y,w,h=[f[n]for n in ['x','y','w','h']];assert(w,h)==(192,256);cell=a[y:y+h,x:x+w];hashes.add(hashlib.sha256(cell.tobytes()).hexdigest())
  if k.split('/')[0]not in ['hurt','death']:continue
  alpha=cell[:,:,3];assert np.all(alpha[:24]==0)and np.all(alpha[232:]==0)and np.all(alpha[:,:8]==0)and np.all(alpha[:,184:]==0),name+'/'+k+' new gutter';yy,xx=np.where(alpha>128);assert len(yy)>200;foot=int(yy.max());assert e['footlines'][k]==foot;assert 218<=foot<=230,(name,k,foot);minpixels=min(minpixels,len(yy));newfeet.append(foot)
 assert len(hashes)==48,name+' duplicate fullRGBA frames';assert len(e['footlines'])==16
 report['models'].append(dict(id=id,assetName=name,image=e['url'],atlas=e['atlasURL'],width=1536,height=1536,preservedOriginalFrames=32,appendedFrames=16,totalDistinctFrames=48,oldRGBAExact=True,oldAtlasEntriesExact=True,originalScale=e['scale'],minimumNewOpaquePixels=minpixels,newFootlineRange=[min(newfeet),max(newfeet)],rgbaBytes=1536*1536*4,sha256=hashlib.sha256(Path(e['url']).read_bytes()).hexdigest(),originalPixelSHA256=hashlib.sha256(orig.tobytes()).hexdigest()))
(root/'validation.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
