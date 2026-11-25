/* Goa 2027 daily route: renders trip-data.js into day cards, a travel-time table and a rain plan. */
(function () {
'use strict';
var G = window.GOA_TRIP, U = window.GOA_PLAN;
if (!G || !U) return;
var el = U.el, link = U.link, P = G.P;

function nm(k, again) { var p = P[k]; return (again && p.sn) ? p.sn : p.n; }
function flightOf(a, b) { for (var i = 0; i < G.FLIGHTS.length; i++) { var f = G.FLIGHTS[i]; if (f.from === a && f.to === b) return f; } return null; }
function sameSpot(a, b) { return (a === 'palolem' && b === 'palbeach') || (a === 'palbeach' && b === 'palolem'); }

/* ---------- legs ---------- */
function legChip(a, b) {
  var c = el('span', 'chip'), f = flightOf(a, b);
  if (f) { c.classList.add('ok'); c.appendChild(el('span', '', '✈️ טיסה ' + f.code)); return c; }
  if (sameSpot(a, b)) { c.appendChild(el('span', '', '🚶 בתוך פאלולם · הזמן תלוי במלון שייבחר')); return c; }
  if (G.boatLeg(a, b)) { c.appendChild(el('span', '', '⛵ בסירה מחוף פאלולם · משך השייט לא נבדק')); return c; }
  var k = G.known(a, b);
  if (k) { c.classList.add('ok'); c.appendChild(el('span', '', '🚐 ' + k.t + ' ✅')); c.title = 'מקור: ' + k.src; }
  else {
    c.classList.add('unk'); c.appendChild(el('span', 'q', '🚐 ❓ זמן לא נבדק'));
    var via = P[b].via || P[a].via; if (via) c.appendChild(el('span', '', via));
    var d = G.airKm(a, b);
    if (d != null) c.appendChild(el('span', '', '📏 ' + (d < 1 ? 'פחות מק״מ' : 'כ־' + Math.round(d) + ' ק״מ') + ' באוויר'));
    else if (P[a].base || P[b].base) c.appendChild(el('span', '', 'המלון טרם נבחר'));
  }
  var r = link(G.dirUrl(a, b), 'מסלול ↗'); r.setAttribute('aria-label', 'מסלול נסיעה בגוגל מפות מ' + P[a].n + ' אל ' + P[b].n); c.appendChild(r);
  return c;
}

/* ---------- days ---------- */
var STAGE = G.STAGE, days = document.getElementById('days'), list = document.getElementById('list'), stages = document.getElementById('stages');
var counts = {}; G.DAYS.forEach(function (x) { counts[x.stage] = (counts[x.stage] || 0) + 1; });
Object.keys(counts).forEach(function (k) { var s = el('div', '', STAGE[k].s || STAGE[k].n); s.title = STAGE[k].n; s.style.background = STAGE[k].c; s.style.setProperty('--n', counts[k]); stages.appendChild(s); });

function shareText(x, wd, id, routes) {
  var seen = {}, n = 0;
  var lines = ['🧭 ' + x.d + '.4 (יום ' + wd + '): ' + x.t];
  x.stops.forEach(function (s) { n++; lines.push(n + '. ' + (s[1] ? s[1] + ' · ' : '') + nm(s[0], seen[s[0]]) + (s[3] ? ' (רשות)' : '')); seen[s[0]] = 1; });
  routes.forEach(function (r) { lines.push('🗺️ במפות: ' + r.url); });
  lines.push('טיוטה, לא סגור: ' + location.href.split('#')[0] + '#' + id);
  return lines.join('\n');
}

G.DAYS.forEach(function (x) {
  var date = new Date(2027, 3, x.d), wd = G.WD[date.getDay()], c = STAGE[x.stage].c, id = 'd' + x.d;
  var pill = el('a'); pill.href = '#' + id; pill.style.setProperty('--c', c); pill.appendChild(document.createTextNode(x.d + '.4')); pill.appendChild(el('small', '', wd)); pill.setAttribute('aria-label', x.d + ' באפריל, יום ' + wd + ': ' + x.t); days.appendChild(pill);
  var card = el('article', 'day'); card.id = id; card.style.setProperty('--c', c); card.setAttribute('aria-labelledby', id + 'h');
  var stub = el('div', 'stub'); stub.appendChild(el('div', 'd', String(x.d))); stub.appendChild(el('div', 'm', 'אפריל')); stub.appendChild(el('div', 'w', 'יום ' + wd)); stub.appendChild(el('div', 'n', 'לינה:\n' + x.night)); card.appendChild(stub);
  var body = el('div', 'body'); var h = el('h2', '', x.t); h.id = id + 'h'; if (x.fixed) h.appendChild(el('span', 'fixed', 'קבוע')); body.appendChild(h);
  body.appendChild(el('p', 'where', STAGE[x.stage].n));
  var ol = el('ol', 'route'), prev = null, seen = {}, n = 0;
  x.stops.forEach(function (s) {
    var k = s[0], p = P[k];
    if (prev && prev !== k) { var li0 = el('li', 'leg'); li0.appendChild(legChip(prev, k)); ol.appendChild(li0); }
    n++;
    var li = el('li', 'stop' + (s[3] ? ' opt' : ''));
    li.appendChild(el('span', 'no', String(n))).setAttribute('aria-hidden', 'true');
    var line = el('div', 'st');
    if (s[1]) line.appendChild(el('span', 'tm', s[1]));
    var name = nm(k, seen[k]); seen[k] = 1;
    if (p.u) line.appendChild(link(p.u, name)); else line.appendChild(el('span', '', name));
    var m = link(G.mapUrl(k), ' 🗺️'); m.setAttribute('aria-label', 'במפה: ' + p.n); m.title = 'במפה'; line.appendChild(m);
    if (s[3]) line.appendChild(el('span', 'opt-tag', 'רשות'));
    li.appendChild(line); if (s[2]) li.appendChild(el('div', 'ds', s[2])); ol.appendChild(li); prev = k;
  });
  body.appendChild(ol);
  var routes = G.dayRoute(x);
  if (routes.length) {
    var md = el('div', 'mapday');
    routes.forEach(function (r) {
      var a = link(r.url, ''); a.appendChild(document.createTextNode('🗺️ ' + (routes.length > 1 ? 'מ' + nm(r.stops[0]).replace(/ \(.*\)$/, '') + ': ' : '') + 'המסלול במפות '));
      a.appendChild(el('small', '', r.stops.length + ' נקודות, לפי הסדר'));
      a.setAttribute('aria-label', 'כל המסלול של ' + x.d + '.4 בגוגל מפות, ' + r.stops.length + ' נקודות לפי הסדר');
      md.appendChild(a);
    });
    body.appendChild(md);
    if (routes.some(function (r) { return r.waypoints > 3; })) body.appendChild(el('p', 'ds', 'אם בטלפון לא מופיעות כל העצירות במסלול, פותחים אותו לפי קטעים (הקישורים "מסלול ↗" בין העצירות).'));
  }
  if (x.notes.length) { var ul = el('ul', 'notes'); x.notes.forEach(function (t) { ul.appendChild(el('li', '', t)); }); body.appendChild(ul); }
  var r = el('details', 'rain'); r.appendChild(el('summary', '', '☔ אם יורד גשם או שחם מדי')); var ru = el('ul');
  x.rain.forEach(function (t) { ru.appendChild(el('li', '', t)); });
  if (!x.fixed) ru.appendChild(el('li', '', 'שעות פתיחה ומחירים: לא נבדקו. לבדוק סמוך לנסיעה.'));
  r.appendChild(ru); body.appendChild(r);
  var foot = el('div', 'dayfoot');
  var txt = shareText(x, wd, id, routes);
  var share = el('a', 'share', '📤 לשלוח את היום לקבוצה'); share.href = 'https://wa.me/?text=' + encodeURIComponent(txt); share.target = '_blank'; share.rel = 'noopener';
  share.addEventListener('click', function (e) { if (navigator.share) { e.preventDefault(); navigator.share({ text: txt }).catch(function () {}); } });
  var copy = el('button', 'share', '📋 העתקת העצירות'); copy.type = 'button';
  copy.addEventListener('click', function () {
    function done(ok) { copy.textContent = ok ? '✓ הועתק' : 'ההעתקה לא הצליחה'; setTimeout(function () { copy.textContent = '📋 העתקת העצירות'; }, 2500); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function () { done(true); }, function () { done(false); });
    else done(false);
  });
  foot.appendChild(share); foot.appendChild(copy); body.appendChild(foot);
  card.appendChild(body); list.appendChild(card);
});

/* ---------- travel-time table ---------- */
function td(tr, txt, label, cls) { var c = el('td', cls || '', txt); if (label) c.setAttribute('data-l', label); tr.appendChild(c); return c; }
function table(caption, heads) {
  var t = el('table', 'tbl stack'); t.appendChild(el('caption', '', caption));
  var th = el('thead'), tr = el('tr'); heads.forEach(function (h) { tr.appendChild(el('th', '', h)); }); th.appendChild(tr); t.appendChild(th);
  var tb = el('tbody'); t.appendChild(tb); return { t: t, tb: tb };
}
(function () {
  var box = document.getElementById('timesBody');
  // flights
  var f = table('✈️ טיסות (מלוח הטיסות באתר)', ['טיסה', 'מ־ אל', 'המראה', 'נחיתה']);
  G.FLIGHTS.forEach(function (x) { var tr = el('tr'); td(tr, x.code, '', 't'); var c = td(tr, P[x.from].n + ' ← ' + P[x.to].n, 'מסלול'); c.appendChild(el('small', '', x.note)); td(tr, x.dep, 'המראה', 'nw'); td(tr, x.arr, 'נחיתה', 'nw'); f.tb.appendChild(tr); });
  box.appendChild(f.t);
  // known drives
  var MAIN_SRC = G.KNOWN['goi>candolim'].src;
  var k = table('✅ זמני נסיעה שכבר באתר', ['מקטע', 'זמן']);
  k.t.querySelector('caption').appendChild(el('small', '', 'מקור: ' + MAIN_SRC + ', אלא אם צוין אחרת.'));
  Object.keys(G.KNOWN).forEach(function (key) {
    var ab = key.split('>'), v = G.KNOWN[key], tr = el('tr');
    var c = td(tr, P[ab[0]].n + ' ← ' + P[ab[1]].n, '');
    if (v.src !== MAIN_SRC) c.appendChild(el('small', '', 'מקור: ' + v.src));
    c.appendChild(document.createTextNode(' ')); c.appendChild(link(G.dirUrl(ab[0], ab[1]), 'מפות ↗'));
    td(tr, v.t + ' ✅', '', 't ok');
    k.tb.appendChild(tr);
  });
  box.appendChild(k.t);
  // legs in the plan that were not checked
  var legs = {}, order = [];
  G.DAYS.forEach(function (x) {
    for (var i = 1; i < x.stops.length; i++) {
      var a = x.stops[i - 1][0], b = x.stops[i][0];
      if (a === b || flightOf(a, b) || sameSpot(a, b) || G.boatLeg(a, b) || G.known(a, b)) continue;
      var key = [a, b].sort().join('|');
      if (!legs[key]) { legs[key] = { a: a, b: b, days: [] }; order.push(key); }
      if (legs[key].days.indexOf(x.d) < 0) legs[key].days.push(x.d);
    }
  });
  var u = table('❓ מקטעים במסלול שזמן הנסיעה שלהם לא נבדק (' + order.length + ')', ['מקטע', 'בימים', 'קו אווירי']);
  order.forEach(function (key) {
    var L = legs[key], tr = el('tr');
    var c = td(tr, P[L.a].n + ' ← ' + P[L.b].n, '');
    var via = P[L.b].via || P[L.a].via; if (via) c.appendChild(el('small', '', via));
    c.appendChild(document.createTextNode(' ')); c.appendChild(link(G.dirUrl(L.a, L.b), 'מפות ↗'));
    var dc = td(tr, '', 'בימים'); L.days.forEach(function (d, i) { if (i) dc.appendChild(document.createTextNode(', ')); var a = el('a', '', d + '.4'); a.href = '#d' + d; dc.appendChild(a); });
    var km = G.airKm(L.a, L.b); td(tr, km == null ? (P[L.a].base || P[L.b].base ? 'המלון טרם נבחר' : '—') : (km < 1 ? 'פחות מק״מ' : 'כ־' + Math.round(km) + ' ק״מ'), 'קו אווירי');
    u.tb.appendChild(tr);
  });
  box.appendChild(u.t);
  box.appendChild(el('p', 'sub', 'קו אווירי מחושב רק בין שתי נקודות שיש להן מיקום מדויק במפות של האתר, לעולם לא מאזור שבו המלון עוד לא נבחר. הכביש תמיד ארוך יותר.'));
})();

/* ---------- rain plan ---------- */
(function () {
  var box = document.getElementById('rainBody');
  var ul = el('ul', 'rules'); G.RAIN_RULES.forEach(function (t) { ul.appendChild(el('li', '', t)); }); box.appendChild(ul);
  G.RAIN.forEach(function (a) {
    var s = el('section', 'rainarea'); s.style.setProperty('--c', STAGE[a.stage].c);
    s.appendChild(el('h3', '', '☔ ' + a.title)); var l = el('ul');
    a.items.forEach(function (it) {
      var li = el('li', '', it.t);
      if (it.k) { var kn = G.KNOWN[it.k]; li.appendChild(el('span', 'tm', ' · ' + kn.t + ' מהבסיס ✅')); }
      if (it.p) { li.appendChild(document.createTextNode(' ')); var m = link(G.mapUrl(it.p), '🗺️'); m.setAttribute('aria-label', 'במפה'); li.appendChild(m); }
      l.appendChild(li);
    });
    s.appendChild(l);
    var changed = G.DAYS.filter(function (x) { return x.stage === a.stage && !/^(אין שינוי|נוסעים כרגיל|מנוחה במלון)/.test(x.rain[0]); });
    if (changed.length) {
      var p = el('p', 'sub', 'ימים שבהם גשם משנה את התוכנית: ');
      changed.forEach(function (x, i) { if (i) p.appendChild(document.createTextNode(' · ')); var lk = el('a', '', x.d + '.4 ' + x.t); lk.href = '#d' + x.d; p.appendChild(lk); });
      s.appendChild(p);
    }
    box.appendChild(s);
  });
  box.appendChild(el('p', 'sub', 'שעות פתיחה ומחירים של כל המקומות כאן: לא נבדקו.'));
})();

/* ---------- tabs ---------- */
var tabs = [].slice.call(document.querySelectorAll('.tabs a')), panels = ['days-view', 'times', 'rain'];
function show(id, focusTop) {
  panels.forEach(function (p) { document.getElementById(p).hidden = p !== id; });
  tabs.forEach(function (t) { t.setAttribute('aria-selected', String(t.getAttribute('aria-controls') === id)); });
  if (focusTop) document.querySelector('.tabs').scrollIntoView({ block: 'start' });
}
function route() {
  var h = location.hash.slice(1);
  if (h === 'times' || h === 'rain') { show(h); return; }
  show('days-view');
  if (/^d\d+$/.test(h)) { var c = document.getElementById(h); if (c) c.scrollIntoView({ block: 'start' }); }
}
tabs.forEach(function (t) { t.addEventListener('click', function (e) { e.preventDefault(); var id = t.getAttribute('aria-controls'); history.replaceState(null, '', id === 'days-view' ? location.pathname : '#' + id); show(id, true); }); });
window.addEventListener('hashchange', route);
route();

/* ---------- day strip highlight, today, rain toggle ---------- */
var pills = [].slice.call(days.querySelectorAll('a')), lock = 0;
function mark(p) { pills.forEach(function (q) { q.classList.toggle('on', q === p); if (q === p) q.setAttribute('aria-current', 'true'); else q.removeAttribute('aria-current'); }); }
pills.forEach(function (p) { p.addEventListener('click', function () { lock = Date.now(); mark(p); }); });
if ('IntersectionObserver' in window) {
  var io = new IntersectionObserver(function (es) {
    if (Date.now() - lock < 1200) return;
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var p = days.querySelector('a[href="#' + e.target.id + '"]'); if (!p) return; mark(p);
      var r = p.getBoundingClientRect(), dr = days.getBoundingClientRect();
      if (r.left < dr.left || r.right > dr.right) days.scrollLeft += r.left - dr.left - dr.width / 2 + r.width / 2;
    });
  }, { rootMargin: '-90px 0px -60% 0px' });
  [].forEach.call(list.children, function (c) { io.observe(c); });
}
var now = new Date();
if (now.getFullYear() === 2027 && now.getMonth() === 3 && now.getDate() >= 12 && now.getDate() <= 28) {
  var tc = document.getElementById('d' + now.getDate());
  if (tc) {
    tc.querySelector('h2').appendChild(el('span', 'today', 'היום'));
    if (!location.hash) window.addEventListener('load', function () { tc.scrollIntoView({ block: 'start', behavior: 'instant' }); });
  }
}
var btn = document.getElementById('rainAll');
btn.addEventListener('click', function () { var on = btn.getAttribute('aria-pressed') !== 'true'; btn.setAttribute('aria-pressed', String(on)); btn.textContent = on ? '☔ להסתיר את חלופות הגשם' : '☔ להציג את כל חלופות הגשם'; list.querySelectorAll('details.rain').forEach(function (d) { d.open = on; }); });
})();
