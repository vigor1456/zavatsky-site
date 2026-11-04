export const BUSINESS_ID = 'https://zavatsky.photo/sluzby#business';
// Interface wording for the commercial section, in Czech and English.
export const UI = {
  cs: {
    base: '/sluzby', other: 'en', services: 'Služby', how: 'Jak pracuji', reviews: 'Reference', faq: 'Časté dotazy',
    cta: 'Poptat termín', from: 'od', currency: (n) => `${n.toLocaleString('cs-CZ').replace(/\u00a0/g, ' ')} Kč`,
    detail: 'Detail služby', servicesLead: 'Každá služba má jasnou počáteční cenu. Přesnou nabídku vám pošlu do 24 hodin.',
    reviewsTitle: 'Co říkají klienti', reviewsNote: 'Recenze uvádím v jazyce, ve kterém je klienti napsali.',
    stepsTitle: 'Jak spolupráce probíhá', trustTitle: 'Na čem se můžete spolehnout', faqTitle: 'Časté dotazy',
    ctaTitle: 'Máte termín? Napište mi.', ctaLead: 'Nabídku pošlu do 24 hodin, obvykle ještě týž den.',
    timelineTitle: 'Co dostanete a kdy', galleryTitle: 'Ukázky', more: 'Další služby', breadcrumb: 'Služby',
    formTitle: 'Poptávka', formLead: 'Stačí jméno a e-mail. Zbytek doplníme spolu, odpovím do 24 hodin.', priceLabel: 'Cena',
    f: { other: 'Jiné', optional: 'nepovinné', name2: 'Jméno', message: 'Zpráva', messagePh: 'Například místo, čas a počet hostů', service: 'Služba', date: 'Datum', venue: 'Místo', venuePh: 'Adresa, hotel, město', details: 'Typ akce nebo zakázky', detailsPh: 'Konference, oslava, produktové focení…', length: 'Délka focení', lengths: ['Do 2 hodin', 'Půl dne (4 h)', 'Celý den', 'Zatím nevím'], guests: 'Počet hostů', guestsPh: 'např. 150', name: 'Jméno a firma', email: 'E-mail', phone: 'Telefon', note: 'Poznámka', notePh: 'Program, co je pro vás nejdůležitější, termín dodání', send: 'Odeslat poptávku', privacy: 'Údaje použiji jen k vyřízení poptávky.', privacyLink: 'Zásady ochrany osobních údajů' },
    thanks: 'Děkuji, poptávka dorazila.', thanksLead: 'Odpovím do 24 hodin, obvykle ještě týž den. Kopii poptávky najdete ve své e-mailové schránce.', back: 'Zpět na služby',
    viewer: { close: 'Zavřít', prev: 'Předchozí fotka', next: 'Další fotka', dialog: 'Prohlížeč fotografií' },
    lang: 'English', company: 'Third Place Labs s.r.o., IČO 24501212, Školská 660/3, Praha', cookie: 'Nastavení cookies', privacyFooter: 'Soukromí',
  },
  en: {
    base: '/en/services', other: 'cs', services: 'Services', how: 'How I work', reviews: 'Reviews', faq: 'FAQ',
    cta: 'Check availability', from: 'from', currency: (n) => `€${n.toLocaleString('en-GB')}`,
    detail: 'View service', servicesLead: 'Every service has a clear starting price. I’ll send you an exact quote within 24 hours.',
    reviewsTitle: 'What clients say', reviewsNote: 'Reviews are shown in the language the clients wrote them in.',
    stepsTitle: 'How it works', trustTitle: 'What you can rely on', faqTitle: 'Frequently asked questions',
    ctaTitle: 'Have a date? Get in touch.', ctaLead: 'I’ll send a quote within 24 hours, usually the same day.',
    timelineTitle: 'What you get, and when', galleryTitle: 'Examples', more: 'Other services', breadcrumb: 'Services',
    formTitle: 'Enquiry', formLead: 'Your name and email are enough. We’ll sort out the rest together; I reply within 24 hours.', priceLabel: 'Price',
    f: { other: 'Something else', optional: 'optional', name2: 'Name', message: 'Message', messagePh: 'For example the place, time and number of guests', service: 'Service', date: 'Date', venue: 'Location', venuePh: 'Address, hotel, city', details: 'Type of event or project', detailsPh: 'Conference, party, product shoot…', length: 'Length of the shoot', lengths: ['Up to 2 hours', 'Half day (4 h)', 'Full day', 'Not sure yet'], guests: 'Number of guests', guestsPh: 'e.g. 150', name: 'Name and company', email: 'Email', phone: 'Phone', note: 'Notes', notePh: 'Programme, what matters most to you, delivery date', send: 'Send enquiry', privacy: 'Your details are used only to handle your enquiry.', privacyLink: 'Privacy policy' },
    thanks: 'Thank you, your enquiry has arrived.', thanksLead: 'I’ll reply within 24 hours, usually the same day. A copy of your enquiry is in your inbox.', back: 'Back to services',
    viewer: { close: 'Close viewer', prev: 'Previous photo', next: 'Next photo', dialog: 'Photo viewer' },
    lang: 'Čeština', company: 'Third Place Labs s.r.o., company ID 24501212, Školská 660/3, Prague', cookie: 'Cookie settings', privacyFooter: 'Privacy',
  },
};
export const svcPath = (lang, s) => `${UI[lang].base}/${lang === 'cs' ? s.data.slug_cs : s.data.slug_en}`;

// Starting price shown in overviews (hub filmstrip and index, menu, other-services rows).
// A second offer only lowers it when neither offer has a unit ("per person", "for 2 hours"):
// that keeps add-ons like the headshot corner from looking like the service's own starting price.
export function listPrice(s, lang) {
  const d = s.data, cur = (x) => (lang === 'cs' ? x?.price_czk : x?.price_eur);
  const main = cur(d), alt = cur(d.offer2);
  const comparable = typeof alt === 'number' && !d.price_unit && !d.offer2?.price_unit;
  const amount = comparable && typeof main === 'number' ? Math.min(main, alt) : (typeof main === 'number' ? main : (comparable ? alt : null));
  return { amount, unit: amount === main ? d.price_unit?.[lang] || '' : '' };
}

// Czech typesetting rule: a one-letter preposition or conjunction (k, s, v, z, o, u, a, i) never ends a line.
// A non-breaking space ties it to the next word. Applied to every Czech text in the commercial section,
// including texts entered later in the CMS.
const czTie = (t) => t.replace(/(^|[\s(„“"])([ksvzouaiKSVZOUAI])\s+(?=\S)/g, '$1$2\u00A0');
export function cz(v, isCzech = false) {
  if (typeof v === 'string') return isCzech ? czTie(czTie(v)) : v;
  if (Array.isArray(v)) return v.map((x) => cz(x, isCzech));
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, cz(x, isCzech || k === 'cs')]));
  return v;
}

// Apply the Czech tie rule to the Czech interface texts too.
UI.cs = cz(UI.cs, true);
