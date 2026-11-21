// dom.js: one tiny element builder used by every view, so views stay declarative and never touch innerHTML.
export function el(tag, attrs = {}, ...kids) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === false || value == null) continue;
    if (key === 'class') node.className = value;
    else if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
    else if (key === 'checked' || key === 'value') node[key] = value;
    else node.setAttribute(key, value === true ? '' : value);
  }
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue;
    node.append(kid instanceof Node ? kid : String(kid));
  }
  return node;
}

export const GRADE_LETTER = { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' };

export function gradeBadge(grade) {
  return el('span', { class: `grade g-${grade}`, title: grade }, GRADE_LETTER[grade]);
}

export function mount(id, ...kids) {
  document.getElementById(id).replaceChildren(...kids.flat());
}
