import { getCollection } from 'astro:content';
import { SITE } from '../lib/site.js';
const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export async function GET() {
  const posts = (await getCollection('journal', ({ data }) => !data.draft)).sort((a, b) => b.data.date - a.data.date);
  const items = posts.map((p) => `    <item><title>${esc(p.data.title)}</title><link>${SITE}/blog/${p.slug}</link><guid>${SITE}/blog/${p.slug}</guid><pubDate>${p.data.date.toUTCString()}</pubDate><description>${esc(p.data.excerpt)}</description></item>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>Journal | Vadim Zavatsky &amp; Maximilian Ravique</title><link>${SITE}/blog</link><description>Notes from behind the camera.</description><language>en</language>\n${items}\n</channel></rss>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
