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
    setTimeout(function(){var bc=document.querySelector('.bag-count');if(!bc)return;var br=bc.getBoundingClientRect();
      var p=document.createElement('span');p.className='px-plus'+(RM?' rm':'');p.setAttribute('aria-hidden','true');p.append(cv(HEART,'px-heart'));
      var t=document.createElement('b');t.textContent='+1';p.append(t);p.style.left=(br.left+br.width/2)+'px';p.style.top=br.top+'px';
      document.body.appendChild(p);bc.classList.remove('px-pop');void bc.offsetWidth;bc.classList.add('px-pop');setTimeout(function(){p.remove();},800);},RM?0:420);}

  /* shop cards: add-to-bag gel button + floating pixel bag counter (shares popipants-bag with contact prefill) */
  var KEY='popipants-bag';function getBag(){try{return JSON.parse(localStorage.getItem(KEY))||[];}catch(e){return [];}}
  function initShop(){var cards=document.querySelectorAll('.pp-grid .pp-card');if(!cards.length)return;
    var dock=document.querySelector('.px-bagdock');if(!dock){dock=document.createElement('a');dock.className='px-bagdock';dock.href='contact.html?order=1';dock.setAttribute('aria-label','My bag');
      dock.append(cv(CART,'px-dockcart'));var n=document.createElement('b');n.className='bag-count';dock.append(n);document.body.appendChild(dock);}
    var cnt=function(){var c=getBag().length;dock.querySelector('.bag-count').textContent=c;dock.classList.toggle('has-items',c>0);};cnt();
    cards.forEach(function(cd){if(cd.parentNode.classList.contains('pp-cell'))return;var cell=document.createElement('div');cell.className='pp-cell';cd.parentNode.insertBefore(cell,cd);cell.appendChild(cd);
      var b=document.createElement('button');b.type='button';b.className='px-addbtn';b.innerHTML='<span>add to bag ♡</span>';cell.appendChild(b);
      b.addEventListener('click',function(){var bag=getBag();bag.push({name:(cd.querySelector('h3')||{}).textContent||'item',price:''});try{localStorage.setItem(KEY,JSON.stringify(bag));}catch(e){}
        cartFx(b);setTimeout(cnt,RM?0:420);var sp=b.querySelector('span');sp.textContent='added ✓';setTimeout(function(){sp.textContent='add to bag ♡';},1200);});});}
  function init(){initCat();initShop();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  window.popipantsPixelFx={cartFx:cartFx};
})();
