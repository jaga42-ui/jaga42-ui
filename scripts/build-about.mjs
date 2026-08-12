#!/usr/bin/env node
/**
 * Renders assets/about.svg — the two-column panel under the banner.
 * Static: run it yourself after editing the block below.
 *
 *   node scripts/build-about.mjs
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { T, DISPLAY, SANS, MONO, esc, chrome, dashedRule } from './theme.mjs';

/* ─────────────────── EDIT ME ─────────────────── */

// Each bullet is an array of lines — SVG has no text wrapping, so you break
// them yourself. Keep lines under about 46 characters.
const ABOUT = [
  ['Full-stack developer who loves turning', 'ideas into real-world solutions.'],
  ['I build clean, scalable, and impactful', 'applications with modern technologies.'],
  ['Always learning. Always building.', { text: 'Always shipping.', accent: true }],
];

const FACTS = [
  { label: 'Role', value: 'Full-Stack Developer' },
  { label: 'Building', value: 'getfreetoolsai.com' },
  { label: 'Open to', value: 'Full-time · Freelance · Remote' },
  { label: 'Reach me', value: 'guruprasadjena.dev@gmail.com' },
];

/* ─────────────────────────────────────────────── */

const W = 1200;
const PAD = 56;
const COL = 596; // vertical divider
const RIGHT_X = COL + 52;
const TOP = 108;
const LINE_H = 26;
const BLOCK_GAP = 30;

// Lay the bullets out first so the panel height follows the content.
let y = TOP;
const bullets = ABOUT.map((lines) => {
  const start = y;
  const rendered = lines.map((line, i) => {
    const text = typeof line === 'string' ? line : line.text;
    const accent = typeof line === 'object' && line.accent;
    const ly = y + i * LINE_H;
    return `      <text x="${PAD + 34}" y="${ly}" font-family="${SANS}" font-size="16" fill="${
      accent ? T.ember : T.cream
    }" fill-opacity="${accent ? 1 : 0.88}" font-weight="${accent ? 600 : 400}">${esc(text)}</text>`;
  });
  y += lines.length * LINE_H + BLOCK_GAP;
  return { start, rendered, end: y - BLOCK_GAP };
});

const lastDot = bullets[bullets.length - 1].start;
const H = Math.max(y + 22, TOP + FACTS.length * 74 + 20);

const bulletMarkup = bullets
  .map(
    (b, i) => `    <g class="rise" style="animation-delay:${(0.1 + i * 0.08).toFixed(2)}s">
      <circle cx="${PAD + 8}" cy="${b.start - 5}" r="5" fill="${T.orange}" fill-opacity=".85"/>
${b.rendered.join('\n')}
    </g>`
  )
  .join('\n');

const factMarkup = FACTS.map(
  (f, i) => `    <g class="rise" style="animation-delay:${(0.16 + i * 0.08).toFixed(2)}s">
      <text x="${RIGHT_X}" y="${TOP + i * 74 - 6}" font-family="${SANS}" font-size="11" font-weight="600" letter-spacing="2.6" fill="${
    T.muted
  }">${esc(f.label.toUpperCase())}</text>
      <text x="${RIGHT_X}" y="${TOP + i * 74 + 22}" font-family="${MONO}" font-size="16" fill="${
    T.cream
  }">${esc(f.value)}</text>
    </g>`
).join('\n');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="at ad">
  <title id="at">About Guruprasad Jena</title>
  <desc id="ad">${esc(
    ABOUT.map((b) => b.map((l) => (typeof l === 'string' ? l : l.text)).join(' ')).join(' ')
  )} ${esc(FACTS.map((f) => `${f.label}: ${f.value}`).join('. '))}.</desc>
${chrome(W, H, 'a')}

  <style>
    .rise { animation: rise .7s cubic-bezier(.2,.7,.3,1) backwards; }
    @keyframes rise { from { opacity: 0; transform: translateY(9px); } }
    @media (prefers-reduced-motion: reduce) { .rise { animation: none; } }
  </style>

  <text x="${PAD}" y="62" font-family="${DISPLAY}" font-size="28" letter-spacing="1.5" fill="${
  T.orange
}">ABOUT ME</text>
  ${dashedRule(PAD + 172, 54, COL - PAD - 200)}

  <text x="${RIGHT_X}" y="62" font-family="${DISPLAY}" font-size="28" letter-spacing="1.5" fill="${
  T.orange
}">AT A GLANCE</text>
  ${dashedRule(RIGHT_X + 216, 54, W - PAD - RIGHT_X - 216)}

  <line x1="${COL}" y1="84" x2="${COL}" y2="${H - 28}" stroke="${T.cream}" stroke-opacity=".09"/>

  <!-- the thread connecting the bullet markers -->
  <line x1="${PAD + 8}" y1="${TOP - 5}" x2="${PAD + 8}" y2="${lastDot - 5}" stroke="${
  T.orange
}" stroke-opacity=".22" stroke-width="2"/>

${bulletMarkup}
${factMarkup}
</svg>
`;

await mkdir(new URL('../assets/', import.meta.url), { recursive: true });
await writeFile(new URL('../assets/about.svg', import.meta.url), svg);
console.log('about: wrote assets/about.svg');
