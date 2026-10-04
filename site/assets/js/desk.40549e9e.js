/* "Ask Shalvi" — an automated helper that answers common questions from the company profile.
   It runs entirely in the visitor's browser: nothing typed here is sent to any server.
   It is not a live chat and not an AI; every answer below is written by the company.

   To change an answer: edit the `text` of a topic. To teach it a new question: add words to
   `keys` (single words match whole words; phrases match anywhere in the question). */
(function () {
  "use strict";
  if (document.getElementById("desk")) return;

  var ACTIONS = {
    call:      { href: "tel:+916307057085", label: "Call 63070 57085" },
    call2:     { href: "tel:+919794980001", label: "Call 97949 80001" },
    wa:        { href: "https://wa.me/916307057085?text=Hello%20Shalvi%20Technologies%2C%20I%20have%20a%20requirement.", label: "WhatsApp", blank: true },
    mail:      { href: "mailto:info@shalvitechnologies.com", label: "Email" },
    map:       { href: "https://maps.google.com/?q=Plot+67-68+Aranya+Estate+CG+City+Ahmamau+Sultanpur+Road+Lucknow+226002", label: "Directions", blank: true },
    enquire:   { href: "/#contact", label: "Enquiry form" },
    catalogue: { href: "/products", label: "Product catalogue" },
    solutions: { href: "/solutions", label: "Solutions" },
    web:       { href: "/web", label: "Web services" },
    company:   { href: "/about", label: "Company" },
    brands:    { href: "/alliances", label: "Brands" }
  };

  /* `intent` topics answer what the visitor wants to DO (price, contact, hours...). When a
     question matches an intent and a product topic ("price of a drone"), the intent wins. */
  var TOPICS = [
    { id: "hello", keys: ["hi", "hello", "hey", "namaste", "namaskar", "good morning", "good afternoon", "good evening", "thanks", "thank you", "dhanyavad", "shukriya"],
      text: "Namaste. I answer common questions about Shalvi Technologies: products, brands, GeM, the Lucknow office, websites, and how to send a requirement. For anything else, call or WhatsApp and a person will reply.",
      acts: ["catalogue", "enquire", "call"] },
    { id: "price", intent: true, keys: ["price", "prices", "rate", "rates", "cost", "costs", "quote", "quotation", "kitna", "kitne", "daam", "budget", "cheap", "discount"],
      text: "Prices are not published on the website because they depend on the model, quantity, delivery site and whether the purchase is on GeM or by tender. Send the requirement through the enquiry form or WhatsApp and we reply with a quotation.",
      acts: ["enquire", "wa", "call"] },
    { id: "contact", intent: true, keys: ["contact", "phone", "mobile", "number", "call", "email", "mail", "whatsapp", "sampark", "reach", "talk", "person", "human", "facebook"],
      text: "Call +91 63070 57085 or +91 97949 80001. WhatsApp +91 63070 57085. Email info@shalvitechnologies.com. Or use the enquiry form at the bottom of the home page.",
      acts: ["call", "wa", "mail", "enquire"] },
    { id: "address", intent: true, keys: ["address", "office", "location", "where", "pata", "kahan", "map", "directions", "ahmamau", "aranya", "sultanpur", "visit"],
      text: "Office: Plot No. 67–68, Aranya Estate, C.G. City, Ahmamau, Sultanpur Road, Near Law College, Lucknow 226002, Uttar Pradesh.",
      acts: ["map", "call", "wa"] },
    { id: "hours", intent: true, keys: ["hours", "timing", "timings", "open", "closed", "sunday", "holiday", "kab", "time"],
      text: "We reply on working days. For anything urgent, call +91 63070 57085; if the line is busy, try +91 97949 80001 or send a WhatsApp message.",
      acts: ["call", "wa"] },
    { id: "gem", intent: true, keys: ["gem", "government e marketplace", "government e-marketplace", "tender", "tenders", "indent", "bid", "psu", "government", "sarkari"],
      text: "Shalvi Technologies is a GeM-listed seller. Government and PSU buyers can order on GeM; we confirm the live listing and price against your requirement first. We also prepare compliance sheets for tender specifications.",
      acts: ["enquire", "catalogue", "call"] },
    { id: "delivery", intent: true, keys: ["delivery", "deliver", "shipping", "area", "areas", "city", "outside", "serve", "service area", "install", "installation"],
      text: "We are based in Lucknow and work for government, PSU, campus and corporate sites across Uttar Pradesh. Installation, operator training and after-sales service are part of the job.",
      acts: ["enquire", "call"] },
    { id: "support", intent: true, keys: ["support", "service", "repair", "warranty", "amc", "maintenance", "complaint", "problem", "not working"],
      text: "We support the installed base after handover. For service on equipment we supplied, call or WhatsApp with the product and the problem.",
      acts: ["call", "wa"] },
    { id: "who", keys: ["who are you", "about", "company", "shalvi", "what do you do", "profile", "introduction", "kaun", "company ke baare"],
      text: "Shalvi Technologies is a GeM-listed supplier and system integrator in Lucknow. We specify, supply and support IT, security and surveillance, audio-visual, networking and power systems, plus civic programmes, cyber security software, forensic systems, drones and websites.",
      acts: ["company", "solutions", "enquire"] },
    { id: "leader", keys: ["gyanesh", "shukla", "proprietor", "owner", "director", "founder", "malik"],
      text: "Gyanesh Shukla is the proprietor, a graduate of Punjab Technical University, Jalandhar. He leads requirement consulting, brand relationships and project delivery.",
      acts: ["company", "call"] },
    { id: "clients", keys: ["client", "clients", "customer", "customers", "who do you work", "sector", "sectors", "college", "school", "university", "campus", "corporate"],
      text: "We work for Central and State Government departments, PSUs, research labs, educational institutions and corporate offices.",
      acts: ["company", "enquire"] },
    { id: "products", keys: ["product", "products", "catalogue", "catalog", "supply", "range", "list", "items", "what do you sell", "what do you supply"],
      text: "Sixteen categories from our product flyer: desktops and laptops, CCTV, printers, video walls, interactive panels, projectors, UPS, batteries, servers, biometrics, EPABX, telephones, security screening, fire alarm, software and networking. Plus four newer lines: cyber security software, forensic lab software, forensic workstations and drones.",
      acts: ["catalogue", "enquire"] },
    { id: "it", keys: ["laptop", "laptops", "desktop", "desktops", "computer", "computers", "pc", "aio", "all in one", "server", "servers", "workstation", "printer", "printers", "mfp", "scanner", "epabx", "telephone", "hp", "dell", "lenovo", "acer", "apple", "canon", "tally", "windows", "office", "software", "antivirus"],
      text: "IT and office: desktops, all-in-ones and laptops (HP, Acer, Dell, Lenovo), servers and workstations (HPE, HP, Acer), printers and multifunction printers (HP, Epson, Canon, Ricoh, Kyocera, Brother and more), EPABX and telephones, and software licences (Microsoft, Tally, Busy, Quick Heal).",
      acts: ["catalogue", "enquire"] },
    { id: "security", keys: ["cctv", "camera", "cameras", "security", "surveillance", "dvr", "nvr", "biometric", "biometrics", "attendance", "access", "fire", "alarm", "barrier", "xray", "x-ray", "dfmd", "hhmd", "metal detector", "hikvision", "cp plus", "dahua"],
      text: "Security and fire: CCTV cameras and recorders (Hikvision, CP Plus, Dahua, Honeywell, Matrix and others), biometrics and access control, boom barriers, door-frame and hand-held metal detectors, X-ray baggage scanners, and fire alarm systems. We plan it for the building first, then name the brand.",
      acts: ["catalogue", "enquire", "wa"] },
    { id: "av", keys: ["av", "audio", "visual", "projector", "projectors", "video wall", "interactive", "smart board", "smart class", "panel", "display", "screen", "epson", "benq", "viewsonic"],
      text: "Audio-visual: LED video walls (VDT), interactive boards and flat panels (CP Plus, Vamaa, Brio Touch, Promark) and projectors (Epson, ViewSonic, BenQ), for classrooms, boardrooms and control rooms.",
      acts: ["catalogue", "enquire"] },
    { id: "power", keys: ["ups", "inverter", "inverters", "battery", "batteries", "power", "backup", "apc", "luminous", "microtek", "exide"],
      text: "Power: UPS and inverters (APC, Luminous, Microtek, Emerson, Elnova) and batteries (Exide, Luminous, Quanta).",
      acts: ["catalogue", "enquire"] },
    { id: "network", keys: ["network", "networking", "switch", "switches", "router", "wifi", "wi-fi", "wireless", "lan", "cabling", "cisco", "d-link", "dlink", "tp-link", "digisol"],
      text: "Networking: switches, routers, wireless and structured cabling from Cisco, D-Link, Digisol, TP-Link and Marx, sized for the building and the next expansion.",
      acts: ["catalogue", "enquire"] },
    { id: "cyber", keys: ["cyber", "cybersecurity", "cyber security", "firewall", "endpoint", "virus", "malware"],
      text: "Cyber security software: endpoint, network and email security, licensed and deployed for your site. Products change quickly, so we confirm the current package against your requirement before quoting.",
      acts: ["enquire", "solutions", "wa"] },
    { id: "forensic", keys: ["forensic", "forensics", "fsl", "forensic lab", "laboratory", "forensic workstation"],
      text: "Forensic systems: laboratory set-up software and forensic workstations, specified against the lab and its work. Tell us whether you need software, hardware or both.",
      acts: ["enquire", "solutions", "wa"] },
    { id: "drones", keys: ["drone", "drones", "uav", "uavs", "unmanned", "aerial"],
      text: "Drones: tell us the site and the task (survey, surveillance or inspection) and we propose the airframe, payload and training that fit.",
      acts: ["enquire", "solutions", "wa"] },
    { id: "civic", keys: ["waste", "swachh", "ayushman", "medical", "hospital", "queue", "smog", "civic", "msw", "municipal"],
      text: "Civic and specialised: Swachh Bharat waste management equipment, Ayushman Bharat medical equipment, queue management systems and anti-smog units.",
      acts: ["solutions", "enquire"] },
    { id: "web", keys: ["website", "websites", "web", "hosting", "domain", "ssl", "web design", "site"],
      text: "Websites: we build institution and company websites, host them with SSL and organisation email, and keep them updated after go-live.",
      acts: ["web", "enquire", "call"] },
    { id: "brands", keys: ["brand", "brands", "alliance", "alliances", "partner", "partners", "authorised", "authorized", "dealer", "channel", "oem"],
      text: "Brands on our flyer and profile include HP, HPE, Dell, Acer, Lenovo, Apple, Cisco, Microsoft, Hikvision, CP Plus, Epson, BenQ, Quick Heal, Matrix, D-Link and Luminous. Channel status is confirmed for each bid.",
      acts: ["brands", "catalogue"] }
  ];

  var FALLBACK = {
    text: "I can only answer common questions: products, brands, GeM, the office, websites and how to send a requirement. For anything else, a person will help you on the phone or WhatsApp.",
    acts: ["call", "wa", "enquire"]
  };

  function normalise(s) {
    return " " + String(s).toLowerCase().replace(/[^a-z0-9ऀ-ॿ]+/g, " ").trim() + " ";
  }

  // Score by whole words and phrases, so "hi" does not match inside "which" or "this".
  function answer(raw) {
    var q = normalise(raw);
    if (!q.trim()) return TOPICS[0];
    var best = null, bestScore = 0, bestIntent = null, intentScore = 0;
    TOPICS.forEach(function (t) {
      var n = 0;
      t.keys.forEach(function (k) {
        var key = normalise(k);
        if (q.indexOf(key) !== -1) n += key.trim().indexOf(" ") !== -1 ? 5 : 3;
      });
      if (n > bestScore) { bestScore = n; best = t; }
      if (t.intent && n > intentScore) { intentScore = n; bestIntent = t; }
    });
    if (bestIntent && bestIntent.id !== "hello") return bestIntent;  // what they want to do beats what it's about
    return best || FALLBACK;
  }

  // ---------- markup ----------
  var root = document.createElement("div");
  root.id = "desk";
  root.innerHTML =
    '<button class="desk-fab" type="button" aria-expanded="false" aria-controls="desk-panel">' +
      '<img src="/assets/img/emblem-96.webp" alt="" width="44" height="44">' +
      '<span class="desk-fab__label">Ask Shalvi</span>' +
    "</button>" +
    '<section class="desk-panel" id="desk-panel" role="dialog" aria-labelledby="desk-title" hidden>' +
      '<div class="desk-head">' +
        '<img src="/assets/img/emblem-96.webp" alt="" width="40" height="40">' +
        '<div><h2 id="desk-title">Ask Shalvi</h2><p>Automated helper · answers from our company profile</p></div>' +
        '<button class="desk-x" type="button" aria-label="Close Ask Shalvi"><svg class="ico" aria-hidden="true"><use href="#i-close"/></svg></button>' +
      "</div>" +
      '<div class="desk-log" role="log" aria-live="polite"></div>' +
      '<div class="desk-chips" role="group" aria-label="Suggested questions"></div>' +
      '<form class="desk-form">' +
        '<label class="sr-only" for="desk-q">Your question</label>' +
        '<input id="desk-q" name="q" autocomplete="off" maxlength="200" placeholder="Type a question…">' +
        '<button class="btn btn--primary btn--sm" type="submit">Ask</button>' +
      "</form>" +
    "</section>";
  document.body.appendChild(root);

  var fab = root.querySelector(".desk-fab");
  var panel = root.querySelector(".desk-panel");
  var log = root.querySelector(".desk-log");
  var form = root.querySelector(".desk-form");
  var input = root.querySelector("#desk-q");
  var chips = root.querySelector(".desk-chips");

  [["What do you supply?", "what do you supply"], ["Are you on GeM?", "gem"], ["Prices", "price"],
   ["CCTV", "cctv"], ["Office address", "address"], ["Talk to a person", "contact"]].forEach(function (pair) {
    var b = document.createElement("button");
    b.type = "button"; b.textContent = pair[0];
    b.addEventListener("click", function () { ask(pair[0], pair[1]); });
    chips.appendChild(b);
  });

  function actLink(id) {
    var spec = ACTIONS[id]; if (!spec) return null;
    var a = document.createElement("a");
    a.href = spec.href; a.textContent = spec.label;
    if (spec.blank) { a.target = "_blank"; a.rel = "noopener"; }
    if (spec.href.indexOf("/#") === 0) a.addEventListener("click", function () { setOpen(false, true); });
    return a;
  }
  function bubble(who, text, acts) {
    var wrap = document.createElement("div");
    wrap.className = "desk-msg desk-msg--" + who;
    var p = document.createElement("p"); p.textContent = text; wrap.appendChild(p);
    if (acts && acts.length) {
      var row = document.createElement("div"); row.className = "desk-acts";
      acts.forEach(function (id) { var a = actLink(id); if (a) row.appendChild(a); });
      wrap.appendChild(row);
    }
    log.appendChild(wrap);
    log.scrollTop = log.scrollHeight;
  }
  function ask(shown, query) {
    var q = String(shown || "").trim(); if (!q) return;
    bubble("you", q);
    var hit = answer(query || q);
    window.setTimeout(function () { bubble("bot", hit.text, hit.acts); }, 250);
  }

  var greeted = false;
  function setOpen(on, quiet) {
    panel.hidden = !on;
    fab.setAttribute("aria-expanded", on ? "true" : "false");
    root.classList.toggle("is-open", on);
    if (on) {
      if (!greeted) {
        greeted = true;
        bubble("bot", "Namaste. I'm an automated helper and I answer from our company profile. Nothing you type here leaves your browser. For a person, call or WhatsApp.", ["call", "wa"]);
      }
      input.focus();
    } else if (!quiet) {
      fab.focus();
    }
  }
  fab.addEventListener("click", function () { setOpen(true); });
  root.querySelector(".desk-x").addEventListener("click", function () { setOpen(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) setOpen(false); });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var q = input.value; input.value = "";
    ask(q);
  });

  window.ShalviDesk = { answer: answer }; // exposed for testing
})();
