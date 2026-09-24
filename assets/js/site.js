(function () {
  const base = document.documentElement.dataset.base || "./";
  const page = document.body.dataset.page || "";
  if (page === "home") document.body.classList.add("is-home");

  const header = document.querySelector("[data-header]");
  const footer = document.querySelector("[data-footer]");

  const icon = function (d) {
    return `<i aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="${d}"/></svg></i>`;
  };

  if (header) {
    header.innerHTML = `
      <div class="topbar"><div class="wrap topbar-in">
        <span><span class="gem">GeM</span> listed · Lucknow</span>
        <span>
          <a href="tel:+916307057085">+91 63070 57085</a> ·
          <a href="tel:+919794980001">+91 97949 80001</a> ·
          <a href="mailto:info@shalvitechnologies.com">info@shalvitechnologies.com</a>
        </span>
      </div></div>
      <div class="wrap nav">
        <a class="brand" href="${base}index.html">
          <img src="${base}assets/img/logo.png" alt="Shalvi Technologies emblem" width="72" height="72">
          <span><strong>Shalvi Technologies</strong><small>Expertise · Experience · Excellence</small></span>
        </a>
        <nav class="links" id="nav">
          <a href="${base}index.html" data-nav="home">Home</a>
          <a href="${base}about.html" data-nav="about">Company</a>
          <a href="${base}products.html" data-nav="products">Portfolio</a>
          <a href="${base}solutions.html" data-nav="solutions">Solutions</a>
          <a href="${base}web.html" data-nav="web">Web</a>
          <a href="${base}alliances.html" data-nav="alliances">Alliances</a>
          <a class="go" href="${base}contact.html" data-nav="contact">Enquire</a>
        </nav>
        <button class="burger" type="button" aria-controls="nav">Menu</button>
      </div>
    `;
    const on = header.querySelector(`[data-nav="${page}"]`);
    if (on) { on.classList.add("on"); on.setAttribute("aria-current", "page"); }
    const burger = header.querySelector(".burger");
    const nav = header.querySelector("#nav");
    burger.addEventListener("click", function () {
      const open = nav.classList.toggle("open");
      burger.textContent = open ? "Close" : "Menu";
    });
    if (page === "home") {
      const pin = function () { header.classList.toggle("solid", window.scrollY > 36); };
      pin();
      window.addEventListener("scroll", pin, { passive: true });
    }
  }

  if (footer) {
    footer.innerHTML = `
      <div class="wrap">
        <div class="foot">
          <div>
            <div class="foot-brand">
              <img src="${base}assets/img/logo.png" alt="Shalvi Technologies emblem" width="320" height="320">
              <div>
            <h2>Shalvi Technologies</h2>
            <p>Specify. Supply. Support. IT, security, audio-visual, websites, civic programmes, cyber security software, forensic systems and drones from Lucknow.</p>
            <p>Plot No. 67–68, Aranya Estate, C.G. City, Ahmamau, Sultanpur Road, Near Law College, Lucknow 226002</p>
              </div>
            </div>
          </div>
          <div>
            <h2>Site</h2>
            <ul>
              <li><a href="${base}about.html">Company</a></li>
              <li><a href="${base}products.html">Portfolio</a></li>
              <li><a href="${base}solutions.html">Solutions</a></li>
              <li><a href="${base}web.html">Web development &amp; hosting</a></li>
              <li><a href="${base}alliances.html">Alliances</a></li>
            </ul>
          </div>
          <div>
            <h2>Reach</h2>
            <ul>
              <li><a href="tel:+916307057085">+91 63070 57085</a></li>
              <li><a href="tel:+919794980001">+91 97949 80001</a></li>
              <li><a href="https://wa.me/916307057085">WhatsApp</a></li>
              <li><a href="mailto:info@shalvitechnologies.com">info@shalvitechnologies.com</a></li>
              <li><a href="https://www.facebook.com/shalvitechnologies.in" rel="noopener noreferrer">Facebook</a></li>
              <li><a href="${base}privacy.html">Privacy</a></li>
            </ul>
          </div>
        </div>
        <div class="social-dock" data-social-dock></div>
        <div class="legal">
          <span>© <span data-year></span> Shalvi Technologies</span>
          <span>www.shalvitechnologies.in</span>
        </div>
      </div>
    `;
    footer.querySelector("[data-year]").textContent = String(new Date().getFullYear());
  }

  document.querySelectorAll("[data-icon]").forEach(function (el) {
    el.outerHTML = icon(el.getAttribute("data-icon"));
  });

  const form = document.querySelector("[data-enquiry]");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      let ok = true;
      form.querySelectorAll("[required]").forEach(function (field) {
        const err = field.parentElement.querySelector(".err");
        const empty = !field.value.trim();
        if (err) err.textContent = empty ? "Required" : "";
        if (empty) ok = false;
      });
      if (!ok) return;
      const d = new FormData(form);
      const body = `Name: ${d.get("name")}\nEmail: ${d.get("email")}\nOrganisation: ${d.get("org") || "-"}\nInterest: ${d.get("interest")}\n\n${d.get("message")}`;
      window.location.href = `mailto:info@shalvitechnologies.com?subject=${encodeURIComponent("Enquiry — Shalvi Technologies")}&body=${encodeURIComponent(body)}`;
      form.classList.add("sent");
    });
  }

  const filter = document.querySelector("[data-filter]");
  if (filter) {
    filter.addEventListener("click", function (event) {
      const btn = event.target.closest("button");
      if (!btn) return;
      filter.querySelectorAll("button").forEach(function (b) { b.classList.remove("on"); });
      btn.classList.add("on");
      const key = btn.dataset.key;
      document.querySelectorAll("[data-row]").forEach(function (row) {
        row.hidden = key !== "all" && row.dataset.row !== key;
      });
    });
  }

  const social = document.createElement("script");
  social.src = base + "assets/js/social.js?v=11";
  document.body.appendChild(social);
  const desk = document.createElement("script");
  desk.src = base + "assets/js/desk.js?v=11";
  document.body.appendChild(desk);
})();
