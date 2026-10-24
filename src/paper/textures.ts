// Small tiling paper textures for the cards, folder and envelope that sit on the sheet.
// Drawn once at start-up and exposed as CSS variables (var(--tex-card) etc.).

function rand(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function draw(base: string, seed: number, size = 384) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  if (!ctx) return '';
  const r = rand(seed);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  // uneven pulp and age, drawn wrapped so the tile has no seams
  for (let i = 0; i < 22; i++) {
    const x = r() * size, y = r() * size, rad = 30 + r() * 120, dark = r() > 0.45;
    for (const ox of [-size, 0, size]) for (const oy of [-size, 0, size]) {
      const g = ctx.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, rad);
      g.addColorStop(0, dark ? 'rgba(100,90,75,0.05)' : 'rgba(255,250,235,0.08)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x + ox - rad, y + oy - rad, rad * 2, rad * 2);
    }
  }
  ctx.lineCap = 'round';
  for (let i = 0; i < size * size / 700; i++) {
    const x = r() * size, y = r() * size, len = 3 + r() * 14, a = r() * Math.PI * 2;
    ctx.strokeStyle = r() > 0.5 ? `rgba(90,60,30,${0.04 + r() * 0.06})` : `rgba(255,252,240,${0.12 + r() * 0.15})`;
    ctx.lineWidth = 0.4 + r() * 0.6;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); ctx.stroke();
  }
  // a few foxing specks
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = `rgba(120,105,90,${0.1 + r() * 0.2})`;
    ctx.beginPath(); ctx.arc(r() * size, r() * size, 0.5 + r() * 1.4, 0, Math.PI * 2); ctx.fill();
  }
  const img = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (r() - 0.5) * 14;
    img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL('image/png');
}

export function installTextures() {
  const root = document.documentElement.style;
  const set = (name: string, base: string, seed: number) => {
    const url = draw(base, seed);
    if (url) root.setProperty(name, `url(${url})`);
  };
  set('--tex-card', '#F3F0EA', 3);     // index cards and prints
  set('--tex-manila', '#D9CFBD', 19);  // folder
  set('--tex-kraft', '#CBBFAA', 23);   // envelope
  // full URLs, since a relative url() in a CSS variable resolves against the stylesheet
  const file = (f: string) => `url(${new URL(import.meta.env.BASE_URL + f, document.baseURI).href})`;
  // the real paper photo, for cards that should look like handled card stock
  root.setProperty('--tex-photo', file('paper/crumpled.jpg'));
  // cut-outs from photos: deckled cotton paper and washi tape (public/images/deco)
  const deco = (f: string) => file(`images/deco/${f}`);
  root.setProperty('--deckle', deco('deckle.webp'));
  for (const [k, f] of [['spiral', 'spiral.webp'], ['photocard', 'photocard.webp'], ['clip-paper', 'paper-clip-tall.webp'], ['collage', 'collage.webp'], ['scrap', 'scrap.webp'], ['postcard', 'postcard.jpg'], ['postcard-blank', 'postcard-blank.jpg']]) root.setProperty(`--${k}`, deco(f));
  // Quill cursor; the hotspot is the nib tip at the bottom-left.
  const raw = (f: string) => new URL(import.meta.env.BASE_URL + `images/deco/${f}`, document.baseURI).href;
  const quill = (f: string, fallback: string) =>
    `url(${raw(f + '.png')}) 1 31, ${fallback}`;
  const quillSet = (f: string, fallback: string) =>
    `image-set(url(${raw(f + '.png')}) 1x, url(${raw(f + '@2x.png')}) 2x) 1 31, ${fallback}`;
  root.setProperty('--quill', quill('quill', 'auto'));
  root.setProperty('--quill-tap', quill('quill-tap', 'pointer'));
  if (CSS.supports('cursor', quillSet('quill', 'auto'))) {
    root.setProperty('--quill', quillSet('quill', 'auto'));
    root.setProperty('--quill-tap', quillSet('quill-tap', 'pointer'));
  }
  for (const w of ['kraft', 'kraft-tex', 'cream', 'cream-tex', 'mauve', 'olive']) root.setProperty(`--washi-${w}`, deco(`washi-${w}.png`));
}
