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

- `public/paper/crumpled.jpg` is the page itself: a real photo of crumpled, flattened paper. It repeats down the page and is evened out to the tone set in `src/paper/bake.ts` (`SHEET.base`), so any paper photo works. Crease strength is the `contrast` value in `src/paper/photo.ts`.
- `public/paper/unwrap.mp4` (and `unwrap.webm`) is the opening: a filmed paper ball unwrapping, already keyed from green screen. The top half of the video is the colour and the bottom half is the transparency. Delete it to fall back to the 3D unfold.
- `public/images/wax-seal.png` is the wax seal used around the site.

Without the photo, the site falls back to drawn paper.

## Deploying (when you're ready)

1. In the repo's **Settings → Pages**, set **Source** to **GitHub Actions** (once).
2. Go to the **Actions** tab → **Deploy to GitHub Pages** → **Run workflow**.

It never deploys on its own; it only runs when you start it. The site will be at `https://yaraio.github.io/portfolio/`.
