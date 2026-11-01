/* Runs in <head> before the page is drawn, so the saved colour theme
   is applied instantly (no pink flash when you picked another theme). */
(function () {
  try {
    var m = /[?&]mood=(\w+)/.exec(location.search);
    if (m && /^(pink|blue|red|goth|goth2|goth3|goth4)$/.test(m[1])) localStorage.setItem('popipants-theme', m[1] === 'red' ? 'pink' : m[1]);
    var t = localStorage.getItem('popipants-theme');
    if (t === 'black') t = 'goth'; // old name
    if (t === 'red') { t = 'pink'; localStorage.setItem('popipants-theme', 'pink'); } // red mood retired
    if (t && t !== 'pink') document.documentElement.setAttribute('data-theme', t);
  } catch (e) {}
})();

/* Rarely used moods (goth, goth2, goth4: reachable only by ?mood= links) keep their big stylesheets
   out of every page load: their <link data-mood> tags only get an href when that mood is active. */
window.popiMoodCss = function () {
  var t = document.documentElement.getAttribute('data-theme');
  var ls = document.querySelectorAll('link[data-mood]');
  for (var i = 0; i < ls.length; i++) if (ls[i].getAttribute('data-mood') === t && !ls[i].href) ls[i].href = ls[i].getAttribute('data-href');
};
