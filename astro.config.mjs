import { defineConfig } from 'astro/config';
// format:'file' -> pages emit as /portrait.html, /blog.html etc. so existing links keep working
export default defineConfig({
  site: 'https://zavatsky.photo',
  build: { format: 'file' },
  devToolbar: { enabled: false }
});
