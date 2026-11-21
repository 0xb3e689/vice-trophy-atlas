// main.js: loads data/trophies.json, owns the view and progress state, and re-renders the header, tabs and columns.
import { el, mount, GRADE_LETTER } from './dom.js';
import { loadProgress, saveProgress, exportProgress, importProgress } from './storage.js';
import { readHash, writeHash } from './hash-state.js';
import { renderFilterBar, renderChecklist } from './tracker.js';
import { renderDetail } from './render-detail.js';
import { renderSidebar } from './sidebar.js';
import { renderRoadmap } from './roadmap.js';
import { renderMissables } from './missables.js';
import { renderSources, renderAudit } from './sources-tab.js';
import { parseGuide } from './guide-parse.js';
import { loadSourceFiles, mergeSources } from './merge-sources.js';

const DEMO_EARNED = [2, 3, 8, 20, 21, 44, 16, 36];
const DEMO_COUNTS = { 16: 9, 15: 64, 17: 11, 28: 5, 31: 23, 35: 41, 18: 3 };

// trophies.json holds the official list and our guides; sources-1/2/3.json (same folder) add pages, cited facts and disputes.
const [data, sourceFiles] = await Promise.all([
  fetch('data/trophies.json').then((res) => res.json()),
  loadSourceFiles(),
]);
mergeSources(data, sourceFiles);
data.trophies.forEach((t, i) => {
  t.order = i;
  t.steps = parseGuide(t.guide);
});

let view = readHash();
let progress = loadProgress();
let persist = true;
if (view.demo) {
  persist = false;
  for (const id of DEMO_EARNED) progress.earned[id] = true;
  Object.assign(progress.counts, DEMO_COUNTS);
}
if (view.spoiler !== null) progress.spoiler = view.spoiler;
const revealOnce = new Set();

const ctx = {
  data,
  get view() { return view; },
  get progress() { return progress; },
  revealOnce,
  stageTitle: (n) => data.stages.find((s) => s.n === n)?.title ?? '',
  setView(patch, opts = {}) {
    view = { ...view, ...patch };
    writeHash(view);
    render(opts);
  },
  toggleEarned(id) {
    if (progress.earned[id]) delete progress.earned[id];
    else progress.earned[id] = true;
    commit();
  },
  setCount(id, n) {
    const trophy = data.trophies.find((t) => t.id === id);
    progress.counts[id] = Math.max(0, Math.min(trophy.count, n));
    if (progress.counts[id] >= trophy.count) progress.earned[id] = true;
    commit();
  },
  reveal(id) {
    revealOnce.add(id);
    render();
  },
};

function commit() {
  if (persist) saveProgress(progress);
  render();
}

function renderHeader() {
  const earned = data.trophies.filter((t) => progress.earned[t.id]).length;
  document.getElementById('earned').textContent = `${earned} / ${data.trophies.length}`;
  document.getElementById('earned-bar').style.width = `${(earned / data.trophies.length) * 100}%`;
  mount('grades', ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const all = data.trophies.filter((t) => t.grade === g);
    return el('span', { class: `gcount g-${g}` }, el('b', {}, GRADE_LETTER[g]), `${all.filter((t) => progress.earned[t.id]).length}/${all.length}`);
  }));
  const shield = document.getElementById('spoiler');
  shield.checked = progress.spoiler;
  shield.parentElement.classList.toggle('on', progress.spoiler);
  document.getElementById('saved-note').textContent = persist ? 'saved in this browser' : 'demo view · not saved';
  for (const tab of document.querySelectorAll('[data-tab]')) tab.classList.toggle('on', tab.dataset.tab === view.tab);
}

function render(opts = {}) {
  renderHeader();
  const selected = data.trophies.find((t) => String(t.id) === view.trophy) ?? null;
  document.body.dataset.tab = view.tab;
  if (view.tab === 'tracker') {
    mount('filters', renderFilterBar(ctx));
    mount('checklist', renderChecklist(ctx));
    mount('detail', renderDetail(selected ?? firstVisible(), ctx));
    mount('side', renderSidebar(selected ?? firstVisible(), ctx));
  } else if (view.tab === 'roadmap') mount('page', renderRoadmap(ctx));
  else if (view.tab === 'missables') mount('page', renderMissables(ctx));
  else mount('page', renderSources(ctx));
  if (opts.keepFocus) {
    const input = document.getElementById(opts.keepFocus);
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }
}

function firstVisible() {
  const row = data.trophies.find((t) => !progress.earned[t.id] && t.grade !== 'platinum');
  return row ?? data.trophies[0];
}

document.getElementById('spoiler').addEventListener('change', (event) => {
  progress.spoiler = event.target.checked;
  commit();
});
document.getElementById('export').addEventListener('click', () => exportProgress(progress, data.trophies));
document.getElementById('import').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    progress = await importProgress(file);
    persist = true;
    commit();
  } catch {
    alert('That file is not a Vice Trophy Atlas progress file.');
  }
  event.target.value = '';
});
for (const tab of document.querySelectorAll('[data-tab]')) tab.addEventListener('click', () => ctx.setView({ tab: tab.dataset.tab }));
window.addEventListener('hashchange', () => {
  view = readHash();
  render();
});

mount('audit', renderAudit(data));
render();
