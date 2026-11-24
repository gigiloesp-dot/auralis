"""Append only imagegen hurt/death paintings; preserve all old RGBA bytes."""
from pathlib import Path
from PIL import Image
import json,hashlib,statistics
root=Path('art/source/task10-legacy-upgrade-a');out=Path('assets/actors/task10-legacy-upgrade-a');out.mkdir(parents=True,exist_ok=True);manifest=json.loads((root/'manifest.json').read_text());dirs=manifest['directionOrder'];entries={}
for m in manifest['models']:
 name=m['assetName'];source=root/(name+'-hurt-death-reflow.png');source=source if source.exists()else root/(name+'-hurt-death-original.png')
 if not source.exists():continue
 rects=m.get('sourceRects')
 if not rects:continue
 original=Image.open(m['originalURL']).convert('RGBA');im=Image.open(source).convert('RGBA');canvas=Image.new('RGBA',(1536,1536));canvas.paste(original,(0,0));atlas=json.loads(Path(m['originalAtlasURL']).read_text());frames=atlas['frames'];feet={};bodyH=[]
 for d in dirs:
  b=im.crop(tuple(rects['hurt/'+d][k]for k in ['x','y','right','bottom'])).getchannel('A').point(lambda a:255 if a>128 else 0).getbbox();bodyH.append(b[3]-b[1])
 fit=min(m['newHurtTargetHeight']/statistics.median(bodyH),176/max(r['right']-r['x']for r in rects.values()),200/max(r['bottom']-r['y']for r in rects.values()))
 for row,bank in enumerate(['hurt','death'],4):
  for col,d in enumerate(dirs):
   key=bank+'/'+d;r=rects[key];cell=im.crop((r['x'],r['y'],r['right'],r['bottom']));cell=cell.resize((round(cell.width*fit),round(cell.height*fit)),Image.Resampling.LANCZOS);dx=col*192+(192-cell.width)//2;dy=row*256+231-cell.height;canvas.paste(cell,(dx,dy));frames[key]={'frame':{'x':col*192,'y':row*256,'w':192,'h':256},'rotated':False,'trimmed':False,'spriteSourceSize':{'x':0,'y':0,'w':192,'h':256},'sourceSize':{'w':192,'h':256},'sourceRect':{'x':r['x'],'y':r['y'],'w':r['right']-r['x'],'h':r['bottom']-r['y']}}
   a=canvas.crop((col*192,row*256,(col+1)*192,(row+1)*256)).getchannel('A').point(lambda a:255 if a>128 else 0).getbbox();feet[key]=a[3]-1
 url=str(out/(name+'.png'));atlasURL=str(out/(name+'.json'));canvas.save(url);atlas['meta']={**atlas['meta'],'image':name+'.png','size':{'w':1536,'h':1536},'preservedSource':m['originalURL'],'newPoseSource':str(source),'newPoseSourceSize':{'w':im.width,'h':im.height},'sourceScale':fit};Path(atlasURL).write_text(json.dumps(atlas,indent=2)+'\n')
 e={**m['originalArt'],'key':'task10-legacy-upgrade-a-'+name,'url':url,'atlasURL':atlasURL,'frameWidth':192,'frameHeight':256,'poseBanks':['idle','run-a','run-b','attack','hurt','death'],'drawnDeath':True,'footlines':feet,'baselines':{**m['originalArt'].get('baselines',{}),'hurt':225,'death':225},'preservedOriginalKey':m['originalArt']['key']};entries[m['id']]=e
 # QA only: native scale old idle plus new hurt/death; normalize idle ground for comparison.
 for bg,label in [('#cab582','beige'),('#202933','dark')]:
  qa=Image.new('RGBA',(1536,768),bg)
  for row,bank in enumerate(['idle','hurt','death']):
   for col,d in enumerate(dirs):
    f=frames[bank+'/'+d]['frame'];pose=canvas.crop((f['x'],f['y'],f['x']+192,f['y']+256));box=pose.getchannel('A').point(lambda a:255 if a>128 else 0).getbbox();offset=225-(box[3]-1) if bank=='idle' else 0;qa.alpha_composite(pose,(col*192,row*256+offset))
  qa.convert('RGB').save(root/(name+'-identity-'+label+'-qa.jpg'),quality=95)
 assert canvas.crop((0,0,1536,1024)).tobytes()==original.tobytes()
 print(name,'old32RGBA exact; new16; scale',round(fit,4),'footlines',min(feet.values()),max(feet.values()))
Path('js/assets/legacyUpgradeAArt.js').write_text('// Art-only legacy animation extensions; original32frames preserved exactly.\nexport const LEGACY_UPGRADE_A_ART=Object.freeze('+json.dumps(entries,indent=2)+');\nexport const legacyUpgradeAArt=id=>LEGACY_UPGRADE_A_ART[id]||null;\n')
