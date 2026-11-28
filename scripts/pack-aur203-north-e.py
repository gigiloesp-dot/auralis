"""Register whole generated poses. No erasing, threshold cutouts or anatomy edits.

Opaque support locates blank separators; complete crops include eight-source-pixel
margins and are uniformly resampled. Source images and rejected attempts survive.
"""
import json
import hashlib
from pathlib import Path
import numpy as np
from PIL import Image

SOURCE=Path('art/source/aur203-north-e')
TARGET=Path('assets/actors/aur203-north-e');TARGET.mkdir(parents=True,exist_ok=True)
BANKS=['idle','run-a','run-b','attack','hurt','death']
DIRECTIONS=['e','se','s','sw','w','nw','n','ne']
SOURCE_COLUMNS=list(range(8)) # Generated E SE S SW W NW N NE.
CARDS=json.loads((SOURCE/'species-cards.json').read_text())
DEFINITIONS=[(c['id'][-3:],c['names']['en'].lower().replace(' ','-'),80,82) for c in CARDS]

def corridor(scores,nominal,radius=50):
 lo,hi=max(0,nominal-radius),min(len(scores),nominal+radius+1)
 candidates=np.where(scores[lo:hi]==0)[0]+lo
 if not len(candidates):raise ValueError(f'No blank corridor around{nominal}; imagegen repair required')
 return int(min(candidates,key=lambda x:abs(x-nominal)))

entries={};validation=[]
for suffix,slug,native_height,world_height in DEFINITIONS:
 species='north-species-'+suffix
 source=SOURCE/(species+'-finalclean.png')
 if not source.exists():source=SOURCE/(species+'-reflow.png')
 if not source.exists():source=SOURCE/(species+'-cutout.png')
 if not source.exists():source=SOURCE/(species+'-original.png')
 im=Image.open(source).convert('RGBA');alpha=np.asarray(im)[:,:,3];solid=alpha>128;w,h=im.size
 rows=[0]+[corridor(solid.sum(axis=1),round(i*h/6))for i in range(1,6)]+[h]
 poses=[]
 for r in range(6):
  region=solid[rows[r]:rows[r+1]]
  columns=[0]+[corridor(region.sum(axis=0),round(i*w/8))for i in range(1,8)]+[w]
  for c,sc in enumerate(SOURCE_COLUMNS):
   yy,xx=np.where(region[:,columns[sc]:columns[sc+1]])
   assert len(xx)>200,(species,r,c)
   left,top=int(xx.min()+columns[sc]),int(yy.min()+rows[r]);right,bottom=int(xx.max()+columns[sc]+1),int(yy.max()+rows[r]+1)
   rect=(max(columns[sc],left-8),max(rows[r],top-8),min(columns[sc+1],right+8),min(rows[r+1],bottom+8))
   poses.append(dict(row=r,column=c,sourceColumn=sc,rect=rect,paintedHeight=bottom-top))
 factor=min(native_height/max(p['paintedHeight']for p in poses[:8]),96/max(p['rect'][2]-p['rect'][0]for p in poses),112/max(p['rect'][3]-p['rect'][1]for p in poses))
 canvas=Image.new('RGBA',(1024,1152));frames={};footlines={};source_rects={};bounds={};idle=[]
 for pose in poses:
  r,c,rect=pose['row'],pose['column'],pose['rect'];tile=im.crop(rect);size=(round(tile.width*factor),round(tile.height*factor));tile=tile.resize(size,Image.Resampling.LANCZOS)
  canvas.alpha_composite(tile,(c*128+(128-size[0])//2,r*192+173-size[1]));name=BANKS[r]+'/'+DIRECTIONS[c]
  frames[name]={'frame':{'x':c*128,'y':r*192,'w':128,'h':192}}
  source_rects[name]={'x':rect[0],'y':rect[1],'w':rect[2]-rect[0],'h':rect[3]-rect[1],'sourceColumn':pose['sourceColumn']}
  support=np.asarray(canvas)[r*192:(r+1)*192,c*128:(c+1)*128,3]>128;yy,xx=np.where(support)
  assert len(xx)>200,(species,name)
  assert xx.min()>=10 and xx.max()<118 and yy.min()>10 and yy.max()<182,(species,name,'clipped')
  footlines[name]=int(yy.max());bounds[name]={'x':int(xx.min()),'y':int(yy.min()),'w':int(xx.max()-xx.min()+1),'h':int(yy.max()-yy.min()+1),'opaquePixels':int(len(xx))}
  if not r:idle.append(bounds[name]['h'])
 output=TARGET/(species+'.png');atlas=TARGET/(species+'.json');temp=TARGET/(species+'.tmp.png');canvas.save(temp,optimize=True);temp.replace(output)
 atlas.write_text(json.dumps({'frames':frames,'meta':{'image':species+'.png','size':{'w':1024,'h':1152},'source':str(source),'sourceSize':{'w':w,'h':h},'sourceRects':source_rects,'uniformRegistrationScale':factor,'alphaEditing':False,'sourceDirectionOrder':DIRECTIONS}},indent=2)+'\n')
 canvas.save(SOURCE/(species+'-registered.png'),optimize=True)
 for n,color in [('beige','#c9b78e'),('dark','#273632')]:
  qa=Image.new('RGBA',(1024,768),color)
  for r in range(6):
   for c in range(8):qa.alpha_composite(canvas.crop((c*128,r*192+64,(c+1)*128,r*192+192)),(c*128,r*128))
  qa.convert('RGB').save(SOURCE/(species+'-'+n+'-qa.jpg'),quality=95,subsampling=0)
 entries[species]={'key':'aur203-monster-'+slug,'url':str(output),'atlasURL':str(atlas),'scale':world_height/max(idle),'annotationHeight':world_height+12,'frameWidth':128,'frameHeight':192,'poseBanks':BANKS,'drawnDeath':True,'footlines':footlines}
 a=np.asarray(canvas)[:,:,3]
 hashes=[hashlib.sha256(canvas.crop((c*128,r*192,(c+1)*128,(r+1)*192)).tobytes()).hexdigest() for r in range(6) for c in range(8)]
 assert len(set(hashes))==48,(species,'duplicate full RGBA poses')
 idle_median=float(np.median([bounds['idle/'+d]['h']for d in DIRECTIONS]));death_median=float(np.median([bounds['death/'+d]['h']for d in DIRECTIONS]))
 assert death_median<idle_median,(species,'death not lower than idle')
 validation.append({'id':species,'source':str(source),'frames':48,'uniqueFrameSHA256Count':len(set(hashes)),'frameSHA256':hashes,'idleMedianHeight':idle_median,'deathMedianHeight':death_median,'dimensions':[1024,1152],'sourcePixelsUnedited':True,'alphaZeroPercent':float((a==0).mean()*100),'sourceRegistrationScale':factor,'nativeIdleHeights':idle,'bounds':bounds})
 print(species,'48poses',im.size,'nativeidle',idle,'alpha0',round((a==0).mean()*100,1))
Path('js/assets/aur203NorthEArt.js').write_text('// AUR-203 original art-only candidates; not runtime registration.\nexport const AUR203_NORTH_E_ART=Object.freeze('+json.dumps(entries,indent=2)+');\nexport const aur203NorthEArt=id=>AUR203_NORTH_E_ART[id]||null;\n')
(SOURCE/'validation.json').write_text(json.dumps({'artOnly':True,'runtimeIntegrated':False,'browserVerified':False,'models':validation},indent=2)+'\n')
