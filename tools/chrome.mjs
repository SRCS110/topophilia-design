// Stamps the shared header and footer (from src/site.config.mjs) into every page,
// between <!--chrome:header--> / <!--/chrome:header--> and <!--chrome:footer--> / <!--/chrome:footer-->.
// Only those marked regions change, so CMS edits inside <main> are never touched.
// Also regenerates sitemap.xml from the page list. Usage: node tools/chrome.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { site } from "../src/site.config.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const icon = {
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/></svg>'
};

function header(path) {
  const link = (l) => `<a href="${l.href}"${l.href === path ? ' aria-current="page"' : ""}>${esc(l.label)}</a>`;
  const left = site.navLeft.map(link).join("");
  const right = site.navRight.map(link).join("") + `<a class="nav__cta" href="${site.cta.href}"${site.cta.href === path ? ' aria-current="page"' : ""}>${esc(site.cta.label)}</a>`;
  return `<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="site-header__bar">
    <a class="brand" href="/">
      <img src="/assets/img/mark-120.webp" alt="" width="83" height="120">
      <span class="wordmark"><span class="wordmark__name">Topophilia</span> <span class="wordmark__sub">Design</span></span>
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav"><span class="sr-only">Menu</span>${icon.menu}</button>
    <nav class="nav" id="primary-nav" aria-label="Primary"><div class="nav__group nav__group--left">${left}</div><div class="nav__group nav__group--right">${right}</div></nav>
  </div>
</header>`;
}

function footer() {
  const cols = site.footer.columns
    .map((c) => `<div class="footer__col"><h2>${esc(c.title)}</h2><ul>${c.links.map((l) => `<li><a href="${l.href}">${esc(l.label)}</a></li>`).join("")}</ul></div>`)
    .join("");
  const legal = site.footer.legal.map((l) => `<li><a href="${l.href}">${esc(l.label)}</a></li>`).join("");
  return `<footer class="site-footer">
  <div class="footer__grid">
    <div class="footer__brand">
      <span class="wordmark"><span class="wordmark__name">Topophilia</span><span class="wordmark__sub">Design</span></span>
      <p>${esc(site.serviceArea)}</p>
    </div>
    ${cols}
  </div>
  <div class="footer__legal">
    <p>&copy; ${new Date().getFullYear()} ${esc(site.name)}</p>
    <ul>${legal}<li><button type="button" data-consent-open>Cookie settings</button></li></ul>
  </div>
</footer>`;
}

const swap = (html, name, content) => {
  const re = new RegExp(`<!--chrome:${name}-->[\\s\\S]*?<!--/chrome:${name}-->`);
  if (!re.test(html)) throw new Error(`missing chrome:${name} markers`);
  return html.replace(re, `<!--chrome:${name}-->\n${content}\n<!--/chrome:${name}-->`);
};

const all = [...site.pages, ...site.extraPages.map((f) => [null, f])];
for (const [path, file] of all) {
  const p = join(root, file);
  let html = readFileSync(p, "utf8");
  html = swap(html, "header", header(path));
  html = swap(html, "footer", footer());
  writeFileSync(p, html);
  console.log("stamped", file);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${site.pages.map(([path]) => `  <url><loc>${site.domain}${path === "/" ? "/" : path}</loc></url>`).join("\n")}
</urlset>
`;
writeFileSync(join(root, "sitemap.xml"), sitemap);
console.log("wrote sitemap.xml");
