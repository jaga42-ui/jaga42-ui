#!/usr/bin/env node
/**
 * Renders assets/hero.svg — the banner.
 *
 * The portrait is your illustration, cropped to assets/portrait.jpg and embedded
 * as a data URI so the whole banner is a single file. Everything else is vector,
 * so the type stays sharp at any zoom and you edit it here rather than
 * regenerating an image.
 *
 *   node scripts/build-hero.mjs
 */
import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { T, DISPLAY, SANS, MONO, esc, chrome } from './theme.mjs';

/* ─────────────────── EDIT ME ─────────────────── */

const PROMPT = { user: 'developer', host: 'guruprasad' };
const NAME = ['GURUPRASAD', 'JENA']; // second line takes the accent colour
const TITLE = 'FULL-STACK DEVELOPER';
const TAGLINE = [
  [{ text: 'Building thoughtful software,' }],
  [{ text: 'one line', accent: true }, { text: ' at a time.' }],
];

const LINKS = [
  { icon: 'github', text: 'github.com/jaga42-ui' },
  { icon: 'linkedin', text: 'linkedin.com/in/guruprasad-jena' },
  { icon: 'globe', text: 'getfreetoolsai.com' },
  { icon: 'mail', text: 'guruprasadjena.dev@gmail.com' },
];

/* ─────────────────────────────────────────────── */

const W = 1200;
const H = 560;
const PAD = 56;
const ART_X = 620; // where the portrait starts

const ICONS = {
  github: {
    fill: true,
    d: 'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z',
  },
  linkedin: {
    fill: true,
    d: 'M13.6 0H2.4A2.4 2.4 0 0 0 0 2.4v11.2A2.4 2.4 0 0 0 2.4 16h11.2a2.4 2.4 0 0 0 2.4-2.4V2.4A2.4 2.4 0 0 0 13.6 0zM5 13.4H2.7V6.2H5v7.2zM3.85 5.2a1.34 1.34 0 1 1 0-2.68 1.34 1.34 0 0 1 0 2.68zM13.4 13.4h-2.3V9.9c0-.84-.02-1.92-1.17-1.92-1.17 0-1.35.91-1.35 1.86v3.56H6.3V6.2h2.2v.98h.03c.31-.58 1.06-1.2 2.18-1.2 2.33 0 2.76 1.53 2.76 3.53v3.89z',
  },
  globe: {
    fill: false,
    d: 'M8 .8a7.2 7.2 0 1 1 0 14.4A7.2 7.2 0 0 1 8 .8zM.8 8h14.4M8 .8c1.9 2 2.9 4.5 2.9 7.2S9.9 13.2 8 15.2C6.1 13.2 5.1 10.7 5.1 8S6.1 2.8 8 .8z',
  },
  mail: { fill: false, d: 'M1.2 3.4h13.6v9.2H1.2zM1.2 3.4L8 8.9l6.8-5.5' },
};

const tagline = TAGLINE.map((line, i) => {
  const spans = line
    .map(
      (s) =>
        `<tspan fill="${s.accent ? T.orange : T.muted}"${
          s.accent ? ' font-weight="600"' : ''
        }>${esc(s.text)}</tspan>`
    )
    .join('');
  return `    <text x="${PAD}" y="${352 + i * 30}" font-family="${MONO}" font-size="17">${spans}</text>`;
}).join('\n');

