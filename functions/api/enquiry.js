/**
 * POST /api/enquiry  — receives the enquiry form and emails it to the office.
 * GET  /api/enquiry  — { ok, configured } so the page can adapt when email is not set up yet.
 *
 * Runs as a Cloudflare Pages Function. No database, no cookies.
 * Email is sent through Resend (https://resend.com).
 *
 * Configuration (see docs/DEPLOY.md):
 *   ENQUIRY_TO, ENQUIRY_FROM   plain values in wrangler.toml [vars]
 *   RESEND_API_KEY             secret:  npx wrangler pages secret put RESEND_API_KEY
 *   TURNSTILE_SECRET           optional secret, only after the Turnstile widget is on the page
 *
 * Until RESEND_API_KEY is set the endpoint answers 503 { error: "not_configured" } and the page
 * offers "open in email app / WhatsApp / call" instead, so no enquiry is lost.
 * Requests without JavaScript (plain form POST) are answered with a redirect back to the page.
 */

const MAX_BYTES = 20000;
const MAX = { name: 120, org: 160, email: 200, phone: 40, interest: 120, message: 4000, items: 2000 };

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

// one line: no control characters at all, whitespace collapsed (safe for the Subject header)
function line(v, max) {
  if (typeof v !== "string") return "";
  return v.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}
// multi-line block: keeps line breaks and tabs, drops other control characters
function block(v, max) {
  if (typeof v !== "string") return "";
  return v.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max);
}

function isConfigured(env) {
  return Boolean(env.RESEND_API_KEY && env.ENQUIRY_TO && env.ENQUIRY_FROM);
}

function wantsJson(request) {
  return (request.headers.get("accept") || "").includes("application/json");
}

// answer a plain (no-JavaScript) form post with a redirect back to the contact section
function reply(request, body, status) {
  if (wantsJson(request)) return json(body, status);
  const url = new URL("/", request.url);
  if (body.ok) url.searchParams.set("sent", body.ref || "ST");
  else url.searchParams.set("error", body.error || "failed");
  url.hash = "contact";
  return Response.redirect(url.toString(), 303);
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
  const len = Number(request.headers.get("content-length") || 0);
  if (len > MAX_BYTES) return reply(request, { ok: false, error: "too_large" }, 413);

  let raw;
  try { raw = await readBody(request); } catch (e) { raw = null; }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return reply(request, { ok: false, error: "bad_request" }, 400);

  // Honeypot: real visitors never fill this field. Answer as if accepted so bots stop retrying.
  if (line(raw.website, 50)) return reply(request, { ok: true, ref: "ST-OK" }, 200);

  const d = {
    name: line(raw.name, MAX.name),
    org: line(raw.org, MAX.org),
    email: line(raw.email, MAX.email),
    phone: line(raw.phone, MAX.phone),
    interest: line(raw.interest, MAX.interest),
    message: block(raw.message, MAX.message),
    items: block(raw.items, MAX.items),
  };

  const errors = {};
  if (!d.name) errors.name = "Please enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) errors.email = "Enter a valid email address.";
  if (d.phone && !/^[+\d][\d\s\-()]{6,}$/.test(d.phone)) errors.phone = "Enter a valid phone number.";
  if (!d.message) errors.message = "Please describe your requirement.";
  if (Object.keys(errors).length) return reply(request, { ok: false, error: "validation", errors }, 400);

  if (env.TURNSTILE_SECRET) {
    let passed = false;
    try { passed = await verifyTurnstile(env.TURNSTILE_SECRET, raw["cf-turnstile-response"], request.headers.get("CF-Connecting-IP")); } catch (e) { passed = false; }
    if (!passed) return reply(request, { ok: false, error: "turnstile" }, 403);
  }

  if (!isConfigured(env)) return reply(request, { ok: false, error: "not_configured" }, 503);

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
    d.items ? `\nEnquiry list:\n${d.items}` : "",
    "",
    "Requirement:",
    d.message,
    "",
    `— Sent from the website enquiry form (${request.headers.get("CF-IPCountry") || "country n/a"})`,
  ].join("\n");

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env.ENQUIRY_FROM,
        to: String(env.ENQUIRY_TO).split(",").map((s) => s.trim()).filter(Boolean),
        reply_to: d.email,
        subject: `[${ref}] Enquiry: ${d.interest || "General"} — ${d.name}${d.org ? " (" + d.org + ")" : ""}`.slice(0, 200),
        text,
      }),
    });
    if (!r.ok) {
      console.error("resend_failed", r.status, await r.text().catch(() => ""));
      return reply(request, { ok: false, error: "send_failed" }, 502);
    }
  } catch (e) {
    console.error("resend_unreachable", String(e));
    return reply(request, { ok: false, error: "send_failed" }, 502);
  }
  return reply(request, { ok: true, ref }, 200);
}
