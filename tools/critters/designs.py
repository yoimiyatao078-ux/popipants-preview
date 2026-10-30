"""Popipants critter designs (from the approved critter gallery).
Each entry in `items`: key -> (label, description, svg-inner-markup).
Run build.py after editing to update js/critter-shapes.js and css/critters.css."""
O="#3a1438"  # plum outline
CSS="""
.cr{width:var(--s,160px);height:var(--s,160px);display:inline-block}
.cr svg{width:100%;height:100%;overflow:visible}
.cr *{transform-box:view-box}
.float{animation:float 4s ease-in-out infinite}
.sq{transform-origin:100px 170px;animation:sq 4s ease-in-out infinite}
.ant{transform-origin:100px 70px;animation:ant 4s ease-in-out infinite}
.wl{transform-origin:100px 100px;animation:flapL .6s ease-in-out infinite}
.wr{transform-origin:100px 100px;animation:flapR .6s ease-in-out infinite}
.bl{transform-origin:100px 95px;animation:batL .5s ease-in-out infinite}
.br{transform-origin:100px 95px;animation:batR .5s ease-in-out infinite}
.sway{transform-origin:100px 190px;animation:sway 4s ease-in-out infinite}
.spin{transform-origin:100px 100px;animation:spin 12s linear infinite}
.breath{transform-origin:100px 100px;animation:breath 3s ease-in-out infinite}
.shL{transform-origin:100px 60px;animation:shL 6s ease-in-out infinite}
.shR{transform-origin:100px 60px;animation:shR 6s ease-in-out infinite}
.tw{transform-origin:center;transform-box:fill-box!important;animation:tw 1.6s ease-in-out infinite}
@keyframes float{0%,100%{transform:translateY(8px)}50%{transform:translateY(-8px)}}
@keyframes sq{0%,100%{transform:scale(1.06,.94)}50%{transform:scale(.96,1.04)}}
@keyframes ant{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(6deg)}}
@keyframes flapL{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.35)}}
@keyframes flapR{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.35)}}
@keyframes batL{0%,100%{transform:rotate(-14deg) scaleY(.9)}50%{transform:rotate(16deg) scaleY(1)}}
@keyframes batR{0%,100%{transform:rotate(14deg) scaleY(.9)}50%{transform:rotate(-16deg) scaleY(1)}}
@keyframes sway{0%,100%{transform:rotate(-6deg) translateY(3px)}50%{transform:rotate(6deg) translateY(-5px)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes breath{0%,100%{transform:scale(.93)}50%{transform:scale(1.05)}}
@keyframes shL{0%,70%,100%{transform:rotate(0)}78%,88%{transform:rotate(-22deg)}82%{transform:rotate(-16deg)}}
@keyframes shR{0%,70%,100%{transform:rotate(0)}78%,88%{transform:rotate(22deg)}82%{transform:rotate(16deg)}}
@keyframes tw{0%,100%{transform:scale(.3);opacity:.3}50%{transform:scale(1);opacity:1}}
"""
def star(x,y,r,c="#fff",d=0):
    return f'<path class="tw" style="animation-delay:{d}s" d="M{x} {y-r} Q{x} {y} {x+r} {y} Q{x} {y} {x} {y+r} Q{x} {y} {x-r} {y} Q{x} {y} {x} {y-r}Z" fill="{c}"/>'
def ants(c=O,tip=None):
    tip=tip or c
    return f'<g class="ant"><path d="M94 70 Q84 44 72 38" stroke="{c}" stroke-width="6" stroke-linecap="round" fill="none"/><circle cx="72" cy="38" r="7" fill="{tip}" stroke="{c}" stroke-width="3"/><path d="M106 70 Q116 44 128 38" stroke="{c}" stroke-width="6" stroke-linecap="round" fill="none"/><circle cx="128" cy="38" r="7" fill="{tip}" stroke="{c}" stroke-width="3"/></g>'
def mirror(g): return f'<g transform="translate(200 0) scale(-1 1)">{g}</g>'
def body(c=O,fill=None,h=(72,150)):
    return f'<rect x="90" y="{h[0]}" width="20" height="{h[1]-h[0]}" rx="10" fill="{fill or c}" stroke="{c}" stroke-width="5"/><ellipse cx="96" cy="{h[0]+16}" rx="3" ry="7" fill="#fff" opacity=".5"/>'
