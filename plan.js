/* Goa 2027 plan pages: shared helpers, offline status, print. */
(function () {
'use strict';
function el(tag, cls, txt) { var n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; }
function link(href, txt, cls) { var a = el('a', cls, txt); a.href = href; if (/^https?:/.test(href)) { a.target = '_blank'; a.rel = 'noopener'; } return a; }
function fmtDate(iso) { var p = iso.split('-'); return +p[2] + '.' + +p[1] + '.' + p[0]; }
window.GOA_PLAN = { el: el, link: link, fmtDate: fmtDate };

function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
ready(function () {
  // print: open every collapsible part first, restore afterwards
  var opened = [];
  window.addEventListener('beforeprint', function () {
    opened = [].filter.call(document.querySelectorAll('details'), function (d) { return !d.open; });
    opened.forEach(function (d) { d.open = true; });
  });
  window.addEventListener('afterprint', function () { opened.forEach(function (d) { d.open = false; }); opened = []; });
  var pb = document.getElementById('printBtn');
  if (pb) pb.addEventListener('click', function () { window.print(); });
  var pd = document.getElementById('printDate');
  if (pd) pd.textContent = new Date().toLocaleDateString('he-IL');

  // offline status
  var box = document.getElementById('status');
  var saved = el('span', 'pill ok', '✅ נשמר בטלפון: עובד גם בלי אינטרנט');
  var off = el('span', 'pill off', '📴 אין חיבור כרגע: מוצגת הגרסה השמורה. קישורי המפות יעבדו כשיחזור החיבור');
  function paint(isSaved) {
    if (!box) return;
    box.replaceChildren();
    if (!navigator.onLine) box.appendChild(off);
    if (isSaved) box.appendChild(saved);
  }
  var isSaved = false;
  paint(false);
  window.addEventListener('online', function () { paint(isSaved); });
  window.addEventListener('offline', function () { paint(isSaved); });
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').then(function () { return navigator.serviceWorker.ready; }).then(function () {
      if (!window.caches) return;
      return caches.match(location.pathname.split('/').pop() || 'index.html', { ignoreSearch: true }).then(function (r) {
        // the first visit caches in the background; check again shortly
        if (r) { isSaved = true; paint(true); return; }
        setTimeout(function () { caches.match(location.pathname.split('/').pop(), { ignoreSearch: true }).then(function (r2) { if (r2) { isSaved = true; paint(true); } }); }, 2500);
      });
    }).catch(function () {});
  }
});
})();
