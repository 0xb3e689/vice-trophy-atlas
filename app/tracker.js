// tracker.js: the left column: filter chips, grade chips, search box and the checklist grouped by roadmap stage.
import { el, gradeBadge } from './dom.js';
import { KIND_CHIPS, GRADES, matchesView, countFor } from './filters.js';
import { shownText } from './spoiler.js';

export function renderFilterBar(ctx) {
  const { data, view, progress, setView } = ctx;
  const chips = KIND_CHIPS.map((chip) =>
    el('button', {
      type: 'button',
      class: `chip${view.filter === chip.id ? ' on' : ''}`,
      onclick: () => setView({ filter: chip.id }),
    }, chip.label, el('b', {}, countFor(chip.id, data.trophies, progress))),
  );
  const grades = GRADES.map((grade) =>
    el('button', {
      type: 'button',
      class: `chip grade-chip${view.grade === grade ? ' on' : ''}`,
      title: `Only ${grade}`,
      onclick: () => setView({ grade: view.grade === grade ? '' : grade }),
    }, gradeBadge(grade), data.trophies.filter((t) => t.grade === grade).length),
  );
  const search = el('input', {
    type: 'search',
    id: 'search',
    placeholder: 'Search name, mission, chapter…',
    value: view.q,
    oninput: (event) => setView({ q: event.target.value }, { keepFocus: 'search' }),
  });
  return el('div', { class: 'filters' }, el('div', { class: 'chips' }, chips), el('div', { class: 'chips' }, grades, search));
}

export function renderChecklist(ctx) {
  const { data, view, progress, setView, toggleEarned } = ctx;
  const groups = data.stages.map((stage) => {
    const rows = data.trophies
      .filter((t) => t.stage === stage.n)
      .filter((t) => matchesView(t, view, progress, shownText(t, progress)))
      .map((t) => checklistRow(t, ctx));
    if (!rows.length) return null;
    const done = data.trophies.filter((t) => t.stage === stage.n && progress.earned[t.id]).length;
    const total = data.trophies.filter((t) => t.stage === stage.n).length;
    return el('section', { class: 'stage-group' },
      el('h3', {}, el('span', { class: 'stage-n' }, stage.n), stage.title, el('small', {}, `${done}/${total}`)),
      rows);
  }).filter(Boolean);
  return groups.length ? groups : [el('p', { class: 'empty' }, 'No trophy matches these filters.')];

  function checklistRow(t) {
    const shown = shownText(t, progress);
    const earned = Boolean(progress.earned[t.id]);
    return el('div', {
      class: `row${earned ? ' earned' : ''}${String(t.id) === view.trophy ? ' sel' : ''}${shown.masked ? ' masked' : ''}`,
      onclick: () => setView({ trophy: String(t.id) }),
    },
    el('input', {
      type: 'checkbox',
      checked: earned,
      'aria-label': `Earned: ${shown.name}`,
      onclick: (event) => event.stopPropagation(),
      onchange: () => toggleEarned(t.id),
    }),
    gradeBadge(t.grade),
    el('span', { class: 'row-text' },
      el('span', { class: 'row-name' }, shown.name),
      el('span', { class: 'row-desc' }, shown.description)),
    t.missable ? el('span', { class: 'flag miss', title: t.missableReason }, '!') : null,
    t.differs?.length ? el('span', { class: 'flag dis', title: 'Sources differ' }, '≠') : null,
    t.count ? el('span', { class: 'flag cnt' }, `${progress.counts[t.id] ?? 0}/${t.count}`) : null);
  }
}
