(function () {
  if (document.getElementById("desk")) return;

  const base = document.documentElement.dataset.base || "./";
  const logo = document.documentElement.dataset.logo || base + "assets/img/logo.png";
  const single = document.documentElement.dataset.single === "1";

  function href(page) {
    if (single) return "#" + (page === "home" ? "home" : page);
    return base + (page === "home" ? "index.html" : page + ".html");
  }

  const ACTIONS = {
    call: { href: "tel:+916307057085", label: "Call 63070 57085" },
    call2: { href: "tel:+919794980001", label: "Call 97949 80001" },
    wa: { href: "https://wa.me/916307057085", label: "WhatsApp" },
    mail: { href: "mailto:info@shalvitechnologies.com", label: "Email" },
    fb: { href: "https://www.facebook.com/shalvitechnologies.in", label: "Facebook" },
    map: { href: "https://maps.google.com/?q=Aranya+Estate+Ahmamau+Lucknow", label: "Map" },
    enquire: { page: "contact", label: "Enquire" },
    portfolio: { page: "products", label: "Portfolio" },
    web: { page: "web", label: "Web work" },
    company: { page: "about", label: "Company" }
  };

  const TOPICS = [
    {
      id: "hello",
      keys: ["hi", "hello", "hey", "namaste", "namaskar", "good morning", "good afternoon", "good evening", "thanks", "thank you", "dhanyavad"],
      text: "Namaste. This is the Shalvi Technologies desk. Ask about the portfolio, GeM, cyber security software, forensic work, drones, the Lucknow office, websites, or how to send an indent.",
      acts: ["portfolio", "enquire", "call"]
    },
    {
      id: "who",
      keys: ["who are you", "about", "company", "shalvi", "what do you do", "profile", "introduction", "kaun", "company ke baare"],
      text: "Shalvi Technologies is a Lucknow house that specifies, supplies and supports IT, surveillance, audio-visual systems, websites, civic programmes, cyber security software, forensic systems and drones. Tagline: Expertise · Experience · Excellence. Values: customer satisfaction, reliability, innovation, scalability. Proprietor: Gyanesh Shukla, PTU Jalandhar.",
      acts: ["company", "portfolio", "enquire"]
    },
    {
      id: "contact",
      keys: ["contact", "phone", "mobile", "number", "call", "email", "mail", "whatsapp", "sampark", "number kya", "reach", "facebook", "social", "fb"],
      text: "Call +91 63070 57085 or +91 97949 80001. WhatsApp on 63070 57085. Mail info@shalvitechnologies.com. Facebook: facebook.com/shalvitechnologies.in. Office: Plot 67–68, Aranya Estate, C.G. City, Ahmamau, Sultanpur Road, near Law College, Lucknow 226002.",
      acts: ["call", "wa", "mail", "fb"]
    },
    {
      id: "address",
      keys: ["address", "office", "location", "where", "lucknow", "pata", "kahan", "map", "ahmamau", "aranya", "sultanpur"],
      text: "Registered office — Plot No. 67–68, Aranya Estate, C.G. City, Ahmamau, Sultanpur Road, Near Law College, Lucknow 226002.",
      acts: ["map", "call", "wa"]
    },
    {
      id: "gem",
      keys: ["gem", "government e marketplace", "tender", "indent", "psu", "government"],
      text: "The company is GeM listed. Government, PSU, campus and corporate indents are taken from Lucknow. Confirm the live SKU before a bid — channel status is checked, not assumed.",
      acts: ["enquire", "portfolio", "call"]
    },
    {
      id: "products",
      keys: ["product", "portfolio", "line card", "catalog", "supply", "laptop", "desktop", "printer", "server", "workstation", "software", "ups", "battery", "hp", "dell", "lenovo", "acer"],
      text: "Flyer line card: desktops, AIO and laptops (HP, Acer, Dell, Lenovo); printers; servers and workstations (HPE, HP, Acer); UPS and inverters; batteries; software (Windows, Office, Tally, Quick Heal); plus security, AV and networking. Further work: software and cyber security (centred on cyber security software), forensic lab set-up software, forensic workstation desktops, and drones.",
      acts: ["portfolio", "enquire"]
    },
    {
      id: "security",
      keys: ["cctv", "camera", "security", "surveillance", "biometric", "access", "fire", "alarm", "barrier", "xray", "x-ray", "dfmd", "hhmd", "hikvision", "cp plus"],
      text: "Security practice: CCTV and recorders (Hikvision, CP Plus, Dahua, Axis, Matrix and others on the flyer), biometrics and access, boom barriers, DFMD / HHMD / X-ray, and fire alarm (Agni, Cooper, GST, Morley, Ravel). Specify the site first; then the stack.",
      acts: ["portfolio", "enquire", "wa"]
    },
    {
      id: "cyber",
      keys: ["cyber", "cybersecurity", "cyber security"],
      text: "Software and Cyber security is a line of work, centred on cyber security software. Specify the requirement; then the stack the site can run. Current packages are confirmed against the indent — they are not extra brand rows on the printed flyer.",
      acts: ["enquire", "portfolio", "wa"]
    },
    {
      id: "forensic-software",
      keys: ["forensic software", "forensic lab", "lab set-up", "lab setup", "laboratory software", "fsl", "forensics software"],
      text: "Forensic lab set-up Software is a line of work, centred on forensic software. Specify the laboratory; then the software that fits. Models are confirmed before a bid.",
      acts: ["enquire", "portfolio", "wa"]
    },
    {
      id: "forensic-workstation",
      keys: ["forensic workstation", "forensic work station", "forensic desktop", "workstation desktop"],
      text: "Forensic Work station Desktop is a line of work: desktop workstations specified for forensic use. Current models are confirmed before a bid; they sit beside the flyer’s servers and workstations (HPE, HP, Acer), not as a named extra brand.",
      acts: ["enquire", "portfolio", "call"]
    },
    {
      id: "forensic",
      keys: ["forensic", "forensics", "laboratory set-up", "lab set up"],
      text: "Forensic work covers two lines: forensic lab set-up software (centred on forensic software) and forensic workstation desktops. Specify whether the indent is software, hardware, or both.",
      acts: ["enquire", "portfolio", "wa"]
    },
    {
      id: "drones",
      keys: ["drone", "drones", "uav", "uavs", "unmanned", "aerial"],
      text: "Drones are a line of work. Specify the site and the task; then the airframe and payload that fit. Current models are confirmed against the indent — no brand is assumed from the printed flyer.",
      acts: ["enquire", "wa", "call"]
    },
    {
      id: "av",
      keys: ["av", "audio", "visual", "projector", "video wall", "interactive", "board", "panel", "epson", "benq"],
      text: "Audio-visual: LED video wall (VDT), interactive boards and panels (CP Plus, Vamaa, Brio Touch, Promark), projectors (Epson, ViewSonic, BenQ). Integration with compute and room control is the usual handover.",
      acts: ["portfolio", "enquire"]
    },
    {
      id: "network",
      keys: ["network", "networking", "switch", "router", "wifi", "lan", "cisco", "d-link", "dlink", "tp-link"],
      text: "Networking from Cisco, D-Link, Digisol, TP-Link and Marx — campus and office. Cabling and active gear are specified against the building, not a catalogue page.",
      acts: ["portfolio", "enquire"]
    },
    {
      id: "web",
      keys: ["website", "web", "hosting", "domain", "ssl", "manage", "digital"],
      text: "Website development, hosting and management sit with the same house. New brochure and campus sites, domain, DNS, SSL, mailboxes, updates and a named person after go-live. The public site should match the office.",
      acts: ["web", "enquire", "call"]
    },
    {
      id: "civic",
      keys: ["waste", "swachh", "ayushman", "medical", "queue", "smog", "civic", "qms", "msw"],
      text: "Civic and specialised lines: Swachh Bharat waste programmes (QMS / MSW / medical waste), Ayushman Bharat medical equipment, queue management and anti-smog systems — alongside the IT and security work.",
      acts: ["enquire", "company"]
    },
    {
      id: "leader",
      keys: ["gyanesh", "shukla", "proprietor", "owner", "director", "founder"],
      text: "Gyanesh Shukla is the proprietor. Graduate of Punjab Technical University, Jalandhar. The practice is to consult on the requirement, keep service standards, and adopt current technology without abandoning support.",
      acts: ["company", "enquire"]
    },
    {
      id: "clients",
      keys: ["client", "customer", "who do you work", "sector", "campus", "corporate", "lab"],
      text: "Work is commissioned by Central and State government, public sector, research labs, campuses and corporate offices. Long relations. An installed base. Complex projects executed from Lucknow.",
      acts: ["company", "enquire"]
    },
    {
      id: "brands",
      keys: ["brand", "alliance", "partner", "authorised", "authorized", "channel"],
      text: "Alliances named on the profile and flyer include HP, HPE, Dell, Acer, Apple, Lenovo, Cisco, Microsoft, Hikvision, CP Plus, Epson, BenQ, Quick Heal, Matrix, D-Link and Luminous. Channel status is confirmed before a bid.",
      acts: ["portfolio", "enquire"]
    },
    {
      id: "price",
      keys: ["price", "rate", "cost", "quote", "quotation", "kitna", "budget"],
      text: "Rates are not published on the site. Send the indent — quantity, site and whether GeM is required — and the desk will say what fits. Call or WhatsApp if it is urgent.",
      acts: ["enquire", "call", "wa"]
    },
    {
      id: "hours",
      keys: ["hours", "timing", "open", "sunday", "kab"],
      text: "Office hours are not printed on the profile. Call +91 63070 57085 or WhatsApp the same number; if the line is busy, use +91 97949 80001 or mail.",
      acts: ["call", "wa", "mail"]
    }
  ];

  function tokens(s) {
    return s.toLowerCase().replace(/[^a-z0-9\u0900-\u097f+\s-]/g, " ").split(/\s+/).filter(function (w) { return w.length > 1; });
  }

  function answer(raw) {
    const q = raw.toLowerCase().trim();
    if (!q) return TOPICS[0];
    let best = null;
    let score = 0;
    TOPICS.forEach(function (topic) {
      let n = 0;
      topic.keys.forEach(function (key) {
        if (q.indexOf(key) !== -1) n += key.indexOf(" ") !== -1 ? 6 : 3;
      });
      tokens(q).forEach(function (w) {
        topic.keys.forEach(function (key) {
          if (key === w) n += 2;
        });
      });
      if (n > score) { score = n; best = topic; }
    });
    if (!best || score < 3) {
      return {
        text: "I can speak to the official profile — portfolio, GeM, cyber security software, forensic work, drones, office, websites and how to send an indent. For a live requirement, call or WhatsApp Gyanesh Shukla’s desk.",
        acts: ["enquire", "call", "wa", "portfolio"]
      };
    }
    return best;
  }

  function actNode(id) {
    const spec = ACTIONS[id];
    if (!spec) return null;
    const a = document.createElement("a");
    a.textContent = spec.label;
    if (spec.page) {
      a.href = href(spec.page);
      if (single) a.setAttribute("data-go", spec.page);
    } else {
      a.href = spec.href;
    }
    return a;
  }

  const root = document.createElement("div");
  root.id = "desk";
  root.innerHTML =
    '<button class="desk-fab" type="button" aria-expanded="false" aria-controls="desk-panel" title="Ask Shalvi">' +
      '<img alt="" width="58" height="58">' +
      '<span class="desk-dot" aria-hidden="true"></span>' +
    "</button>" +
    '<section class="desk-panel" id="desk-panel" hidden>' +
      '<header class="desk-head">' +
        '<img alt="" width="44" height="44">' +
        "<div><strong>Ask Shalvi</strong><small>Company desk</small></div>" +
        '<button class="desk-x" type="button" aria-label="Close">Close</button>' +
      "</header>" +
      '<div class="desk-log" role="log" aria-live="polite"></div>' +
      '<div class="desk-chips"></div>' +
      '<form class="desk-form">' +
        '<label class="sr-only" for="desk-q">Your question</label>' +
        '<input id="desk-q" name="q" autocomplete="off" placeholder="Ask about the house…">' +
        '<button class="btn btn-red" type="submit">Send</button>' +
      "</form>" +
    "</section>";

  document.body.appendChild(root);
  root.querySelectorAll("img").forEach(function (img) { img.src = logo; });

  const fab = root.querySelector(".desk-fab");
  const panel = root.querySelector(".desk-panel");
  const log = root.querySelector(".desk-log");
  const form = root.querySelector(".desk-form");
  const input = root.querySelector("#desk-q");
  const chips = root.querySelector(".desk-chips");

  const SUGGEST = [
    ["What do you supply?", "portfolio"],
    ["Cyber security software", "cyber security software"],
    ["Forensic work", "forensic software"],
    ["Drones", "drones"],
    ["Contact numbers", "contact numbers"],
    ["Are you on GeM?", "gem"]
  ];

  SUGGEST.forEach(function (pair) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = pair[0];
    b.addEventListener("click", function () { ask(pair[1]); });
    chips.appendChild(b);
  });

  function open(on) {
    panel.hidden = !on;
    panel.classList.toggle("open", on);
    fab.setAttribute("aria-expanded", on ? "true" : "false");
    fab.hidden = on;
    if (on) input.focus();
  }

  fab.addEventListener("click", function () { open(true); });
  root.querySelector(".desk-x").addEventListener("click", function () { open(false); });

  function bubble(who, text, acts) {
    const wrap = document.createElement("div");
    wrap.className = "desk-msg " + who;
    const p = document.createElement("p");
    p.textContent = text;
    wrap.appendChild(p);
    if (acts && acts.length) {
      const row = document.createElement("div");
      row.className = "desk-acts";
      acts.forEach(function (id) {
        const a = actNode(id);
        if (a) row.appendChild(a);
      });
      wrap.appendChild(row);
    }
    log.appendChild(wrap);
    log.scrollTop = log.scrollHeight;
    return wrap;
  }

  function ask(text) {
    const q = String(text || "").trim();
    if (!q) return;
    bubble("you", q);
    const wait = bubble("bot", "…");
    wait.classList.add("desk-wait");
    const hit = answer(q);
    window.setTimeout(function () {
      wait.remove();
      bubble("bot", hit.text, hit.acts);
    }, 380);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const q = input.value;
    input.value = "";
    ask(q);
  });

  bubble("bot", "This desk answers from the Shalvi Technologies profile — in your browser, nothing is stored on a server. Ask about work, cyber and forensic lines, drones, GeM, or the Lucknow office.", ["call", "wa", "enquire"]);
})();
