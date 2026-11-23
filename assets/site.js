(() => {
  "use strict";
  const doc = document.documentElement;
  doc.classList.add("js");

  /* Header border once scrolled */
  const header = document.querySelector(".site-header");
  const onScroll = () => header && header.setAttribute("data-scrolled", window.scrollY > 8 ? "true" : "false");
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile nav: aria-expanded, Escape, scroll lock, focus trap */
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("primary-nav");
  if (toggle && nav) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      nav.setAttribute("data-open", String(open));
      document.body.setAttribute("data-nav-open", String(open));
      if (open) { const f = nav.querySelector("a"); f && f.focus(); } else { toggle.focus(); }
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    document.addEventListener("keydown", (e) => {
      if (toggle.getAttribute("aria-expanded") !== "true") return;
      if (e.key === "Escape") { setOpen(false); return; }
      if (e.key === "Tab") {
        const items = [toggle, ...nav.querySelectorAll("a")];
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    window.matchMedia("(min-width: 1001px)").addEventListener("change", (m) => m.matches && toggle.getAttribute("aria-expanded") === "true" && setOpen(false));
  }

  /* Reveal once */
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.dataset.in = "true"; io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll("[data-reveal]").forEach((el) => (el.dataset.in = "true"));
  }


  /* Cookie consent (versioned, GPC aware). Analytics loads only after opt-in. */
  const CONSENT_KEY = "tpd-consent";
  const CONSENT_VERSION = 1;
  const GTM_ID = "GTM-5SMKMWKN"; // Google Tag Manager container; loads only after analytics consent.
  const gpc = navigator.globalPrivacyControl === true;
  const read = () => { try { const v = JSON.parse(localStorage.getItem(CONSENT_KEY)); return v && v.version === CONSENT_VERSION ? v : null; } catch { return null; } };
  const save = (analytics) => { const v = { version: CONSENT_VERSION, analytics: !!analytics && !gpc, ts: new Date().toISOString() }; try { localStorage.setItem(CONSENT_KEY, JSON.stringify(v)); } catch {} return v; };
  const loadAnalytics = () => {
    if (!GTM_ID || window.__gtmLoaded) return;
    window.__gtmLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("consent", "default", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    window.gtag("js", new Date());
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    const s = document.createElement("script");
    s.async = true; s.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(GTM_ID);
    document.head.appendChild(s);
  };
  const banner = document.getElementById("consent");
  let lastFocus = null;
  const showBanner = () => {
    if (!banner) return;
    lastFocus = document.activeElement;
    banner.hidden = false;
    const box = banner.querySelector("#consent-analytics");
    const cur = read();
    if (box) { box.checked = !!(cur && cur.analytics); box.disabled = gpc; }
    banner.querySelector("h2").focus();
  };
  const hideBanner = () => { if (banner) { banner.hidden = true; lastFocus && lastFocus.focus && lastFocus.focus(); } };
  if (banner) {
    banner.addEventListener("click", (e) => {
      const act = e.target.closest("[data-consent]");
      if (!act) return;
      const a = act.getAttribute("data-consent");
      if (a === "accept") { save(true); loadAnalytics(); hideBanner(); }
      else if (a === "reject") { save(false); hideBanner(); }
      else if (a === "prefs") { const p = banner.querySelector(".consent__prefs"); p.hidden = !p.hidden; act.setAttribute("aria-expanded", String(!p.hidden)); }
      else if (a === "save") { const v = save(banner.querySelector("#consent-analytics").checked); if (v.analytics) loadAnalytics(); hideBanner(); }
    });
    banner.addEventListener("keydown", (e) => {
      if (e.key !== "Tab") return;
      const f = [...banner.querySelectorAll("button, input:not([disabled]), a[href]")].filter((el) => el.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
    document.querySelectorAll("[data-consent-open]").forEach((b) => b.addEventListener("click", showBanner));
    const cur = read();
    if (cur) { if (cur.analytics && !gpc) loadAnalytics(); }
    else if (gpc) { save(false); }
    else if (GTM_ID) { showBanner(); }
  }

  /* Client intake form */
  const form = document.getElementById("intake-form");
  if (form) {
    const status = form.querySelector(".form-status");
    const summary = form.querySelector(".error-summary");
    if (/[?&]error=1/.test(location.search)) { status.dataset.kind = "error"; status.textContent = "Your details could not be sent. Please check the required fields and try again."; }
    const started = form.querySelector('input[name="started"]');
    if (started) started.value = String(Date.now());
    const labelFor = (el) => {
      const l = form.querySelector(`label[for="${el.id}"]`) || el.closest("fieldset")?.querySelector("legend");
      return l ? l.textContent.replace("*", "").trim() : el.name;
    };
    const clearErrors = () => {
      form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
      form.querySelectorAll(".error").forEach((el) => el.remove());
      summary.hidden = true; summary.innerHTML = "";
    };
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors();
      const bad = [];
      form.querySelectorAll("input, select, textarea").forEach((el) => {
        if (el.closest(".hp") || el.type === "hidden") return;
        if (!el.checkValidity()) bad.push(el);
      });
      const svc = form.querySelectorAll('input[name="services"]:checked');
      const svcGroup = form.querySelector("#services-group");
      if (!svc.length && svcGroup) bad.push(svcGroup);
      if (bad.length) {
        const items = bad.map((el) => {
          const id = el.id || "services-group";
          const msg = el.id === "services-group" ? "Choose at least one service." : (el.validity.typeMismatch ? "Enter a valid email address." : "This field is required.");
          if (el.id !== "services-group") el.setAttribute("aria-invalid", "true");
          const err = document.createElement("p"); err.className = "error"; err.id = id + "-error"; err.textContent = msg;
          (el.id === "services-group" ? el : el.parentElement).appendChild(err);
          if (el.id !== "services-group") el.setAttribute("aria-describedby", err.id);
          return `<li><a href="#${id}">${labelFor(el)}: ${msg}</a></li>`;
        });
        summary.innerHTML = `<h2 tabindex="-1" style="font-size:1.2rem;margin:0">Please check ${bad.length === 1 ? "1 field" : bad.length + " fields"}</h2><ul>${items.join("")}</ul>`;
        summary.hidden = false;
        summary.querySelector("h2").focus();
        return;
      }
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true; status.dataset.kind = ""; status.textContent = "Sending...";
      try {
        const res = await fetch(form.action, { method: "POST", headers: { Accept: "application/json" }, body: new FormData(form) });
        const out = await res.json().catch(() => ({}));
        if (!res.ok || !out.ok) throw new Error(out.error || "Something went wrong.");
        window.location.assign("/thank-you");
      } catch (err) {
        status.dataset.kind = "error";
        status.textContent = err.message + " Please try again.";
        btn.disabled = false;
      }
    });
  }
})();
