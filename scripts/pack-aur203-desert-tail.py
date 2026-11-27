"""Mechanical complete-pose registration only; sources remain immutable."""
import sys,json,hashlib,os
from pathlib import Path
import numpy as np
from PIL import Image

pack=sys.argv[1].lower(); letter=pack[-1]; source=Path('art/source')/pack; target=Path('assets/actors')/pack
target.mkdir(parents=True,exist_ok=True)
cards=json.loads(Path('art/source/aur203-desert-b/species-cards.json').read_text())
cards=cards[(ord(letter)-98)*4:(ord(letter)-97)*4]
selected=sys.argv[2] if len(sys.argv)>2 else None
if selected:cards=[c for c in cards if c['placementId']==selected]
banks=['idle','run-a','run-b','attack','hurt','death']; directions=['e','se','s','sw','w','nw','n','ne']
def corridor(scores,nominal,radius=45):
 lo,hi=max(0,nominal-radius),min(len(scores),nominal+radius+1); candidates=np.where(scores[lo:hi]==0)[0]+lo
 if not len(candidates):raise ValueError(f'No blank corridor at {nominal}; imagegen repair needed')
 return int(min(candidates,key=lambda x:abs(x-nominal)))
entries={};checks=[]
if selected:
 module=Path('js/assets/aur203Desert'+letter.upper()+'Art.js').read_text()
 entries=json.loads(module[module.index('Object.freeze(')+14:module.index(');\n')])
 checks=json.loads((source/'validation.json').read_text())['models']
 checks=[c for c in checks if c['id']!=selected]
for card in cards:
 species=card['placementId'];path=source/(species+'-original.png')
 if (source/(species+'-repair.png')).exists():path=source/(species+'-repair.png')
 if not path.exists():continue
 im=Image.open(path).convert('RGBA'); arr=np.asarray(im); alpha=arr[:,:,3]; solid=alpha>128;w,h=im.size
 assert (alpha<10).mean()>.2,(species,'opaque background needs imagegen repair')
 rows=[0]+[corridor(solid.sum(axis=1),round(i*h/6))for i in range(1,6)]+[h]; poses=[]
 for r in range(6):
  region=solid[rows[r]:rows[r+1]];cols=[0]+[corridor(region.sum(axis=0),round(i*w/8))for i in range(1,8)]+[w]
  for c in range(8):
   yy,xx=np.where(region[:,cols[c]:cols[c+1]]);assert len(xx)>100,(species,r,c)
   left,top=int(xx.min()+cols[c]),int(yy.min()+rows[r]);right,bottom=int(xx.max()+cols[c]+1),int(yy.max()+rows[r]+1)
   rect=(max(cols[c],left-8),max(rows[r],top-8),min(cols[c+1],right+8),min(rows[r+1],bottom+8))
   poses.append((r,c,rect,bottom-top))
 native=86 if card['movementProfile']=='heavy' else 75
 factor=min(native/max(p[3]for p in poses[:8]),104/max(p[2][2]-p[2][0]for p in poses),118/max(p[2][3]-p[2][1]for p in poses))
 canvas=Image.new('RGBA',(1024,1152));frames={};footlines={};bounds={};sourceRects={};hashes=[];idle=[]
 for r,c,rect,height in poses:
  tile=im.crop(rect);size=(max(1,round(tile.width*factor)),max(1,round(tile.height*factor)));tile=tile.resize(size,Image.Resampling.LANCZOS)
  canvas.alpha_composite(tile,(c*128+(128-size[0])//2,r*192+174-size[1]));name=banks[r]+'/'+directions[c]
  frame=canvas.crop((c*128,r*192,(c+1)*128,(r+1)*192));a=np.asarray(frame)[:,:,3];yy,xx=np.where(a>128)
  assert len(xx)>100 and xx.min()>=8 and xx.max()<120 and yy.min()>8 and yy.max()<183,(species,name,'gutter')
  footlines[name]=int(yy.max());bounds[name]=[int(xx.min()),int(yy.min()),int(xx.max()+1),int(yy.max()+1)]
  hashes.append(hashlib.sha256(frame.tobytes()).hexdigest());frames[name]={'frame':{'x':c*128,'y':r*192,'w':128,'h':192}}
  sourceRects[name]=list(rect)
  if not r:idle.append(int(yy.max()-yy.min()+1))
 assert len(set(hashes))==48,(species,'duplicate poses')
 output=target/(species+'.png');tmp=target/(species+'.tmp.png');canvas.save(tmp,optimize=True);os.replace(tmp,output)
 atlas=target/(species+'.json');atlas.write_text(json.dumps({'frames':frames,'meta':{'image':output.name,'size':{'w':1024,'h':1152},'source':str(path),'sourceRects':sourceRects,'uniformRegistrationScale':factor,'alphaEditing':False,'sourceDirectionOrder':directions}},indent=2)+'\n')
 for name,color in [('beige','#c9b78e'),('dark','#273632')]:
  qa=Image.new('RGBA',(1024,768),color)
  for r in range(6):
   for c in range(8):qa.alpha_composite(canvas.crop((c*128,r*192+64,(c+1)*128,(r+1)*192)),(c*128,r*128))
  qa.convert('RGB').save(source/(species+'-'+name+'-qa.jpg'),quality=95,subsampling=0)
 slug=card['name']['en'].lower().replace(' ','-')
 entries[species]={'key':'aur203-monster-'+slug,'url':str(output),'atlasURL':str(atlas),'frameWidth':128,'frameHeight':192,'scale':(94 if card['movementProfile']=='heavy' else 78)/max(idle),'annotationHeight':106 if card['movementProfile']=='heavy' else 90,'poseBanks':banks,'drawnDeath':True,'footlines':footlines}
 checks.append({'id':species,'frameCount':48,'uniqueRGBAHashes':len(set(hashes)),'rgbaHashes':hashes,'bounds':bounds,'footlines':footlines,'alphaZeroPercent':round(float((np.asarray(canvas)[:,:,3]==0).mean()*100),2),'uniformScale':factor,'source':str(path),'sourceUnedited':True})
 print(species,'48 distinct poses alpha zero',checks[-1]['alphaZeroPercent'])
name='aur203Desert'+letter.upper()+'Art';export='AUR203_DESERT_'+letter.upper()+'_ART'
Path('js/assets/'+name+'.js').write_text('// Art-only candidates; runtime integration owned separately.\nexport const '+export+'=Object.freeze('+json.dumps(entries,indent=2)+');\nexport const '+name+'=id=>'+export+'[id]||null;\n')
(source/'validation.json').write_text(json.dumps({'artOnly':True,'runtimeIntegrated':False,'browserVerified':False,'directionOrder':directions,'models':checks},indent=2)+'\n')
