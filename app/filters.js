// filters.js: the filter chips (kind, hidden, not earned, grade) and the search box, as plain predicates over a trophy.
export const KIND_CHIPS = [
  { id: 'all', label: 'All', test: () => true },
  { id: 'story', label: 'Story', test: (t) => t.kind === 'story' },
  { id: 'missable', label: 'Missable', test: (t) => t.missable },
  { id: 'collectible', label: 'Collectibles', test: (t) => t.kind === 'collectible' },
  { id: 'activity', label: 'Activities', test: (t) => t.kind === 'activity' },
  { id: 'online', label: 'Online', test: (t) => t.kind === 'online' },
  { id: 'hidden', label: 'Hidden', test: (t) => t.hidden },
  { id: 'disputed', label: 'Disputed', test: (t) => Boolean(t.differs?.length) },
  { id: 'todo', label: 'Not earned', test: (t, p) => !p.earned[t.id] },
];

export const GRADES = ['platinum', 'gold', 'silver', 'bronze'];

export function matchesView(trophy, view, progress, shown) {
  const chip = KIND_CHIPS.find((c) => c.id === view.filter) ?? KIND_CHIPS[0];
  if (!chip.test(trophy, progress)) return false;
  if (view.grade && trophy.grade !== view.grade) return false;
  const q = view.q.trim().toLowerCase();
  if (!q) return true;
  return [shown.name, shown.description, trophy.chapter, trophy.mission, trophy.kind]
    .filter(Boolean)
    .some((text) => text.toLowerCase().includes(q));
}

export function countFor(chipId, trophies, progress) {
  const chip = KIND_CHIPS.find((c) => c.id === chipId);
  return trophies.filter((t) => chip.test(t, progress)).length;
}
