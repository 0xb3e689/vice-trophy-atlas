// sidebar.js: the right column: the next unearned trophies in roadmap order, and the sources of the open guide.
import { el, gradeBadge } from './dom.js';
import { shownText } from './spoiler.js';
import { sourceList } from './render-detail.js';

export function nextUp(trophies, progress, limit = 8) {
  return trophies
    .filter((t) => !progress.earned[t.id] && t.grade !== 'platinum')
    .sort((a, b) => a.stage - b.stage || a.order - b.order)
    .slice(0, limit);
}

export function renderSidebar(selected, ctx) {
  const { data, progress, setView } = ctx;
  const upcoming = nextUp(data.trophies, progress).map((t) => {
    const shown = shownText(t, progress);
    return el('li', { onclick: () => setView({ trophy: String(t.id) }) },
      el('span', { class: 'stage-n' }, t.stage), gradeBadge(t.grade), el('span', {}, shown.name),
      t.missable ? el('span', { class: 'flag miss' }, '!') : null);
  });
  return [
    el('section', { class: 'side-box' }, el('h3', {}, 'Next up in roadmap order'), el('ol', { class: 'next' }, upcoming)),
    el('section', { class: 'side-box' },
      el('h3', {}, 'Sources for this guide'),
      selected ? sourceList(selected.sources) : el('p', {}, '—'),
      el('p', { class: 'note' }, 'Every step cites the page it came from; links open only when you click them.')),
  ];
}
