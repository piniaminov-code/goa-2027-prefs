/* Goa 2027 packing list and deadlines. Ticks live only in this browser (localStorage). */
(function () {
'use strict';
var G = window.GOA_TRIP, U = window.GOA_PLAN;
if (!G || !U) return;
var el = U.el, KEY = 'goa27pack';

/* ---------- deadlines ---------- */
var today = new Date(); today.setHours(0, 0, 0, 0);
var ol = document.getElementById('deadlines');
G.DEADLINES.forEach(function (x) {
  var p = x.date.split('-'), d = new Date(+p[0], +p[1] - 1, +p[2]), diff = Math.round((d - today) / 864e5);
  var li = el('li', diff < 0 ? 'past' : diff <= 30 ? 'soon' : '');
  var dt = el('div', 'dt', +p[2] + '.' + +p[1]);
  dt.appendChild(el('small', '', (x.approx ? 'בערך · ' : '') + (diff < 0 ? 'עבר' : diff === 0 ? 'היום' : 'בעוד ' + diff + ' ימים')));
  li.appendChild(dt);
  var tx = el('div', 'tx');
  if (x.link) tx.appendChild(U.link(x.link, x.t)); else tx.appendChild(document.createTextNode(x.t));
  if (x.cond) tx.appendChild(el('span', 'cond', 'אם ייבחר'));
  tx.appendChild(el('small', '', 'מקור: ' + x.src));
  li.appendChild(tx); ol.appendChild(li);
});

/* ---------- checklist ---------- */
var state = {}, canStore = true;
try { state = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; localStorage.setItem(KEY + '_t', '1'); localStorage.removeItem(KEY + '_t'); }
catch (e) { canStore = false; state = {}; }
if (!canStore) document.getElementById('storeNote').hidden = false;
function save() { if (!canStore) return; try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

var box = document.getElementById('checklist'), total = 0, legends = {};
G.PACK.forEach(function (g) {
  var fs = el('fieldset', 'grp'), lg = el('legend', '', g.t), sm = el('small', '');
  lg.appendChild(sm); fs.appendChild(lg); legends[g.id] = { small: sm, items: g.items };
  g.items.forEach(function (it) {
    total++;
    var id = 'pk-' + it[0], row = el('div', 'ck'), cb = el('input'), lb = el('label', '', it[1]);
    cb.type = 'checkbox'; cb.id = id; cb.checked = !!state[it[0]]; lb.htmlFor = id;
    if (it[2]) lb.appendChild(el('small', '', 'מהאתר: ' + it[2]));
    cb.addEventListener('change', function () { if (cb.checked) state[it[0]] = 1; else delete state[it[0]]; save(); paint(); });
    row.appendChild(cb); row.appendChild(lb); fs.appendChild(row);
  });
  box.appendChild(fs);
});
function paint() {
  var done = 0;
  Object.keys(legends).forEach(function (k) {
    var L = legends[k], n = L.items.filter(function (it) { return state[it[0]]; }).length; done += n;
    L.small.textContent = n + '/' + L.items.length + (n === L.items.length ? ' ✓' : '');
  });
  document.getElementById('bar').style.width = Math.round(100 * done / total) + '%';
  document.getElementById('count').textContent = done === total ? '🎉 הכל מסומן. נסיעה טובה!' : done + ' מתוך ' + total + ' מסומנים';
}
paint();

document.getElementById('resetList').addEventListener('click', function () {
  if (!Object.keys(state).length) return;
  if (!confirm('לנקות את כל הסימונים בטלפון הזה?')) return;
  state = {}; save(); box.querySelectorAll('input[type=checkbox]').forEach(function (c) { c.checked = false; }); paint();
});
var cp = document.getElementById('copyList');
cp.addEventListener('click', function () {
  var lines = ['🎒 גואה 2027 - ציוד וסידורים'];
  G.PACK.forEach(function (g) { lines.push('', g.t + ':'); g.items.forEach(function (it) { lines.push((state[it[0]] ? '✅ ' : '⬜ ') + it[1]); }); });
  var txt = lines.join('\n');
  function done(ok) { cp.textContent = ok ? '✓ הועתק, אפשר להדביק בקבוצה' : 'ההעתקה לא הצליחה'; setTimeout(function () { cp.textContent = '📋 העתקת הרשימה'; }, 3000); }
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function () { done(true); }, function () { done(false); });
  else done(false);
});

/* ---------- calendar file (.ics) ---------- */
function esc(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n'); }
// RFC 5545: lines over 75 octets are folded; count UTF-8 bytes and never split a character
function fold(line) {
  var out = [], cur = '', bytes = 0, limit = 75;
  Array.from(line).forEach(function (ch) {
    var b = new TextEncoder().encode(ch).length;
    if (bytes + b > limit) { out.push(cur); cur = ' '; bytes = 1; limit = 75; }
    cur += ch; bytes += b;
  });
  out.push(cur);
  return out.join('\r\n');
}
function icsEvents() {
  var ev = [], P = G.P;
  G.FLIGHTS.forEach(function (f) {
    ev.push({ id: 'flight-' + f.code, start: f.utc[0], end: f.utc[1], sum: '✈️ ' + f.code + ' ' + P[f.from].n + ' ← ' + P[f.to].n, desc: 'המראה ' + f.dep + ', נחיתה ' + f.arr + ' (שעון מקומי בכל שדה). ' + f.note });
  });
  // "be at the airport by" reminders from the flight card (local time to UTC as above)
  ev.push({ id: 'airport-del-13', start: '20270413T040000Z', end: '20270413T042000Z', sum: 'להיות בשדה בדלהי (טרמינל 3)', desc: 'לפי לוח הטיסות: להיות בשדה עד כ־09:30 שעון הודו, לטיסה AI2495 ב־11:50.' });
  ev.push({ id: 'airport-goi-27', start: '20270427T143000Z', end: '20270427T145000Z', sum: 'להיות בשדה דבולים (GOI)', desc: 'לפי לוח הטיסות: להיות בשדה עד כ־20:00 שעון הודו, לטיסה AI2510 ב־23:10.' });
  ev.push({ id: 'seder', day: '20270421', sum: '🕎 ליל הסדר, בית חב״ד פאלולם (בערב)', desc: 'ברישום מראש. הרישום לתשפ״ז טרם נפתח: לשלוח הודעה מוקדם, לפי כרטיס ליל הסדר באתר.' });
  G.DEADLINES.forEach(function (d, i) {
    if (d.cond || /המראה|להיות בשדה|ליל הסדר/.test(d.t)) return; // conditional hotels, and items already above
    ev.push({ id: 'deadline-' + i, day: d.date.replace(/-/g, ''), sum: '⏳ ' + d.t + (d.approx ? ' (בערך)' : ''), desc: 'מקור: ' + d.src + (d.link ? ' · ' + d.link : '') });
  });
  return ev;
}
function nextDay(ymd) { var d = new Date(Date.UTC(+ymd.slice(0, 4), +ymd.slice(4, 6) - 1, +ymd.slice(6, 8) + 1)); return d.toISOString().slice(0, 10).replace(/-/g, ''); }
function buildIcs() {
  var stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  var L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Pini Tours//Goa 2027//HE', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:' + esc('גואה 2027')];
  icsEvents().forEach(function (e) {
    L.push('BEGIN:VEVENT', 'UID:' + e.id + '@goa-2027-pini-tours', 'DTSTAMP:' + stamp);
    if (e.day) { L.push('DTSTART;VALUE=DATE:' + e.day, 'DTEND;VALUE=DATE:' + nextDay(e.day), 'TRANSP:TRANSPARENT'); }
    else { L.push('DTSTART:' + e.start, 'DTEND:' + e.end); }
    L.push(fold('SUMMARY:' + esc(e.sum)), fold('DESCRIPTION:' + esc(e.desc)), 'END:VEVENT');
  });
  L.push('END:VCALENDAR');
  return L.join('\r\n') + '\r\n';
}
window.GOA_ICS = buildIcs;
var ib = document.getElementById('icsBtn');
ib.addEventListener('click', function () {
  var blob = new Blob([buildIcs()], { type: 'text/calendar;charset=utf-8' }), a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'goa-2027.ics'; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  ib.textContent = '✓ קובץ היומן ירד. פותחים אותו כדי להוסיף';
  setTimeout(function () { ib.textContent = '🗓️ הוספה ליומן בטלפון'; }, 5000);
});
})();
