/* popipants music: ONE shared audio controller.
   - a single <audio> element per page, so two songs can never overlap
   - UI state comes only from real media events (playing/pause/waiting/stalled/ended/error),
     never from optimistic guesses
   - every play request gets a ticket; stale requests (rapid taps) are ignored
   - other tabs/windows of the site are paused when this one starts (BroadcastChannel)
   - position + queue survive page navigation (sessionStorage)
   Both the bottom player (#music-toggle) and the kitty-on-CD buttons (.music-cd-toggle)
   subscribe to the same state. */
(function () {
  'use strict';
  if (window.popipantsMusic) return;
  var TRACKS = [
    ['a day in the park', 'a day in the park_spotdown.org (1).mp3'],
    ['honey lemon tea', 'honey lemon tea_spotdown.org (2).mp3'],
    ['macarons for two', 'macarons for two_spotdown.org (1).mp3'],
    ['ocean railway', 'ocean railway_spotdown.org (1).mp3'],
    ['snow angels', 'snow angels_spotdown.org (1).mp3'],
    ['sweet cafe', 'sweet cafe_spotdown.org (1).mp3']
  ];
  var VOL = 0.28, SWITCH_S = 60, SKEY = 'popipants-music';
  var el = new Audio();
  el.preload = 'none';           // nothing downloads until someone presses play
  el.volume = VOL;
  var S = { status: 'idle', idx: -1, queue: [], pos: 0, seg: 0, msg: 'playlist: 6 cute tracks, shuffled' };
  var want = false;              // did the listener ask for music?
  var ticket = 0;                // increments on every play/pause/switch request
  var subs = [];
  var errors = 0;
  var me = Math.random().toString(36).slice(2);
  var bc = null; try { bc = new BroadcastChannel('popipants-music'); } catch (e) {}

  function shuffle(avoid) {
    var q = TRACKS.map(function (_, i) { return i; });
    for (var i = q.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = q[i]; q[i] = q[j]; q[j] = t; }
    if (q.length > 1 && q[0] === avoid) q.push(q.shift());
    return q;
  }
  function name() { return S.idx >= 0 ? TRACKS[S.idx][0] : ''; }
  function emit() { for (var i = 0; i < subs.length; i++) { try { subs[i](S); } catch (e) {} } }
  function set(status, msg) { var ch = status !== S.status || (msg && msg !== S.msg); S.status = status; if (msg) S.msg = msg; if (ch) emit(); }
  function save() {
    try { sessionStorage.setItem(SKEY, JSON.stringify({ queue: S.queue, pos: S.pos, idx: S.idx, t: el.currentTime || 0, seg: S.seg, playing: want })); } catch (e) {}
  }
  function srcFor(i) { return 'music/' + encodeURIComponent(TRACKS[i][1]); }
  function loadTrack(i, t) {
    S.idx = i; S.seg = t || 0;
    el.src = srcFor(i);
    el.preload = 'auto';
    if (t) {
      var seek = function () { try { el.currentTime = t; } catch (e) {} };
      if (el.readyState >= 1) seek(); else el.addEventListener('loadedmetadata', seek, { once: true });
    }
  }
  function ensureQueue() {
    if (!S.queue.length) { S.queue = shuffle(-1); S.pos = 0; }
    if (S.idx < 0) loadTrack(S.queue[S.pos], 0);
  }

  // gentle volume ramp, cancellable, rAF only while ramping
  var rampId = 0;
  function ramp(to, ms) {
    var id = ++rampId, from = el.volume, t0 = performance.now();
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || ms <= 0) { el.volume = to; return; }
    (function step(now) {
      if (id !== rampId) return;
      var p = Math.min(1, (now - t0) / ms);
      el.volume = Math.max(0, Math.min(1, from + (to - from) * p));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  function play() {
    want = true; errors = 0;
    ensureQueue();
    var my = ++ticket;
    set('loading', 'loading: ' + name());
    if (bc) try { bc.postMessage({ claim: me }); } catch (e) {}
    el.volume = 0;
    var p;
    try { p = el.play(); } catch (e) { p = Promise.reject(e); }
    return Promise.resolve(p).then(function () {
      if (my !== ticket) return;      // a newer request won
      ramp(VOL, 400); save();
    }, function (err) {
      if (my !== ticket) return;
      if (err && err.name === 'AbortError') return; // superseded by a src change; the next request handles it
      want = false; el.volume = VOL;
      if (err && err.name === 'NotAllowedError') set('blocked', 'tap play to listen — your browser paused autoplay');
      else set('error', 'could not play ' + name() + ' — tap to try again');
      save();
      throw err;
    });
  }
  function pause() {
    want = false; ++ticket; rampId++;
    el.pause(); el.volume = VOL;
    save();
  }
  function toggle() {
    if (want || S.status === 'playing' || S.status === 'loading') { pause(); return Promise.resolve(); }
    return play().catch(function () {});
  }
  function next() {
    S.pos++;
    if (S.pos >= S.queue.length) { S.queue = shuffle(S.idx); S.pos = 0; }
    loadTrack(S.queue[S.pos], 0);
    if (want) return play().catch(function () {});
    set('paused', 'up next: ' + name()); save();
    return Promise.resolve();
  }

  // real media events are the single source of truth for the UI
  el.addEventListener('playing', function () { errors = 0; if (!want) { el.pause(); return; } set('playing', 'now playing: ' + name()); });
  el.addEventListener('pause', function () { if (el.ended) return; if (!want) set('paused', 'paused — ' + name()); });
  el.addEventListener('waiting', function () { if (want) set('loading', 'loading: ' + name()); });
  el.addEventListener('stalled', function () { if (want && el.readyState < 3) set('loading', 'buffering: ' + name()); });
  el.addEventListener('ended', function () { next(); });
  el.addEventListener('error', function () {
    if (!el.src || el.src === location.href) return;
    errors++;
    if (want && errors < TRACKS.length) { next(); return; }
    want = false; set('error', 'music could not load — tap to try again'); save();
  });
  // watchdog: if we have been 'loading' for 10s with nothing audible, say so instead of pretending
  var loadingSince = 0;
  subs.push(function () { loadingSince = S.status === 'loading' ? (loadingSince || Date.now()) : 0; });
  setInterval(function () {
    if (S.status === 'loading' && loadingSince && Date.now() - loadingSince > 10000) {
      want = false; ++ticket; el.pause(); loadingSince = 0;
      set('error', 'music could not load — check your connection and tap to try again'); save();
    }
  }, 1000);
  // 60s segment switch: a cheap 1s timer instead of work on every timeupdate
  setInterval(function () {
    if (S.status !== 'playing') return;
    if (el.currentTime - S.seg >= SWITCH_S) next();
    else save();
  }, 1000);

  // another tab started music: stop here
  if (bc) bc.onmessage = function (e) { if (e.data && e.data.claim && e.data.claim !== me && want) pause(); };
  addEventListener('pagehide', function () { save(); });
  // back/forward cache: re-read the element's real state
  addEventListener('pageshow', function (e) { if (e.persisted) { if (el.paused) { want = false; set(S.idx >= 0 ? 'paused' : 'idle', S.idx >= 0 ? 'paused — ' + name() : null); } } });

  // ---------- UI: every music button subscribes to the same state ----------
  function buttons() { return document.querySelectorAll('#music-toggle, .music-cd-toggle'); }
  function render() {
    var on = S.status === 'playing', busy = S.status === 'loading';
    var bs = buttons();
    for (var i = 0; i < bs.length; i++) {
      var b = bs[i];
      b.classList.toggle('is-playing', on);
      b.classList.toggle('is-loading', busy);
      b.setAttribute('aria-pressed', on || busy ? 'true' : 'false');
      b.setAttribute('aria-label', on || busy ? 'Pause background music' : (S.idx >= 0 ? 'Resume background music' : 'Play background music'));
      var l = b.querySelector('.mlabel'); if (l) l.textContent = on ? 'playing ♪' : (busy ? 'loading…' : 'play ♪');
    }
    var st = document.getElementById('music-status'); if (st && st.textContent !== S.msg) st.textContent = S.msg;
  }
  subs.push(render);
  var lastTap = 0;
  function onTap(e) {
    var b = e.target.closest && e.target.closest('#music-toggle, .music-cd-toggle');
    if (!b) return;
    e.preventDefault();
    var now = Date.now(); if (now - lastTap < 250) return; // swallow double-taps
    lastTap = now;
    toggle();
  }
  document.addEventListener('click', onTap); // delegated: works for buttons added later too

  // ---------- restore across page navigation ----------
  (function restore() {
    var st = null; try { st = JSON.parse(sessionStorage.getItem(SKEY)); } catch (e) {}
    if (!st || !Array.isArray(st.queue) || !st.queue.length) { render(); return; }
    S.queue = st.queue; S.pos = Math.min(st.pos || 0, st.queue.length - 1);
    var idx = typeof st.idx === 'number' && st.idx >= 0 ? st.idx : S.queue[S.pos];
    S.idx = idx; S.seg = st.seg || 0;
    el.src = srcFor(idx); el.preload = st.playing ? 'auto' : 'metadata';
    if (st.t) { var tt = st.t; el.addEventListener('loadedmetadata', function () { try { el.currentTime = tt; } catch (e) {} }, { once: true }); }
    S.seg = st.seg || 0;
    if (!st.playing) { set('paused', 'paused — ' + name()); render(); return; }
    play().catch(function () {
      set('blocked', 'tap anywhere to keep listening ♪ ' + name());
      try { sessionStorage.setItem(SKEY, JSON.stringify({ queue: S.queue, pos: S.pos, idx: S.idx, t: st.t, seg: S.seg, playing: true })); } catch (e) {}
      var go = function (e) {
        removeEventListener('pointerdown', go, true); removeEventListener('keydown', go, true);
        if (e.target && e.target.closest && e.target.closest('#music-toggle, .music-cd-toggle')) return; // the button's own click will start it
        if (S.status === 'blocked') play().catch(function () {});
      };
      addEventListener('pointerdown', go, true); addEventListener('keydown', go, true);
    });
    render();
  })();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render); else render();

  window.popipantsMusic = {
    toggle: toggle, play: play, pause: pause, next: next,
    isPlaying: function () { return S.status === 'playing'; },
    state: function () { return { status: S.status, track: name(), want: want, paused: el.paused, time: el.currentTime }; },
    subscribe: function (fn) { subs.push(fn); try { fn(S); } catch (e) {} return function () { subs = subs.filter(function (f) { return f !== fn; }); }; },
    _el: el
  };
})();
