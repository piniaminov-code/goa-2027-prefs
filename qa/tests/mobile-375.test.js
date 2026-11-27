#!/usr/bin/env node
// Mobile regression checks at 375x667 (portrait) and 667x375 (landscape).
// No dependencies beyond Playwright (already installed in the QA environment); serves the repo itself.
// Run from the repo root:  node qa/tests/mobile-375.test.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});

let fails = 0, passes = 0;
function check(name, ok, detail) {
  if (ok) passes++; else fails++;
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  ' + JSON.stringify(detail) : ''));
}
const PORTRAIT = { width: 375, height: 667 }, LANDSCAPE = { width: 667, height: 375 };
const ctxOpts = vp => ({ viewport: vp, isMobile: true, hasTouch: true, reducedMotion: 'reduce', serviceWorkers: 'block' });

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const U = 'http://127.0.0.1:' + server.address().port + '/';
  const b = await chromium.launch();
  try {
    // 1. no horizontal scroll, no page errors, on every page, both orientations
    for (const vp of [PORTRAIT, LANDSCAPE]) {
      for (const p of ['index.html', 'route.html', 'pack.html', 'kids.html', 'mia.html', 'gallery.html']) {
        const ctx = await b.newContext(ctxOpts(vp)); const pg = await ctx.newPage();
        await ctx.route(/supabase\.co|youtube|googleapis|gstatic/, r => r.abort());
        const errs = []; pg.on('pageerror', e => errs.push(e.message));
        await pg.goto(U + p, { waitUntil: 'load', timeout: 90000 }); await pg.waitForTimeout(500);
        const sw = await pg.evaluate(() => document.documentElement.scrollWidth);
        check(`${p} ${vp.width}x${vp.height}: no horizontal scroll`, sw <= vp.width, sw);
        check(`${p} ${vp.width}x${vp.height}: no page errors`, errs.length === 0, errs);
        await ctx.close();
      }
    }

    // 2. chat panel: compact input on the home page (global textarea rule must not leak in),
    //    44px close button, solid panel, and readable message area in landscape
    for (const vp of [PORTRAIT, LANDSCAPE]) {
      const tag = vp.width + 'x' + vp.height;
      const ctx = await b.newContext(ctxOpts(vp)); const pg = await ctx.newPage();
      await pg.goto(U + 'index.html', { waitUntil: 'load', timeout: 90000 });
      await pg.click('#goa-enter', { force: true }); await pg.waitForTimeout(400);
      await pg.click('#goa-chat-btn'); await pg.waitForTimeout(300);
      const m = await pg.evaluate(() => {
        const box = id => document.getElementById(id).getBoundingClientRect();
        const p = box('goa-chat-panel');
        return { input: Math.round(box('goa-chat-input').height), close: [Math.round(box('goa-chat-close').width), Math.round(box('goa-chat-close').height)],
          msgs: Math.round(box('goa-chat-msgs').height), top: Math.round(p.top), bottom: Math.round(p.bottom), vh: innerHeight,
          bg: getComputedStyle(document.getElementById('goa-chat-panel')).backgroundColor,
          firstMsgVisible: (() => { const f = document.querySelector('#goa-chat-msgs .gcb-msg'); if (!f) return false; const r = f.getBoundingClientRect(), c = box('goa-chat-msgs'); return r.top >= c.top - 1 && r.top < c.bottom - 16; })() };
      });
      check(`chat ${tag}: input is one line (<= 48px)`, m.input <= 48, m.input);
      check(`chat ${tag}: close button >= 44x44`, m.close[0] >= 44 && m.close[1] >= 44, m.close);
      check(`chat ${tag}: panel inside viewport`, m.top >= 0 && m.bottom <= m.vh, [m.top, m.bottom, m.vh]);
      check(`chat ${tag}: message area >= 120px`, m.msgs >= 120, m.msgs);
      check(`chat ${tag}: greeting visible`, m.firstMsgVisible);
      check(`chat ${tag}: panel background opaque`, /^rgb\(/.test(m.bg), m.bg);
      // Esc closes, focus returns to the button
      await pg.keyboard.press('Escape'); await pg.waitForTimeout(100);
      check(`chat ${tag}: Esc closes and returns focus`, await pg.evaluate(() => !document.getElementById('goa-chat-panel').classList.contains('open') && document.activeElement.id === 'goa-chat-btn'));
      await ctx.close();
    }

    // 3. kids page back link: tap target at least 44px tall without moving the layout
    {
      const ctx = await b.newContext(ctxOpts(PORTRAIT)); const pg = await ctx.newPage();
      await pg.goto(U + 'kids.html', { waitUntil: 'load', timeout: 90000 }); await pg.waitForTimeout(400);
      const r = await pg.evaluate(() => { const a = document.querySelector('a.back').getBoundingClientRect(); return [Math.round(a.width), Math.round(a.height)]; });
      check('kids.html: back link target >= 44px tall', r[1] >= 44, r);
      await ctx.close();
    }
  } finally {
    await b.close(); server.close();
  }
  console.log(`\n${passes} passed, ${fails} failed`);
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); server.close(); process.exit(2); });
