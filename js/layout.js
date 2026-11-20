/* =====================================================================
   POPIPANTS — SHARED PAGE PARTS (sidebar, top menu, marquee, footer)
   ---------------------------------------------------------------------
   Edit the menus / sidebar / footer HERE once, and every page updates.

   How a page uses it (already set up in every .html file):
     <script src="js/layout.js" data-part="marquee" data-text="HELLO"></script>
     <script src="js/layout.js" data-part="sidebar"></script>
     <script src="js/layout.js" data-part="topnav"></script>
     <script src="js/layout.js" data-part="footer" data-footer="home|social|counter"></script>

   Each tag is swapped for the matching HTML right where it sits, while the
   page is still loading, so nothing jumps around or flashes.
   No server tricks needed: works on Vercel, locally, even by double-click.
   ===================================================================== */
(function () {
  var script = document.currentScript;
  if (!script) return;
  var part = script.getAttribute('data-part');

  /* ---- Pages in the left "navigate.exe" menu (label, file) ---- */
  var SIDEBAR_LINKS = [
    ['Home', 'index.html'],
    ['Shop the drop', 'collection.html'],
    ['Lookbook', 'lookbook.html'],
    ['My Story', 'about.html'],
    ['Contact', 'contact.html'],
    ['Wishlist', 'wishlist.html']
  ];

  /* ---- Round pill buttons along the top (icon, label, link) ---- */
  var TOP_LINKS = [
    ['♡', 'Tees', 'collection.html?cat=tees'],
    ['✿', 'Pants', 'collection.html'],
    ['✦', 'Accessories', 'collection.html?cat=accessories'],
    ['☁', 'New drop', 'collection.html?cat=limited'],
    ['☏', 'Contact', 'contact.html']
  ];

  /* ---- Mood hearts (theme id, accessible name, short note) ---- */
  var THEMES = [
    ['pink', 'Pink', 'angel girly'],
    ['blue', 'Blue tropical', 'lagoon'],
    ['goth3', 'Goth', 'after dark']
  ];

  /* Which page are we on? Works with "about.html", "/about" (Vercel) and "/" */
  var here = location.pathname.split('/').pop().replace(/\.html$/, '') || 'index';
  function isHere(file) { return file.replace(/\.html.*$/, '') === here; }

  /* Glossy Y2K gel heart. Vector art, one per mood. Ids stay unique on the page. */
  function gelHeart(theme) {
    var fills = {
      pink: '<stop offset="0" stop-color="#fff"/><stop offset=".16" stop-color="#FFE6F2"/><stop offset=".46" stop-color="#FF8FBE"/><stop offset=".74" stop-color="#FF5FA2"/><stop offset="1" stop-color="#E23B86"/>',
      blue: '<stop offset="0" stop-color="#F7FFFE"/><stop offset=".2" stop-color="#C9FBF4"/><stop offset=".48" stop-color="#55DECA"/><stop offset=".76" stop-color="#01BAB5"/><stop offset="1" stop-color="#0E8F8A"/>',
      goth3: '<stop offset="0" stop-color="#F4E9FF"/><stop offset=".16" stop-color="#B9A0D6"/><stop offset=".42" stop-color="#3A2A48"/><stop offset=".7" stop-color="#120E16"/><stop offset="1" stop-color="#050505"/>'
    };
    var extra = theme === 'blue'
      ? '<circle cx="46" cy="16" r="3.6" fill="#FFE08A"/><circle cx="44.7" cy="14.8" r="1.3" fill="#fff" fill-opacity=".9"/>'
      : '';
    var id = 'mh-' + theme;
    return '<svg class="mood-heart-svg" viewBox="0 0 64 58" aria-hidden="true" focusable="false">' +
      '<defs>' +
        '<linearGradient id="' + id + '" x1="18%" y1="0" x2="82%" y2="100%">' + (fills[theme] || fills.pink) + '</linearGradient>' +
        '<linearGradient id="' + id + '-rim" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#ffffff"/>' +
          '<stop offset=".38" stop-color="#e4e4ee"/>' +
          '<stop offset=".55" stop-color="#8d8d9c"/>' +
          '<stop offset="1" stop-color="#f7f7fb"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<path fill="url(#' + id + ')" stroke="url(#' + id + '-rim)" stroke-width="3.2" stroke-linejoin="round" d="M32 52C32 52 7 36.5 7 22.2 7 12.4 14.4 6.2 22.6 9.2 26.8 10.7 29.8 14.6 32 19.4 34.2 14.6 37.2 10.7 41.4 9.2 49.6 6.2 57 12.4 57 22.2 57 36.5 32 52 32 52Z"/>' +
      '<ellipse cx="23.2" cy="17.2" rx="8" ry="4.1" fill="#fff" fill-opacity=".92" transform="rotate(-34 23.2 17.2)"/>' +
      extra +
    '</svg>' +
    '<span class="mood-spark" aria-hidden="true"><i></i><i></i><i></i></span>';
  }

  var html = {
    marquee: function () {
      return '<a class="skip-link" href="#main">Skip to content</a>' +
        '<div class="marquee-bar" aria-hidden="true"><span class="marquee-text">' +
        (script.getAttribute('data-text') || '✦ POPIPANTS ONLINE ✦') + '</span></div>';
    },

    sidebar: function () {
      var links = SIDEBAR_LINKS.map(function (l) {
        var on = isHere(l[1]);
        return '<li><a href="' + l[1] + '"' + (on ? ' class="active" aria-current="page"' : '') + '>' + l[0] + '</a></li>';
      }).join('');
      var boxes = THEMES.map(function (t) {
        return '<button type="button" class="theme-btn mood-heart" data-theme="' + t[0] + '" aria-label="' + t[1] + ' mood, ' + t[2] + '" aria-pressed="false">' +
          gelHeart(t[0]) +
          '<span class="tooltip">' + t[1] + ' — ' + t[2] + '</span></button>';
      }).join('');
      return '' +
        '<aside class="sidebar">' +
          '<nav class="sidebar-section" aria-label="Pages">' +
            '<div class="sidebar-title"><span>navigate.exe</span></div>' +
            '<ul class="sidebar-nav">' + links + '</ul>' +
          '</nav>' +
          '<div class="sidebar-section theme-dock">' +
            '<div class="sidebar-title"><span>mood selector</span></div>' +
            '<div class="mood-cluster">' +
              '<p class="mood-ask" id="mood-ask">what’s your mood?</p>' +
              '<div class="theme-switcher theme-switcher-inline" role="group" aria-labelledby="mood-ask">' + boxes + '</div>' +
              '<p class="mood-psst" id="mood-psst" hidden>' +
                '<span class="mood-psst-copy" id="mood-psst-copy">psst… try another mood ♡</span>' +
                '<button type="button" class="mood-psst-x" aria-label="Dismiss mood hint">×</button>' +
              '</p>' +
            '</div>' +
          '</div>' +
          '<button class="figurine-button" type="button" data-popup="signup" aria-label="Open secret club signup">' +
            '<span>click me<br>for secrets</span>' +
          '</button>' +
          '<button type="button" class="sidebar-cd music-cd-toggle" aria-label="Play background music" aria-pressed="false">' +
            '<span class="cd" aria-hidden="true"></span><span class="badge" aria-hidden="true"><b><span class="bt"></span><span class="bp"><i></i><i></i></span></b></span>' +
          '</button>' +
        '</aside>';
    },

    topnav: function () {
      var mlinks = SIDEBAR_LINKS.map(function (l) { return '<a href="' + l[1] + '"' + (isHere(l[1]) ? ' class="active"' : '') + '>' + l[0] + '</a>'; }).join('');
      return '<div class="combo-mbar"><a class="brand-logo combo-mlogo" href="index.html">popipants</a>' +
        '<button type="button" class="gelbtn combo-menu" aria-expanded="false"><span><b>menu ♡</b></span></button>' +
        '<nav class="combo-drop-menu" aria-label="Menu">' + mlinks + '<a href="https://tise.com/popipants" target="_blank" rel="noopener">tise ↗</a></nav></div>' +
        '<button type="button" class="combo-fcd music-cd-toggle" aria-label="Play background music" aria-pressed="false"><span class="cd" aria-hidden="true"></span><span class="badge" aria-hidden="true"><b><span class="bt"></span><span class="bp"><i></i><i></i></span></b></span></button>' +
        '<nav class="top-nav category-nav" aria-label="Shop categories">' +
        TOP_LINKS.map(function (l) {
          return '<a href="' + l[2] + '">' + l[1] + '</a>';
        }).join('') + '</nav>';
    },

    footer: function () {
      var kind = script.getAttribute('data-footer') || 'social';
      if (kind === 'home') {
        return '<footer class="footer"><p class="footer-text">Handmade character streetwear from Trondheim, Norway ♥</p>' +
          '<div class="social-links">' +
            '<a href="#" class="social-link" title="Instagram" aria-label="Instagram">◎</a>' +
            '<a href="#" class="social-link" title="TikTok" aria-label="TikTok">♪</a>' +
          '</div><span class="best-viewed">best viewed with cute music on</span></footer>';
      }
      var extra = kind === 'counter'
        ? '<span class="visitor-counter">Visitors: <span class="count" data-target="13847">0</span> ★</span>'
        : '<div class="social-links">' +
            '<a href="#" class="social-link" title="Instagram" aria-label="Instagram">📷</a>' +
            '<a href="#" class="social-link" title="TikTok" aria-label="TikTok">🎵</a>' +
            '<a href="#" class="social-link" title="Twitter" aria-label="Twitter">🐦</a>' +
          '</div>';
      return '<footer class="footer">' +
        '<div class="footer-logo">POPIPANTS ★</div>' +
        '<p class="footer-text">Handmade character streetwear from Trondheim, Norway ♥</p>' +
        '<p class="footer-text footer-copy">© 2026 Popipants. All rights reserved.</p>' +
        extra +
        '<span class="best-viewed">Best viewed in 1024×768</span>' +
      '</footer>';
    }
  };

  if (html[part]) script.insertAdjacentHTML('beforebegin', html[part]());
  script.remove();
})();

