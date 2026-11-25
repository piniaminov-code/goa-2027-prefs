/* Goa 2027 offline support.
   - Only same-origin GET requests for the plan pages and the main page's small files are handled.
   - Network first (fresh content whenever online), with a short timeout, then the saved copy.
   - Everything else (big media chunks, the gallery, Supabase, the chat bot, maps) is left to the network. */
var CACHE = 'goa-plan-v2';
var PRECACHE = ['route.html', 'pack.html', 'plan.css?v=1', 'plan.js?v=1', 'route.js?v=1', 'pack.js?v=1', 'trip-data.js?v=1',
  'index.html', 'personal-questions.js', 'chat.js', 'music.js'];
var HANDLED = /\/(?:index\.html|route\.html|pack\.html|plan\.css|plan\.js|route\.js|pack\.js|trip-data\.js|personal-questions\.js|chat\.js|music\.js)?$/;

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(PRECACHE.map(function (u) { return c.add(u).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('goa-plan-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

function fromCache(req) {
  return caches.match(req, { ignoreSearch: true }).then(function (r) {
    // the site root is the main page
    if (r || !/\/$/.test(new URL(req.url).pathname)) return r;
    return caches.match('index.html', { ignoreSearch: true });
  });
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin || !HANDLED.test(url.pathname)) return;
  e.respondWith(new Promise(function (resolve) {
    var settled = false;
    function done(r) { if (!settled && r) { settled = true; resolve(r); } }
    // slow mobile data: after 4 s, answer from the saved copy if there is one (the network reply still refreshes the cache)
    var t = setTimeout(function () { fromCache(req).then(done); }, 4000);
    fetch(req).then(function (res) {
      clearTimeout(t);
      if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
      done(res);
    }).catch(function () {
      clearTimeout(t);
      fromCache(req).then(function (r) { if (r) done(r); else done(Response.error()); });
    });
  }));
});
