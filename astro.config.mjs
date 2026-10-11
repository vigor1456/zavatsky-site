import { defineConfig } from 'astro/config';
import rehypeCdn from './src/lib/rehype-cdn.mjs';
const dev = process.argv.includes('dev');
// format:'file' -> pages emit as /portrait.html, /blog.html etc. so existing links keep working
export default defineConfig({
  site: 'https://zavatsky.photo',
  build: { format: 'file' },
  devToolbar: { enabled: false },
  markdown: { rehypePlugins: [[rehypeCdn, { dev }]] },
});
