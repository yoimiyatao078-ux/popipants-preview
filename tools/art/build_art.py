"""Original Popipants decoration art (same style as the critters:
chubby shapes, thick plum outline, glossy highlight, no faces).
Run: python tools/art/build_art.py  -> writes images/art/*.svg"""
import os
O="#3a1438"; W=7
OUT=os.path.join(os.path.dirname(__file__),'..','..','images','art')
def star(x,y,r,c="#fff"):
    return f'<path d="M{x} {y-r} Q{x} {y} {x+r} {y} Q{x} {y} {x} {y+r} Q{x} {y} {x-r} {y} Q{x} {y} {x} {y-r}Z" fill="{c}"/>'
def ostar(x,y,r,c):
    return f'<path d="M{x} {y-r} Q{x+r*.2} {y-r*.2} {x+r} {y} Q{x+r*.2} {y+r*.2} {x} {y+r} Q{x-r*.2} {y+r*.2} {x-r} {y} Q{x-r*.2} {y-r*.2} {x} {y-r}Z" fill="{c}" stroke="{O}" stroke-width="4" stroke-linejoin="round"/>'
def heart(x,y,s,c,sw=4):
    return f'<path transform="translate({x} {y}) scale({s})" d="M0 6 C-4 -2 -14 -2 -14 6 C-14 13 -6 18 0 23 C6 18 14 13 14 6 C14 -2 4 -2 0 6Z" fill="{c}" stroke="{O}" stroke-width="{sw/s}" stroke-linejoin="round"/>'
def svg(vb,inner,defs=''):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}"><defs>{defs}</defs>{inner}</svg>\n'
art={}
CHROME='<linearGradient id="chr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#e6dcef"/><stop offset=".55" stop-color="#b9a9c9"/><stop offset="1" stop-color="#fdf6ff"/></linearGradient>'
def spark(x,y,r,c="url(#chr)",sw=2.5):
    """Y2K 4-point twinkle star, thin outline + centre glint"""
    k=r*.16
    return (f'<path d="M{x} {y-r} C{x+k} {y-k} {x+k} {y-k} {x+r} {y} C{x+k} {y+k} {x+k} {y+k} {x} {y+r} '
            f'C{x-k} {y+k} {x-k} {y+k} {x-r} {y} C{x-k} {y-k} {x-k} {y-k} {x} {y-r}Z" fill="{c}" stroke="{O}" stroke-width="{sw}" stroke-linejoin="round"/>'
            f'<circle cx="{x}" cy="{y}" r="{max(1.2,r*.12)}" fill="#fff"/>')
def glint(x,y,r):
    k=r*.12
    return f'<path d="M{x} {y-r} Q{x+k} {y-k} {x+r} {y} Q{x+k} {y+k} {x} {y+r} Q{x-k} {y+k} {x-r} {y} Q{x-k} {y-k} {x} {y-r}Z" fill="#fff"/>'

