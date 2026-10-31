/* popipants pixel fx: music cat perched on music buttons + pixel add-to-bag hop. Original pixel art. */
(function(){
  var P={k:'#FF5FA2',b:'#FFD6E8',w:'#ffffff',a:'#A8A8B8'};
  function draw(rows){var h=rows.length,w=rows[0].length,c=document.createElement('canvas');c.width=w;c.height=h;var x=c.getContext('2d');
    rows.forEach(function(r,j){for(var i=0;i<r.length;i++){var col=P[r[i]];if(col){x.fillStyle=col;x.fillRect(i,j,1,1);}}});return c;}
  function mir(a){return a.map(function(l){return l+l.split('').reverse().join('');});}
  var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- music cat (22x18, head 11 + body 7) ---------- */
  var HEAD=mir(['.kk.......','kbbk......','kbkbkkkkkk','kbbbbbbbbb','kbbkkkkkkk','kbkwwwwwww','kbkwwkkwww','aaawwkkwww','kaaawwwwww','kbkwwbbwwk','.kkkkkkkkk']).map(function(l){return '.'+l+'.';});
  HEAD=HEAD.map(function(s){return s.split('');});[[1,15,'k'],[2,14,'k'],[2,15,'w'],[2,16,'k'],[3,15,'k']].forEach(function(p){HEAD[p[0]][p[1]]=p[2];});HEAD=HEAD.map(function(a){return a.join('');});
  var BODY=mir(['..kbbbbbbb','.kbbbwwwww','.kbbwwwwww','.kbbwwwwww','.kbbwwwwww','.kbbkwwwwk','.kkkkkkkkk']).map(function(l){return '.'+l+'.';});
  var TAIL=['..kk','.kbk','kbk.','kbk.','.kk.'].map(function(l){return '..................'+l;});
  function makeCat(){var cat=document.createElement('span');cat.className='px-cat';cat.setAttribute('aria-hidden','true');
    var t=draw(TAIL);t.className='px-tail';var b=draw(BODY);b.className='px-body';var h=draw(HEAD);h.className='px-head';
    cat.append(t,b,h);return cat;}
  function perch(btn){if(btn.querySelector('.px-cat'))return;btn.classList.add('has-px-cat');btn.appendChild(makeCat());}
  function sync(){var on=!!(window.popipantsMusic&&window.popipantsMusic.isPlaying());
    document.querySelectorAll('.has-px-cat').forEach(function(b){b.classList.toggle('px-cat-on',on||b.classList.contains('is-playing'));});}
  function initCat(){document.querySelectorAll('#music-toggle, .music-cd-toggle').forEach(function(b){perch(b);
      new MutationObserver(sync).observe(b,{attributes:true,attributeFilter:['class','aria-pressed']});});sync();}

  /* ---------- pixel add-to-bag ---------- */
  var CART=['k.........','kk........','.kkkkkkkkk','.kbbbbbbbk','.kbkbkbkbk','.kbbbbbbbk','..kkkkkkk.','..k....k..','.kkk..kkk.','..k....k..'];
  var ITEM=['.k...k.','kkkkkkk','kwkkkwk','.kkkkk.','.kkwkk.','.kkkkk.','.kkkkk.'];
  var SPARK=['..k..','..w..','kwwwk','..w..','..k..'];
  var HEART=['.kk.kk.','kwkkkkk','kkkkkkk','.kkkkk.','..kkk..','...k...'];
  function cv(rows,cls){var c=draw(rows);c.className=cls;return c;}
  function cartFx(btn){var r=btn.getBoundingClientRect();var fx=document.createElement('span');fx.className='px-cartfx'+(RM?' rm':'');fx.setAttribute('aria-hidden','true');
    fx.style.left=(r.left+r.width/2+scrollX)+'px';fx.style.top=(r.top+scrollY)+'px';
    fx.append(cv(CART,'px-cart'),cv(ITEM,'px-item'),cv(SPARK,'px-sp s1'),cv(SPARK,'px-sp s2'),cv(SPARK,'px-sp s3'));
    document.body.appendChild(fx);setTimeout(function(){fx.remove();},RM?600:950);
    setTimeout(function(){var bc=[].slice.call(document.querySelectorAll('.px-bagbtn .bag-count')).filter(function(n){return n.offsetParent;})[0];if(!bc)return;var br=bc.getBoundingClientRect();
      var p=document.createElement('span');p.className='px-plus'+(RM?' rm':'');p.setAttribute('aria-hidden','true');p.append(cv(HEART,'px-heart'));
      var t=document.createElement('b');t.textContent='+1';p.append(t);p.style.left=(br.left+br.width/2)+'px';p.style.top=br.top+'px';
      document.body.appendChild(p);bc.classList.remove('px-pop');void bc.offsetWidth;bc.classList.add('px-pop');setTimeout(function(){p.remove();},800);},RM?0:420);}

  /* shop cards: add-to-bag gel button + floating pixel bag counter (shares popipants-bag with contact prefill) */
  var KEY='popipants-bag';function getBag(){try{return JSON.parse(localStorage.getItem(KEY))||[];}catch(e){return [];}}
  /* bag: visual-only design for now (no checkout). Items kept in localStorage 'popipants-bag'. */
  var KEY='popipants-bag';function getBag(){try{return JSON.parse(localStorage.getItem(KEY))||[];}catch(e){return [];}}
  function setBag(b){try{localStorage.setItem(KEY,JSON.stringify(b));}catch(e){}cnt();}
  function cnt(){var c=getBag().length;document.querySelectorAll('.px-bagbtn .bag-count').forEach(function(n){n.textContent=c||'';n.hidden=!c;});}
  function openBag(){var old=document.querySelector('.bag-overlay');if(old)old.remove();
    var ret=document.activeElement,ov=document.createElement('div');ov.className='pc-popup-overlay bag-overlay'+(RM?' rm':'');
    var bag=getBag();
    var list=bag.length?bag.map(function(it,i){return '<li><span class="bag-thumb">'+(it.thumb?'<img src="'+it.thumb+'" alt="">':'')+'</span><span class="bag-info"><b>'+it.name+'</b><small>size · price coming soon</small></span><button type="button" class="bag-rm" data-i="'+i+'" aria-label="Remove '+it.name+'">✕</button></li>';}).join(''):'<li class="bag-empty">your bag is empty ♡</li>';
    ov.innerHTML='<div class="pc-popup bag-popup" role="dialog" aria-modal="true" aria-label="Your bag"><div class="pc-popup-titlebar"><span>popi-bag.exe</span><button type="button" class="close-btn" aria-label="Close">X</button></div>'+
      '<div class="pc-popup-body"><ul class="bag-list">'+list+'</ul><p class="bag-note">✿ the shop is still being sewn — checkout opens soon</p><button type="button" class="bag-checkout" disabled>checkout coming soon ♡</button></div></div>';
    document.body.appendChild(ov);
    function close(){ov.remove();removeEventListener('keydown',key);if(ret&&ret.focus)ret.focus();}
    function key(e){if(e.key==='Escape')close();}addEventListener('keydown',key);
    ov.addEventListener('click',function(e){if(e.target===ov||e.target.closest('.close-btn')){close();return;}var r=e.target.closest('.bag-rm');if(r){var b=getBag();b.splice(+r.dataset.i,1);setBag(b);openBag();}});
    ov.querySelector('.close-btn').focus();}
  function bagButton(){var b=document.createElement('button');b.type='button';b.className='px-bagbtn';b.setAttribute('aria-label','Open bag');
    b.append(cv(CART,'px-dockcart'));var n=document.createElement('b');n.className='bag-count';b.append(n);b.addEventListener('click',openBag);return b;}
  function initShop(){
    var nav=document.querySelector('.main-content>.top-nav'),mbar=document.querySelector('.combo-mbar');
    if(nav&&!nav.querySelector('.px-bagbtn'))nav.appendChild(bagButton());
    if(mbar&&!mbar.querySelector('.px-bagbtn')){var m=mbar.querySelector('.combo-menu');mbar.insertBefore(bagButton(),m);}
    cnt();
    document.querySelectorAll('.pp-grid .pp-card').forEach(function(cd){if(cd.parentNode.classList.contains('pp-cell'))return;var cell=document.createElement('div');cell.className='pp-cell';cd.parentNode.insertBefore(cell,cd);cell.appendChild(cd);
      var b=document.createElement('button');b.type='button';b.className='px-addbtn';b.innerHTML='<span>add to bag ♡</span>';cell.appendChild(b);
      b.addEventListener('click',function(){var c=cd.querySelector('canvas'),th='';try{th=c?c.toDataURL():'';}catch(e){}
        var bag=getBag();bag.push({name:(cd.querySelector('h3')||{}).textContent||'item',thumb:th});setBag(bag);
        cartFx(b);var sp=b.querySelector('span');sp.textContent='added ✓';setTimeout(function(){sp.textContent='add to bag ♡';},1200);
        setTimeout(openBag,RM?100:950);});});}
  /* phone home: hero → first 2 products → pixel cloud divider → music → rest. Cards are moved, never duplicated. */
  var CLOUD=['......wwww..........','....wwwwwwww........','..wwwwwwwwwwww..ww..','.wwwwwwwwwwwwwwwwwww','wwwwwwwwwwwwwwwwwwww','bbwwwwwwwwwwwwwwwwbb','.bbbbbbbbbbbbbbbbbb.'];
  var SPK=['.k.','kwk','.k.'];
  function cloudDivider(){var d=document.createElement('div');d.className='px-cloud-divider';d.setAttribute('aria-hidden','true');
    [[4,8,4],[30,22,3],[62,4,4],[86,26,3]].forEach(function(c){var e=cv(CLOUD,'pxc');e.style.cssText='left:'+c[0]+'%;top:'+c[1]+'px;width:'+(20*c[2])+'px;height:'+(7*c[2])+'px';d.appendChild(e);});
    [[22,10],[52,40],[78,6],[95,52],[12,54]].forEach(function(s){var e=cv(SPK,'pxs2');e.style.cssText='left:'+s[0]+'%;top:'+s[1]+'px';d.appendChild(e);});return d;}
  function initPhoneHome(){var main=document.querySelector('.home-page .main-content'),drop=main&&main.querySelector('.drop-section'),cd=main&&main.querySelector('.cd-section'),grid=drop&&drop.querySelector('.pp-grid');if(!grid||!cd)return;
    var teaser=document.createElement('section');teaser.className='content-section px-teaser';teaser.innerHTML='<h2 class="pg-h2 px-teaser-title">sneak peek ♡</h2><div class="pp-grid px-teaser-grid"></div><a class="px-teaser-link" href="collection.html">see the whole shop ♡</a>';
    var cloud=cloudDivider();main.insertBefore(teaser,drop);main.insertBefore(cloud,cd);
    var tg=teaser.querySelector('.pp-grid'),mq=matchMedia('(max-width:768px)'),moved=[];
    function apply(){if(mq.matches&&!moved.length){moved=[].slice.call(grid.children,0,2);moved.forEach(function(c){tg.appendChild(c);});}
      else if(!mq.matches&&moved.length){for(var i=moved.length-1;i>=0;i--)grid.insertBefore(moved[i],grid.firstChild);moved=[];}}
    apply();mq.addEventListener?mq.addEventListener('change',apply):mq.addListener(apply);}
  /* inner pages: pixel cloud divider above the footer + a few pixel sparkles on the page hero */
  function initInner(){if(!document.body.classList.contains('secondary-page'))return;
    var f=document.querySelector('.main-content>.footer');if(f&&!document.querySelector('.px-cloud-inner')){var d=cloudDivider();d.classList.add('px-cloud-inner');f.parentNode.insertBefore(d,f);}
    var h=document.querySelector('.pg-hero');if(h&&!h.querySelector('.px-hero-spk')){[[46,14],[58,70],[38,84]].forEach(function(q,i){var e=cv(SPK,'px-hero-spk s'+i);e.style.cssText='left:'+q[0]+'%;top:'+q[1]+'%';h.appendChild(e);});}}
  function init(){initCat();initShop();initPhoneHome();initInner();}
  window.popipantsMakeCat=makeCat;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  window.popipantsPixelFx={cartFx:cartFx};
})();
