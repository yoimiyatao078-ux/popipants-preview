"""Soft pixel-art butterflies (pink mood), like the user's reference:
pink pixel wings with a light centre, white glitter pixels + heart spots,
a pale glow aura around the wings and 4-point twinkle sparkles.
Grid 40x40 cells inside the 200x200 critter viewBox (1 cell = 5 units)."""
from PIL import Image, ImageDraw, ImageFilter, ImageChops
C=5
def _mask():
    S=10; im=Image.new('L',(40*S,40*S),0); d=ImageDraw.Draw(im)
    up=Image.new('L',im.size,0); ImageDraw.Draw(up).ellipse([1*S,3*S,21*S,20*S],fill=255)
    up=up.rotate(-8,center=(19*S,19*S)); im=ImageChops.lighter(im,up)
    d=ImageDraw.Draw(im); d.ellipse([6*S,20*S,19*S,32*S],fill=255)
    d.rectangle([0,0,40*S,40*S],outline=0)
    im=im.crop((0,0,20*S,40*S))
    m=im.resize((20,40),Image.BOX).point(lambda v:255 if v>120 else 0)
    return m
def _runs(pix,color,op=1):
    out=[]
    for y in range(40):
        x=0
        while x<20:
            if (x,y) in pix:
                x0=x
                while x<20 and (x,y) in pix: x+=1
                out.append(f'<rect x="{x0*C}" y="{y*C}" width="{(x-x0)*C}" height="{C}"/>')
            else: x+=1
    return f'<g fill="{color}"{f" opacity={chr(34)}{op}{chr(34)}" if op<1 else ""}>{"".join(out)}</g>' if out else ''
def wing_side(pal,glints,hearts):
    m=_mask(); px=m.load()
    def S(img): p=img.load(); return {(x,y) for y in range(40) for x in range(20) if p[x,y]}
    inside=S(m)
    e1=S(m.filter(ImageFilter.MinFilter(3))); e2=S(m.filter(ImageFilter.MinFilter(5))); e3=S(m.filter(ImageFilter.MinFilter(9)))
    a1=S(m.filter(ImageFilter.MaxFilter(3)))-inside; a2=S(m.filter(ImageFilter.MaxFilter(5)))-inside-a1
    # light centre near the body (like the ref): pixels close to x=19
    centre={(x,y) for (x,y) in e3 if x>=12}
    g=''
    g+=f'<g class="aura">{_runs(a2,pal["aura2"],.35)}{_runs(a1,pal["aura1"],.6)}</g>'
    g+=_runs(inside-e1,pal['line'])+_runs(e1-e2,pal['mid'])+_runs(e2-e3,pal['light'])+_runs(e3-centre,pal['pale'])+_runs(centre,pal['centre'])
    wp=set(glints)
    for hx,hy in hearts:   # tiny 3x3 pixel heart
        wp|={(hx,hy),(hx+2,hy),(hx,hy+1),(hx+1,hy+1),(hx+2,hy+1),(hx+1,hy+2)}
    g+=_runs({p for p in wp if p in inside},'#ffffff',.95)
    return g
def body(pal):
    g=f'<rect x="{19*C}" y="{13*C}" width="{2*C}" height="{18*C}" fill="{pal["body"]}"/>'
    g+=f'<rect x="{19*C}" y="{14*C}" width="{C}" height="{6*C}" fill="{pal["bodyhi"]}"/>'
    ant=''.join(f'<rect x="{x*C}" y="{y*C}" width="{C}" height="{C}"/>' for x,y in [(18,12),(18,11),(17,10),(17,9),(16,8),(15,7),(21,12),(21,11),(22,10),(22,9),(23,8),(24,7)])
    tips=''.join(f'<rect x="{x*C}" y="{y*C}" width="{C*2}" height="{C*2}"/>' for x,y in [(13,5),(25,5)])
    return f'<g class="ant"><g fill="{pal["body"]}">{ant}</g><g fill="{pal["tip"]}">{tips}</g></g>'+g
def sparkle(cx,cy,col,delay,big=True):
    r=2 if big else 1
    cells=[(cx,cy)]+[(cx+i,cy) for i in range(-r,r+1) if i]+[(cx,cy+i) for i in range(-r,r+1) if i]
    rects=''.join(f'<rect x="{x*C}" y="{y*C}" width="{C}" height="{C}"/>' for x,y in cells)
    return f'<g class="tw ptw" style="animation-delay:{delay}s" fill="{col}">{rects}<rect x="{cx*C}" y="{cy*C}" width="{C}" height="{C}" fill="#fff"/></g>'
def make(pal,mirror):
    side=wing_side(pal,[(6,9),(9,7),(4,13),(8,26),(11,30),(14,10)],[(7,12),(9,27)])
    sp=(sparkle(36,6,pal['sp1'],0)+sparkle(3,34,pal['sp2'],.7)+sparkle(37,30,pal['sp3'],1.3,False)
        +sparkle(2,18,pal['sp1'],1.9,False)+sparkle(30,38,pal['sp2'],.35,False))
    dots=f'<g class="tw ptw" style="animation-delay:1.1s"><rect x="{31*C}" y="{11*C}" width="{C*2}" height="{C*2}" fill="{pal["sp3"]}" opacity=".7"/></g>'
    return (f'<g class="pxb" shape-rendering="crispEdges"><g class="pfloat">'
            f'<g class="wl">{side}</g><g class="wr">{mirror(side)}</g>{body(pal)}</g>{sp}{dots}</g>')
PINK=dict(line='#e8559a',mid='#ff86b9',light='#ffa9cc',pale='#ffc6dd',centre='#ffe4f0',aura1='#ffc2e3',aura2='#f3c6ff',
          body='#a8408c',bodyhi='#d877b6',tip='#c860a8',sp1='#ffb6da',sp2='#f58ab8',sp3='#c9a8ff')
LILAC=dict(PINK,line='#d45aa8',mid='#f78fc8',light='#f6b3e0',pale='#f6cdef',centre='#fbe8fb',aura2='#dcc6ff')
CSS_ADD="""
.pxb .pfloat{animation:pfloat 3.2s ease-in-out infinite}
.pxb .wl{animation:pflapL 1.6s cubic-bezier(.45,0,.35,1) infinite}
.pxb .wr{animation:pflapR 1.6s cubic-bezier(.45,0,.35,1) infinite}
.pxb .aura{animation:paura 3.2s ease-in-out infinite}
.pxb .ant{animation:ant 3.2s ease-in-out infinite}
.pxb .ptw{animation:ptw 2.4s ease-in-out infinite}
@keyframes pflapL{0%,100%{transform:scaleX(1) skewY(0)}38%{transform:scaleX(.2) skewY(6deg)}52%{transform:scaleX(.26) skewY(5deg)}}
@keyframes pflapR{0%,100%{transform:scaleX(1) skewY(0)}38%{transform:scaleX(.2) skewY(-6deg)}52%{transform:scaleX(.26) skewY(-5deg)}}
@keyframes pfloat{0%,100%{transform:translateY(4px)}50%{transform:translateY(-6px)}}
@keyframes paura{0%,100%{opacity:.75}50%{opacity:1}}
@keyframes ptw{0%,100%{transform:scale(.2) rotate(0);opacity:0}45%{transform:scale(1) rotate(0);opacity:1}60%{transform:scale(.85);opacity:.9}}
"""