# 1. sleek unbranded 2000s mp3 player
art['music-player']=svg('0 0 240 360',f"""
<path d="M120 22 C118 -4 196 -6 204 30 C214 80 206 170 214 230 C222 290 206 330 178 344" fill="none" stroke="{O}" stroke-width="6" stroke-linecap="round" opacity=".45"/>
<path d="M120 22 C118 -4 196 -6 204 30 C214 80 206 170 214 230 C222 290 206 330 178 344" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>
<g transform="rotate(-7 110 180)">
<rect x="50" y="22" width="122" height="296" rx="18" fill="url(#rim)" stroke="{O}" stroke-width="3.5"/>
<rect x="55" y="27" width="112" height="286" rx="14" fill="url(#body)"/>
<rect x="67" y="44" width="88" height="96" rx="5" fill="#2a1030" stroke="{O}" stroke-width="2.5"/>
<rect x="70" y="47" width="82" height="90" rx="3" fill="url(#scr)"/>
<rect x="76" y="54" width="70" height="7" fill="#ff5fa2" opacity=".9"/>
<rect x="76" y="68" width="48" height="4" rx="2" fill="#fff" opacity=".9"/><rect x="76" y="77" width="60" height="4" rx="2" fill="#fff" opacity=".6"/><rect x="76" y="86" width="40" height="4" rx="2" fill="#fff" opacity=".6"/>
<rect x="76" y="118" width="70" height="5" rx="2.5" fill="#fff" opacity=".4"/><rect x="76" y="118" width="40" height="5" rx="2.5" fill="#ff5fa2"/>
<path d="M70 47 L152 47 L152 70 C130 84 100 64 70 92Z" fill="#fff" opacity=".22"/>
<circle cx="111" cy="226" r="44" fill="url(#wheel)" stroke="{O}" stroke-width="2.5"/>
<circle cx="111" cy="226" r="16" fill="url(#btn)" stroke="{O}" stroke-width="2.5"/>
<text x="111" y="196" text-anchor="middle" font-family="Arial,sans-serif" font-size="9" font-weight="700" fill="#8a5a86" letter-spacing="1">MENU</text>
<path d="M82 222 l-6 4 l6 4z M88 222 l-6 4 l6 4z" fill="#8a5a86"/><path d="M140 222 l6 4 l-6 4z M134 222 l6 4 l-6 4z" fill="#8a5a86"/>
<path d="M106 252 l6 4 l-6 4z M114 252 v8 M117 252 v8" stroke="#8a5a86" stroke-width="2" fill="#8a5a86"/>
<path d="M60 34 C58 120 58 220 62 306" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7" fill="none"/>
<path d="M163 40 C165 120 165 220 162 300" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".5" fill="none"/>
<ellipse cx="97" cy="208" rx="14" ry="4" fill="#fff" opacity=".7" transform="rotate(-30 97 208)"/>
</g>
<path d="M178 344 C170 352 156 350 152 338" fill="none" stroke="#fff" stroke-width="3.5"/>
<g transform="rotate(16 190 335)"><rect x="176" y="316" width="22" height="30" rx="11" fill="url(#rim)" stroke="{O}" stroke-width="3"/><ellipse cx="183" cy="326" rx="3" ry="6" fill="#fff"/></g>
<g transform="rotate(-20 150 330)"><rect x="140" y="312" width="20" height="28" rx="10" fill="url(#rim)" stroke="{O}" stroke-width="3"/><ellipse cx="146" cy="321" rx="3" ry="5" fill="#fff"/></g>
{spark(30,70,18)}{spark(222,120,11)}{spark(30,262,9,"#ffd1e6")}{glint(176,48,9)}
""",CHROME+'<linearGradient id="rim" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f7f1fa"/><stop offset=".5" stop-color="#c9bcd6"/><stop offset="1" stop-color="#fff"/></linearGradient>'
 '<linearGradient id="body" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd3e6"/><stop offset=".5" stop-color="#ff86bd"/><stop offset="1" stop-color="#ff5fa2"/></linearGradient>'
 '<linearGradient id="scr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b3c8f"/><stop offset="1" stop-color="#2d1440"/></linearGradient>'
 '<radialGradient id="wheel" cx=".4" cy=".35"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#f3dcea"/></radialGradient>'
 '<radialGradient id="btn" cx=".35" cy=".3"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#d8c8e4"/></radialGradient>')

# 2. barcode sticker, classic import-sticker layout, ORIGINAL cat: pointy tall ears,
#    wide flat-bottom head, closed-eye arcs + 'w' mouth, blush, star-centred bow under the chin
K="#1e1020"
bars=''.join(f'<rect x="{x}" y="66" width="{w}" height="48" fill="{K}"/>' for x,w in [(96,3),(101,2),(105,5),(113,2),(117,3),(122,5),(130,2),(134,4),(140,2),(145,5),(153,3),(158,2),(162,4),(169,2),(173,4),(179,5),(187,2),(191,3),(196,4),(203,2),(207,3),(213,2),(217,5),(225,3),(230,2)])
CAT=f"""<g transform="translate(50 74)">
<path d="M-32 6 L-27 -34 L-9 -21 Q0 -24 9 -21 L27 -34 L32 6 Q34 30 0 31 Q-34 30 -32 6Z" fill="#fff" stroke="{K}" stroke-width="3.5" stroke-linejoin="round"/>
<path d="M-24 -25 L-14 -19 M24 -25 L14 -19" stroke="#ffb3d1" stroke-width="4" stroke-linecap="round"/>
<path d="M-18 5 q5 -6 10 0 M8 5 q5 -6 10 0" fill="none" stroke="{K}" stroke-width="3" stroke-linecap="round"/>
<path d="M-5 13 q2.5 4 5 0 q2.5 4 5 0" fill="none" stroke="{K}" stroke-width="2.5" stroke-linecap="round"/>
<ellipse cx="-21" cy="14" rx="5" ry="3" fill="#ffb3d1"/><ellipse cx="21" cy="14" rx="5" ry="3" fill="#ffb3d1"/>
<g transform="translate(0 33)"><path d="M0 0 L-14 -8 L-12 8Z M0 0 L14 -8 L12 8Z" fill="#ff3d8b" stroke="{K}" stroke-width="2.5" stroke-linejoin="round"/>{spark(0,0,6,"#fff",2)}</g>
</g>"""
art['made-in-norway']=svg('0 0 250 150',f"""
<rect x="6" y="6" width="238" height="138" rx="6" fill="#fff" stroke="{K}" stroke-width="3"/>
<rect x="12" y="12" width="226" height="126" rx="3" fill="none" stroke="{K}" stroke-width="1.2"/>
{CAT}
<text x="163" y="54" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="20" fill="{K}">laget i norge</text>
{bars}
<text x="125" y="134" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="18" fill="{K}" letter-spacing="1.5">MADE IN NORWAY</text>
""",CHROME)

