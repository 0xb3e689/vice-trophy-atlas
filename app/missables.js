// missables.js: the Missables tab: every missable or at-risk trophy with the point it must be done before.
import { el, gradeBadge } from './dom.js';
import { shownText } from './spoiler.js';
import { citeChip } from './render-detail.js';

export function renderMissables(ctx) {
  const { data, progress, setView } = ctx;
  const risky = data.trophies.filter((t) => t.missable || t.atRisk);
  return el('div', { class: 'missables' },
    el('p', { class: 'lede' }, `${risky.filter((t) => t.missable).length} missable and ${risky.filter((t) => !t.missable).length} at-risk trophies. No mission replay after the credits, so keep a manual save before each "before" point.`),
    el('table', {},
      el('thead', {}, el('tr', {}, ['', 'Trophy', 'Status', 'Do it before', 'Why', 'Src'].map((h) => el('th', {}, h)))),
      el('tbody', {}, risky.map((t) => {
        const shown = shownText(t, progress);
        return el('tr', { class: progress.earned[t.id] ? 'earned' : '', onclick: () => setView({ tab: 'tracker', trophy: String(t.id) }) },
          el('td', {}, gradeBadge(t.grade)),
          el('td', {}, el('b', {}, shown.name), el('br'), el('small', {}, shown.description)),
          el('td', {}, el('span', { class: t.missable ? 'pill miss' : 'pill risk' }, t.missable ? 'missable' : 'at risk')),
          el('td', {}, t.missBefore ?? '—'),
          el('td', {}, t.missableReason),
          el('td', {}, t.missCites?.map((n) => citeChip(n, t))));
      }))),
    el('p', { class: 'safe-note' },
      `The other ${data.trophies.length - risky.length} trophies stay open in free roam after the credits; story trophies cannot be missed. `,
      data.sourceIndex.slice(0, 3).map((s) => el('a', { class: 'cite', href: s.url, target: '_blank', rel: 'noopener' }, s.short))),
    el('h3', { class: 'save-head' }, 'Save points worth keeping'),
    el('ol', { class: 'save-points' },
      el('li', {}, 'Late Chapter 1, before it ends: protects the first meditation.'),
      el('li', {}, 'Start and end of every chapter, using the 15 manual slots.'),
      el('li', {}, 'Just before the final mission: missions cannot be replayed after it.')));
}
