# Zavatsky Photography — Astro + Sveltia CMS

The site is now an Astro project. The bespoke pages (home, People, Ravique, About, Privacy)
are served as-is; the **Journal** and the **gallery photo sets** are content the CMS edits.

## How it deploys now (important change)
Before, Netlify served your files directly. Now Netlify **builds** the site:
commit -> Netlify runs `npm run build` -> redeploys. This applies to your commits AND the
CMS's commits. The build settings are in `netlify.toml` (`npm run build`, publish `dist`,
Node 20), so on the first deploy of this version just confirm in Netlify that the build
command is `npm run build` and the publish directory is `dist`. After that it's automatic.

## One-time CMS setup (so /admin works)
The CMS lives at `yourdomain/admin`. It needs to log you in with GitHub. Two ways:

### Recommended: Sveltia + a free Cloudflare Worker (best editor)
1. **GitHub OAuth app:** GitHub -> Settings -> Developer settings -> OAuth Apps -> New.
   Homepage `https://zavatsky.photo`; Authorization callback `https://YOUR-WORKER.workers.dev/callback`.
   Save, copy the Client ID, generate a Client Secret.
2. **Deploy the auth worker:** take `github.com/sveltia/sveltia-cms-auth`, deploy it to
   Cloudflare Workers (free). Set its variables `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`,
   and `ALLOWED_DOMAINS = zavatsky.photo`. Copy the Worker URL.
3. **Fill `public/admin/config.yml`:** set `repo: OWNER/REPO` (your GitHub repo) and
   `base_url:` to the Worker URL. Commit. Then open `/admin` and log in with GitHub.

### Simplest: no Cloudflare (Decap + Netlify's own login)
1. In `public/admin/index.html` swap the one script line for Decap:
   `<script src="https://unpkg.com/decap-cms@^3/dist/decap-cms.js"></script>`
2. In `public/admin/config.yml` set `repo: OWNER/REPO` and **delete** the `base_url:` line.
3. GitHub OAuth app as above, but callback `https://api.netlify.com/auth/done`.
4. Netlify -> Site configuration -> Access & security -> OAuth -> Install provider -> GitHub,
   paste the Client ID + Secret. Open `/admin` and log in.

## Using the CMS
- **Journal:** "New Post", fill title/date/author/cover/body, Publish. It appears after the
  build (~1 min). "Author voice" (VZ/MR) is just a label for now. English only.
- **Galleries:** open a gallery, drag photos to reorder, add via the Photos list (uploads commit
  to the repo), set alt text, remove what you don't want. The justified layout and aspect ratios
  are worked out automatically at build, so you never set sizes.

## Good to know
- **Images** currently live in the repo (`public/images`). Moving them to Cloudinary is the next
  step; after that the CMS can upload straight there and the repo slims down.
- **Gallery intro text** (the title/statement on each gallery page) is still in code for now, to
  keep the editor simple. Easy to make editable later if you want.
- **Analytics** is still the `G-XXXXXXXXXX` placeholder on the static pages — add the real GA4 ID
  before launch.
- To change **layout or design**, that's code (ask me or a developer) — the CMS only handles content.

## Local preview (optional)
`npm install` then `npm run dev` -> http://localhost:4321
