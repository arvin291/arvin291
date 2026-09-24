# Shalvi Technologies — website

Source for **www.shalvitechnologies.com**, the public site of Shalvi Technologies, Lucknow.
Static HTML + CSS + a little JavaScript, hosted on **Cloudflare Pages**, with one small
Cloudflare Function that emails the enquiry form to the office.

```
site/            ← the website. This folder, and only this folder, is published.
  index.html, about.html, products.html, solutions.html, web.html, alliances.html,
  contact.html, privacy.html, 404.html
  assets/css/site.css      design system (colours, layout, components)
  assets/js/site.js        menu, catalogue filters, enquiry list, contact form
  assets/img/              optimised images (WebP + PNG fallbacks, favicons, OG image)
  data/catalogue.json      the product line card as data (used by the enquiry list; the future order page grows from here)
  downloads/               company profile PDF
  _headers, _redirects     Cloudflare Pages headers (security, caching) and old-URL redirects
  robots.txt, sitemap.xml, site.webmanifest
functions/api/enquiry.js   POST /api/enquiry → emails the form (needs env vars, see docs/DEPLOY.md)
functions/api/order.js     placeholder for the future ordering / payment API (returns 501)
tools/partials/            header.html, footer.html, icons.html — shared by every page
tools/sync-partials.py     copies the partials into every page (run after editing a partial)
tools/optimize-images.py   regenerates the image set from brand/ masters
brand/                     master artwork and the original flyer / profile deck (never published)
docs/                      DEPLOY.md (hosting + email setup), CONTENT.md (how to edit), ROADMAP.md (order page, payments)
wrangler.toml              Cloudflare Pages config (publish directory = site)
```

## Editing content

1. Open the page in `site/` and change the text. Every page is plain HTML; keep the
   `<!-- @@header -->` … `<!-- @@/header -->` blocks alone — they are filled in by the sync tool.
2. If you change the **menu, footer or icons**, edit `tools/partials/*.html` and run
   `python3 tools/sync-partials.py`.
3. To add a product row, copy a `<tr>` in `site/products.html` and add the same item to
   `site/data/catalogue.json`. See `docs/CONTENT.md` for details.

## Running it on your computer

```
npx serve site          # then open http://localhost:3000
```
(`npx wrangler pages dev site` also runs the enquiry API locally.)

## Publishing

Push to GitHub. If the Cloudflare Pages project is connected to this repository it deploys
automatically (build command: none, output directory: `site`). Otherwise run
`npx wrangler pages deploy`. Full steps, including the email setup for the contact form, are
in **docs/DEPLOY.md**.

## Two-way sync with your laptop

```
git pull                      # GitHub → laptop, before you start editing
git add . && git commit -m "Update prices page" && git push    # laptop → GitHub
```
