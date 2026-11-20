/* Malaz trapped in the homepage CD. Pixels come from js/cd-trap-sprite.js,
   copied off the official chibi. The disc keeps spinning in CSS; she stays
   upright in the hole and knocks on the glass. Reduced motion holds frame 0. */
(function () {
  var data = window.POPI_CD_MALAZ;
  if (!data) return;
  var canvases = document.querySelectorAll("canvas.cd-trap-girl");
  if (!canvases.length) return;
  var mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  var timers = [];

  function fill(ctx, dots) {
    var buckets = {};
    for (var i = 0; i < dots.length; i++) {
      var p = dots[i];
      var key = p[2] + "," + p[3] + "," + p[4];
      (buckets[key] || (buckets[key] = [])).push(p);
    }
    for (var key in buckets) {
      ctx.fillStyle = "rgb(" + key + ")";
      var list = buckets[key];
      for (var j = 0; j < list.length; j++) {
        ctx.fillRect(list[j][0], list[j][1], 1, 1);
      }
    }
  }

  function paint(ctx, index) {
    var frame = data.frames[index];
    ctx.clearRect(0, 0, data.grid[0], data.grid[1]);
    fill(ctx, frame.back);
    var ox = data.origin[0] + frame.dx;
    var oy = data.origin[1] + frame.dy;
    var eyes = {};
    if (frame.blink) {
      for (var e = 0; e < data.eyes.length; e++) eyes[data.eyes[e][0] + "," + data.eyes[e][1]] = 1;
    }
    var skin = data.skin;
    var buckets = {};
    for (var i = 0; i < data.pixels.length; i++) {
      var p = data.pixels[i];
      var col = eyes[p[0] + "," + p[1]] ? skin : [p[2], p[3], p[4]];
      var key = col[0] + "," + col[1] + "," + col[2];
      (buckets[key] || (buckets[key] = [])).push([ox + p[0], oy + p[1]]);
    }
    for (var key in buckets) {
      ctx.fillStyle = "rgb(" + key + ")";
      var list = buckets[key];
      for (var j = 0; j < list.length; j++) ctx.fillRect(list[j][0], list[j][1], 1, 1);
    }
    fill(ctx, frame.front);
  }

  function arm(canvas) {
    var ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    var index = 0;
    paint(ctx, 0);
    if (mq.matches) return;
    var timer = window.setInterval(function () {
      index = (index + 1) % data.frames.length;
      paint(ctx, index);
    }, data.ms);
    timers.push(timer);
  }

  canvases.forEach(arm);

  if (mq.addEventListener) {
    mq.addEventListener("change", function () {
      timers.forEach(function (id) { window.clearInterval(id); });
      timers = [];
      canvases.forEach(arm);
    });
  }
})();
