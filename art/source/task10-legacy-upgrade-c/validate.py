from PIL import Image
from pathlib import Path
import json,hashlib
SRC=Path(__file__).resolve().parent;ROOT=SRC.parents[2];OUT=ROOT/'assets/actors/task10-legacy-upgrade-c'
module=(ROOT/'js/assets/legacyUpgradeCArt.js').read_text();entries=json.loads(module.split('Object.freeze(',1)[1].split(');',1)[0]);report=[]
for d in json.loads((SRC/'manifest.json').read_text()):
 id=d['id'];old=d['originalEntry'];entry=entries[id];im=Image.open(OUT/(id+'.png'));original=Image.open(ROOT/old['url']).convert('RGBA')
 assert im.mode=='RGBA' and im.size==(1536,1536)
 assert hashlib.sha256((ROOT/old['url']).read_bytes()).hexdigest()==d['originalPNGSHA256'],'Original file modified'
 assert im.crop((0,0,1536,1024)).tobytes()==original.tobytes(),id+' top32 RGBA changed'
 originalAtlas=json.loads((ROOT/old['atlasURL']).read_text());atlas=json.loads((OUT/(id+'.json')).read_text());assert len(atlas['frames'])==48
 for name,f in originalAtlas['frames'].items():
  assert atlas['frames'][name]==f,(id,name,'old atlas metadata changed')
  expected=old.get('footlines',{}).get(name,old['baselines'][name.split('/')[0]])
  actual=entry.get('footlines',{}).get(name,entry['baselines'][name.split('/')[0]])
  assert actual==expected,(id,name,'old origin changed')
 for field in ['scale','annotationHeight','baselines']:assert entry[field]==old[field],(id,field,'old metadata changed')
 expected={b+'/'+v for b in ['idle','run-a','run-b','attack','hurt','death'] for v in ['e','se','s','sw','w','nw','n','ne']};assert set(atlas['frames'])==expected
 assert set(entry['footlines'])==set(old.get('footlines',{}))|{b+'/'+v for b in ['hurt','death'] for v in ['e','se','s','sw','w','nw','n','ne']}
 hashes=set();new=[]
 for bank in ['hurt','death']:
  for direction in ['e','se','s','sw','w','nw','n','ne']:
   name=bank+'/'+direction;f=atlas['frames'][name]['frame'];assert f['w']==192 and f['h']==256
   tile=im.crop((f['x'],f['y'],f['x']+192,f['y']+256));bounds=tile.getbbox();assert bounds and bounds[0]>=8 and bounds[1]>=24 and bounds[2]<=184 and bounds[3]<=232,(id,name,'gutters',bounds)
   solid=tile.getchannel('A').point(lambda a:255 if a>128 else 0).getbbox();assert solid
   assert entry['footlines'][name]==solid[3]-1,(id,name,'new footline mismatch')
   zero=tile.getchannel('A').histogram()[0]/(192*256);assert zero>.6,(id,name,'transparency')
   digest=hashlib.sha256(tile.tobytes()).hexdigest();assert digest not in hashes,(id,name,'duplicate');hashes.add(digest)
   new.append({'frame':name,'fullyTransparentFraction':zero,'footline':entry['footlines'][name],'nativeHeight':solid[3]-solid[1]})
 report.append({'id':id,'original32RGBAExact':True,'original32AtlasMetadataExact':True,'originalOriginsExact':True,'originalScaleExact':True,'frames':48,'newFrames':16,'newUniqueFrames':16,'guttersPass':True,'newFramesMetrics':new})
(SRC/'validation.json').write_text(json.dumps({'runtimeVerified':False,'originalFramesPreserved':224,'newFramesValidated':112,'models':report},indent=2)+'\n');print('PASS:7models;224oldRGBAframes+origins exact;112newunique16pose frames;48atlasentries/model;newgutters/transparency/footlines valid')
