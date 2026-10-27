// Netlify Image CDN helpers. Images stay in public/images; Netlify resizes them
// and picks WebP/AVIF per browser. In `astro dev` the CDN doesn't exist, so the
// original file is used instead.
const DEV = import.meta.env.DEV;
export const WIDTHS = [480, 800, 1200, 1600, 2048];
export const HERO_WIDTHS = [640, 960, 1280, 1920, 2560, 3200, 3840];
export function cdn(src, w) {
  if (DEV || !src || !src.startsWith('/')) return src;
  return `/.netlify/images?url=${encodeURIComponent(src)}&w=${w}&q=90`;
}
export function srcset(src, widths = WIDTHS) {
  if (DEV || !src || !src.startsWith('/')) return undefined;
  return widths.map((w) => `${cdn(src, w)} ${w}w`).join(', ');
}
