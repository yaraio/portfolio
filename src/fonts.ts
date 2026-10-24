// The two fonts that set the site's voice: the script (names, headings, signatures) and the
// typewriter (captions, labels, typed notes). Both are used by CSS (through --script and
// --type) and by the canvas that prints the name on the first screen.

type Pairing = { label: string; script: string; type: string; scale: number };

export const PAIRINGS: Record<string, Pairing> = {
  a: { label: 'Pinyon Script + Cutive Mono', script: 'Pinyon Script', type: 'Cutive Mono', scale: 0.82 },
  b: { label: 'Mrs Saint Delafield + Courier Prime', script: 'Mrs Saint Delafield', type: 'Courier Prime', scale: 1 },
  c: { label: 'Italianno + IBM Plex Mono', script: 'Italianno', type: 'IBM Plex Mono', scale: 1 },
  d: { label: 'Great Vibes + Cutive Mono', script: 'Great Vibes', type: 'Cutive Mono', scale: 0.82 },
};

export const DEFAULT_PAIRING = 'a';

function pick() {
  try {
    const saved = localStorage.getItem('pairing');
    if (import.meta.env.VITE_FONT_PICKER && saved && PAIRINGS[saved]) return saved;
  } catch { /* storage blocked */ }
  return DEFAULT_PAIRING;
}

export const FONTS = PAIRINGS[pick()];

export function installFonts() {
  const root = document.documentElement.style;
  root.setProperty('--script', `"${FONTS.script}", "Snell Roundhand", "Apple Chancery", cursive`);
  root.setProperty('--type', `"${FONTS.type}", "American Typewriter", "Courier New", monospace`);
  root.setProperty('--script-scale', String(FONTS.scale));
}
