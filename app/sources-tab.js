// sources-tab.js: the Sources tab and the audit strip: which sites the guides cite, and how often.
import { el } from './dom.js';

export function auditNumbers(data) {
  const claims = data.trophies.reduce((sum, t) => sum + t.steps.reduce((s, step) => s + step.cites.length, 0), 0);
  const cited = data.trophies.filter((t) => t.steps.length && t.steps.every((s) => s.cites.length)).length;
  const sites = new Set(data.trophies.flatMap((t) => t.sources.map((s) => new URL(s.url).hostname)));
  return { official: data.trophies.length, claims, cited, sites: sites.size };
}

export function renderAudit(data) {
  const a = auditNumbers(data);
  return [
    el('span', {}, el('b', {}, `${a.official}/55`), ' official list'),
    el('span', {}, el('b', {}, a.claims), ' cited claims'),
    el('span', {}, el('b', {}, `${a.cited}/55`), ' guides cite every step'),
    el('span', {}, el('b', {}, a.sites), ' sites'),
    el('span', {}, el('b', {}, data.trophies.filter((t) => t.missable || t.atRisk).length), ' missable / at risk'),
    el('span', { class: 'audit-note' }, 'Names, descriptions and grades as PlayStation lists them; guides in our own words.'),
  ];
}

export function renderSources(ctx) {
  const { data, setView } = ctx;
  return el('div', { class: 'sources-tab' }, data.sourceIndex.map((source) => {
    const users = data.trophies.filter((t) => t.sources.some((s) => s.url === source.url));
    return el('section', { class: 'src-card' },
      el('h3', {}, el('a', { href: source.url, target: '_blank', rel: 'noopener' }, source.name)),
      el('p', { class: 'src-url' }, source.url),
      el('p', {}, source.used),
      el('p', { class: 'src-users' }, `Cited by ${users.length} guides: `,
        users.slice(0, 14).map((t) => el('button', { type: 'button', class: 'mini', onclick: () => setView({ tab: 'tracker', trophy: String(t.id) }) }, `#${t.id}`)),
        users.length > 14 ? ` +${users.length - 14}` : ''));
  }));
}
