/* Swaps the hero mood window. Video loads only once it is near the screen.
   Reduced motion keeps the still picture and never starts the loop. */
(function () {
  var SCENES = {
    pink: {
      title: 'angel_window.exe',
      alt: 'Pixel scene of a girl and a cat on a cloud in a pink sky.',
      still: 'images/scenes/angel.png',
      webm: 'images/scenes/angel.webm',
      mp4: 'images/scenes/angel.mp4'
    },
    blue: {
      title: 'lagoon_window.exe',
      alt: 'Pixel scene of a girl and a cat on a lily pad at sunset.',
      still: 'images/scenes/lagoon.png',
      webm: 'images/scenes/lagoon.webm',
      mp4: 'images/scenes/lagoon.mp4'
    },
    goth: {
      title: 'afterdark_window.exe',
      alt: 'Pixel scene of a girl and a cat on a lily pad under a night sky.',
      still: 'images/scenes/afterdark.png',
      webm: 'images/scenes/afterdark.webm',
      mp4: 'images/scenes/afterdark.mp4'
    }
  };

  var root = document.querySelector('.mood-scene');
  if (!root) return;
  var video = root.querySelector('.mood-scene-vid');
  var still = root.querySelector('.mood-scene-still');
  var title = root.querySelector('.mood-scene-title');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var current = '';
  var loadedKey = '';
  var seen = false;

  function moodKey() {
    var t = document.documentElement.getAttribute('data-theme') || 'pink';
    if (t.indexOf('goth') === 0) return 'goth';
    if (t === 'blue') return 'blue';
    return 'pink';
  }

  function apply() {
    var key = moodKey();
    var scene = SCENES[key];
    var motion = !reduce.matches;
    if (key !== current) {
      current = key;
      title.textContent = scene.title;
      still.alt = scene.alt;
      if (still.getAttribute('src') !== scene.still) still.src = scene.still;
      video.setAttribute('poster', scene.still);
      if (loadedKey && loadedKey !== key) {
        video.pause();
        loadedKey = '';
        while (video.firstChild) video.removeChild(video.firstChild);
        video.removeAttribute('src');
      }
    }
    root.classList.toggle('is-motion', motion);
    root.classList.toggle('is-still', !motion);
    if (!motion) {
      video.pause();
      return;
    }
    if (!seen || loadedKey === key) {
      if (loadedKey === key) {
        var again = video.play();
        if (again && again.catch) again.catch(function () {});
      }
      return;
    }
    var webm = document.createElement('source');
    webm.src = scene.webm;
    webm.type = 'video/webm';
    var mp4 = document.createElement('source');
    mp4.src = scene.mp4;
    mp4.type = 'video/mp4';
    video.appendChild(webm);
    video.appendChild(mp4);
    video.load();
    loadedKey = key;
    var play = video.play();
    if (play && play.catch) play.catch(function () {});
  }

  if ('IntersectionObserver' in window) {
    var watch = new IntersectionObserver(function (entries) {
      if (entries.some(function (entry) { return entry.isIntersecting; })) {
        seen = true;
        apply();
        watch.disconnect();
      }
    }, { rootMargin: '240px 0px' });
    watch.observe(root);
  } else {
    seen = true;
  }

  new MutationObserver(apply).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  if (reduce.addEventListener) reduce.addEventListener('change', apply);
  apply();

  var opening = false;
  function openGame() {
    if (document.querySelector('.mars-overlay') || opening) return;
    opening = true;
    var overlay = document.createElement('div');
    overlay.className = 'mars-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'secret minigame');
    overlay.innerHTML = '<div class="mars-shell">' +
      '<div class="mars-bar"><span class="mars-speakers" aria-hidden="true"></span><span>secret minigame</span>' +
        '<button type="button" class="mars-mute" aria-pressed="true">sound off</button>' +
        '<button type="button" class="mars-exit">exit</button></div>' +
      '<div class="mars-screen">' +
        '<div class="mars-stage">' +
          '<canvas width="480" height="270" aria-label="Malaz and the kitty on a trip to Mars"></canvas>' +
          '<div class="mars-chapters"></div>' +
          '<div class="mars-dress" hidden>' +
            '<p class="mars-dress-kicker">dress-up shop</p>' +
            '<p class="mars-dress-title">he picked your outfit</p>' +
            '<ul>' +
              '<li><b>malaz</b> rainbow mohawk, tutu, puffy sleeves, mismatched socks</li>' +
              '<li><b>kitty</b> frill wig and a party dress</li>' +
            '</ul>' +
            '<button type="button" class="mars-dress-reset" disabled>reset</button>' +
          '</div>' +
        '</div>' +
        '<div class="mars-talk" hidden>' +
          '<canvas class="mars-face" width="40" height="40" aria-hidden="true"></canvas>' +
          '<div class="mars-talk-copy"><span class="mars-name"></span><span class="mars-line"></span></div>' +
          '<button type="button" class="mars-next">next</button>' +
        '</div>' +
      '</div>' +
      '<div class="mars-chin">' +
        '<div class="mars-dpad">' +
          '<button type="button" class="pad-up" data-pad="up" aria-label="Move up or jump">▲</button>' +
          '<button type="button" class="pad-left" data-pad="left" aria-label="Move left">◀</button>' +
          '<span class="pad-nub" aria-hidden="true"></span>' +
          '<button type="button" class="pad-right" data-pad="right" aria-label="Move right">▶</button>' +
          '<button type="button" class="pad-down" data-pad="down" aria-label="Move down">▼</button>' +
        '</div>' +
        '<p class="mars-keys">arrows or wasd move · space or z shoots · enter talks</p>' +
        '<div class="mars-hearts">' +
          '<button type="button" class="mars-heart" data-pad="action" aria-label="Shoot"><i class="px-heart" aria-hidden="true"></i></button>' +
          '<button type="button" class="mars-heart mars-heart-sm" data-pad="action" aria-label="Shoot"><i class="px-heart" aria-hidden="true"></i></button>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="mars-pads">' +
      '<button type="button" data-pad="left" aria-label="Move left">◀</button>' +
      '<button type="button" data-pad="up" aria-label="Move up or jump">▲</button>' +
      '<button type="button" data-pad="right" aria-label="Move right">▶</button>' +
      '<button type="button" data-pad="action" aria-label="Shoot">✦</button>' +
    '</div>' +
    '<p class="mars-live" role="status" aria-live="polite"></p>';
    document.body.appendChild(overlay);
    var canvas = overlay.querySelector('.mars-stage canvas');
    var back = document.activeElement;
    function close() {
      if (window.popiMars && window.popiMars.stop) window.popiMars.stop();
      overlay.remove();
      opening = false;
      if (back && back.focus) back.focus();
    }
    overlay.querySelector('.mars-exit').addEventListener('click', close);
    overlay.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    function begin() {
      window.popiMars.start(canvas, {
        muteButton: overlay.querySelector('.mars-mute'),
        onExit: close,
        stage: overlay.querySelector('.mars-stage'),
        chapters: overlay.querySelector('.mars-chapters'),
        talk: overlay.querySelector('.mars-talk'),
        dress: overlay.querySelector('.mars-dress'),
        pads: overlay.querySelector('.mars-pads'),
        chin: overlay.querySelector('.mars-chin'),
        onLine: function (text) { overlay.querySelector('.mars-live').textContent = text; }
      });
      canvas.tabIndex = 0;
      try { canvas.focus(); } catch (err) {}
    }
    if (window.popiMars) begin();
    else {
      var script = document.createElement('script');
      script.src = 'js/mars-game.js?v=1795306800';
      script.onload = begin;
      script.onerror = function () { opening = false; overlay.remove(); };
      document.body.appendChild(script);
    }
  }
  root.addEventListener('click', function (e) {
    if (e.target.closest('.mood-game-btn') || e.target.closest('.mood-scene-stage') || e.target.closest('.mood-scene-win')) openGame();
  });
  var stage = root.querySelector('.mood-scene-stage');
  if (stage) stage.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openGame(); }
  });
})();
