/* Goa 2027: "use it like an app" - fullscreen and add to home screen, honest per platform.
   - Fullscreen only where the browser supports it for pages (not on iPhone Safari).
   - Install: Chrome / Edge / Samsung (Android and desktop) get the real install prompt (beforeinstallprompt);
     iPhone / iPad get short Share-sheet instructions; other browsers get an honest note.
   - Nothing is shown when the site already runs from the home screen, or inside a frame (gallery overlay, Mia in the kids page).
   - No external requests, no tracking. */
(function () {
'use strict';
var ua = navigator.userAgent || '';
var framed = false; try { framed = window.top !== window.self; } catch (e) { framed = true; }
function standalone() {
  return navigator.standalone === true ||
    ['standalone', 'fullscreen', 'minimal-ui'].some(function (m) { return window.matchMedia && matchMedia('(display-mode: ' + m + ')').matches; });
}
if (standalone()) document.documentElement.classList.add('is-standalone');

// offline + install support (sw.js only caches the static shell; see that file)
if ('serviceWorker' in navigator && location.protocol !== 'file:' && !framed) {
  window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
}
if (framed || standalone()) return;

var isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
var isIPhone = /iPhone|iPod/.test(ua);
var isAndroid = /Android/.test(ua);
var isFirefox = /Firefox|FxiOS/.test(ua);
var isSafariDesktop = !isIOS && /Safari/.test(ua) && !/Chrome|Chromium|CriOS|Edg|OPR|Firefox|SamsungBrowser/.test(ua);
var fsEl = document.documentElement;
var canFullscreen = !isIPhone && !!(document.fullscreenEnabled || document.webkitFullscreenEnabled) && !!(fsEl.requestFullscreen || fsEl.webkitRequestFullscreen);
var deferred = null, installed = false;

window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; render(); });
window.addEventListener('appinstalled', function () { installed = true; deferred = null; render(); });

function el(tag, cls, txt) { var n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; }
function inFs() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
function toggleFs() {
  if (inFs()) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
  var r = (fsEl.requestFullscreen || fsEl.webkitRequestFullscreen).call(fsEl, { navigationUI: 'hide' });
  if (r && r.catch) r.catch(function () { note('הדפדפן לא אישר מסך מלא כרגע.'); });
}

var btn, sheet, body, msg, side;
function note(t) { if (msg) { msg.textContent = t; msg.hidden = !t; } }

function installHelp() {
  var box = el('div');
  if (isIOS) {
    box.appendChild(el('p', '', 'באייפון ובאייפד מוסיפים את האתר למסך הבית בשלושה צעדים:'));
    var ol = el('ol');
    var li1 = el('li'); li1.appendChild(document.createTextNode('לוחצים על כפתור השיתוף ')); var s = el('span', 'share-ic', '⬆'); s.setAttribute('aria-hidden', 'true'); li1.appendChild(s); li1.appendChild(document.createTextNode(' בסרגל של הדפדפן (בספארי: למטה או למעלה).'));
    ol.appendChild(li1);
    ol.appendChild(el('li', '', 'גוללים ובוחרים "הוספה למסך הבית".'));
    ol.appendChild(el('li', '', 'לוחצים "הוספה". האייקון של הפיל יופיע במסך הבית.'));
    box.appendChild(ol);
    box.appendChild(el('p', 'note', 'אם האפשרות לא מופיעה בדפדפן הזה, פותחים את האתר בספארי ומנסים שם.'));
  } else if (isAndroid && isFirefox) {
    box.appendChild(el('p', '', 'בפיירפוקס באנדרואיד: בתפריט ⋮ בוחרים "הוספה למסך הבית" או "התקנה".'));
  } else if (isFirefox) {
    box.appendChild(el('p', '', 'פיירפוקס במחשב לא מציע הוספת אתרים כאפליקציה. אפשר לשמור סימנייה (Ctrl+D), או לפתוח את האתר בכרום או באדג׳ ולהתקין משם.'));
  } else if (isSafariDesktop) {
    box.appendChild(el('p', '', 'בספארי במק, בגרסאות חדשות: תפריט "קובץ" ← "הוספה ל־Dock". בגרסאות ישנות אין אפשרות כזו, ואפשר לשמור סימנייה.'));
  } else {
    box.appendChild(el('p', '', 'אם לא נפתח חלון התקנה: בתפריט הדפדפן ⋮ בוחרים "התקנת אפליקציה" או "הוספה למסך הבית". אם האתר כבר מותקן, פותחים אותו מהמסך הראשי.'));
  }
  return box;
}

