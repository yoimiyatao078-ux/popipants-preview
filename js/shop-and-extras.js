/* Popipants extras: shop filters + bag, contact prefill.
   Pin pictures live in images/inspo/. */
(function(){
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const page=(location.pathname.split('/').pop()||'index.html').replace('.html','')||'index';

  /* ---------- SHOP ---------- */
  const cards=$$('.products-grid .product-card');
  if(cards.length){
    const grid=$('.products-grid');
    const cats=[['all','✦ all'],['tees','♡ tees'],['hoodies','☁ hoodies'],['accessories','✿ accessories'],['limited','★ limited']];
    const bar=document.createElement('div'); bar.className='shop-filters'; bar.setAttribute('role','toolbar'); bar.setAttribute('aria-label','Filter products');
    bar.style.cssText='display:flex;gap:8px;flex-wrap:wrap;margin:0 0 16px';
    bar.innerHTML=cats.map(([k,l])=>`<button type="button" class="btn-aero" data-cat="${k}" aria-pressed="false">${l}</button>`).join('');
    grid.parentNode.insertBefore(bar,grid);
    const setCat=c=>{ cards.forEach(cd=>cd.classList.toggle('is-hidden',c!=='all'&&cd.dataset.category!==c));
      $$('button',bar).forEach(b=>{const on=b.dataset.cat===c;b.setAttribute('aria-pressed',on);b.style.opacity=on?1:.7;}); };
    bar.addEventListener('click',e=>{const b=e.target.closest('button'); if(b) setCat(b.dataset.cat);});
    setCat(new URLSearchParams(location.search).get('cat')||'all');

    const KEY='popipants-bag'; let bag=[]; try{bag=JSON.parse(localStorage.getItem(KEY))||[];}catch(e){}
    const win=document.createElement('div'); win.className='bag-window is-collapsed';
    win.innerHTML='<div class="win-titlebar"><span>♡ my_bag.exe <span class="bag-count">0</span></span><button type="button" class="bag-toggle" aria-label="Open bag" style="background:none;border:0;color:#fff;cursor:pointer">▴</button></div><ul></ul><div class="bag-foot"><b class="bag-total"></b><a class="btn-aero" href="contact.html?order=1">order ♡</a></div>';
    document.body.appendChild(win);
    const render=()=>{ $('.bag-count',win).textContent=bag.length;
      $('ul',win).innerHTML=bag.length?bag.map((it,i)=>`<li><span>${it.name}</span><span>${it.price} <button type="button" data-i="${i}" aria-label="Remove">✕</button></span></li>`).join(''):'<li>your bag is empty ♡</li>';
      const tot=bag.reduce((s,it)=>s+(parseInt(it.price.replace(/\D/g,''))||0),0); $('.bag-total',win).textContent='NOK '+tot;
      try{localStorage.setItem(KEY,JSON.stringify(bag));}catch(e){} };
    win.addEventListener('click',e=>{ if(e.target.closest('.bag-toggle')||e.target.closest('.win-titlebar')&&!e.target.closest('[data-i]')) win.classList.toggle('is-collapsed');
      const r=e.target.closest('[data-i]'); if(r){bag.splice(+r.dataset.i,1);render();} });
    cards.forEach(cd=>{ const info=$('.product-info',cd)||cd; const b=document.createElement('button'); b.type='button'; b.className='btn-aero'; b.textContent='add to bag ♡';
      b.addEventListener('click',()=>{ bag.push({name:$('.product-name',cd).textContent.trim(),price:($('.product-price',cd)||{}).textContent||''}); render(); win.classList.remove('is-collapsed');
        b.textContent='added ✓'; setTimeout(()=>b.textContent='add to bag ♡',1200); });
      info.appendChild(b); });
    render();
  }

  /* contact: prefill from bag */
  const msg=$('#contactForm textarea');
  if(msg && new URLSearchParams(location.search).get('order')){
    try{ const bag=JSON.parse(localStorage.getItem('popipants-bag'))||[]; if(bag.length) msg.value='Hi! I would like to order:\n'+bag.map(i=>'- '+i.name+' ('+i.price+')').join('\n')+'\n\nSize: \nShipping to: '; }catch(e){}
  }

})();
