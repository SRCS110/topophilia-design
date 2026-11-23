// Single source of truth for the site chrome (nav, footer, legal links).
// Edit here, then run `node tools/chrome.mjs` to stamp every page.
export const site = {
  name: "Topophilia Design",
  domain: "https://www.topophiliadesign.com",
  serviceArea: "Interior and wardrobe design in Sonoma County and the greater Bay Area.",
  nav: [
    { label: "The Collector", href: "/the-collector" },
    { label: "The Tailor", href: "/the-tailor" },
    { label: "The Builder", href: "/the-builder" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "About", href: "/about" }
  ],
  cta: { label: "Start a project", href: "/contact" },
  footer: {
    columns: [
      {
        title: "Services",
        links: [
          { label: "The Collector: sourcing", href: "/the-collector" },
          { label: "The Tailor: fit and function", href: "/the-tailor" },
          { label: "The Builder: the plan", href: "/the-builder" }
        ]
      },
      {
        title: "Studio",
        links: [
          { label: "Portfolio", href: "/portfolio" },
          { label: "About", href: "/about" },
          { label: "Client intake", href: "/contact" }
        ]
      }
    ],
    // Mandatory legal links. Do not remove.
    legal: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Accessibility", href: "/accessibility" }
    ]
  },
  // Pages included in sitemap.xml (path, file)
  pages: [
    ["/", "index.html"],
    ["/the-collector", "the-collector.html"],
    ["/the-tailor", "the-tailor.html"],
    ["/the-builder", "the-builder.html"],
    ["/portfolio", "portfolio.html"],
    ["/about", "about.html"],
    ["/contact", "contact.html"],
    ["/privacy", "privacy.html"],
    ["/terms", "terms.html"],
    ["/accessibility", "accessibility.html"]
  ],
  // Pages stamped with chrome but kept out of the sitemap
  extraPages: ["thank-you.html", "404.html"]
};
