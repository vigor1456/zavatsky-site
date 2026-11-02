// Numbered receipts (doklad o prodeji). Numbers are reserved atomically in Netlify Blobs,
// one sequence per year: 2026-0001, 2026-0002, … Test-mode orders use a separate store,
// so they never consume real numbers.
import { getStore } from '@netlify/blobs';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import regularB64 from './fonts/liberation-sans-regular.mjs';
import boldB64 from './fonts/liberation-sans-bold.mjs';

export function receiptStore(livemode) {
  if (globalThis.__receiptStore) return globalThis.__receiptStore; // used by tests
  return getStore({ name: livemode ? 'receipts' : 'receipts-test', consistency: 'strong' });
}

// Returns the receipt record for this checkout session, creating it (with the next number) only once,
// so a repeated Stripe notification never produces a second receipt.
export async function issueReceipt(store, sessionId, record) {
  const existing = await store.get(`session/${sessionId}`, { type: 'json' });
  if (existing) return existing;
  const year = record.year;
  for (let attempt = 0; attempt < 10; attempt++) {
    const cur = await store.getWithMetadata(`counter/${year}`, { type: 'json' });
    const next = (cur?.data?.n || 0) + 1;
    const res = cur
      ? await store.setJSON(`counter/${year}`, { n: next }, { onlyIfMatch: cur.etag })
      : await store.setJSON(`counter/${year}`, { n: next }, { onlyIfNew: true });
    if (!res.modified) continue; // someone else took this number a moment ago; try the next one
    const rec = { ...record, number: `${year}-${String(next).padStart(4, '0')}` };
    const claim = await store.setJSON(`session/${sessionId}`, rec, { onlyIfNew: true });
    if (!claim.modified) return await store.get(`session/${sessionId}`, { type: 'json' });
    await store.setJSON(`receipt/${rec.number}`, rec);
    return rec;
  }
  throw new Error('Could not reserve a receipt number');
}

const eur = (cents) => (cents / 100).toFixed(2).replace('.', ',') + ' EUR';
const fmtDate = (iso) => { const d = new Date(iso); return `${d.getUTCDate()}. ${d.getUTCMonth() + 1}. ${d.getUTCFullYear()}`; };

export async function receiptPdf(r) {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const reg = await pdf.embedFont(Buffer.from(regularB64, 'base64'), { subset: true });
  const bold = await pdf.embedFont(Buffer.from(boldB64, 'base64'), { subset: true });
  pdf.setTitle(`Doklad o prodeji ${r.number}`); pdf.setAuthor('Third Place Labs s.r.o.');
  const page = pdf.addPage([595.28, 841.89]); // A4
  const ink = rgb(0.1, 0.1, 0.1), grey = rgb(0.42, 0.42, 0.42), line = rgb(0.82, 0.82, 0.82);
  const L = 56, R = 539;
  let y = 780;
  const text = (t, x, yy, { f = reg, s = 10, c = ink } = {}) => page.drawText(String(t ?? ''), { x, y: yy, size: s, font: f, color: c });
  const right = (t, xr, yy, o = {}) => text(t, xr - (o.f || reg).widthOfTextAtSize(String(t), o.s || 10), yy, o);
  const hr = (yy) => page.drawLine({ start: { x: L, y: yy }, end: { x: R, y: yy }, thickness: 0.6, color: line });

  text('Doklad o prodeji / Receipt', L, y, { f: bold, s: 18 });
  right(`č. / No. ${r.number}`, R, y + 2, { f: bold, s: 12 });
  y -= 30;
  text('Datum vystavení / Date of issue', L, y, { s: 9, c: grey }); text(fmtDate(r.issuedAt), L + 190, y);
  y -= 15;
  text('Datum platby / Date of payment', L, y, { s: 9, c: grey }); text(fmtDate(r.paidAt), L + 190, y);
  y -= 15;
  text('Objednávka / Order', L, y, { s: 9, c: grey }); text(r.order, L + 190, y);
  y -= 26; hr(y); y -= 20;

  const col2 = 310;
  text('Prodávající / Seller', L, y, { s: 9, c: grey }); text('Kupující / Buyer', col2, y, { s: 9, c: grey });
  y -= 15;
  const seller = ['Third Place Labs s.r.o.', 'Školská 660/3, Nové Město', '110 00 Praha 1, Česká republika', 'IČO 24501212', 'Neplátce DPH / Not a VAT payer', 'Městský soud v Praze, C 442228'];
  const a = r.buyerAddress || {};
  const buyer = [r.buyerName, a.line1, a.line2, `${a.postal_code || ''} ${a.city || ''}`.trim(), a.country, r.buyerEmail].filter(Boolean);
  for (let i = 0; i < Math.max(seller.length, buyer.length); i++) {
    if (seller[i]) text(seller[i], L, y, { f: i === 0 ? bold : reg });
    if (buyer[i]) text(buyer[i], col2, y, { f: i === 0 ? bold : reg });
    y -= 14;
  }
  y -= 14; hr(y); y -= 20;

  text('Položka / Item', L, y, { s: 9, c: grey }); right('Množství / Qty', 420, y, { s: 9, c: grey }); right('Cena / Price', R, y, { s: 9, c: grey });
  y -= 18;
  text(r.item, L, y); right('1', 420, y); right(eur(r.priceCents), R, y);
  y -= 16;
  text(r.itemDetail, L, y, { s: 9, c: grey });
  y -= 18;
  text(`Doprava / Shipping (${r.shippingTo})`, L, y); right('1', 420, y); right(eur(r.shippingCents), R, y);
  y -= 22; hr(y); y -= 22;
  text('Celkem uhrazeno / Total paid', L, y, { f: bold, s: 12 }); right(eur(r.totalCents), R, y, { f: bold, s: 12 });
  y -= 30;
  text(`Způsob platby / Payment: ${r.paymentMethod}`, L, y, { s: 9, c: grey });
  y -= 13;
  text(`Platba / Payment ID: ${r.paymentId}`, L, y, { s: 9, c: grey });
  y -= 13;
  text('Prodávající není plátcem DPH. / The seller is not a VAT payer.', L, y, { s: 9, c: grey });
  y -= 13;
  text('Vystavil / Issued by: Third Place Labs s.r.o., zavatsky.photo', L, y, { s: 9, c: grey });
  return Buffer.from(await pdf.save());
}
