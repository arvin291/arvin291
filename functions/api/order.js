/**
 * /api/order — reserved for the future ordering + payment flow.
 *
 * Planned design (see docs/ROADMAP.md):
 *   POST /api/order          → validate cart (site/data/catalogue.json ids + quantities),
 *                              create a Razorpay Order via REST (key id + secret from env),
 *                              return { orderId, amount, currency, key } for Razorpay Checkout on the page.
 *   POST /api/order/verify   → verify razorpay_signature with HMAC-SHA256 (Web Crypto), then
 *                              store the order (Cloudflare D1) and email confirmations.
 * Nothing is enabled yet; this endpoint simply says so.
 */
export async function onRequest() {
  return new Response(JSON.stringify({ ok: false, error: "ordering_not_enabled", message: "Online ordering is not enabled yet. Please use the enquiry form." }), {
    status: 501,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}
