// guide-parse.js: turns a trophy's "guide" text ("1. Do this [1][2]\n2. …") into numbered steps with citation numbers.
export function parseGuide(guide) {
  return String(guide)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const cites = [...line.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1]));
      const text = line.replace(/^\d+\.\s*/, '').replace(/\s*\[\d+\]/g, '').trim();
      return { text, cites };
    });
}