function render() {
  if (!sheet) return;
  body.replaceChildren();
  if (canFullscreen) {
    var f = el('button', 'act', inFs() ? '↙ יציאה ממסך מלא' : '⛶ מסך מלא');
    f.type = 'button'; f.id = 'app-fs'; f.addEventListener('click', toggleFs); body.appendChild(f);
  }
  if (installed) { body.appendChild(el('p', 'ok', '✓ נוסף. אפשר לפתוח מהמסך הראשי.')); return; }
  if (isIOS && !deferred) { // no install API on iPhone/iPad: the steps are the whole answer
    var hh = el('h3', '', '📲 הוספה למסך הבית'); hh.style.cssText = 'margin:12px 0 0;font-size:15px';
    body.appendChild(hh); body.appendChild(installHelp()); return;
  }
  var i = el('button', 'act main', '📲 הוספה למסך הבית'); i.type = 'button'; i.id = 'app-install';
  var help = el('div', 'help'); help.hidden = true; help.appendChild(installHelp());
  i.addEventListener('click', function () {
    if (deferred) {
      var d = deferred; deferred = null;
      d.prompt();
      (d.userChoice || Promise.resolve({})).then(function (c) { if (c && c.outcome === 'accepted') { installed = true; render(); } else render(); });
    } else { help.hidden = false; i.setAttribute('aria-expanded', 'true'); }
  });
  body.appendChild(i); body.appendChild(help);
}

function open(on) {
  sheet.hidden = !on; btn.setAttribute('aria-expanded', String(on));
  if (on) { render(); note(''); var first = sheet.querySelector('button.act') || sheet.querySelector('button.x'); if (first) first.focus(); }
}

function build() {
  if (document.getElementById('app-ctl')) return;
  var slot = document.querySelector('[data-app-ctl]');
  side = (document.body.getAttribute('data-app-ctl-side') === 'end') ? ' app-side-end' : '';
  btn = el('button', 'app-ctl' + (slot ? '' : ' corner' + side));
  btn.type = 'button'; btn.id = 'app-ctl';
  btn.setAttribute('aria-haspopup', 'dialog'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'app-sheet');
  btn.title = 'מסך מלא והוספה למסך הבית';
  var ic = el('span', 'ic', '📲'); ic.setAttribute('aria-hidden', 'true');
  btn.appendChild(ic); btn.appendChild(el('span', 'tx', canFullscreen ? 'מסך מלא ומסך הבית' : 'הוספה למסך הבית'));
  sheet = el('div', 'app-sheet' + side); sheet.id = 'app-sheet'; sheet.hidden = true;
  sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-labelledby', 'app-sheet-h');
  var h = el('h2', '', 'להשתמש באתר כמו באפליקציה'); h.id = 'app-sheet-h'; sheet.appendChild(h);
  var x = el('button', 'x', '✕'); x.type = 'button'; x.setAttribute('aria-label', 'סגירה'); x.addEventListener('click', function () { open(false); btn.focus(); }); sheet.appendChild(x);
  body = el('div'); sheet.appendChild(body);
  msg = el('p', 'note'); msg.hidden = true; msg.setAttribute('role', 'status'); sheet.appendChild(msg);
  btn.addEventListener('click', function () { open(sheet.hidden); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sheet.hidden) { open(false); btn.focus(); } });
  document.addEventListener('click', function (e) { if (!sheet.hidden && !sheet.contains(e.target) && !btn.contains(e.target)) open(false); });
  ['fullscreenchange', 'webkitfullscreenchange'].forEach(function (ev) { document.addEventListener(ev, render); });
  if (slot) slot.appendChild(btn); else document.body.appendChild(btn);
  // optional: line the corner button up with an element (e.g. the kids page back link) instead of the very top
  var anchorSel = document.body.getAttribute('data-app-ctl-anchor');
  if (!slot && anchorSel) {
    var place = function () {
      var a = document.querySelector(anchorSel); if (!a) return;
      var r = a.getBoundingClientRect(), y = r.top + window.scrollY + (r.height - 44) / 2;
      btn.style.top = Math.max(0, Math.round(y)) + 'px';
      sheet.style.position = 'absolute'; sheet.style.top = Math.round(r.bottom + window.scrollY + 8) + 'px';
    };
    place(); window.addEventListener('resize', place); window.addEventListener('load', place);
  }
  document.body.appendChild(sheet);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
