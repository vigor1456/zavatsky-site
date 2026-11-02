import { defineCollection, z } from 'astro:content';

// The CMS saves a cleared optional field as null. Treat null exactly like "not filled in",
// so emptying an optional section never breaks the build. Required fields still have to be filled.
const stripNulls = (v) =>
  Array.isArray(v) ? v.filter((x) => x !== null).map(stripNulls)
  : v && typeof v === 'object' && !(v instanceof Date) ? Object.fromEntries(Object.entries(v).filter(([, x]) => x !== null).map(([k, x]) => [k, stripNulls(x)]))
  : v;
const clean = (schema) => z.preprocess(stripNulls, schema);
const journal = defineCollection({
  type: 'content',
  schema: clean(z.object({
    title: z.string(),
    date: z.date(),
    author: z.enum(['VZ','MR']).default('VZ'),
    cover: z.string().optional(),
    excerpt: z.string().optional(),
    category: z.string().default('Journal'),
    hero: z.string().optional(),
    draft: z.boolean().default(false),
  })),
});
const galleries = defineCollection({
  type: 'data',
  schema: clean(z.object({
    title: z.string(),
    title_cs: z.string().optional(),
    side: z.enum(['people','ravique']),
    intro: z.string().default(''),
    intro_cs: z.string().optional(),
    essay: z.string().optional(),
    essay_cs: z.string().optional(),
    splitAfter: z.number().optional(),
    images: z.array(z.object({ src: z.string(), alt: z.string().default('') })),
  })),
});
const series = defineCollection({
  type: 'data',
  schema: clean(z.object({
    title: z.string(),
    title_cs: z.string().optional(),
    order: z.number().default(100),
    date: z.coerce.date().optional(),
    cover: z.string(),
    cover_alt: z.string().default(''),
    card: z.string().default(''),
    card_cs: z.string().optional(),
    intro: z.string().default(''),
    intro_cs: z.string().optional(),
    essay: z.string().optional(),
    essay_cs: z.string().optional(),
    credits: z.array(z.object({
      role: z.string().optional(),
      role_cs: z.string().optional(),
      name: z.string(),
      url: z.string().optional(),
    })).default([]),
    splitAfter: z.number().optional(),
    images: z.array(z.object({ src: z.string(), alt: z.string().default('') })).default([]),
  })),
});
const prints = defineCollection({
  type: 'data',
  schema: clean(z.object({
    title: z.string(),
    title_cs: z.string().optional(),
    order: z.number().default(100),
    available: z.boolean().default(true),
    place: z.string().optional(),
    place_cs: z.string().optional(),
    year: z.number().optional(),
    story: z.string().default(''),
    story_cs: z.string().optional(),
    orientation: z.enum(['portrait', 'landscape', 'square']).default('landscape'),
    formats: z.array(z.string()).default([]),
    etsy: z.string().optional(),
    mockups: z.array(z.object({ src: z.string(), alt: z.string().default('') })).min(1),
  })),
});
const printshop = defineCollection({
  type: 'data',
  schema: clean(z.object({
    intro: z.string().default(''),
    intro_cs: z.string().optional(),
    shipping: z.string().default(''),
    shipping_cs: z.string().optional(),
    etsy_url: z.string().optional(),
    checkout_enabled: z.boolean().default(false),
    shipping_zones: z.array(z.object({
      zone: z.string(),
      zone_cs: z.string().optional(),
      countries: z.array(z.string()).default([]),
      tube: z.number().optional(),
      box: z.number().optional(),
    })).default([]),
    formats: z.array(z.object({
      id: z.string(),
      name: z.string(),
      name_cs: z.string().optional(),
      note: z.string().optional(),
      note_cs: z.string().optional(),
      parcel: z.enum(['tube', 'box']).default('box'),
      sizes: z.array(z.object({
        size: z.string(),
        price: z.number().optional(),
        code: z.string().optional(),
      })).default([]),
    })).default([]),
  })),
});
const T = z.object({ cs: z.string(), en: z.string() });
const TL = z.object({ cs: z.array(z.string()).default([]), en: z.array(z.string()).default([]) });
const img = z.object({ src: z.string(), alt: T.optional() });
const services = defineCollection({
  type: 'data',
  schema: clean(z.object({
    order: z.number().default(100),
    slug_cs: z.string(), slug_en: z.string(),
    title: T, h1: T, card: T, intro: T,
    seo_title: T, seo_description: T,
    price_czk: z.number().optional(), price_eur: z.number().optional(),
    example_label: T, includes: TL, price_note: T,
    timeline: z.array(z.object({ when: T, title: T, text: T })).default([]),
    hero: img, card_image: img.optional(),
    gallery: z.array(img).default([]),
    extra: z.object({ title: T, text: T, image: img.optional(), link_service: z.string().optional(), link_label: T.optional() }).optional(),
    faqs: z.array(z.object({ q: T, a: T })).default([]),
  })),
});
const reviews = defineCollection({
  type: 'data',
  schema: clean(z.object({
    quote: z.string(), author: z.string(), lang: z.enum(['cs', 'en']).default('cs'),
    on_hub: z.boolean().default(true), services: z.array(z.string()).default([]), order: z.number().default(100),
  })),
});
const commercial = defineCollection({
  type: 'data',
  schema: clean(z.object({
    hero: img, eyebrow: T, h1: T, lead: T,
    facts: z.array(z.object({ title: T, text: T })).default([]),
    trust: z.array(z.object({ title: T, text: T })).default([]),
    steps: z.array(z.object({ title: T, text: T })).default([]),
    faqs: z.array(z.object({ q: T, a: T })).default([]),
    seo_title: T, seo_description: T,
  })),
});
export const collections = { journal, galleries, series, prints, printshop, services, reviews, commercial };
