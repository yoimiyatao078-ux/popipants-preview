/* popipants shop features: wishlist, product page, shop filters, size guide, drop alerts,
   contact form, lookbook lightbox, cart page. All data is SAMPLE data (js/products.js).
   Nothing is sent anywhere unless a provider is configured in js/config.js. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var P = window.POPI_PRODUCTS || [], CFG = window.POPI_CONFIG || {};
  var byId = function (id) { for (var i = 0; i < P.length; i++) if (P[i].id === id) return P[i]; return null; };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var page = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '') || 'index';
  var qs = new URLSearchParams(location.search);

  /* ---------- small pixel heart (svg, currentColor) ---------- */
  var HEART = ['.kk.kk.', 'kkkkkkk', 'kkkkkkk', '.kkkkk.', '..kkk..', '...k...'];
  var HEART_O = ['.kk.kk.', 'k..k..k', 'k.....k', '.k...k.', '..k.k..', '...k...'];
  function heartSvg(filled) {
    var r = filled ? HEART : HEART_O, d = '';
    r.forEach(function (row, y) { for (var x = 0; x < row.length; x++) if (row[x] === 'k') d += 'M' + x + ' ' + y + 'h1v1h-1z'; });
    return '<svg viewBox="0 0 7 6" width="21" height="18" aria-hidden="true" focusable="false" shape-rendering="crispEdges"><path fill="currentColor" d="' + d + '"/></svg>';
  }

  /* ---------- popup window (uses the site's pc-popup look) ---------- */
  function popup(title, bodyHTML, opts) {
    opts = opts || {};
    var ret = document.activeElement, ov = document.createElement('div');
    ov.className = 'pc-popup-overlay sx-overlay ' + (opts.cls || '');
    ov.innerHTML = '<div class="pc-popup sx-popup" role="dialog" aria-modal="true" aria-label="' + esc(opts.label || title) + '">' +
      '<div class="pc-popup-titlebar"><span>' + esc(title) + '</span><button type="button" class="close-btn" aria-label="Close">X</button></div>' +
      '<div class="pc-popup-body">' + bodyHTML + '</div></div>';
    document.body.appendChild(ov);
    function focusables() { return $$('a[href],button:not([disabled]),input,select,textarea,[tabindex="0"]', ov).filter(function (e) { return e.offsetParent !== null; }); }
    function key(e) {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') { var f = focusables(), a = f[0], z = f[f.length - 1]; if (!f.length) return;
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
    }
    function close() { ov.remove(); document.removeEventListener('keydown', key); if (ret && ret.focus) ret.focus(); }
    document.addEventListener('keydown', key);
    ov.addEventListener('click', function (e) { if (e.target === ov || e.target.closest('.close-btn,[data-close]')) close(); });
    setTimeout(function () { var f = $(opts.focus || '.close-btn', ov); if (f) f.focus(); }, 30);
    return { el: ov, close: close };
  }

  /* ---------- 6. size guide ---------- */
  var GUIDE = [['XS', 76, 60, 84, 'XS'], ['S', 82, 66, 90, 'S'], ['M', 88, 72, 96, 'M'], ['L', 96, 80, 104, 'L']];
  function sizeGuide() {
    popup('size_guide.txt',
      '<p class="sx-example">EXAMPLE measurements — real ones coming soon</p>' +
      '<table class="sx-table"><caption class="sx-vh">example body measurements in cm</caption><thead><tr><th scope="col">size</th><th scope="col">bust</th><th scope="col">waist</th><th scope="col">hips</th></tr></thead><tbody>' +
      GUIDE.map(function (g) { return '<tr><th scope="row">' + g[0] + '</th><td>' + g[1] + '</td><td>' + g[2] + '</td><td>' + g[3] + '</td></tr>'; }).join('') +
      '</tbody></table><ul class="sx-tips"><li>measure flat, armpit to armpit, then double it</li><li>each piece also lists its own measurements</li><li>not sure? just ask me</li></ul>' +
      '<p class="sx-center"><button type="button" class="btn btn-primary" data-close><span>got it ♡</span></button></p>',
      { label: 'Size guide (example measurements)', cls: 'sx-guide' });
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-size-guide], a[href="#size-guide"]');
    if (!t) return; e.preventDefault(); sizeGuide();
  });

  /* ---------- 5. drop alerts / newsletter ---------- */
  var EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function subscribe(email, source) {
    if (window.popiSubscribe) return window.popiSubscribe(email, source);
    return Promise.resolve({ redirecting: false, unavailable: true });
  }
  function alertForm(source, title) {
    var id = 'da-' + Math.random().toString(36).slice(2, 7);
    var note = window.popiSignupNote ? popiSignupNote() : 'Signup isn\'t available yet. Your email is not saved.';
    return '<form class="sx-alert" data-source="' + esc(source) + '" novalidate>' +
      '<p class="sx-alert-t">' + esc(title || 'get a drop alert') + '</p>' +
      '<p class="sx-note" id="' + id + '-note">' + esc(note) + '</p>' +
      '<label for="' + id + '">your email</label><div class="sx-row"><input id="' + id + '" type="email" name="email" autocomplete="email" placeholder="angel@email.com" required aria-describedby="' + id + '-note ' + id + '-msg">' +
      '<button type="submit" class="btn btn-primary"><span>notify me ♡</span></button></div>' +
      '<p class="sx-msg" id="' + id + '-msg" role="status" aria-live="polite"></p></form>';
  }
  document.addEventListener('submit', function (e) {
    var f = e.target.closest('.sx-alert'); if (!f) return; e.preventDefault();
    var inp = $('input[type=email]', f), msg = $('.sx-msg', f), btn = $('button[type=submit]', f), v = inp.value.trim();
    if (!EMAIL_OK.test(v)) { msg.textContent = 'that email looks a little off — try again?'; inp.setAttribute('aria-invalid', 'true'); inp.focus(); return; }
    inp.removeAttribute('aria-invalid');
    btn.disabled = true;
    subscribe(v, f.dataset.source).then(function (r) {
      if (r && r.redirecting) {
        msg.textContent = window.popiSignupGo || 'Opening Buttondown to finish signup.';
        setTimeout(function () { btn.disabled = false; }, 2000);
        return;
      }
      btn.disabled = false;
      msg.textContent = window.popiSignupNote ? popiSignupNote() : 'Signup isn\'t available yet. Your email is not saved.';
    }, function () {
      btn.disabled = false;
      msg.textContent = 'The mailing list didn’t open. Nothing was saved — try again.';
    });
  });

  /* ---------- 4. wishlist ---------- */
  var WKEY = 'popipants-wish';
  function wish() { try { return JSON.parse(localStorage.getItem(WKEY)) || []; } catch (e) { return []; } }
  function setWish(w) { try { localStorage.setItem(WKEY, JSON.stringify(w)); } catch (e) {} paintWish(); }
  function toggleWish(id) { var w = wish(), i = w.indexOf(id); if (i < 0) w.push(id); else w.splice(i, 1); setWish(w); return i < 0; }
  function paintWish() {
    var w = wish();
    $$('.sx-wish').forEach(function (b) {
      var on = w.indexOf(b.dataset.id) >= 0, pr = byId(b.dataset.id);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.setAttribute('aria-label', (on ? 'Remove ' : 'Save ') + (pr ? pr.name : 'item') + (on ? ' from wishlist' : ' to wishlist'));
      b.innerHTML = heartSvg(on) + (b.dataset.label ? '<span>' + (on ? 'saved' : 'save') + '</span>' : '');
    });
    $$('.sx-wcount').forEach(function (n) { n.textContent = w.length ? '(' + w.length + ')' : ''; });
  }
  function wishBtn(id, label) { var b = document.createElement('button'); b.type = 'button'; b.className = 'sx-wish' + (label ? ' sx-wish-l' : ''); b.dataset.id = id; if (label) b.dataset.label = '1'; return b; }
  function addHearts() {
    $$('.pp-cell').forEach(function (cell) {
      var cd = $('.pp-card', cell); if (!cd || !cd.dataset.id || $('.sx-wish', cell)) return;
      cell.classList.add('sx-has-wish'); cell.appendChild(wishBtn(cd.dataset.id));
    });
    placeHearts(); paintWish();
  }
  // heart sits on the bottom-right corner of the photo (clear of the "sample item" tag)
  function placeHearts() {
    $$('.pp-cell.sx-has-wish').forEach(function (cell) {
      var ph = $('.pp-ph', cell), b = $('.sx-wish', cell); if (!ph || !b) return;
      b.style.top = Math.max(0, ph.offsetTop + ph.offsetHeight - 40) + 'px';
      b.style.left = Math.max(0, ph.offsetLeft + ph.offsetWidth - 42) + 'px'; b.style.right = 'auto';
    });
  }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(placeHearts, 120); });
  addEventListener('load', placeHearts);
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.sx-wish'); if (!b) return; e.preventDefault(); e.stopPropagation();
    var on = toggleWish(b.dataset.id);
    if (on && !RM) { b.classList.remove('sx-pop'); void b.offsetWidth; b.classList.add('sx-pop'); }
    if (page === 'wishlist' && !on) renderWishlist();
  });
  addEventListener('storage', function (e) { if (e.key === WKEY) paintWish(); });

  /* ---------- 2. shop filters + sorting ---------- */
  function initFilters() {
    var chips = $('.pp-chips'), grid = chips && $('.pp-grid', chips.parentNode);
    if (!chips || !grid) return;
    var cats = ['all', 'tops', 'bottoms', 'bags'];
    var start = qs.get('cat'); if (cats.indexOf(start) < 0) start = 'all';
    chips.className = 'pp-chips sx-filters';
    chips.setAttribute('role', 'group'); chips.setAttribute('aria-label', 'Filter and sort pieces');
    chips.innerHTML =
      '<div class="sx-cats" role="group" aria-label="Category">' + cats.map(function (c) { return '<button type="button" class="gelbtn' + (c === start ? ' on' : '') + '" data-c="' + c + '" aria-pressed="' + (c === start) + '"><span>' + c + '</span></button>'; }).join('') + '</div>' +
      '<div class="sx-selects">' +
      '<label>size<select data-f="size"><option value="">any</option>' + window.POPI_SIZES.map(function (s) { return '<option>' + s + '</option>'; }).join('') + '</select></label>' +
      '<label>price<select data-f="price"><option value="">any</option><option value="0-199">under 200</option><option value="200-299">200 – 299</option><option value="300-9999">300 +</option></select></label>' +
      '<label>sort<select data-f="sort"><option value="">newest</option><option value="lo">price: low → high</option><option value="hi">price: high → low</option><option value="az">name a → z</option></select></label>' +
      '<label class="sx-check"><input type="checkbox" data-f="avail"> hide sold out</label></div>' +
      '<p class="sx-count" role="status" aria-live="polite"></p>';
    var st = { c: start, size: '', price: '', sort: '', avail: false };
    var empty = document.createElement('p'); empty.className = 'sx-empty'; empty.hidden = true; empty.textContent = 'no pieces match — try another size or price ♡'; grid.after(empty);
    function apply() {
      var cells = $$('.pp-cell', grid); if (!cells.length) cells = $$('.pp-card', grid);
      var shown = 0;
      cells.forEach(function (cell) {
        var cd = cell.classList.contains('pp-card') ? cell : $('.pp-card', cell), pr = byId(cd.dataset.id); if (!pr) return;
        var ok = (st.c === 'all' || pr.cat === st.c) && (!st.size || pr.sizes[st.size] > 0) && (!st.avail || !pr.soldOut);
        if (ok && st.price) { var r = st.price.split('-'); ok = pr.price >= +r[0] && pr.price <= +r[1]; }
        cell.hidden = !ok; cell.style.display = ok ? '' : 'none'; if (ok) shown++;
      });
      var order = cells.slice();
      if (st.sort) order.sort(function (a, b) {
        var pa = byId(($('.pp-card', a) || a).dataset.id), pb = byId(($('.pp-card', b) || b).dataset.id);
        return st.sort === 'lo' ? pa.price - pb.price : st.sort === 'hi' ? pb.price - pa.price : pa.name.localeCompare(pb.name);
      });
      else order.sort(function (a, b) { return P.indexOf(byId(($('.pp-card', a) || a).dataset.id)) - P.indexOf(byId(($('.pp-card', b) || b).dataset.id)); });
      order.forEach(function (c) { grid.appendChild(c); });
      $('.sx-count', chips).textContent = shown + (shown === 1 ? ' piece' : ' pieces') + ' · sample data';
      empty.hidden = shown > 0; placeHearts();
    }
    chips.addEventListener('click', function (e) {
      var b = e.target.closest('[data-c]'); if (!b) return;
      st.c = b.dataset.c; $$('[data-c]', chips).forEach(function (x) { var on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
      apply(); placeHearts();
    });
    chips.addEventListener('change', function (e) { var f = e.target.dataset.f; if (!f) return; st[f] = e.target.type === 'checkbox' ? e.target.checked : e.target.value; apply(); });
    apply();
  }

  /* ---------- 1. product page ---------- */
  function renderProduct() {
    var root = $('#product-root'); if (!root) return;
    var pr = byId(qs.get('id')) || P[0];
    document.title = pr.name + ' — popipants (sample)';
    var can = document.querySelector('link[rel=canonical]'); if (can) can.href = 'https://popipants.com/product.html?id=' + encodeURIComponent(pr.id);
    var md = document.querySelector('meta[name=description]'); if (md) md.content = pr.name + ' from popipants: ' + pr.desc + ' Sizes, measurements and photos.';
    var sizes = Object.keys(pr.sizes), firstFree = sizes.filter(function (s) { return pr.sizes[s] > 0; })[0];
    var views = [['front', ''], ['back', 'sx-flip'], ['detail', 'sx-zoom']];
    var mrows = Object.keys(pr.m).map(function (k) { return '<tr><th scope="row">' + k + '</th><td>' + pr.m[k] + ' cm</td></tr>'; }).join('');
    root.innerHTML =
      '<nav class="sx-crumbs" aria-label="Breadcrumb"><a href="collection.html">shop</a> <span aria-hidden="true">›</span> <span aria-current="page">' + esc(pr.name) + '</span></nav>' +
      '<div class="sx-product">' +
       '<div class="sx-gallery">' +
        '<div class="sx-main pp-ph pat-' + pr.pat + '" role="img" aria-label="' + esc(pr.name) + ', front view (sample placeholder)"><span class="pp-tag">sample photo</span>' + (pr.soldOut ? '<span class="sx-sold">sold out</span>' : '') + '</div>' +
        '<div class="sx-thumbs" role="group" aria-label="Photos">' + views.map(function (v, i) { return '<button type="button" class="sx-thumb pp-ph pat-' + pr.pat + (i ? '' : ' on') + '" data-v="' + i + '" aria-label="Show ' + v[0] + ' view" aria-pressed="' + (i ? 'false' : 'true') + '"></button>'; }).join('') + '</div>' +
       '</div>' +
       '<div class="sx-info">' +
        '<p class="section-tag">' + esc(pr.cat) + ' · sample item</p>' +
        '<h1 class="pg-h2 sx-name">' + esc(pr.name) + '</h1>' +
        '<p class="sx-price">NOK ' + pr.price + ' <small>example price</small></p>' +
        '<p class="sx-desc">' + esc(pr.desc) + ' one of one, hand-picked and remade.</p>' +
        '<fieldset class="sx-sizes"><legend>size</legend>' + sizes.map(function (s) {
          var out = !(pr.sizes[s] > 0);
          return '<label class="sx-size' + (out ? ' is-out' : '') + '"><input type="radio" name="size" value="' + esc(s) + '"' + (out ? ' disabled' : '') + (s === firstFree ? ' checked' : '') + '><span>' + esc(s) + (out ? ' <small>sold</small>' : '') + '</span></label>';
        }).join('') + '</fieldset>' +
        '<p><button type="button" class="sx-link" data-size-guide>size guide ♡</button></p>' +
        '<div class="sx-actions">' + (pr.soldOut
          ? '<button type="button" class="btn btn-secondary sx-add" disabled aria-disabled="true"><span>sold out</span></button>'
          : '<button type="button" class="btn btn-primary sx-add"><span>add to bag ♡</span></button>') + '</div>' +
        (pr.soldOut ? alertForm('restock:' + pr.id, 'this one flew away — want a restock alert?') : '') +
        '<div class="combo-win sx-measure"><div class="combo-tb"><i></i><i></i><i></i><span>measurements.txt</span></div><div class="combo-wb">' +
         '<p class="sx-example">example measurements, measured flat</p><table class="sx-table"><caption class="sx-vh">measurements of this piece</caption><tbody>' + mrows + '</tbody></table></div></div>' +
       '</div></div>';
    var info = $('.sx-actions', root); info.appendChild(wishBtn(pr.id, true));
    var main = $('.sx-main', root), thumbs = $$('.sx-thumb', root);
    function art(cls) { var c = window.popiSprite(pr.spr, 16); c.className = 'sx-art ' + cls; c.setAttribute('aria-hidden', 'true'); return c; }
    thumbs.forEach(function (t, i) { t.appendChild(art(views[i][1])); });
    function show(i) { var o = $('.sx-art', main); if (o) o.remove(); main.appendChild(art(views[i][1])); main.setAttribute('aria-label', pr.name + ', ' + views[i][0] + ' view (sample placeholder)');
      thumbs.forEach(function (t, j) { t.classList.toggle('on', i === j); t.setAttribute('aria-pressed', i === j); }); }
    show(0);
    root.addEventListener('click', function (e) { var t = e.target.closest('.sx-thumb'); if (t) show(+t.dataset.v); });
    var add = $('.sx-add', root);
    if (add && !pr.soldOut) add.addEventListener('click', function () {
      var sz = ($('input[name=size]:checked', root) || {}).value || '';
      var th = ''; try { th = window.popiSprite(pr.spr, 4).toDataURL(); } catch (e) {}
      if (window.popiBag) { var b = window.popiBag.get(); b.push({ id: pr.id, name: pr.name, size: sz, price: pr.price, thumb: th }); window.popiBag.set(b); window.popiBag.fx(add); }
      var sp = $('span', add); sp.textContent = 'added ✓'; setTimeout(function () { sp.textContent = 'add to bag ♡'; }, 1400);
    });
    paintWish();
  }

  /* ---------- wishlist page ---------- */
  function renderWishlist() {
    var g = $('#wish-grid'); if (!g) return;
    var w = wish().map(byId).filter(Boolean);
    g.innerHTML = '';
    w.forEach(function (pr) { var cell = document.createElement('div'); cell.className = 'pp-cell sx-has-wish'; cell.appendChild(window.popiCard(pr)); cell.appendChild(wishBtn(pr.id)); g.appendChild(cell); });
    placeHearts();
    $('#wish-empty').hidden = w.length > 0;
    paintWish();
  }

  /* ---------- 13. cart page ---------- */
  function renderCart() {
    var root = $('#cart-root'); if (!root || !window.popiBag) return;
    var bag = window.popiBag.get(), tot = 0;
    root.innerHTML = bag.length ? '<ul class="sx-cart">' + bag.map(function (it, i) {
      var pr = byId(it.id), price = it.price || (pr && pr.price) || 0; tot += price;
      return '<li><span class="bag-thumb">' + (it.thumb ? '<img src="' + it.thumb + '" alt="">' : '') + '</span><span class="sx-ci"><b>' + (pr ? '<a href="product.html?id=' + encodeURIComponent(pr.id) + '">' + esc(it.name) + '</a>' : esc(it.name)) + '</b><small>' + (it.size ? 'size ' + esc(it.size) + ' · ' : '') + 'sample item</small></span><span class="sx-cp">' + (price ? 'NOK ' + price : '—') + '</span><button type="button" class="bag-rm" data-i="' + i + '" aria-label="Remove ' + esc(it.name) + '">✕</button></li>';
    }).join('') + '</ul><p class="sx-total">total <b>NOK ' + tot + '</b> <small>example prices</small></p>'
      : '<p class="sx-empty">your bag is empty ♡ <a href="collection.html">go find something cute</a></p>';
    root.onclick = function (e) { var r = e.target.closest('.bag-rm'); if (!r) return; var b = window.popiBag.get(); b.splice(+r.dataset.i, 1); window.popiBag.set(b); renderCart(); var f = $('.bag-rm', root) || $('a', root); if (f) f.focus(); };
  }

  /* ---------- 8. contact form ---------- */
  function initContact() {
    var f = $('form.sx-contact'); if (!f) return;
    var msg = $('.sx-msg', f);
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if ($('[name=_gotcha]', f).value) return; // bot
      var d = { name: f.n.value.trim(), email: f.e.value.trim(), topic: f.t.value, message: f.m.value.trim() };
      var bad = !d.name ? f.n : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email) ? f.e : d.message.length < 5 ? f.m : null;
      $$('[aria-invalid]', f).forEach(function (x) { x.removeAttribute('aria-invalid'); });
      if (bad) { bad.setAttribute('aria-invalid', 'true'); bad.focus(); msg.textContent = bad === f.e ? 'please check your email address' : bad === f.n ? 'please add your name' : 'please write a little message'; return; }
      var c = CFG.contact || {}, btn = $('button[type=submit] span', f);
      if (c.endpoint) {
        btn.textContent = 'sending…'; msg.textContent = '';
        var body = { name: d.name, email: d.email, subject: 'popipants: ' + d.topic, message: d.message };
        if (c.accessKey) body.access_key = c.accessKey;
        fetch(c.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) })
          .then(function (r) { if (!r.ok) throw 0; f.reset(); msg.textContent = 'sent ♡ i will answer as soon as i can.'; }, function () { throw 0; })
          .catch(function () { msg.innerHTML = 'could not send right now. <a href="' + mailto(d) + '">send it by email instead</a>'; })
          .then(function () { btn.textContent = 'send ♡'; });
      } else {
        location.href = mailto(d);
        msg.innerHTML = 'your email app should open with the message ready ♡ nothing happened? write to <a href="mailto:' + esc(CFG.contactEmail) + '">' + esc(CFG.contactEmail) + '</a>';
      }
    });
    function mailto(d) {
      return 'mailto:' + encodeURIComponent(CFG.contactEmail || '') + '?subject=' + encodeURIComponent('popipants: ' + d.topic + ' (from ' + d.name + ')') +
        '&body=' + encodeURIComponent(d.message + '\n\n— ' + d.name + ' (' + d.email + ')');
    }
    var order = qs.get('order'); if (order) { try { var bag = window.popiBag ? window.popiBag.get() : []; if (bag.length) { f.t.value = 'order question'; f.m.value = 'Hi! I would like to ask about:\n' + bag.map(function (i) { return '- ' + i.name + (i.size ? ' (' + i.size + ')' : ''); }).join('\n'); } } catch (e) {} }
  }

  /* ---------- 7. lookbook lightbox ---------- */
  function initLightbox() {
    var figs = $$('.pol-grid .polaroid'); if (!figs.length) return;
    figs.forEach(function (f, i) {
      f.tabIndex = 0; f.setAttribute('role', 'button');
      var cap = $('figcaption', f); f.setAttribute('aria-label', 'Open ' + (cap ? cap.textContent : 'look ' + (i + 1)) + ' larger');
      f.addEventListener('click', function () { open(i); });
      f.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); } });
    });
    function open(i) {
      var ret = document.activeElement, ov = document.createElement('div'); ov.className = 'sx-lb' + (RM ? ' rm' : '');
      ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Lookbook viewer');
      ov.innerHTML = '<div class="sx-lb-frame"><div class="sx-lb-stage"></div><p class="sx-lb-cap" aria-live="polite"></p></div>' +
        '<button type="button" class="gelbtn sx-lb-prev" aria-label="Previous look"><span>‹</span></button><button type="button" class="gelbtn sx-lb-next" aria-label="Next look"><span>›</span></button>' +
        '<button type="button" class="gelbtn on sx-lb-close" aria-label="Close viewer"><span>close ×</span></button>';
      document.body.appendChild(ov); document.documentElement.classList.add('sx-noscroll');
      var stage = $('.sx-lb-stage', ov), cap = $('.sx-lb-cap', ov);
      function show(n) { i = (n + figs.length) % figs.length; var src = $('.pol-ph', figs[i]), ph = src.cloneNode(true); var sc = $$('canvas', src), dc = $$('canvas', ph); dc.forEach(function (c, k) { try { c.getContext('2d').drawImage(sc[k], 0, 0); } catch (e) {} }); ph.classList.add('sx-lb-ph'); stage.innerHTML = ''; stage.appendChild(ph);
        cap.textContent = ($('figcaption', figs[i]) || {}).textContent + '  (' + (i + 1) + ' / ' + figs.length + ')'; }
      function close() { ov.remove(); document.documentElement.classList.remove('sx-noscroll'); removeEventListener('keydown', key); if (ret) ret.focus(); }
      function key(e) { if (e.key === 'Escape') close(); else if (e.key === 'ArrowRight') show(i + 1); else if (e.key === 'ArrowLeft') show(i - 1);
        else if (e.key === 'Tab') { var f = $$('button', ov), a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } } }
      addEventListener('keydown', key);
      $('.sx-lb-prev', ov).onclick = function () { show(i - 1); }; $('.sx-lb-next', ov).onclick = function () { show(i + 1); }; $('.sx-lb-close', ov).onclick = close;
      ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
      var x0 = null; stage.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
      stage.addEventListener('pointerup', function (e) { if (x0 == null) return; var dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1)); });
      show(i); $('.sx-lb-close', ov).focus();
    }
  }

  /* ---------- drop-alert slots ---------- */
  function initAlertSlots() { $$('[data-drop-alert]').forEach(function (s) { s.innerHTML = alertForm(s.dataset.dropAlert || 'drop', s.dataset.title); }); }

  /* ---------- sidebar wishlist link (count) ---------- */
  function initNav() {
    $$('.sidebar-nav a[href="wishlist.html"]').forEach(function (a) { if (!$('.sx-wcount', a)) { var s = document.createElement('span'); s.className = 'sx-wcount'; a.appendChild(document.createTextNode(' ')); a.appendChild(s); } });
  }

  function init() {
    initNav(); initFilters(); renderProduct(); renderWishlist(); renderCart(); initContact(); initLightbox(); initAlertSlots(); addHearts();
  }
  // run after pixel-fx has wrapped cards into .pp-cell
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 0); }); else setTimeout(init, 0);
  window.popiShop = { sizeGuide: sizeGuide, wish: wish, toggleWish: toggleWish };
})();
