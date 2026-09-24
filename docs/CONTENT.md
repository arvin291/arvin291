# Editing the website — a guide for non-developers

You can edit every page in a plain text editor (VS Code, Cursor, Notepad++). Save, then
`git add . && git commit -m "…" && git push` and the change is live in about a minute.

## Change text

Open the page in `site/` (for example `site/about.html`), find the sentence, change it, save.
Keep the tags (`<p>`, `</p>`, `<h2>`…) intact. Use `&amp;` for an ampersand.

## Menu, footer, phone numbers, address

These live in **one place**: `tools/partials/header.html` and `tools/partials/footer.html`.
Edit, then run `python3 tools/sync-partials.py` — it copies the block into every page.
The WhatsApp number also appears in the WhatsApp links on `index.html`, `products.html` and
`web.html` (search for `wa.me/`).

## How the pages fit together

The home page (`site/index.html`) is the whole site in one scroll. Each section has an `id`
(`home`, `products`, `solutions`, `web`, `alliances`, `company`, `contact`) and the attribute
`data-spy`; the menu links point at `/#<id>`, the desktop menu underlines the section in view,
and on phones the pill at the top right names it. To add a section: give it an `id` and
`data-spy`, and add a matching link with `data-section="<id>"` in `tools/partials/header.html`.

The home sections are short summaries. The detail lives on one page only: the full catalogue on
`products.html`, practice details on `solutions.html`, and so on. Do not copy a block of text onto
both; link to it instead. The enquiry form and FAQ exist only in the home page's Contact section.

## Add or change a product row

1. In `site/products.html`, copy an existing `<tr …>…</tr>` block and edit:
   - `data-group` — one of `it`, `sec`, `av`, `power`, `net`, `work` (drives the filter chips)
   - `data-text` — lower-case words people might search (brands, synonyms)
   - the number, category name, tag, brands, and the button's `data-add` (a short id) and `data-label`.
2. Add the same item to `site/data/catalogue.json` (same id) so the future order page knows it.

## Add a page

Copy `site/web.html` to `site/newpage.html`. Change the `<title>`, description, canonical link
(`https://www.shalvitechnologies.com/newpage`), the heading and the content. Add a link in the
menu (`tools/partials/header.html`) or footer, run the sync tool, and add the URL to
`site/sitemap.xml`. Cloudflare serves it at `/newpage` (no `.html` in the address).

## Images

Put the master file in `brand/` and run `python3 tools/optimize-images.py` (needs
`pip install pillow`). It writes WebP and PNG versions at the sizes the pages use. Reference images
with `/assets/img/…` and always give them `width`, `height` and an `alt` text (empty `alt=""`
if decorative).

## Company facts to add when you have them

`site/about.html` has a "Company facts" card with a commented-out line for GSTIN, GeM seller ID
and Udyam/MSME number. Buyers look for these; add them as soon as they are to hand.

## Things to avoid

- Do not put customer names or project photos without written permission.
- Do not paste brand logos from the internet; the alliances page uses brand *names* on purpose.
- Do not commit passwords, API keys or `.wrangler/` — the `.gitignore` blocks the usual ones.
