# Generates css/goth4.css: "studded belt" mood (data-theme="goth4"). Calm variant of goth2:
# pure black, one studded-belt strip (top bar + sidebar edge), lace once as a hero curtain, thin chrome edges.
src=open('css/goth2.css').read().replace('[data-theme="goth2"]','[data-theme="goth4"]')
src='\n'.join(l for l in src.split('\n') if 'theme-btn[data-theme="goth4"]' not in l and not l.startswith('@font-face') and not l.startswith('.px-'))
G='html[data-theme="goth4"]'
STUDB=[l for l in open('tools/build_goth2.py').read().split('\n') if l.startswith('STUDB=')][0][6:];STUDB=eval(STUDB);ST="url(../images/goth2/studs.webp)";LC="url(../images/goth2/lace.webp)"
CHR="linear-gradient(180deg,#f4f4f8,#8a8a96 45%,#2a2a30 55%,#c9c9d4)"
EDGE=f"border:1px solid transparent!important;background-clip:padding-box"
for x,y in [('#FF5FA2','#FF4A5E'),('#ff5fa2','#FF4A5E'),('%23FF5FA2','%23FF4A5E'),('rgba(255,95,162','rgba(255,74,94'),('#FF9EC7','#FF8A96'),('#C8205A','#8E0F22'),('#ffd6e8','#ffc2c8'),('#FFD6E8','#ffc2c8'),('../images/goth2/lace.webp','../images/goth4/lace-red.webp')]: src=src.replace(x,y)
RED='#FF4A5E';LR="url(../images/goth4/lace-red.webp)"
SB=f"{ST} 0 0/40px auto border-box"
HUE="hue-rotate(22deg) saturate(3.5)"
o=f"""
/* ===== goth4 "red studs": red lace background, stud frames, red accent ===== */
{G} body,{G} body.home-page,{G} body.secondary-page{{background:linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)),{LR} 0 0/360px!important}}
{G} body *:not(img):not(canvas){{color:{RED}!important;text-shadow:none!important}}
{G} .page-wrapper{{background:linear-gradient(#050505,#050505) padding-box,{SB}!important;border:14px solid transparent!important;border-image:none!important;box-shadow:0 0 0 1px #c9c9d4,0 10px 40px rgba(0,0,0,.8)!important}}
{G} .main-content,{G} .content-section,{G} .drop-section,{G} .px-teaser,{G} .lotus-section,{G} .cd-section,{G} .sidebar-section{{background:#050505!important;box-shadow:none!important}}
{G} .content-section{{border-color:rgba(255,74,94,.35)!important}}
{G} .banner,{G} .banner.pink-hero{{background:linear-gradient(#050505,#050505) padding-box,{SB}!important;border:16px solid transparent!important;box-shadow:inset 0 0 0 1px #c9c9d4!important}}
{G} .pg-hero,{G} .pg-hero[class*="pat-"]{{background:linear-gradient(#050505,#050505) padding-box,{SB}!important;border:14px solid transparent!important}}
{G} .combo-win{{background:linear-gradient(#050505,#050505) padding-box,{ST} 0 0/30px auto border-box!important;border:10px solid transparent!important;box-shadow:0 0 0 1px #c9c9d4!important}}
{G} .combo-wb,{G} .pc-popup,{G} .pc-popup-body,{G} .notepad,{G} .win-panel-inset{{background:#050505!important}}
{G} .sidebar-title,{G} .combo-tb,{G} .pc-popup-titlebar,{G} .win-titlebar{{background:linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.7)),{ST} 0 50%/24px auto!important;border-bottom:1px solid #c9c9d4!important}}
{G} .sidebar-title *,{G} .combo-tb span{{color:{RED}!important;text-shadow:0 0 3px #000,0 0 3px #000!important}}
{G} .page-layout>.sidebar{{background:linear-gradient(#050505,#050505) padding-box,{ST} 0 0/30px auto border-box!important;border-left:0!important;border-right:14px solid transparent!important}}
{G} .combo-mbar{{background:linear-gradient(rgba(0,0,0,.75),rgba(0,0,0,.75)),{ST} 0 50%/30px auto!important;border-bottom:2px solid {RED}!important}}
/* type */
{G} .brand-logo{{filter:drop-shadow(0 0 1px #000) drop-shadow(0 0 5px rgba(255,74,94,.55))!important}}
{G} body .pg-h2,{G} body h2.section-title,{G} body h2:not(.pg-h2).section-title,{G} body .pg-hero h1{{background:none!important;-webkit-text-fill-color:{RED}!important;color:{RED}!important;filter:none!important;text-shadow:none!important}}
/* buttons: dark chrome gel, stud rim, red accent */
{G} :is(.sidebar-nav a.active,.btn-primary,.gelbtn.on),{G} .music-pill .gel{{background:linear-gradient(180deg,rgba(255,255,255,.45),rgba(255,255,255,0) 48%,rgba(0,0,0,.25)),radial-gradient(120% 100% at 50% 120%,#FF8A96 0%,#E0263F 45%,#7a0a1c 100%) padding-box,{STUDB} 0 0/8px 8px border-box!important}}
{G} .music-pill .gel{{background:linear-gradient(180deg,rgba(255,255,255,.45),rgba(255,255,255,0) 48%,rgba(0,0,0,.25)),radial-gradient(120% 100% at 50% 120%,#FF8A96 0%,#E0263F 45%,#7a0a1c 100%)!important}}
{G} :is(.sidebar-nav a.active,.btn-primary,.gelbtn.on),{G} :is(.sidebar-nav a.active,.btn-primary,.gelbtn.on) *,{G} .music-pill .gel *{{color:#000!important}}
{G} .pp-ph.pat-dot,{G} .pp-ph.pat-plaid,{G} .pp-ph.pat-leo,{G} .pp-ph.pat-aq,{G} .pp-ph.pat-zeb{{background:#0c0c0e!important;border:1px solid rgba(255,74,94,.6)!important}}
{G} .draft{{background:#050505!important;color:{RED}!important;border:1px dashed {RED}!important}}
/* our own assets recoloured pink -> red: cat, CD, sparkles, cart, swatch */
{G} .px-cat,{G} .music-cd-toggle>:not(.px-cat),{G} #music-toggle>:not(.px-cat),{G} .px-cartfx,{G} .bag-count,{G} canvas:not(.pxc):not(.px-cat *):not(.px-cartfx *){{filter:{HUE}!important}}
{G} .hero-phone-sticker{{filter:grayscale(1) contrast(1.15) drop-shadow(0 0 8px rgba(255,74,94,.6))!important}}
{G} .px-goth-skull,{G} .px-spark-pink{{display:none!important}}
{G} .px-g2-spark{{display:block!important}}
{G} .px-g2-spark:nth-of-type(3n){{display:none!important}}
{G} .px-cloud-divider{{background:#050505!important}}
{G} .px-cloud-divider .pxc{{filter:brightness(.25) sepia(1) hue-rotate(320deg) saturate(4);opacity:.7}}
{G} .theme-switcher-inline{{background:{ST} 0 0/90px auto!important}}
{G} .theme-btn.active{{outline:2px dashed {RED}!important}}
.theme-btn[data-theme="goth4"]{{background:linear-gradient(180deg,transparent 0 62%,#111 62% 64%,transparent 64%),{ST} 0 100%/12px auto repeat-x,{LR} 0 0/60px!important}}
@media (max-width:768px){{
 {G} .page-wrapper{{border-width:8px!important}}
 {G} .banner,{G} .banner.pink-hero{{border-width:10px!important}}
 {G} .combo-win{{border-width:7px!important}}
 {G} .page-layout>.sidebar{{border-right:0!important;border-left:12px solid transparent!important}}
}}
"""
open('css/goth4.css','w').write(src+o);print('ok')