# wing shapes for left side (right is mirrored)
HEART_UP='M100 98 C80 60 40 30 26 58 C14 84 50 100 100 104Z'
HEART_LO='M100 106 C64 108 34 128 46 150 C58 170 88 146 100 112Z'
ROUND_UP='M100 100 C90 50 30 30 24 70 C20 100 70 104 100 104Z'
ROUND_LO='M100 106 C70 106 42 120 50 146 C60 168 92 140 100 110Z'
def wing(path,fill,stroke=O,extra=''):
    return f'<path d="{path}" fill="{fill}" stroke="{stroke}" stroke-width="7" stroke-linejoin="round"/>{extra}'
def butterfly(up,lo,cu,cl,deco='',b=O,bf=None,sparkle='',defs=''):
    side=wing(up,cu)+wing(lo,cl)+deco
    return f'''<defs>{defs}</defs><g class="float"><g class="sq">{ants(b)}<g class="wl">{side}</g><g class="wr">{mirror(side)}</g>{body(b,bf)}</g>{sparkle}</g>'''
gl=lambda x,y,rx=10,ry=5,a=-30,o=.6: f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="#fff" opacity="{o}" transform="rotate({a} {x} {y})"/>'
items={}
# PINK butterflies
items['butterfly-1']=('Butterfly A','heart wings, baby pink + hot pink',butterfly(HEART_UP,HEART_LO,'#ffb3d1','#ff5fa2',gl(46,58)))
items['butterfly-2']=('Butterfly B','round bubblegum wings with white polka dots + twinkles',butterfly(ROUND_UP,ROUND_LO,'#ff7eb6','#ffc4dd',gl(40,62)+'<circle cx="56" cy="74" r="6" fill="#fff"/><circle cx="40" cy="82" r="4" fill="#fff"/><circle cx="68" cy="132" r="5" fill="#fff"/>',sparkle=star(168,40,10,'#fff',0)+star(30,160,8,'#fff',.8)))
items['butterfly-3']=('Butterfly C','glitter gradient heart wings, hot pink → lilac, sparkles',butterfly(HEART_UP,HEART_LO,'url(#g3)','url(#g3)',gl(46,58)+star(52,70,7,'#fff',.3)+star(64,136,5,'#fff',.9),defs='<linearGradient id="g3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff3d9a"/><stop offset="1" stop-color="#e3b8ff"/></linearGradient>',sparkle=star(170,150,9,'#ffe3f1',.4)))
items['butterfly-4']=('Butterfly D','pastel pink wings with tiny heart cutouts, white body',butterfly(ROUND_UP,HEART_LO,'#ffd1e6','#ff9cc7',gl(40,60)+'<path d="M58 80 c-6-8-16 0-8 8 l8 7 l8-7 c8-8-2-16-8-8z" fill="#ff3d8b"/>',bf='#fff'))
items['butterfly-5']=('Butterfly E','hot pink double-heart wings, chrome-pink rim + sparkle burst',butterfly(HEART_UP,HEART_LO,'#ff2f8e','#ff8fc4','<path d="M90 98 C76 70 50 52 40 66" stroke="#ffd6ea" stroke-width="4" fill="none" stroke-linecap="round"/>'+gl(46,58),b='#6b1048',sparkle=star(30,40,11,'#fff',0)+star(172,60,7,'#fff',.6)+star(160,170,9,'#fff',1.1)))
# BLUE hibiscus
def hib(pc,cc,n=5,petal='M100 100 C70 80 72 30 100 26 C128 30 130 80 100 100Z',stamen='#ffd84d',leaf=True,deco='',sp=False,o=O,defs=''):
    ps=''.join(f'<path d="{petal}" fill="{pc}" stroke="{o}" stroke-width="6" stroke-linejoin="round" transform="rotate({i*360/n} 100 100)"/>' for i in range(n))
    hi=''.join(f'<ellipse cx="100" cy="50" rx="6" ry="12" fill="#fff" opacity=".4" transform="rotate({i*360/n+8} 100 100)"/>' for i in range(n))
    lv=f'<path d="M100 150 C70 175 40 160 40 160 C60 135 90 140 100 150Z" fill="#3fd6b0" stroke="{o}" stroke-width="6" stroke-linejoin="round"/>' if leaf else ''
    st=f'<path d="M100 100 L122 70" stroke="{o}" stroke-width="5" stroke-linecap="round"/><circle cx="122" cy="70" r="7" fill="{stamen}" stroke="{o}" stroke-width="3"/><circle cx="112" cy="66" r="4" fill="{stamen}"/><circle cx="127" cy="79" r="4" fill="{stamen}"/>'
    inner=f'<g class="{"spin" if sp else ""}"><g class="breath">{ps}{hi}<circle cx="100" cy="100" r="16" fill="{cc}" stroke="{o}" stroke-width="5"/>{deco}</g></g>'
    return f'<defs>{defs}</defs><g class="float"><g class="sway">{lv}{inner}{st}</g></g>'
