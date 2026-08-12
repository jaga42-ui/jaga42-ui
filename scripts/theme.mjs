// Design tokens, pulled from the banner illustration.
// Change them here and rebuild — both panels read from this file.
export const T = {
  ink0: '#0D0C0B', // panel gradient start — warm charcoal
  ink1: '#16120F',
  ink2: '#1C1713', // panel gradient end
  cream: '#F3EADA', // primary text
  muted: '#9C8C7A', // secondary text, warm grey
  orange: '#E58A3C', // headings and accents
  ember: '#C9541F', // the hotter accent, used sparingly
  mint: '#8FBF6F', // terminal green
};

// Impact ships on Windows and macOS; the fallbacks cover Linux runners.
export const DISPLAY =
  "Impact, Haettenschweiler, 'Franklin Gothic Bold', 'Arial Black', sans-serif";
export const SANS =
  "'Segoe UI', -apple-system, 'Helvetica Neue', Inter, Arial, sans-serif";
export const MONO =
  "ui-monospace, 'SFMono-Regular', 'JetBrains Mono', 'Cascadia Mono', Menlo, Consolas, monospace";

export const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Shared panel chrome so every card reads as one system.
export const chrome = (W, H, id = 'p') => `
  <defs>
    <linearGradient id="${id}-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${T.ink0}"/>
      <stop offset=".55" stop-color="${T.ink1}"/>
      <stop offset="1" stop-color="${T.ink2}"/>
    </linearGradient>
    <clipPath id="${id}-clip"><rect width="${W}" height="${H}" rx="16"/></clipPath>
  </defs>
  <g clip-path="url(#${id}-clip)">
    <rect width="${W}" height="${H}" fill="url(#${id}-bg)"/>
    <rect width="${W}" height="1" fill="${T.cream}" fill-opacity=".06"/>
  </g>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="16" fill="none" stroke="${
  T.orange
}" stroke-opacity=".35"/>`;

// The dashed rule that follows every section heading in the banner.
export const dashedRule = (x, y, w) =>
  `<line x1="${x}" y1="${y}" x2="${x + w}" y2="${y}" stroke="${
    T.orange
  }" stroke-opacity=".45" stroke-width="1.5" stroke-dasharray="7 6"/>`;
