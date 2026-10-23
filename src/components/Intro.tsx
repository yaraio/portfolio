import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { Sheet } from '../paper/useSheet';
import { drawHero } from '../paper/heroText';

// The opening: a loosely crumpled ball of paper unravels into the page itself.
//
// The sheet is a subdivided plane exactly the size of the screen. Every vertex has
// two homes: flat (where it sits on the page) and ball (the same point wrapped onto
// a lumpy sphere). Each frame blends between them; the middle opens first and the
// corners last. The folds come from the same CreaseField that shades the page
// background, and the texture is the page's own first screen, so when the sheet
// lands flat it is the site underneath and the overlay just goes away.

const T = { drop: 0.35, unfold: 1.9, settle: 0.45 };
const TOTAL = T.drop + T.unfold + T.settle;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

// crumple for the ball: soft-min of tilted planes around the sphere
type Cell = { c: THREE.Vector3; g: THREE.Vector3; h: number };
function makeCells(count: number, seed: number): Cell[] {
  const r = rng(seed);
  return Array.from({ length: count }, () => ({
    c: new THREE.Vector3(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1).normalize(),
    g: new THREE.Vector3(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1).multiplyScalar(0.9),
    h: r() * 2 - 1,
  }));
}
function facet(p: THREE.Vector3, cells: Cell[], tmp: THREE.Vector3) {
  let dmin = Infinity;
  const ds = cells.map((c) => { const d = p.distanceTo(c.c); if (d < dmin) dmin = d; return d; });
  let wsum = 0, h = 0;
  for (let i = 0; i < cells.length; i++) {
    const t = (ds[i] - dmin) / 0.022;
    if (t > 12) continue;
    const w = Math.exp(-t);
    wsum += w;
    h += w * (cells[i].h * 0.25 + tmp.copy(p).sub(cells[i].c).dot(cells[i].g));
  }
  return h / wsum;
}

function normalise(a: Float32Array) {
  let m = 0;
  for (const v of a) m += v;
  m /= a.length;
  let sd = 0;
  for (const v of a) sd += (v - m) * (v - m);
  sd = Math.sqrt(sd / a.length) || 1;
  for (let i = 0; i < a.length; i++) a[i] = (a[i] - m) / sd;
}

/** The page's first screen, as one canvas: baked paper, grain, then the printed words. */
function firstScreen(sheet: Sheet, px: number) {
  const { W, H } = sheet;
  const c = document.createElement('canvas');
  c.width = Math.round(W * px);
  c.height = Math.round(H * px);
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(sheet.bake, 0, 0, W * sheet.scale, H * sheet.scale, 0, 0, c.width, c.height);
  if (!sheet.photo) {
  ctx.save();
  ctx.globalCompositeOperation = 'soft-light';
  const pat = ctx.createPattern(sheet.grain, 'repeat')!;
  pat.setTransform(new DOMMatrix().scale(px));
  ctx.fillStyle = pat;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.restore();
  }
  ctx.scale(px, px);
  drawHero(ctx, W, H);
  return c;
}

