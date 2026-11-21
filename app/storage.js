// storage.js: progress (earned trophies, count values, spoiler setting) in localStorage, plus .json export and import.
const KEY = 'vice-trophy-atlas/progress/v1';

export function emptyProgress() {
  return { earned: {}, counts: {}, spoiler: true };
}

export function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    return normaliseProgress(saved);
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // Private mode or a full quota: progress stays in memory for this visit.
  }
}

export function normaliseProgress(raw) {
  const progress = emptyProgress();
  if (!raw || typeof raw !== 'object') return progress;
  for (const [id, on] of Object.entries(raw.earned ?? {})) if (on === true) progress.earned[id] = true;
  for (const [id, n] of Object.entries(raw.counts ?? {})) if (Number.isFinite(n) && n > 0) progress.counts[id] = Math.floor(n);
  if (raw.spoiler === false) progress.spoiler = false;
  return progress;
}

export function exportProgress(progress, trophies) {
  const file = {
    format: 'vice-trophy-atlas/v1',
    earnedNames: trophies.filter((t) => progress.earned[t.id]).map((t) => t.name),
    ...progress,
  };
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' });
  const link = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: 'vice-trophy-atlas-progress.json',
  });
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

export async function importProgress(file) {
  const text = await file.text();
  return normaliseProgress(JSON.parse(text));
}
