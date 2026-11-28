"""Mechanical complete-pose crop/scale/registration only. No semantic pixel edits."""
from PIL import Image,ImageDraw
from pathlib import Path
import json,hashlib
ROOT=Path(__file__).resolve().parents[3]
SRC=Path(__file__).resolve().parent
OUT=ROOT/'assets/actors/task10-desert-expansion5b'
defs=json.loads((SRC/'definitions.json').read_text())
banks=['idle','run-a','run-b','attack','hurt','death'];dirs=['n','ne','e','se','s','sw','w','nw']
entries={};manifest=[]
for d in defs:
 id=d['id']; path=SRC/(id+'-reflow.png') if (SRC/(id+'-reflow.png')).exists() else SRC/(id+'-death-repair.png') if (SRC/(id+'-death-repair.png')).exists() else SRC/(id+'-clean.png') if (SRC/(id+'-clean.png')).exists() else SRC/(id+'-source.png'); im=Image.open(path).convert('RGBA'); w,h=im.size
 cells=[]
 # Locate true inter-pose blank corridors from projection statistics. This
 # changes crop coordinates only; source pixels and alpha remain untouched.
 alpha=im.getchannel('A')
 def blankest(axis,lo,hi,region):
  scores=[]
  for v in range(lo,hi+1):
   strip=alpha.crop((region[0],v,region[2],v+1) if axis=='y' else (v,region[1],v+1,region[3]))
   hist=strip.histogram();scores.append((sum(hist[32:]),sum(i*n for i,n in enumerate(hist)),abs(v-(lo+hi)//2),v))
  return min(scores)[3]
 ys=[0]+[blankest('y',round(k*h/6)-35,round(k*h/6)+35,(0,0,w,h)) for k in range(1,6)]+[h]
 for row in range(6):
  xs=[0]+[blankest('x',round(k*w/8)-40,round(k*w/8)+40,(0,ys[row],w,ys[row+1])) for k in range(1,8)]+[w]
  for col in range(8):
   box=(xs[col],ys[row],xs[col+1],ys[row+1]);tile=im.crop(box);bbox=tile.getbbox()
   if not bbox:raise ValueError((id,row,col,'empty'))
   cells.append((tile,box,bbox))
 factor=min(104/max(t.width for t,_,_ in cells),104/max(t.height for t,_,_ in cells),1)
 atlas=Image.new('RGBA',(1024,1152));frames={};feet={};measure=[]
 qa=Image.new('RGB',(1024,768),'#c8b483');qdraw=ImageDraw.Draw(qa)
 darkqa=Image.new('RGB',(1024,768),'#171b29');ddraw=ImageDraw.Draw(darkqa)
 for i,(tile,box,bbox) in enumerate(cells):
  row,col=divmod(i,8);name=banks[row]+'/'+dirs[col]
  tile=tile.resize((max(1,round(tile.width*factor)),max(1,round(tile.height*factor))),Image.Resampling.LANCZOS)
  px=col*128+(128-tile.width)//2;py=row*192+174-tile.height
  atlas.alpha_composite(tile,(px,py));frames[name]={'frame':{'x':col*128,'y':row*192,'w':128,'h':192}}
  metricAlpha=tile.getchannel('A').point(lambda a:255 if a>128 else 0);b=metricAlpha.getbbox();feet[name]=py-row*192+b[3]-1
  measure.append({'frame':name,'sourceCell':box,'sourcePoseBounds':bbox,'paintedWidth':b[2]-b[0],'paintedHeight':b[3]-b[1],'footline':feet[name]})
  qa.paste(atlas.crop((col*128,row*192+64,(col+1)*128,row*192+192)),(col*128,row*128),atlas.crop((col*128,row*192+64,(col+1)*128,row*192+192)).getchannel('A'))
  darkqa.paste(atlas.crop((col*128,row*192+64,(col+1)*128,row*192+192)),(col*128,row*128),atlas.crop((col*128,row*192+64,(col+1)*128,row*192+192)).getchannel('A'))
  qdraw.text((col*128+3,row*128+3),name,fill='#241c33');ddraw.text((col*128+3,row*128+3),name,fill='#e4e4ed')
 atlas.save(OUT/(id+'.png'),optimize=True);qa.save(SRC/(id+'-composited-qa.jpg'),quality=92);darkqa.save(SRC/(id+'-dark-qa.jpg'),quality=94)
 (OUT/(id+'.json')).write_text(json.dumps({'frames':frames,'meta':{'image':id+'.png','size':{'w':1024,'h':1152},'source':str(path.relative_to(ROOT)),'sourceSize':{'w':w,'h':h}}},indent=2)+'\n')
 native=max(m['paintedHeight'] for m in measure[:8]);scale=d['targetIdleHeight']/native
 entries[id]={'key':'task10-monster-'+d['slug'],'url':str((OUT/(id+'.png')).relative_to(ROOT)),'atlasURL':str((OUT/(id+'.json')).relative_to(ROOT)),'scale':scale,'annotationHeight':88,'frameHeight':192,'frameWidth':128,'poseBanks':banks,'drawnDeath':True,'footlines':feet}
 manifest.append({**d,'source':str(path.relative_to(ROOT)),'nativeIdleHeight':native,'scale':scale,'renderedIdleHeight':native*scale,'mechanicalScale':factor,'poses':measure,'sourceSHA256':hashlib.sha256(path.read_bytes()).hexdigest()})
(ROOT/'js/assets/desertExpansion5bArt.js').write_text('// Original art only; runtime integration belongs to the parent task.\nexport const DESERT_EXPANSION5B_ART=Object.freeze('+json.dumps(entries,indent=2)+');\nexport const desertExpansion5bArt=id=>DESERT_EXPANSION5B_ART[id]||null;\n')
(SRC/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Packed',len(entries),'models',len(entries)*48,'poses')
