# Deploying and configuring the site

Everything below is done once. After that, every `git push` publishes the site.

## 1. Connect GitHub to Cloudflare Pages (recommended)

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Choose the repository `arvin291/arvin291` and the `main` branch.
3. Build settings: **Framework preset**: None · **Build command**: *(leave empty)* ·
   **Build output directory**: `site`
4. Save and deploy. The project name should be `shalvi-technologies` (it already exists if the
   site was first uploaded with Wrangler — in that case open that project → Settings → Builds &
   deployments → connect the repository there instead of creating a new project).
5. **Custom domains**: add `www.shalvitechnologies.com` and `shalvitechnologies.com`
   (Cloudflare adds the DNS records). Under the apex domain choose *redirect to www*, or add a
   **Bulk Redirect** so `shalvitechnologies.com/*` → `https://www.shalvitechnologies.com/$1` (301).
6. If you also own **shalvitechnologies.in**, add it to Cloudflare and create a Bulk Redirect
   `*.shalvitechnologies.in/*` → `https://www.shalvitechnologies.com/$1` so old links and search
   results move to the .com site.

### Alternative: upload from your computer

```
npx wrangler login
npx wrangler pages deploy        # reads wrangler.toml → uploads the site/ folder
```

## 2. Make the contact form deliver email

Without this step the form still works: it opens the visitor's email app or WhatsApp with the
message pre-filled. With it, enquiries arrive in your inbox with a reference number.

1. Create a free account at **resend.com**, add the domain `shalvitechnologies.com`
   (Resend shows two DNS records to add in Cloudflare → DNS), then create an **API key**.
2. Cloudflare → Workers & Pages → *shalvi-technologies* → **Settings** → **Environment variables**
   → **Production** → add:

   | Variable        | Value                                                              |
   |-----------------|--------------------------------------------------------------------|
   | `RESEND_API_KEY`| the key from Resend (starts with `re_`)                             |
   | `ENQUIRY_TO`    | `info@shalvitechnologies.com,shalvitechnologieslko@gmail.com`       |
   | `ENQUIRY_FROM`  | `Shalvi Website <enquiry@shalvitechnologies.com>`                   |

   Mark `RESEND_API_KEY` as *Encrypt*. Add the same three under **Preview** if you use preview deployments.
3. Redeploy (Deployments → Retry, or push any commit).
4. Test: open `https://www.shalvitechnologies.com/api/enquiry` — it must show
   `{"ok":true,"configured":true}`. Then send a test enquiry from the contact page.

### Optional: spam protection with Cloudflare Turnstile (free)

1. Cloudflare → **Turnstile** → Add site → domain `shalvitechnologies.com` → copy the **Site key** and **Secret key**.
2. Add `TURNSTILE_SECRET` = secret key to the environment variables (as above).
3. In `site/contact.html`, just above the *Send enquiry* button, add
   `<div class="cf-turnstile" data-sitekey="YOUR_SITE_KEY"></div>` and in the `<head>`
   `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>`.
4. In `site/_headers`, extend the CSP: add `https://challenges.cloudflare.com` to `script-src`
   and `frame-src`, and to `connect-src`.

## 3. Analytics without cookies

Workers & Pages → *shalvi-technologies* → **Metrics** shows requests. For visitor analytics turn
on **Web Analytics** (Cloudflare → Analytics & Logs → Web Analytics → Add a site → choose the Pages
project → *Automatic setup*). No code change is needed and no cookie banner is required.

## 4. Checks after the first deploy

- `https://www.shalvitechnologies.com/about` opens the Company page (clean URLs work) and
  `https://www.shalvitechnologies.com/about.html` redirects to it.
- `https://www.shalvitechnologies.com/SHARE/FTP-HOW-TO.txt` and
  `https://www.shalvitechnologies.com/.wrangler/cache/pages.json` return **404**
  (they were published by the old upload; the new structure never uploads them).
- `https://www.shalvitechnologies.com/does-not-exist` shows the branded 404 page.
- Share the home page on WhatsApp: the preview shows the emblem card (OG image).
- Google Search Console → add the property `https://www.shalvitechnologies.com/` and submit
  `https://www.shalvitechnologies.com/sitemap.xml`.
- Google Business Profile: make sure the website field points to the **.com** address.

## 5. Things the code cannot do for you

- **Rotate any credential that was ever committed.** The old upload contained Hostinger FTP
  details and a Cloudflare account id; the public GitHub history still has them. Change the
  Hostinger FTP password, and treat the Cloudflare account id as known.
- The public `arvin291/arvin` repository on the same GitHub account contains a Roboflow API key
  inside a notebook. Revoke it in Roboflow and remove it from the notebook.
