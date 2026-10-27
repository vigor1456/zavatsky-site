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
export const collections = { journal, galleries, series };
