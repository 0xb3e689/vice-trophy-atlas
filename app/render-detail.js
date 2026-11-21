// render-detail.js: the middle column: one trophy's official text and grade, missable warning, count stepper,
// numbered own-words steps with their citation chips, and the numbered sources those chips point at.
import { el, gradeBadge } from './dom.js';
import { shownText, isShielded } from './spoiler.js';

export function renderDetail(trophy, ctx) {
  const { progress, toggleEarned, setCount, stageTitle, revealOnce } = ctx;
  if (!trophy) return el('p', { class: 'empty' }, 'Pick a trophy from the checklist.');
  const shown = shownText(trophy, progress);
  const shielded = isShielded(trophy, progress) && !revealOnce.has(trophy.id);
  const earned = Boolean(progress.earned[trophy.id]);

  return el('article', { class: 'detail' },
    el('header', { class: 'detail-head' },
      gradeBadge(trophy.grade),
      el('div', {},
        el('h2', {}, shown.name),
        el('p', { class: 'official' }, el('span', { class: 'tag' }, 'Official'), shown.description)),
      el('label', { class: `earn-toggle${earned ? ' on' : ''}` },
        el('input', { type: 'checkbox', checked: earned, onchange: () => toggleEarned(trophy.id) }),
        earned ? 'Earned' : 'Mark earned')),
    el('div', { class: 'facts' },
      fact('Grade', trophy.grade),
      fact('Kind', trophy.kind),
      fact('Stage', `${trophy.stage} · ${stageTitle(trophy.stage)}`),
      trophy.chapter ? fact('Chapter', trophy.chapter) : null,
      trophy.mission ? fact('Mission', trophy.mission) : null,
      fact('PSN', trophy.hidden ? 'hidden until earned' : 'visible')),
    trophy.missable
      ? el('div', { class: 'warn' }, el('strong', {}, 'Missable / at risk: '), trophy.missableReason)
      : el('div', { class: 'ok' }, 'Not missable: ', trophy.missableReason || 'can be finished in free roam after the story.'),
    trophy.count ? countStepper(trophy, progress, setCount) : null,
    shielded
      ? el('div', { class: 'shield' }, 'Guide hidden by the spoiler shield. ',
        el('button', { type: 'button', onclick: () => ctx.reveal(trophy.id) }, 'Reveal this guide'))
      : el('div', {},
        el('h3', {}, 'Guide (our words)'),
        el('ol', { class: 'steps' }, trophy.steps.map((step) =>
          el('li', {}, step.text, ' ', step.cites.map((n) => citeChip(n, trophy)),
            siteCount(step, trophy) > 1 ? el('span', { class: 'multi' }, `${siteCount(step, trophy)} sites`) : null))),
        trophy.differs?.length ? differsBox(trophy) : null,
        trophy.notes?.length ? citedFacts(trophy) : null));
}

// "Cited facts": extra one-line facts from the research files, each with chips for the pages that back it.
function citedFacts(trophy) {
  return el('section', { class: 'cited-facts' },
    el('h3', {}, `Cited facts (${trophy.notes.length})`),
    el('ul', { class: 'facts-list' }, trophy.notes.map((note) =>
      el('li', {}, note.text, ' ', note.cites.map((n) => citeChip(n, trophy)),
        siteCount(note, trophy) > 1 ? el('span', { class: 'multi' }, `${siteCount(note, trophy)} sites`) : null))));
}

function fact(label, value) {
  return el('span', { class: 'fact' }, el('em', {}, label), value);
}

function countStepper(trophy, progress, setCount) {
  const n = progress.counts[trophy.id] ?? 0;
  const pct = Math.min(100, Math.round((n / trophy.count) * 100));
  return el('div', { class: 'stepper' },
    el('span', { class: 'stepper-label' }, trophy.countLabel ?? 'Progress'),
    el('button', { type: 'button', onclick: () => setCount(trophy.id, n - 1), 'aria-label': 'minus one' }, '−'),
    el('output', {}, `${n} / ${trophy.count}`),
    el('button', { type: 'button', onclick: () => setCount(trophy.id, n + 1), 'aria-label': 'plus one' }, '+'),
    el('span', { class: 'bar' }, el('i', { style: `width:${pct}%` })));
}

// A step's distinct sites: the claim counts as cross-checked when two or more different sites back it.
export function siteCount(step, trophy) {
  return new Set(step.cites.map((n) => siteOf(trophy.sources[n - 1]))).size;
}

export function siteOf(source) {
  return source ? source.site ?? new URL(source.url).hostname : '?';
}

export function citeChip(n, trophy) {
  const source = trophy.sources[n - 1];
  const title = source ? `${source.name} · read ${source.read ?? '—'}` : '';
  return el('a', { class: 'cite', href: source?.url ?? '#', title, target: '_blank', rel: 'noopener' },
    el('b', {}, n), siteOf(source));
}

// "Sources differ": where named pages disagree (a count, whether it can be missed), show each version, who says it, and our call.
function differsBox(trophy) {
  return el('section', { class: 'differs' },
    el('h4', {}, `Sources differ (${trophy.differs.length})`),
    trophy.differs.map((d) => el('div', { class: 'differ' },
      el('p', { class: 'differ-topic' }, d.topic),
      el('ul', {}, d.versions.map((v) => el('li', {}, v.says, ' ', v.cites.map((n) => citeChip(n, trophy))))),
      el('p', { class: 'call' }, el('strong', {}, 'Our call: '), d.call))));
}

export function sourceList(sources) {
  return el('ol', { class: 'sources' }, sources.map((s) =>
    el('li', {}, el('a', { href: s.url, target: '_blank', rel: 'noopener' }, s.name),
      el('small', {}, el('b', {}, siteOf(s)), ` · read ${s.read ?? '—'} · ${new URL(s.url).hostname}`))));
}
