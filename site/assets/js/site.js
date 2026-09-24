/* Shalvi Technologies — site behaviour (progressive enhancement; the site works without it)
   1. mobile navigation   2. catalogue filters + search   3. enquiry basket
   4. enquiry form (API → email; falls back to mail app / WhatsApp)   5. small helpers */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- 1. navigation ---------- */
  var toggle = $("[data-nav-toggle]");
  var nav = toggle && document.getElementById(toggle.getAttribute("aria-controls"));
  if (toggle && nav) {
    var label = $("span", toggle);
    var setOpen = function (open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (label) label.textContent = open ? "Close" : "Menu";
    };
    toggle.addEventListener("click", function () { setOpen(toggle.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { setOpen(false); toggle.focus(); }
    });
    document.addEventListener("click", function (e) {
      if (toggle.getAttribute("aria-expanded") === "true" && !nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });
    var mq = window.matchMedia("(min-width: 961px)");
    var onMq = function (m) { if (m.matches) setOpen(false); };
    if (mq.addEventListener) mq.addEventListener("change", onMq); else mq.addListener(onMq);
  }

  /* ---------- 2. catalogue filters + search ---------- */
  var catalog = $("[data-catalog]");
  if (catalog) {
    var rows = $$("tbody tr", catalog);
    var chips = $$("[data-filter]");
    var search = $("[data-search]");
    var empty = $("[data-empty]");
    var count = $("[data-count]");
    var state = { group: "all", q: "" };
    var apply = function () {
      var q = state.q.trim().toLowerCase();
      var shown = 0;
      rows.forEach(function (row) {
        var okGroup = state.group === "all" || row.getAttribute("data-group") === state.group;
        var okText = !q || (row.getAttribute("data-text") || row.textContent).toLowerCase().indexOf(q) !== -1;
        var show = okGroup && okText;
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
    }
    // deep link: /products?group=sec or #sec
    var hash = (location.hash || "").replace("#", "");
    var param = new URLSearchParams(location.search).get("group");
    var pre = param || hash;
    chips.forEach(function (chip) { if (chip.getAttribute("data-filter") === pre) chip.click(); });
    apply();
  }

  /* ---------- 3. enquiry basket (localStorage) ---------- */
  var KEY = "st-enquiry-items";
  var readBasket = function () { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; } };
  var writeBasket = function (items) { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* private mode */ } };
  var renderBadges = function (items) {
    $$("[data-basket-count]").forEach(function (b) { b.textContent = String(items.length); b.hidden = items.length === 0; });
  };
  var renderList = function (items) {
    var list = $("[data-basket-list]");
    var field = $("[data-basket-field]");
    if (field) field.value = items.map(function (i) { return "- " + i.label; }).join("\n");
    var clear = $("[data-basket-clear]");
    if (clear) clear.hidden = items.length === 0;
    if (!list) return;
    list.innerHTML = "";
    var emptyMsg = $("[data-basket-empty]");
    if (emptyMsg) emptyMsg.hidden = items.length !== 0;
    items.forEach(function (item) {
      var li = document.createElement("li");
      var span = document.createElement("span"); span.textContent = item.label;
      var btn = document.createElement("button"); btn.type = "button"; btn.setAttribute("aria-label", "Remove " + item.label);
      btn.innerHTML = '<svg class="ico" aria-hidden="true"><use href="#i-trash"/></svg>';
      btn.addEventListener("click", function () { setBasket(readBasket().filter(function (i) { return i.id !== item.id; })); });
      li.appendChild(span); li.appendChild(btn); list.appendChild(li);
    });
  };
  var renderButtons = function (items) {
    var ids = items.map(function (i) { return i.id; });
    $$("[data-add]").forEach(function (btn) {
      var on = ids.indexOf(btn.getAttribute("data-add")) !== -1;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.innerHTML = on ? '<svg class="ico" aria-hidden="true"><use href="#i-check"/></svg>Added' : '<svg class="ico" aria-hidden="true"><use href="#i-plus"/></svg>Add to enquiry';
    });
  };
  var setBasket = function (items) { writeBasket(items); renderBadges(items); renderList(items); renderButtons(items); };
  $$("[data-add]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-add"), label = btn.getAttribute("data-label") || id;
      var items = readBasket();
      if (items.some(function (i) { return i.id === id; })) items = items.filter(function (i) { return i.id !== id; });
      else items.push({ id: id, label: label });
      setBasket(items);
      var live = $("[data-basket-live]");
      if (live) live.textContent = items.some(function (i) { return i.id === id; }) ? label + " added to your enquiry list." : label + " removed from your enquiry list.";
    });
  });
  var clearBtn = $("[data-basket-clear]");
  if (clearBtn) clearBtn.addEventListener("click", function () { setBasket([]); });
  setBasket(readBasket());

  /* ---------- 4. enquiry form ---------- */
  var form = $("[data-enquiry]");
  if (form) {
    var status = $("[data-form-status]");
    var submitBtn = $("button[type=submit]", form);
    var configured = null; // null = unknown, true = API delivers email, false = fall back to mail app
    var endpoint = form.getAttribute("action") || "/api/enquiry";
    var TO = form.getAttribute("data-to") || "info@shalvitechnologies.com";
    var WA = form.getAttribute("data-wa") || "916307057085";

    // Ask the API whether email delivery is configured (silent; assume not if unreachable).
    if (window.fetch) {
      fetch(endpoint, { method: "GET", headers: { "Accept": "application/json" } })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) { configured = !!(j && j.configured); })
        .catch(function () { configured = false; });
    } else { configured = false; }

    var showStatus = function (kind, html) {
      if (!status) return;
      status.className = "form-status is-visible form-status--" + kind;
      status.innerHTML = html;
      status.focus();
    };
    var fieldOf = function (name) { return form.querySelector("[name=" + name + "]"); };
    var setError = function (input, msg) {
      var field = input.closest(".field"); if (!field) return;
      var err = field.querySelector(".error");
      field.classList.toggle("is-invalid", !!msg);
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      if (err) err.textContent = msg || "";
    };
    var validate = function () {
      var ok = true, first = null;
      $$("[required]", form).forEach(function (input) {
        var v = input.value.trim(), msg = "";
        if (!v) msg = "This field is required.";
        else if (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = "Enter a valid email address, e.g. name@organisation.in";
        else if (input.name === "phone" && v && !/^[+\d][\d\s\-()]{6,}$/.test(v)) msg = "Enter a valid phone number.";
        setError(input, msg);
        if (msg) { ok = false; if (!first) first = input; }
      });
      var phone = fieldOf("phone");
      if (phone && phone.value.trim() && !/^[+\d][\d\s\-()]{6,}$/.test(phone.value.trim())) { setError(phone, "Enter a valid phone number."); ok = false; if (!first) first = phone; }
      if (first) first.focus();
      return ok;
    };
    var payload = function () {
      var d = {};
      $$("input, select, textarea", form).forEach(function (el) { if (el.name) d[el.name] = el.value; });
      return d;
    };
    var messageText = function (d) {
      return "Name: " + d.name + "\nOrganisation: " + (d.org || "-") + "\nEmail: " + d.email + "\nPhone: " + (d.phone || "-") +
        "\nInterest: " + (d.interest || "-") + (d.items ? "\n\nRequirement list:\n" + d.items : "") + "\n\nMessage:\n" + d.message;
    };
    var fallback = function (d, note) {
      var subject = "Enquiry — " + (d.interest || "General") + " — " + d.name;
      var mailto = "mailto:" + TO + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(messageText(d));
      var wa = "https://wa.me/" + WA + "?text=" + encodeURIComponent("Hello Shalvi Technologies,\n" + messageText(d));
      showStatus("warn",
        "<h3>Send it the way that suits you</h3><p>" + note + " Your details are still in the form below — nothing has been lost.</p>" +
        '<div class="btn-row"><a class="btn btn--primary" href="' + mailto + '">Open in my email app</a>' +
        '<a class="btn btn--wa" href="' + wa + '" target="_blank" rel="noopener">Send on WhatsApp</a>' +
        '<a class="btn btn--outline" href="tel:+91' + WA.slice(2) + '">Call +91 ' + WA.slice(2, 7) + " " + WA.slice(7) + "</a></div>");
    };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) return;
      var d = payload();
      if (configured === false) { fallback(d, "Online delivery is not switched on yet, so use one of these instead."); return; }
      submitBtn.disabled = true; submitBtn.setAttribute("aria-busy", "true");
      var oldText = submitBtn.textContent; submitBtn.textContent = "Sending…";
      fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(d) })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, status: r.status, body: j }; }); })
        .then(function (res) {
          if (res.ok && res.body && res.body.ok) {
            form.hidden = true;
            showStatus("ok", "<h3>Thank you — your enquiry is with us.</h3><p>Reference <strong class=\"mono\">" + (res.body.ref || "") + "</strong>. We reply on working days, usually within one business day. For anything urgent call <a href=\"tel:+916307057085\">+91 63070 57085</a>.</p>" +
              '<div class="btn-row"><button type="button" class="btn btn--outline" data-again>Send another enquiry</button></div>');
            var again = $("[data-again]"); if (again) again.addEventListener("click", function () { form.hidden = false; form.reset(); status.className = "form-status"; setBasket([]); });
            setBasket([]);
          } else if (res.status === 400 && res.body && res.body.errors) {
            Object.keys(res.body.errors).forEach(function (k) { var inp = fieldOf(k); if (inp) setError(inp, res.body.errors[k]); });
            showStatus("err", "<p>Please check the highlighted fields and try again.</p>");
          } else {
            fallback(d, res.status === 503 ? "Online delivery is not switched on yet, so use one of these instead." : "The online form could not send just now, so use one of these instead.");
          }
        })
        .catch(function () { fallback(d, "We could not reach the server (check your connection), so use one of these instead."); })
        .then(function () { submitBtn.disabled = false; submitBtn.removeAttribute("aria-busy"); submitBtn.textContent = oldText; });
    });
    $$("[required]", form).forEach(function (input) { input.addEventListener("input", function () { if (input.getAttribute("aria-invalid") === "true") setError(input, ""); }); });
  }

  /* ---------- 5. helpers ---------- */
  $$("[data-year]").forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
  $$('a[target="_blank"]').forEach(function (a) { if (!/noopener/.test(a.rel)) a.rel = (a.rel ? a.rel + " " : "") + "noopener"; });
})();
