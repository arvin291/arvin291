/**
 * POST /api/enquiry  — receives the contact form and emails it to the company.
 * GET  /api/enquiry  — { ok, configured } so the page can adapt when email is not set up yet.
 *
 * Runs as a Cloudflare Pages Function. No database, no cookies.
 * Email is sent through Resend (https://resend.com — free tier is enough for enquiries).
 *
 * Set these in Cloudflare Pages → Settings → Environment variables (Production):
 *   RESEND_API_KEY   re_xxxxxxxx            (Resend → API Keys)
 *   ENQUIRY_TO       info@shalvitechnologies.com,shalvitechnologieslko@gmail.com   (comma separated)
 *   ENQUIRY_FROM     "Shalvi Website <enquiry@shalvitechnologies.com>"  (domain must be verified in Resend)
 * Optional spam protection (Cloudflare Turnstile — free):
 *   TURNSTILE_SECRET 0x4AAAA...   and add the widget site-key to site/contact.html (see docs/DEPLOY.md)
 *
 * Until these are set the endpoint answers 503 { error: "not_configured" } and the page
 * offers the visitor "open in email app / WhatsApp / call" instead — no enquiry is lost.
 */

const MAX = { name: 120, org: 160, email: 200, phone: 40, interest: 120, message: 4000, items: 2000 };

function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...extra },
  });
}

function clean(v, max) {
  return String(v == null ? "" : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max);
}

function isConfigured(env) {
  return Boolean(env.RESEND_API_KEY && env.ENQUIRY_TO && env.ENQUIRY_FROM);
}

async function readBody(request) {
  const ct = request.headers.get("content-type") || "";
  if (ct.includes("application/json")) return await request.json();
  const fd = await request.formData();
  const out = {};
  for (const [k, v] of fd.entries()) out[k] = typeof v === "string" ? v : "";
  return out;
}

async function verifyTurnstile(secret, token, ip) {
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);
  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
  const j = await r.json().catch(() => ({}));
  return Boolean(j.success);
}

export async function onRequestGet({ env }) {
  return json({ ok: true, configured: isConfigured(env) });
}

export async function onRequestPost({ request, env }) {
  let raw;
  try { raw = await readBody(request); } catch (e) { return json({ ok: false, error: "bad_request" }, 400); }

  // Honeypot: real visitors never see/fill this field. Pretend success so bots stop retrying.
  if (clean(raw.website, 50)) return json({ ok: true, ref: "ST-OK" });

  const d = {
    name: clean(raw.name, MAX.name),
    org: clean(raw.org, MAX.org),
    email: clean(raw.email, MAX.email),
    phone: clean(raw.phone, MAX.phone),
    interest: clean(raw.interest, MAX.interest),
    message: clean(raw.message, MAX.message),
    items: clean(raw.items, MAX.items),
  };

  const errors = {};
  if (!d.name) errors.name = "Please enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) errors.email = "Enter a valid email address.";
  if (d.phone && !/^[+\d][\d\s\-()]{6,}$/.test(d.phone)) errors.phone = "Enter a valid phone number.";
  if (!d.message) errors.message = "Please describe your requirement.";
  if (Object.keys(errors).length) return json({ ok: false, error: "validation", errors }, 400);

  if (env.TURNSTILE_SECRET) {
    const ok = await verifyTurnstile(env.TURNSTILE_SECRET, raw["cf-turnstile-response"], request.headers.get("CF-Connecting-IP"));
    if (!ok) return json({ ok: false, error: "turnstile" }, 403);
  }

  if (!isConfigured(env)) return json({ ok: false, error: "not_configured" }, 503);

  const ref = "ST-" + Date.now().toString(36).toUpperCase();
  const when = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const text = [
    `New enquiry ${ref} — ${when} IST`,
    "",
    `Name:         ${d.name}`,
    `Organisation: ${d.org || "-"}`,
    `Email:        ${d.email}`,
    `Phone:        ${d.phone || "-"}`,
    `Interest:     ${d.interest || "-"}`,
    d.items ? `\nRequirement list:\n${d.items}` : "",
    "",
    "Message:",
    d.message,
    "",
    `— Sent from the website contact form (${request.headers.get("CF-Connecting-IP") || "ip n/a"}, ${request.headers.get("CF-IPCountry") || ""})`,
  ].join("\n");

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env.ENQUIRY_FROM,
      to: env.ENQUIRY_TO.split(",").map((s) => s.trim()).filter(Boolean),
      reply_to: d.email,
      subject: `[${ref}] Enquiry: ${d.interest || "General"} — ${d.name}${d.org ? " (" + d.org + ")" : ""}`,
      text,
    }),
  });

  if (!r.ok) {
    console.error("resend_failed", r.status, await r.text().catch(() => ""));
    return json({ ok: false, error: "send_failed" }, 502);
  }
  return json({ ok: true, ref });
}

export async function onRequest({ request }) {
  // Any other method
  if (request.method === "GET" || request.method === "POST") return undefined; // handled above
  return json({ ok: false, error: "method_not_allowed" }, 405, { Allow: "GET, POST" });
}
