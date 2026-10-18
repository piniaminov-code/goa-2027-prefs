/* גואה 2027 - מוזיקת רקע מקורית ב-Web Audio. בלי קבצים, בלי יצירות מוגנות.
   לולאת גואה-טראנס ~140BPM: קיק, בס אסיד, האטים, קלאפ וליד עם דיליי.
   מתנגנת רק אחרי לחיצה של המשתמש, בעוצמה נמוכה, עם כפתור השתקה גלוי. */
(function () {
  'use strict';
  var BPM = 140;
  var SPB = 60 / BPM;
  var STEP = SPB / 4;          // שישית-עשרית
  var BARS = 8;
  var TOTAL = 16 * BARS;
  var VOL = 0.16;              // עוצמה נמוכה כברירת מחדל

  var ctx = null, master = null, noiseBuf = null;
  var delaySend = null;
  var timer = null, nextTime = 0, step = 0, playing = false;

  var BASS_SEQ = ['A1', 'A1', 'A1', 'A1', 'F1', 'F1', 'G1', 'G1'];
  var SCALE = ['A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6'];
  var LEAD = new Array(TOTAL).fill(null);
  function put(bar, s, i) { LEAD[bar * 16 + s] = i; }
  put(2, 0, 0); put(2, 4, 2); put(2, 8, 4); put(2, 12, 7);
  put(3, 0, 9); put(3, 4, 7); put(3, 8, 4); put(3, 12, 2);
  put(6, 0, 0); put(6, 4, 3); put(6, 8, 5); put(6, 12, 7);
  put(7, 0, 7); put(7, 3, 9); put(7, 6, 7); put(7, 9, 4); put(7, 12, 2); put(7, 14, 0);

  var SEMI = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
  function nf(n) {
    var m = /^([A-G])(#|b)?(\d)$/.exec(n);
    var midi = (parseInt(m[3], 10) + 1) * 12 + SEMI[m[1] + (m[2] || '')];
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function initCtx() {
    var AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    var comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.ratio.value = 6;
    comp.connect(ctx.destination);
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(comp);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    var delay = ctx.createDelay(1);
    delay.delayTime.value = STEP * 3;
    var fb = ctx.createGain(); fb.gain.value = 0.36;
    var wet = ctx.createGain(); wet.gain.value = 0.45;
    delay.connect(fb); fb.connect(delay);
    delay.connect(wet); wet.connect(master);
    delaySend = delay;
  }

  function kick(t) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(46, t + 0.11);
    g.gain.setValueAtTime(0.95, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + 0.3);
  }
  function bass(t, f, acc) {
    var o = ctx.createOscillator(), g = ctx.createGain(), fl = ctx.createBiquadFilter();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(f, t);
    fl.type = 'lowpass'; fl.Q.value = 11;
    fl.frequency.setValueAtTime(acc ? 1600 : 850 + Math.random() * 250, t);
    fl.frequency.exponentialRampToValueAtTime(180, t + STEP * 0.95);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(acc ? 0.5 : 0.34, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.001, t + STEP * 0.92);
    o.connect(fl); fl.connect(g); g.connect(master);
    o.start(t); o.stop(t + STEP);
  }
  function hat(t, open, vol) {
    var s = ctx.createBufferSource(); s.buffer = noiseBuf;
    var f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7800;
    var g = ctx.createGain(), d = open ? 0.09 : 0.035;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + d);
    s.connect(f); f.connect(g); g.connect(master);
    s.start(t); s.stop(t + d + 0.02);
  }
  function clap(t) {
    var s = ctx.createBufferSource(); s.buffer = noiseBuf;
    var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1600; f.Q.value = 1.1;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.26, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    s.connect(f); f.connect(g); g.connect(master);
    s.start(t); s.stop(t + 0.2);
  }
  function lead(t, f) {
    var o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), fl = ctx.createBiquadFilter();
    o1.type = 'sawtooth'; o2.type = 'square';
    o1.frequency.value = f; o2.frequency.value = f * 1.005;
    fl.type = 'lowpass'; fl.frequency.value = 3200;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.13, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + STEP * 1.8);
    o1.connect(fl); o2.connect(fl); fl.connect(g);
    g.connect(master); g.connect(delaySend);
    o1.start(t); o2.start(t); o1.stop(t + STEP * 2); o2.stop(t + STEP * 2);
  }
  function pad(t) {
    ['A3', 'C4', 'E4'].forEach(function (n) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'triangle'; o.frequency.value = nf(n);
      var d = SPB * 8;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.032, t + d * 0.3);
      g.gain.linearRampToValueAtTime(0.0001, t + d);
      o.connect(g); g.connect(master);
      o.start(t); o.stop(t + d);
    });
  }

  function scheduleStep(s, t) {
    var bar = Math.floor(s / 16), st = s % 16;
    if (st % 4 === 0) kick(t);
    if (st % 4 !== 0) {
      var f = nf(BASS_SEQ[bar]);
      bass(t, st === 15 ? f * 2 : f, st === 15);
    }
    if (st % 4 === 2) hat(t, true, 0.13); else hat(t, false, 0.045);
    if (st % 8 === 4) clap(t);
    if (st === 0 && bar % 2 === 0) pad(t);
    var li = LEAD[s];
    if (li !== null) lead(t, nf(SCALE[li]));
  }
  function tick() {
    while (nextTime < ctx.currentTime + 0.15) {
      scheduleStep(step, nextTime);
      step = (step + 1) % TOTAL;
      nextTime += STEP;
    }
  }

  function start() {
    if (!ctx) initCtx();
    return ctx.resume().then(function () {
      if (playing) return;
      playing = true;
      step = 0;
      nextTime = ctx.currentTime + 0.06;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(VOL, ctx.currentTime, 0.6);
      timer = setInterval(tick, 30);
      tick();
      ui(true);
      try { localStorage.setItem('goa27music', 'on'); } catch (e) {}
    });
  }
  function stop() {
    if (!ctx || !playing) return;
    playing = false;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
    setTimeout(function () { if (ctx && !playing) ctx.suspend(); }, 900);
    clearInterval(timer);
    ui(false);
    try { localStorage.setItem('goa27music', 'off'); } catch (e) {}
  }

  var btn, lbl;
  function ui(on) {
    if (!btn) return;
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.classList.toggle('goa-playing', on);
    lbl.textContent = on ? 'מושמע' : 'מוזיקה';
    btn.title = on ? 'השתק מוזיקה' : 'הפעל מוזיקת רקע';
  }
  function build() {
    var st = document.createElement('style');
    st.textContent =
      '#goa-music{position:fixed;bottom:14px;left:14px;z-index:2147483000;display:flex;align-items:center;gap:8px;' +
      'background:rgba(20,6,45,.82);border:1px solid rgba(190,120,255,.45);border-radius:999px;padding:6px 14px 6px 8px;' +
      'backdrop-filter:blur(6px);cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent;' +
      'box-shadow:0 2px 14px rgba(0,0,0,.45);transition:border-color .3s;font-family:inherit}' +
      '#goa-music .goa-ic{font-size:20px;line-height:1}' +
      '#goa-music .goa-tx{color:#e8dcff;font-size:13px;font-weight:700}' +
      '#goa-music.goa-playing{border-color:#c96bff;box-shadow:0 0 18px rgba(190,90,255,.55)}' +
      '@media (prefers-reduced-motion:no-preference){#goa-music.goa-playing .goa-ic{animation:goaPulse 1.714s ease-in-out infinite}}' +
      '@keyframes goaPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.18)}}';
    document.head.appendChild(st);
    btn = document.createElement('div');
    btn.id = 'goa-music';
    btn.setAttribute('role', 'button');
    btn.setAttribute('tabindex', '0');
    btn.setAttribute('aria-pressed', 'false');
    var ic = document.createElement('span'); ic.className = 'goa-ic'; ic.textContent = '🎵';
    lbl = document.createElement('span'); lbl.className = 'goa-tx'; lbl.textContent = 'מוזיקה';
    lbl.classList.add('goa-tx');
    btn.appendChild(ic); btn.appendChild(lbl);
    function onLabel(on) { lbl.textContent = on ? 'מושמע' : 'מוזיקה'; }
    var origUi = ui;
    ui = function (on) { origUi(on); onLabel(on); ic.textContent = on ? '🔊' : '🎵'; };
    btn.title = 'הפעל מוזיקת רקע';
    function toggle() { if (playing) stop(); else start(); }
    btn.addEventListener('click', toggle);
    btn.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    document.body.appendChild(btn);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();

  // ברירת מחדל: המוזיקה דולקת. הדפדפן דורש מגע ראשון - מתחילים בכל מגע/גלילה/מקש.
  // אם המשתמש השתיק בעבר - נזכור ולא ננגן.
  function wantsMusic() {
    try { return localStorage.getItem('goa27music') !== 'off'; } catch (e) { return true; }
  }
  if (wantsMusic()) {
    var started = false;
    var kick = function () {
      if (started) return;
      started = true;
      ['pointerdown', 'touchstart', 'keydown', 'scroll'].forEach(function (ev) {
        document.removeEventListener(ev, kick);
      });
      start();
    };
    ['pointerdown', 'touchstart', 'keydown', 'scroll'].forEach(function (ev) {
      document.addEventListener(ev, kick, { passive: true });
    });
  }
  document.addEventListener('pagehide', function () { if (ctx && playing) ctx.suspend(); });
  document.addEventListener('visibilitychange', function () {
    if (!ctx) return;
    if (document.hidden) ctx.suspend();
    else if (playing) ctx.resume();
  });
})();
