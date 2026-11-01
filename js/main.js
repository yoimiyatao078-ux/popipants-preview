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
      // calm goth mood: only every third twinkle is drawn
      const thin = document.documentElement.getAttribute('data-theme') === 'goth3';
      sparkles.forEach((s, i) => {
        s.update();
        if (!thin || i % 3 === 0) s.draw();
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
  // pink (default) · blue (tropical) · goth — persisted in localStorage
  function initThemeSwitcher() {
    const THEMES = ['pink', 'blue', 'goth', 'goth2', 'goth3', 'goth4'];
    const themeBtns = document.querySelectorAll('.theme-btn');
    let savedTheme = localStorage.getItem('popipants-theme') || 'pink';
    if (savedTheme === 'black') savedTheme = 'goth';
    if (!THEMES.includes(savedTheme)) savedTheme = 'pink';

    // iOS Safari can keep a stale composited filter/drop-shadow (e.g. the old goth glow on the
    // multiply-blended hero player) after the theme changes. Re-rasterise filtered art on switch.
    const FX_SEL = '.hero-phone-sticker,.cd-sticker,.music-notes-sticker,.made-in-japan-sticker,.norway-sticker,.inspo-shelf img,.px-cat,.critter,.cd,.brand-logo,.px-cloud-divider .pxc';
    const repaintFx = () => {
      const els = document.querySelectorAll(FX_SEL);
      els.forEach(e => { e.style.setProperty('filter', 'none', 'important'); e.style.willChange = 'filter'; });
      void document.body.offsetHeight;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        els.forEach(e => { e.style.removeProperty('filter'); e.style.removeProperty('will-change'); });
      }));
    };
    const apply = (theme) => {
      if (theme === 'pink') document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', theme);
      repaintFx();
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
  // music lives in js/music.js (one shared audio controller)
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
      const em = overlay.querySelector('#secret-email').value.trim();
      if (window.popiSubscribe) window.popiSubscribe(em, 'secret-club').catch(() => {});
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


