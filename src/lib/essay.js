// Turns a series into a paced photo essay: a list of blocks to render, in order.
// Rules (each photo's CMS "layout" overrides them):
//   - the first photo opens the page (upright: beside the title; horizontal: above it)
//   - two upright photos in a row become a pair; a single upright photo alternates right / left
//   - runs of horizontal photos cycle: side by side (needs two), full width, framed
//   - the last photo closes the page wide
//   - "pair" joins a photo with the next one (two uprights, two horizontals, or staggered mixed)
//   - text blocks appear after the photo number they name (default: the middle), grouped into one pause
const UP = (im) => im.ar < 0.87;

export function essayBlocks(imgs, texts = [], legacy = { en: [], cs: [] }) {
  const n = imgs.length;
  const mid = Math.ceil(n / 2);
  let tx = texts.filter((t) => t && t.text && t.text.trim());
  if (!tx.length && legacy.en.length) {
    tx = legacy.en.map((p, i) => ({ text: p, text_cs: legacy.cs[i], after: mid, align: i % 2 ? 'right' : 'left' }));
  }
  const at = (t) => Math.max(1, Math.round(t.after ?? mid)); // 0 or 1: right after the opening
  const out = [];
  // A text placed after a photo shown inside a pair or duo appears after the whole block.
  const pushPhoto = (b) => {
    out.push(b);
    const first = b.items[0].n, last = b.items[b.items.length - 1].n;
    const ts = tx.filter((t) => at(t) >= first && at(t) <= last);
    if (ts.length) out.push({ type: 'pause', texts: ts });
  };
  if (!n) return out;
  pushPhoto({ type: UP(imgs[0]) ? 'open-up' : 'open-wide', items: [{ ...imgs[0], n: 1 }] });

  let side = 'right', cycle = 0, prevWide = false;
  for (let i = 1; i < n; ) {
    if (!UP(imgs[i]) && !prevWide) cycle = 0; // a new run of horizontal photos starts the cycle again
    prevWide = !UP(imgs[i]);
    const im = { ...imgs[i], n: i + 1 }, nx = i + 1 < n ? { ...imgs[i + 1], n: i + 2 } : null;
    const lay = im.layout || 'auto';
    const isLast = i === n - 1;
    if (lay === 'pair' && nx) {
      const t = UP(im) && UP(nx) ? 'pair-up' : !UP(im) && !UP(nx) ? 'duo' : 'stagger';
      pushPhoto({ type: t, items: [im, nx] }); i += 2; continue;
    }
    if (lay === 'full') { pushPhoto({ type: 'full', items: [im] }); i++; continue; }
    if (lay === 'framed') { pushPhoto({ type: 'framed', items: [im] }); i++; continue; }
    if (lay === 'left' || lay === 'right') { pushPhoto({ type: 'solo', side: lay, items: [im] }); i++; continue; }
    if (isLast) { pushPhoto({ type: 'close', items: [im] }); i++; continue; }
    if (UP(im)) {
      if (nx && UP(nx) && (nx.layout || 'auto') === 'auto') { pushPhoto({ type: 'pair-up', items: [im, nx] }); i += 2; continue; }
      pushPhoto({ type: 'solo', side, items: [im] }); side = side === 'right' ? 'left' : 'right'; i++; continue;
    }
    // horizontal photo, automatic: cycle side by side, full width, framed
    const step = cycle % 3;
    const nxAuto = nx && !UP(nx) && (nx.layout || 'auto') === 'auto' && i + 1 < n - 1;
    if (step === 0 && nxAuto) { pushPhoto({ type: 'duo', items: [im, nx] }); i += 2; cycle++; continue; }
    if (step === 0) { pushPhoto({ type: 'framed', items: [im] }); i++; cycle++; continue; }
    pushPhoto({ type: step === 1 ? 'full' : 'framed', items: [im] }); i++; cycle++;
  }
  // texts placed after a number beyond the last photo go at the end
  const late = tx.filter((t) => at(t) > n);
  if (late.length) out.push({ type: 'pause', texts: late });
  return out;
}
