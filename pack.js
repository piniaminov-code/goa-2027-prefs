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
})();
