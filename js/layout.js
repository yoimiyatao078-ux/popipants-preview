/* =====================================================================
   POPIPANTS — SHARED PAGE PARTS (sidebar, top menu, marquee, footer)
   ---------------------------------------------------------------------
   Edit the menus / sidebar / footer HERE once, and every page updates.

   How a page uses it (already set up in every .html file):
     <script src="js/layout.js" data-part="marquee" data-text="★彡 HELLO ★彡"></script>
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
    ['Contact', 'contact.html']
  ];

  /* ---- Round pill buttons along the top (icon, label, link) ---- */
  var TOP_LINKS = [
    ['♡', 'Tees', 'collection.html?cat=tees'],
    ['✿', 'Pants', 'collection.html'],
    ['✦', 'Accessories', 'collection.html?cat=accessories'],
    ['☁', 'New drop', 'collection.html?cat=limited'],
    ['☏', 'Contact', 'contact.html']
  ];

  /* ---- The four colour boxes (theme id, tooltip) ---- */
  var THEMES = [
    ['pink', 'Pink', 'angel girly'],
    ['blue', 'Blue', 'tropical'],
    ['red', 'Red', 'downtown'],
    ['goth', 'Goth', 'after dark']
  ];

  /* Which page are we on? Works with "about.html", "/about" (Vercel) and "/" */
  var here = location.pathname.split('/').pop().replace(/\.html$/, '') || 'index';
  function isHere(file) { return file.replace(/\.html.*$/, '') === here; }

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
        return '<button type="button" class="theme-btn" data-theme="' + t[0] + '" aria-label="' + t[1] + ' theme" aria-pressed="false">' +
          '<span class="tooltip">' + t[1] + ' — ' + t[2] + '</span></button>';
      }).join('');
      return '' +
        '<aside class="sidebar">' +
          '<nav class="sidebar-section" aria-label="Pages">' +
            '<div class="sidebar-title"><span>✦ navigate.exe</span></div>' +
            '<ul class="sidebar-nav">' + links + '</ul>' +
          '</nav>' +
          '<div class="sidebar-section theme-dock">' +
            '<div class="sidebar-title"><span>✦ mood selector</span></div>' +
            '<p>Choose your universe</p>' +
            '<div class="theme-switcher theme-switcher-inline" role="group" aria-label="Colour theme">' + boxes + '</div>' +
            '<small>4 colour worlds ✦ pick yours</small>' +
          '</div>' +
          '<button class="figurine-button" type="button" data-popup="signup" aria-label="Open secret club signup">' +
            '<span class="figurine" aria-hidden="true">✿</span><span>click me<br>for secrets</span>' +
          '</button>' +
          '<button type="button" class="sidebar-cd music-cd-toggle" aria-label="Play background music" aria-pressed="false">' +
            '<span class="cd" aria-hidden="true"></span><span class="badge" aria-hidden="true"><b><span class="bt"></span><span class="bp"><i></i><i></i></span></b></span>' +
          '</button>' +
          '<p class="sidebar-location">♥ handmade in Trondheim<br>since 2026</p>' +
          '<img class="made-in-japan-sticker made-in-norway-badge" src="images/art/made-in-norway-badge.png" alt="Made in Norway">' +
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
          return '<a href="' + l[2] + '"><span aria-hidden="true">' + l[0] + '</span> ' + l[1] + '</a>';
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
        '<div class="footer-logo">POPIPANTS ★彡</div>' +
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

