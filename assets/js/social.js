(function () {
  if (document.getElementById("st-social")) return;

  const fb =
    '<svg class="social-float__icon" viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="st-fb" x1="24" y1="4" x2="24" y2="44" gradientUnits="userSpaceOnUse"><stop stop-color="#5B9FEF"/><stop offset="1" stop-color="#1877F2"/></linearGradient><linearGradient id="st-fb-shine" x1="24" y1="6" x2="24" y2="28" gradientUnits="userSpaceOnUse"><stop stop-color="#fff" stop-opacity="0.45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><rect width="48" height="48" rx="11" fill="url(#st-fb)"/><ellipse cx="24" cy="14" rx="16" ry="10" fill="url(#st-fb-shine)"/><path fill="#fff" d="M27.2 25h3.1l.6-3.6h-3.7v-2.3c0-1 .3-1.7 1.7-1.7H31V14.8c-.7-.1-1.8-.2-3.1-.2-3.1 0-5.2 1.9-5.2 5.3v2.5H19v3.6h2.7V34h3.5V25z"/></svg>';
  const mail =
    '<svg class="social-float__icon" viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="st-mail" x1="24" y1="4" x2="24" y2="44" gradientUnits="userSpaceOnUse"><stop stop-color="#EA4335"/><stop offset="1" stop-color="#C5221F"/></linearGradient><linearGradient id="st-mail-shine" x1="24" y1="6" x2="24" y2="26" gradientUnits="userSpaceOnUse"><stop stop-color="#fff" stop-opacity="0.4"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><rect width="48" height="48" rx="11" fill="url(#st-mail)"/><ellipse cx="24" cy="14" rx="16" ry="10" fill="url(#st-mail-shine)"/><path fill="none" stroke="#fff" stroke-width="2.2" d="M12.5 18.5h23v13h-23z"/><path fill="none" stroke="#fff" stroke-width="2.2" d="M12.5 18.5L24 27l11.5-8.5"/></svg>';

  const root = document.createElement("aside");
  root.id = "st-social";
  root.className = "social-float";
  root.setAttribute("aria-label", "Follow Shalvi Technologies");
  root.innerHTML =
    '<nav class="social-float__panel" aria-label="Social media">' +
      '<ul class="social-float__list">' +
        '<li class="social-float__item">' +
          '<a class="social-float__link" href="https://www.facebook.com/shalvitechnologies.in" target="_blank" rel="noopener noreferrer" aria-label="Facebook">' +
            '<span class="social-float__badge">' + fb + "</span></a></li>" +
        '<li class="social-float__item">' +
          '<a class="social-float__link" href="mailto:info@shalvitechnologies.com" aria-label="Email">' +
            '<span class="social-float__badge">' + mail + "</span></a></li>" +
      "</ul></nav>";
  document.body.appendChild(root);

  const panel = root.querySelector(".social-float__panel");
  const dock = document.querySelector("[data-social-dock]");
  if (!panel || !dock || !("IntersectionObserver" in window)) return;

  const io = new IntersectionObserver(function (entries) {
    const on = Boolean(entries[0] && entries[0].isIntersecting);
    document.body.classList.toggle("social-docked", on);
    root.classList.toggle("is-hidden", on);
    if (on) {
      if (panel.parentElement !== dock) dock.appendChild(panel);
    } else if (panel.parentElement !== root) {
      root.appendChild(panel);
    }
  }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });
  io.observe(dock.closest(".site-footer") || dock);
})();
