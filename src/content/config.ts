import { defineCollection, z } from 'astro:content';
const journal = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    author: z.enum(['VZ','MR']).default('VZ'),
    cover: z.string().optional(),
    excerpt: z.string().optional(),
    category: z.string().default('Journal'),
    hero: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});
const galleries = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    title_cs: z.string().optional(),
    side: z.enum(['people','ravique']),
    intro: z.string().default(''),
    intro_cs: z.string().optional(),
    essay: z.string().optional(),
    essay_cs: z.string().optional(),
    splitAfter: z.number().optional(),
    images: z.array(z.object({ src: z.string(), alt: z.string().default('') })),
  }),
});
const series = defineCollection({
  type: 'data',
  schema: z.object({
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
  }),
});
const prints = defineCollection({
  type: 'data',
  schema: z.object({
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
  }),
});
const printshop = defineCollection({
  type: 'data',
  schema: z.object({
    intro: z.string().default(''),
    intro_cs: z.string().optional(),
    shipping: z.string().default(''),
    shipping_cs: z.string().optional(),
    etsy_url: z.string().optional(),
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
  }),
});
export const collections = { journal, galleries, series, prints, printshop };
