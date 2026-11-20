/* secret minigame. Loaded only after the mood window is opened.
   Kitty and Malaz sprites are cropped from the site's own pixel scene.
   Unicorn and Santafoto are drawn with canvas pixels. No generated images. */
(function () {
  var W = 320, H = 180, GROUND = 118;
  var kitty = new Image();
  var malaz = new Image();
  kitty.src = 'images/scenes/sprite-kitty.png';
  malaz.src = 'images/scenes/sprite-malaz.png';

  var canvas, ctx, opts, raf, running;
  var keys = {};
  var hold = { left: false, right: false, up: false, action: false };
  var pointers = {};
  var muted = true;
  var audio;
  var mode = 'title';
  var level = 1;
  var time = 0;
  var stars, rocks, shots, foeShots, player, foe, lives, goal, talk, talkI, ally, vibe;

  function resetInput() {
    hold.left = hold.right = hold.up = hold.action = false;
  }

  function beep(freq, len, kind) {
    if (muted) return;
    try {
      if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume();
      var o = audio.createOscillator();
      var g = audio.createGain();
      o.type = kind || 'square';
      o.frequency.value = freq;
      g.gain.value = 0.04;
      o.connect(g);
      g.connect(audio.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + len);
      o.stop(audio.currentTime + len);
    } catch (e) {}
  }

  function say(lines) {
    talk = lines;
    talkI = 0;
    mode = 'talk';
    if (opts && opts.onLine) opts.onLine(lines[0].name + ': ' + lines[0].text);
  }

  function nextLine() {
    talkI += 1;
    if (!talk || talkI >= talk.length) {
      var nxt = talk && talk._next;
      if (nxt) beginLevel(nxt);
      else mode = 'play';
      if (opts && opts.onLine) opts.onLine('');
      beep(520, 0.05);
      return;
    }
    if (opts && opts.onLine) opts.onLine(talk[talkI].name + ': ' + talk[talkI].text);
    beep(440, 0.04);
  }

  function freshPlayer() {
    player = { x: 28, y: level === 1 ? 70 : GROUND - 36, vx: 0, vy: 0, cool: 0, inv: 0 };
  }

  function beginLevel(n) {
    level = n;
    time = 0;
    stars = [];
    rocks = [];
    shots = [];
    foeShots = [];
    lives = 3;
    ally = n === 3;
    vibe = 0;
    if (n === 1) {
      goal = 8;
      foe = null;
      freshPlayer();
      say([
        { name: 'Malaz', text: 'kitty. snacks are packed. next stop, mars.' },
        { name: 'Kitty', text: 'mrrp. i call window seat.' }
      ]);
    } else if (n === 2) {
      foe = { kind: 'uni', x: 210, y: GROUND - 42, hp: 6, max: 6, cool: 40, friendly: false };
      freshPlayer();
      say([
        { name: 'Malaz', text: 'we landed. why is there a unicorn.' },
        { name: 'Unicorn', text: 'neigh. this crater is mine.' }
      ]);
    } else {
      foe = { kind: 'santa', x: 188, y: GROUND - 60, hp: 10, max: 10, cool: 30, vy: 0, belly: 0 };
      freshPlayer();
      say([
        { name: 'Malaz', text: 'huge belly. tiny boots. that is santafoto.' },
        { name: 'Santafoto', text: 'ho ho. i brought coal and a warm soda.' }
      ]);
    }
  }

  function hit(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function hurt() {
    if (player.inv > 0) return;
    lives -= 1;
    player.inv = 50;
    beep(140, 0.12, 'sawtooth');
    if (lives <= 0) beginLevel(level);
  }

  function shootHeart() {
    if (player.cool > 0) return;
    player.cool = 16;
    shots.push({ x: player.x + 28, y: player.y + 12, vx: 3.2, w: 7, h: 6 });
    beep(660, 0.05);
  }

  function updatePlay() {
    time += 1;
    var left = keys.ArrowLeft || keys.KeyA || hold.left;
    var right = keys.ArrowRight || keys.KeyD || hold.right;
    var up = keys.ArrowUp || keys.KeyW || hold.up;
    var action = keys.Space || keys.KeyZ || hold.action;
    if (player.cool > 0) player.cool -= 1;
    if (player.inv > 0) player.inv -= 1;

    if (level === 1) {
      player.y += (up ? -1.7 : 0) + ((keys.ArrowDown || keys.KeyS) ? 1.7 : 0);
      player.x += (right ? 1.2 : 0) - (left ? 1.2 : 0);
      player.x = Math.max(8, Math.min(90, player.x));
      player.y = Math.max(16, Math.min(120, player.y));
      if (action) shootHeart();
      if (time % 28 === 0) rocks.push({ x: W + 8, y: 18 + Math.random() * 100, vx: -1.5 - Math.random(), w: 10, h: 10 });
      if (time % 22 === 0) stars.push({ x: W + 4, y: 20 + Math.random() * 96, w: 7, h: 7 });
      rocks.forEach(function (r) { r.x += r.vx; });
      stars.forEach(function (s) { s.x -= 1.3; });
      var body = { x: player.x, y: player.y, w: 34, h: 22 };
      rocks = rocks.filter(function (r) {
        if (hit(body, r)) { hurt(); return false; }
        return r.x > -20;
      });
      var got = 0;
      stars = stars.filter(function (s) {
        if (hit(body, s)) { got += 1; return false; }
        return s.x > -10;
      });
      if (got) { goal -= got; beep(880, 0.06); }
      shots.forEach(function (s) { s.x += s.vx; });
      shots = shots.filter(function (s) {
        var keep = s.x < W;
        rocks = rocks.filter(function (r) {
          if (hit(s, r)) { keep = false; beep(200, 0.04); return false; }
          return true;
        });
        return keep;
      });
      if (goal <= 0) beginLevel(2);
      return;
    }

    player.x += (right ? 1.6 : 0) - (left ? 1.6 : 0);
    player.x = Math.max(6, Math.min(150, player.x));
    player.vy += 0.28;
    player.y += player.vy;
    if (player.y > GROUND - 36) { player.y = GROUND - 36; player.vy = 0; }
    if (up && player.vy === 0) { player.vy = -4.2; beep(500, 0.05); }
    if (action) shootHeart();

    if (foe && foe.kind === 'uni' && !foe.friendly) {
      foe.x = 200 + Math.sin(time / 28) * 18;
      foe.y = GROUND - 42 - Math.abs(Math.sin(time / 18)) * 16;
      foe.cool -= 1;
      if (foe.cool <= 0) {
        foe.cool = 42;
        foeShots.push({ x: foe.x, y: foe.y + 8, vx: -1.8, vy: Math.sin(time / 8) * 0.6, w: 6, h: 6, rainbow: true });
      }
    }
    if (foe && foe.kind === 'santa') {
      foe.cool -= 1;
      foe.vy += 0.18;
      foe.y += foe.vy;
      if (foe.y > GROUND - 60) {
        if (foe.vy > 1.2) foe.belly = 10;
        foe.y = GROUND - 60;
        foe.vy = 0;
      }
      if (foe.belly > 0) foe.belly -= 1;
      if (foe.cool <= 0) {
        foe.cool = 70;
        if (time % 140 < 70) foe.vy = -3.4;
        else foeShots.push({ x: foe.x, y: foe.y + 10, vx: -2.1, vy: -1.4, w: 6, h: 6, coal: true });
      }
      if (ally && time % 48 === 0) shots.push({ x: player.x + 46, y: player.y + 8, vx: 2.6, w: 6, h: 5, rainbow: true });
    }

    foeShots.forEach(function (s) { s.x += s.vx; s.y += s.vy || 0; if (s.coal) s.vy += 0.08; });
    var body = { x: player.x + 4, y: player.y + 4, w: 22, h: 28 };
    foeShots = foeShots.filter(function (s) {
      if (hit(body, s)) { hurt(); return false; }
      if (foe && foe.kind === 'santa' && foe.belly > 6 && s.y > GROUND - 8) return false;
      return s.x > -10 && s.x < W + 10 && s.y < H;
    });
    if (foe && foe.kind === 'santa' && foe.belly === 8 && player.y > GROUND - 42) hurt();

    shots.forEach(function (s) { s.x += s.vx; });
    shots = shots.filter(function (s) {
      if (s.x > W) return false;
      if (!foe || foe.friendly) return true;
      var box = foe.kind === 'uni'
        ? { x: foe.x, y: foe.y, w: 40, h: 42 }
        : { x: foe.x - 8, y: foe.y, w: 64, h: 62 };
      if (hit(s, box)) {
        foe.hp -= 1;
        beep(300, 0.06, 'triangle');
        return false;
      }
      return true;
    });

    if (foe && foe.hp <= 0 && !foe.friendly) {
      if (foe.kind === 'uni') {
        foe.friendly = true;
        ally = true;
        say([
          { name: 'Unicorn', text: 'ow. okay. your hearts are annoying.' },
          { name: 'Unicorn', text: 'fake santa is ruder. i am on your side.' },
          { name: 'Kitty', text: 'mrrp. welcome aboard.' }
        ]);
        talk._next = 3;
      } else {
        winGame();
      }
    }
  }

  function winGame() {
    vibe = 0;
    beep(520, 0.08);
    beep(680, 0.1);
    say([
      { name: 'Malaz', text: 'the belly bounced home. mars is cute now.' },
      { name: 'Kitty', text: 'mrrp mrrp. victory wiggle.' }
    ]);
    mode = 'win';
  }

  function update() {
    if (mode === 'play') updatePlay();
    if (mode === 'win') vibe += 1;
  }

  function sprite(img, x, y, h) {
    if (!img.complete || !img.naturalWidth) return;
    var sc = h / img.naturalHeight;
    ctx.drawImage(img, x, y, img.naturalWidth * sc, h);
  }

  function drawHeart(x, y) {
    ctx.fillStyle = '#FF5FA2';
    ctx.fillRect(x + 1, y, 2, 1);
    ctx.fillRect(x + 4, y, 2, 1);
    ctx.fillRect(x, y + 1, 7, 2);
    ctx.fillRect(x + 1, y + 3, 5, 1);
    ctx.fillRect(x + 2, y + 4, 3, 1);
    ctx.fillRect(x + 3, y + 5, 1, 1);
  }

  function drawUnicorn(x, y, friendly) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(x, y + 16, 36, 16);
    ctx.fillRect(x + 26, y + 6, 14, 16);
    ctx.fillStyle = '#FF5FA2';
    ctx.fillRect(x + 34, y, 4, 8);
    ctx.fillRect(x + 36, y + 2, 4, 4);
    ctx.fillStyle = friendly ? '#7FD6FF' : '#FF9EC7';
    ctx.fillRect(x + 22, y + 8, 6, 12);
    ctx.fillRect(x + 18, y + 14, 6, 8);
    ctx.fillStyle = '#222';
    ctx.fillRect(x + 32, y + 10, 3, 3);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 4, y + 32, 4, 10);
    ctx.fillRect(x + 14, y + 32, 4, 10);
    ctx.fillRect(x + 26, y + 32, 4, 10);
    ctx.fillStyle = friendly ? '#B8F2C8' : '#FFD6E8';
    ctx.fillRect(x - 6, y + 16, 8, 4);
    ctx.fillRect(x - 8, y + 20, 6, 4);
  }

  function drawSanta(x, y, belly) {
    var b = belly > 0 ? 8 : 0;
    ctx.fillStyle = '#E23B4A';
    ctx.fillRect(x + 16, y, 24, 8);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 36, y + 2, 8, 6);
    ctx.fillRect(x + 12, y + 8, 30, 12);
    ctx.fillStyle = '#F3C7A1';
    ctx.fillRect(x + 18, y + 10, 16, 8);
    ctx.fillStyle = '#222';
    ctx.fillRect(x + 22, y + 12, 3, 3);
    ctx.fillRect(x + 28, y + 12, 3, 3);
    ctx.fillStyle = '#E23B4A';
    ctx.fillRect(x - 8 - b, y + 20, 60 + b * 2, 34 + b);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 10, y + 26, 6, 6);
    ctx.fillRect(x + 24, y + 32, 6, 6);
    ctx.fillStyle = '#222';
    ctx.fillRect(x - 8 - b, y + 38, 60 + b * 2, 6);
    ctx.fillStyle = '#FFE08A';
    ctx.fillRect(x + 18, y + 36, 12, 8);
    ctx.fillStyle = '#222';
    ctx.fillRect(x + 2, y + 54 + b, 10, 6);
    ctx.fillRect(x + 34, y + 54 + b, 10, 6);
  }

  function drawCrew(x, y) {
    sprite(kitty, x, y, 28);
    sprite(malaz, x + 26, y - 2, 34);
  }

  function drawPads() {
    function btn(x, y, on) {
      ctx.fillStyle = on ? '#FF5FA2' : '#fff';
      ctx.fillRect(x, y, 26, 22);
      ctx.strokeStyle = '#FF5FA2';
      ctx.strokeRect(x + 0.5, y + 0.5, 25, 21);
      ctx.fillStyle = on ? '#fff' : '#FF5FA2';
      ctx.fillRect(x + 2, y + 2, 22, 3);
    }
    btn(8, 156, hold.left);
    btn(38, 156, hold.right);
    btn(23, 142, hold.up);
    btn(286, 156, hold.action);
    ctx.fillStyle = '#96285F';
    ctx.font = '10px "Pixelify Sans", monospace';
    ctx.fillText('<', 16, 171);
    ctx.fillText('>', 46, 171);
    ctx.fillText('^', 31, 157);
    ctx.fillText('z', 294, 171);
  }

  function padAt(x, y) {
    function inside(bx, by) { return x >= bx && x <= bx + 26 && y >= by && y <= by + 22; }
    if (inside(8, 156)) return 'left';
    if (inside(38, 156)) return 'right';
    if (inside(23, 142)) return 'up';
    if (inside(286, 156)) return 'action';
    return '';
  }

  function drawTalkBox() {
    if (mode !== 'talk' && mode !== 'win') return;
    var line = talk && talk[Math.min(talkI, talk.length - 1)];
    if (!line) return;
    ctx.fillStyle = 'rgba(255,247,251,.94)';
    ctx.fillRect(8, 18, 304, 32);
    ctx.strokeStyle = '#FF5FA2';
    ctx.strokeRect(8.5, 18.5, 303, 31);
    ctx.fillStyle = '#FF5FA2';
    ctx.font = '11px "Pixelify Sans", monospace';
    ctx.fillText(line.name, 14, 31);
    ctx.fillStyle = '#96285F';
    ctx.fillText(line.text, 14, 44);
  }

  function draw() {
    ctx.imageSmoothingEnabled = false;
    if (level === 1 && mode !== 'title') {
      ctx.fillStyle = '#241432';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#FFD6E8';
      for (var i = 0; i < 20; i++) ctx.fillRect((i * 37 + time) % W, (i * 19) % 120, 2, 2);
    } else if (level === 2) {
      ctx.fillStyle = '#F6B0C4';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#E37A4A';
      ctx.fillRect(0, GROUND, W, 22);
      ctx.fillStyle = '#C45A32';
      ctx.fillRect(0, GROUND, W, 3);
      ctx.fillStyle = '#FFE6F2';
      ctx.fillRect(0, GROUND + 22, W, H - GROUND - 22);
    } else {
      ctx.fillStyle = '#4A1838';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#FFD6E8';
      for (var n = 0; n < 12; n++) ctx.fillRect((n * 47) % W, 8 + (n * 13) % 70, 2, 2);
      ctx.fillStyle = '#C45A32';
      ctx.fillRect(0, GROUND, W, 22);
      ctx.fillStyle = '#FFE6F2';
      ctx.fillRect(0, GROUND + 22, W, H - GROUND - 22);
    }

    if (mode === 'win') {
      ctx.fillStyle = '#FF8DC0';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#FFD6E8';
      for (var s = 0; s < 14; s++) ctx.fillRect((s * 41 + vibe) % W, 56 + (s * 9) % 40, 2, 2);
      sprite(malaz, 64, 64, 46);
      sprite(kitty, 118, 76 + Math.sin(vibe / 4) * 5, 36);
      drawUnicorn(164, 72, true);
      ctx.fillStyle = '#FF5FA2';
      ctx.fillRect(118, 146, 84, 20);
      ctx.fillStyle = '#fff';
      ctx.font = '14px "Pixelify Sans", monospace';
      ctx.fillText('replay', 136, 161);
      drawTalkBox();
      return;
    }

    if (mode === 'title') {
      ctx.fillStyle = '#FF5FA2';
      ctx.fillRect(0, 0, W, H);
      drawCrew(70, 70);
      ctx.fillStyle = '#fff';
      ctx.font = '20px "Pixelify Sans", monospace';
      ctx.fillText('secret minigame', 78, 40);
      ctx.font = '12px "Pixelify Sans", monospace';
      ctx.fillText('tap to start', 112, 124);
      drawPads();
      return;
    }

    if (level === 1) {
      ctx.fillStyle = '#FF5FA2';
      ctx.fillRect(player.x, player.y + 10, 46, 16);
      ctx.fillStyle = '#fff';
      ctx.fillRect(player.x + 30, player.y + 13, 12, 8);
      ctx.fillStyle = '#FFE08A';
      ctx.fillRect(player.x - 8, player.y + 14, 8, 6);
      ctx.fillRect(player.x - 12, player.y + 16, 4, 2);
      drawCrew(player.x + 4, player.y - 12);
      rocks.forEach(function (r) {
        ctx.fillStyle = '#8d8d9c';
        ctx.fillRect(r.x, r.y, r.w, r.h);
        ctx.fillStyle = '#5c5c6a';
        ctx.fillRect(r.x + 2, r.y + 2, 4, 4);
      });
      stars.forEach(function (s) {
        ctx.fillStyle = '#FFE08A';
        ctx.fillRect(s.x + 3, s.y, 1, 7);
        ctx.fillRect(s.x, s.y + 3, 7, 1);
      });
    } else {
      drawCrew(player.x, player.y);
      if (mode !== 'win' && ally && foe && foe.kind !== 'uni') drawUnicorn(player.x + 40, player.y + 8, true);
      if (mode !== 'win' && foe && foe.kind === 'uni') drawUnicorn(foe.x, foe.y, foe.friendly);
      if (mode !== 'win' && foe && foe.kind === 'santa') drawSanta(foe.x, foe.y - (foe.belly > 0 ? 2 : 0), foe.belly);
    }

    shots.forEach(function (s) {
      if (s.rainbow) { ctx.fillStyle = ['#FF5FA2', '#FFE08A', '#7FD6FF', '#B8F2C8'][time % 4]; ctx.fillRect(s.x, s.y, s.w, s.h); }
      else drawHeart(s.x, s.y);
    });
    foeShots.forEach(function (s) {
      ctx.fillStyle = s.coal ? '#222' : ['#ff4d6d', '#ffd166', '#7ae582', '#64d2ff'][(s.x >> 2) % 4];
      ctx.fillRect(s.x, s.y, s.w, s.h);
    });

    ctx.fillStyle = level === 2 ? '#96285F' : '#fff';
    ctx.font = '11px "Pixelify Sans", monospace';
    if (mode !== 'win' && level === 1) ctx.fillText('stars ' + Math.max(0, 8 - goal) + '/8   hearts ' + lives, 8, 14);
    else if (mode !== 'win' && foe) ctx.fillText((foe.kind === 'uni' ? 'unicorn ' : 'santafoto ') + foe.hp, 8, 14);
    drawTalkBox();
    drawPads();
  }

  function loop() {
    if (!running) return;
    update();
    draw();
    raf = requestAnimationFrame(loop);
  }

  function pointerPos(e) {
    var r = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (W / r.width),
      y: (e.clientY - r.top) * (H / r.height)
    };
  }

  function press(name, on) { if (name) hold[name] = on; }

  function onDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    var p = pointerPos(e);
    if (mode === 'title') { beginLevel(1); return; }
    if (mode === 'talk') { nextLine(); return; }
    if (mode === 'win' && p.x > 110 && p.x < 210 && p.y > 140 && p.y < 172) { mode = 'title'; return; }
    var pad = padAt(p.x, p.y);
    pointers[e.pointerId] = pad;
    if (pad) { press(pad, true); e.preventDefault(); return; }
    if (mode === 'play') { hold.action = true; }
  }
  function onUp(e) {
    var pad = pointers[e.pointerId];
    if (pad) press(pad, false);
    else hold.action = false;
    delete pointers[e.pointerId];
  }

  function onKey(e, on) {
    keys[e.code] = on;
    if (!on) return;
    if (e.code === 'Escape') { if (opts.onExit) opts.onExit(); return; }
    if (mode === 'title' && (e.code === 'Enter' || e.code === 'Space')) { beginLevel(1); e.preventDefault(); }
    else if (mode === 'talk' && (e.code === 'Enter' || e.code === 'Space')) { e.preventDefault(); nextLine(); }
    else if (mode === 'win' && (e.code === 'Enter' || e.code === 'KeyR')) { mode = 'title'; }
    else if (e.code === 'Space' || e.code === 'ArrowUp') e.preventDefault();
  }

  function bindMute(button) {
    if (!button) return;
    button.addEventListener('click', function () {
      muted = !muted;
      button.textContent = muted ? 'sound off' : 'sound on';
      button.setAttribute('aria-pressed', muted ? 'true' : 'false');
      if (!muted) {
        try {
          if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
          if (audio.state === 'suspended') audio.resume();
        } catch (e) {}
        beep(660, 0.06);
      }
    });
  }

  window.popiMars = {
    start: function (c, options) {
      canvas = c;
      ctx = canvas.getContext('2d');
      opts = options || {};
      running = true;
      muted = true;
      mode = 'title';
      bindMute(opts.muteButton);
      canvas.addEventListener('pointerdown', onDown);
      canvas.addEventListener('pointerup', onUp);
      canvas.addEventListener('pointercancel', onUp);
      window.addEventListener('keydown', keyDown);
      window.addEventListener('keyup', keyUp);
      loop();
    },
    stop: function () {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      resetInput();
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
    }
  };

  function keyDown(e) { onKey(e, true); }
  function keyUp(e) { onKey(e, false); keys[e.code] = false; }
})();
