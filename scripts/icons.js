// Animated line icons (24×24, 1.8 stroke). Every stroked shape gets pathLength="1" so CSS can
// "draw" it in when its section is revealed; small hover actions live in site.css (.ai-*).
const SHAPES = {
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle class="pupil" cx="12" cy="12" r="3"/>',
  users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><g class="buddy"><path d="M16 4.6a3.2 3.2 0 0 1 0 6.3"/><path d="M18 14.3c1.8.8 3 2.6 3 4.7"/></g>',
  film: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path class="tri" d="m10 9 5 3-5 3Z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path class="hand" d="M12 7v5l3 2"/>',
  school: '<path d="M2 9l10-5 10 5-10 5Z"/><path d="M6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/><path class="tassel" d="M22 9v6"/>',
  passport: '<rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="10" r="3.2"/><path d="M9 16h6"/>',
  search: '<g class="lens"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.3-4.3"/></g>',
  board: '<rect x="3" y="4" width="18" height="11" rx="1.5"/><path d="M8 20l4-5 4 5"/><path class="bar" d="M7 11V9M11 11V7M15 11V8"/>',
  doc: '<path d="M6 3h8l4 4v14H6Z"/><path d="M14 3v4h4"/><path class="ln" d="M9 12h6M9 16h4"/>',
  chat: '<path d="M4 5h16v11H9l-5 4Z"/><circle class="dot d1" cx="9" cy="10.5" r="1"/><circle class="dot d2" cx="12" cy="10.5" r="1"/><circle class="dot d3" cx="15" cy="10.5" r="1"/>',
  stamp: '<g class="press"><path d="M9 3h6v5l-1 3h-4l-1-3Z"/><path d="M5 14h14v3H5Z"/></g><path d="M7 21h10"/>',
  book: '<path d="M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1Z"/><path d="M12 6v14"/>',
  chart: '<path d="M3 21h18"/><path class="bar b1" d="M6 18v-6"/><path class="bar b2" d="M11 18V6"/><path class="bar b3" d="M16 18v-9"/><path class="bar b4" d="M20 18v-4"/>',
  route: '<circle cx="6" cy="19" r="2.2"/><circle cx="18" cy="5" r="2.2"/><path class="path" d="M8.2 19H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.8"/>',
  user: '<circle class="head" cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>',
  briefcase: '<g class="case"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/></g>',
  bell: '<g class="clapper-wrap"><path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4Z"/><path class="clapper" d="M10 20a2 2 0 0 0 4 0"/></g>',
  YouTube: '<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path class="tri" d="m10 9.2 5 2.8-5 2.8Z"/>',
  Instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle class="dot" cx="17.2" cy="6.8" r="1"/>',
  TikTok: '<path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.5 2.6 2.3 4.4 5 4.6"/>',
  X: '<path d="M4 4h4.5L20 20h-4.5Z"/><path d="M20 4l-6.6 7.4M10.6 12.6 4 20"/>',
  Facebook: '<path d="M14 21v-8h3l.5-3.5H14V7.7c0-1 .4-1.7 1.8-1.7H18V3.2c-.4 0-1.6-.2-3-.2-3 0-4.6 1.7-4.6 4.6v2.9H7.5V13h2.9v8"/>',
};

/** An animated icon. Filled dots (class "dot") are not drawn as strokes. */
export function aicon(name) {
  // stroked shapes get class "dr" (drawable) merged into any class they already have
  const body = (SHAPES[name] || "").replace(/<(path|circle|rect)([^>]*)>/g, (m, tag, attrs) => {
    if (/class="[^"]*\bdot\b/.test(attrs)) return m;
    const merged = /class="/.test(attrs) ? attrs.replace(/class="/, 'class="dr ') : ` class="dr"${attrs}`;
    return `<${tag} pathLength="1"${merged}>`;
  });
  return `<svg class="ai ai-${name.toLowerCase()}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`;
}
