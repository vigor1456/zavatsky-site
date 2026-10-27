// Generated at every build: static pages, galleries, Journal and all published posts.
// Drafts and /admin are left out. Posts added or deleted in the CMS update automatically.
import { getCollection } from 'astro:content';
import { SITE } from '../lib/site.js';

const STATIC = ['/', '/people', '/ravique', '/about', '/blog', '/privacy'];

export async function GET() {
  const galleries = (await getCollection('galleries')).map((g) => ({ loc: `/${g.id}` }));
  const posts = (await getCollection('journal', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date - a.data.date)
    .map((p) => ({ loc: `/blog/${p.slug}`, lastmod: new Date(p.data.date).toISOString().slice(0, 10) }));
  const urls = [...STATIC.map((loc) => ({ loc })), ...galleries, ...posts];
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) => `  <url><loc>${SITE}${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n') +
    '\n</urlset>\n';
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
