"""Append16 complete painted poses; preserve original32 RGBA pixels and atlas entries exactly."""
from PIL import Image,ImageDraw
from pathlib import Path
import json,hashlib,copy
SRC=Path(__file__).resolve().parent;ROOT=SRC.parents[2];OUT=ROOT/'assets/actors/task10-legacy-upgrade-c'
DIRECTIONS=['e','se','s','sw','w','nw','n','ne'];BANKS=['idle','run-a','run-b','attack','hurt','death']
defs=json.loads((SRC/'definitions.json').read_text());entries={};manifest=[]
for d in defs:
 id=d['id'];name=d['name'];old=d['originalEntry'];originalPath=ROOT/old['url'];original=Image.open(originalPath).convert('RGBA');assert original.size==(1536,1024)
 oldAtlas=json.loads((ROOT/old['atlasURL']).read_text());assert len(oldAtlas['frames'])==32
 source=next(SRC/(id+s) for s in ['-repair.png','-clean.png','-source.png'] if (SRC/(id+s)).exists())
 supplemental=Image.open(source).convert('RGBA');w,h=supplemental.size;alpha=supplemental.getchannel('A');poses=[]
 # Locate inter-pose corridors, then mechanically crop the whole visible pose
 # with8px margin. Thresholds select rectangles/measurements only; image pixels
 # and their alpha values are never masked, erased, recolored or synthesized.
 def blankest(axis,lo,hi,region):
  candidates=[]
  for v in range(lo,hi+1):
   strip=alpha.crop((region[0],v,region[2],v+1) if axis=='y' else (v,region[1],v+1,region[3]));hist=strip.histogram()
   candidates.append((sum(hist[24:]),sum(i*n for i,n in enumerate(hist)),abs(v-(lo+hi)//2),v))
  return min(candidates)[3]
 ys=[0,blankest('y',h//2-int(h*.1),h//2+int(h*.1),(0,0,w,h)),h]
 for row in range(2):
  xs=[0]+[blankest('x',round(k*w/8)-int(w/40),round(k*w/8)+int(w/40),(0,ys[row],w,ys[row+1])) for k in range(1,8)]+[w]
  for col in range(8):
   region=(xs[col],ys[row],xs[col+1],ys[row+1]);tile=supplemental.crop(region)
   selection=tile.getchannel('A').point(lambda a:255 if a>16 else 0).getbbox();assert selection,(id,row,col)
   rect=(max(0,selection[0]-8),max(0,selection[1]-8),min(tile.width,selection[2]+8),min(tile.height,selection[3]+8));pose=tile.crop(rect)
   poses.append((pose,region,rect))
 baseline=old.get('footlines',{}).get('idle/s',old['baselines']['idle']);targetH=min(d['nativeIdleHeight']*.98,baseline-24)
 hurtSolidHeight=max(p.getchannel('A').point(lambda a:255 if a>128 else 0).getbbox()[3]-p.getchannel('A').point(lambda a:255 if a>128 else 0).getbbox()[1] for p,_,_ in poses[:8])
 fit=min(targetH/hurtSolidHeight,176/max(p.width for p,_,_ in poses),208/max(p.height for p,_,_ in poses))
 if name=='arcaneWisp':fit*=.92 # mechanical wholepose registration margin for translucent flame silhouette
 canvas=Image.new('RGBA',(1536,1536));canvas.paste(original,(0,0)) # no mask: exact RGBA copy, including hidden RGB
 atlas=copy.deepcopy(oldAtlas);feet=copy.deepcopy(old.get('footlines',{}));measure=[]
 # Preserve legacy effectiveorigins by leaving all32bankbaselines untouched;
 # add only16newfootlines instead of overriding existing originmetadata.
 for i,(pose,region,rect) in enumerate(poses):
  row,col=divmod(i,8);bank=BANKS[row+4];frame=bank+'/'+DIRECTIONS[col]
  pose=pose.resize((max(1,round(pose.width*fit)),max(1,round(pose.height*fit))),Image.Resampling.LANCZOS)
  solid=pose.getchannel('A').point(lambda a:255 if a>128 else 0).getbbox();assert solid
  # Ground/contact and hover registration follow each original model's idle origin.
  localY=round(baseline)-(solid[3]-1);localX=(192-pose.width)//2
  if localY<24:localY=24
  if localY+pose.height>232:localY=232-pose.height
  assert localX>=8 and localY>=24 and localX+pose.width<=184 and localY+pose.height<=232,(id,frame,pose.size,localX,localY)
  canvas.alpha_composite(pose,(col*192+localX,(row+4)*256+localY));feet[frame]=localY+solid[3]-1
  template=copy.deepcopy(next(iter(oldAtlas['frames'].values())));template['frame']={'x':col*192,'y':(row+4)*256,'w':192,'h':256};atlas['frames'][frame]=template
  measure.append({'frame':frame,'sourceRegion':region,'completePoseCrop':rect,'solidWidth':solid[2]-solid[0],'solidHeight':solid[3]-solid[1],'footline':feet[frame],'registrationXY':[localX,localY]})
 target=OUT/(id+'.png');canvas.save(target,optimize=True);atlas['meta']['image']=target.name;atlas['meta']['size']={'w':1536,'h':1536};atlas['meta']['supplementalSource']=str(source.relative_to(ROOT));(OUT/(id+'.json')).write_text(json.dumps(atlas,indent=2)+'\n')
 entry=copy.deepcopy(old);entry.update({'key':'task10legacy-c-'+name,'url':str(target.relative_to(ROOT)),'atlasURL':str((OUT/(id+'.json')).relative_to(ROOT)),'frameWidth':192,'frameHeight':256,'poseBanks':BANKS,'drawnDeath':True,'footlines':feet});entries[id]=entry
 # Native-size side comparison: original idle + new hurt + new collapsed death.
 for label,color,textcolor in [('beige','#c8b483','#251e2f'),('dark','#171b29','#e7e6ef')]:
  qa=Image.new('RGBA',(1536,768),color);draw=ImageDraw.Draw(qa)
  for row,bank in enumerate(['idle','hurt','death']):
   for col,direction in enumerate(DIRECTIONS):
    f=atlas['frames'][bank+'/'+direction]['frame'];tile=canvas.crop((f['x'],f['y'],f['x']+192,f['y']+256));qa.alpha_composite(tile,(col*192,row*256));draw.text((col*192+4,row*256+4),bank+'/'+direction,fill=textcolor)
  qa.convert('RGB').save(SRC/(id+'-'+label+'-identity-qa.jpg'),quality=94)
 manifest.append({'id':id,'name':name,'originalPNG':old['url'],'originalAtlas':old['atlasURL'],'originalPNGSHA256':hashlib.sha256(originalPath.read_bytes()).hexdigest(),'originalRGBAsha256':hashlib.sha256(original.tobytes()).hexdigest(),'top32ExactCopy':True,'source':str(source.relative_to(ROOT)),'sourceSHA256':hashlib.sha256(source.read_bytes()).hexdigest(),'originalEntry':old,'newEntry':entry,'nativeIdleHeight':d['nativeIdleHeight'],'mechanicalScale':fit,'newPoses':measure})
(ROOT/'js/assets/legacyUpgradeCArt.js').write_text('// Legacy32 RGBA frames preserved exactly; sixteen original semantic animation additions per model.\nexport const LEGACY_UPGRADE_C_ART=Object.freeze('+json.dumps(entries,indent=2)+');\nexport const legacyUpgradeCArt=id=>LEGACY_UPGRADE_C_ART[id]||null;\n')
(SRC/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n');print('Packed7models, original224frames preserved,112newposes')
