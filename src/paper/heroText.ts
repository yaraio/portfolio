import { profile } from '../data/content';

// The words printed on the sheet's first screen. Drawn with canvas in both places
// (the 3D intro's texture and the page itself) so they line up exactly.

export const INK = '#2B2724';
export const INK_SOFT = '#4A423A';

export async function loadHeroFonts() {
  try {
    await Promise.all([
      document.fonts.load('100px "Luxurious Script"'),
      document.fonts.load('600 20px "Cinzel"'),
      document.fonts.load('italic 20px "Libre Baskerville"'),
      document.fonts.load('20px "Special Elite"'),
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
  ctx.font = `600 ${Math.max(11, unit * 0.022)}px Cinzel, Georgia, serif`;
  ctx.letterSpacing = `${unit * 0.008}px`;
  ctx.fillText('PORTFOLIO  ·  MMXXVI', cx, H * 0.27);
  ctx.letterSpacing = '0px';

  ctx.fillStyle = INK;
  ctx.font = `${unit * 0.2}px "Luxurious Script", cursive`;
  ctx.fillText(profile.first, cx - unit * 0.07, H * 0.4);
  ctx.fillText(profile.last, cx + unit * 0.07, H * 0.4 + unit * 0.15);

  ctx.fillStyle = INK;
  const tagSize = Math.max(14, unit * 0.024);
  ctx.font = `italic ${tagSize}px "Libre Baskerville", Georgia, serif`;
  const lines = wrap(ctx, profile.tagline, Math.min(W - 48, unit * 0.62));
  const ty = H * 0.4 + unit * 0.27;
  lines.forEach((l, i) => ctx.fillText(l, cx, ty + i * tagSize * 1.6));

  ctx.font = `${Math.max(11.5, unit * 0.017)}px "Special Elite", "Courier New", monospace`;
  ctx.fillStyle = INK_SOFT;
  const capLines = wrap(ctx, profile.caption, W - 48);
  const cy = ty + lines.length * tagSize * 1.6 + unit * 0.03;
  capLines.forEach((l, i) => ctx.fillText(l, cx, cy + i * unit * 0.03));
  ctx.restore();
  return cy + capLines.length * unit * 0.03; // bottom of the printed block, in px
}
