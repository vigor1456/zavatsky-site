// Site-wide facts, links and structured data. One place to change contact details.
export const SITE = 'https://zavatsky.photo';

export const VZ = {
  name: 'Vadim Zavatsky',
  email: 'zavatsky.v@seznam.cz',
  phone: '+420 725 557 540',
  tel: '+420725557540',
  whatsapp: 'https://wa.me/420725557540',
  social: [
    { label: 'Instagram', href: 'https://www.instagram.com/zavatsky.photo' },
    { label: 'Facebook', href: 'https://www.facebook.com/zavatsky.photo/' },
    { label: '500px', href: 'https://500px.com/p/mrvq_zavatsky' },
  ],
};

export const MR = {
  name: 'Maximilian Ravique',
  email: 'maximilianravique@gmail.com',
  phone: VZ.phone,
  tel: VZ.tel,
  whatsapp: VZ.whatsapp,
  social: [
    { label: 'Instagram', href: 'https://www.instagram.com/m.ravique.ph/' },
    { label: 'Flickr', href: 'https://www.flickr.com/photos/197399261@N05/' },
    { label: 'YouPic', href: 'https://youpic.com/maximilian_ravique' },
  ],
};

export const COMPANY = 'Third Place Labs s.r.o., IČO 24501212, Školská 660/3, Nové Město, Praha';

export const abs = (path) => (path.startsWith('http') ? path : SITE + path);

export function personGraph() {
  return [
    {
      '@type': 'Person',
      '@id': SITE + '/#vadim',
      name: VZ.name,
      alternateName: MR.name,
      jobTitle: 'Photographer',
      description:
        'Photographer in Prague. Portrait, editorial and personal series as Vadim Zavatsky; landscape, street and architecture photography under the pseudonym Maximilian Ravique.',
      url: SITE + '/',
      image: SITE + '/images/about-01.jpg',
      email: 'mailto:' + VZ.email,
      telephone: VZ.tel,
      address: { '@type': 'PostalAddress', addressLocality: 'Prague', addressCountry: 'CZ' },
      knowsAbout: ['Portrait photography', 'Editorial photography', 'Landscape photography', 'Street photography', 'Architecture photography'],
      sameAs: [...VZ.social, ...MR.social].map((s) => s.href),
    },
    {
      '@type': 'WebSite',
      '@id': SITE + '/#website',
      url: SITE + '/',
      name: 'Vadim Zavatsky & Maximilian Ravique',
      inLanguage: ['en', 'cs'],
      publisher: { '@id': SITE + '/#vadim' },
    },
  ];
}

// Trim text to a search-friendly description length at a word boundary.
export function describe(text, max = 158) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return t.slice(0, t.lastIndexOf(' ', max - 1)).replace(/[,;:]$/, '') + '…';
}