items['hibiscus-1']=('Hibiscus A','classic coral hibiscus, magenta heart, mint leaf',hib('#ff7a7a','#d6286b'))
items['hibiscus-2']=('Hibiscus B','aqua petals, hot-pink centre, slow spin',hib('#5fe3e0','#ff4f9a',sp=True,leaf=False))
items['hibiscus-3']=('Hibiscus C','turquoise→white gradient petals, coral heart',hib('url(#h3)','#ff7a5c',defs='<radialGradient id="h3" cx="100" cy="100" r="80" gradientUnits="userSpaceOnUse"><stop offset=".2" stop-color="#ff7a9a"/><stop offset=".5" stop-color="#2ec8d6"/><stop offset="1" stop-color="#d9fbff"/></radialGradient>'))
items['hibiscus-4']=('Hibiscus D','6 round bubble petals in baby pink, aqua centre',hib('#ffb3cf','#4fd9e6',n=6,petal='M100 100 C76 84 80 40 100 38 C120 40 124 84 100 100Z',stamen='#fff'))
items['hibiscus-5']=('Hibiscus E','sunset coral/yellow with sparkles, tropical spin',hib('#ffa64d','#ff3d7a',sp=True,stamen='#fff3a0',deco=star(100,100,8,'#fff',0)))
# RED ladybugs
def lady(shell,head,spots,o='#2a0a14',gold=None,shape='dots',defs=''):
    sp=''
    if shape=='dots': sp=f'<circle cx="68" cy="110" r="10" fill="{spots}"/><circle cx="74" cy="148" r="8" fill="{spots}"/><circle cx="56" cy="134" r="5" fill="{spots}"/>'
    elif shape=='hearts': sp=f'<path d="M68 112 c-8-10-22 0-11 11 l11 10 l11-10 c11-11-3-21-11-11z" fill="{spots}"/><path d="M74 146 c-5-6-14 0-7 7 l7 6 l7-6 c7-7-2-13-7-7z" fill="{spots}"/>'
    elif shape=='stars': sp=f'<path d="M66 100 l5 12 13 1-10 8 4 13-12-7-12 7 4-13-10-8 13-1z" fill="{spots}"/><circle cx="74" cy="150" r="6" fill="{spots}"/>'
    elif shape=='stripe': sp=f'<path d="M100 70 C70 80 52 110 50 130" stroke="{spots}" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="76" cy="150" r="7" fill="{spots}"/>'
    elif shape=='one': sp=f'<circle cx="70" cy="125" r="16" fill="{spots}"/>'
    half=f'<path d="M100 64 C40 64 26 120 34 140 C46 176 80 184 100 184Z" fill="{shell}" stroke="{o}" stroke-width="8" stroke-linejoin="round"/>{sp}{gl(52,104,14,7,-40,.5)}'
    halfR=f'<path d="M100 64 C40 64 26 120 34 140 C46 176 80 184 100 184Z" fill="{shell}" stroke="{o}" stroke-width="8" stroke-linejoin="round"/>{sp}'
    g=f'<path d="M98 64 L98 182" stroke="{gold}" stroke-width="3"/>' if gold else ''
    under=f'<ellipse cx="100" cy="124" rx="56" ry="56" fill="{o}"/><path d="M100 80 C70 100 60 150 70 170 M100 80 C130 100 140 150 130 170" stroke="#ffe7f0" stroke-width="3" fill="none" opacity=".35"/>'
    hd=f'<ellipse cx="100" cy="62" rx="38" ry="26" fill="{head}" stroke="{o}" stroke-width="8"/>{gl(82,54,9,4,-25,.55)}'
    gd=f'<circle cx="100" cy="58" r="5" fill="{gold}"/>' if gold else ''
    return f'<defs>{defs}</defs><g class="float"><g class="sq">{ants(o,gold or o)}{hd}{gd}{under}<g class="shL">{half}</g><g class="shR">{mirror(halfR)}</g>{g}</g></g>'
