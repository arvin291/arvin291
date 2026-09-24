# Roadmap — from brochure site to ordering and payments

The site is built so that ordering can be added without a rewrite. This note describes the
intended path so whoever does the work (you, an agency, or an AI assistant) starts from the
same plan.

## Stage 0 — today

- Static pages on Cloudflare Pages, one Function for the enquiry form.
- `site/data/catalogue.json` holds the 20 line-card categories.
- Visitors build an **enquiry list** (stored in the browser) and send it with the form.
  This is the seed of a cart.

## Stage 1 — request-for-quote with items and quantities (no payment)

- Extend `catalogue.json` with *items* under each category: `sku`, `name`, `brand`, `unit`,
  `specs`, optional `image`.
- `products.html` gains an item list per category (rendered from the JSON by `site.js`, or
  pre-rendered by a small Python step in `tools/`).
- The enquiry list becomes `{sku, qty}`; the contact form shows a proper table.
- Store each request: add a **Cloudflare D1** database (`requests` table) and write from
  `functions/api/enquiry.js` before emailing. Gives you a history and a reference number that
  survives mailbox clean-ups.

## Stage 2 — ordering with online payment (corporate / campus buyers)

Government buyers will keep purchasing through GeM, so the order page targets corporate,
campus and small-office customers who pay directly.

1. **Policy pages first** — payment gateways in India require: Terms & Conditions, Privacy
   Policy (exists), Refund/Cancellation Policy, Shipping/Delivery Policy, and a Contact page
   with a physical address (exists). Add `terms.html`, `refunds.html`, `shipping.html`.
2. **Prices and tax** — add `price` (INR, ex-GST) and `gst` (18 for most IT hardware) per item in
   `catalogue.json`; show GST-inclusive totals. Prices are visible only for items you choose to
   sell online (`"sell": true`).
3. **Cart & checkout page** — `order.html`: cart table, buyer details (name, organisation,
   GSTIN optional, delivery address, phone, email), delivery method, summary.
4. **Payment gateway** — Razorpay is the usual choice in India (UPI, cards, net banking).
   - `functions/api/order.js` (already stubbed): validate the cart against `catalogue.json`,
     compute the total server-side, create a Razorpay Order via
     `POST https://api.razorpay.com/v1/orders` using `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`
     from environment variables, store the pending order in D1, return `{orderId, amount, key}`.
   - The page opens Razorpay Checkout with that order id.
   - `functions/api/order/verify.js`: verify `razorpay_signature` (HMAC-SHA256 with the key
     secret, available via Web Crypto in Workers), mark the order paid, email the buyer and the
     office, return the order number.
   - A Razorpay **webhook** endpoint (`functions/api/razorpay-webhook.js`) as the source of
     truth for payment status.
5. **Order management** — start with email + a D1 table; later a small admin page protected by
   **Cloudflare Access** (free for a few users) to view orders and update status.
6. **Invoices** — generate a PDF invoice with GST breakdown (a Worker with a small PDF library,
   or export to Tally/Busy which the company already sells).

## Stage 3 — accounts and repeat orders

- Buyer login by email one-time-code (no passwords), order history, saved addresses,
  re-order from a previous order, quotes converted to orders.

## Things that stay the same at every stage

- Same design system (`site.css`), same header/footer partials, same URL structure.
- Static pages remain static; only the API folder grows. Cloudflare Pages + Functions + D1 scale
  without servers to maintain.
- Every new page keeps the accessibility and performance rules used here: labelled fields,
  visible focus, contrast ≥ 4.5:1, images sized and compressed, no third-party trackers without
  a privacy update.
