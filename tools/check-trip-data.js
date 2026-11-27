#!/usr/bin/env node
/* Grounding check for trip-data.js: every fact the plan pages show must already be on the site (index.html).
   Run from the repo root:  node tools/check-trip-data.js
   No dependencies. Exits with code 1 and a list of problems if something in trip-data.js is not found in index.html. */
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8').replace(/&amp;/g, '&');
global.window = {};
require(path.join(root, 'trip-data.js'));
const G = window.GOA_TRIP;
const problems = [];
let checks = 0;
function need(cond, msg) { checks++; if (!cond) problems.push(msg); }

// 1. coordinates come from the site's Google Maps links
for (const [k, p] of Object.entries(G.P)) {
  if (p.ll) need(html.includes(p.ll[0] + ',' + p.ll[1]), `place ${k}: coordinates ${p.ll} not in index.html`);
  if (p.u) need(html.includes(p.u), `place ${k}: link ${p.u} not in index.html`);
  if (p.ll && p.base) problems.push(`place ${k}: a base (hotel not chosen) must not have coordinates`);
}
// 2. flights: code, local departure and arrival times
for (const f of G.FLIGHTS) {
  need(html.includes(f.code), `flight ${f.code} not in index.html`);
  for (const t of [f.dep, f.arr]) { const hm = t.split('·')[1].trim(); need(html.includes(hm), `flight ${f.code}: time ${hm} not in index.html`); }
}
// 3. checked travel times: the number of minutes / hours must be on the site
for (const [k, v] of Object.entries(G.KNOWN)) {
  const n = (v.t.match(/\d+(?::\d+)?/) || [])[0];
  need(n && (html.includes('כ-' + n) || html.includes('כ־' + n) || html.includes(n + ' דקות') || html.includes(' ' + n + ' ')), `known time ${k} (${v.t}) not in index.html`);
}
// 4. deadlines: day and month must appear on the site (approximate ones are described there in words)
for (const d of G.DEADLINES) {
  if (d.approx) continue;
  const [y, m, day] = d.date.split('-').map(Number);
  const forms = [`${day}.${m}.${y}`, `${day}.${m}.${String(y).slice(2)}`, `${day}.${m}`];
  need(forms.some(f => html.includes(f)), `deadline ${d.date} (${d.t}) not in index.html`);
}
// 5. the plan never shows prices: no currency signs in any text
const text = JSON.stringify([G.DAYS, G.RAIN, G.RAIN_RULES, G.DEADLINES, G.PACK, G.BRING]);
need(!/[₹₪$]|\bUSD\b|\bINR\b/.test(text), 'a price-like value appears in trip-data.js');
// 6. internal consistency: every stop, rain item and packing reminder points to something that exists
const packIds = new Set(G.PACK.flatMap(g => g.items.map(i => i[0])));
for (const day of G.DAYS) {
  for (const s of day.stops) need(G.P[s[0]], `day ${day.d}: unknown place ${s[0]}`);
  for (const b of day.bring || []) need(G.BRING[b] && packIds.has(b), `day ${day.d}: unknown packing item ${b}`);
  need(G.STAGE[day.stage], `day ${day.d}: unknown stage ${day.stage}`);
}
for (const a of G.RAIN) for (const it of a.items) { if (it.p) need(G.P[it.p], `rain: unknown place ${it.p}`); if (it.k) need(G.KNOWN[it.k], `rain: unknown known-time ${it.k}`); }
need(G.DAYS.map(d => d.d).join() === Array.from({ length: 17 }, (_, i) => i + 12).join(), 'days are not exactly 12..28 April');

if (problems.length) { console.error(`✗ ${problems.length} problem(s) in ${checks} checks:\n- ` + problems.join('\n- ')); process.exit(1); }
console.log(`✓ trip-data.js: all ${checks} checks passed (every coordinate, link, flight, travel time and dated deadline is on the site).`);
