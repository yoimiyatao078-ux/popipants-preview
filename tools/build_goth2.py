# Generates css/goth2.css: "true love" mood (data-theme="goth2"), 2006 scene/MySpace page.
# Textures supplied by Yoimiya: images/goth2/studs.webp (main bg) + images/goth2/lace.webp (trim).
# Headline in Pirata One (SIL OFL, self-hosted fonts/pirata-one.woff2). Pixel hearts/crosses come from js/pixel-fx.js.
src=open('css/goth.css').read().replace('[data-theme="goth"]','[data-theme="goth2"]')
src='\n'.join(l for l in src.split('\n') if 'theme-btn[data-theme="goth2"]' not in l and 'pixel fish' not in l and '.cd-section::after' not in l and 'px-goth-skull{display:block}' not in l and not l.startswith('.px-goth-skull'))
G='html[data-theme="goth2"]'
ST="url(../images/goth2/studs.webp)";LC="url(../images/goth2/lace.webp)"
CHROME="linear-gradient(180deg,#ffffff 0%,#e9e9f1 30%,#8a8a98 48%,#2c2c34 52%,#cfcfdb 70%,#ffffff 100%)"
GEL="linear-gradient(180deg,rgba(255,255,255,.55) 0%,rgba(255,255,255,.18) 42%,rgba(255,255,255,0) 50%,rgba(255,255,255,.12) 88%,rgba(255,255,255,.3) 100%),linear-gradient(180deg,#4a4a55,#121216 55%,#26262d)"
STUDB="url(\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2212%22%20height%3D%2212%22%3E%3Crect%20width%3D%2212%22%20height%3D%2212%22%20fill%3D%22%23111%22/%3E%3Cg%20transform%3D%22translate(1%201)%22%3E%3Cpolygon%20points%3D%220%2C0%2010%2C0%205%2C5%22%20fill%3D%22%23f7f7fb%22/%3E%3Cpolygon%20points%3D%220%2C0%205%2C5%200%2C10%22%20fill%3D%22%23c9c9d4%22/%3E%3Cpolygon%20points%3D%2210%2C0%2010%2C10%205%2C5%22%20fill%3D%22%238d8d9c%22/%3E%3Cpolygon%20points%3D%220%2C10%205%2C5%2010%2C10%22%20fill%3D%22%2355555f%22/%3E%3C/g%3E%3C/svg%3E\")"
o=f"""
/* ===== goth2 "true love": studs + pink lace, 2006 scene page ===== */
@font-face{{font-family:'Pirata One';src:url(../fonts/pirata-one.woff2) format('woff2');font-display:swap}}
{G} body,{G} body.home-page,{G} body.secondary-page{{background:linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.55)),{ST} 0 0/135px auto!important}}
{G} .page-wrapper{{background:#000!important;border:22px solid transparent!important;border-image:none!important;background:linear-gradient(#000,#000) padding-box,{LC} 0 0/360px border-box!important;box-shadow:0 0 0 2px #FF5FA2,0 0 30px rgba(255,95,162,.35)!important}}
{G} .main-content,{G} .content-section,{G} .drop-section,{G} .px-teaser,{G} .lotus-section,{G} .cd-section{{background:#000!important}}
{G} .content-section{{border-color:#FF5FA2!important}}
/* hero frame: lace trim */
{G} .banner,{G} .banner.pink-hero{{background:radial-gradient(120% 90% at 30% 40%,#000 55%,rgba(0,0,0,.85)) padding-box,{LC} 0 0/360px border-box!important;border:26px solid transparent!important;box-shadow:inset 0 0 0 2px #FF5FA2,0 0 0 2px #000!important}}
{G} .pg-hero,{G} .pg-hero[class*="pat-"]{{background:linear-gradient(#000,#000) padding-box,{LC} 0 0/360px border-box!important;border:22px solid transparent!important}}
/* windows: solid black with a lace frame */
{G} .combo-win{{background:linear-gradient(#000,#000) padding-box,{LC} 0 0/360px border-box!important;border:18px solid transparent!important;box-shadow:0 0 0 2px #FF5FA2,0 6px 18px rgba(0,0,0,.7)!important}}
{G} .combo-wb,{G} .pc-popup,{G} .pc-popup-body,{G} .notepad,{G} .win-panel-inset{{background:#000!important}}
/* title bars: lace under a dark glass with chrome rule */
{G} .sidebar-title,{G} .combo-tb,{G} .pc-popup-titlebar,{G} .win-titlebar{{background:linear-gradient(180deg,rgba(0,0,0,.35),rgba(0,0,0,.65)),{LC} 0 0/240px!important;border-bottom:2px solid #c9c9d4!important}}
{G} .sidebar-title *,{G} .combo-tb span{{color:#FF5FA2!important;text-shadow:0 0 3px #000,0 0 6px #000!important}}
{G} .combo-tb i{{background:radial-gradient(circle at 40% 30%,#fff,#b9b9c6 50%,#3a3a44)!important}}
/* sidebar: black with lace edges */
{G} .page-layout>.sidebar{{background:linear-gradient(#000,#000) padding-box,{LC} 0 0/360px border-box!important;border-left:0!important;border-right:20px solid transparent!important}}
{G} .sidebar-section{{background:#000!important;border-color:rgba(255,95,162,.5)!important}}
/* chrome gel buttons with stud bezel */
{G} :is(.gelbtn,.btn,.btn-aero,.top-nav a,.sidebar-nav a,.combo-drop-menu a,.px-addbtn,.popup-btn,.bag-checkout,.music-pill,.px-bagbtn),{G} .sidebar .figurine-button{{background:{GEL} padding-box,{STUDB} 0 0/8px 8px border-box!important;box-shadow:inset 0 -3px 8px rgba(0,0,0,.6),0 3px 10px rgba(255,95,162,.25)!important}}
{G} .px-addbtn span,{G} .music-pill .gel{{background:{GEL}!important}}
{G} :is(.gelbtn,.btn,.btn-aero,.top-nav a,.sidebar-nav a,.combo-drop-menu a,.music-pill .gel,.px-addbtn span)::before,{G} .sidebar .figurine-button::before{{background:linear-gradient(180deg,rgba(255,255,255,.75),rgba(255,255,255,0))!important}}
{G} :is(.gelbtn,.btn,.btn-aero,.top-nav a,.sidebar-nav a,.combo-drop-menu a,.px-addbtn,.popup-btn,.bag-checkout,.music-pill,.figurine-button,.px-bagbtn) *,{G} :is(.gelbtn,.btn,.btn-aero,.top-nav a,.sidebar-nav a,.combo-drop-menu a,.popup-btn,.bag-checkout,.px-bagbtn){{color:#FF5FA2!important;text-shadow:0 0 2px #000,0 1px 2px #000!important}}
{G} :is(.sidebar-nav a.active,.btn-primary,.gelbtn.on),{G} .music-pill .gel{{background:linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,0) 48%,rgba(0,0,0,.25)),radial-gradient(120% 100% at 50% 120%,#FF9EC7 0%,#FF5FA2 45%,#C8205A 100%) padding-box,{STUDB} 0 0/8px 8px border-box!important}}
{G} .music-pill .gel{{background:linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,0) 48%,rgba(0,0,0,.25)),radial-gradient(120% 100% at 50% 120%,#FF9EC7 0%,#FF5FA2 45%,#C8205A 100%)!important}}
{G} :is(.sidebar-nav a.active,.btn-primary,.gelbtn.on),{G} :is(.sidebar-nav a.active,.btn-primary,.gelbtn.on) *,{G} .music-pill .gel *{{color:#000!important;text-shadow:0 1px 0 rgba(255,255,255,.5)!important}}
/* tattoo type: chrome blackletter logo with pink glow */
{G} .brand-logo{{font-family:'Pirata One','Archivo Black',serif!important;font-weight:400!important;letter-spacing:.01em!important;background:{CHROME}!important;-webkit-background-clip:text!important;background-clip:text!important;-webkit-text-fill-color:transparent!important;color:transparent!important;filter:drop-shadow(0 0 1px #000) drop-shadow(0 0 6px rgba(255,95,162,.9)) drop-shadow(0 0 16px rgba(255,95,162,.5));-webkit-text-stroke:0!important;text-shadow:none!important}}
{G} .banner-title.brand-logo{{font-size:clamp(56px,9vw,104px)!important;line-height:1!important;padding:0 .08em .06em 0}}
{G} body .pg-h2,{G} body h2.section-title,{G} body h2:not(.pg-h2).section-title,{G} body .pg-hero h1{{font-family:'Pirata One',serif!important;font-weight:400!important;letter-spacing:.02em!important;text-shadow:0 0 8px rgba(255,95,162,.7)!important}}
{G} body h2:not(.pg-h2).section-title,{G} body h2.section-title{{font-size:2.1em!important;line-height:1.1!important;background:linear-gradient(180deg,#ffffff 0%,#ffd6e8 35%,#FF5FA2 55%,#ffd6e8 100%)!important;-webkit-background-clip:text!important;background-clip:text!important;-webkit-text-fill-color:transparent!important;color:transparent!important;text-shadow:none!important;filter:drop-shadow(0 0 1px #000) drop-shadow(0 0 6px rgba(255,95,162,.85))}}
{G} .draft{{background:#000!important;color:#FF5FA2!important;border:1px dashed #FF5FA2!important;box-shadow:none!important}}
/* product placeholders */
{G} .pp-ph.pat-dot,{G} .pp-ph.pat-plaid{{background:linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)),{LC} 0 0/120px!important}}
{G} .pp-ph.pat-leo,{G} .pp-ph.pat-aq{{background:linear-gradient(rgba(0,0,0,.6),rgba(0,0,0,.6)),{ST} 0 0/90px auto!important}}
{G} .pp-ph.pat-zeb{{background:#000!important}}
/* pixel hearts + crosses replace sparkles */
{G} .px-goth-skull,{G} .px-spark-pink{{display:none!important}}
{G} .px-g2-spark{{display:block!important}}
{G} .px-cloud-divider{{background:linear-gradient(180deg,#000,#1a0710)!important}}
{G} .px-cloud-divider .pxc{{filter:brightness(.2) sepia(1) hue-rotate(290deg) saturate(3);opacity:.7}}
/* mood swatch + tray */
.theme-btn[data-theme="goth2"]{{background:linear-gradient(135deg,transparent 49%,#FF5FA2 49% 51%,transparent 51%),{LC} 0 0/60px!important}}
{G} .theme-switcher-inline{{background:{ST} 0 0/90px auto!important}}
{G} .theme-btn.active{{outline:2px dashed #FF5FA2!important}}
{G} .hero-phone-sticker{{filter:grayscale(1) contrast(1.15) drop-shadow(0 0 10px #FF5FA2)}}
{G} .combo-mbar{{background:linear-gradient(rgba(0,0,0,.8),rgba(0,0,0,.8)),{ST} 0 0/90px auto!important;border-bottom:3px solid #FF5FA2!important}}
@media (max-width:768px){{
 {G} .page-wrapper{{border-width:14px!important}}
 {G} .banner,{G} .banner.pink-hero{{border-width:18px!important}}
 {G} .combo-win{{border-width:12px!important}}
 {G} .pg-hero{{border-width:14px!important}}
 {G} .banner-title.brand-logo{{font-size:58px!important}}
 {G} .page-layout>.sidebar{{border-right:0!important;border-left:14px solid transparent!important}}
}}
"""
open('css/goth2.css','w').write(src+o)
print('ok')
