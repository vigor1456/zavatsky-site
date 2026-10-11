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
    side: z.enum(['people','ravique']),
    splitAfter: z.number().optional(),
    images: z.array(z.object({ src: z.string(), alt: z.string().default('') })),
  }),
});
export const collections = { journal, galleries };