items['ladybug-1']=('Ladybug A','burgundy shell, black spots, gold antennae tips + seam',lady('#8b1a2b','#1a0a0f','#1a0a0f',gold='#e6b84d'))
items['ladybug-2']=('Ladybug B','black shell with gold heart spots',lady('#1c1014','#5a1424','#e6b84d',shape='hearts'))
items['ladybug-3']=('Ladybug C','cherry red classic with glossy shine, black spots',lady('#d6213c','#1a0a0f','#1a0a0f'))
items['ladybug-4']=('Ladybug D','wine gradient shell with gold star spots',lady('url(#l4)','#1a0a0f','#f2c35c',shape='stars',gold='#f2c35c',defs='<linearGradient id="l4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b3263f"/><stop offset="1" stop-color="#4a0b1c"/></linearGradient>'))
items['ladybug-5']=('Ladybug E','oxblood with one big black spot each side + gold stripe',lady('#6e0f22','#1a0a0f','#1a0a0f',gold='#d9a441',shape='one'))
# GOTH
BW='M100 92 C80 70 50 62 22 74 C30 84 30 96 26 108 C38 102 46 106 50 116 C58 106 68 108 74 118 C80 104 90 102 100 106Z'
def bat(c,o='#120818',heart=None,ear=True,sparkle='',wing2=None):
    w=f'<path d="{wing2 or BW}" fill="{c}" stroke="{o}" stroke-width="6" stroke-linejoin="round"/>'
    ears=f'<path d="M86 84 L84 60 L96 74Z M114 84 L116 60 L104 74Z" fill="{c}" stroke="{o}" stroke-width="5" stroke-linejoin="round"/>' if ear else ''
    h=f'<path d="M100 132 c-6-8-18 0-10 9 l10 9 l10-9 c8-9-4-17-10-9z" fill="{heart}" stroke="{o}" stroke-width="3"/>' if heart else ''
    return f'<g class="float"><g class="sq"><g class="bl">{w}</g><g class="br">{mirror(w)}</g>{ears}<ellipse cx="100" cy="100" rx="22" ry="26" fill="{c}" stroke="{o}" stroke-width="6"/>{gl(92,88,6,3,-30,.4)}{h}</g>{sparkle}</g>'
items['goth-1']=('Goth A','classic black bat holding a tiny hot-pink heart',bat('#241330',heart='#ff3d8b'))
items['goth-2']=('Goth B','purple bat with violet sparkles',bat('#6a2fa0',sparkle=star(30,50,9,'#d9b3ff',0)+star(170,150,8,'#d9b3ff',.7)))
items['goth-3']=('Goth C','black moth with purple eye-ring wing marks',butterfly(ROUND_UP,ROUND_LO,'#1e1424','#2e1d3a','<circle cx="54" cy="76" r="11" fill="#9b4dff" stroke="#e0c4ff" stroke-width="3"/><circle cx="66" cy="136" r="6" fill="#9b4dff"/>'+gl(40,62,8,4,-30,.3),b='#0e0812',bf='#3a2348'))
items['goth-4']=('Goth D','round chibi bat, black with lilac heart',bat('#16101c',heart='#c79bff',wing2='M100 94 C80 64 40 64 28 86 C40 90 40 104 36 112 C50 104 60 110 64 120 C74 108 90 104 100 106Z'))
items['goth-5']=('Goth E','heart-winged black moth with violet gradient + sparkle',butterfly(HEART_UP,HEART_LO,'url(#m5)','#2a1838',gl(46,58,10,5,-30,.3),b='#0e0812',defs='<linearGradient id="m5" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7a3cc4"/><stop offset="1" stop-color="#140c1c"/></linearGradient>',sparkle=star(164,40,8,'#e8d4ff',.3)))

# PINK pixel butterflies (round 3)
import pixel_butterfly as _pb
CSS+=_pb.CSS_ADD
items['pbutterfly-1']=('Pixel butterfly A','soft pixel pink, glow aura + twinkles',_pb.make(_pb.PINK,mirror))
items['pbutterfly-2']=('Pixel butterfly B','pixel pink-lilac, glow aura + twinkles',_pb.make(_pb.LILAC,mirror))