const links = LINKS.map((l, i) => {
  const y = 420 + i * 34;
  const ic = ICONS[l.icon];
  return `    <g class="rise" style="animation-delay:${(0.4 + i * 0.07).toFixed(2)}s">
      <g transform="translate(${PAD}, ${y - 12}) scale(1.15)" ${
    ic.fill
      ? `fill="${T.cream}" fill-opacity=".9"`
      : `fill="none" stroke="${T.cream}" stroke-opacity=".9" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"`
  }>
        <path d="${ic.d}"/>
      </g>
      <text x="${PAD + 36}" y="${y + 2}" font-family="${MONO}" font-size="15" fill="${
    T.cream
  }" fill-opacity=".85">${esc(l.text)}</text>
    </g>`;
}).join('\n');

const portrait = await readFile(new URL('../assets/portrait.jpg', import.meta.url)).catch(
  () => null
);

if (!portrait) {
  console.error(
    'hero: assets/portrait.jpg is missing. Crop your illustration to 580x580 and save it there.'
  );
  process.exit(1);
}

const art = `
  <defs>
    <!-- Feathers the artwork into the panel so there is no hard seam. -->
    <linearGradient id="feather" gradientUnits="userSpaceOnUse" x1="${ART_X}" y1="0" x2="${
  ART_X + 200
}" y2="0">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/>
      <stop offset="1" stop-color="#fff" stop-opacity="1"/>
    </linearGradient>
    <mask id="art-mask">
      <rect x="${ART_X}" y="0" width="${W - ART_X}" height="${H}" fill="url(#feather)"/>
    </mask>
  </defs>
  <g clip-path="url(#h-clip)" mask="url(#art-mask)">
    <!-- Taller than the panel and pinned to the top, so the desk clutter at the
         foot of the illustration falls below the crop instead of being sliced. -->
    <image x="${ART_X}" y="-46" width="${W - ART_X}" height="672" href="data:image/jpeg;base64,${portrait.toString(
    'base64'
  )}" preserveAspectRatio="xMidYMin slice"/>
  </g>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="ht hd">
  <title id="ht">${esc(NAME.join(' '))} — ${esc(TITLE)}</title>
  <desc id="hd">${esc(
    TAGLINE.map((l) => l.map((s) => s.text).join('')).join(' ')
  )} ${esc(LINKS.map((l) => l.text).join('. '))}.</desc>
${chrome(W, H, 'h')}
${art}

  <style>
    .rise { animation: rise .8s cubic-bezier(.2,.7,.3,1) backwards; }
    @keyframes rise { from { opacity: 0; transform: translateY(11px); } }
    .caret { animation: blink 1.15s steps(1, end) infinite; }
    @keyframes blink { 50% { opacity: 0; } }
    @media (prefers-reduced-motion: reduce) { .rise, .caret { animation: none; } }
  </style>

  <g class="rise">
    <text x="${PAD}" y="60" font-family="${MONO}" font-size="16">
      <tspan fill="${T.mint}">${esc(PROMPT.user)}</tspan><tspan fill="${T.cream}" fill-opacity=".75">@${esc(
  PROMPT.host
)}</tspan><tspan fill="${T.cream}" fill-opacity=".5">:~</tspan><tspan fill="${T.orange}">$</tspan>
    </text>
    <rect class="caret" x="${PAD + 234}" y="47" width="9" height="17" fill="${T.orange}" fill-opacity=".8"/>
  </g>

  <g class="rise" style="animation-delay:.1s">
    <text x="${PAD}" y="164" font-family="${DISPLAY}" font-size="82" letter-spacing="1.5" fill="${
  T.cream
}">${esc(NAME[0])}</text>
    <text x="${PAD}" y="244" font-family="${DISPLAY}" font-size="82" letter-spacing="1.5" font-style="italic" fill="${
  T.ember
}">${esc(NAME[1])}</text>
  </g>

  <g class="rise" style="animation-delay:.2s">
    <text x="${PAD}" y="300" font-family="${MONO}" font-size="24" font-weight="700" fill="${
  T.orange
}">&lt;/&gt;</text>
    <text x="${PAD + 60}" y="300" font-family="${SANS}" font-size="23" font-weight="700" font-style="italic" letter-spacing="1.2" fill="${
  T.cream
}">${esc(TITLE)}</text>
  </g>

  <g class="rise" style="animation-delay:.3s">
${tagline}
  </g>

${links}
</svg>
`;

await mkdir(new URL('../assets/', import.meta.url), { recursive: true });
await writeFile(new URL('../assets/hero.svg', import.meta.url), svg);
console.log(`hero: wrote assets/hero.svg (${Math.round(svg.length / 1024)} KB)`);
