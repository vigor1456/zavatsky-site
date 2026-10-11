# Zavatsky Photography — static site bundle

Two identities, one site: **Vadim Zavatsky** (portraits, editorial, series) and
**Maximilian Ravique** (landscape, street, architecture, studies), plus a shared Journal.

## What's in here
- 16 HTML pages (homepage, two landings, galleries, series, About, Privacy, Journal + sample post)
- `images/` — 97 photos (~35 MB), all at 2048px. Temporary: these move to Cloudinary at step 5.
- All links are relative, so the site works as-is.

## Placeholders to replace at launch
- **Google Analytics:** every page has `G-XXXXXXXXXX`. Make a NEW GA4 property (do not reuse the
  Squarespace one), then find-and-replace the ID across all files. GA stays blocked until a visitor
  clicks Accept on the cookie banner.
- **Contact form:** the footer email/phone/WhatsApp links work now. A real form (Netlify Forms or
  Formspree) is step 7.
- **Fonts:** currently Google Fonts via CDN. Self-hosting is a launch-polish step.

## Deploy (recommended order)

**0. Quick look (optional, 30 sec):** drag this whole folder onto https://app.netlify.com/drop
   — instant live preview on a temp URL. No GitHub, no CMS yet.

**1. GitHub repo:** create a repo, upload these files.
   This bundle has ~114 files, which is over GitHub's 100-file browser-upload limit, so either:
   - use **GitHub Desktop** (easiest — drag the folder, commit, push), or
   - in the browser, upload the root `.html` files + `README.md` first, then open the repo's
     "Add file → Upload" again and drag the `images/` folder on its own.

**2. Netlify:** "Add new site → Import from Git" → pick the repo. No build command needed
   (publish directory = root). Site goes live on a `*.netlify.app` address.

**3. Domain:** add `zavatsky.photo` in Netlify (Domain settings), point the registrar's
   nameservers/records as Netlify shows. Add `.cz` and `.eu` as redirects to `.photo`.

**4. GA4:** create the property, replace `G-XXXXXXXXXX` everywhere, redeploy.

**5. Cloudinary:** upload `images/` to Cloudinary, swap the `src="images/..."` references for
   Cloudinary URLs (with `f_auto,q_auto`), then the repo images can be deleted to slim the repo.

**6. Decap CMS:** add `/admin` (config for galleries + journal, GitHub login) so edits happen
   in-browser and auto-deploy.

**7. Polish:** wire the contact form, self-host fonts, confirm the consent banner on every page,
   then retire Squarespace.
