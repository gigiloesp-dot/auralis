"""Mechanical complete-pose registration and standard RGBA resampling only.
No alpha thresholding, erasure, recoloring, anatomy construction, or pose synthesis.
Opacity comparisons below measure bounds/footlines; image pixels are never masked.
"""
from PIL import Image, ImageDraw
from pathlib import Path
import json,sys,hashlib,math
import numpy as np
from scipy.ndimage import label,find_objects
root=Path('art/source/task10-final-species')
target=Path('assets/actors/task10-final-species');target.mkdir(parents=True,exist_ok=True)
definitions=json.loads((root/'definitions.json').read_text())
entries={};registrations={};manifest=[]
previous={d['id']:d for d in json.loads((root/'manifest.json').read_text())} if (root/'manifest.json').exists() else {}
banks=['idle','run-a','run-b','attack','hurt','death'];dirs=['n','ne','e','se','s','sw','w','nw']
for d in definitions:
 id,name,target_height,design,ru,en,es,base,biome,locomotion,abilities=d
 p=root/(id+'-reflow2.png');p=p if p.exists() else root/(id+'-reflow.png');p=p if p.exists() else root/(id+'-cutout.png');p=p if p.exists() else root/(id+'-original.png')
 im=Image.open(p).convert('RGBA');a=im.getchannel('A');W,H=im.size
 # Measurements of visible painted anatomy, not a modification of image alpha.
 groups=[[] for _ in range(48)]
 labels,n=label(np.array(a)>32)
 for component,region in enumerate(find_objects(labels)):
  count=np.count_nonzero(labels[region]==component+1)
  if count<12:continue
  l,t,r,b=region[1].start,region[0].start,region[1].stop,region[0].stop
  row=min(5,int((t+b)/2/(H/6)));col=min(7,int((l+r)/2/(W/8)))
  groups[row*8+col].append([l,t,r,b])
 bounds=[]
 for i,g in enumerate(groups):
  if not g:raise ValueError((id,i,'empty source pose'))
  bounds.append([min(b[0] for b in g),min(b[1] for b in g),max(b[2] for b in g),max(b[3] for b in g)])
 rects=[]
 for row in range(6):
  for col in range(8):
   i=row*8+col;l,t,r,b=bounds[i]
   # Place every rectangle edge within the visually blank corridor. Margins
   # retain soft antialiasing and fine extremities beyond the measured contour.
   left=0 if col==0 else math.floor((bounds[i-1][2]+l)/2)
   right=W if col==7 else math.ceil((r+bounds[i+1][0])/2)
   top=0 if row==0 else math.floor((max(q[3] for q in bounds[(row-1)*8:row*8])+min(q[1] for q in bounds[row*8:(row+1)*8]))/2)
   bottom=H if row==5 else math.ceil((max(q[3] for q in bounds[row*8:(row+1)*8])+min(q[1] for q in bounds[(row+1)*8:(row+2)*8]))/2)
   x=max(left,l-8);y=max(top,t-8);r2=min(right,r+8);b2=min(bottom,b+8)
   if x>l or y>t or r2<r or b2<b:raise ValueError((id,row,col,'overlapping anatomy requires image repair'))
   rects.append(dict(x=x,y=y,w=r2-x,h=b2-y,anatomyBounds=dict(x=l,y=t,w=r-l,h=b-t)))
 native=70 if locomotion=='biped' else (84 if locomotion in ['heavy','quadruped'] else 78)
 fit=min(100/max(r['w'] for r in rects),104/max(r['h'] for r in rects),native/max(r['anatomyBounds']['h'] for r in rects[:8]))
 sheet=Image.new('RGBA',(1024,1152));frames={};feet={};idle=[]
 for i,r in enumerate(rects):
  row,col=divmod(i,8);frame=banks[row]+'/'+dirs[col]
  cut=im.crop((r['x'],r['y'],r['x']+r['w'],r['y']+r['h']))
  w=max(1,round(r['w']*fit));h=max(1,round(r['h']*fit));cut=cut.resize((w,h),Image.Resampling.LANCZOS)
  x=col*128+(128-w)//2;y=row*192+174-h
  sheet.paste(cut,(x,y))
  cell=sheet.getchannel('A').crop((col*128,row*192,(col+1)*128,(row+1)*192))
  bb=cell.point(lambda v:255 if v>128 else 0).getbbox();feet[frame]=bb[3]-1
  if row==0:idle.append(bb[3]-bb[1])
  frames[frame]={'frame':{'x':col*128,'y':row*192,'w':128,'h':192},'sourceRect':r}
 url=target/(id+'.png');atlas=target/(id+'.json');sheet.save(url,optimize=True)
 atlas.write_text(json.dumps({'frames':frames,'meta':{'image':id+'.png','size':{'w':1024,'h':1152},'source':str(p),'sourceSize':{'w':W,'h':H},'sourceRects':rects}},indent=2)+'\n')
 registrations[id]={'source':str(p),'rects':rects}
 scale=target_height/max(idle)
 entries[id]=dict(key='task10-monster-'+name,url=str(url),atlasURL=str(atlas),scale=scale,annotationHeight=max(46,math.ceil(max(idle)*scale+12)),frameHeight=192,frameWidth=128,poseBanks=banks,drawnDeath=True,footlines=feet)
 # Native 128-pixel cells on both light and dark backgrounds expose real matte,
 # clipping, neighboring fragments and foot placement without RGB-under-alpha.
 for theme,color in [('composited',(202,181,130)),('dark',(32,41,52))]:
  qa=Image.new('RGB',(1024,768),color);draw=ImageDraw.Draw(qa)
  for i in range(48):
   row,col=divmod(i,8);cut=sheet.crop((col*128,row*192,(col+1)*128,(row+1)*192));qa.paste(cut,(col*128,row*128-48),cut)
   draw.text((col*128+3,row*128+2),banks[row]+'/'+dirs[col],fill=(60,50,40) if theme=='composited' else (200,200,200))
  qa.save(root/(id+'-'+theme+'-qa.png'),optimize=True)
 manifest.append(dict(id=id,names=dict(ru=ru,en=en,es=es),baseType=base,biome=biome,movement='hover' if locomotion=='hover' else 'ground',locomotion=locomotion,proposedAbilityPattern=abilities,runtimeRegistered=False,sourceStatusAtSelection='prototypeOnly',design=design,sourceRegistration='measured-complete-pose',visualQA=dict(posesInspected=0,status='PENDING',contactSheet=id+'-composited-qa.png',darkContactSheet=id+'-dark-qa.png')))
 current=manifest[-1];current['source']=str(p);current['sourceSHA256']=hashlib.sha256(p.read_bytes()).hexdigest()
 old=previous.get(id,{})
 if old.get('sourceSHA256')==current['sourceSHA256'] and old.get('visualQA',{}).get('finalAtlasSHA256')==hashlib.sha256(url.read_bytes()).hexdigest():current['visualQA']=old['visualQA']
 print('Packed',id,'native idle',max(idle),'scale',round(scale,3))
(root/'source-rects.json').write_text(json.dumps(registrations,indent=2)+'\n')
(root/'manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')
export='FINAL_SPECIES_ART';fn='finalSpeciesArt'
Path('js/assets/'+fn+'.js').write_text('// Original 48-pose creature models; integration is managed separately.\nexport const '+export+'=Object.freeze('+json.dumps(entries,indent=2)+');\nexport const '+fn+'=id=>'+export+'[id]||null;\n')
