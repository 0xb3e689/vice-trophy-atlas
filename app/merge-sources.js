// merge-sources.js: folds the three research files (data/sources-1/2/3.json) into the trophies by id.
// Each file lists, per trophy, the pages read, cited facts in our own words, and where the pages disagree.
// Cites in those files are 0-based into the file's own source list; here they become 1-based into trophy.sources,
// the same numbering the guide steps use, so every chip in the detail view points at one merged list.

export const SOURCE_FILES = ['data/sources-1.json', 'data/sources-2.json', 'data/sources-3.json'];

export async function loadSourceFiles(fetcher = fetch) {
  const files = await Promise.all(SOURCE_FILES.map(async (path) => {
    try {
      const res = await fetcher(path);
      return res.ok ? await res.json() : null;
    } catch {
      return null;
    }
  }));
  return files.filter(Boolean);
}

export function mergeSources(data, files) {
  const byId = new Map(data.trophies.map((t) => [t.id, t]));
  const index = new Map(data.sourceIndex.map((s) => [s.url, s]));
  for (const t of data.trophies) {
    // First-round labels name a page ("Gamerfuzion list"); the site is the first word, so one site counts once.
    for (const s of t.sources) s.site ??= index.get(s.url)?.short?.split(' ')[0];
    t.notes = [];
    t.differs = t.differs ?? [];
  }
  for (const file of files) {
    for (const entry of file.trophies ?? []) {
      const t = byId.get(entry.id);
      if (!t) continue;
      const map = (entry.sources ?? []).map((src) => addSource(t, src, file.read));
      const remap = (cite) => [...new Set((cite ?? []).map((i) => map[i]).filter(Boolean))];
      for (const note of entry.notes ?? []) {
        if (note.text) t.notes.push({ text: note.text, cites: remap(note.cite) });
      }
      for (const d of entry.differs ?? []) {
        t.differs.push({
          topic: d.topic,
          call: d.call,
          versions: (d.versions ?? []).map((v) => ({ says: v.text, cites: remap(v.cite) })),
        });
      }
      for (const src of entry.sources ?? []) {
        if (index.has(src.url)) continue;
        const card = { name: src.title, url: src.url, short: src.site, read: file.read, used: 'Cited facts and disputes in the per-trophy guides.' };
        index.set(src.url, card);
        data.sourceIndex.push(card);
      }
    }
  }
  for (const s of data.sourceIndex) s.read ??= files[0]?.read;
  for (const t of data.trophies) {
    for (const s of t.sources) s.read ??= index.get(s.url)?.read;
  }
  return data;
}

// Adds one page to the trophy's list unless its URL is already there; returns its 1-based number.
function addSource(t, src, read) {
  const at = t.sources.findIndex((s) => s.url === src.url);
  if (at >= 0) {
    t.sources[at].read ??= read;
    t.sources[at].site ??= src.site;
    return at + 1;
  }
  t.sources.push({ name: src.title, url: src.url, site: src.site, read });
  return t.sources.length;
}
