// The only place prices are calculated for checkout. Everything comes from the CMS catalogue,
// never from the browser, so a price can't be altered before payment.
import catalog from './catalog.json' with { type: 'json' };

export class QuoteError extends Error {}

export function quote({ print, format, size, country }, cat = catalog) {
  const p = cat.prints[print];
  if (!p) throw new QuoteError('Unknown print');
  if (!p.formats.includes(format)) throw new QuoteError('Format not offered for this print');
  const f = cat.formats[format];
  if (!f) throw new QuoteError('Unknown format');
  const s = f.sizes.find((x) => x.size === size);
  if (!s) throw new QuoteError('Size not available');
  const cc = String(country || '').toUpperCase();
  const z = cat.zones.find((x) => x.countries.includes(cc));
  if (!z) throw new QuoteError('We do not ship to this country');
  const shipping = z[f.parcel];
  if (typeof shipping !== 'number') throw new QuoteError('No shipping rate for this destination');
  const cents = (v) => Math.round(v * 100);
  return {
    print, format, size: s.size, country: cc, code: s.code,
    title: p.title, title_cs: p.title_cs, image: p.image,
    formatName: f.name, formatName_cs: f.name_cs, parcel: f.parcel,
    zone: z.zone, price: s.price, shipping,
    priceCents: cents(s.price), shippingCents: cents(shipping), totalCents: cents(s.price) + cents(shipping),
  };
}
