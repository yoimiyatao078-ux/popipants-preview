/* Runs in <head> before the page is drawn, so the saved colour theme
   is applied instantly (no pink flash when you picked another theme). */
(function () {
  try {
    var t = localStorage.getItem('popipants-theme');
    if (t === 'black') t = 'goth'; // old name
    if (t && t !== 'pink') document.documentElement.setAttribute('data-theme', t);
  } catch (e) {}
})();
