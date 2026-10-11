// Rewrites <img src="/images/..."> inside journal markdown to Netlify Image CDN
// responsive images. Skipped during `astro dev`.
const WIDTHS = [480, 800, 1200, 1600, 2048];
const cdn = (src, w) => `/.netlify/images?url=${encodeURIComponent(src)}&w=${w}&q=90`;
export default function rehypeCdn({ dev = false } = {}) {
  return (tree) => {
    const walk = (node) => {
      if (node.type === 'element' && node.tagName === 'img') {
        const p = node.properties || (node.properties = {});
        p.loading = 'lazy';
        p.decoding = 'async';
        const src = p.src;
        if (!dev && typeof src === 'string' && src.startsWith('/images/')) {
          p.src = cdn(src, 1200);
          p.srcSet = WIDTHS.map(w => `${cdn(src, w)} ${w}w`).join(', ');
          p.sizes = '(max-width: 760px) 100vw, 66ch';
        }
      }
      (node.children || []).forEach(walk);
    };
    walk(tree);
  };
}
