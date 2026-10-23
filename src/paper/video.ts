// The filmed intro is used only when public/paper/unwrap.mp4 exists.
// The clip is stacked: the colour on top, its alpha matte below (keyed ahead of time
// from the green-screen footage), so it works with plain H.264 in every browser.
const base = `${import.meta.env.BASE_URL}paper/unwrap`;
export const VIDEO_URL = `${base}.mp4`;

/** mp4 where H.264 plays, the webm copy elsewhere */
export function videoSrc() {
  const v = document.createElement('video');
  return v.canPlayType('video/mp4; codecs="avc1.640028"') ? VIDEO_URL : `${base}.webm`;
}

/** true if the video file is there (dev servers answer missing files with index.html) */
export async function hasVideo() {
  try {
    const r = await fetch(VIDEO_URL, { method: 'HEAD' });
    return r.ok && (r.headers.get('content-type') ?? '').startsWith('video/');
  } catch {
    return false;
  }
}
