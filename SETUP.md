# Setup

Your profile README lives in the repo named exactly like your handle —
**`jaga42-ui/jaga42-ui`**, which already exists. This pushes into it.

## 1. Push

```bash
git init -b main
git add -A
git commit -m "Profile"
git remote add origin https://github.com/jaga42-ui/jaga42-ui.git
git push -u origin main
```

If that repo already has commits, pull first: `git pull --rebase origin main`.

## 2. The portrait

`assets/portrait.jpg` is your illustration cropped square to 580×580, and
`build-hero.mjs` embeds it into the banner as a data URI — so the banner is one
self-contained file with sharp vector type over it.

To swap the artwork, replace `assets/portrait.jpg` (keep it square, roughly 580 px,
under ~150 KB) and re-run the hero build. The crop is tuned so the desk clutter at the
foot of the illustration falls below the panel; if your replacement frames differently,
adjust the `y` and `height` on the `<image>` element in `build-hero.mjs`.

## 3. Fill in the rest

| File | What to edit |
| :-- | :-- |
| `scripts/build-hero.mjs` | The `EDIT ME` block: name, title, tagline, the four links |
| `scripts/build-about.mjs` | Your three about lines and the four facts |
| `scripts/build-stats.mjs` | Only the fallback numbers, used when the API is unreachable |
| `scripts/theme.mjs` | Colours and typefaces |
| `README.md` | Featured projects, the tech-stack icon row, contact badges |

After editing any script, redraw the panels:

```bash
node scripts/build-hero.mjs && node scripts/build-about.mjs && node scripts/build-stats.mjs
```

Commit the results — GitHub serves the committed SVGs, so they have to be in the repo.

## How the counters stay true

`.github/workflows/refresh.yml` re-renders `assets/stats.svg` every six hours from the
GitHub API: stars and forks summed across the repos you authored (forks of other people's
work are excluded), your public repo count, and commits via the commit search index.

It uses the built-in `GITHUB_TOKEN`, so there's nothing to configure — but the workflow
needs write access: **Settings → Actions → General → Workflow permissions → Read and
write permissions**. Without that, the job fails on the push step.

If the API is unreachable the strip falls back to the numbers in `build-stats.mjs`
rather than rendering blank. Don't leave those fallbacks lying — set them to something
close to true.

## Tech stack icons

The icon row in the README comes from `skillicons.dev`. Add or remove technologies by
editing the `i=` list in the image URL — the order you list them is the order they render.

## Notes on the design

- The SVGs use system fonts only (Impact for the display numbers and headings, the
  default UI sans for body text). GitHub blocks external font loading inside images, so
  a webfont would silently fall back and break the layout.
- Both panels are self-contained dark cards, so they sit correctly on the light and dark
  GitHub themes without needing two versions.
- Motion is a short load-in only, and it's disabled for anyone browsing with reduced
  motion turned on.

## Checking your work

Open `_preview.html` in a browser to see both panels against GitHub's light and dark
backgrounds before pushing. Delete it when you're done — it isn't part of the profile.
