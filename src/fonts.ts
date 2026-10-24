// The site's typefaces. CSS reads them through --script, --caps, --body, --tagline and --type,
// and the canvas that prints the first screen reads them from here too.

export const FONTS = {
  script: 'Pinyon Script', // names, headings, signatures
  caps: 'Forum', // nav, eyebrows, labels
  body: 'Cormorant Garamond', // running text
  tagline: { family: 'Cormorant Garamond', style: 'italic', weight: 500 }, // the line under the name
  type: 'Cutive Mono', // captions, tags, typed notes
  scale: 0.82, // Pinyon runs large, so script sizes are scaled down
};

export function installFonts() {
  const root = document.documentElement.style;
  root.setProperty('--script', `"${FONTS.script}", "Snell Roundhand", "Apple Chancery", cursive`);
  root.setProperty('--caps', `"${FONTS.caps}", "Trajan Pro", Georgia, serif`);
  root.setProperty('--body', `"${FONTS.body}", Garamond, Georgia, serif`);
  root.setProperty('--tagline', `"${FONTS.tagline.family}", Garamond, Georgia, serif`);
  root.setProperty('--type', `"${FONTS.type}", "American Typewriter", "Courier New", monospace`);
  root.setProperty('--script-scale', String(FONTS.scale));
}
