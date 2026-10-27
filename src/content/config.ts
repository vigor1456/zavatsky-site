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
    kind: z.enum(['gallery','series']).default('gallery'),
    intro: z.string().default(''),
    intro_cs: z.string().optional(),
    essay: z.string().optional(),
    essay_cs: z.string().optional(),
    splitAfter: z.number().optional(),
    images: z.array(z.object({ src: z.string(), alt: z.string().default('') })),
  }),
});
export const collections = { journal, galleries };
