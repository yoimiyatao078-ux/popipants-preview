"""Pixel-art remakes of the original Popipants images (round 3).
Each original in images/ is redrawn on a small pixel grid with a limited palette
and a stepped 1px outline; the site scales them up with image-rendering: pixelated.
Run: python tools/art/build_pixel.py  -> writes images/art/*.png"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops
H=os.path.dirname(os.path.abspath(__file__)); R=os.path.join(H,'..','..')
IMG=os.path.join(R,'images'); OUT=os.path.join(IMG,'art')
REF=os.path.join(H,'sticker-ref.png')   # layout reference (barcode positions)
JP=os.path.join(H,'NotoSansJP-Bold.otf')
BOLD='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'

def cutout(im,thr=236):
    """white background -> transparent"""
    im=im.convert('RGB'); px=im.load(); a=Image.new('L',im.size,0); ap=a.load()
    for y in range(im.size[1]):
        for x in range(im.size[0]):
            r,g,b=px[x,y]; ap[x,y]=0 if min(r,g,b)>thr else 255
    a=a.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
    o=im.convert('RGBA'); o.putalpha(a); return o

def pixelize(src,w,colors,outline,thr=236,keep_light=False,rot=0):
    im=Image.open(os.path.join(IMG,src))
    if rot: im=im.convert('RGB').rotate(rot,Image.BICUBIC,expand=True,fillcolor=(255,255,255))
    c=cutout(im,thr); h=round(c.size[1]*w/c.size[0])
    a=c.getchannel('A').resize((w,h),Image.BOX).point(lambda v:255 if v>110 else 0)
    rgb=c.convert('RGB').resize((w,h),Image.BOX)
    q=rgb.quantize(colors,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE).convert('RGBA')
    q.putalpha(a)
    if outline:
        ring=ImageChops.subtract(a.filter(ImageFilter.MaxFilter(3)),a)
        o=Image.new('RGBA',(w,h),outline); o.putalpha(ring)
        q=Image.alpha_composite(o,q)
    return q

def save(im,name): im.save(os.path.join(OUT,name)); print('wrote',name,im.size)

# 1-3. phone / CD / notes: same picture, rebuilt on a pixel grid
# 135 px wide = exactly half the original 270 px; the original -8deg tilt is baked in so CSS can scale x2 crisply
save(pixelize('music-player-sticker.jpg',135,14,outline=(150,40,95,255)),'music-player.png')
save(pixelize('cd-sticker.jpg',104,10,(185,160,190,255),thr=246),'cd.png')
save(pixelize('pink/music-notes.jpg',120,8,None,thr=228),'music-notes.png')
# 4. pink stripe tile: the original stripes, one column = one pixel
t=Image.open(os.path.join(IMG,'pink-pattern-tile.jpg')).convert('RGB')
t=t.resize((96,1),Image.BOX).quantize(5,dither=Image.Dither.NONE).convert('RGB').resize((96,54),Image.NEAREST)  # same 736x414 shape as the original tile
save(t,'pink-tile.png')

# 5. sticker: same layout / colours / barcode as the reference, own pixel cat
INK=(109,87,99); BG=(245,231,240); S=4; GW,GH=184,104
def sticker(top,bottom,name):
    ref=Image.open(REF).convert('L').resize((GW*S,GH*S))
    hi=Image.new('L',(GW*S,GH*S),255); hi.paste(ref,(0,0))
    d=ImageDraw.Draw(hi)
    d.rectangle([0,0,232,GH*S],fill=255); d.rectangle([232,0,GW*S,155],fill=255)  # remove ref cat + top text
    d.rectangle([150,282,668,352],fill=255)                                        # remove bottom text
    d.rectangle([140,226,232,GH*S],fill=255)                                       # short bars redrawn under the paw
    for x in (176,198,218): d.rectangle([x,236 if x>150 else 258,x+12,350],fill=0)
    # top text
    if top=='jp': f=ImageFont.truetype(JP,118); txt='日本製'; box=(226,40,668,152)
    else: f=ImageFont.truetype(BOLD,96); txt='laget i norge'; box=(232,46,668,150)
    tl=Image.new('L',(1400,300),255); ImageDraw.Draw(tl).text((10,10),txt,font=f,fill=0)
    tl=tl.crop(ImageChops.invert(tl).getbbox()); tl=tl.resize((box[2]-box[0],box[3]-box[1]))
    if top=='jp': tl=tl.filter(ImageFilter.MaxFilter(5))  # thin strokes like the ref
    hi.paste(tl,(box[0],box[1]))
    # bottom text
    f=ImageFont.truetype(BOLD,90); tb=Image.new('L',(1400,200),255); ImageDraw.Draw(tb).text((10,10),bottom,font=f,fill=0)
    tb=tb.crop(ImageChops.invert(tb).getbbox()).resize((492,56)); hi.paste(tb,(170,290))
    # cat (line art, back to front)
    L=11; e=lambda b,**k: d.ellipse(b,fill=255,outline=0,width=L,**k)
    e([44,262,128,352])                       # front foot (bottom-left, like the ref pose)
    d.polygon([(72,200),(166,200),(150,348),(96,348)],fill=255); d.line([(72,200),(96,346)],fill=0,width=L); d.line([(166,200),(150,346),(110,346)],fill=0,width=L)
    e([44,262,128,352])
    e([160,190,226,248])                      # paw resting on the barcode
    d.polygon([(46,120),(60,32),(118,82)],fill=255,outline=0); d.line([(46,120),(60,32),(118,82)],fill=0,width=L,joint='curve')  # pointy ear
    d.polygon([(152,82),(198,36),(214,118)],fill=255,outline=0); d.line([(152,82),(198,36),(214,118)],fill=0,width=L,joint='curve')
    e([30,64,234,232])                        # round head
    d.rectangle([40,120,224,190],fill=255)    # clean inside head
    d.polygon([(66,52),(62,92),(90,84)],fill=0)   # inner ear
    # cheek tufts (not a Sanrio oval)
    for sx,dirx in ((30,-1),(234,1)):
        d.line([(sx,140),(sx+dirx*16,150),(sx,162),(sx+dirx*14,172),(sx+dirx*2,184)],fill=0,width=9,joint='curve')
    # bow on the right ear
    d.polygon([(150,40),(186,70),(150,104)],fill=0); d.polygon([(222,36),(186,70),(226,108)],fill=0); d.ellipse([172,56,200,86],fill=0)
    d.ellipse([196,52,208,62],fill=255)
    # face: eyes, tiny nose, w-mouth
    d.ellipse([84,150,100,174],fill=0); d.ellipse([150,150,166,174],fill=0)
    d.polygon([(118,178),(132,178),(125,186)],fill=0)
    d.line([(108,190),(116,198),(125,190),(134,198),(142,190)],fill=0,width=6,joint='curve')
    g=hi.resize((GW,GH),Image.BOX).point(lambda v:0 if v<150 else 255)
    out=Image.new('RGB',(GW,GH),BG); out.paste(Image.new('RGB',(GW,GH),INK),mask=ImageChops.invert(g))
    save(out,name)
sticker('jp','MADE IN NORWAY','made-in-norway-jp.png')
sticker('no','MADE IN NORWAY','made-in-norway-no.png')
