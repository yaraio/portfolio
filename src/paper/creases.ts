// One crease pattern for the whole site. The 3D intro folds its geometry along it,
// and the page background is shaded from it, so the sheet that unfolds is the page.
//
// Uncrumpled paper keeps its folds as straight crease lines of all lengths that
// cross and branch. Each crease is a segment: a shallow V (|distance to the line|),
// fading out along its length and away from it. Segments are scattered on a grid of
// cells so a point only has to look at nearby ones.

type Crease = { x: number; y: number; dx: number; dy: number; half: number; width: number; a: number };

function hash(i: number, j: number, k: number) {
  let n = (i * 374761393 + j * 668265263 + k * 2147483647) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  n ^= n >>> 16;
  return (n >>> 0) / 4294967296;
}

const PER_CELL = 3;

export class CreaseField {
  readonly size: number;   // cell size in px
  private seed: number;
  private cache = new Map<number, Crease[]>();

  /** size: spacing of creases in CSS px */
  constructor(size: number, seed = 1) {
    this.size = size;
    this.seed = seed;
  }

  private cell(i: number, j: number): Crease[] {
    const key = (i + 4096) * 8192 + (j + 4096);
    let list = this.cache.get(key);
    if (!list) {
      list = [];
      for (let k = 0; k < PER_CELL; k++) {
        const r = (n: number) => hash(i, j, this.seed + k * 16 + n);
        const ang = r(0) * Math.PI;
        const big = r(1) < 0.25; // a quarter are long, strong folds
        list.push({
          x: (i + r(2)) * this.size,
          y: (j + r(3)) * this.size,
          dx: Math.cos(ang), dy: Math.sin(ang),
          half: this.size * (big ? 1.1 + r(4) * 0.9 : 0.35 + r(4) * 0.6),
          width: this.size * (big ? 0.6 : 0.35),
          a: (r(5) < 0.5 ? -1 : 1) * (big ? 0.05 + r(6) * 0.04 : 0.02 + r(6) * 0.03),
        });
      }
      this.cache.set(key, list);
    }
    return list;
  }

  /** height in px at a point: shallow V-shaped folds, a few px of relief */
  heightAt(x: number, y: number) {
    const ci = Math.floor(x / this.size), cj = Math.floor(y / this.size);
    let h = 0;
    for (let di = -2; di <= 2; di++) for (let dj = -2; dj <= 2; dj++) {
      for (const c of this.cell(ci + di, cj + dj)) {
        const px = x - c.x, py = y - c.y;
        const along = (px * c.dx + py * c.dy) / c.half;
        if (along > 1 || along < -1) continue;
        const across = -px * c.dy + py * c.dx;
        const aw = across / c.width;
        if (aw > 2.5 || aw < -2.5) continue;
        const env = (1 - along * along) * (1 - along * along) * Math.exp(-aw * aw);
        h += c.a * Math.abs(across) * env;
      }
    }
    return h;
  }
}

// light comes from the top left, same as the intro's key light
export const LIGHT = (() => {
  const v = [-0.55, -0.6, 0.58];
  const l = Math.hypot(v[0], v[1], v[2]);
  return v.map((a) => a / l) as [number, number, number];
})();
