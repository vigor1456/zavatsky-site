// A plain-text guide to the site for AI assistants (llmstxt.org). Regenerated at every build.
import { getCollection } from 'astro:content';
import { SITE, VZ, MR } from '../lib/site.js';

export async function GET() {
  const gs = await getCollection('galleries');
  const ss = (await getCollection('series')).sort((a, b) => a.data.order - b.data.order);
  const posts = (await getCollection('journal', ({ data }) => !data.draft)).sort((a, b) => b.data.date - a.data.date);
  const line = (g) => `- [${g.data.title}](${SITE}/${g.id}): ${g.data.intro}`;
  const txt = `# Vadim Zavatsky & Maximilian Ravique

> Vadim Zavatsky is a photographer based in Prague, Czech Republic. He works under two names on one site: as Vadim Zavatsky for portrait, editorial and personal series, and as Maximilian Ravique (his pseudonym) for landscape, street and architecture photography. Archival prints are available on request.

Contact: ${VZ.email} (portraits and editorial), ${MR.email} (prints). Phone and WhatsApp: ${VZ.phone}. The site is in English and Czech.

## Portraits & People (Vadim Zavatsky)

- [Portraits & People](${SITE}/people): Portrait and editorial photography in Prague, made like a scene from a film.
${gs.filter((g) => g.data.side === 'people').map(line).join('\n')}
${ss.map((x) => `- [${x.data.title} (personal series)](${SITE}/${x.id}): ${x.data.intro}`).join('\n')}

## Maximilian Ravique

- [Maximilian Ravique](${SITE}/ravique): Landscape, street and architecture photography.
- [Prints](${SITE}/prints): Archival prints and framed canvases, made to order and shipped within the EU.
${gs.filter((g) => g.data.side === 'ravique').map(line).join('\n')}

## Journal

${posts.map((p) => `- [${p.data.title}](${SITE}/blog/${p.slug}): ${p.data.excerpt || ''}`).join('\n')}

## About

- [About](${SITE}/about): Background of the photographer.
- [Privacy policy](${SITE}/privacy)
`;
  return new Response(txt, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
