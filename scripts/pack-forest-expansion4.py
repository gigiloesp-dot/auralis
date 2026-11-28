"""Mechanical complete-cell registration; never masks or synthesizes source pixels."""
import json,sys
from pathlib import Path
from PIL import Image
pack=sys.argv[1];root=Path('art/source/task10-forest-expansion'+pack);out=Path('assets/actors/task10-forest-expansion'+pack);out.mkdir(parents=True,exist_ok=True)
manifest=json.loads((root/'manifest.json').read_text());entries={};dirs=['n','ne','e','se','s','sw','w','nw'];banks=['idle','run-a','run-b','attack','hurt','death']
for m in manifest['models']:
 id=m['id'];source=next((root/(id+'-'+s+'.png') for s in ['reflow','cutout','original'] if (root/(id+'-'+s+'.png')).exists()));im=Image.open(source).convert('RGBA');canvas=Image.new('RGBA',(1024,1152));frames={};feet={};idle=[]
 registrations={
 'forest-species-045':([0,175,345,557,735,880,1065,1280,1448],[0,190,370,545,730,925,1086]),
 'forest-species-051':([0,181,362,543,724,905,1073,1267,1448],[0,195,380,550,735,930,1086]),
 'forest-species-053':(None,[0,197,375,545,725,915,1086]),
 'forest-species-056':([0,175,348,550,730,890,1076,1275,1448],[0,198,380,555,735,925,1086]),
 'forest-species-059':([0,200,373,545,716,912,1076,1255,1448],[0,202,390,550,725,915,1086]),
 'forest-species-054':([0,202,377,543,724,908,1085,1250,1448],None),
 'forest-species-052':([0,175,342,543,727,890,1080,1278,1448],[0,195,388,560,730,925,1086]),
 'forest-species-050':(None,[0,205,388,550,733,925,1086]),
 'forest-species-046':(None,[0,181,380,543,724,905,1086]),
 'forest-species-060':([0,180,353,568,737,888,1048,1265,1448],[0,204,398,575,742,936,1086])}
 xs,ys=registrations.get(id,(None,None));xs=xs or [round(c*im.width/8) for c in range(9)];ys=ys or [round(r*im.height/6) for r in range(7)]
 idle_source_heights=[]
 for c in range(8):
  a=im.getchannel('A').crop((xs[c],ys[0],xs[c+1],ys[1]));bb=a.point(lambda v:255 if v>128 else 0).getbbox();idle_source_heights.append(bb[3]-bb[1])
 fit=min(100/max(b-a for a,b in zip(xs,xs[1:])),100/max(b-a for a,b in zip(ys,ys[1:])),m['nativeIdleHeight']/max(idle_source_heights))
 # All rectangles have been visually registered in blank source corridors.
 for row,bank in enumerate(banks):
  for col,d in enumerate(dirs):
   edges=xs.copy()
   if id=='forest-species-060' and row==5:edges[7]=1244
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
 native=max(idle);scale=max(1,m['nativeIdleHeight']/native);entries[id]={'key':'task10-monster-'+m['names']['en'].lower().replace(' ','-'),'url':url,'atlasURL':atlas,'scale':scale,'annotationHeight':round(native*scale+12),'frameHeight':192,'frameWidth':128,'poseBanks':banks,'drawnDeath':True,'nativeIdleHeight':native,'footlines':feet}
 print(id,'48 complete cells; native idle',native,'scale',round(scale,3))
name='forestExpansion'+pack+'Art';export='FOREST_EXPANSION'+pack.upper()+'_ART';Path('js/assets/'+name+'.js').write_text('// Original painted art candidates; runtime integration is separate.\nexport const '+export+'=Object.freeze('+json.dumps(entries,indent=2)+');\nexport const '+name+'=id=>'+export+'[id]||null;\n')
