"""Register complete source cells, without alpha edits or anatomical cropping."""
import json, hashlib
from pathlib import Path
from PIL import Image, ImageDraw
import numpy as np

ROOT=Path(__file__).resolve().parent.parent
BANKS=['idle','run-a','run-b','attack','hurt','death']
DIRS=['n','ne','e','se','s','sw','w','nw']

def corridor_rectangles(im):
    """Locate painted bands, then cut only the empty space between whole poses.

    Alpha comparisons locate paint for registration; source pixels are never
    changed, masked, thresholded or erased. Low alpha antialias haze is retained.
    """
    a=np.array(im.getchannel('A'))
    def bands(on):
        e=np.diff(np.r_[False,on,False].astype(int))
        return list(zip(np.where(e==1)[0],np.where(e==-1)[0]))
    rows=bands((a>128).sum(axis=1)>20)
    assert len(rows)==6,rows
    def gapcut(values,start,end):
        assert end>start,(start,end)
        v=values[start:end];m=v.min();choices=np.where(v==m)[0]+start
        return int(choices[np.argmin(abs(choices-(start+end)/2))])
    ycuts=[max(0,int(rows[0][0])-16)]
    for prev,nxt in zip(rows,rows[1:]):ycuts.append(gapcut(a.max(axis=1),int(prev[1]),int(nxt[0])))
    ycuts.append(min(im.height,int(rows[-1][1])+16))
    rects={}
    for row in range(6):
        z=a[ycuts[row]:ycuts[row+1]]
        cols=bands((z>128).sum(axis=0)>1)
        assert len(cols)==8,(row,cols)
        xcuts=[max(0,int(cols[0][0])-16)]
        for prev,nxt in zip(cols,cols[1:]):xcuts.append(gapcut(z.max(axis=0),int(prev[1]),int(nxt[0])))
        xcuts.append(min(im.width,int(cols[-1][1])+16))
        for col in range(8):rects[row,col]=(xcuts[col],ycuts[row],xcuts[col+1],ycuts[row+1])
    return rects

def pack(region):
    src=ROOT/f'art/source/task10-{region}-expansion4'
    dst=ROOT/f'assets/actors/task10-{region}-expansion4'
    dst.mkdir(exist_ok=True,parents=True)
    definitions=json.loads((src/'definitions.json').read_text())
    entries={}; report=[]
    for d in definitions:
        ident=d['id']; source=src/f'{ident}-clean.png'
        if not source.exists(): source=src/f'{ident}-original.png'
        im=Image.open(source).convert('RGBA'); sheet=Image.new('RGBA',(1024,1152))
        adaptive=(corridor_rectangles(im) if ident in ['ancient-species-033','ancient-species-035','ancient-species-039','desert-species-032','desert-species-034','desert-species-037','desert-species-038'] else None)
        frames={};footlines={};idleheights=[]; poses=[]
        # Entire nominal cells are retained. Resampling is uniform per model.
        sw=im.width/8;sh=im.height/6;ratio=min(96/sw,100/sh)
        if d['baseType']=='fallenKnight':ratio=min(104/sw,104/sh)
        if adaptive:ratio=min(96/max(r[2]-r[0] for r in adaptive.values()),100/max(r[3]-r[1] for r in adaptive.values()))
        for row,bank in enumerate(BANKS):
            for col,direction in enumerate(DIRS):
                name=f'{bank}/{direction}'
                # The crystal scarab painting runs S,SW,W,NW,N,NE,E,SE.
                source_col=([4,5,6,7,0,1,2,3][col] if ident=='ancient-species-031' else col)
                rect=(round(source_col*sw),round(row*sh),round((source_col+1)*sw),round((row+1)*sh))
                if adaptive:rect=adaptive[row,source_col]
                cell=im.crop(rect)
                source_alpha=np.array(cell.getchannel('A'))
                boundary_alpha=max(int(edge.max()) for edge in [source_alpha[0,:],source_alpha[-1,:],source_alpha[:,0],source_alpha[:,-1]])
                assert boundary_alpha<=8,(ident,name,'paint crosses sourceRect',boundary_alpha)
                size=(round(cell.width*ratio),round(cell.height*ratio))
                cell=cell.resize(size,Image.Resampling.LANCZOS)
                x=col*128+(128-size[0])//2;y=row*192+174-size[1]
                sheet.paste(cell,(x,y))
                frames[name]={'frame':{'x':col*128,'y':row*192,'w':128,'h':192},'sourceRect':{'x':rect[0],'y':rect[1],'w':rect[2]-rect[0],'h':rect[3]-rect[1]}}
                alpha=sheet.getchannel('A').crop((col*128,row*192,(col+1)*128,(row+1)*192))
                points=[(i%128,i//128) for i,a in enumerate(alpha.get_flattened_data()) if a>128]
                assert len(points)>200,(ident,name,len(points))
                top=min(p[1] for p in points);bottom=max(p[1] for p in points)
                footlines[name]=bottom
                if row==0:idleheights.append(bottom-top+1)
                poses.append({'pose':name,'sourceRect':frames[name]['sourceRect'],'maximumSourceBoundaryAlpha':boundary_alpha,'opaquePixels':len(points),'footline':bottom})
        png=dst/f'{ident}.png';sheet.save(png)
        atlas=dst/f'{ident}.json'
        atlas.write_text(json.dumps({'frames':frames,'meta':{'image':png.name,'size':{'w':1024,'h':1152},'source':str(source.relative_to(ROOT)),'sourceSize':{'w':im.width,'h':im.height},'registration':('Complete pose sourceRects separated through blank corridors' if adaptive else 'Full nominal source cells')+', uniform scaling; source alpha pixels never changed.'}},indent=2)+'\n')
        scale=d['targetIdleHeight']/max(idleheights)
        entries[ident]={'key':'task10-monster-'+d['slug'],'url':str(png.relative_to(ROOT)),'atlasURL':str(atlas.relative_to(ROOT)),'scale':scale,'annotationHeight':max(46,d['targetIdleHeight']+12),'frameHeight':192,'frameWidth':128,'poseBanks':BANKS,'drawnDeath':True,'footlines':footlines}
        qa=Image.new('RGBA',(1024,768),'#cab582')
        for row in range(6):
            for col in range(8):
                qa.alpha_composite(sheet.crop((col*128,row*192+64,(col+1)*128,row*192+192)),(col*128,row*128))
        qa.convert('RGB').save(src/f'{ident}-composited-qa.jpg',quality=92)
        dark=Image.new('RGBA',(1024,768),'#202630')
        for row in range(6):
            for col in range(8):dark.alpha_composite(sheet.crop((col*128,row*192+64,(col+1)*128,row*192+192)),(col*128,row*128))
        dark.convert('RGB').save(src/f'{ident}-dark-qa.jpg',quality=92)
        report.append({'id':ident,'source':str(source.relative_to(ROOT)),'poses':poses,'nativeIdleHeights':idleheights,'sha256':hashlib.sha256(png.read_bytes()).hexdigest()})
    const=region.upper()+'_EXPANSION4_ART'
    (ROOT/f'js/assets/{region}Expansion4Art.js').write_text('// Original 48-pose models; integration is performed separately.\nexport const '+const+'=Object.freeze('+json.dumps(entries,indent=2)+');\nexport const '+region+'Expansion4Art=id=>'+const+'[id]||null;\n')
    (src/'registration.json').write_text(json.dumps(report,indent=2)+'\n')

if __name__=='__main__':
    import sys
    for region in sys.argv[1:] or ['ancient','desert']:pack(region)
