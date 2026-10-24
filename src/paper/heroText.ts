import { profile } from '../data/content';
import { FONTS } from '../fonts';

// The words printed on the sheet's first screen. Drawn with canvas in both places
// (the 3D intro's texture and the page itself) so they line up exactly.

export const INK = '#2B2724';
export const INK_SOFT = '#4A423A';

export async function loadHeroFonts() {
  try {
    await Promise.all([
      document.fonts.load(`100px "${FONTS.script}"`),
      document.fonts.load(`20px "${FONTS.caps}"`),
      document.fonts.load(`${FONTS.tagline.style} ${FONTS.tagline.weight} 20px "${FONTS.tagline.family}"`),
      document.fonts.load(`20px "${FONTS.type}"`),
    ]);
  } catch { /* draw with fallbacks */ }
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

/** Draws in CSS px; scale the context before calling for a bigger canvas. */
export function drawHero(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const unit = Math.min(W, H * 1.1);
  const cx = W / 2;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = 0.92; // printed ink, not pure colour

  ctx.fillStyle = INK;
  ctx.font = `${Math.max(11, unit * 0.022)}px "${FONTS.caps}", Georgia, serif`;
  ctx.letterSpacing = `${unit * 0.008}px`;
  ctx.fillText('PORTFOLIO  ·  MMXXVI', cx, H * 0.27);
  ctx.letterSpacing = '0px';

  ctx.fillStyle = INK;
  ctx.font = `${unit * 0.2 * FONTS.scale}px "${FONTS.script}", cursive`;
  ctx.fillText(profile.first, cx - unit * 0.07, H * 0.4);
  ctx.fillText(profile.last, cx + unit * 0.07, H * 0.4 + unit * 0.15);

  ctx.fillStyle = INK;
  const tagSize = Math.max(16, unit * 0.028);
  ctx.font = `${FONTS.tagline.style} ${FONTS.tagline.weight} ${tagSize}px "${FONTS.tagline.family}", Georgia, serif`;
  const lines = wrap(ctx, profile.tagline, Math.min(W - 48, unit * 0.62));
  const ty = H * 0.4 + unit * 0.27;
  lines.forEach((l, i) => ctx.fillText(l, cx, ty + i * tagSize * 1.6));

  ctx.font = `${Math.max(11.5, unit * 0.017)}px "${FONTS.type}", "Courier New", monospace`;
  ctx.fillStyle = INK_SOFT;
  const capLines = wrap(ctx, profile.caption, W - 48);
  const cy = ty + lines.length * tagSize * 1.6 + unit * 0.03;
  capLines.forEach((l, i) => ctx.fillText(l, cx, cy + i * unit * 0.03));
  ctx.restore();
  return cy + capLines.length * unit * 0.03; // bottom of the printed block, in px
}
