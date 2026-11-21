// roadmap.js: the Roadmap tab: the stages to the platinum in order, each with its advice and its trophies.
import { el, gradeBadge } from './dom.js';
import { shownText } from './spoiler.js';

export function renderRoadmap(ctx) {
  const { data, progress, setView } = ctx;
  return el('div', { class: 'roadmap' }, data.stages.map((stage) => {
    const items = data.trophies.filter((t) => t.stage === stage.n).sort((a, b) => a.order - b.order);
    const done = items.filter((t) => progress.earned[t.id]).length;
    return el('section', { class: 'road-stage' },
      el('header', {},
        el('span', { class: 'stage-n big' }, stage.n),
        el('div', {}, el('h3', {}, stage.title), el('p', {}, stage.summary, ' ', stage.cites.map((n) => el('a', { class: 'cite', href: data.sourceIndex[n - 1].url, target: '_blank', rel: 'noopener' }, data.sourceIndex[n - 1].short)))),
        el('span', { class: 'road-count' }, `${done}/${items.length}`)),
      el('ul', { class: items.length > 7 ? 'two-col' : '' }, items.map((t) => {
        const shown = shownText(t, progress);
        return el('li', { class: progress.earned[t.id] ? 'earned' : '', onclick: () => setView({ tab: 'tracker', trophy: String(t.id) }) },
          gradeBadge(t.grade), shown.name,
          t.mission && !shown.masked ? el('small', {}, t.mission) : t.chapter ? el('small', {}, t.chapter) : null,
          t.missable ? el('span', { class: 'flag miss' }, '!') : null);
      })));
  }));
}
