/* גואה 2027 - מוזיקת רקע: קובץ goa-loop.mp3 (הופק במיוחד לאתר) בלולאה חלקה.
   אם הקובץ לא נטען מכל סיבה - נופלים אוטומטית למנוע הסינת' המקורי (Web Audio).
   מתנגן רק אחרי מחווה של המשתמש (כפתור הכניסה/מגע), עם כפתור השתקה גלוי וזיכרון מצב בין דפים.
   לולאת גואה-טראנס ~146BPM: קיק, בס אסיד, טבלה, טאנפורה, סיטאר-ראגה עם דיליי ופדים מנצנצים.
   מתנגנת רק אחרי לחיצה של המשתמש, בעוצמה נמוכה, עם כפתור השתקה גלוי. */
(function () {
  'use strict';
  // כשהגלריה נפתחת כשכבה בתוך index (embed=1) - הדף הראשי כבר מנגן; כאן לא עושים כלום
  try { if (/([?&])embed=1/.test(location.search)) return; } catch (e) {}
  var BPM = 146;
  var SPB = 60 / BPM;
  var STEP = SPB / 4;          // שישית-עשרית
  var BARS = 8;
  var TOTAL = 16 * BARS;
  var VOL = 0.16;              // עוצמה נמוכה כברירת מחדל

  var ctx = null, master = null, noiseBuf = null;
  var delaySend = null;
  var timer = null, storeT = null, nextTime = 0, step = 0, playing = false;
  var VOL_FILE = 0.5;          // עוצמה למסלול האמיתי
  var FILE_URL = 'goa-loop.mp3';
  var fileBuf = null, fileFailed = false, fileSrc = null, fileStartAt = 0, fileStartOff = 0, mode = null;
  function loadFile() {
    if (fileBuf) return Promise.resolve(fileBuf);
    if (fileFailed) return Promise.resolve(null);
    return fetch(FILE_URL)
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.arrayBuffer(); })
      .then(function (ab) { return ctx.decodeAudioData(ab); })
      .then(function (buf) { fileBuf = buf; return buf; })
      .catch(function () { fileFailed = true; return null; });
  }
  function fileNow() {
    if (!fileSrc || !fileBuf) return 0;
    return (fileStartOff + ctx.currentTime - fileStartAt) % fileBuf.duration;
  }

  var BASS_SEQ = ['A1', 'A1', 'C2', 'G1', 'A1', 'A1', 'F1', 'G1'];
  // טבלה: תבנית קאידה של 4 תיבות, 8 מטרות (שמיניות) לתיבה
  var TABLA_A = ['DHA', 'DHIN', 'DHIN', 'DHA', 'DHA', 'DHIN', 'DHIN', 'DHA'];
  var TABLA_B = ['DHA', 'TIN', 'TIN', 'TA', 'TA', 'DHIN', 'DHIN', 'DHA'];
  var TABLA_PAT = [TABLA_A, TABLA_A, TABLA_B, TABLA_A];
  // סיטאר: פרזת ראגה (בהיירווי: A Bb C D E F G) על פני 8 תיבות, נפתרת ל-A
  var SITAR = new Array(TOTAL).fill(null);
  function putS(bar, s, note, len, bend) { SITAR[bar * 16 + s] = [note, len, bend]; }
  putS(2, 0, 'A4', 3, false); putS(2, 4, 'C5', 3, false); putS(2, 8, 'D5', 3, false); putS(2, 12, 'C5', 3, false);
  putS(3, 0, 'E5', 4, true); putS(3, 6, 'D5', 3, false); putS(3, 10, 'C5', 3, false); putS(3, 14, 'A4', 4, false);
  putS(5, 0, 'C5', 3, false); putS(5, 4, 'D5', 3, false); putS(5, 8, 'E5', 4, true); putS(5, 12, 'G5', 3, false);
  putS(6, 0, 'F5', 3, false); putS(6, 4, 'E5', 3, false); putS(6, 8, 'D5', 4, false); putS(6, 12, 'E5', 3, false);
  putS(7, 0, 'C5', 3, false); putS(7, 4, 'D5', 3, false); putS(7, 8, 'Bb4', 4, true); putS(7, 12, 'A4', 6, true);
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
    g.gain.setValueAtTime(0.9, t);
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
    g.gain.exponentialRampToValueAtTime(acc ? 0.42 : 0.28, t + 0.008);
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
  // טבלה - ממברנה נמוכה (גה/דה)
  function tablaGe(t, vol) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(196, t);
    o.frequency.exponentialRampToValueAtTime(82, t + 0.09);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + 0.25);
    var s = ctx.createBufferSource(); s.buffer = noiseBuf;
    var bf = ctx.createBiquadFilter(); bf.type = 'bandpass'; bf.frequency.value = 900; bf.Q.value = 2;
    var g2 = ctx.createGain();
    g2.gain.setValueAtTime(vol * 0.5, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    s.connect(bf); bf.connect(g2); g2.connect(master);
    s.start(t); s.stop(t + 0.06);
  }
  // טבלה - מכה גבוהה (נה/טין)
  function tablaNa(t, vol) {
    var o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o.type = 'sine';
    o.frequency.setValueAtTime(660, t);
    o.frequency.exponentialRampToValueAtTime(420, t + 0.04);
    f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = 1.2;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
    o.connect(f); f.connect(g); g.connect(master);
    o.start(t); o.stop(t + 0.13);
  }
  // טבלה - מכה קצרה (קה)
  function tablaKe(t, vol) {
    var s = ctx.createBufferSource(); s.buffer = noiseBuf;
    var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2400; f.Q.value = 1.6;
    var g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
    s.connect(f); f.connect(g); g.connect(master);
    s.start(t); s.stop(t + 0.05);
  }
  // טאנפורה - דרון הודי (פה-סה-סה-סה)
  function tanpura(t, f) {
    var o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), fl = ctx.createBiquadFilter();
    o1.type = 'sawtooth'; o1.frequency.value = f;
    o2.type = 'sawtooth'; o2.frequency.value = f * 1.003;
    fl.type = 'lowpass'; fl.frequency.value = 900; fl.Q.value = 2;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    o1.connect(fl); o2.connect(fl); fl.connect(g); g.connect(master);
    o1.start(t); o2.start(t); o1.stop(t + 1.7); o2.stop(t + 1.7);
  }
  // סיטאר - פליק עם בנד (מינד) על דרון
  function sitar(t, f, len, bend) {
    var o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(),
        bp = ctx.createBiquadFilter(), lp = ctx.createBiquadFilter();
    o1.type = 'sawtooth'; o2.type = 'square';
    if (bend) {
      o1.frequency.setValueAtTime(f * 0.94, t); o1.frequency.exponentialRampToValueAtTime(f, t + 0.09);
      o2.frequency.setValueAtTime(f * 0.94 * 1.006, t); o2.frequency.exponentialRampToValueAtTime(f * 1.006, t + 0.09);
    } else {
      o1.frequency.value = f; o2.frequency.value = f * 1.006;
    }
    bp.type = 'bandpass'; bp.frequency.value = Math.min(f * 3, 9000); bp.Q.value = 1.4;
    lp.type = 'lowpass'; lp.frequency.value = 4200;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.1, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o1.connect(bp); o2.connect(bp); bp.connect(lp); lp.connect(g);
    g.connect(master); g.connect(delaySend);
    o1.start(t); o2.start(t); o1.stop(t + len + 0.05); o2.stop(t + len + 0.05);
  }
  // פדים מנצנצים - Am(add9) עם סוויפ איטי, נצתר מחדש כל 4 תיבות
  function pad(t, root) {
    [root, root * 1.1892, root * 1.4983, root * 2.2449].forEach(function (f) {
      [1, 1.006].forEach(function (dt) {
        var o = ctx.createOscillator(), g = ctx.createGain(), fl = ctx.createBiquadFilter();
        o.type = 'sawtooth'; o.frequency.value = f * dt;
        fl.type = 'lowpass';
        fl.frequency.setValueAtTime(500, t);
        fl.frequency.linearRampToValueAtTime(2400, t + SPB * 8);
        fl.frequency.linearRampToValueAtTime(500, t + SPB * 16);
        var d = SPB * 16;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.014, t + d * 0.4);
        g.gain.linearRampToValueAtTime(0.0001, t + d);
        o.connect(fl); fl.connect(g); g.connect(master);
        o.start(t); o.stop(t + d);
      });
    });
  }
  function scheduleStep(s, t) {
    var bar = Math.floor(s / 16), st = s % 16;
    var th = t + Math.random() * 0.002; // אנושיות קלה בכלי ההקשה
    if (st % 4 === 0) kick(t);
    if (st % 4 !== 0) {
      var f = nf(BASS_SEQ[bar]);
      bass(t, st === 15 ? f * 2 : f, st === 15);
    }
    if (st % 4 === 2) hat(th, true, 0.08); else hat(th, false, 0.028);
    if (st % 4 === 0) tanpura(th, st % 8 === 0 ? 110 : 82.41);
    if (st % 2 === 0) {
      var mv = TABLA_PAT[bar % 4][st / 2];
      if (mv === 'DHA') { tablaGe(th, 0.3); tablaNa(th, 0.18); }
      else if (mv === 'DHIN') { tablaGe(th, 0.25); tablaNa(th, 0.14); }
      else if (mv === 'TIN') tablaNa(th, 0.18);
      else if (mv === 'TA') { tablaNa(th, 0.2); tablaKe(th, 0.13); }
    }
    if (s % 64 === 0) pad(t, 220);
    var nt = SITAR[s];
    if (nt) sitar(th, nf(nt[0]), nt[1] * STEP, nt[2]);
  }
  // ווידוא לולאה חלקה: בדיקה אוטומטית מרנדרת 2 מחזורים אופליין ובודקת שאין שקע בתפר
  window.__goaAudio = {
    STEP: STEP, TOTAL: TOTAL,
    bind: function (c, mst, nb, ds) { ctx = c; master = mst; noiseBuf = nb; delaySend = ds; },
    step: function (s, t) { scheduleStep(s, t); }
  };
  function tick() {
    while (nextTime < ctx.currentTime + 0.15) {
      scheduleStep(step, nextTime);
      step = (step + 1) % TOTAL;
      nextTime += STEP;
    }
  }

  function persistState() {
    var pos = (mode === 'file') ? fileNow() : step;
    try { localStorage.setItem('goa27music_state', JSON.stringify({ playing: playing, mode: mode, pos: pos, at: Date.now() })); } catch (e) {}
  }
  function startFile(off) {
    mode = 'file';
    fileSrc = ctx.createBufferSource();
    fileSrc.buffer = fileBuf;
    fileSrc.loop = true;
    fileSrc.connect(master);
    fileStartOff = fileBuf.duration ? (off % fileBuf.duration) : 0;
    fileStartAt = ctx.currentTime + 0.06;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(VOL_FILE, ctx.currentTime, 0.5);
    fileSrc.start(fileStartAt, fileStartOff);
    playing = true;
    storeT = setInterval(persistState, 1000);
    persistState();
    ui(true);
    try { localStorage.setItem('goa27music', 'on'); } catch (e) {}
  }
  function start(fromPos) {
    if (!ctx) initCtx();
    return ctx.resume().then(function () {
      if (playing) return;
      if (!fileBuf && !fileFailed) return loadFile().then(function () { start(fromPos); });
      if (fileBuf) startFile(fromPos || 0);
      else { mode = 'synth'; startSynth(fromPos || 0); }
    });
  }
  function startSynth(fromStep) {
    mode = 'synth';
    if (!ctx) initCtx();
    return ctx.resume().then(function () {
      if (playing) return;
      playing = true;
      step = fromStep || 0;
      nextTime = ctx.currentTime + 0.06;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(VOL, ctx.currentTime, 0.6);
      timer = setInterval(tick, 30);
      tick();
      storeT = setInterval(persistState, 1000);
      persistState();
      ui(true);
      try { localStorage.setItem('goa27music', 'on'); } catch (e) {}
    });
  }
  function stop() {
    if (!ctx || !playing) return;
    playing = false;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
    if (fileSrc) { var s0 = fileSrc; fileSrc = null; setTimeout(function () { try { s0.stop(); } catch (e) {} }, 600); }
    setTimeout(function () { if (ctx && !playing) ctx.suspend(); }, 900);
    clearInterval(timer);
    clearInterval(storeT);
    persistState();
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
      '@media (prefers-reduced-motion:no-preference){#goa-music.goa-playing .goa-ic{animation:goaPulse 1.644s ease-in-out infinite}}' +
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
  // טוענים את קובץ המוזיקה מראש (ההקשר נשאר מושהה עד מחווה ראשונה) כדי שהכניסה תהיה מיידית
  try { initCtx(); if (ctx.state === 'suspended') { /* decodeAudioData עובד גם כשמושהה */ } loadFile(); } catch (e) {}

  // ברירת מחדל: המוזיקה דולקת. הדפדפן דורש מגע ראשון - מתחילים בכל מגע/גלילה/מקש.
  // אם המשתמש השתיק בעבר - נזכור ולא ננגן.
  function wantsMusic() {
    try { return localStorage.getItem('goa27music') !== 'off'; } catch (e) { return true; }
  }
  // המשכיות בין דפים: אם ניגן זה עתה בדף אחר (למשל מעבר סקר <-> גלריה), ממשיכים מאותה נקודה במגע הראשון
  var pendingPos = 0;
  try {
    var st = JSON.parse(localStorage.getItem('goa27music_state') || 'null');
    if (st && st.playing && Date.now() - st.at < 30000) pendingPos = (typeof st.pos === 'number') ? st.pos : (st.step || 0);
  } catch (e) {}
  if (wantsMusic()) {
    // מנסים שוב בכל מגע עד שבאמת מתנגן (מחווה ראשונה כמו גלילה לא תמיד מספיקה לדפדפן)
    var kick = function () {
      if (playing) {
        ['pointerdown', 'touchstart', 'keydown', 'scroll'].forEach(function (ev) {
          document.removeEventListener(ev, kick);
        });
        return;
      }
      start(pendingPos);
    };
    ['pointerdown', 'touchstart', 'keydown', 'scroll'].forEach(function (ev) {
      document.addEventListener(ev, kick, { passive: true });
    });
  }
  document.addEventListener('pagehide', function () { persistState(); if (ctx && playing) ctx.suspend(); });
  document.addEventListener('visibilitychange', function () {
    if (!ctx) return;
    if (document.hidden) ctx.suspend();
    else if (playing) ctx.resume();
  });

  // API ציבורי למסך הפתיחה: התחלה מפורשת במחוות משתמש + שאילת מצב
  window.goaMusic = {
    start: function () { return start(pendingPos); },
    stop: stop,
    isPlaying: function () { return playing; }
  };
})();
