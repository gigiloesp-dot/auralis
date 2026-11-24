"""Register whole source poses inside visually reviewed empty corridors."""
from pathlib import Path
from PIL import Image
import json,numpy as np
root=Path('art/source/task10-legacy-upgrade-a');m=json.loads((root/'manifest.json').read_text());dirs=m['directionOrder']
# Explicit blank corridor boundaries, not alpha erasure.
EDGES={'forestOrc':[0,278,540,791,1073,1350,1630,1897,2172],'bear':[0,283,555,780,1062,1347,1626,1881,2172]}
for model in m['models']:
 p=root/(model['assetName']+'-hurt-death-reflow.png')
 if model['assetName']in ['forestWolf','forestRaider','wildBoar']and not p.exists():continue
 p=p if p.exists()else root/(model['assetName']+'-hurt-death-original.png')
 if not p.exists():continue
 im=Image.open(p);a=np.array(im)[:,:,3];rs={};xs=EDGES.get(model['assetName'],[round(c*im.width/8)for c in range(9)])
 for row,bank in enumerate(['hurt','death']):
  for col,d in enumerate(dirs):
   x0,x1=xs[col:col+2];y0=round(row*im.height/2);y1=round((row+1)*im.height/2);yy,xx=np.where(a[y0:y1,x0:x1]>128)
   assert xx.min()>1 and xx.max()<x1-x0-2,(p,d,'boundary needs manual corridor')
   # Alpha>128 is measured for registration only; full RGBA source pixels in the rectangle remain unchanged.
   rectleft=x0;rectright=x1
   if model['assetName']=='forestRaider':rectleft=max(x0,x0+int(xx.min())-12);rectright=min(x1,x0+int(xx.max())+13)
   rs[bank+'/'+d]={'x':rectleft,'y':max(y0,int(yy.min())+y0-12),'right':rectright,'bottom':min(y1,int(yy.max())+y0+13)}
 model['sourceRects']=rs
(root/'manifest.json').write_text(json.dumps(m,indent=2)+'\n')
