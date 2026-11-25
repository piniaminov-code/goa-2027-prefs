/* Goa 2027 offline support and app shell.
   Handled: same-origin GET requests for the static shell only (plan pages, the main page and its small
   scripts, Mia's self-contained game, the manifest and icons). Everything else goes straight to the network:
   big media chunks, the gallery, Supabase (questionnaires), the chat bot, maps, fonts.
   - HTML and unversioned files: network first (fresh whenever online), saved copy after 4 s or when offline.
   - Versioned files (?v=...): cache first for that exact version; a new ?v= fetches the new file.
   - Nothing a person types is stored here: questionnaire answers are POSTed and never cached; the packing
     ticks live in localStorage. Bump CACHE when the shell list changes; old caches are deleted on activate. */
var CACHE = 'goa-shell-v3';
var PRECACHE = [
  'index.html', 'route.html', 'pack.html', 'mia.html',
  'plan.css?v=1', 'plan.js?v=1', 'route.js?v=1', 'pack.js?v=1', 'trip-data.js?v=1',
  'pwa.css?v=1', 'pwa.js?v=1', 'manifest.webmanifest', 'favicon.ico',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png',
  'personal-questions.js', 'chat.js', 'music.js'
];
var HANDLED = /\/(?:index\.html|route\.html|pack\.html|mia\.html|plan\.css|plan\.js|route\.js|pack\.js|trip-data\.js|pwa\.css|pwa\.js|manifest\.webmanifest|favicon\.ico|icons\/[\w-]+\.png|personal-questions\.js|chat\.js|music\.js)?$/;

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(PRECACHE.map(function (u) { return c.add(u).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return /^goa-(plan|shell)-/.test(k) && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

function fromCache(req) {
  return caches.match(req, { ignoreSearch: true }).then(function (r) {
    if (r || !/\/$/.test(new URL(req.url).pathname)) return r;
    return caches.match('index.html', { ignoreSearch: true }); // the site root is the main page
  });
}
function save(req, res) { if (res && res.ok && res.type === 'basic') { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); } return res; }

function networkFirst(req) {
  return new Promise(function (resolve) {
    var settled = false;
    function done(r) { if (!settled && r) { settled = true; resolve(r); } }
    var t = setTimeout(function () { fromCache(req).then(done); }, 4000); // slow mobile data
    fetch(req).then(function (res) { clearTimeout(t); done(save(req, res)); })
      .catch(function () { clearTimeout(t); fromCache(req).then(function (r) { done(r || Response.error()); }); });
  });
}
function cacheFirst(req) {
  return caches.match(req).then(function (hit) {
    if (hit) return hit;
    return fetch(req).then(function (res) { return save(req, res); })
      .catch(function () { return fromCache(req).then(function (r) { return r || Response.error(); }); });
  });
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin || !HANDLED.test(url.pathname)) return;
  var html = req.mode === 'navigate' || /\.html$|\/$/.test(url.pathname);
  e.respondWith(!html && /[?&]v=/.test(url.search) ? cacheFirst(req) : networkFirst(req));
});
