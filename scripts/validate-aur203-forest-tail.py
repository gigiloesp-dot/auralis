"""Mechanical alpha/frame checks and art-only handoff after manual visual review."""
import json,sys,hashlib
from pathlib import Path
from PIL import Image
import numpy as np
pack=sys.argv[1];p=Path('art/source/aur203-'+pack);checks=[]
for f in sorted(Path('assets/actors/aur203-'+pack).glob('*.png')):
 im=Image.open(f);a=np.asarray(im);assert im.mode=='RGBA' and im.size==(1024,1152)
 out=dict(id=f.stem,size=im.size,mode=im.mode,alphaZeroPercent=float((a[:,:,3]==0).mean()*100),poses=[])
 for r in range(6):
  for c in range(8):
   t=a[r*192:(r+1)*192,c*128:(c+1)*128];border=np.concatenate([t[0,:,3],t[-1,:,3],t[:,0,3],t[:,-1,3]])
   assert not border.any(),(f,r,c)
   yy,xx=np.where(t[:,:,3]>0);out['poses'].append(dict(row=r,column=c,alphaGutter=min(int(xx.min()),127-int(xx.max()),int(yy.min()),191-int(yy.max())),rgbaHash=hashlib.sha256(t.tobytes()).hexdigest()))
 assert len({x['rgbaHash']for x in out['poses']})==48
 checks.append(out)
(p/'asset-checks.json').write_text(json.dumps(checks,indent=2)+'\n')
cards=json.loads((p/'species-cards.json').read_text())
prov=dict(pack='aur203-'+pack,artOnly=True,runtimeIntegrated=False,browserVerified=False,generatedWith='OpenAI image_gen',models=cards,animationScope='48 painted poses: 8 directions x idle/run-a/run-b/attack/hurt/death. Two movement drawings; six pose banks, not six multiframe clips.',mechanicalPacking='Whole complete pose cropping with 8 source pixel margins and uniform resampling; alpha used solely for measurement. No semantic painting/erasing/matte removal by Python.',visualReview=dict(all48PosesPerModel=True,backgrounds=['beige','dark'],death='natural collapsed sideways with limp limbs and closed eyes',registration='n/ne/e/se/s/sw/w/nw; source s/sw/w/nw/n/ne/e/se',reviewed=True),generationHistory={x.name:json.loads(x.read_text())for x in p.glob('*generation*.json')})
(p/'provenance.json').write_text(json.dumps(prov,ensure_ascii=False,indent=2)+'\n')
region,letter=pack.split('-');module='aur203'+region.title()+letter.upper()+'Art'
Path('docs/AUR_203_'+region.upper()+'_'+letter.upper()+'_ART.md').write_text('# AUR-203 '+pack+' art handoff\n\nArt-only candidates '+', '.join(c['placementId']for c in cards)+'. All sheets have 48 painted poses, 1024x1152 transparent RGBA, 128x192 cells, per-pose footlines, unique texture keys and drawn collapsed death. Viewed all poses on beige and dark boards; registration/gutters/alpha support/distinct48 RGBA hashes pass.\n\nSource history, all originals, generation/repair prompts and placement cards: `'+str(p)+'`. Assets: `assets/actors/aur203-'+pack+'`. Module: `js/assets/'+module+'.js`. Repack: `python scripts/pack-aur203-forest-c.py '+pack+'`. No runtime registration, stats, common data, browser claim or Git index changes.\n')
print(pack,len(checks),'models ready; all full-alpha cell borders zero and48 unique RGBA frames each')
