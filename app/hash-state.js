// hash-state.js: the view lives in the URL hash (#tab=roadmap&trophy=17&filter=missable&q=bank) so any view can be linked.
const DEFAULTS = { tab: 'tracker', trophy: '', filter: 'all', grade: '', q: '' };

export function readHash() {
  const params = new URLSearchParams(location.hash.slice(1));
  const view = { ...DEFAULTS };
  for (const key of Object.keys(DEFAULTS)) if (params.has(key)) view[key] = params.get(key);
  view.demo = params.get('demo') === '1';
  view.spoiler = params.has('spoiler') ? params.get('spoiler') !== '0' : null;
  return view;
}

export function writeHash(view) {
  const params = new URLSearchParams();
  for (const key of Object.keys(DEFAULTS)) if (view[key] && view[key] !== DEFAULTS[key]) params.set(key, view[key]);
  const next = params.toString();
  if (next !== location.hash.slice(1)) history.replaceState(null, '', next ? `#${next}` : location.pathname);
}
