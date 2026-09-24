/* Shalvi Technologies — site behaviour. Progressive enhancement: every page works without it.
   1. header measurements   2. menu + section capsule   3. scroll-spy (one-scroll home)
   4. catalogue filters     5. enquiry list (basket)    6. enquiry form   7. helpers */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.add("js");
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var DESKTOP = "(min-width: 68.8125em)", PHONE = "(max-width: 45em)";

  /* ---------- 1. header measurements (used for anchor offsets) ---------- */
  var header = $("[data-header]");
  var topbar = header && $(".topbar", header);
  var measure = function () {
    if (!header) return;
    var tb = topbar ? topbar.offsetHeight : 0;
    var stuck = window.matchMedia(PHONE).matches ? header.offsetHeight - tb : header.offsetHeight;
    root.style.setProperty("--topbar-h", tb + "px");
    root.style.setProperty("--hdr", stuck + "px");
  };
  measure();
  window.addEventListener("resize", measure);

  /* ---------- 2. menu + section capsule ---------- */
  var toggle = $("[data-nav-toggle]");
  var nav = toggle && document.getElementById(toggle.getAttribute("aria-controls"));
  var where = $("[data-where]");
  var setOpen = function (open) {
    if (!nav) return;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  };
  if (toggle && nav) {
    toggle.addEventListener("click", function () { setOpen(toggle.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { setOpen(false); toggle.focus(); }
    });
    document.addEventListener("click", function (e) {
      if (toggle.getAttribute("aria-expanded") === "true" && !nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });
    nav.addEventListener("focusout", function (e) {
      if (e.relatedTarget && !nav.contains(e.relatedTarget) && e.relatedTarget !== toggle) setOpen(false);
    });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
    var mq = window.matchMedia(DESKTOP);
    var onMq = function (m) { if (m.matches) setOpen(false); measure(); };
    if (mq.addEventListener) mq.addEventListener("change", onMq); else mq.addListener(onMq);
  }
  var labelOf = function (a) { return a.getAttribute("data-label") || a.textContent.replace(/\s+\d+\s*$/, "").trim(); };
  var showWhere = function (text) {
    if (!where || where.textContent === text) return;
    where.classList.add("is-swapping");
    window.setTimeout(function () { where.textContent = text; where.classList.remove("is-swapping"); }, 120);
  };

  /* ---------- 3. scroll-spy on the one-scroll home ---------- */
  var sections = $$("[data-spy]");
  if (sections.length && nav) {
    var linkFor = {};
    $$("a[data-section]", nav).forEach(function (a) { linkFor[a.getAttribute("data-section")] = a; });
    var current = null;
    var activate = function (id) {
      if (id === current) return;
      current = id;
      Object.keys(linkFor).forEach(function (k) {
        if (k === id) linkFor[k].setAttribute("aria-current", "location");
        else linkFor[k].removeAttribute("aria-current");
      });
      if (linkFor[id]) showWhere(labelOf(linkFor[id]));
    };
    var ticking = false;
    var spy = function () {
      ticking = false;
      var line = (parseFloat(getComputedStyle(root).getPropertyValue("--hdr")) || 100) + window.innerHeight * 0.25;
      var id = sections[0].id;
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].getBoundingClientRect().top <= line) id = sections[i].id;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) id = sections[sections.length - 1].id;
      activate(id);
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; window.requestAnimationFrame(spy); } }, { passive: true });
    window.addEventListener("resize", spy);
    window.addEventListener("hashchange", spy);
    spy();
  }

  /* ---------- 4. catalogue filters + search ---------- */
  var catalog = $("[data-catalog]");
  if (catalog) {
    var rows = $$("tbody tr", catalog);
    var chips = $$("[data-filter]");
    var search = $("[data-search]");
    var empty = $("[data-empty]");
    var count = $("[data-count]");
    var state = { group: "all", q: "" };
    var apply = function () {
      var q = state.q.trim().toLowerCase(), shown = 0;
      rows.forEach(function (row) {
        var show = (state.group === "all" || row.getAttribute("data-group") === state.group) &&
          (!q || (row.getAttribute("data-text") + " " + row.textContent).toLowerCase().indexOf(q) !== -1);
        row.hidden = !show;
        if (show) shown++;
      });
      if (empty) empty.hidden = shown !== 0;
      if (count) count.textContent = shown + " of " + rows.length;
    };
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.setAttribute("aria-pressed", c === chip ? "true" : "false"); });
        state.group = chip.getAttribute("data-filter");
        apply();
      });
    });
    if (search) {
      search.addEventListener("input", function () { state.q = search.value; apply(); });
      search.addEventListener("keydown", function (e) { if (e.key === "Enter") e.preventDefault(); });
    }
    var pre = new URLSearchParams(location.search).get("group") || (location.hash || "").slice(1);
    chips.forEach(function (chip) { if (chip.getAttribute("data-filter") === pre) chip.click(); });
    apply();
  }

  /* ---------- 5. enquiry list (kept in memory, mirrored to localStorage) ---------- */
  var KEY = "st-enquiry-items", memory = null;
  var readBasket = function () {
    if (memory) return memory.slice();
    try { memory = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { memory = []; }
    if (!Array.isArray(memory)) memory = [];
    return memory.slice();
  };
  var writeBasket = function (items) {
    memory = items.slice();
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* private mode: memory only */ }
  };
  var announce = function (msg) { $$("[data-basket-live]").forEach(function (el) { el.textContent = msg; }); };
  var renderBadges = function (items) {
    $$("[data-basket-count]").forEach(function (b) { b.textContent = String(items.length); b.hidden = items.length === 0; });
    $$("[data-basket-sr]").forEach(function (s) { s.textContent = items.length ? ", " + items.length + " in your enquiry list" : ""; });
  };
  var renderList = function (items, focusIndex) {
    var list = $("[data-basket-list]");
    var field = $("[data-basket-field]");
    var clear = $("[data-basket-clear]");
    if (field) field.value = items.map(function (i) { return "- " + i.label; }).join("\n");
    if (clear) clear.hidden = items.length === 0;
    if (!list) return;
    var emptyMsg = $("[data-basket-empty]");
    if (emptyMsg) emptyMsg.hidden = items.length !== 0;
    list.textContent = "";
    items.forEach(function (item, idx) {
      var li = document.createElement("li");
      var span = document.createElement("span"); span.textContent = item.label;
      var btn = document.createElement("button"); btn.type = "button"; btn.setAttribute("aria-label", "Remove " + item.label);
      btn.innerHTML = '<svg class="ico" aria-hidden="true"><use href="#i-trash"/></svg>';
      btn.addEventListener("click", function () {
        setBasket(readBasket().filter(function (i) { return i.id !== item.id; }), idx);
        announce(item.label + " removed from your enquiry list.");
      });
      li.appendChild(span); li.appendChild(btn); list.appendChild(li);
    });
    if (typeof focusIndex === "number") {
      var btns = $$("button", list);
      var target = btns[Math.min(focusIndex, btns.length - 1)] || $("#basket-title");
      if (target) target.focus();
    }
  };
  var renderButtons = function (items) {
    var ids = items.map(function (i) { return i.id; });
    $$("[data-add]").forEach(function (btn) {
      var on = ids.indexOf(btn.getAttribute("data-add")) !== -1;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.innerHTML = on ? '<svg class="ico" aria-hidden="true"><use href="#i-check"/></svg>Added' : '<svg class="ico" aria-hidden="true"><use href="#i-plus"/></svg>Add to enquiry';
    });
  };
  var setBasket = function (items, focusIndex) { writeBasket(items); renderBadges(items); renderList(items, focusIndex); renderButtons(items); };
  $$("[data-add]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-add"), label = btn.getAttribute("data-label") || id;
      var items = readBasket(), had = items.some(function (i) { return i.id === id; });
      items = had ? items.filter(function (i) { return i.id !== id; }) : items.concat([{ id: id, label: label }]);
      setBasket(items);
      announce(label + (had ? " removed from" : " added to") + " your enquiry list. " + items.length + " in total.");
    });
  });
  var clearBtn = $("[data-basket-clear]");
  if (clearBtn) clearBtn.addEventListener("click", function () { setBasket([], 0); announce("Enquiry list cleared."); });
  setBasket(readBasket());

  /* ---------- 6. enquiry form ---------- */
  var form = $("[data-enquiry]");
  if (form) {
    form.setAttribute("novalidate", "");
    var status = $("[data-form-status]");
    var submitBtn = $("button[type=submit]", form);
    var endpoint = form.getAttribute("action") || "/api/enquiry";
    var TO = form.getAttribute("data-to") || "info@shalvitechnologies.com";
    var WA = form.getAttribute("data-wa") || "916307057085";
    var configured = null;
    var fieldOf = function (name) { return form.querySelector("[name=" + name + "]"); };

    // preselect the area from ?interest=web or from a link with data-interest
    var interestSel = fieldOf("interest");
    var setInterest = function (key) {
      if (!interestSel || !key) return;
      $$("option", interestSel).forEach(function (o) { if (o.value === key) interestSel.value = key; });
    };
    setInterest(new URLSearchParams(location.search).get("interest"));
    $$("[data-interest]").forEach(function (a) { a.addEventListener("click", function () { setInterest(a.getAttribute("data-interest")); }); });

    if (window.fetch) {
      fetch(endpoint, { headers: { "Accept": "application/json" } })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) { configured = !!(j && j.configured); })
        .catch(function () { configured = false; });
    } else { configured = false; }

    var el = function (tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; };
    var showStatus = function (kind, nodes) {
      if (!status) return;
      status.className = "form-status is-visible form-status--" + kind;
      status.textContent = "";
      nodes.forEach(function (n) { status.appendChild(n); });
      status.focus();
    };
    var linkBtn = function (cls, href, text, blank) {
      var a = el("a", "btn " + cls, text); a.href = href;
      if (blank) { a.target = "_blank"; a.rel = "noopener"; }
      return a;
    };
    var setError = function (input, msg) {
      var field = input.closest(".field"); if (!field) return;
      var err = field.querySelector(".error");
      field.classList.toggle("is-invalid", !!msg);
      if (msg) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid");
      if (err) err.textContent = msg || "";
    };
    var PHONE_RE = /^[+\d][\d\s\-()]{6,}$/, EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var validate = function () {
      var first = null;
      [fieldOf("name"), fieldOf("email"), fieldOf("phone"), fieldOf("message")].forEach(function (input) {
        if (!input) return;
        var v = input.value.trim(), msg = "";
        if (input.required && !v) msg = "This field is required.";
        else if (input.type === "email" && v && !EMAIL_RE.test(v)) msg = "Enter a valid email address, for example name@organisation.in";
        else if (input.name === "phone" && v && !PHONE_RE.test(v)) msg = "Enter a valid phone number.";
        setError(input, msg);
        if (msg && !first) first = input;
      });
      if (first) first.focus();
      return !first;
    };
    var payload = function () {
      var d = {};
      $$("input, select, textarea", form).forEach(function (f) {
        if (!f.name) return;
        d[f.name] = f.tagName === "SELECT" ? (f.value ? f.options[f.selectedIndex].text : "") : f.value;
      });
      return d;
    };
    var messageText = function (d) {
      return "Name: " + d.name + "\nOrganisation: " + (d.org || "-") + "\nEmail: " + d.email + "\nPhone: " + (d.phone || "-") +
        "\nInterest: " + (d.interest || "-") + (d.items ? "\n\nEnquiry list:\n" + d.items : "") + "\n\nRequirement:\n" + d.message;
    };
    var fallback = function (d, note) {
      var subject = "Enquiry: " + (d.interest || "General") + " — " + d.name;
      var row = el("div", "btn-row");
      row.appendChild(linkBtn("btn--primary", "mailto:" + TO + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(messageText(d)), "Open in my email app"));
      row.appendChild(linkBtn("btn--wa", "https://wa.me/" + WA + "?text=" + encodeURIComponent("Hello Shalvi Technologies,\n" + messageText(d)), "Send on WhatsApp", true));
      row.appendChild(linkBtn("btn--outline", "tel:+" + WA, "Call +91 " + WA.slice(2, 7) + " " + WA.slice(7)));
      showStatus("warn", [el("h3", "", "Send it the way that suits you"), el("p", "", note + " Your details are still in the form below; nothing has been lost."), row]);
    };
    var busy = false;
    var setBusy = function (on) {
      busy = on;
      if (!submitBtn) return;
      if (on) { submitBtn.setAttribute("aria-disabled", "true"); submitBtn.dataset.html = submitBtn.innerHTML; submitBtn.textContent = "Sending…"; }
      else { submitBtn.removeAttribute("aria-disabled"); if (submitBtn.dataset.html) submitBtn.innerHTML = submitBtn.dataset.html; }
    };
    var success = function (ref) {
      form.hidden = true;
      var p = el("p", "", "Reference ");
      p.appendChild(el("strong", "mono", ref));
      p.appendChild(document.createTextNode(". We reply on working days. For anything urgent call +91 63070 57085."));
      var again = el("button", "btn btn--outline", "Send another enquiry"); again.type = "button";
      again.addEventListener("click", function () {
        form.reset();
        $$("[aria-invalid]", form).forEach(function (i) { setError(i, ""); });
        form.hidden = false; status.className = "form-status"; status.textContent = "";
        var n = fieldOf("name"); if (n) n.focus();
      });
      var row = el("div", "btn-row"); row.appendChild(again);
      showStatus("ok", [el("h3", "", "Thank you. Your enquiry is with us."), p, row]);
      setBasket([]);
    };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (busy || !validate()) return;
      var d = payload();
      if (configured === false) { fallback(d, "Online delivery is not switched on yet, so use one of these instead."); return; }
      setBusy(true);
      fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(d) })
        .then(function (r) {
          return r.text().then(function (t) { var j = null; try { j = JSON.parse(t); } catch (x) { /* not JSON */ } return { ok: r.ok, status: r.status, body: j }; });
        }, function () { return null; })
        .then(function (res) {
          setBusy(false);
          if (!res) { fallback(d, "We could not reach the server (check your connection), so use one of these instead."); return; }
          var b = res.body || {};
          if (res.ok && b.ok && b.ref && b.ref !== "ST-OK") { success(b.ref); return; }
          if (res.status === 400 && b.errors) {
            Object.keys(b.errors).forEach(function (k) { var inp = fieldOf(k); if (inp) setError(inp, b.errors[k]); });
            showStatus("err", [el("p", "", "Please check the highlighted fields and try again.")]);
            return;
          }
          fallback(d, res.status === 503 ? "Online delivery is not switched on yet, so use one of these instead." : "The online form could not send just now, so use one of these instead.");
        });
    });
    $$("input, textarea", form).forEach(function (input) {
      input.addEventListener("input", function () { if (input.getAttribute("aria-invalid") === "true") setError(input, ""); });
    });

    // result of a no-JavaScript submission (the server redirects back with ?sent= or ?error=)
    var qs = new URLSearchParams(location.search);
    if (qs.get("sent")) success(qs.get("sent"));
    else if (qs.get("error")) fallback({ name: "", org: "", email: "", phone: "", interest: "", items: "", message: "" }, "Your enquiry could not be sent online.");
  }

  /* ---------- 7. helpers ---------- */
  $$("[data-year]").forEach(function (y) { y.textContent = String(new Date().getFullYear()); });
  $$('a[target="_blank"]').forEach(function (a) { if (!/noopener/.test(a.rel)) a.rel = (a.rel ? a.rel + " " : "") + "noopener"; });

})();
