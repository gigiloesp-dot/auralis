"""Append newly painted hurt/death poses; retain legacy RGBA and metadata exactly."""
import json,copy,hashlib
from pathlib import Path
from PIL import Image
import numpy as np
ROOT=Path(__file__).resolve().parent.parent
SRC=ROOT/'art/source/task10-legacy-upgrade-b'
DST=ROOT/'assets/actors/task10-legacy-upgrade-b'
DIRS=['e','se','s','sw','w','nw','n','ne']

def groups(on):
    e=np.diff(np.r_[False,on,False].astype(int))
    return list(zip(np.where(e==1)[0],np.where(e==-1)[0]))

def rectangles(im):
    # Paint measurements locate complete poses. No alpha pixel is modified.
    a=np.array(im.getchannel('A'));rows=groups((a>128).sum(axis=1)>20)
    assert len(rows)==2,rows
    ys=[0,int((rows[0][1]+rows[1][0])/2),im.height];rects={}
    for row in range(2):
        band=a[ys[row]:ys[row+1]];cols=groups((band>128).sum(axis=0)>1)
        assert len(cols)==8,(row,cols)
        xs=[0]+[int((x[1]+y[0])/2)for x,y in zip(cols,cols[1:])]+[im.width]
        for col in range(8):
            region=a[ys[row]:ys[row+1],xs[col]:xs[col+1]]
            py,px=np.where(region>128);bounds=(int(px.min()+xs[col]),int(py.min()+ys[row]),int(px.max()+xs[col]+1),int(py.max()+ys[row]+1))
            for padding in range(12,85,4):
                x0=max(xs[col],bounds[0]-padding);y0=max(ys[row],bounds[1]-padding);x1=min(xs[col+1],bounds[2]+padding);y1=min(ys[row+1],bounds[3]+padding)
                z=a[y0:y1,x0:x1];edge=max(int(v.max())for v in[z[0,:],z[-1,:],z[:,0],z[:,-1]])
                if edge<=8:break
            assert edge<=8,(row,col,'no clear source corridor',edge)
            rects[row,col]=((x0,y0,x1,y1),bounds,edge)
    return rects

def pack():
    defs=json.loads((SRC/'definitions.json').read_text());entries={};report=[]
    for d in defs:
        name=d['name'];ident=d['id'];old=d['originalEntry'];old_im=Image.open(ROOT/old['url']).convert('RGBA')
        assert old_im.size==(1536,1024)
        source=SRC/f'{name}-clean.png'
        if not source.exists():source=SRC/f'{name}-additional-original.png'
        im=Image.open(source).convert('RGBA');rects=rectangles(im)
        atlas=copy.deepcopy(json.loads((ROOT/old['atlasURL']).read_text()));assert len(atlas['frames'])==32
        final=Image.new('RGBA',(1536,1536));final.paste(old_im,(0,0))
        footlines={};poses=[];orig=np.array(old_im.getchannel('A'));old_heights=[]
        for c in range(8):
            yy,xx=np.where(orig[:256,c*192:(c+1)*192]>128);old_heights.append(int(np.ptp(yy)+1))
        hurt_ratios=[]
        for c in range(8):
            rect,b,edge=rects[0,c];hurt_ratios.append(old_heights[c]*.94/(b[3]-b[1]))
        ratio=float(np.median(hurt_ratios))
        for row,bank in enumerate(['hurt','death']):
            for col,direction in enumerate(DIRS):
                pose=f'{bank}/{direction}';rect,b,edge=rects[row,col];crop=im.crop(rect)
                fit=min(ratio,176/crop.width,208/crop.height)
                size=(max(1,round(crop.width*fit)),max(1,round(crop.height*fit)))
                cell=crop.resize(size,Image.Resampling.LANCZOS)
                measured_margin=(rect[3]-b[3])*fit
                full_bottom=min(232,old.get('baselines',{}).get('idle',225)+round(measured_margin))
                x=col*192+(192-size[0])//2;y=(row+4)*256+max(24,full_bottom-size[1])
                assert y+size[1]<=(row+4)*256+232
                final.paste(cell,(x,y))
                atlas['frames'][pose]={'frame':{'x':col*192,'y':(row+4)*256,'w':192,'h':256},'rotated':False,'trimmed':False,'spriteSourceSize':{'x':0,'y':0,'w':192,'h':256},'sourceSize':{'w':192,'h':256}}
                ca=final.getchannel('A').crop((col*192,(row+4)*256,(col+1)*192,(row+5)*256));yy,xx=np.where(np.array(ca)>128)
                assert len(xx)>150,(name,pose)
                footlines[pose]=int(yy.max())
                poses.append({'pose':pose,'sourceRect':dict(x=rect[0],y=rect[1],w=rect[2]-rect[0],h=rect[3]-rect[1]),'maximumSourceBoundaryAlpha':edge,'paintedWidth':int(np.ptp(xx)+1),'paintedHeight':int(np.ptp(yy)+1),'footline':int(yy.max()),'opaquePixels':len(xx)})
        assert final.crop((0,0,1536,1024)).tobytes()==old_im.tobytes()
        png=DST/f'{name}.png';final.save(png)
        atlas_path=DST/f'{name}.json';atlas['meta']['image']=png.name;atlas['meta']['size']={'w':1536,'h':1536};atlas['meta']['legacySource']=old['url'];atlas['meta']['additionalSource']=str(source.relative_to(ROOT));atlas_path.write_text(json.dumps(atlas,indent=2)+'\n')
        entry=copy.deepcopy(old);entry.update(key=f'task10-legacy-upgrade-b-{name}',url=str(png.relative_to(ROOT)),atlasURL=str(atlas_path.relative_to(ROOT)),frameWidth=192,frameHeight=256,poseBanks=['idle','run-a','run-b','attack','hurt','death'],drawnDeath=True,footlines=footlines)
        entries[ident]=entry
        for background,label in [('#cab582','beige'),('#202630','dark')]:
            qa=Image.new('RGBA',(1536,768),background)
            # Reference idle row and both additions, all at native size.
            qa.alpha_composite(final.crop((0,0,1536,256)),(0,0));qa.alpha_composite(final.crop((0,1024,1536,1536)),(0,256))
            qa.convert('RGB').save(SRC/f'{name}-{label}-qa.jpg',quality=93)
        report.append({'id':ident,'name':name,'source':str(source.relative_to(ROOT)),'old32PreservedExactly':True,'oldEntry':old,'newPoses':poses,'sha256':hashlib.sha256(png.read_bytes()).hexdigest()})
    (ROOT/'js/assets/legacyUpgradeBArt.js').write_text('// Original legacy frames are byte-exact; only hurt/death art is added.\nexport const LEGACY_UPGRADE_B_ART=Object.freeze('+json.dumps(entries,indent=2)+');\nexport const legacyUpgradeBArt=id=>LEGACY_UPGRADE_B_ART[id]||null;\n')
    (SRC/'registration.json').write_text(json.dumps(report,indent=2)+'\n')

if __name__=='__main__':pack()
