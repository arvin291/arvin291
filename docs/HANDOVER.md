# Handover — Shalvi Technologies website

Last updated: 2026-10-04, after the hero redesign (cloud session "Website review", branch `claude/website-review-vlk42j`)

## Where the code lives

- GitHub: https://github.com/arvin291/arvin291
- Branches: `main` (what the owner deploys) and `claude/website-review-vlk42j` (where the cloud
  session pushes; merge it into `main` with `git pull origin claude/website-review-vlk42j`).
- Laptop folder: `D:\Util_Apps\New folder\Shalvi_Tech` (on `main`).
- Live site: https://www.shalvitechnologies.com — Cloudflare Pages project `shalvi-technologies`.

## How to publish (from the laptop)

```
cd "D:\Util_Apps\New folder\Shalvi_Tech"
git pull origin claude/website-review-vlk42j
git push
npx wrangler pages deploy --branch main --commit-dirty=true
```

## What is built (all on the branch)

- One-scroll home (`site/index.html`): sections Home, Products, Solutions, Web services,
  Alliances, Company, Contact (enquiry form + FAQ). Detail pages: products, solutions, web,
  alliances, about, privacy, 404. `/contact` redirects to `/#contact` (`site/_redirects`).
- Desktop menu underlines the section in view; phones/tablets show the section name in a gold
  pill at top right that opens the menu (`site/assets/js/site.js`, section 3).
- Ask Shalvi helper, bottom right (`site/assets/js/desk.js`): canned answers, no AI, no server.
- WhatsApp + Facebook/email capsule, bottom left (footer partial). Always visible.
- Footer credit "Designed and maintained by tarkai.ai".
- Enquiry form posts to `functions/api/enquiry.js` (Cloudflare Pages Function, Resend email).
  Not switched on yet: needs a Resend account and `npx wrangler pages secret put RESEND_API_KEY`.
  Until then the form offers email app / WhatsApp / call. Steps: `docs/DEPLOY.md` section 2.
- Shared header/footer/icons: edit `tools/partials/*.html`, then `python3 tools/sync-partials.py`.

## Latest change

- **Hero redesign done** (2026-10-04): tech-style home hero in `site/index.html` (section
  `id="home"`, class `hero--home`) with status badge, gradient headline, typewriter line
  (`data-rotate`, code in `site.js` "hero: typewriter line"), interactive SVG system map
  (emblem hub + 6 clickable practice nodes, animated data lines), brand marquee and glass stat
  cards. Styles: the "Home hero — tech look" block at the end of `site/assets/css/site.css`.
  Motion stops under reduced-motion. Tested at 1440/1024/390/320 px, html-validate and axe clean.
  Pushed to the branch; the owner still needs to merge into `main` and deploy.

## Testing recipe used so far

- Local Cloudflare emulator: `npx wrangler pages dev --port 8820` (runs _redirects, _headers, functions).
- HTML: `npx html-validate@8 site/*.html` (config used: recommended, with no-inline-style,
  require-sri, long-title, attr-quotes, no-trailing-whitespace, svg-focusable, text-content off).
- Accessibility: axe-core via Playwright at 1440 and 390 px; target 0 violations.

## Questions only the owner can answer (still open)

- Does `info@shalvitechnologies.com` exist and who reads it? (Profile lists only the Gmail.)
- Are cyber security software, forensic systems, drones and web services really offered?
- GSTIN, GeM seller ID, Udyam number for the Company facts card (`site/about.html`).
- Is the raw profile deck OK as the public PDF (skills chart, Gmail, "Ahahamau" typo)?
- Brand spellings "Medline" / "FusionKraft" (logos) vs "Mediline" / "Fusion Craft" (deck captions).
- Office hours to publish.

## Security follow-ups for the owner

- Public GitHub history contains the old upload (Hostinger FTP host/username, Cloudflare account
  id; no password). Enable Hostinger 2FA, change the FTP password, consider making the repo private.
- The public `arvin291/arvin` repo has a Roboflow API key in a notebook: revoke it in Roboflow.
