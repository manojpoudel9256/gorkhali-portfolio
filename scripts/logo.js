// The Gorkhali in Japan mark, drawn after the channel's profile picture: a glossy 3D tile,
// Nepal and Japan flags crossed on top, a red glowing base with a camera and a swoosh.
// Defined once as an inline <symbol> sprite (gradients need to live in the page), used via <use href="#gij">.
// No style="" attributes anywhere: the CSP forbids inline styles; SVG presentation attributes are fine.

const SUN = "M82.5 83.9L83.4 86.2L85.3 84.7L84.9 87.1L87.3 86.7L85.8 88.6L88.1 89.5L85.8 90.4L87.3 92.3L84.9 91.9L85.3 94.3L83.4 92.8L82.5 95.1L81.6 92.8L79.7 94.3L80.1 91.9L77.7 92.3L79.2 90.4L76.9 89.5L79.2 88.6L77.7 86.7L80.1 87.1L79.7 84.7L81.6 86.2Z";
const MOONSTAR = "M77.5 61.3L78.3 62.7L79.8 62.2L79.3 63.7L80.7 64.5L79.3 65.3L79.8 66.8L78.3 66.3L77.5 67.7L76.7 66.3L75.2 66.8L75.7 65.3L74.3 64.5L75.7 63.7L75.2 62.2L76.7 62.7Z";
export const SPARK = "M0 -6L1 -1L6 0L1 1L0 6L-1 1L-6 0L-1 -1Z";

export const LOGO_SPRITE = `<svg class="sprite" aria-hidden="true" focusable="false" width="0" height="0">
<defs>
  <linearGradient id="gij-face" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".62" stop-color="#f6f1f2"/><stop offset="1" stop-color="#eadfe1"/></linearGradient>
  <linearGradient id="gij-red" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff4a35"/><stop offset=".45" stop-color="#e01a2b"/><stop offset="1" stop-color="#9c0b20"/></linearGradient>
  <linearGradient id="gij-rim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#f1e6e8"/><stop offset=".7" stop-color="#e2384a"/><stop offset="1" stop-color="#7d0818"/></linearGradient>
  <linearGradient id="gij-gloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <linearGradient id="gij-jp" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#f3f0f2"/><stop offset=".8" stop-color="#ffffff"/><stop offset="1" stop-color="#e9e4e7"/></linearGradient>
  <radialGradient id="gij-glow"><stop offset="0" stop-color="#ff3b30" stop-opacity=".55"/><stop offset="1" stop-color="#ff3b30" stop-opacity="0"/></radialGradient>
  <clipPath id="gij-clip"><rect x="22" y="22" width="156" height="156" rx="42"/></clipPath>
</defs>
<symbol id="gij" viewBox="0 0 200 200">
  <ellipse class="gij-glow" cx="100" cy="176" rx="92" ry="26" fill="url(#gij-glow)"/>
  <rect x="22" y="26" width="156" height="156" rx="42" fill="#7d0818" opacity=".35"/>
  <g clip-path="url(#gij-clip)">
    <rect x="22" y="22" width="156" height="156" fill="url(#gij-face)"/>
    <path d="M22 118C70 136 130 136 178 118V132C130 150 70 150 22 132Z" fill="#fff" opacity=".85"/>
    <path d="M22 126C70 144 130 144 178 126V178H22Z" fill="url(#gij-red)"/>
    <path d="M22 126C70 144 130 144 178 126V131C130 149 70 149 22 131Z" fill="#fff" opacity=".35"/>
    <path class="gij-swoosh" d="M72 154C98 147 126 147 152 139" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" opacity=".92"/>
    <path class="gij-swoosh" d="M76 160C102 154 124 153 146 147" fill="none" stroke="#ffd1c9" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>
    <rect x="50" y="143" width="19" height="14" rx="3.5" fill="#fff"/><rect x="53" y="140.5" width="6" height="4" rx="1.2" fill="#fff"/>
    <circle cx="59.5" cy="150" r="4.6" fill="#e01a2b"/><circle cx="58.4" cy="148.9" r="1.3" fill="#fff" opacity=".8"/>
    <path d="M22 22H178V84C140 70 60 70 22 84Z" fill="url(#gij-gloss)" opacity=".7"/>
  </g>
  <rect x="23.5" y="23.5" width="153" height="153" rx="40.5" fill="none" stroke="url(#gij-rim)" stroke-width="3"/>
  <g class="gij-flags">
    <path d="M84 44L106 114" stroke="#1b1b1b" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M118.5 42L94 114" stroke="#1b1b1b" stroke-width="2.6" stroke-linecap="round"/>
    <g class="gij-np">
      <path d="M84.5 47L54 76.5H71L50 99.5H100Z" fill="#dc143c" stroke="#1f3f9c" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M71.8 60.2a6 6 0 0 0 11.4 0a5.2 5.2 0 0 1-11.4 0Z" fill="#fff"/>
      <path d="${MOONSTAR}" fill="#fff"/>
      <path d="${SUN}" fill="#fff"/>
    </g>
    <g class="gij-jp">
      <path d="M117.6 45.5C131 39 146 57 163.5 49.5L161.5 85.5C146 93 132 75.5 105.6 82Z" fill="url(#gij-jp)" stroke="#1b1b1b" stroke-width="1.4" stroke-linejoin="round"/>
      <circle cx="136" cy="65" r="10.5" fill="#e0101f"/>
    </g>
  </g>
</symbol>
</svg>`;

/** The mark at any size. `title` gives it an accessible name; omit for decorative use. */
export const logo = (cls = "", title = "") =>
  `<svg class="gij ${cls}" viewBox="0 0 200 200"${title ? ` role="img" aria-label="${title}"` : ' aria-hidden="true" focusable="false"'}><use href="#gij"/></svg>`;
