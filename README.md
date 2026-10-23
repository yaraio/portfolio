# Yara Ibrahim · Portfolio

A personal portfolio built with React, TypeScript and Vite. It opens with a 3D crumpled paper ball (three.js) that unravels into the page, and the whole site is that one sheet of paper, with index cards, prints, torn notebook pages, a library card, a letter and a sealed envelope laid on it.

## Run it locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

Add `?intro` to the URL to replay the opening animation (it plays once per browser session).

## Where things live

| What | File |
| --- | --- |
| All the words (projects, experience, awards, letter) | `src/data/content.ts` |
| Images (screenshots, your photo) | `public/images/` — then list the filename in `content.ts` |
| Colors, fonts, layout | `src/styles.css` (tokens at the top) |
| Opening animation | `src/components/Intro.tsx` |
| Paper (photo, colour, creases) | `public/paper/`, `src/paper/` |
| Tape, ink stamps, paper clip, wax seals | `src/components/Deco.tsx` |
| Page sections | `src/components/Sections.tsx` |

To add Tracklist screenshots: drop `tracklist-1.png` etc. into `public/images/` and set `images: ['tracklist-1.png', 'tracklist-2.png']` on the Tracklist entry.

## The paper

Put a photo of crumpled-then-flattened paper at `public/paper/crumpled.jpg` and the whole site uses it: the page background, and the sheet in the opening animation (its creases also shape the 3D folds). Any colour of paper works, because the photo is evened out to the page tone set in `src/paper/bake.ts` (`SHEET.base`). Best results: a large, evenly lit, straight-on photo with no table showing at the edges.

Without a photo, the site falls back to drawn paper.

## Deploying (when you're ready)

1. In the repo's **Settings → Pages**, set **Source** to **GitHub Actions** (once).
2. Go to the **Actions** tab → **Deploy to GitHub Pages** → **Run workflow**.

It never deploys on its own; it only runs when you start it. The site will be at `https://yaraio.github.io/portfolio/`.
