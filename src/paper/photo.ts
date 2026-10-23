// Real paper: if public/paper/crumpled.jpg exists, the site uses that photo instead of
// the drawn paper. The photo is laid down the page (every other copy flipped so the
// joins line up), and its colour is evened out to one neutral tone so any photo fits.

export const PHOTO_URL = `${import.meta.env.BASE_URL}paper/crumpled.jpg`;

export function loadPhoto(url = PHOTO_URL): Promise<HTMLImageElement | null> {
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => res(img.naturalWidth > 0 ? img : null);
    img.onerror = () => res(null);
    img.src = url;
  });
}

/** tone: the paper colour to match, as [r, g, b]. contrast: 1 keeps the photo's light and shadow. */
export function bakeFromPhoto(img: HTMLImageElement, w: number, h: number, scale: number, tone: readonly number[], contrast = 1) {
  const cw = Math.max(1, Math.round(w * scale)), ch = Math.max(1, Math.round(h * scale));
  const canvas = document.createElement('canvas');
  canvas.width = cw; canvas.height = ch;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.imageSmoothingQuality = 'high';

  // cover the width; repeat down the page, mirroring every other copy
  const tileH = Math.round((img.naturalHeight / img.naturalWidth) * cw);
  for (let y = 0, k = 0; y < ch; y += tileH, k++) {
    ctx.save();
    if (k % 2) { ctx.translate(0, y + tileH); ctx.scale(1, -1); ctx.drawImage(img, 0, 0, cw, tileH); }
    else ctx.drawImage(img, 0, y, cw, tileH);
    ctx.restore();
  }

  const data = ctx.getImageData(0, 0, cw, ch);
  const d = data.data;
  let sum = 0;
  for (let i = 0; i < d.length; i += 4) sum += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
  const mean = sum / (d.length / 4) || 1;
  const lum = new Float32Array(cw * ch);
  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    const l = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / mean;
    const k = 1 + (l - 1) * contrast;
    lum[p] = l;
    d[i] = Math.min(255, tone[0] * k);
    d[i + 1] = Math.min(255, tone[1] * k);
    d[i + 2] = Math.min(255, tone[2] * k);
  }
  ctx.putImageData(data, 0, 0);
  return { canvas, lum, cw, ch };
}

function boxBlur(src: Float32Array, cw: number, ch: number, r: number) {
  const tmp = new Float32Array(src.length), out = new Float32Array(src.length);
  for (let y = 0; y < ch; y++) {
    let acc = 0;
    for (let x = -r; x <= r; x++) acc += src[y * cw + Math.min(cw - 1, Math.max(0, x))];
    for (let x = 0; x < cw; x++) {
      tmp[y * cw + x] = acc / (2 * r + 1);
      acc += src[y * cw + Math.min(cw - 1, x + r + 1)] - src[y * cw + Math.max(0, x - r)];
    }
  }
  for (let x = 0; x < cw; x++) {
    let acc = 0;
    for (let y = -r; y <= r; y++) acc += tmp[Math.min(ch - 1, Math.max(0, y)) * cw + x];
    for (let y = 0; y < ch; y++) {
      out[y * cw + x] = acc / (2 * r + 1);
      acc += tmp[Math.min(ch - 1, y + r + 1) * cw + x] - tmp[Math.max(0, y - r) * cw + x];
    }
  }
  return out;
}

/**
 * A height guess from the photo for the 3D sheet: its light and shadow, softened to
 * drop grain, minus the local average. The folds in the animation then sit where
 * the creases in the photo are.
 */
export function heightFromLum(lum: Float32Array, cw: number, ch: number, scale: number) {
  const fine = boxBlur(lum, cw, ch, Math.max(1, Math.round(4 * scale)));
  const wide = boxBlur(lum, cw, ch, Math.max(2, Math.round(30 * scale)));
  return (px: number, py: number) => {
    const x = Math.min(cw - 1, Math.max(0, Math.round(px * scale)));
    const y = Math.min(ch - 1, Math.max(0, Math.round(py * scale)));
    const i = y * cw + x;
    return fine[i] - wide[i];
  };
}
