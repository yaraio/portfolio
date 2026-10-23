import { CreaseField, LIGHT } from './creases';

// Bakes the big sheet the whole site is printed on when there is no paper photo:
// a soft neutral page tone, slightly aged edges, a few specks, and the crease shading.
// The same canvas is the page background and the intro sheet's texture.

export const SHEET = {
  base: [232, 227, 217] as const,   // soft warm white, like an old book page
  warm: [220, 211, 194] as const,   // a touch of age toward the edges
  foxing: [140, 120, 100] as const, // faint specks
};

function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// smooth value noise for big, soft tone changes
function valueNoise(seed: number) {
  const r = rng(seed);
  const N = 256, table = new Float32Array(N * N);
  for (let i = 0; i < table.length; i++) table[i] = r();
  const at = (i: number, j: number) => table[((j & 255) * N) + (i & 255)];
  return (x: number, y: number) => {
    const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const a = at(i, j) + (at(i + 1, j) - at(i, j)) * sx;
    const b = at(i, j + 1) + (at(i + 1, j + 1) - at(i, j + 1)) * sx;
    return a + (b - a) * sy;
  };
}

/**
 * w, h: sheet size in CSS px. scale: canvas px per CSS px.
 * creaseStrength: 1 for the full unfolded look.
 */
export function bakeSheet(w: number, h: number, field: CreaseField, scale: number, seed = 3) {
  const cw = Math.max(1, Math.round(w * scale)), ch = Math.max(1, Math.round(h * scale));
  const canvas = document.createElement('canvas');
  canvas.width = cw; canvas.height = ch;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(cw, ch);
  const d = img.data;
  const noise = valueNoise(seed);

  // heights on the pixel grid (one extra row/col for the slope)
  const hgt = new Float32Array((cw + 1) * (ch + 1));
  for (let y = 0; y <= ch; y++) for (let x = 0; x <= cw; x++) {
    hgt[y * (cw + 1) + x] = field.heightAt(x / scale, y / scale);
  }

  const edge = Math.min(w, 900) * 0.09;
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const px = x / scale, py = y / scale;
      const i0 = y * (cw + 1) + x;
      const hx = (hgt[i0 + 1] - hgt[i0]) * scale;
      const hy = (hgt[i0 + cw + 1] - hgt[i0]) * scale;
      const nl = Math.hypot(hx, hy, 1);
      const dot = (-hx * LIGHT[0] - hy * LIGHT[1] + LIGHT[2]) / nl;
      // facets catch the light differently; the fold lines themselves are a little darker
      const l = x > 0 ? hgt[i0 - 1] : hgt[i0 + 1];
      const u = y > 0 ? hgt[i0 - cw - 1] : hgt[i0 + cw + 1];
      const lap = Math.abs(hgt[i0 + 1] + l + hgt[i0 + cw + 1] + u - 4 * hgt[i0]) * scale * scale;
      const line = Math.min(1, lap * 3.2);
      const shade = (1 + (dot - LIGHT[2]) * 1.2) * (1 - line * 0.13);

      // yellowing: soft patches plus darker toward the page edges
      const tone = noise(px / 260, py / 260) * 0.6 + noise(px / 70 + 40, py / 70) * 0.4;
      const ex = Math.min(px, w - px), ey = Math.min(py, h - py);
      const edgeAge = Math.pow(1 - Math.min(1, Math.min(ex, ey) / edge), 2);
      const age = Math.min(1, 0.1 + tone * 0.3 + edgeAge * 0.6);

      const k = (y * cw + x) * 4;
      for (let c = 0; c < 3; c++) {
        const v = SHEET.base[c] + (SHEET.warm[c] - SHEET.base[c]) * age;
        d[k + c] = v * shade;
      }
      d[k + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  // foxing and stains on top
  ctx.save();
  ctx.scale(scale, scale);
  const r = rng(seed + 7);
  const spots = Math.round((w * h) / 9000);
  for (let i = 0; i < spots; i++) {
    const cluster = r() < 0.08;
    const x = r() * w, y = r() * h, rad = cluster ? 6 + r() * 16 : 0.6 + r() * 2.2;
    const a = cluster ? 0.02 + r() * 0.03 : 0.06 + r() * 0.12;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, `rgba(${SHEET.foxing.join(',')},${a})`);
    g.addColorStop(1, `rgba(${SHEET.foxing.join(',')},0)`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  return canvas;
}

/** A neutral grey grain + fiber tile, laid over paper with soft-light blending. */
export function grainTile(size = 256, seed = 5) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  const r = rng(seed);
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);
  ctx.lineCap = 'round';
  for (let i = 0; i < size * size / 260; i++) {
    const x = r() * size, y = r() * size, len = 3 + r() * 12, a = r() * Math.PI * 2;
    ctx.strokeStyle = r() > 0.5 ? `rgba(40,30,20,${0.08 + r() * 0.1})` : `rgba(255,255,255,${0.1 + r() * 0.15})`;
    ctx.lineWidth = 0.4 + r() * 0.5;
    for (const ox of [-size, 0, size]) for (const oy of [-size, 0, size]) {
      ctx.beginPath();
      ctx.moveTo(x + ox, y + oy);
      ctx.lineTo(x + ox + Math.cos(a) * len, y + oy + Math.sin(a) * len);
      ctx.stroke();
    }
  }
  const img = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (r() - 0.5) * 34;
    img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}
