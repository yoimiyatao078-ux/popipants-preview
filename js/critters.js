/* =====================================================================
   POPIPANTS CRITTERS — little animals for each colour theme
   (pink: butterflies · blue: hibiscus · red: ladybug · goth: bat + moth)
   Designs + which critter belongs to which theme: tools/critters/build.py

   Three ways they show up:
   1) PERCHED  – 1–2 critters sit on top of buttons, cards, menu pills,
                 headlines… stay a few seconds, then flutter/hop to another
                 visible spot along a soft arc.
   2) BUDDY    – one critter lives next to the mood-selector boxes. When you
                 switch theme it swaps to the new mood's critter and waves hello.
   3) SURPRISE – hovering a product card makes a critter pop out and land on
                 the card's corner; it flies off when the mouse leaves.
                 (Only on devices with a mouse — skipped on phones.)

   Always: tiny, never block clicks, freeze when the tab is hidden,
   "reduce motion" setting = everything sits still (no flying).
   ===================================================================== */
(function () {
  var DATA = window.POPI_CRITTERS;
  if (!DATA) return;

  /* ---------- settings you can tweak ---------- */
  var PERCH_SIZE = 34, BUDDY_SIZE = 30, SURPRISE_SIZE = 32;     // px
  var STAY_MIN = 3, STAY_MAX = 6;                               // seconds sitting on a perch
  var PERCH_SPOTS = '.btn, .btn-aero, .category-nav a, .product-card, .quick-action, .banner-title, .section-title, .section-tag, .win-titlebar, .footer-logo';
  var MAX_PERCHERS = window.innerWidth < 600 ? 1 : 2;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  var actors = [], perchers = [], buddy = null, raf = null, last = 0;

  /* ---------- which critter plays which role in the current theme ---------- */
  function cast() {
    var t = (document.documentElement.getAttribute('data-theme') || 'pink').replace(/^goth\d$/, 'goth');
    var set = DATA.moods[t] || DATA.moods.pink;
    var shuffled = set.slice().sort(function () { return Math.random() - 0.5; });
    // different designs in different roles when the mood has several
    return {
      perch: shuffled.slice(0, Math.min(MAX_PERCHERS, set.length)),
      buddy: shuffled[shuffled.length > 2 ? 2 : shuffled.length - 1],
      surprise: shuffled[shuffled.length > 3 ? 3 : (shuffled.length > 1 ? 1 : 0)]
    };
  }

  function makeEl(c, size, extra) {
    var el = document.createElement('div');
    el.className = 'critter critter-' + c.move + (extra ? ' ' + extra : '');
    el.setAttribute('aria-hidden', 'true');
    el.style.setProperty('--size', size + 'px');
    el.innerHTML = '<div class="cr">' + DATA.shapes[c.key] + '</div>';
    if (reduce.matches) el.classList.add('is-still');
    return el;
  }

  /* an actor = a critter floating in page coordinates (scrolls with the page) */
  function actor(c, size) {
    var a = { c: c, size: size, el: makeEl(c, size, 'critter-float'), x: 0, y: 0, fly: null, t: Math.random() * 9 };
    document.body.appendChild(a.el);
    actors.push(a);
    return a;
  }
  function removeActor(a) {
    a.el.remove();
    actors = actors.filter(function (b) { return b !== a; });
  }
  function draw(a, lift, rot) {
    a.el.style.transform = 'translate(' + a.x.toFixed(1) + 'px,' + (a.y - (lift || 0)).toFixed(1) + 'px) rotate(' + (rot || 0).toFixed(1) + 'deg)';
  }

  /* fly along a soft arc to (x, y); speed depends on the critter type */
  function flyTo(a, x, y, done) {
    if (reduce.matches) { a.x = x; a.y = y; draw(a); if (done) done(); return; }
    var dx = x - a.x, dy = y - a.y, dist = Math.sqrt(dx * dx + dy * dy);
    var pxPerSec = { fly: 380, drift: 170, hop: 260 }[a.c.move] || 300;
    a.fly = {
      x0: a.x, y0: a.y, x1: x, y1: y,
      arc: Math.min(140, 30 + dist * 0.35),         // how high the arc goes
      start: performance.now(), dur: 600 + Math.min(2200, dist / pxPerSec * 1000), done: done
    };
    a.el.classList.toggle('critter-flip', dx < 0 && a.c.move === 'fly');
    a.el.classList.add('is-flying');
  }

  function step(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (pink) { pink.idle.t += dt; pink.wand.t += dt; stepPink(dt, now); }
    actors.forEach(function (a) {
      if (pink && (a === pink.idle || a === pink.wand)) return;
      a.t += dt;
      var lift = 0, rot = 0;
      if (a.fly) {
        var f = a.fly, p = Math.min(1, (now - f.start) / f.dur);
        var e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;   // ease in-out
        a.x = f.x0 + (f.x1 - f.x0) * e;
        a.y = f.y0 + (f.y1 - f.y0) * e;
        lift = Math.sin(Math.PI * e) * f.arc;
        if (a.c.move === 'hop') lift += Math.abs(Math.sin(p * Math.PI * 3)) * 10;   // little hops
        if (a.c.move === 'drift') rot = Math.sin(a.t * 2) * 20;                  // petal sway
        else rot = Math.sin(a.t * 6) * 6;
        if (p >= 1) { a.fly = null; a.el.classList.remove('is-flying'); if (f.done) f.done(); }
      } else {
        // sitting: tiny breathing bob so it feels alive
        lift = a.c.move === 'drift' ? Math.sin(a.t * 1.4) * 2 : 0;
        rot = a.c.move === 'drift' ? Math.sin(a.t * 0.9) * 6 : 0;
      }
      draw(a, lift, rot);
    });
    raf = requestAnimationFrame(step);
  }
  function startLoop() {
    cancelAnimationFrame(raf);
    if (reduce.matches || document.hidden) return;
    last = performance.now(); raf = requestAnimationFrame(step);
  }


  /* ---------- PINK mood: one butterfly idles on the cart/shop button, one wanders ---------- */
  var CART_SPOTS = '.bag-window .win-titlebar, a.btn-primary[href*="collection"], .btn-primary, .btn';
  var pink = null;
  function stopPink() {
    if (!pink) return;
    clearTimeout(pink.timer); removeActor(pink.idle); removeActor(pink.wand);
    pink.trail.forEach(function (t) { t.remove(); }); pink = null;
  }
  function cartPoint(size) {
    var el = document.querySelector(CART_SPOTS);
    if (!el || el.offsetParent === null && getComputedStyle(el).position !== 'fixed') return null;
    var r = el.getBoundingClientRect();
    return { x: r.right + window.scrollX - size - 6, y: r.top + window.scrollY - size * 0.8 };
  }
  function pickTarget(w) {
    var vw = document.documentElement.clientWidth, vh = window.innerHeight;
    if (Math.random() < 0.35) {               // sometimes land on something
      var spots = visibleSpots([document.querySelector(CART_SPOTS)]);
      if (spots.length) { var el = spots[Math.floor(Math.random() * spots.length)], pt = perchPoint(el, w.size);
        return { x: pt.x, y: pt.y, land: el }; }
    }
    return { x: window.scrollX + 40 + Math.random() * (vw - 80 - w.size), y: window.scrollY + 70 + Math.random() * (vh - 140 - w.size) };
  }
  function startPink(list) {
    stopPink();
    var idle = actor(list[0], PERCH_SIZE), wand = actor(list[1] || list[0], PERCH_SIZE - 4);
    idle.el.classList.add('critter-idle'); wand.el.classList.add('critter-wander', 'is-flying');
    var vw = document.documentElement.clientWidth;
    wand.x = window.scrollX - 40; wand.y = window.scrollY + window.innerHeight * 0.35;
    wand.vx = 60; wand.vy = 0; wand.rest = 0; wand.target = pickTarget(wand); wand.lastTrail = 0;
    pink = { idle: idle, wand: wand, trail: [] };
  }
  function trail(x, y) {
    var t = document.createElement('div'); t.className = 'critter-trail'; t.setAttribute('aria-hidden', 'true');
    t.style.transform = 'translate(' + x.toFixed(0) + 'px,' + y.toFixed(0) + 'px)';
    document.body.appendChild(t); pink.trail.push(t);
    setTimeout(function () { t.remove(); if (pink) pink.trail = pink.trail.filter(function (q) { return q !== t; }); }, 1400);
  }
  function stepPink(dt, now) {
    var i = pink.idle, p = cartPoint(i.size);
    if (p) { i.x = p.x; i.y = p.y; i.el.style.display = ''; } else i.el.style.display = 'none';
    draw(i, Math.sin(i.t * 1.6) * 1.5, 0);
    var w = pink.wand, g = w.target;
    if (w.rest > 0) {                           // sitting on an element: slow flutter
      w.rest -= dt;
      if (g.land) { var pt = perchPoint(g.land, w.size); w.x += (pt.x - w.x) * .1; w.y += (pt.y - w.y) * .1; }
      if (w.rest <= 0) { w.target = pickTarget(w); w.el.classList.add('is-flying'); w.vy = -120; w.beat = 0; }
      draw(w, 0, 0); return;
    }
    /* real-butterfly flight: heading + wingbeat impulses + sinking between beats */
    if (w.h === undefined) { w.h = 0; w.beat = 0; w.glide = 0; w.turn = 0; w.vx = 40; w.vy = 0; }
    // the target itself drifts slowly so the path never looks planned
    if (!g.land) { g.x += Math.sin(w.t * 0.37 + 1) * 18 * dt; g.y += Math.cos(w.t * 0.29) * 14 * dt; }
    var dx = g.x - w.x, dy = g.y - w.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    var want = Math.atan2(dy, dx), diff = Math.atan2(Math.sin(want - w.h), Math.cos(want - w.h));
    var turn = Math.max(-2.2, Math.min(2.2, diff * 1.6)) + (Math.random() - 0.5) * 7;   // steering + constant jitter
    w.turn += (turn - w.turn) * Math.min(1, dt * 6);
    w.h += w.turn * dt;
    // wingbeats at irregular intervals; sometimes a short glide with wings held open
    w.beat -= dt;
    if (w.glide > 0) { w.glide -= dt; if (w.glide <= 0) w.el.classList.remove('is-gliding'); }
    else if (w.beat <= 0) {
      var period = 0.16 + Math.random() * 0.16;
      w.beat = period;
      var thrust = (d < 60 ? 22 : 46) * (0.7 + Math.random() * 0.6);
      w.vx += Math.cos(w.h) * thrust; w.vy += Math.sin(w.h) * thrust - (55 + Math.random() * 35);   // little hop up on the downstroke
      if (Math.random() < 0.06 && d > 120) { w.glide = 0.35 + Math.random() * 0.5; w.el.classList.add('is-gliding'); }
    }
    w.vy += (w.glide > 0 ? 60 : 210) * dt;       // sink between beats (less while gliding)
    var drag = Math.pow(0.12, dt); w.vx *= drag; w.vy *= drag;
    w.x += w.vx * dt; w.y += w.vy * dt;
    if (Math.abs(w.vx) > 10) w.el.classList.toggle('critter-flip', w.vx < 0);
    if (d < (g.land ? 14 : 30)) {
      if (g.land) { w.rest = 2.5 + Math.random() * 3; w.vx = w.vy = 0; w.el.classList.remove('is-flying', 'is-gliding'); }
      else w.target = pickTarget(w);
    }
    if (now - w.lastTrail > 200) { w.lastTrail = now; trail(w.x + w.size * .5, w.y + w.size * .7); }
    var bank = Math.max(-22, Math.min(22, w.turn * 9 + w.vy * 0.04));
    draw(w, 0, w.el.classList.contains('critter-flip') ? -bank : bank);
  }

  /* ---------- 1) PERCHED ---------- */
  function visibleSpots(exclude) {
    var vw = window.innerWidth, vh = window.innerHeight;
    return Array.prototype.filter.call(document.querySelectorAll(PERCH_SPOTS), function (el) {
      if (exclude.indexOf(el) >= 0) return false;
      var r = el.getBoundingClientRect();
      return r.width > 40 && r.height > 12 && r.top > 50 && r.bottom < vh - 10 && r.left > 0 && r.right < vw &&
        getComputedStyle(el).visibility !== 'hidden' && el.offsetParent !== null;
    });
  }
  function perchPoint(el, size) {
    var r = el.getBoundingClientRect();
    var x = r.left + window.scrollX + 8 + Math.random() * Math.max(0, r.width - size - 16);
    return { x: x, y: r.top + window.scrollY - size * 0.78 };   // feet resting on the top edge
  }
  function nextPerch(p) {
    var taken = perchers.map(function (q) { return q.spot; }).filter(Boolean);
    var spots = visibleSpots(taken);
    if (!spots.length) { p.timer = setTimeout(function () { nextPerch(p); }, 1500); return; }
    p.spot = spots[Math.floor(Math.random() * spots.length)];
    var pt = perchPoint(p.spot, p.a.size);
    flyTo(p.a, pt.x, pt.y, function () {
      if (!reduce.matches) p.timer = setTimeout(function () { if (!document.hidden) nextPerch(p); else p.waiting = true; }, (STAY_MIN + Math.random() * (STAY_MAX - STAY_MIN)) * 1000);
    });
  }
  function startPerchers(list) {
    perchers.forEach(function (p) { clearTimeout(p.timer); removeActor(p.a); });
    perchers = [];
    var still = reduce.matches;
    (still ? list.slice(0, 1) : list).forEach(function (c, i) {
      var a = actor(c, PERCH_SIZE - i * 3);
      // enter from the side of the screen
      a.x = (i % 2 ? document.documentElement.clientWidth - a.size : 0) + window.scrollX;
      a.y = window.scrollY + window.innerHeight * (0.25 + 0.3 * i);
      draw(a);
      var p = { a: a, spot: null, timer: null };
      perchers.push(p);
      if (still) {   // reduced motion: sit on the page title and stay
        var t = document.querySelector('.banner-title') || document.querySelector('h1');
        if (t) { var pt = perchPoint(t, a.size); a.x = pt.x; a.y = pt.y; draw(a); }
      } else {
        setTimeout(function () { nextPerch(p); }, 300 + i * 900);
      }
    });
  }

  /* ---------- 2) BUDDY next to the mood boxes ---------- */
  function setBuddy(c, sayHello) {
    var dock = document.querySelector('.theme-dock');
    if (!dock) return;
    if (!buddy) {
      buddy = document.createElement('div');
      buddy.className = 'critter-buddy';
      buddy.setAttribute('aria-hidden', 'true');
      var row = dock.querySelector('.theme-switcher') || dock;
      row.appendChild(buddy);
    }
    var el = makeEl(c, BUDDY_SIZE, '');
    buddy.innerHTML = '';
    buddy.appendChild(el);
    if (sayHello && !reduce.matches) {
      buddy.classList.remove('say-hello'); void buddy.offsetWidth; buddy.classList.add('say-hello');
    }
  }

  /* ---------- 3) SURPRISE on product cards (mouse only) ---------- */
  var surpriseCritter = null;
  function initSurprise() {
    if (!canHover.matches) return;
    document.addEventListener('mouseover', function (e) {
      var card = e.target.closest && e.target.closest('.product-card');
      if (!card || card._critter || !surpriseCritter) return;
      var r = card.getBoundingClientRect(), s = SURPRISE_SIZE;
      var a = actor(surpriseCritter, s);
      a.el.classList.add('critter-pop');
      a.x = r.left + window.scrollX + r.width / 2 - s / 2;          // pops out of the middle of the card
      a.y = r.top + window.scrollY + r.height / 2 - s / 2;
      draw(a);
      card._critter = a;
      flyTo(a, r.right + window.scrollX - s * 0.8, r.top + window.scrollY - s * 0.7);  // lands on the top-right corner
    });
    document.addEventListener('mouseout', function (e) {
      var card = e.target.closest && e.target.closest('.product-card');
      if (!card || !card._critter || card.contains(e.relatedTarget)) return;
      var a = card._critter; card._critter = null;
      a.el.classList.add('critter-leave');
      flyTo(a, a.x + 60, a.y - 120, function () { removeActor(a); });
      if (reduce.matches) removeActor(a);
    });
  }

  /* ---------- put it all together ---------- */
  function build(sayHello) {
    var roles = cast();
    // surprise critters still sitting on cards fly away with the old theme
    actors.slice().forEach(function (a) { if (a.el.classList.contains('critter-pop')) removeActor(a); });
    document.querySelectorAll('.product-card').forEach(function (c) { c._critter = null; });
    var theme = (document.documentElement.getAttribute('data-theme') || 'pink').replace(/^goth\d$/, 'goth');
    stopPink();
    if ((theme === 'pink' || theme === 'goth') && !reduce.matches) {
      perchers.forEach(function (p) { clearTimeout(p.timer); removeActor(p.a); }); perchers = [];
      startPink(DATA.moods[theme]);   // goth: bat idles on the shop button, moth wanders with the same flight + trail
    } else startPerchers(roles.perch);
    setBuddy(roles.buddy, sayHello);
    surpriseCritter = roles.surprise;
    startLoop();
  }

  document.addEventListener('visibilitychange', function () {
    document.documentElement.classList.toggle('critters-paused', document.hidden);
    if (document.hidden) { cancelAnimationFrame(raf); return; }
    perchers.forEach(function (p) { if (p.waiting) { p.waiting = false; nextPerch(p); } });
    startLoop();
  });
  (reduce.addEventListener ? reduce.addEventListener('change', function () { build(false); }) : reduce.addListener(function () { build(false); }));
  // theme boxes change <html data-theme> → swap critters right away + buddy says hello
  new MutationObserver(function () { build(true); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.addEventListener('resize', function () { if (pink) pink.wand.target = pickTarget(pink.wand); perchers.forEach(function (p) { if (!p.a.fly) { clearTimeout(p.timer); nextPerch(p); } }); });

  initSurprise();
  build(false);
})();
