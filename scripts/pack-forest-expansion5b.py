"""Mechanical complete-cell registration; never masks or synthesizes source pixels."""
import json,sys
from pathlib import Path
from PIL import Image
pack=sys.argv[1];root=Path('art/source/task10-forest-expansion'+pack);out=Path('assets/actors/task10-forest-expansion'+pack);out.mkdir(parents=True,exist_ok=True)
manifest=json.loads((root/'manifest.json').read_text());entries={};dirs=['n','ne','e','se','s','sw','w','nw'];banks=['idle','run-a','run-b','attack','hurt','death']
for m in manifest['models']:
 id=m['id'];source=next((root/(id+'-'+s+'.png') for s in ['reflow','cutout','original'] if (root/(id+'-'+s+'.png')).exists()));im=Image.open(source).convert('RGBA');canvas=Image.new('RGBA',(1024,1152));frames={};feet={};idle=[]
 registrations={'forest-species-073':([48,234,414,583,756,947,1123,1302,1480],[32,209,382,532,693,861,992]),'forest-species-070':([0,201,368,541,719,903,1080,1253,1448],[0,191,373,551,728,925,1086]),'forest-species-075':([0,202,372,552,725,892,1065,1244,1448],[0,208,381,545,721,912,1086]),'forest-species-071':([0,181,360,558,737,890,1064,1263,1448],None)}
 xs,ys=registrations.get(id,(None,None));xs=xs or [round(c*im.width/8) for c in range(9)];ys=ys or [round(r*im.height/6) for r in range(7)]
 idle_source_heights=[]
 for c in range(8):
  a=im.getchannel('A').crop((xs[c],ys[0],xs[c+1],ys[1]));bb=a.point(lambda v:255 if v>128 else 0).getbbox();idle_source_heights.append(bb[3]-bb[1])
 fit=min(100/max(b-a for a,b in zip(xs,xs[1:])),100/max(b-a for a,b in zip(ys,ys[1:])),m['nativeIdleHeight']/max(idle_source_heights))
 # All rectangles have been visually registered in blank source corridors.
 for row,bank in enumerate(banks):
  for col,d in enumerate(dirs):
   edges=xs.copy()
   x0=edges[col];x1=edges[col+1];y0=ys[row];y1=ys[row+1]
   cell=im.crop((x0,y0,x1,y1));size=(round(cell.width*fit),round(cell.height*fit));cell=cell.resize(size,Image.Resampling.LANCZOS);dx=col*128+(128-size[0])//2;dy=row*192+73
   canvas.paste(cell,(dx,dy));name=bank+'/'+d;frames[name]={'frame':{'x':col*128,'y':row*192,'w':128,'h':192},'sourceRect':{'x':x0,'y':y0,'w':x1-x0,'h':y1-y0}}
   a=canvas.getchannel('A').crop((col*128,row*192,(col+1)*128,(row+1)*192));bb=a.point(lambda v:255 if v>128 else 0).getbbox()
   if bb is None:raise ValueError(id+name+' empty')
   feet[name]=bb[3]-1
   if row==0:idle.append(bb[3]-bb[1])
 url=str(out/(id+'.png'));atlas=str(out/(id+'.json'));canvas.save(url);Path(atlas).write_text(json.dumps({'frames':frames,'meta':{'image':id+'.png','size':{'w':1024,'h':1152},'source':str(source),'sourceSize':{'w':im.width,'h':im.height}}},indent=2)+'\n')
 qa=Image.new('RGBA',(1024,768),'#cab582')
 for row in range(6):
  for col in range(8):qa.alpha_composite(canvas.crop((col*128,row*192,(col+1)*128,(row+1)*192)),(col*128,row*128-48))
 qa.convert('RGB').save(root/(id+'-composited-qa.jpg'),quality=94)
 dark=Image.new('RGBA',(1024,768),'#202933')
 for row in range(6):
  for col in range(8):dark.alpha_composite(canvas.crop((col*128,row*192,(col+1)*128,(row+1)*192)),(col*128,row*128-48))
 dark.convert('RGB').save(root/(id+'-dark-qa.jpg'),quality=94)
 native=max(idle);scale=max(1,m['nativeIdleHeight']/native);entries[id]={'key':'task10-monster-'+m['names']['en'].lower().replace(' ','-'),'url':url,'atlasURL':atlas,'scale':scale,'annotationHeight':round(native*scale+12),'frameHeight':192,'frameWidth':128,'poseBanks':banks,'drawnDeath':True,'nativeIdleHeight':native,'footlines':feet}
 print(id,'48 complete cells; native idle',native,'scale',round(scale,3))
name='forestExpansion'+pack+'Art';export='FOREST_EXPANSION'+pack.upper()+'_ART';Path('js/assets/'+name+'.js').write_text('// Original painted art candidates; runtime integration is separate.\nexport const '+export+'=Object.freeze('+json.dumps(entries,indent=2)+');\nexport const '+name+'=id=>'+export+'[id]||null;\n')
