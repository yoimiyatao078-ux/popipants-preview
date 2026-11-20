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
    overlay.innerHTML = '<div class="mars-bar"><span>secret minigame</span>' +
      '<button type="button" class="mars-mute" aria-pressed="true">sound off</button>' +
      '<button type="button" class="mars-exit">exit</button></div>' +
      '<canvas width="320" height="180" aria-label="Malaz and the kitty on a trip to Mars"></canvas>' +
      '<p class="mars-live" role="status" aria-live="polite"></p>';
    document.body.appendChild(overlay);
    var canvas = overlay.querySelector('canvas');
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
        onLine: function (text) { overlay.querySelector('.mars-live').textContent = text; }
      });
      overlay.querySelector('.mars-exit').focus();
    }
    if (window.popiMars) begin();
    else {
      var script = document.createElement('script');
      script.src = 'js/mars-game.js?v=1795142000';
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
