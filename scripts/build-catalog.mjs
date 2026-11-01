// Builds the price catalogue used by the checkout function from the CMS data.
// Runs before every site build, so prices in checkout always match the Prints page.
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const shop = JSON.parse(readFileSync(join(root, 'src/content/printshop/settings.json'), 'utf8'));
const dir = join(root, 'src/content/prints');
const prints = {};
for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
  const d = JSON.parse(readFileSync(join(dir, f), 'utf8'));
  if (d.available === false) continue;
  prints[f.replace(/\.json$/, '')] = { title: d.title, title_cs: d.title_cs || d.title, formats: d.formats || [], image: d.mockups?.[0]?.src || null };
}
const formats = {};
for (const f of shop.formats || []) {
  formats[f.id] = { name: f.name, name_cs: f.name_cs || f.name, parcel: f.parcel || 'box',
    sizes: (f.sizes || []).filter((s) => typeof s.price === 'number').map((s) => ({ size: s.size, price: s.price, code: s.code || '' })) };
}
const zones = (shop.shipping_zones || []).map((z) => ({ zone: z.zone, zone_cs: z.zone_cs || z.zone, countries: z.countries || [], tube: z.tube, box: z.box }));
const catalog = { checkout_enabled: shop.checkout_enabled === true, prints, formats, zones };
mkdirSync(join(root, 'netlify/functions/_shared'), { recursive: true });
writeFileSync(join(root, 'netlify/functions/_shared/catalog.json'), JSON.stringify(catalog, null, 2));
console.log(`catalog: ${Object.keys(prints).length} prints, ${Object.keys(formats).length} formats, ${zones.length} zones, checkout ${catalog.checkout_enabled ? 'on' : 'off'}`);
