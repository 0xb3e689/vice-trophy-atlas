// Merges research notes (/tmp/vta-research-{A,B,C}.json: pages opened, which steps they back, where they disagree)
// into app/data/trophies.json. Run from the repo root: node tools/merge-sources.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const READ = '2026-11-21';
const file = 'app/data/trophies.json';
const data = JSON.parse(readFileSync(file, 'utf8'));
const SITE = { 'www.powerpyx.com': 'PowerPyx', 'www.gtabase.com': 'GTABase', 'www.gamerfuzion.com': 'Gamerfuzion' };
const siteFor = (url) => SITE[new URL(url).hostname] ?? new URL(url).hostname.replace(/^www\./, '');
for (const s of data.sourceIndex) { s.site = s.site ?? siteFor(s.url); s.read = READ; }
for (const t of data.trophies) for (const s of t.sources) { s.site = s.site ?? siteFor(s.url); s.read = READ; }

const parse = (guide) => guide.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => ({
  text: l.replace(/^\d+\.\s*/, '').replace(/\s*\[\d+\]/g, '').trim(),
  cites: [...l.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1])),
}));
const steps = new Map(data.trophies.map((t) => [t.id, parse(t.guide)]));
const byId = new Map(data.trophies.map((t) => [t.id, t]));
const idx = (t, p) => {
  let i = t.sources.findIndex((s) => s.url === p.url);
  if (i < 0) { t.sources.push({ name: p.name, site: p.site, url: p.url, read: READ }); i = t.sources.length - 1; }
  return i + 1;
};
let added = 0, skipped = 0;
const HOSTS = {};
for (const tag of ['A', 'B', 'C']) {
  const f = `/tmp/vta-research-${tag}.json`;
  if (!existsSync(f)) { console.log('missing', f); continue; }
  let r;
  try { r = JSON.parse(readFileSync(f, 'utf8')); } catch (e) { console.log('bad json', f, e.message); continue; }
  const pages = new Map((r.pages ?? []).filter((p) => /^https:\/\//.test(p.url ?? '')).map((p) => [p.key, p]));
  for (const p of pages.values()) { const h = new URL(p.url).hostname; p.site = HOSTS[h] ??= SITE[h] ?? p.site; }
  for (const b of r.backs ?? []) {
    const t = byId.get(b.trophy); const st = steps.get(b.trophy)?.[b.step - 1];
    if (!t || !st) { skipped++; continue; }
    for (const k of b.pages ?? []) {
      const p = pages.get(k); if (!p) { skipped++; continue; }
      const n = idx(t, p); if (!st.cites.includes(n)) { st.cites.push(n); added++; }
    }
  }
  for (const d of r.differs ?? []) {
    const t = byId.get(d.trophy); if (!t || !d.versions?.length || !d.call) { skipped++; continue; }
    const versions = d.versions.map((v) => ({
      says: v.says,
      cites: [...new Set([...(v.existing ?? []).filter((n) => n >= 1 && n <= t.sources.length),
        ...(v.pages ?? []).map((k) => pages.get(k)).filter(Boolean).map((p) => idx(t, p))])],
    })).filter((v) => v.cites.length);
    if (versions.length < 2) { skipped++; continue; }
    (t.differs ??= []).push({ topic: d.topic, versions, call: d.call });
  }
  for (const p of pages.values()) {
    if (data.sourceIndex.some((s) => s.url === p.url)) continue;
    const users = data.trophies.filter((t) => t.sources.some((s) => s.url === p.url));
    if (!users.length) continue;
    data.sourceIndex.push({ name: p.name, url: p.url, short: p.site, site: p.site, read: READ, used: `Cross-checks steps in ${users.length} guide${users.length > 1 ? 's' : ''}.` });
  }
}
for (const t of data.trophies) {
  t.guide = steps.get(t.id).map((s, i) => `${i + 1}. ${s.text} ${[...s.cites].sort((a, b) => a - b).map((n) => `[${n}]`).join('')}`.trim()).join('\n');
}
writeFileSync(file, JSON.stringify(data, null, 1) + '\n');
const all = data.trophies.flatMap((t) => t.sources);
const per = [...steps.entries()].flatMap(([id, ss]) => ss.map((s) => new Set(s.cites.map((n) => byId.get(id).sources[n - 1].site)).size));
console.log({ added, skipped, claims: per.length, multi: per.filter((n) => n >= 2).length, pages: new Set(all.map((s) => s.url)).size,
  sites: [...new Set(all.map((s) => s.site))], disputes: data.trophies.reduce((n, t) => n + (t.differs?.length ?? 0), 0) });
