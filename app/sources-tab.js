// sources-tab.js: the Sources tab and the audit strip: which sites the guides cite, and how often.
import { el } from './dom.js';
import { siteCount, siteOf } from './render-detail.js';

// Every guide step is one claim: cited when it names at least one page, cross-checked when two or more sites back it.
export function auditNumbers(data) {
  const steps = data.trophies.flatMap((t) => t.steps.map((step) => ({ step, t })));
  const cited = steps.filter(({ step }) => step.cites.length).length;
  const multi = steps.filter(({ step, t }) => siteCount(step, t) >= 2).length;
  const all = data.trophies.flatMap((t) => t.sources);
  const pages = new Set(all.map((s) => s.url)).size;
  const sites = new Set(all.map(siteOf)).size;
  const disputes = data.trophies.reduce((n, t) => n + (t.differs?.length ?? 0), 0);
  const official = data.trophies.filter((t) => t.name && t.description && t.grade).length;
  return { official, claims: steps.length, cited, multi, pages, sites, disputes };
}

export function renderAudit(data) {
  const a = auditNumbers(data);
  return [
    el('span', {}, el('b', {}, `${a.official}/55`), ' official'),
    el('span', {}, el('b', {}, `${a.cited}/${a.claims}`), ' claims cited'),
    el('span', {}, el('b', {}, a.multi), ' on 2+ sites'),
    el('span', {}, el('b', {}, a.pages), ` pages from `, el('b', {}, a.sites), ' sites'),
    el('span', {}, el('b', {}, a.disputes), ' disputes shown'),
    el('span', {}, el('b', {}, data.trophies.filter((t) => t.missable || t.atRisk).length), ' missable'),
    el('span', { class: 'audit-note' }, 'read 2026-11-21 · official names · our own words'),
  ];
}

export function renderSources(ctx) {
  const { data, setView } = ctx;
  return el('div', { class: 'sources-tab' }, data.sourceIndex.map((source) => {
    const users = data.trophies.filter((t) => t.sources.some((s) => s.url === source.url));
    return el('section', { class: 'src-card' },
      el('h3', {}, el('a', { href: source.url, target: '_blank', rel: 'noopener' }, source.name)),
      el('p', { class: 'src-url' }, `${source.short} · read ${source.read ?? '—'} · ${source.url}`),
      el('p', {}, source.used),
      el('p', { class: 'src-users' }, `Cited by ${users.length} guides: `,
        users.slice(0, 14).map((t) => el('button', { type: 'button', class: 'mini', onclick: () => setView({ tab: 'tracker', trophy: String(t.id) }) }, `#${t.id}`)),
        users.length > 14 ? ` +${users.length - 14}` : ''));
  }));
}
