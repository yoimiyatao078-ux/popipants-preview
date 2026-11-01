# Generates product.html, wishlist.html, cart.html from the 404.html shell, and wires shared scripts into every page.
import re,glob
shell=open('404.html').read()
head_end=shell.index('<style>'); 
def page(fname,title,desc,body):
    h=shell[:head_end].replace('<title>Page not found — Popipants</title>','<title>%s</title>\n  <meta name="description" content="%s">'%(title,desc))
    h+='</head>\n'
    b=shell[shell.index('<body'):]
    a=b.index('<section'); z=b.index('<script src="js/layout.js?v=" data-part="footer"')
    b=b[:a]+body+'\n        '+b[z:]
    b=b.replace("""  <script>(function(){var c=window.popipantsMakeCat&&window.popipantsMakeCat();if(c)document.getElementById('nf-cat').appendChild(c);})();</script>\n""","")
    open(fname,'w').write(h+b)
def hero(name,sub,spr,pat,btns=''):
    return ('<section class="content-section pg-hero-wrap"><div class="combo-win"><div class="combo-tb"><i></i><i></i><i></i><span>%s.exe</span></div><div class="combo-wb"><div class="pg-hero pat-%s"><div><h1 class="brand-logo pg-title">%s</h1><p class="pg-sub">%s</p><div class="pg-btns">%s</div></div><div class="pg-art"><i data-spr="%s" data-scale="11"></i><i class="pg-f1" data-spr="heart" data-scale="4"></i><i class="pg-f2" data-spr="star" data-scale="4"></i></div></div></div></div></section>'%(name,pat,name,sub,btns,spr))
page('product.html','Piece — Popipants (sample)','A one-of-one piece from popipants: photos, sizes and measurements. Sample listing.',
 '<section class="content-section pg-sec sx-pp"><p class="sx-sample-note">sample listing · real photos, sizes and prices coming soon</p><div id="product-root"><noscript>turn on javascript to see this piece.</noscript></div></section>')
page('wishlist.html','Wishlist — Popipants','Pieces you saved with the little heart. Saved in this browser only.',
 hero('wishlist','pieces you hearted ♡ saved in this browser only','heart','dot','<a class="btn btn-primary" href="collection.html">keep browsing ♡</a>')+
 '<section class="content-section pg-sec"><span class="section-tag">01 / SAVED</span><h2 class="pg-h2">your hearts</h2><div class="pp-grid" id="wish-grid" data-manual></div><p class="sx-empty" id="wish-empty" hidden>no hearts yet — tap the little heart on any piece to save it here.</p></section>')
page('cart.html','Bag — Popipants','Your popipants bag. Checkout is coming soon.',
 hero('bag','checkout is still being sewn ♡','bag','plaid','<a class="btn btn-primary" href="collection.html">keep shopping ♡</a>')+
 '<section class="content-section pg-sec"><span class="section-tag">01 / YOUR BAG</span><h2 class="pg-h2">in your bag</h2><div class="pg-two sx-cartwrap"><div class="combo-win"><div class="combo-tb"><i></i><i></i><i></i><span>popi-bag.exe</span></div><div class="combo-wb"><div id="cart-root"></div></div></div>'
 '<div class="combo-win"><div class="combo-tb"><i></i><i></i><i></i><span>checkout.exe</span></div><div class="combo-wb sx-soon"><p class="sx-soon-t">checkout coming soon</p><p>online checkout opens with the first real drop. until then every piece is sold through tise.</p><p class="pg-btns"><a class="btn btn-primary" href="https://tise.com/popipants" target="_blank" rel="noopener">buy on tise ↗</a><a class="btn btn-secondary" href="contact.html?order=1">ask about my bag</a></p><div data-drop-alert="checkout" data-title="tell me when checkout opens"></div></div></div></div></section>')
for f in glob.glob('*.html'):
    if f in ('palette-a.html','palette-b.html'): continue
    t=open(f).read()
    if 'js/combo.js' not in t: continue
    if 'js/products.js' not in t:
        t=t.replace('<script src="js/music.js','<script src="js/config.js?v="></script>\n  <script src="js/products.js?v="></script>\n  <script src="js/music.js',1)
    if 'js/shop.js' not in t:
        t=re.sub(r'(<script src="js/combo\.js\?v=[0-9]*"></script>)',r'\1\n  <script src="js/shop.js?v="></script>',t,count=1)
    if 'css/shop.css' not in t:
        t=re.sub(r'(<link rel="stylesheet" href="css/blue2\.css\?v=[0-9]*">)',r'\1\n  <link rel="stylesheet" href="css/shop.css?v=">',t,count=1)
    open(f,'w').write(t)
