/* גואה 2027 - גלריית החבורה: קטעים אמיתיים של האנשים (בלי שינוי פנים/גוף)
   על רקע גואה-טראנס ניאון, עם ריקוד קל בקצב. תמונות candid במסגרת ניאון.
   כדי להוסיף תמונה: מעלים נכס חדש, ומוסיפים שורה אחת ל-GOA_PHOTOS. */
(function () {
  'use strict';

  var PHOTOS = [
    { src: 'GOA_CUT2',   type: 'cut',   hero: true, caption: 'החבורה של גואה 2027 💜', alt: 'כל החבורה מול ארמון שנברון' },
    { src: 'GOA_CUT7',   type: 'cut',   caption: 'מוכנים לגלשנים 🏄', alt: 'החבורה עם גלשנים' },
    { src: 'GOA_CUT3',   type: 'cut',   caption: 'כבר במוד דקלים 🌴', alt: 'החבורה מול בריכה ודקלים' },
    { src: 'GOA_CUT1',   type: 'cut',   caption: 'מפגש מפקדה ⛲', alt: 'החבורה מול המזרקה' },
    { src: 'GOA_CUT4',   type: 'cut',   caption: 'אימון מערות 🕉️', alt: 'החבורה במערה' },
    { src: 'GOA_PHOTO5', type: 'frame', caption: 'ארוחת צוות 🍛', alt: 'סלפי סביב שולחן במסעדה' },
    { src: 'GOA_PHOTO6', type: 'frame', caption: 'סיור ג׳ונגל 🌿', alt: 'סלפי של החבורה ביער' },
    { src: 'GOA_PHOTO8', type: 'frame', caption: 'סעודת לילה 🌙', alt: 'סלפי סביב שולחן ערב' },
    { src: 'GOA_PHOTO9', type: 'frame', caption: 'שולחן הסיום 🥂', alt: 'סלפי סביב שולחן ארוחת ערב ארוך' },
    { src: 'GOA_PHOTO10', type: 'frame', caption: 'מסעדת המלון 🍽️', alt: 'סלפי במסעדת המלון' }
  ];

  var CSS =
    '#goa-crew{margin:18px auto 26px;max-width:960px;width:100%;box-sizing:border-box;padding:0 14px}' +
    '#goa-crew h2{text-align:center;color:#f3e8ff;font-size:26px;margin:6px 0 2px;text-shadow:0 0 18px rgba(190,80,255,.65)}' +
    '#goa-crew .goa-sub{text-align:center;color:#c9b3e8;font-size:14px;margin:0 0 16px}' +
    '.goa-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr));gap:14px;width:100%}' +
    '.goa-item{margin:0;min-width:0;width:100%;box-sizing:border-box;position:relative;border-radius:20px;overflow:hidden;' +
    'border:1px solid rgba(190,110,255,.45);box-shadow:0 0 26px rgba(140,40,220,.35),inset 0 0 40px rgba(60,0,90,.35);' +
    'background-color:#160736;background-size:cover;background-position:center}' +
    '.goa-item.hero{grid-column:1/-1}' +
    '.goa-item img.goa-group{position:absolute;bottom:0;left:50%;width:94%;height:auto;' +
    'transform:translateX(-50%);transform-origin:50% 100%;' +
    'filter:drop-shadow(0 0 14px rgba(220,120,255,.55)) drop-shadow(0 6px 10px rgba(0,0,0,.45));' +
    'animation:goaDance .857s ease-in-out infinite alternate}' +
    '.goa-item .goa-shadow{position:absolute;bottom:2%;left:50%;width:80%;height:26px;transform:translateX(-50%);' +
    'background:radial-gradient(ellipse at center,rgba(0,0,0,.5),transparent 70%);pointer-events:none}' +
    '.goa-item figcaption{position:absolute;top:10px;right:10px;z-index:3;background:rgba(18,4,40,.78);' +
    'color:#efe3ff;font-size:13px;font-weight:700;padding:5px 12px;border-radius:999px;' +
    'border:1px solid rgba(190,110,255,.5);backdrop-filter:blur(4px)}' +
    '.goa-item.frame{background:#160736;padding:10px}' +
    '.goa-item.frame img{display:block;width:100%;height:auto;border-radius:14px;' +
    'border:2px solid rgba(200,100,255,.75);box-shadow:0 0 22px rgba(180,70,255,.55);' +
    'animation:goaSway 3.43s ease-in-out infinite alternate}' +
    '@keyframes goaDance{from{transform:translateX(-50%) translateY(0) rotate(-.8deg)}to{transform:translateX(-50%) translateY(-2.4%) rotate(.8deg)}}' +
    '@keyframes goaSway{from{transform:rotate(-.6deg)}to{transform:rotate(.6deg)}}' +
    '@media (prefers-reduced-motion:reduce){.goa-item img.goa-group,.goa-item.frame img{animation:none}}';

  function build() {
    var st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);

    var sec = document.createElement('section');
    sec.id = 'goa-crew';
    var h = document.createElement('h2');
    h.textContent = 'החבורה מתאמנת על גואה';
    var sub = document.createElement('p');
    sub.className = 'goa-sub';
    sub.textContent = 'כולם אמיתיים, רק הרקע התחדש בניאון';
    sec.appendChild(h);
    sec.appendChild(sub);

    var grid = document.createElement('div');
    grid.className = 'goa-grid';
    PHOTOS.forEach(function (p, i) {
      var data = window[p.src];
      if (!data) return;
      var fig = document.createElement('figure');
      fig.className = 'goa-item ' + p.type + (p.hero ? ' hero' : '');
      if (p.type === 'cut' && window.GOA_BG) fig.style.backgroundImage = 'url(' + window.GOA_BG + ')';
      var img = document.createElement('img');
      img.src = data;
      img.alt = p.alt || '';
      if (!p.hero) img.loading = 'lazy';
      if (p.type === 'cut') {
        img.className = 'goa-group';
        img.style.animationDelay = (i * 0.21) + 's';
        var shadow = document.createElement('div');
        shadow.className = 'goa-shadow';
        fig.appendChild(shadow);
        var fixAspect = function () {
          if (!img.naturalWidth) return;
          var headroom = p.hero ? 1.9 : 1.35;
          fig.style.aspectRatio = ((img.naturalWidth / img.naturalHeight) / (0.94 * headroom)).toFixed(3);
        };
        img.addEventListener('load', fixAspect);
        fixAspect();
      }
      fig.appendChild(img);
      var cap = document.createElement('figcaption');
      cap.textContent = p.caption;
      fig.appendChild(cap);
      grid.appendChild(fig);
    });
    sec.appendChild(grid);

    var header = document.querySelector('header.hero');
    if (header && header.parentNode) header.parentNode.insertBefore(sec, header.nextSibling);
    else document.body.insertBefore(sec, document.body.firstChild);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
