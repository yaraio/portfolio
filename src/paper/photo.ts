// Real paper: if public/paper/crumpled.jpg exists, the site uses it instead of the drawn
// paper. It's a tall texture built from real photos (the Pexels sheet, the creases of the
// flat sheet at the end of the intro video, paper fibres) whose bottom runs into its top,
// so it repeats down the page with no join. Its colour is evened out to one paper tone.

export const PHOTO_URL = `${import.meta.env.BASE_URL}paper/crumpled.jpg`;

export function loadPhoto(url = PHOTO_URL): Promise<HTMLImageElement | null> {
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => res(img.naturalWidth > 0 ? img : null);
    img.onerror = () => res(null);
    img.src = url;
  });
}

/**
 * Evens the photo out to one paper tone.
 * tone: the paper colour, as [r, g, b]. contrast: how strongly the creases show (1 = as photographed).
 */
export function bakeFromPhoto(img: HTMLImageElement, tone: readonly number[], contrast = 1.8) {
  const cw = Math.min(1600, img.naturalWidth);
  const th = Math.round((img.naturalHeight / img.naturalWidth) * cw);
  const ch = th;
  const canvas = document.createElement('canvas');
  canvas.width = cw; canvas.height = ch;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, cw, th);

  const data = ctx.getImageData(0, 0, cw, ch);
  const d = data.data;
  const lum = new Float32Array(cw * ch);
  for (let i = 0, p = 0; i < d.length; i += 4, p++) lum[p] = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
  // divide out the photo's broad lighting, so only the creases are left and turned up
  const light = boxBlur(lum, cw, ch, Math.round(cw / 14));
  for (let p = 0, i = 0; p < lum.length; p++, i += 4) {
    const l = lum[p] / (light[p] || 1);
    const k = Math.max(0.55, 1 + (l - 1) * contrast);
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
    const y = Math.max(0, Math.round(py * scale)) % ch;
    const i = y * cw + x;
    return fine[i] - wide[i];
  };
}
