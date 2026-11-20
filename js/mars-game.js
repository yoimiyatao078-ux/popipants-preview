/* Secret minigame. Pixel art is drawn in code. Malaz's pose uses the scene sprite.
   No generated images. Sound stays off until the sound button is tapped. */
(function () {
  var STORE = 'popipants-mars-progress';
  var CHAPTERS = [
    { id: 1, tease: 'Mars??', title: 'Trip to Mars', locked: '??' },
    { id: 2, tease: 'unicorn??', title: 'Unicorn Fight', locked: '??' },
    { id: 3, tease: 'rude santa??', title: 'Santafoto', locked: '???' }
  ];
  var MALAZ_KIT = ['flares', 'hoodie', 'tee', 'bag'];
  var KITTY_KIT = ['platform', 'heel', 'sneaker', 'bow'];
  var LINES = {
    c1before: [
      { name: 'Malaz', text: 'ok bestie. snacks are packed. mars or bust.' },
      { name: 'Kitty', text: 'mrrp. i call window seat. and the aux.' },
      { name: 'Malaz', text: 'if we see a rock, we simply do not touch it.' },
      { name: 'Kitty', text: 'grab the stars. they are free. we love free.' }
    ],
    c1mid: [
      { name: 'Kitty', text: 'this is giving space picnic. not space trauma.' },
      { name: 'Malaz', text: 'the gaps are huge. we are so fine.' }
    ],
    c1after: [
      { name: 'Malaz', text: 'we did it. mars is that cute pink dot.' },
      { name: 'Kitty', text: 'mrrp. first try energy. maybe second. iconic either way.' }
    ],
    c1fail: [
      { name: 'Malaz', text: 'rewind. the stars are still free.' },
      { name: 'Kitty', text: 'mrrp. unbothered. restarting the aux.' }
    ],
    c2before: [
      { name: 'Malaz', text: 'why is there a unicorn on mars.' },
      { name: 'Unicorn', text: 'neigh. this crater is my fitting room.' },
      { name: 'Kitty', text: 'bet. i brought shoes and bows.' },
      { name: 'Malaz', text: 'and i brought the y2k closet. try to stay mad.' },
      { name: 'Unicorn', text: 'i only respect a good heel. we will see.' }
    ],
    c2hit: [
      { name: 'Unicorn', text: 'wait. that baby tee is actually insane.' },
      { name: 'Kitty', text: 'and the bow. say you love the bow.' },
      { name: 'Unicorn', text: 'ok the bow is camp. the platforms too. keep going.' }
    ],
    c2after: [
      { name: 'Unicorn', text: 'i yield. the wardrobe won. i am joining.' },
      { name: 'Malaz', text: 'yay. you are our mars guide now.' },
      { name: 'Unicorn', text: 'fine. i know the cute craters. follow me.' },
      { name: 'Kitty', text: 'mrrp. tour guide with a horn. obsessed.' }
    ],
    c3guide: [
      { name: 'Unicorn', text: 'mars fun fact. the dust is just pink glitter.' },
      { name: 'Malaz', text: 'obsessed. where is the gift shop.' },
      { name: 'Kitty', text: 'guide us away from anything cringe.' },
      { name: 'Unicorn', text: 'too late. i smell fake snow and a warm soda.' }
    ],
    c3meet: [
      { name: 'Santafoto', text: 'ho ho. behold my huge beer belly. it is the event.' },
      { name: 'Unicorn', text: 'ugh, YOU again? you are so rude.' },
      { name: 'Malaz', text: 'he stood in the path just to be the main character.' },
      { name: 'Santafoto', text: 'the belly has lore. you would not get it.' },
      { name: 'Kitty', text: 'mrrp. we are fighting the belly.' }
    ],
    c3mid: [
      { name: 'Santafoto', text: 'the jiggle is on purpose. it is choreography.' },
      { name: 'Unicorn', text: 'i am helping. rainbow, straight to the belt.' }
    ],
    c3after: [
      { name: 'Santafoto', text: 'ok ok. the belly clocked out. you win, somehow.' },
      { name: 'Unicorn', text: 'told you he was rude. mars is cute again.' },
      { name: 'Malaz', text: 'group photo. kitty, do the victory wiggle.' },
      { name: 'Kitty', text: 'mrrp mrrp. victory wiggle. encore forever.' }
    ]
  };

  var canvas, ctx, opts, stage, chaptersEl, talkEl, padsEl;
  var W = 320, H = 180, GROUND = 150;
  var keys = {}, hold = { left: false, right: false, up: false, action: false };
  var muted = true, audio, raf, running, lastT = 0, acc = 0;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mode = 'select';
  var chapter = 1;
  var time = 0;
  var prog = { beaten: [] };
  var player, foe;
  var rocks = [], stars = [], shots = [], foeShots = [], sparks = [];
  var lives, starsGot, needStars, rockTimer, speed, midSaid;
  var phase, stroll, clothI, kittyI;
  var talkQ, talkI, talkDone, winPose;
  var hpShown = 1, hpTarget = 1, bossShown = 1, bossTarget = 1, hpFlash = 0, bossFlash = 0;
  var malazImg = new Image();
  malazImg.src = 'images/scenes/sprite-malaz.png';

  function loadProg() {
    try {
      var p = JSON.parse(localStorage.getItem(STORE) || '');
      if (p && p.beaten && p.beaten.join) prog = { beaten: p.beaten.map(Number) };
      else prog = { beaten: [] };
    } catch (e) { prog = { beaten: [] }; }
  }
  function saveProg() {
    try { localStorage.setItem(STORE, JSON.stringify(prog)); } catch (e) {}
  }
  function beaten(id) { return prog.beaten.indexOf(id) !== -1; }
  function unlocked(id) { return id === 1 || beaten(id - 1); }
  function mark(id) {
    if (!beaten(id)) prog.beaten.push(id);
    saveProg();
  }

  function beep(freq, len) {
    if (muted) return;
    try {
      if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume();
      var o = audio.createOscillator();
      var g = audio.createGain();
      o.type = 'square';
      o.frequency.value = freq;
      g.gain.value = 0.035;
      o.connect(g);
      g.connect(audio.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + len);
      o.stop(audio.currentTime + len);
    } catch (e) {}
  }

  function lineEl() { return talkEl && talkEl.querySelector('.mars-line'); }
  function showTalk(line) {
    if (!talkEl) return;
    talkEl.hidden = false;
    if (lineEl()) lineEl().textContent = line.name + ': ' + line.text;
    if (opts.onLine) opts.onLine(line.name + ': ' + line.text);
  }
  function hideTalk() {
    if (talkEl) talkEl.hidden = true;
    if (opts.onLine) opts.onLine('');
  }
  function say(lines, done) {
    talkQ = lines;
    talkI = 0;
    talkDone = done || null;
    mode = 'talk';
    syncChrome();
    showTalk(lines[0]);
    beep(440, 0.04);
  }
  function advance() {
    if (mode !== 'talk') return;
    talkI += 1;
    if (!talkQ || talkI >= talkQ.length) {
      var done = talkDone;
      talkDone = null;
      mode = winPose ? 'win' : 'play';
      if (winPose) mode = 'win';
      hideTalk();
      if (done) done();
      else syncChrome();
      return;
    }
    showTalk(talkQ[talkI]);
    beep(520, 0.04);
  }
  function skipTalk() {
    if (mode !== 'talk') return;
    var done = talkDone;
    talkDone = null;
    talkI = talkQ ? talkQ.length : 0;
    hideTalk();
    if (done) done();
    else { mode = 'play'; syncChrome(); }
  }

  function syncChrome() {
    if (stage) stage.classList.toggle('is-select', mode === 'select');
    if (chaptersEl) chaptersEl.hidden = mode !== 'select';
    if (padsEl) padsEl.hidden = mode !== 'play' && mode !== 'stroll';
  }

  function renderCards() {
    if (!chaptersEl) return;
    var html = CHAPTERS.map(function (ch) {
      var open = unlocked(ch.id);
      var done = beaten(ch.id);
      var label = !open ? ch.locked : (done ? ch.title : ch.tease);
      var mark = !open ? ch.locked : (done ? '★' : '?');
      return '<button type="button" class="mars-card' + (open ? '' : ' is-locked') + (done ? ' is-clear' : '') +
        '" data-ch="' + ch.id + '"' + (open ? '' : ' disabled') + '>' +
        '<b>chapter ' + ch.id + '</b><span class="mars-mark">' + mark + '</span><em>' + label + '</em></button>';
    }).join('');
    chaptersEl.innerHTML = html + '<button type="button" class="mars-reset">reset</button>';
  }

  function fit() {
    if (!stage) return;
    var r = stage.getBoundingClientRect();
    if (r.width < 20 || r.height < 20) return;
    var scale = r.width < 520 ? 2 : (r.width > 1500 ? 4 : 3);
    var nw = Math.max(180, Math.floor(r.width / scale));
    var nh = Math.max(120, Math.floor(r.height / scale));
    if (nw === W && nh === H && canvas.width === W) return;
    W = nw;
    H = nh;
    GROUND = H - 28;
    canvas.width = W;
    canvas.height = H;
  }

  function freshCrew() {
    player = {
      x: 18,
      y: chapter === 1 ? Math.floor(H * 0.42) : GROUND - 40,
      vx: 0,
      vy: 0,
      cool: 0,
      inv: chapter === 1 ? 40 : 0,
      throwT: 0,
      hit: 0
    };
    hpTarget = 1;
    hpShown = 1;
  }

  function resetField() {
    rocks = [];
    stars = [];
    shots = [];
    foeShots = [];
    sparks = [];
    lives = 3;
    starsGot = 0;
    needStars = 6;
    rockTimer = 70;
    speed = 0.55;
    midSaid = false;
    stroll = 0;
    phase = 'play';
    foe = null;
    winPose = false;
    time = 0;
  }

  function beginChapter(id) {
    if (!unlocked(id)) return;
    chapter = id;
    resetField();
    freshCrew();
    mode = 'talk';
    if (id === 1) {
      say(LINES.c1before, function () { mode = 'play'; syncChrome(); });
    } else if (id === 2) {
      foe = { kind: 'uni', x: W - 70, y: GROUND - 46, hp: 6, max: 6, cool: 50, friend: false, hit: 0, mid: false };
      bossTarget = 1;
      bossShown = 1;
      say(LINES.c2before, function () { mode = 'play'; syncChrome(); });
    } else {
      phase = 'stroll';
      stroll = 0;
      foe = { kind: 'uni', x: 70, y: GROUND - 46, hp: 6, max: 6, cool: 40, friend: true, hit: 0, guide: true };
      say(LINES.c3guide, function () { mode = 'stroll'; syncChrome(); });
    }
    syncChrome();
  }

  function failChapter() {
    say(LINES.c1fail, function () {
      resetField();
      freshCrew();
      mode = 'play';
      syncChrome();
    });
  }

  function clearChapter(id, lines) {
    mark(id);
    winPose = id === 3;
    say(lines, function () {
      winPose = false;
      mode = 'select';
      renderCards();
      syncChrome();
    });
  }

  function burst(x, y, color) {
    for (var i = 0; i < 7; i++) {
      sparks.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 2.2,
        vy: (Math.random() - 0.5) * 2.2,
        life: 14,
        color: color
      });
    }
  }

  function shootCrew() {
    if (!player || player.cool > 0) return;
    if (mode !== 'play') return;
    if (chapter === 3 && phase !== 'fight') return;
    player.cool = 20;
    player.throwT = 12;
    if (chapter === 1) {
      shots.push({ who: 'malaz', kind: 'heart', x: player.x + 40, y: player.y + 10, vx: 3.2, vy: 0, w: 8, h: 7 });
      beep(660, 0.04);
      return;
    }
    var cloth = MALAZ_KIT[clothI % MALAZ_KIT.length];
    clothI += 1;
    var shoe = KITTY_KIT[kittyI % KITTY_KIT.length];
    kittyI += 1;
    shots.push({ who: 'malaz', kind: cloth, x: player.x + 46, y: player.y + 4, vx: 3.3, vy: 0, w: 14, h: 12 });
    shots.push({ who: 'kitty', kind: shoe, x: player.x + 6, y: player.y + 16, vx: 2.8, vy: shoe === 'bow' ? 0 : -1.1, w: 12, h: 12, arc: shoe !== 'bow', flutter: shoe === 'bow' });
    beep(620, 0.04);
    beep(780, 0.03);
  }

  function hurt() {
    if (!player || player.inv > 0) return;
    lives -= 1;
    player.inv = chapter === 1 ? 180 : 50;
    player.hit = 12;
    hpFlash = 8;
    hpTarget = Math.max(0, lives / 3);
    beep(140, 0.1);
    if (lives <= 0) failChapter();
  }

  function hitFoe(shot) {
    if (!foe || foe.friend) return false;
    var box = foe.kind === 'uni'
      ? { x: foe.x, y: foe.y, w: 36, h: 40 }
      : { x: foe.x - 20, y: foe.y + 8, w: 100, h: 70 };
    if (shot.x < box.x + box.w && shot.x + shot.w > box.x && shot.y < box.y + box.h && shot.y + shot.h > box.y) {
      foe.hp -= 1;
      foe.hit = 12;
      bossFlash = 8;
      bossTarget = Math.max(0, foe.hp / foe.max);
      burst(shot.x, shot.y, shot.who === 'kitty' ? '#FFD6E8' : '#FF5FA2');
      beep(300, 0.05);
      if (foe.kind === 'uni' && !foe.mid && foe.hp <= 3 && foe.hp > 0) {
        foe.mid = true;
        say(LINES.c2hit, function () { mode = 'play'; syncChrome(); });
      }
      if (foe.kind === 'santa' && !foe.mid && foe.hp <= 4 && foe.hp > 0) {
        foe.mid = true;
        say(LINES.c3mid, function () { mode = 'play'; phase = 'fight'; syncChrome(); });
      }
      if (foe.hp <= 0) onDefeat();
      return true;
    }
    return false;
  }

  function onDefeat() {
    if (foe.kind === 'uni') {
      foe.friend = true;
      foe.phase = 'join';
      foe.join = 0;
      mode = 'join';
      syncChrome();
    } else {
      clearChapter(3, LINES.c3after);
    }
  }

  function updatePlay() {
    var left = keys.ArrowLeft || keys.KeyA || hold.left;
    var right = keys.ArrowRight || keys.KeyD || hold.right;
    var up = keys.ArrowUp || keys.KeyW || hold.up;
    var down = keys.ArrowDown || keys.KeyS;
    var action = keys.Space || keys.KeyZ || hold.action;
    if (player.cool > 0) player.cool -= 1;
    if (player.inv > 0) player.inv -= 1;
    if (player.throwT > 0) player.throwT -= 1;
    if (player.hit > 0) player.hit -= 1;
    if (hpFlash > 0) hpFlash -= 1;
    if (bossFlash > 0) bossFlash -= 1;

    if (chapter === 1) {
      var step = 2.15;
      if (left) player.x -= step;
      if (right) player.x += step;
      if (up) player.y -= step;
      if (down) player.y += step;
      player.x = Math.max(8, Math.min(W * 0.55, player.x));
      player.y = Math.max(22, Math.min(H - 28, player.y));
      speed = Math.min(0.9, 0.42 + time / 1800);
      rockTimer -= 1;
      if (rockTimer <= 0 && rocks.length < 1) {
        var y = 24 + Math.random() * (H - 56);
        if (Math.abs(y - player.y) < 54) y = (player.y + Math.floor(H * 0.46)) % (H - 44);
        rocks.push({ x: W + 6, y: y, w: 6, h: 6, vx: -speed });
        rockTimer = 150 + Math.random() * 70;
      }
      if (time % 20 === 0 && stars.length < 6) {
        var near = Math.random() < 0.75;
        var sy = near ? player.y + (Math.random() * 36 - 18) : (24 + Math.random() * (H - 52));
        stars.push({ x: W + 2, y: Math.max(18, Math.min(H - 22, sy)), w: 11, h: 11, vx: -0.7 });
      }
      rocks.forEach(function (r) { r.x += r.vx; });
      stars.forEach(function (s) {
        s.x += s.vx;
        if (s.y < player.y - 8) s.y += 0.45;
        else if (s.y > player.y + 8) s.y -= 0.45;
      });
      var body = { x: player.x + 18, y: player.y + 10, w: 12, h: 10 };
      var grab = { x: player.x, y: player.y - 4, w: 52, h: 40 };
      rocks = rocks.filter(function (r) {
        if (r.x < -12) return false;
        if (player.inv <= 0 && r.x < body.x + body.w && r.x + r.w > body.x && r.y < body.y + body.h && r.y + r.h > body.y) {
          hurt();
          return false;
        }
        return true;
      });
      stars = stars.filter(function (s) {
        if (s.x < -12) return false;
        if (s.x < grab.x + grab.w && s.x + s.w > grab.x && s.y < grab.y + grab.h && s.y + s.h > grab.y) {
          starsGot += 1;
          beep(880, 0.05);
          if (!midSaid && starsGot >= 3) {
            midSaid = true;
            say(LINES.c1mid, function () { mode = 'play'; syncChrome(); });
          }
          if (starsGot === needStars && lives > 0 && mode === 'play') clearChapter(1, LINES.c1after);
          return false;
        }
        return true;
      });
      if (action) shootCrew();
      shots.forEach(function (s) { s.x += s.vx; });
      shots = shots.filter(function (s) {
        var keep = s.x < W + 8;
        rocks = rocks.filter(function (r) {
          if (s.x < r.x + r.w && s.x + s.w > r.x && s.y < r.y + r.h && s.y + s.h > r.y) {
            keep = false;
            burst(r.x, r.y, '#FFE08A');
            return false;
          }
          return true;
        });
        return keep;
      });
      return;
    }

    if (mode === 'stroll' || phase === 'stroll') {
      stroll += 1;
      if (left) player.x -= 1.4;
      if (right) player.x += 1.4;
      player.x = Math.max(12, Math.min(W * 0.45, player.x));
      if (foe && foe.friend) {
        foe.x += (player.x + 52 - foe.x) * 0.08;
        foe.y = GROUND - 46 + Math.sin(time / 10) * 3;
      }
      if (stroll === 150) {
        phase = 'meet';
        foe = { kind: 'santa', x: W + 10, y: GROUND - 92, hp: 8, max: 8, cool: 36, vy: 0, belly: 0, friend: false, hit: 0, mid: false, guide: false };
        bossTarget = 1;
        bossShown = 1;
        var uni = { kind: 'uni', x: player.x + 50, y: GROUND - 46, friend: true, guide: true, hp: 1, max: 1 };
        foe.ally = uni;
        say(LINES.c3meet, function () { phase = 'fight'; mode = 'play'; syncChrome(); });
      }
      return;
    }

    if (left) player.x -= 1.5;
    if (right) player.x += 1.5;
    player.x = Math.max(8, Math.min(W * 0.42, player.x));
    player.vy += 0.22;
    player.y += player.vy;
    if (player.y > GROUND - 40) { player.y = GROUND - 40; player.vy = 0; }
    if (up && player.vy === 0) player.vy = -4.1;
    if (action) shootCrew();

    if (foe && foe.kind === 'uni' && !foe.friend) {
      foe.x = W - 78 + Math.sin(time / 30) * 10;
      foe.y = GROUND - 48 - Math.abs(Math.sin(time / 22)) * 10;
      if (foe.hit > 0) foe.hit -= 1;
      foe.cool -= 1;
      if (foe.cool <= 0) {
        foe.cool = 56;
        foeShots.push({ x: foe.x, y: foe.y + 12, vx: -1.5, vy: Math.sin(time / 9) * 0.35, w: 6, h: 6 });
      }
    }
    if (foe && foe.kind === 'santa') {
      var home = W - 128;
      if (foe.x > home) foe.x -= 1.6;
      if (foe.hit > 0) foe.hit -= 1;
      foe.cool -= 1;
      foe.vy += 0.16;
      foe.y += foe.vy;
      if (foe.y > GROUND - 92) {
        if (foe.vy > 1) foe.belly = 14;
        foe.y = GROUND - 92;
        foe.vy = 0;
      }
      if (foe.belly > 0) foe.belly -= 1;
      if (phase === 'fight' && foe.cool <= 0) {
        foe.cool = 78;
        if (time % 160 < 80) foe.vy = -3.2;
        else foeShots.push({ x: foe.x, y: foe.y + 20, vx: -1.8, vy: -1.2, w: 6, h: 6, coal: true });
      }
      if (foe.ally && phase === 'fight' && time % 54 === 0) {
        shots.push({ who: 'uni', kind: 'rainbow', x: foe.ally.x + 20, y: foe.ally.y + 10, vx: 2.6, vy: 0, w: 8, h: 6 });
      }
      if (foe.ally) {
        foe.ally.x += (player.x + 48 - foe.ally.x) * 0.1;
        foe.ally.y = player.y + Math.sin(time / 9) * 2;
      }
    }

    foeShots.forEach(function (s) {
      s.x += s.vx;
      s.y += s.vy || 0;
      if (s.coal) s.vy += 0.07;
    });
    var crew = { x: player.x + 8, y: player.y + 6, w: 28, h: 30 };
    foeShots = foeShots.filter(function (s) {
      if (s.x < crew.x + crew.w && s.x + s.w > crew.x && s.y < crew.y + crew.h && s.y + s.h > crew.y) {
        hurt();
        return false;
      }
      return s.x > -10 && s.y < H;
    });
    if (foe && foe.kind === 'santa' && foe.belly === 10 && player.y > GROUND - 48) hurt();

    shots.forEach(function (s) {
      s.x += s.vx;
      s.y += s.vy || 0;
      if (s.arc) s.vy += 0.07;
      if (s.flutter) s.y += Math.sin((s.x + time) / 5) * 0.35;
    });
    shots = shots.filter(function (s) {
      if (s.x > W + 16 || s.y > H) return false;
      if (s.who === 'uni') return !hitFoe(s);
      return !hitFoe(s);
    });
  }

  function updateJoin() {
    if (!foe) return;
    foe.join = (foe.join || 0) + 1;
    foe.x += (player.x + 50 - foe.x) * 0.06;
    foe.y = GROUND - 52 - Math.abs(Math.sin(foe.join / 4)) * 8;
    if (foe.join === 70) {
      clearChapter(2, LINES.c2after);
    }
  }

  function px(rows, x, y, pal) {
    rows.forEach(function (row, j) {
      for (var i = 0; i < row.length; i++) {
        var col = pal[row[i]];
        if (col) { ctx.fillStyle = col; ctx.fillRect(x + i, y + j, 1, 1); }
      }
    });
  }

  function drawKitty(x, y, throwing) {
    var bob = reduce ? 0 : Math.round(Math.sin(time * 0.35) * 2);
    var hop = reduce ? 0 : Math.round(Math.sin(time * 0.45) * (winPose || chapter === 1 ? 2 : 1));
    var tail = reduce ? 0 : Math.round(Math.sin(time * 0.5) * 3);
    var paw = throwing ? -4 : 0;
    y += hop;
    ctx.fillStyle = '#FF5FA2';
    ctx.fillRect(x - 6, y + 12 + tail, 8, 3);
    ctx.fillRect(x - 8, y + 10 + tail, 3, 3);
    ctx.fillStyle = '#FFD6E8';
    ctx.fillRect(x, y + 8, 16, 10);
    ctx.fillStyle = '#FF5FA2';
    ctx.fillRect(x, y + 8, 16, 3);
    ctx.fillRect(x + 10, y + bob, 12, 10);
    ctx.fillRect(x + 12, y - 2 + bob, 3, 3);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 16, y + 3 + bob, 5, 4);
    ctx.fillStyle = '#222';
    ctx.fillRect(x + 19, y + 4 + bob, 2, 2);
    ctx.fillStyle = '#FF5FA2';
    ctx.fillRect(x + 20 + paw, y + 8, 5, 3);
  }

  function drawMalaz(x, y, throwing) {
    var bob = reduce ? 0 : Math.round(Math.sin(time * 0.28) * 1);
    var lean = throwing ? 3 : 0;
    y += bob;
    x += lean;
    if (player && player.hit > 0 && (time % 4) < 2) return;
    if (malazImg.complete && malazImg.naturalWidth) {
      var sc = 34 / malazImg.naturalHeight;
      ctx.drawImage(malazImg, x, y, malazImg.naturalWidth * sc, 34);
    } else {
      ctx.fillStyle = '#6B3A2A';
      ctx.fillRect(x + 2, y, 14, 12);
      ctx.fillStyle = '#FF5FA2';
      ctx.fillRect(x + 12, y, 4, 3);
      ctx.fillStyle = '#F3C7A1';
      ctx.fillRect(x + 4, y + 4, 10, 8);
      ctx.fillStyle = '#FF8DC0';
      ctx.fillRect(x + 3, y + 12, 12, 12);
    }
    if (throwing) {
      ctx.fillStyle = '#F3C7A1';
      ctx.fillRect(x + 16, y + 12, 6, 3);
    }
  }

  function drawCrew(x, y) {
    var tossing = player && player.throwT > 0;
    drawKitty(x, y + 6, tossing && player.throwT > 4);
    drawMalaz(x + 24, y, tossing && player.throwT <= 8);
  }

  function drawUni(x, y, friend, hit, joining) {
    var bob = reduce ? 0 : Math.round(Math.sin(time * 0.22) * 2);
    var leg = Math.floor(time / 7) % 2;
    var hop = joining ? Math.abs(Math.sin(time / 4)) * 8 : 0;
    x += hit ? 5 : 0;
    y += bob - hop;
    var mane = friend ? '#7FD6FF' : '#FF9EC7';
    ctx.fillStyle = '#fff';
    ctx.fillRect(x, y + 16, 28, 14);
    ctx.fillRect(x + 20, y + 6, 12, 14);
    ctx.fillStyle = '#FF5FA2';
    ctx.fillRect(x + 28, y, 3, 8);
    ctx.fillRect(x + 30, y + 2, 3, 4);
    ctx.fillStyle = mane;
    var wave = Math.floor(time / 5) % 2;
    ctx.fillRect(x + 16, y + 8 + wave, 6, 12);
    ctx.fillRect(x + 12, y + 14, 5, 6);
    ctx.fillStyle = '#222';
    ctx.fillRect(x + 26, y + 10, 2, 2);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 4, y + 30, 4, leg ? 7 : 4);
    ctx.fillRect(x + 14, y + 30, 4, leg ? 4 : 7);
    ctx.fillStyle = friend ? '#B8F2C8' : '#FFD6E8';
    ctx.fillRect(x - 5, y + 16 + (wave ? 1 : -1), 6, 3);
  }

  function drawSanta(x, y, belly, hit) {
    var breathe = reduce ? 0 : Math.sin(time / 8) * 4;
    var jig = (belly > 0 ? 8 : 0) + (hit ? Math.sin(time) * 6 : 0) + breathe;
    var bw = 86 + jig;
    var bh = 46 + Math.abs(breathe);
    x -= hit ? 3 : 0;
    ctx.fillStyle = '#E23B4A';
    ctx.fillRect(x + 28, y, 26, 8);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 50, y + 2, 8, 6);
    ctx.fillRect(x + 22, y + 8, 32, 12);
    ctx.fillStyle = '#F3C7A1';
    ctx.fillRect(x + 30, y + 10, 16, 8);
    ctx.fillStyle = '#222';
    ctx.fillRect(x + 34, y + 12, 3, 3);
    ctx.fillRect(x + 42, y + 12, 3, 3);
    ctx.fillStyle = '#E23B4A';
    ctx.fillRect(x + 10 - jig * 0.3, y + 20, bw, bh);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 28, y + 30, 6, 6);
    ctx.fillRect(x + 48, y + 40, 6, 6);
    ctx.fillStyle = '#222';
    ctx.fillRect(x + 10 - jig * 0.3, y + 36, bw, 6);
    ctx.fillStyle = '#FFE08A';
    ctx.fillRect(x + 40, y + 34, 12, 8);
    ctx.fillStyle = '#222';
    ctx.fillRect(x + 24, y + 20 + bh, 8, 5);
    ctx.fillRect(x + 58, y + 20 + bh, 8, 5);
  }

  function drawCloth(s) {
    var x = s.x, y = s.y;
    if (s.kind === 'heart') {
      ctx.fillStyle = '#FF5FA2';
      ctx.fillRect(x + 1, y, 2, 1);
      ctx.fillRect(x + 4, y, 2, 1);
      ctx.fillRect(x, y + 1, 7, 2);
      ctx.fillRect(x + 1, y + 3, 5, 2);
      ctx.fillRect(x + 2, y + 5, 3, 1);
      return;
    }
    if (s.kind === 'rainbow') {
      ctx.fillStyle = ['#FF5FA2', '#FFE08A', '#7FD6FF', '#B8F2C8'][time % 4];
      ctx.fillRect(x, y, 8, 4);
      return;
    }
    if (s.kind === 'flares') {
      ctx.fillStyle = '#FF5FA2';
      ctx.fillRect(x + 3, y, 6, 3);
      ctx.fillRect(x, y + 3, 4, 8);
      ctx.fillRect(x + 8, y + 3, 4, 8);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 5, y + 1, 2, 2);
    } else if (s.kind === 'hoodie') {
      ctx.fillStyle = '#7FD6FF';
      ctx.fillRect(x, y + 2, 12, 8);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 5, y + 3, 2, 6);
      ctx.fillStyle = '#FF5FA2';
      ctx.fillRect(x + 2, y, 8, 3);
    } else if (s.kind === 'tee') {
      ctx.fillStyle = '#FFB6D9';
      ctx.fillRect(x + 2, y, 8, 8);
      ctx.fillRect(x, y + 1, 2, 4);
      ctx.fillRect(x + 10, y + 1, 2, 4);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 4, y + 2, 4, 2);
    } else if (s.kind === 'bag') {
      ctx.fillStyle = '#FF5FA2';
      ctx.fillRect(x + 2, y + 3, 8, 7);
      ctx.fillStyle = '#FFE08A';
      ctx.fillRect(x + 4, y, 4, 4);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 5, y + 5, 2, 2);
    } else if (s.kind === 'platform') {
      ctx.fillStyle = '#fff';
      ctx.fillRect(x, y + 2, 12, 3);
      ctx.fillStyle = '#FF5FA2';
      ctx.fillRect(x + 1, y + 5, 10, 4);
      ctx.fillStyle = '#222';
      ctx.fillRect(x, y + 9, 12, 2);
    } else if (s.kind === 'heel') {
      ctx.fillStyle = '#FF5FA2';
      ctx.fillRect(x, y + 2, 10, 3);
      ctx.fillRect(x + 8, y + 5, 2, 5);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 1, y + 1, 6, 2);
    } else if (s.kind === 'sneaker') {
      ctx.fillStyle = '#fff';
      ctx.fillRect(x, y + 3, 12, 4);
      ctx.fillStyle = '#7FD6FF';
      ctx.fillRect(x + 1, y + 1, 7, 3);
      ctx.fillStyle = '#FF5FA2';
      ctx.fillRect(x, y + 7, 12, 2);
    } else if (s.kind === 'bow') {
      ctx.fillStyle = '#FF5FA2';
      ctx.fillRect(x, y + 2, 4, 4);
      ctx.fillRect(x + 6, y + 2, 4, 4);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 4, y + 3, 2, 3);
      ctx.fillRect(x + 3, y + 6, 1, 3);
      ctx.fillRect(x + 6, y + 6, 1, 3);
    }
  }

  function drawBars() {
    var bw = Math.max(48, Math.min(96, Math.floor(W * 0.26)));
    ctx.fillStyle = '#fff';
    ctx.fillRect(2, 3, 10, 10);
    ctx.fillStyle = '#6B3A2A';
    ctx.fillRect(3, 4, 8, 4);
    ctx.fillStyle = '#FF8DC0';
    ctx.fillRect(3, 8, 8, 4);
    ctx.fillStyle = '#fff';
    ctx.fillRect(14, 3, 10, 10);
    ctx.fillStyle = '#FF5FA2';
    ctx.fillRect(15, 4, 8, 8);
    ctx.fillStyle = '#fff';
    ctx.fillRect(18, 6, 2, 2);
    var x = 26;
    ctx.fillStyle = '#fff';
    ctx.fillRect(x - 1, 4, bw + 2, 8);
    ctx.fillStyle = '#3a1028';
    ctx.fillRect(x, 5, bw, 6);
    ctx.fillStyle = hpFlash > 0 ? '#fff' : '#FF5FA2';
    ctx.fillRect(x, 5, Math.max(0, Math.round(hpShown * bw)), 6);
    if (chapter === 1 && mode !== 'select') {
      ctx.font = '11px "Pixelify Sans", monospace';
      var label = starsGot + '/' + needStars;
      var lx = x + bw + 8;
      ctx.fillStyle = '#241432';
      ctx.fillRect(lx - 2, 3, ctx.measureText(label).width + 4, 10);
      ctx.fillStyle = '#FFE08A';
      ctx.fillText(label, lx, 12);
    }
    if (foe && !foe.friend && (mode === 'play' || mode === 'talk' || mode === 'join') && chapter > 1) {
      var label = foe.kind === 'uni' ? 'unicorn' : 'santafoto';
      ctx.font = '11px "Pixelify Sans", monospace';
      ctx.fillStyle = '#fff';
      var tw = ctx.measureText(label).width;
      var rx = W - bw - 8;
      if (rx - tw - 8 > x + bw + 8) ctx.fillText(label, rx - tw - 6, 12);
      ctx.fillStyle = '#fff';
      ctx.fillRect(rx - 1, 4, bw + 2, 8);
      ctx.fillStyle = '#3a1028';
      ctx.fillRect(rx, 5, bw, 6);
      ctx.fillStyle = bossFlash > 0 ? '#fff' : (foe.kind === 'uni' ? '#E7D6FF' : '#E23B4A');
      ctx.fillRect(rx, 5, Math.max(0, Math.round(bossShown * bw)), 6);
    }
  }

  function drawWorld() {
    ctx.imageSmoothingEnabled = false;
    if (chapter === 1 || mode === 'select') {
      ctx.fillStyle = mode === 'select' ? '#3a2458' : '#241432';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#FFD6E8';
      for (var i = 0; i < 18; i++) ctx.fillRect((i * 37 + time) % W, (i * 23) % (H - 20), 2, 2);
    } else {
      ctx.fillStyle = chapter === 3 && phase === 'fight' ? '#4A1838' : '#F6B0C4';
      ctx.fillRect(0, 0, W, H);
      if (chapter === 3 && phase === 'fight') {
        ctx.fillStyle = '#FFD6E8';
        for (var n = 0; n < 10; n++) ctx.fillRect((n * 40) % W, 20 + (n * 15) % 60, 2, 2);
      }
      ctx.fillStyle = '#E37A4A';
      ctx.fillRect(0, GROUND, W, H - GROUND);
      ctx.fillStyle = '#C45A32';
      ctx.fillRect(0, GROUND, W, 3);
    }
  }

  function draw() {
    if (!ctx) return;
    drawWorld();
    if (mode === 'select') {
      drawCrew(24, Math.floor(H * 0.55));
      if (beaten(1)) drawUni(W - 80, Math.floor(H * 0.5), beaten(2), 0, false);
      if (beaten(2)) drawSanta(Math.floor(W * 0.46), Math.floor(H * 0.42), 6, 0);
      return;
    }
    if (winPose || mode === 'win') {
      ctx.fillStyle = '#FF8DC0';
      ctx.fillRect(0, 0, W, H);
      drawMalaz(W * 0.28, H * 0.4, false);
      drawKitty(W * 0.42, H * 0.42 + (reduce ? 0 : Math.sin(time / 4) * 3), false);
      drawUni(W * 0.58, H * 0.42, true, 0, false);
      drawBars();
      return;
    }
    if (chapter === 1) {
      ctx.fillStyle = '#FF5FA2';
      ctx.fillRect(player.x + 8, player.y + 14, 34, 12);
      ctx.fillStyle = '#fff';
      ctx.fillRect(player.x + 28, player.y + 16, 10, 6);
      ctx.fillStyle = '#FFE08A';
      ctx.fillRect(player.x, player.y + 16, 8, 5);
      if (!(player.hit > 0 && (time % 4) < 2)) drawCrew(player.x + 6, player.y - 8);
      rocks.forEach(function (r) {
        ctx.fillStyle = '#8d8d9c';
        ctx.fillRect(r.x, r.y, r.w, r.h);
      });
      stars.forEach(function (s) {
        ctx.fillStyle = '#FFE08A';
        ctx.fillRect(s.x + 3, s.y, 2, 8);
        ctx.fillRect(s.x, s.y + 3, 8, 2);
      });
    } else {
      if (!(player.hit > 0 && (time % 4) < 2)) drawCrew(player.x, player.y);
      if (foe && foe.kind === 'uni') drawUni(foe.x, foe.y, foe.friend, foe.hit, mode === 'join');
      if (foe && foe.kind === 'santa') {
        if (foe.ally) drawUni(foe.ally.x, foe.ally.y, true, 0, false);
        drawSanta(foe.x, foe.y, foe.belly, foe.hit);
      }
    }
    shots.forEach(drawCloth);
    foeShots.forEach(function (s) {
      ctx.fillStyle = s.coal ? '#222' : ['#ff4d6d', '#ffd166', '#7ae582', '#64d2ff'][Math.abs(s.x | 0) % 4];
      ctx.fillRect(s.x, s.y, s.w, s.h);
    });
    sparks.forEach(function (s) {
      ctx.fillStyle = s.color;
      ctx.fillRect(s.x, s.y, 2, 2);
    });
    drawBars();
  }

  function update() {
    time += 1;
    if (mode === 'play') updatePlay();
    else if (mode === 'stroll') updatePlay();
    else if (mode === 'join') updateJoin();
    hpShown += (hpTarget - hpShown) * 0.18;
    bossShown += (bossTarget - bossShown) * 0.18;
    sparks.forEach(function (s) { s.x += s.vx; s.y += s.vy; s.life -= 1; });
    sparks = sparks.filter(function (s) { return s.life > 0; });
  }

  function frame(t) {
    if (!running) return;
    if (!lastT) lastT = t;
    var dt = Math.min(48, t - lastT);
    lastT = t;
    acc += dt;
    var steps = 0;
    while (acc >= 16.67 && steps < 4) {
      update();
      acc -= 16.67;
      steps += 1;
    }
    draw();
    raf = requestAnimationFrame(frame);
  }

  function onKey(e, down) {
    keys[e.code] = down;
    if (!down) return;
    if (e.code === 'Escape') { if (opts.onExit) opts.onExit(); return; }
    if (mode === 'talk' && (e.code === 'Enter' || e.code === 'Space')) {
      e.preventDefault();
      advance();
      return;
    }
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowDown') e.preventDefault();
  }
  function keyDown(e) { onKey(e, true); }
  function keyUp(e) { onKey(e, false); keys[e.code] = false; }

  function bindPads(el) {
    if (!el || el._bound) return;
    el._bound = true;
    el.querySelectorAll('[data-pad]').forEach(function (btn) {
      var name = btn.getAttribute('data-pad');
      function down(e) {
        e.preventDefault();
        if (mode === 'talk') { advance(); return; }
        hold[name] = true;
      }
      function up() { hold[name] = false; }
      btn.addEventListener('pointerdown', down);
      btn.addEventListener('pointerup', up);
      btn.addEventListener('pointercancel', up);
    });
  }
  function bindTalk() {
    if (!talkEl || talkEl._bound) return;
    talkEl._bound = true;
    talkEl.addEventListener('click', function (e) {
      if (e.target.closest('.mars-skip')) { skipTalk(); return; }
      advance();
    });
  }
  function bindChapters() {
    if (!chaptersEl || chaptersEl._bound) return;
    chaptersEl._bound = true;
    chaptersEl.addEventListener('click', function (e) {
      if (e.target.closest('.mars-reset')) {
        prog = { beaten: [] };
        saveProg();
        renderCards();
        beep(300, 0.05);
        return;
      }
      var card = e.target.closest('.mars-card');
      if (!card || card.disabled) return;
      beginChapter(+card.getAttribute('data-ch'));
    });
  }
  function bindMute(button) {
    if (!button || button._bound) return;
    button._bound = true;
    button.addEventListener('click', function () {
      muted = !muted;
      button.textContent = muted ? 'sound off' : 'sound on';
      button.setAttribute('aria-pressed', muted ? 'true' : 'false');
      if (!muted) beep(660, 0.06);
    });
  }

  function onResize() { fit(); }

  window.popiMars = {
    start: function (c, options) {
      canvas = c;
      ctx = canvas.getContext('2d');
      opts = options || {};
      stage = opts.stage || canvas.parentElement;
      chaptersEl = opts.chapters;
      talkEl = opts.talk;
      padsEl = opts.pads;
      running = true;
      muted = true;
      lastT = 0;
      acc = 0;
      clothI = 0;
      kittyI = 0;
      loadProg();
      fit();
      mode = 'select';
      renderCards();
      hideTalk();
      syncChrome();
      bindPads(padsEl);
      bindTalk();
      bindChapters();
      bindMute(opts.muteButton);
      window.addEventListener('keydown', keyDown);
      window.addEventListener('keyup', keyUp);
      window.addEventListener('resize', onResize);
      canvas.tabIndex = 0;
      try { canvas.focus(); } catch (e) {}
      raf = requestAnimationFrame(frame);
    },
    state: function () {
      return {
        mode: mode,
        chapter: chapter,
        phase: phase,
        lives: lives,
        stars: starsGot,
        hp: foe ? foe.hp : 0,
        friend: !!(foe && foe.friend),
        beaten: prog.beaten.slice(),
        rocks: rocks ? rocks.length : 0,
        shots: shots ? shots.map(function (s) { return s.who + ':' + s.kind; }) : []
      };
    },
    stop: function () {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      hold.left = hold.right = hold.up = hold.action = false;
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      window.removeEventListener('resize', onResize);
    }
  };
})();
