// ===== POPIPANTS - Y2K OLD-PC RETRO WEBSITE =====

document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===== CURSOR STAR TRAIL (white sparkles) =====
  let cursorThrottle = false;
  document.addEventListener('mousemove', (e) => {
    if (cursorThrottle || reduceMotion) return;
    cursorThrottle = true;
    setTimeout(() => { cursorThrottle = false; }, 80);

    const star = document.createElement('div');
    star.className = 'cursor-star';
    const symbols = ['✦', '✧', '⋆', '·', '✶', '✺'];
    star.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    star.style.left = e.clientX + 'px';
    star.style.top = e.clientY + 'px';
    star.style.fontSize = (8 + Math.random() * 8) + 'px';
    document.body.appendChild(star);
    setTimeout(() => star.remove(), 700);
  });

  // ===== SPARKLE CANVAS (soft white floating sparkles) =====
  const sparkleCanvas = document.getElementById('sparkle-canvas');
  if (sparkleCanvas && !reduceMotion) {
    const ctx = sparkleCanvas.getContext('2d');
    let sparkles = [];
    const sparkleCount = 40;

    function resizeCanvas() {
      sparkleCanvas.width = window.innerWidth;
      sparkleCanvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Sparkle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * sparkleCanvas.width;
        this.y = Math.random() * sparkleCanvas.height;
        this.size = Math.random() * 2.5 + 0.5;
        this.speedY = -(Math.random() * 0.2 + 0.05);
        this.speedX = (Math.random() - 0.5) * 0.2;
        this.opacity = Math.random();
        this.fadeSpeed = Math.random() * 0.015 + 0.005;
        this.growing = Math.random() > 0.5;
      }
      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        if (this.growing) {
          this.opacity += this.fadeSpeed;
          if (this.opacity >= 1) this.growing = false;
        } else {
          this.opacity -= this.fadeSpeed;
          if (this.opacity <= 0) this.reset();
        }
        if (this.y < -10 || this.x < -10 || this.x > sparkleCanvas.width + 10) {
          this.reset();
          this.y = sparkleCanvas.height + 10;
        }
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowBlur = this.size * 3;
        ctx.beginPath();
        const s = this.size;
        ctx.moveTo(this.x, this.y - s * 2);
        ctx.lineTo(this.x + s * 0.5, this.y - s * 0.5);
        ctx.lineTo(this.x + s * 2, this.y);
        ctx.lineTo(this.x + s * 0.5, this.y + s * 0.5);
        ctx.lineTo(this.x, this.y + s * 2);
        ctx.lineTo(this.x - s * 0.5, this.y + s * 0.5);
        ctx.lineTo(this.x - s * 2, this.y);
        ctx.lineTo(this.x - s * 0.5, this.y - s * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < sparkleCount; i++) {
      sparkles.push(new Sparkle());
    }

    function animateSparkles() {
      ctx.clearRect(0, 0, sparkleCanvas.width, sparkleCanvas.height);
      sparkles.forEach(s => {
        s.update();
        s.draw();
      });
      requestAnimationFrame(animateSparkles);
    }
    animateSparkles();
  }

  // ===== INTERSECTION OBSERVER (scroll reveal) =====
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  document.querySelectorAll('.animate-in').forEach(el => observer.observe(el));

  // ===== FORM HANDLING =====
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = contactForm.querySelector('[name="name"]')?.value;
      showPcPopup(
        'Message Sent!',
        `Thank you${name ? ', ' + name : ''}! Your message has been received. I'll get back to you ASAP!`,
        'OK'
      );
      contactForm.reset();
    });
  }

  // ===== THEME SWITCHER =====
  // pink (default) · blue (tropical) · red (downtown) · goth — persisted in localStorage
  function initThemeSwitcher() {
    const THEMES = ['pink', 'blue', 'red', 'goth'];
    const themeBtns = document.querySelectorAll('.theme-btn');
    let savedTheme = localStorage.getItem('popipants-theme') || 'pink';
    if (savedTheme === 'black') savedTheme = 'goth';
    if (!THEMES.includes(savedTheme)) savedTheme = 'pink';

    const apply = (theme) => {
      if (theme === 'pink') document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', theme);
      themeBtns.forEach(b => {
        const on = b.dataset.theme === theme;
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    };
    apply(savedTheme);
    themeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        if (!THEMES.includes(theme)) return;
        apply(theme);
        try { localStorage.setItem('popipants-theme', theme); } catch (e) {}
      });
    });
  }
  initThemeSwitcher();

  // ===== HOME PAGE OLD-PC MOMENTS =====
  const musicToggle = document.getElementById('music-toggle');
  // background playlist: random track, switches to another random one every 60s (short crossfade) and when a track ends
  const TRACKS = [
    ['a day in the park', 'a day in the park_spotdown.org (1).mp3'],
    ['honey lemon tea', 'honey lemon tea_spotdown.org (2).mp3'],
    ['macarons for two', 'macarons for two_spotdown.org (1).mp3'],
    ['ocean railway', 'ocean railway_spotdown.org (1).mp3'],
    ['snow angels', 'snow angels_spotdown.org (1).mp3'],
    ['sweet cafe', 'sweet cafe_spotdown.org (1).mp3']
  ];
  // Persistent shuffled playlist: state survives page changes via sessionStorage (track, time, queue, playing).
  const VOL = 0.28, SWITCH_S = 60, FADE_MS = 1500, SKEY = 'popipants-music';
  let cur = null, curIdx = -1, playing = false, wantResume = false;
  let queue = [], pos = 0, seg = 0;
  const statusEl = () => document.getElementById('music-status');
  const say = t => { const s = statusEl(); if (s) s.textContent = t; };
  const shuffle = avoid => { const q = TRACKS.map((_, i) => i); for (let i = q.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [q[i], q[j]] = [q[j], q[i]]; } if (q.length > 1 && q[0] === avoid) q.push(q.shift()); return q; };
  function save() {
    try { sessionStorage.setItem(SKEY, JSON.stringify({ queue, pos, t: cur ? cur.currentTime : 0, seg, playing: playing || wantResume })); } catch (e) {}
  }
  function fade(audio, from, to, ms, done) {
    const start = performance.now();
    (function tick(now) {
      const p = Math.min(1, ((now || performance.now()) - start) / ms);
      audio.volume = Math.max(0, Math.min(1, from + (to - from) * p));
      if (p < 1) requestAnimationFrame(tick); else if (done) done();
    })(start);
  }
  function makeTrack(i) {
    const a = new Audio('music/' + encodeURIComponent(TRACKS[i][1]));
    a.preload = 'auto';
    a.addEventListener('ended', () => { if (playing && a === cur) nextTrack(); });
    a.addEventListener('timeupdate', () => { if (playing && a === cur && a.currentTime - seg >= SWITCH_S) nextTrack(); });
    return a;
  }
  function load(i, t) { cur = makeTrack(i); curIdx = i; seg = 0; if (t) { const set = () => { try { cur.currentTime = t; } catch (e) {} }; if (cur.readyState >= 1) set(); else cur.addEventListener('loadedmetadata', set, { once: true }); } }
  let switching = false;
  async function nextTrack() {
    if (switching) return true; switching = true;
    pos++; if (pos >= queue.length) { queue = shuffle(curIdx); pos = 0; }
    const old = cur, i = queue[pos], a = makeTrack(i);
    cur = a; curIdx = i; seg = 0; a.volume = 0;
    try { await a.play(); } catch (e) { switching = false; return false; }
    fade(a, 0, VOL, FADE_MS);
    if (old) fade(old, old.volume, 0, FADE_MS, () => { old.pause(); old.src = ''; });
    say('now playing: ' + TRACKS[i][0]); save(); switching = false;
    return true;
  }
  const musicButtons = () => document.querySelectorAll('#music-toggle, .music-cd-toggle');
  function syncMusicUI() {
    musicButtons().forEach(btn => {
      btn.classList.toggle('is-playing', playing);
      btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
      btn.setAttribute('aria-label', playing ? 'Pause background music' : (cur ? 'Resume background music' : 'Play background music'));
      const l = btn.querySelector('.mlabel'); if (l) l.textContent = playing ? 'playing ♪' : 'play ♪';
    });
  }
  async function startCur() {
    if (!cur) { queue = shuffle(-1); pos = 0; load(queue[0], 0); }
    cur.volume = 0;
    await cur.play();
    fade(cur, 0, VOL, 400);
    playing = true; wantResume = false; say('now playing: ' + TRACKS[curIdx][0]); syncMusicUI(); save();
  }
  let busy = false;
  async function toggleMusic() {
    if (busy) return; busy = true;
    if (!playing) {
      try { await startCur(); } catch (e) { playing = false; say('press play again — your browser blocked the first try'); }
    } else {
      playing = false; wantResume = false;
      if (cur) cur.pause();
      say('paused — ' + TRACKS[curIdx][0]); save();
    }
    syncMusicUI(); busy = false;
  }
  // restore from previous page
  (function restore() {
    let st = null; try { st = JSON.parse(sessionStorage.getItem(SKEY)); } catch (e) {}
    if (!st || !Array.isArray(st.queue) || !st.queue.length) return;
    queue = st.queue; pos = Math.min(st.pos || 0, queue.length - 1);
    load(queue[pos], st.t || 0); seg = st.seg || 0;
    if (!st.playing) { say('paused — ' + TRACKS[curIdx][0]); return; }
    wantResume = true;
    startCur().catch(() => {
      // autoplay blocked: resume at the saved time on the first click/keypress anywhere
      say('tap anywhere to keep listening ♪ ' + TRACKS[curIdx][0]);
      const go = e => {
        removeEventListener('pointerdown', go, true); removeEventListener('keydown', go, true);
        if (e && e.target && e.target.closest && e.target.closest('#music-toggle, .music-cd-toggle')) { e.stopPropagation(); e.preventDefault(); if (e.type === 'pointerdown') { const b = e.target.closest('button'); b.addEventListener('click', ev => ev.stopImmediatePropagation(), { once: true, capture: true }); } }
        startCur().catch(() => { wantResume = false; syncMusicUI(); });
      };
      addEventListener('pointerdown', go, true); addEventListener('keydown', go, true);
    });
  })();
  setInterval(() => { if (playing) save(); }, 1000);
  addEventListener('pagehide', save);
  window.popipantsMusic = { toggle: toggleMusic, isPlaying: () => playing };
  musicButtons().forEach(btn => btn.addEventListener('click', toggleMusic));
  document.querySelectorAll('.popup-trigger, [data-popup="signup"]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      if (trigger.dataset.popup === 'playlist') {
        showPcPopup('popipants_player.exe', '♫ <b>now playing:</b> cute music loading…<br><br>Playlist drops soon. Keep this window open in your heart.', 'OK');
      } else {
        showSignupPopup();
      }
    });
  });

  // ===== OLD-PC POPUP SYSTEM =====
  // Returns a close() for a popup: removes it, stops listening for Esc,
  // and puts keyboard focus back where it was before the popup opened.
  function closePopupHelper(overlay) {
    const returnFocus = document.activeElement;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    function close() {
      overlay.remove();
      document.removeEventListener('keydown', onKey);
      if (returnFocus && returnFocus.focus) returnFocus.focus();
    }
    document.addEventListener('keydown', onKey);
    return close;
  }

  window.showPcPopup = function(title, message, btnLabel) {
    const existing = document.querySelector('.pc-popup-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'pc-popup-overlay';
    overlay.innerHTML = `
      <div class="pc-popup" role="dialog" aria-modal="true" aria-label="${title}">
        <div class="pc-popup-titlebar">
          <span>${title}</span>
          <button type="button" class="close-btn" aria-label="Close">X</button>
        </div>
        <div class="pc-popup-body">
          <p>${message}</p>
          <button type="button" class="popup-btn">${btnLabel || 'OK'}</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const close = closePopupHelper(overlay);
    overlay.querySelector('.close-btn').addEventListener('click', close);
    overlay.querySelector('.popup-btn').addEventListener('click', close);
    overlay.querySelector('.popup-btn').focus();
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
  }

  function showSignupPopup() {
    const existing = document.querySelector('.pc-popup-overlay');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.className = 'pc-popup-overlay';
    overlay.innerHTML = `
      <div class="pc-popup signup-popup" role="dialog" aria-modal="true" aria-label="Secret club signup">
        <div class="pc-popup-titlebar"><span>secret-club-signup.exe</span><button type="button" class="close-btn" aria-label="Close">X</button></div>
        <div class="pc-popup-body">
          <p>✿ <b>you found the secret window!</b><br>Leave your email for new drops, restocks and little surprises.</p>
          <form class="signup-form"><label for="secret-email">your email</label><input id="secret-email" type="email" placeholder="angel@email.com" required><button class="popup-btn" type="submit">join the club ♡</button></form>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    const close = closePopupHelper(overlay);
    overlay.querySelector('.close-btn').addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    overlay.querySelector('#secret-email').focus();
    overlay.querySelector('.signup-form').addEventListener('submit', e => {
      e.preventDefault();
      overlay.querySelector('.pc-popup-body').innerHTML = '<p>♡ You are on the list! See you at the next drop.</p><button type="button" class="popup-btn">close</button>';
      overlay.querySelector('.popup-btn').addEventListener('click', close);
      overlay.querySelector('.popup-btn').focus();
    });
  }

  // ===== SILLY WINDOW CLOSE EASTER EGGS =====
  const closeMessages = [
    'Nice try. This item is emotionally attached to the shop.',
    'The little window ran away and came back because it likes you.',
    'You found the secret X. It only knows how to make sparkles.',
    'Error 2000: too cute to close.',
    'This listing has been tucked into a tiny digital blanket.'
  ];
  document.querySelectorAll('.product-card, .masonry-item').forEach((windowCard, index) => {
    if (windowCard.querySelector('.window-easter-x')) return;
    const closeButton = document.createElement('button');
    closeButton.className = 'window-easter-x';
    closeButton.type = 'button';
    closeButton.textContent = 'X';
    closeButton.setAttribute('aria-label', 'Close this tiny window');
    closeButton.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      windowCard.classList.add('window-wiggle');
      setTimeout(() => windowCard.classList.remove('window-wiggle'), 600);
      showPcPopup('whoops.exe', closeMessages[index % closeMessages.length], 'keep browsing');
    });
    windowCard.appendChild(closeButton);
  });
  document.querySelectorAll('.win-titlebar .close-btn').forEach((closeButton, index) => {
    closeButton.addEventListener('click', event => {
      event.preventDefault();
      showPcPopup('not so fast.exe', closeMessages[(index + 2) % closeMessages.length], 'okay okay');
    });
  });
  // ===== FILTER BUTTONS (Lookbook page) =====
  const filterBar = document.querySelector('.filter-bar');
  if (filterBar) {
    filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      document.querySelectorAll('.masonry-item').forEach(item => {
        if (filter === 'all' || item.dataset.tag === filter) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }

  // ===== MASONRY ITEMS (Lookbook page) =====
  document.querySelectorAll('.masonry-item').forEach(item => {
    item.addEventListener('click', () => {
      const tag = item.querySelector('.masonry-tag')?.textContent || item.dataset.tag || '';
      const imgSrc = item.querySelector('img')?.src || '';
      showPcPopup(
        tag || 'Lookbook',
        imgSrc ? `<img src="${imgSrc}" style="max-width:100%;border:2px solid #808080;">` : 'Look details coming soon!',
        'Close'
      );
    });
  });

  // ===== VISITOR COUNTER =====
  function initVisitorCounter() {
    const counters = document.querySelectorAll('.visitor-counter .count');
    counters.forEach(counter => {
      const target = parseInt(counter.dataset.target) || 13847;
      let current = 0;
      const increment = Math.ceil(target / 60);
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        counter.textContent = current.toLocaleString();
      }, 30);
    });
  }
  initVisitorCounter();

  // ===== WELCOME POPUP (first visit) =====
  function showWelcomePopup() {
    if (sessionStorage.getItem('popipants-welcomed')) return;
    sessionStorage.setItem('popipants-welcomed', 'true');
    setTimeout(() => {
      if (window.ppWelcome) window.ppWelcome();
    }, 1200);
  }
  showWelcomePopup();

});