export default function Intro({ sheet, onDone }: { sheet: Sheet | null; onDone: () => void }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);
  const doneRef = useRef(false);
  const finish = useRef(() => {});

  finish.current = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setGone(true);
    setTimeout(onDone, 260);
  };

  useEffect(() => {
    const skip = () => finish.current();
    window.addEventListener('keydown', skip);
    return () => window.removeEventListener('keydown', skip);
  }, []);

  useEffect(() => {
    if (!sheet) return;
    const mount = mountRef.current!;
    let raf = 0;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      finish.current();
      return;
    }
    const { W, H } = sheet;
    const dpr = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const fov = 30;
    const camera = new THREE.PerspectiveCamera(fov, W / H, 0.1, 50);
    camera.position.set(0, 0, 1 / Math.tan(THREE.MathUtils.degToRad(fov / 2))); // view height 2 at z=0

    const hemi = new THREE.HemisphereLight(0xfff6ea, 0x8a7358, 0.8);
    const key = new THREE.DirectionalLight(0xfff3e2, 2.6);
    key.position.set(-2.2, 2.4, 1.6);
    scene.add(hemi, key);

    // The sheet is exactly the screen: 2 units tall, aspect units wide.
    const aspect = W / H;
    const sheetW = 2 * aspect, sheetH = 2;
    const segX = Math.round(THREE.MathUtils.clamp(120 * Math.sqrt(aspect), 70, 170));
    const segY = Math.round(THREE.MathUtils.clamp(120 / Math.sqrt(aspect), 70, 170));
    const geo = new THREE.PlaneGeometry(sheetW, sheetH, segX, segY);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const count = pos.count;

    const flat = new Float32Array(count * 3);
    const ball = new Float32Array(count * 3);
    const fold = new Float32Array(count);   // the page's own creases, as height
    const ballK = new Float32Array(count);
    const delay = new Float32Array(count);
    const dirs = new Float32Array(count * 3);

    const cells = makeCells(150, 5);
    const tmp = new THREE.Vector3(), dir = new THREE.Vector3();
    const R = 0.4;

    for (let i = 0; i < count; i++) {
      const x = pos.getX(i), y = pos.getY(i);
      flat[i * 3] = x; flat[i * 3 + 1] = y;
      const u = x / (sheetW / 2), v = y / (sheetH / 2);

      // octahedral wrap: the square sheet covers the whole sphere, corners tucked behind
      let ox = u, oy = v;
      const oz = 1 - Math.abs(ox) - Math.abs(oy);
      if (oz < 0) {
        const tx = (1 - Math.abs(oy)) * Math.sign(ox || 1);
        const ty = (1 - Math.abs(ox)) * Math.sign(oy || 1);
        ox = tx; oy = ty;
      }
      dir.set(ox, oy, oz).normalize();
      dirs[i * 3] = dir.x; dirs[i * 3 + 1] = dir.y; dirs[i * 3 + 2] = dir.z;
      ballK[i] = facet(dir, cells, tmp);

      // page px for this vertex (y down on the page)
      const px = ((u + 1) / 2) * W, py = ((1 - v) / 2) * H;
      fold[i] = sheet.heightAt(px, py);
      delay[i] = Math.min(1, Math.hypot(u, v) / Math.SQRT2);
    }
    normalise(ballK);
    normalise(fold);
    for (let i = 0; i < count; i++) fold[i] = Math.max(-2.5, Math.min(2.5, fold[i])); // no spikes
    for (let i = 0; i < count; i++) {
      const rr = R * (1 + 0.17 * ballK[i] + 0.05 * fold[i]);
      ball[i * 3] = dirs[i * 3] * rr;
      ball[i * 3 + 1] = dirs[i * 3 + 1] * rr;
      ball[i * 3 + 2] = dirs[i * 3 + 2] * rr;
    }

    const texPx = Math.min(dpr, 2048 / Math.max(W, H));
    const tex = new THREE.CanvasTexture(firstScreen(sheet, texPx));
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    // lit while crumpled; by the end only the emissive copy of the texture shows,
    // which is exactly the page's colours
    const front = new THREE.MeshStandardMaterial({
      map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: 0,
      roughness: 0.95, metalness: 0, flatShading: true, side: THREE.FrontSide,
    });
    const back = new THREE.MeshStandardMaterial({ color: 0xe4ded2, roughness: 0.95, metalness: 0, flatShading: true, side: THREE.BackSide });
    const group = new THREE.Group();
    group.add(new THREE.Mesh(geo, front), new THREE.Mesh(geo, back));
    scene.add(group);

    const shadow = mount.querySelector<HTMLDivElement>('.intro__shadow')!;
    const lightKey = key.intensity, lightHemi = hemi.intensity;

    function frame(t: number) {
      const tDrop = clamp01(t / T.drop);
      const tUnfold = clamp01((t - T.drop) / T.unfold);
      const tSettle = clamp01((t - T.drop - T.unfold) / T.settle);

      for (let i = 0; i < count; i++) {
        const local = easeInOut(clamp01(tUnfold * 1.45 - delay[i] * 0.45)); // centre first, corners last
        const mid = 4 * local * (1 - local);
        const lift = Math.sin(Math.PI * local) * 0.22 * delay[i];            // edges peel toward you
        const crease = 0.11 * mid + 0.02 * local * (1 - easeOut(tSettle));    // folds relax flat
        const i3 = i * 3;
        pos.array[i3] = ball[i3] + (flat[i3] - ball[i3]) * local;
        pos.array[i3 + 1] = ball[i3 + 1] + (flat[i3 + 1] - ball[i3 + 1]) * local;
        pos.array[i3 + 2] = ball[i3 + 2] * (1 - local) + lift + fold[i] * crease;
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();

      const spin = 1 - easeOut(clamp01(tUnfold * 1.15));
      group.rotation.set(0.7 * spin, -1.5 * spin + 0.3 * (1 - tDrop), 0.4 * spin);
      group.scale.setScalar(0.72 + 0.28 * easeOut(tDrop));
      group.position.y = (1 - easeOut(tDrop)) * 0.25;

      // hand over from lit paper to the page's exact colours
      const glow = easeInOut(clamp01(tUnfold * 1.2 - 0.35 + tSettle));
      front.emissiveIntensity = 0.12 + 0.88 * glow;
      key.intensity = lightKey * (1 - glow);
      hemi.intensity = lightHemi * (1 - glow);

      shadow.style.opacity = String(0.6 * (1 - easeOut(tUnfold)));
      shadow.style.transform = `translate(-50%, -50%) scale(${0.4 + easeOut(tUnfold) * 0.9})`;
      renderer.render(scene, camera);
    }

    const freezeAt = new URLSearchParams(location.search).get('introAt'); // for checking single frames
    let t0 = 0;
    function loop(now: number) {
      if (!t0) t0 = now;
      const t = (now - t0) / 1000;
      frame(Math.min(t, TOTAL));
      if (t >= TOTAL) { finish.current(); return; }
      raf = requestAnimationFrame(loop);
    }
    if (freezeAt !== null) frame(Number(freezeAt));
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      geo.dispose(); tex.dispose(); front.dispose(); back.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [sheet]);

  return (
    <div className={`intro${gone ? ' intro--out' : ''}`} ref={mountRef} onClick={() => finish.current()} aria-hidden="true">
      <div className="intro__shadow" />
      <span className="intro__skip">tap to skip</span>
    </div>
  );
}
