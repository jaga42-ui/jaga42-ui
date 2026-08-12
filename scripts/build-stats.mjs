#!/usr/bin/env node
/**
 * Renders assets/stats.svg — the live counters strip.
 *
 * The numbers in the banner illustration are painted on and go stale. These
 * are read from the GitHub API every six hours, so the strip is always true.
 *
 * Run locally:  GH_USERNAME=guruprasad-jena node scripts/build-stats.mjs
 * In CI:        GH_USERNAME + GH_TOKEN come from .github/workflows/refresh.yml
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { T, DISPLAY, SANS, esc, chrome, dashedRule } from './theme.mjs';

/* ─────────────────── EDIT ME ─────────────────── */

// Shown when the API can't be reached, so the strip is never blank.
const FALLBACK = { stars: 17, commits: 394, repos: 21, languages: 6 };

/* ─────────────────────────────────────────────── */

const W = 1200;
const H = 208;
const PAD = 56;

const ICONS = {
  // 24×24 viewBox paths, drawn to match the banner's line weight.
  stars:
    'M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5-4.7-4.6 6.5-.9z',
  languages: 'M9 7.5L4.5 12 9 16.5M15 7.5L19.5 12 15 16.5M13 4.5l-2 15',
  // The classic git commit mark: a node on the line.
  commits: 'M2 12h6.4M15.6 12H22M15.6 12a3.6 3.6 0 1 1-7.2 0 3.6 3.6 0 1 1 7.2 0',
  repos:
    'M5 3.5h11.5a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5V5A1.5 1.5 0 0 1 5 3.5zM3.5 16.5H18',
};

const FILLED = new Set(['stars']);

async function gh(path) {
  const headers = { 'user-agent': 'profile-stats', accept: 'application/vnd.github+json' };
  if (process.env.GH_TOKEN) headers.authorization = `Bearer ${process.env.GH_TOKEN}`;
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json();
}

async function collect(user) {
  let stars = 0;
  let repos = 0;
  const langs = new Set();

  for (let page = 1; page <= 5; page++) {
    const batch = await gh(`/users/${user}/repos?per_page=100&type=owner&page=${page}`);
    if (!batch.length) break;
    for (const r of batch) {
      if (r.fork) continue; // only count what you actually authored
      repos++;
      stars += r.stargazers_count;
      if (r.language) langs.add(r.language);
    }
    if (batch.length < 100) break;
  }

  // The commit search index lags a little and is rate-limited harder than the
  // rest of the API, so a failure here shouldn't sink the whole strip.
  let commits = FALLBACK.commits;
  try {
    const found = await gh(`/search/commits?q=author:${user}&per_page=1`);
    if (typeof found.total_count === 'number') commits = found.total_count;
  } catch (err) {
    console.log(`stats: commit search unavailable (${err.message}), using fallback`);
  }

  return { stars, commits, repos, languages: langs.size };
}

// 1240 → "1.2k", so a wide number never breaks the column rhythm.
const fmt = (n) =>
  n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '')}k` : String(n);

function render(s) {
  const cells = [
    { key: 'stars', label: 'Total Stars', value: s.stars },
    { key: 'commits', label: 'Commits', value: s.commits },
    { key: 'repos', label: 'Repositories', value: s.repos },
    { key: 'languages', label: 'Languages', value: s.languages },
  ];

  const colW = (W - PAD * 2) / cells.length;

  const body = cells
    .map((c, i) => {
      const x = PAD + colW * i;
      const filled = FILLED.has(c.key);
      const divider =
        i > 0
          ? `    <line x1="${x - 14}" y1="104" x2="${
              x - 14
            }" y2="168" stroke="${T.cream}" stroke-opacity=".09"/>\n`
          : '';

      return `${divider}    <g class="rise" style="animation-delay:${(0.1 + i * 0.09).toFixed(2)}s">
      <g transform="translate(${x}, 121) scale(1.5)" fill="none" stroke="${
        filled ? T.orange : T.cream
      }" stroke-opacity="${filled ? 1 : 0.85}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
        <path d="${ICONS[c.key]}"${filled ? ` fill="${T.orange}" fill-opacity=".9"` : ''}/>
      </g>
      <text x="${x + 54}" y="${128}" font-family="${SANS}" font-size="15" fill="${
        T.muted
      }">${esc(c.label)}</text>
      <text x="${x + 54}" y="${164}" font-family="${DISPLAY}" font-size="34" letter-spacing="1" fill="${
        T.cream
      }">${esc(fmt(c.value))}</text>
    </g>`;
    })
    .join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="st sd">
  <title id="st">GitHub statistics</title>
  <desc id="sd">${esc(
    cells.map((c) => `${c.label}: ${c.value}`).join('. ')
  )}.</desc>
${chrome(W, H, 's')}

  <style>
    .rise { animation: rise .7s cubic-bezier(.2,.7,.3,1) backwards; }
    @keyframes rise { from { opacity: 0; transform: translateY(9px); } }
    @media (prefers-reduced-motion: reduce) { .rise { animation: none; } }
  </style>

  <text x="${PAD}" y="60" font-family="${DISPLAY}" font-size="28" letter-spacing="1.5" fill="${
    T.orange
  }">GITHUB STATS</text>
  ${dashedRule(PAD + 232, 52, W - PAD * 2 - 232)}

${body}
</svg>
`;
}

const user = process.env.GH_USERNAME; // not USERNAME — Windows sets that itself
let stats = FALLBACK;

if (user) {
  try {
    stats = await collect(user);
    console.log(`stats: @${user} →`, stats);
  } catch (err) {
    console.log(`stats: ${err.message} — using fallback numbers`);
  }
} else {
  console.log('stats: no GH_USERNAME set, using fallback numbers');
}

await mkdir(new URL('../assets/', import.meta.url), { recursive: true });
await writeFile(new URL('../assets/stats.svg', import.meta.url), render(stats));
console.log('stats: wrote assets/stats.svg');