# 3. translucent iridescent CD
art['cd']=svg('0 0 300 300',f"""
<g opacity=".72">
<circle cx="150" cy="150" r="128" fill="url(#cd)" fill-opacity=".55" stroke="#b9a9c9" stroke-width="3"/>
<circle cx="150" cy="150" r="118" fill="none" stroke="#fff" stroke-width="2"/>
<circle cx="150" cy="150" r="96" fill="none" stroke="#e6c9ef" stroke-width="1.5"/>
<path d="M150 22 A128 128 0 0 1 266 96 L150 150Z" fill="url(#rb)" opacity=".55"/>
<path d="M150 278 A128 128 0 0 1 34 204 L150 150Z" fill="url(#rb)" opacity=".4"/>
<circle cx="150" cy="150" r="44" fill="#fff" fill-opacity=".5" stroke="#b9a9c9" stroke-width="2"/>
<circle cx="150" cy="150" r="30" fill="none" stroke="#d8c8e4" stroke-width="6"/>
<circle cx="150" cy="150" r="16" fill="#fff" stroke="#b9a9c9" stroke-width="2"/>
<path d="M60 120 C80 70 130 50 170 52" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity=".9"/>
</g>
{spark(246,46,15)}{spark(52,248,10)}{glint(108,74,12)}{glint(212,214,8)}
""",CHROME+'<linearGradient id="cd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe3f0"/><stop offset=".35" stop-color="#d7ecff"/><stop offset=".6" stop-color="#f0d9ff"/><stop offset="1" stop-color="#ffd1e6"/></linearGradient>'
 '<linearGradient id="rb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffb3d1"/><stop offset=".33" stop-color="#fff3a8"/><stop offset=".66" stop-color="#aee8ff"/><stop offset="1" stop-color="#e2b8ff"/></linearGradient>')

# 4. music notes ribbon
def note(x,y,c,dbl=False):
    s=f'<ellipse cx="{x}" cy="{y}" rx="13" ry="9" fill="{c}" stroke="{O}" stroke-width="3" transform="rotate(-20 {x} {y})"/><path d="M{x+11} {y-3} L{x+11} {y-56}" stroke="{O}" stroke-width="3.5" stroke-linecap="round"/>'
    if dbl: s+=f'<ellipse cx="{x+44}" cy="{y-8}" rx="13" ry="9" fill="{c}" stroke="{O}" stroke-width="3" transform="rotate(-20 {x+44} {y-8})"/><path d="M{x+55} {y-11} L{x+55} {y-64}" stroke="{O}" stroke-width="3.5" stroke-linecap="round"/><path d="M{x+11} {y-56} L{x+55} {y-64} L{x+55} {y-54} L{x+11} {y-46}Z" fill="{O}"/>'
    else: s+=f'<path d="M{x+11} {y-56} C{x+28} {y-48} {x+34} {y-34} {x+26} {y-22}" stroke="{O}" stroke-width="3.5" stroke-linecap="round" fill="none"/>'
    return s+f'<ellipse cx="{x-4}" cy="{y-3}" rx="5" ry="2" fill="#fff" opacity=".85" transform="rotate(-25 {x-4} {y-3})"/>'
art['music-notes']=svg('0 0 400 170',f"""
<path d="M10 120 C90 60 150 150 230 90 S350 70 392 40" fill="none" stroke="url(#rib)" stroke-width="12" stroke-linecap="round"/>
<path d="M10 117 C90 57 150 147 230 87 S350 67 392 37" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".9"/>
{note(60,110,"url(#nt)")}{note(150,128,"url(#nt)",True)}{note(290,82,"url(#nt)")}
{spark(350,94,14)}{spark(240,40,10)}{spark(108,40,8,"#ffd1e6")}
""",CHROME+'<linearGradient id="rib" x1="0" x2="1"><stop offset="0" stop-color="#ffb3d1"/><stop offset=".5" stop-color="#e6c9ef"/><stop offset="1" stop-color="#ff86bd"/></linearGradient><linearGradient id="nt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb3d1"/><stop offset="1" stop-color="#ff3d8b"/></linearGradient>')

# 5. pink stripe tile with twinkles
art['pink-tile']=svg('0 0 80 80','''<g shape-rendering="crispEdges">
<rect width="80" height="80" fill="#ffe9f3"/><rect x="0" width="20" height="80" fill="#ffd9ea"/><rect x="40" width="20" height="80" fill="#ffd9ea"/></g>
<path d="M30 24 Q31 29 36 30 Q31 31 30 36 Q29 31 24 30 Q29 29 30 24Z" fill="#fff"/>
<path d="M70 62 Q70.8 65.2 74 66 Q70.8 66.8 70 70 Q69.2 66.8 66 66 Q69.2 65.2 70 62Z" fill="#ffb3d1"/>
''')

os.makedirs(OUT,exist_ok=True)
for k,v in art.items():
    open(os.path.join(OUT,k+'.svg'),'w').write(v)
print('wrote',len(art),'svgs')
