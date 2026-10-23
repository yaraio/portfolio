import { useEffect, useState } from 'react';
import { CreaseField } from './creases';
import { bakeSheet, grainTile, SHEET } from './bake';
import { loadHeroFonts } from './heroText';
import { loadPhoto, bakeFromPhoto, heightFromLum } from './photo';

export type Sheet = {
  W: number;            // viewport width when baked (CSS px)
  H: number;            // viewport height = height of the first screen
  scale: number;        // bake canvas px per CSS px
  heightAt: (x: number, y: number) => number; // crease relief, used to fold the 3D sheet
  bake: HTMLCanvasElement;
  grain: HTMLCanvasElement;
  bakeURL: string;
  grainURL: string;
  photo: boolean;       // true when a real paper photo is in use
};

const EXTRA = 1600; // baked past the content, in case a section opens and the page grows

async function toURL(c: HTMLCanvasElement, type = 'image/png') {
  return new Promise<string>((res) => c.toBlob((b) => res(b ? URL.createObjectURL(b) : c.toDataURL()), type, 0.92));
}

async function build(pageHeight: number): Promise<Sheet> {
  const [, img] = await Promise.all([loadHeroFonts(), loadPhoto()]);
  const W = window.innerWidth, H = window.innerHeight;
  const grain = grainTile();

  if (img) {
    const { canvas, lum, cw, ch } = bakeFromPhoto(img, SHEET.base);
    const scale = cw / W; // photo spans the page width
    const heightAt = heightFromLum(lum, cw, ch, scale);
    const [bakeURL, grainURL] = await Promise.all([toURL(canvas, 'image/jpeg'), toURL(grain)]);
    return { W, H, scale, heightAt, bake: canvas, grain, bakeURL, grainURL, photo: true };
  }

  const total = Math.max(pageHeight, H) + EXTRA;
  const field = new CreaseField(Math.max(110, H * 0.22), 7);
  const scale = Math.min(0.75, 640 / W);
  const bake = bakeSheet(W, total, field, scale);
  const [bakeURL, grainURL] = await Promise.all([toURL(bake), toURL(grain)]);
  return { W, H, scale, heightAt: (x, y) => field.heightAt(x, y), bake, grain, bakeURL, grainURL, photo: false };
}

/** Bakes the sheet once the page has laid out, and again when the width changes a lot. */
export function useSheet() {
  const [sheet, setSheet] = useState<Sheet | null>(null);

  useEffect(() => {
    let alive = true;
    let lastW = window.innerWidth;
    const run = () => build(document.documentElement.scrollHeight).then((s) => { if (alive) setSheet(s); });
    requestAnimationFrame(() => requestAnimationFrame(run));

    let t = 0;
    const onResize = () => {
      clearTimeout(t);
      t = window.setTimeout(() => {
        if (Math.abs(window.innerWidth - lastW) < 40) return;
        lastW = window.innerWidth;
        run();
      }, 350);
    };
    window.addEventListener('resize', onResize);
    return () => { alive = false; window.removeEventListener('resize', onResize); };
  }, []);

  return sheet;
}
